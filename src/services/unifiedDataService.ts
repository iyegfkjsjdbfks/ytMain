// Unified Data Service - Enhanced Implementation
export interface UnifiedSearchFilters {
  maxResults?: number;
  sortBy?: 'relevance' | 'date' | 'viewCount';
  duration?: 'short' | 'medium' | 'long';
  uploadDate?: 'hour' | 'today' | 'week' | 'month' | 'year';
}

export interface UnifiedVideoMetadata {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
  source: 'youtube' | 'google-search' | 'local';
  visibility: 'public' | 'private' | 'unlisted';
  metadata: {
    tags: string[];
    category: string;
    language: string;
  };
}

export interface UnifiedDataConfig {
  sources: {
    youtube: boolean;
    googleSearch: boolean;
    local: boolean;
  };
  limits: {
    youtube: number;
    googleSearch: number;
    local: number;
  };
  caching: {
    enabled: boolean;
    ttl: number;
  };
}

export class UnifiedDataService {
  private config: UnifiedDataConfig;
  private cache: Map<string, any>;

  constructor(config?: Partial<UnifiedDataConfig>) {
    this.config = {
      sources: {
        youtube: true,
        googleSearch: true,
        local: false
      },
      limits: {
        youtube: 25,
        googleSearch: 10,
        local: 5
      },
      caching: {
        enabled: true,
        ttl: 300000 // 5 minutes
      },
      ...config
    };
    this.cache = new Map();
  }

  async searchVideos(
    query: string,
    filters: UnifiedSearchFilters = {}
  ): Promise<UnifiedVideoMetadata[]> {
    try {
      const cacheKey = 'search-' + query + '-' + JSON.stringify(filters);
      
      if (this.config.caching.enabled) {
        const cached = this.getCachedData(cacheKey);
        if (cached) {
          return cached;
        }
      }

      const results: UnifiedVideoMetadata[] = [];

      // YouTube search
      if (this.config.sources.youtube) {
        try {
          const youtubeResults = await this.searchYouTubeVideos(query, filters);
          results.push(...youtubeResults);
        } catch (error) {
          console.warn('YouTube search failed:', error);
        }
      }

      // Google Custom Search
      if (this.config.sources.googleSearch) {
        try {
          const googleResults = await this.searchGoogleCustomSearchVideos(query, filters);
          results.push(...googleResults);
        } catch (error) {
          console.warn('Google search failed:', error);
        }
      }

      // Mix and deduplicate results
      const mixedResults = this.mixVideoResults(results, filters);

      if (this.config.caching.enabled) {
        this.setCachedData(cacheKey, mixedResults);
      }

      return mixedResults;
    } catch (error) {
      console.error('Unified search failed:', error);
      return [];
    }
  }

  async getTrendingVideos(filters: UnifiedSearchFilters = {}): Promise<UnifiedVideoMetadata[]> {
    return this.searchVideos('trending videos', filters);
  }

  private async searchYouTubeVideos(
    query: string,
    filters: UnifiedSearchFilters
  ): Promise<UnifiedVideoMetadata[]> {
    // Placeholder implementation
    console.log('YouTube search:', query, filters);
    return [];
  }

  private async searchGoogleCustomSearchVideos(
    query: string,
    filters: UnifiedSearchFilters
  ): Promise<UnifiedVideoMetadata[]> {
    // Placeholder implementation
    console.log('Google search:', query, filters);
    return [];
  }

  private mixVideoResults(
    results: UnifiedVideoMetadata[],
    filters: UnifiedSearchFilters
  ): UnifiedVideoMetadata[] {
    // Remove duplicates by ID
    const uniqueResults = results.filter((video, index, self) =>
      index === self.findIndex(v => v.id === video.id)
    );

    // Sort by relevance or specified criteria
    const sortBy = filters.sortBy || 'relevance';
    uniqueResults.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'viewCount':
          return b.viewCount - a.viewCount;
        default:
          return 0; // Keep original order for relevance
      }
    });

    // Apply result limit
    const maxResults = filters.maxResults || 25;
    return uniqueResults.slice(0, maxResults);
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.config.caching.ttl) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  updateConfig(newConfig: Partial<UnifiedDataConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): UnifiedDataConfig {
    return { ...this.config };
  }
}

export const unifiedDataService = new UnifiedDataService();
export default unifiedDataService;