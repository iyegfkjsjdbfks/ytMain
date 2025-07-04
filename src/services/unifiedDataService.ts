import type { Video as LocalVideo } from '../types/core';
import { youtubeService } from './api/youtubeService';
import { 
  metadataNormalizationService, 
  type UnifiedVideoMetadata, 
  type UnifiedChannelMetadata 
} from './metadataNormalizationService';
import * as mockVideoService from '../../services/mockVideoService';
import { getYouTubeVideoId } from '../lib/youtube-utils';

/**
 * Configuration for unified data fetching
 */
interface UnifiedDataConfig {
  sources: {
    local: boolean;
    youtube: boolean;
  };
  limits: {
    local?: number;
    youtube?: number;
    total?: number;
  };
  caching: {
    enabled: boolean;
    ttl: number;
  };
  mixing: {
    strategy: 'round-robin' | 'source-priority' | 'relevance';
    sourcePriority?: ('local' | 'youtube')[];
  };
}

const defaultConfig: UnifiedDataConfig = {
  sources: {
    local: true,
    youtube: true,
  },
  limits: {
    local: 25,
    youtube: 25,
    total: 50,
  },
  caching: {
    enabled: true,
    ttl: 10 * 60 * 1000, // 10 minutes
  },
  mixing: {
    strategy: 'round-robin',
    sourcePriority: ['local', 'youtube'],
  },
};

/**
 * Search filters for unified queries
 */
export interface UnifiedSearchFilters {
  query?: string;
  category?: string;
  duration?: 'short' | 'medium' | 'long';
  uploadDate?: 'hour' | 'today' | 'week' | 'month' | 'year';
  sortBy?: 'relevance' | 'date' | 'views' | 'rating';
  type?: 'video' | 'short' | 'live';
  sources?: ('local' | 'youtube')[];
}

/**
 * Response structure for unified data queries
 */
export interface UnifiedDataResponse<T> {
  data: T[];
  sources: {
    local: {
      count: number;
      hasMore: boolean;
    };
    youtube: {
      count: number;
      hasMore: boolean;
      nextPageToken?: string;
    };
  };
  totalCount: number;
  hasMore: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

/**
 * Service for fetching and normalizing data from multiple sources
 */
class UnifiedDataService {
  private config: UnifiedDataConfig;
  private cache = new Map<string, { data: any; timestamp: number }>();

  constructor(config: Partial<UnifiedDataConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Fetch trending videos from all enabled sources
   */
  async getTrendingVideos(
    limit: number = 50,
    filters: UnifiedSearchFilters = {}
  ): Promise<UnifiedDataResponse<UnifiedVideoMetadata>> {
    const cacheKey = `trending:${JSON.stringify({ limit, filters })}`;
    const cached = this.getCachedData<UnifiedDataResponse<UnifiedVideoMetadata>>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const sources = filters.sources || Object.keys(this.config.sources).filter(
      key => this.config.sources[key as keyof typeof this.config.sources]
    ) as ('local' | 'youtube')[];

    const results = await Promise.allSettled([
      ...(sources.includes('local') ? [this.fetchLocalTrendingVideos(filters)] : []),
      ...(sources.includes('youtube') ? [this.fetchYouTubeTrendingVideos(filters)] : []),
    ]);

    const localResult = sources.includes('local') ? results[0] : null;
    const youtubeResult = sources.includes('youtube') ? results[sources.includes('local') ? 1 : 0] : null;

    const localVideos = localResult?.status === 'fulfilled' ? localResult.value : [];
    const youtubeVideos = youtubeResult?.status === 'fulfilled' ? youtubeResult.value : [];

    // Mix videos according to strategy
    const mixedVideos = this.mixVideoResults(localVideos, youtubeVideos, limit);

    const response: UnifiedDataResponse<UnifiedVideoMetadata> = {
      data: mixedVideos.slice(0, limit),
      sources: {
        local: {
          count: localVideos.length,
          hasMore: localVideos.length >= (this.config.limits.local || 25),
        },
        youtube: {
          count: youtubeVideos.length,
          hasMore: youtubeVideos.length >= (this.config.limits.youtube || 25),
        },
      },
      totalCount: mixedVideos.length,
      hasMore: mixedVideos.length > limit,
    };

    this.setCachedData(cacheKey, response);
    return response;
  }

  /**
   * Search videos across all enabled sources
   */
  async searchVideos(
    query: string,
    filters: UnifiedSearchFilters = {},
    limit: number = 50
  ): Promise<UnifiedDataResponse<UnifiedVideoMetadata>> {
    if (!query.trim()) {
      return this.getTrendingVideos(limit, filters);
    }

    const cacheKey = `search:${query}:${JSON.stringify({ filters, limit })}`;
    const cached = this.getCachedData<UnifiedDataResponse<UnifiedVideoMetadata>>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const sources = filters.sources || Object.keys(this.config.sources).filter(
      key => this.config.sources[key as keyof typeof this.config.sources]
    ) as ('local' | 'youtube')[];

    const results = await Promise.allSettled([
      ...(sources.includes('local') ? [this.searchLocalVideos(query, filters)] : []),
      ...(sources.includes('youtube') ? [this.searchYouTubeVideos(query, filters)] : []),
    ]);

    const localResult = sources.includes('local') ? results[0] : null;
    const youtubeResult = sources.includes('youtube') ? results[sources.includes('local') ? 1 : 0] : null;

    const localVideos = localResult?.status === 'fulfilled' ? localResult.value : [];
    const youtubeVideos = youtubeResult?.status === 'fulfilled' ? youtubeResult.value : [];

    // Mix and rank results by relevance
    const mixedVideos = this.mixVideoResults(localVideos, youtubeVideos, limit);

    const response: UnifiedDataResponse<UnifiedVideoMetadata> = {
      data: mixedVideos.slice(0, limit),
      sources: {
        local: {
          count: localVideos.length,
          hasMore: false, // Local search typically returns all matches
        },
        youtube: {
          count: youtubeVideos.length,
          hasMore: youtubeVideos.length >= (this.config.limits.youtube || 25),
        },
      },
      totalCount: mixedVideos.length,
      hasMore: mixedVideos.length > limit,
    };

    this.setCachedData(cacheKey, response);
    return response;
  }

  /**
   * Check if ID is a YouTube video format and extract actual YouTube ID
   */
  private extractYouTubeId(id: string): string | null {
    // Handle youtube-prefixed IDs (e.g., youtube-YQHsXMglC9A)
    if (id.startsWith('youtube-')) {
      return id.substring(8); // Remove 'youtube-' prefix
    }
    
    // Handle URLs that might be passed as IDs
    const youtubeId = getYouTubeVideoId(id);
    if (youtubeId) {
      return youtubeId;
    }
    
    // Check if it's already a valid YouTube video ID (11 characters)
    if (id.length === 11 && /^[a-zA-Z0-9_-]+$/.test(id)) {
      return id;
    }
    
    return null;
  }

  /**
   * Get video by ID from any source
   */
  async getVideoById(id: string): Promise<UnifiedVideoMetadata | null> {
    const cacheKey = `video:${id}`;
    const cached = this.getCachedData<UnifiedVideoMetadata>(cacheKey);
    
    if (cached) {
      return cached;
    }

    console.log(`UnifiedDataService: Getting video by ID: ${id}`);

    // Check if this is a YouTube video ID
    const youtubeId = this.extractYouTubeId(id);
    
    if (youtubeId) {
      // This is a YouTube video, try YouTube first
      console.log(`Detected YouTube video ID: ${youtubeId}`);
      if (this.config.sources.youtube) {
        try {
          console.log(`Fetching YouTube video with ID: ${youtubeId}`);
          const youtubeVideos = await youtubeService.fetchVideos([youtubeId]);
          if (youtubeVideos.length > 0) {
            console.log(`Successfully fetched YouTube video:`, youtubeVideos[0]);
            // Convert already processed YouTube video to unified format
            const processedVideo = youtubeVideos[0];
            if (!processedVideo) {
              return null;
            }
            const normalized: UnifiedVideoMetadata = {
              id: processedVideo.id,
              title: processedVideo.title,
              description: processedVideo.description,
              thumbnailUrl: processedVideo.thumbnailUrl,
              videoUrl: processedVideo.videoUrl,
              views: processedVideo.viewCount || 0,
              viewsFormatted: this.formatViews(processedVideo.viewCount || 0),
              likes: processedVideo.likeCount || 0,
              dislikes: processedVideo.dislikeCount || 0,
              commentCount: processedVideo.commentCount || 0,
              channel: {
                id: processedVideo.channelId,
                name: processedVideo.channelName,
                avatarUrl: processedVideo.channelAvatarUrl || processedVideo.channel?.avatarUrl || '',
                subscribers: 0, // Will be fetched separately if needed
                subscribersFormatted: '0 subscribers',
                isVerified: processedVideo.channel?.isVerified || false,
              },
              duration: processedVideo.duration,
              publishedAt: processedVideo.publishedAt || new Date().toISOString(),
              publishedAtFormatted: this.formatTimeAgo(processedVideo.publishedAt || new Date().toISOString()),
              category: processedVideo.category,
              tags: processedVideo.tags,
              isLive: processedVideo.isLive || false,
              isShort: processedVideo.isShort || false,
              visibility: processedVideo.visibility,
              source: 'youtube',
              metadata: {
                quality: 'hd',
                definition: 'hd',
                captions: false,
                language: 'en',
                license: 'youtube',
              },
            };
            this.setCachedData(cacheKey, normalized);
            return normalized;
          }
        } catch (error) {
          console.warn('Failed to fetch YouTube video:', error);
        }
      }
    } else {
      // Try local first for non-YouTube IDs
      if (this.config.sources.local) {
        try {
          const localVideo = await mockVideoService.getVideoById(id);
          if (localVideo) {
            const normalized = metadataNormalizationService.normalizeLocalVideo(localVideo);
            this.setCachedData(cacheKey, normalized);
            return normalized;
          }
        } catch (error) {
          console.warn('Failed to fetch local video:', error);
        }
      }
      
      // Fallback to YouTube for local IDs
      if (this.config.sources.youtube) {
        try {
          const youtubeVideos = await youtubeService.fetchVideos([id]);
          if (youtubeVideos.length > 0) {
            // Convert already processed YouTube video to unified format
            const processedVideo = youtubeVideos[0];
            if (!processedVideo) {
              return null;
            }
            const normalized: UnifiedVideoMetadata = {
              id: processedVideo.id,
              title: processedVideo.title,
              description: processedVideo.description,
              thumbnailUrl: processedVideo.thumbnailUrl,
              videoUrl: processedVideo.videoUrl,
              views: processedVideo.viewCount || 0,
              viewsFormatted: this.formatViews(processedVideo.viewCount || 0),
              likes: processedVideo.likeCount || 0,
              dislikes: processedVideo.dislikeCount || 0,
              commentCount: processedVideo.commentCount || 0,
              channel: {
                id: processedVideo.channelId,
                name: processedVideo.channelName,
                avatarUrl: processedVideo.channelAvatarUrl || '',
                subscribers: 0,
                subscribersFormatted: '0 subscribers',
                isVerified: processedVideo.channel?.isVerified || false,
              },
              duration: processedVideo.duration,
              publishedAt: processedVideo.publishedAt || new Date().toISOString(),
              publishedAtFormatted: this.formatTimeAgo(processedVideo.publishedAt || new Date().toISOString()),
              category: processedVideo.category,
              tags: processedVideo.tags,
              isLive: processedVideo.isLive || false,
              isShort: processedVideo.isShort || false,
              visibility: processedVideo.visibility,
              source: 'youtube',
              metadata: {
                quality: 'hd',
                definition: 'hd',
                captions: false,
                language: 'en',
                license: 'youtube',
              },
            };
            this.setCachedData(cacheKey, normalized);
            return normalized;
          }
        } catch (error) {
          console.warn('Failed to fetch YouTube video as fallback:', error);
        }
      }
    }

    console.warn(`No video found for ID: ${id}`);
    return null;
  }

  /**
   * Get channel by ID from any source
   */
  async getChannelById(id: string): Promise<UnifiedChannelMetadata | null> {
    const cacheKey = `channel:${id}`;
    const cached = this.getCachedData<UnifiedChannelMetadata>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Try local first
    if (this.config.sources.local) {
      try {
        const localChannel = await mockVideoService.getChannelById(id);
        if (localChannel) {
          const normalized = metadataNormalizationService.normalizeLocalChannel(localChannel);
          this.setCachedData(cacheKey, normalized);
          return normalized;
        }
      } catch (error) {
        console.warn('Failed to fetch local channel:', error);
      }
    }

    // Try YouTube
    if (this.config.sources.youtube) {
      try {
        const youtubeChannel = await youtubeService.fetchChannel(id);
        if (youtubeChannel) {
          const normalized = metadataNormalizationService.normalizeYouTubeChannel(youtubeChannel);
          this.setCachedData(cacheKey, normalized);
          return normalized;
        }
      } catch (error) {
        console.warn('Failed to fetch YouTube channel:', error);
      }
    }

    return null;
  }

  /**
   * Get shorts videos from all sources
   */
  async getShortsVideos(limit: number = 30): Promise<UnifiedDataResponse<UnifiedVideoMetadata>> {
    const filters: UnifiedSearchFilters = { type: 'short' };
    return this.getTrendingVideos(limit, filters);
  }

  // Private methods for fetching from specific sources

  private async fetchLocalTrendingVideos(filters: UnifiedSearchFilters): Promise<UnifiedVideoMetadata[]> {
    try {
      let videos: LocalVideo[];
      
      if (filters.type === 'short') {
        videos = await mockVideoService.getShortsVideos();
      } else if (filters.category) {
        videos = await mockVideoService.getVideosByCategory(filters.category);
      } else {
        videos = await mockVideoService.getVideos();
      }

      return videos.map(video => 
        metadataNormalizationService.normalizeLocalVideo(video)
      );
    } catch (error) {
      console.error('Failed to fetch local trending videos:', error);
      return [];
    }
  }

  private async fetchYouTubeTrendingVideos(filters: UnifiedSearchFilters): Promise<UnifiedVideoMetadata[]> {
    try {
      // Note: This is a placeholder - YouTube API trending would need different implementation
      // For now, we'll use search with popular terms
      const trendingQueries = ['trending', 'popular', 'viral', 'latest'];
      const randomQuery = trendingQueries[Math.floor(Math.random() * trendingQueries.length)];
      
      if (randomQuery) {
        return this.searchYouTubeVideos(randomQuery, filters);
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch YouTube trending videos:', error);
      return [];
    }
  }

  private async searchLocalVideos(query: string, filters: UnifiedSearchFilters): Promise<UnifiedVideoMetadata[]> {
    try {
      const videos = await mockVideoService.searchVideos(query);
      let filteredVideos = videos;

      // Apply filters
      if (filters.type === 'short') {
        filteredVideos = filteredVideos.filter(v => v.isShort);
      } else if (filters.type === 'live') {
        filteredVideos = filteredVideos.filter(v => v.isLive);
      }

      if (filters.category) {
        filteredVideos = filteredVideos.filter(v => 
          v.category.toLowerCase() === filters.category?.toLowerCase()
        );
      }

      return filteredVideos.map(video => 
        metadataNormalizationService.normalizeLocalVideo(video)
      );
    } catch (error) {
      console.error('Failed to search local videos:', error);
      return [];
    }
  }

  private async searchYouTubeVideos(query: string, filters: UnifiedSearchFilters): Promise<UnifiedVideoMetadata[]> {
    try {
      // This would need YouTube Search API implementation
      // For now, returning empty array as placeholder
      console.log('YouTube search not implemented for query:', query, filters);
      return [];
    } catch (error) {
      console.error('Failed to search YouTube videos:', error);
      return [];
    }
  }

  // Video mixing strategies

  private mixVideoResults(
    localVideos: UnifiedVideoMetadata[], 
    youtubeVideos: UnifiedVideoMetadata[], 
    limit: number
  ): UnifiedVideoMetadata[] {
    switch (this.config.mixing.strategy) {
      case 'round-robin':
        return this.roundRobinMix(localVideos, youtubeVideos, limit);
      case 'source-priority':
        return this.sourcePriorityMix(localVideos, youtubeVideos, limit);
      case 'relevance':
        return this.relevanceMix(localVideos, youtubeVideos, limit);
      default:
        return this.roundRobinMix(localVideos, youtubeVideos, limit);
    }
  }

  private roundRobinMix(
    localVideos: UnifiedVideoMetadata[], 
    youtubeVideos: UnifiedVideoMetadata[], 
    limit: number
  ): UnifiedVideoMetadata[] {
    const mixed: UnifiedVideoMetadata[] = [];
    const maxLength = Math.max(localVideos.length, youtubeVideos.length);
    
    for (let i = 0; i < maxLength && mixed.length < limit; i++) {
      if (i < localVideos.length && localVideos[i]) {
        mixed.push(localVideos[i]!);
      }
      if (i < youtubeVideos.length && mixed.length < limit && youtubeVideos[i]) {
        mixed.push(youtubeVideos[i]!);
      }
    }
    
    return mixed;
  }

  private sourcePriorityMix(
    localVideos: UnifiedVideoMetadata[], 
    youtubeVideos: UnifiedVideoMetadata[], 
    limit: number
  ): UnifiedVideoMetadata[] {
    const priority = this.config.mixing.sourcePriority || ['local', 'youtube'];
    const mixed: UnifiedVideoMetadata[] = [];
    
    for (const source of priority) {
      const videos = source === 'local' ? localVideos : youtubeVideos;
      const remainingLimit = limit - mixed.length;
      mixed.push(...videos.slice(0, remainingLimit));
      
      if (mixed.length >= limit) break;
    }
    
    return mixed;
  }

  private relevanceMix(
    localVideos: UnifiedVideoMetadata[], 
    youtubeVideos: UnifiedVideoMetadata[], 
    limit: number
  ): UnifiedVideoMetadata[] {
    // Combine all videos and sort by relevance (views, likes, recency)
    const allVideos = [...localVideos, ...youtubeVideos];
    
    allVideos.sort((a, b) => {
      // Simple relevance scoring based on views and engagement
      const scoreA = a.views + (a.likes * 10) + (a.commentCount * 5);
      const scoreB = b.views + (b.likes * 10) + (b.commentCount * 5);
      return scoreB - scoreA;
    });
    
    return allVideos.slice(0, limit);
  }

  // Cache management

  private getCachedData<T>(key: string): T | null {
    if (!this.config.caching.enabled) return null;
    
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.config.caching.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  private setCachedData(key: string, data: any): void {
    if (!this.config.caching.enabled) return;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache for specific pattern or all
   */
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<UnifiedDataConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): UnifiedDataConfig {
    return { ...this.config };
  }

  // Utility methods

  private formatViews(count: number): string {
    if (count >= 1000000000) return `${(count / 1000000000).toFixed(1)}B views`;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
    return `${count} views`;
  }

  private formatTimeAgo(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }
}

// Export singleton instance
export const unifiedDataService = new UnifiedDataService();
export default unifiedDataService;

// Export types
export type { UnifiedDataConfig, UnifiedSearchFilters, UnifiedDataResponse };
