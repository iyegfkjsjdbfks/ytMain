import { api, ApiError } from './base';
import type { Video, Channel, ApiResponse } from '../../types/core';
import { CACHE_CONFIG } from '../../lib/constants';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// YouTube API response interfaces
interface YouTubeVideoResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        medium: { url: string };
        high?: { url: string };
      };
      publishedAt: string;
      channelId: string;
      channelTitle: string;
      tags?: string[];
      categoryId: string;
      defaultLanguage?: string;
    };
    statistics: {
      viewCount: string;
      likeCount: string;
      dislikeCount?: string;
      favoriteCount?: string;
      commentCount: string;
    };
    contentDetails: {
      duration: string;
      dimension: string;
      definition: string;
      caption: string;
    };
  }>;
  nextPageToken?: string;
}

interface YouTubeChannelResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        medium: { url: string };
        high?: { url: string };
      };
      publishedAt: string;
      customUrl?: string;
      country?: string;
    };
    statistics: {
      subscriberCount: string;
      videoCount: string;
      viewCount: string;
    };
  }>;
}

class YouTubeService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  private buildUrl(endpoint: string, params: Record<string, string>): string {
    // Use proxy endpoint in development to avoid CORS issues
    const baseUrl = import.meta.env.MODE === 'development' 
      ? window.location.origin + '/api/youtube/v3/'
      : 'https://www.googleapis.com/youtube/v3/';
    
    const url = new URL(endpoint, baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    url.searchParams.set('key', API_KEY || '');
    return url.toString();
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Fetch video metadata using YouTube Data API v3
   * @param videoIds Array of video IDs to fetch
   * @returns Promise resolving to array of Video objects
   */
  async fetchVideos(videoIds: string[]): Promise<Video[]> {
    if (!videoIds.length) return [];
    
    const cacheKey = `videos_${videoIds.join(',')}`;
    const cached = this.getCachedData<Video[]>(cacheKey);
    if (cached) return cached;

    try {
      const url = this.buildUrl('videos', {
        part: 'snippet,statistics,contentDetails',
        id: videoIds.join(',')
      });

      const response = await fetch(url);
      if (!response.ok) {
        throw new ApiError(
          `YouTube API error: ${response.statusText}`,
          response.status,
          'youtube_api_error'
        );
      }

      const data: YouTubeVideoResponse = await response.json();
      
      const videos: Video[] = data.items.map(item => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.high?.url || '',
        duration: this.parseDuration(item.contentDetails.duration),
        views: item.statistics.viewCount || '0',
        viewCount: parseInt(item.statistics.viewCount || '0', 10),
        likes: parseInt(item.statistics.likeCount || '0', 10),
        likeCount: parseInt(item.statistics.likeCount || '0', 10),
        dislikes: parseInt(item.statistics.dislikeCount || '0', 10),
        dislikeCount: parseInt(item.statistics.dislikeCount || '0', 10),
        commentCount: parseInt(item.statistics.commentCount || '0', 10),
        publishedAt: item.snippet.publishedAt,
        uploadedAt: item.snippet.publishedAt,
        channelId: item.snippet.channelId,
        channelName: item.snippet.channelTitle,
        channelAvatarUrl: '',
        category: item.snippet.categoryId || 'Unknown',
        tags: item.snippet.tags || [],
        visibility: 'public' as const,
        isLive: false,
        isShort: false,
        createdAt: item.snippet.publishedAt,
        updatedAt: new Date().toISOString(),
        videoUrl: `https://www.youtube.com/watch?v=${item.id}`,
        // Additional required fields for Video type compatibility
        channel: {
          id: item.snippet.channelId,
          name: item.snippet.channelTitle,
          avatarUrl: '',
          isVerified: false
        }
      }));

      this.setCachedData(cacheKey, videos, CACHE_CONFIG.VIDEO_DATA_TTL);
      return videos;
    } catch (error) {
      console.error('Error fetching videos:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch video data', 500, 'fetchVideosError', error);
    }
  }

  /**
   * Fetch channel metadata using YouTube Data API v3
   * @param channelId Channel ID to fetch
   * @returns Promise resolving to Channel object or null
   */
  async fetchChannel(channelId: string): Promise<Channel | null> {
    if (!channelId) return null;
    
    const cacheKey = `channel_${channelId}`;
    const cached = this.getCachedData<Channel>(cacheKey);
    if (cached) return cached;

    try {
      const url = this.buildUrl('channels', {
        part: 'snippet,statistics',
        id: channelId
      });

      const response = await fetch(url);
      if (!response.ok) {
        throw new ApiError(
          `YouTube API error: ${response.statusText}`,
          response.status,
          'youtube_api_error'
        );
      }

      const data: YouTubeChannelResponse = await response.json();
      const item = data.items[0];
      
      if (!item) return null;

      const channel: Channel = {
        id: item.id,
        name: item.snippet.title,
        description: item.snippet.description,
        avatarUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.high?.url || '',
        banner: item.snippet.thumbnails.high?.url || '',
        subscribers: parseInt(item.statistics.subscriberCount || '0', 10),
        subscriberCount: this.formatSubscriberCount(parseInt(item.statistics.subscriberCount || '0', 10)),
        videoCount: parseInt(item.statistics.videoCount || '0', 10),
        totalViews: parseInt(item.statistics.viewCount || '0', 10),
        isVerified: false, // Would need additional API call or manual verification
        joinedDate: item.snippet.publishedAt,
        country: item.snippet.country,
        createdAt: item.snippet.publishedAt,
        updatedAt: new Date().toISOString()
      };

      this.setCachedData(cacheKey, channel, CACHE_CONFIG.USER_DATA_TTL);
      return channel;
    } catch (error) {
      console.error('Error fetching channel:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      // Return null on error for graceful degradation
      return null;
    }
  }

  /**
   * Parse YouTube duration format (PT#M#S) to human readable string
   */
  private parseDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1]?.replace('H', '') || '0', 10);
    const minutes = parseInt(match[2]?.replace('M', '') || '0', 10);
    const seconds = parseInt(match[3]?.replace('S', '') || '0', 10);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format subscriber count for display (e.g., "1.2M", "543K")
   */
  private formatSubscriberCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }

  /**
   * Clear cached data
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const youtubeService = new YouTubeService();

