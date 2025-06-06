import { Video, Channel, UserPlaylist } from '../types';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.youtube.com/v3';
const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

// Cache Configuration
const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000, // 1 hour
};

// Cache Implementation
class APICache {
  private cache = new Map<string, { data: any; timestamp: number; duration: number }>();

  set(key: string, data: any, duration: number = CACHE_DURATION.MEDIUM): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      duration,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.duration;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  size(): number {
    return this.cache.size;
  }
}

const apiCache = new APICache();

// Request Queue for Rate Limiting
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private requestCount = 0;
  private resetTime = Date.now() + 60000; // Reset every minute
  private readonly maxRequestsPerMinute = 100;

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      // Reset counter if minute has passed
      if (Date.now() > this.resetTime) {
        this.requestCount = 0;
        this.resetTime = Date.now() + 60000;
      }

      // Check rate limit
      if (this.requestCount >= this.maxRequestsPerMinute) {
        const waitTime = this.resetTime - Date.now();
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      const request = this.queue.shift();
      if (request) {
        this.requestCount++;
        await request();
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    this.processing = false;
  }
}

const requestQueue = new RequestQueue();

// HTTP Client
class HTTPClient {
  private async request<T>(
    url: string,
    options: RequestInit = {},
    cacheKey?: string,
    cacheDuration?: number
  ): Promise<T> {
    // Check cache first
    if (cacheKey) {
      const cached = apiCache.get(cacheKey);
      if (cached) return cached;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache successful responses
    if (cacheKey && response.ok) {
      apiCache.set(cacheKey, data, cacheDuration);
    }

    return data;
  }

  async get<T>(
    url: string,
    cacheKey?: string,
    cacheDuration?: number
  ): Promise<T> {
    return requestQueue.add(() =>
      this.request<T>(url, { method: 'GET' }, cacheKey, cacheDuration)
    );
  }

  async post<T>(url: string, data: any): Promise<T> {
    return requestQueue.add(() =>
      this.request<T>(url, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    );
  }

  async put<T>(url: string, data: any): Promise<T> {
    return requestQueue.add(() =>
      this.request<T>(url, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    );
  }

  async delete<T>(url: string): Promise<T> {
    return requestQueue.add(() =>
      this.request<T>(url, { method: 'DELETE' })
    );
  }
}

const httpClient = new HTTPClient();

// Mock Data Generators (for development)
const generateMockVideo = (id: string, overrides: Partial<Video> = {}): Video => ({
  id,
  title: `Sample Video ${id}`,
  description: 'This is a sample video description for testing purposes.',
  duration: Math.floor(Math.random() * 3600) + 60, // Duration in seconds
  thumbnailUrl: `https://picsum.photos/320/180?random=${id}`,
  channelId: `channel_${Math.floor(Math.random() * 100)}`,
  channelName: `Channel ${Math.floor(Math.random() * 100)}`,
  channelAvatarUrl: `https://picsum.photos/40/40?random=${Math.floor(Math.random() * 100)}`,
  viewCount: Math.floor(Math.random() * 1000000),
  likeCount: Math.floor(Math.random() * 50000),
  dislikeCount: Math.floor(Math.random() * 1000),
  commentCount: Math.floor(Math.random() * 10000),
  publishedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  tags: ['sample', 'video', 'test'],
  category: 'Entertainment',
  license: 'youtube',
  visibility: 'public' as const,
  isLive: Math.random() > 0.9,
  isFamilySafe: true,
  isAgeRestricted: false,
  embeddable: true,
  defaultLanguage: 'en',
  ...overrides,
});

const generateMockChannel = (id: string, overrides: Partial<Channel> = {}): Channel => ({
  id,
  name: `Channel ${id}`,
  description: 'This is a sample channel description.',
  avatarUrl: `https://picsum.photos/80/80?random=${id}`,
  banner: `https://picsum.photos/1280/320?random=${id}`,
  subscribers: Math.floor(Math.random() * 1000000),
  subscriberCount: `${Math.floor(Math.random() * 1000)}K`,
  videoCount: Math.floor(Math.random() * 1000),
  isVerified: Math.random() > 0.5,
  createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// API Service Classes
export class VideoService {
  static async getVideos(
    category: string = 'home',
    limit: number = 20,
    pageToken?: string
  ): Promise<{ videos: Video[]; nextPageToken?: string }> {
    const cacheKey = `videos_${category}_${limit}_${pageToken || 'first'}`;
    
    try {
      // In development, return mock data
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        
        const videos = Array.from({ length: limit }, (_, i) => 
          generateMockVideo(`${category}_${i}_${Date.now()}`, {
            category: category === 'home' ? 'Entertainment' : category,
          })
        );
        
        const nextPageToken = Math.random() > 0.3 ? `token_${Date.now()}` : undefined;
        return {
          videos,
          ...(nextPageToken && { nextPageToken }),
        };
      }

      // Production API call
      const url = new URL(`${API_BASE_URL}/search`);
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('maxResults', limit.toString());
      url.searchParams.set('key', API_KEY || '');
      url.searchParams.set('type', 'video');
      
      if (pageToken) {
        url.searchParams.set('pageToken', pageToken);
      }
      
      if (category !== 'home') {
        url.searchParams.set('q', category);
      }

      const response = await httpClient.get<any>(
        url.toString(),
        cacheKey,
        CACHE_DURATION.MEDIUM
      );

      const videos: Video[] = response.items?.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        duration: 0,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        channelId: item.snippet.channelId,
        channelName: item.snippet.channelTitle,
        channelAvatarUrl: '', // Would need separate API call
        viewCount: 0, // Would need separate API call
        likeCount: 0,
        dislikeCount: 0,
        commentCount: 0,
        publishedAt: item.snippet.publishedAt,
        tags: item.snippet.tags || [],
        category: category,
        license: 'youtube',
        visibility: 'public' as const,
        isLive: false,
        isFamilySafe: true,
        isAgeRestricted: false,
        embeddable: true,
        defaultLanguage: 'en',
      })) || [];

      return {
        videos,
        nextPageToken: response.nextPageToken,
      };
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  }

  static async getVideoById(id: string): Promise<Video | null> {
    const cacheKey = `video_${id}`;
    
    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 200));
        return generateMockVideo(id);
      }

      const url = new URL(`${API_BASE_URL}/videos`);
      url.searchParams.set('part', 'snippet,statistics,contentDetails');
      url.searchParams.set('id', id);
      url.searchParams.set('key', API_KEY || '');

      const response = await httpClient.get<any>(
        url.toString(),
        cacheKey,
        CACHE_DURATION.LONG
      );

      const item = response.items?.[0];
      if (!item) return null;

      return {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        duration: this.parseDuration(item.contentDetails.duration),
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        channelId: item.snippet.channelId,
        channelName: item.snippet.channelTitle,
        channelAvatarUrl: '',
        viewCount: parseInt(item.statistics.viewCount || '0'),
        likeCount: parseInt(item.statistics.likeCount || '0'),
        dislikeCount: parseInt(item.statistics.dislikeCount || '0'),
        commentCount: parseInt(item.statistics.commentCount || '0'),
        publishedAt: item.snippet.publishedAt,
        tags: item.snippet.tags || [],
        category: item.snippet.categoryId,
        license: 'youtube',
        visibility: 'public' as const,
        isLive: item.snippet.liveBroadcastContent === 'live',
        isFamilySafe: true,
        isAgeRestricted: false,
        embeddable: true,
        defaultLanguage: item.snippet.defaultLanguage || 'en',
      };
    } catch (error) {
      console.error('Error fetching video:', error);
      return null;
    }
  }

  static async searchVideos(
    query: string,
    limit: number = 20,
    pageToken?: string
  ): Promise<{ videos: Video[]; nextPageToken?: string }> {
    const cacheKey = `search_${query}_${limit}_${pageToken || 'first'}`;
    
    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const videos = Array.from({ length: Math.min(limit, 15) }, (_, i) => 
          generateMockVideo(`search_${query}_${i}`, {
            title: `${query} - Video ${i + 1}`,
            description: `Search result for "${query}" - Video ${i + 1}`,
          })
        );
        
        const nextPageToken = Math.random() > 0.5 ? `token_${Date.now()}` : undefined;
        return {
          videos,
          ...(nextPageToken && { nextPageToken }),
        };
      }

      const url = new URL(`${API_BASE_URL}/search`);
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('maxResults', limit.toString());
      url.searchParams.set('key', API_KEY || '');
      url.searchParams.set('type', 'video');
      url.searchParams.set('q', query);
      
      if (pageToken) {
        url.searchParams.set('pageToken', pageToken);
      }

      const response = await httpClient.get<any>(
        url.toString(),
        cacheKey,
        CACHE_DURATION.SHORT
      );

      const videos: Video[] = response.items?.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        duration: 0,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        channelId: item.snippet.channelId,
        channelName: item.snippet.channelTitle,
        channelAvatarUrl: '',
        viewCount: 0,
        likeCount: 0,
        dislikeCount: 0,
        commentCount: 0,
        publishedAt: item.snippet.publishedAt,
        tags: item.snippet.tags || [],
        category: 'Search Result',
        license: 'youtube',
        visibility: 'public' as const,
        isLive: false,
        isFamilySafe: true,
        isAgeRestricted: false,
        embeddable: true,
        defaultLanguage: 'en',
      })) || [];

      return {
        videos,
        nextPageToken: response.nextPageToken,
      };
    } catch (error) {
      console.error('Error searching videos:', error);
      throw error;
    }
  }

  private static parseDuration(duration: string): number {
    // Parse ISO 8601 duration (PT4M13S) to seconds
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  }
}

export class ChannelService {
  static async getChannel(id: string): Promise<Channel | null> {
    const cacheKey = `channel_${id}`;
    
    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 200));
        return generateMockChannel(id);
      }

      const url = new URL(`${API_BASE_URL}/channels`);
      url.searchParams.set('part', 'snippet,statistics,brandingSettings');
      url.searchParams.set('id', id);
      url.searchParams.set('key', API_KEY || '');

      const response = await httpClient.get<any>(
        url.toString(),
        cacheKey,
        CACHE_DURATION.LONG
      );

      const item = response.items?.[0];
      if (!item) return null;

      return {
        id: item.id,
        name: item.snippet.title,
        description: item.snippet.description,
        avatarUrl: item.snippet.thumbnails.medium.url,
        banner: item.brandingSettings?.image?.bannerExternalUrl || '',
        subscribers: parseInt(item.statistics.subscriberCount || '0'),
        videoCount: parseInt(item.statistics.videoCount || '0'),
        isVerified: false, // Would need to check separately
        joinedAt: item.snippet.publishedAt,
      };
    } catch (error) {
      console.error('Error fetching channel:', error);
      return null;
    }
  }

  static async getChannelVideos(
    channelId: string,
    limit: number = 20,
    pageToken?: string
  ): Promise<{ videos: Video[]; nextPageToken?: string }> {
    const cacheKey = `channel_videos_${channelId}_${limit}_${pageToken || 'first'}`;
    
    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const videos = Array.from({ length: limit }, (_, i) => 
          generateMockVideo(`${channelId}_video_${i}`, {
            channel: {
              id: channelId,
              name: `Channel ${channelId}`,
              avatarUrl: `https://picsum.photos/40/40?random=${channelId}`,
              subscribers: Math.floor(Math.random() * 1000000),
              isVerified: Math.random() > 0.5,
            },
          })
        );
        
        const nextPageToken = Math.random() > 0.4 ? `token_${Date.now()}` : undefined;
        return {
          videos,
          ...(nextPageToken && { nextPageToken }),
        };
      }

      const url = new URL(`${API_BASE_URL}/search`);
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('maxResults', limit.toString());
      url.searchParams.set('key', API_KEY || '');
      url.searchParams.set('type', 'video');
      url.searchParams.set('channelId', channelId);
      url.searchParams.set('order', 'date');
      
      if (pageToken) {
        url.searchParams.set('pageToken', pageToken);
      }

      const response = await httpClient.get<any>(
        url.toString(),
        cacheKey,
        CACHE_DURATION.MEDIUM
      );

      const videos: Video[] = response.items?.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        duration: 0,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        channelId: item.snippet.channelId,
        channelName: item.snippet.channelTitle,
        channelAvatarUrl: '',
        viewCount: 0,
        likeCount: 0,
        dislikeCount: 0,
        commentCount: 0,
        publishedAt: item.snippet.publishedAt,
        tags: item.snippet.tags || [],
        category: 'Channel Video',
        license: 'youtube',
        visibility: 'public' as const,
        isLive: false,
        isFamilySafe: true,
        isAgeRestricted: false,
        embeddable: true,
        defaultLanguage: 'en',
      })) || [];

      return {
        videos,
        nextPageToken: response.nextPageToken,
      };
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      throw error;
    }
  }
}

export class PlaylistService {
  static async getUserPlaylists(userId: string): Promise<UserPlaylist[]> {
    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return [
          {
            id: 'playlist_1',
            title: 'Watch Later',
            description: 'Videos to watch later',
            videoIds: Array.from({ length: 15 }, (_, i) => `playlist_video_${i}`),
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'playlist_2',
            title: 'Favorites',
            description: 'My favorite videos',
            videoIds: Array.from({ length: 8 }, (_, i) => `favorite_video_${i}`),
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
      }

      // Production implementation would go here
      return [];
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      throw error;
    }
  }
}

// Export cache utilities
export const cacheUtils = {
  clear: () => apiCache.clear(),
  delete: (key: string) => apiCache.delete(key),
  size: () => apiCache.size(),
};

// Export for testing
export { apiCache, requestQueue };