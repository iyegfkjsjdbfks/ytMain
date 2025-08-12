import { isYouTubeDataApiBlocked } from '../src/utils/youtubeApiUtils';

import type { Playlist } from '../src/types/core';
import type { Video, Channel, Comment } from '../types';

// Unified API Configuration
interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

const defaultConfig: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.youtube.com/v3',
  apiKey: import.meta.env.VITE_YOUTUBE_API_KEY || '',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Unified Cache System
class UnifiedCache {
  private cache = new Map<string, { data; timestamp: number; ttl: number }>();
  private readonly defaultTTL = 15 * 60 * 1000; // 15 minutes

  set(key, data, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key): T | null {
    const item = this.cache.get(key);
    if (!item) {
return null;
}

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  invalidate(pattern?: string): void {
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

  size(): number {
    return this.cache.size;
  }
}

// Unified Error Types
export class ApiError extends Error {
  constructor(
    message,
    public status?: number,
    public code?: string,
    public details?,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Request/Response Interceptors
type RequestInterceptor = (config: RequestInit & { url: string }) => RequestInit & { url: string };
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;
type ErrorInterceptor = (error: Error) => Error | Promise<Error>;

interface Interceptors {
  request: RequestInterceptor;
  response: ResponseInterceptor;
  error: ErrorInterceptor;
}

// Unified API Service
class UnifiedApiService {
  private config: ApiConfig;
  private cache: UnifiedCache;
  private interceptors: Interceptors;
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.cache = new UnifiedCache();
    this.interceptors = {
      request: [],
      response: [],
      error: [],
    };

    // Add default request interceptor for API key
    this.addRequestInterceptor((config) => {
      if (this.config.apiKey && !config.url.includes('key=')) {
        const separator = config.url.includes('?') ? '&' : '?';
        config.url += `${separator}key=${this.config.apiKey}`;
      }
      return config;
    });

    // Add default error interceptor
    this.addErrorInterceptor((error) => {
      console.error('API Error:', error);
      return error;
    });
  }

  // Interceptor management
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.interceptors.request.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.interceptors.response.push(interceptor);
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.interceptors.error.push(interceptor);
  }

  // Core request method with unified error handling
  private async makeRequest<T>(
    endpoint,
    options: RequestInit = {},
    cacheKey?: string,
    cacheTTL?: number,
  ): Promise<T> {
    // Check cache first
    if (cacheKey) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Deduplicate identical requests
    const requestKey = `${endpoint}:${JSON.stringify(options)}`;
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey);
    }

    const requestPromise = this.executeRequest<T>(endpoint, options, cacheKey, cacheTTL);
    this.requestQueue.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.requestQueue.delete(requestKey);
    }
  }

  private async executeRequest<T>(
    endpoint,
    options: RequestInit,
    cacheKey?: string,
    cacheTTL?: number,
  ): Promise<T> {
    let config: RequestInit & { url: string } = {
      ...options,
      url: `${this.config.baseUrl}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      },
    };

    // Apply request interceptors
    for (const interceptor of this.interceptors.request) {
      config = interceptor(config);
    }

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        let response = await fetch(config.url, {
          ...config,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Apply response interceptors
        for (const interceptor of this.interceptors.response) {
          response = await interceptor(response);
        }

        if (!response.ok) {
          throw new ApiError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            'HTTP_ERROR',
          );
        }

        const data = await response.json();

        // Cache successful response
        if (cacheKey) {
          this.cache.set(cacheKey, data, cacheTTL);
        }

        return data;
      } catch (error) {
        lastError = error as Error;

        // Apply error interceptors
        for (const interceptor of this.interceptors.error) {
          lastError = await interceptor(lastError);
        }

        // Don't retry on certain errors
        if (error instanceof ApiError && error.status && error.status < 500) {
          throw lastError;
        }

        // Wait before retry
        if (attempt < this.config.retryAttempts) {
          await new Promise(resolve =>
            setTimeout(resolve, this.config.retryDelay * Math.pow(2, attempt)),
          );
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Request failed after all retry attempts');
  }

  // Unified API methods
  async getVideos(params: {
    part?: string;
    chart?: string;
    regionCode?: string;
    maxResults?: number;
    pageToken?: string;
  } = {}): Promise<{ items: Video; nextPageToken?: string }> {
    // Check if YouTube Data API is blocked by admin settings
    if (isYouTubeDataApiBlocked()) {
      console.warn('YouTube Data API v3 is disabled when Google Custom Search JSON API is selected as the YouTube Search Provider.');
      return { items: [] };
    }
    const queryParams = new URLSearchParams();
    queryParams.set('part', 'snippet,statistics,contentDetails');
    queryParams.set('chart', 'mostPopular');
    queryParams.set('regionCode', 'US');
    queryParams.set('maxResults', String(params.maxResults || 25));
    if (params.pageToken) {
queryParams.set('pageToken', params.pageToken);
}

    const cacheKey = `videos:${queryParams.toString()}`;
    return this.makeRequest(`/videos?${queryParams}`, {}, cacheKey, 10 * 60 * 1000);
  }

  async searchVideos(query, params: {
    maxResults?: number;
    pageToken?: string;
    order?: string;
    type?: string;
  } = {}): Promise<{ items: Video; nextPageToken?: string }> {
    // Check if YouTube Data API is blocked by admin settings
    if (isYouTubeDataApiBlocked()) {
      console.warn('YouTube Data API v3 is disabled when Google Custom Search JSON API is selected as the YouTube Search Provider.');
      return { items: [] };
    }
    const queryParams = new URLSearchParams();
    queryParams.set('part', 'snippet');
    queryParams.set('q', query);
    queryParams.set('type', params.type || 'video');
    queryParams.set('maxResults', String(params.maxResults || 25));
    if (params.pageToken) {
queryParams.set('pageToken', params.pageToken);
}
    if (params.order) {
queryParams.set('order', params.order);
}

    const cacheKey = `search:${query}:${queryParams.toString()}`;
    return this.makeRequest(`/search?${queryParams}`, {}, cacheKey, 5 * 60 * 1000);
  }

  async getChannel(channelId): Promise<Channel> {
    // Check if YouTube Data API is blocked by admin settings
    if (isYouTubeDataApiBlocked()) {
      console.warn('YouTube Data API v3 is disabled when Google Custom Search JSON API is selected as the YouTube Search Provider.');
      throw new Error('YouTube Data API is disabled');
    }
    const queryParams = new URLSearchParams({
      part: 'snippet,statistics,brandingSettings',
      id: channelId,
    });

    const cacheKey = `channel:${channelId}`;
    const response = await this.makeRequest<{ items: Channel[] }>(
      `/channels?${queryParams}`,
      {},
      cacheKey,
      30 * 60 * 1000,
    );

    if (!response.items || response.items.length === 0) {
      throw new ApiError('Channel not found', 404, 'CHANNEL_NOT_FOUND');
    }

    const channel = response.items[0];
    if (!channel) {
      throw new ApiError('Channel not found', 404, 'CHANNEL_NOT_FOUND');
    }

    return channel;
  }

  async getPlaylist(playlistId): Promise<Playlist> {
    // Check if YouTube Data API is blocked by admin settings
    if (isYouTubeDataApiBlocked()) {
      console.warn('YouTube Data API v3 is disabled when Google Custom Search JSON API is selected as the YouTube Search Provider.');
      throw new Error('YouTube Data API is disabled');
    }
    const queryParams = new URLSearchParams({
      part: 'snippet,status',
      id: playlistId,
    });

    const cacheKey = `playlist:${playlistId}`;
    const response = await this.makeRequest<{ items: Playlist[] }>(
      `/playlists?${queryParams}`,
      {},
      cacheKey,
      15 * 60 * 1000,
    );

    if (!response.items || response.items.length === 0) {
      throw new ApiError('Playlist not found', 404, 'PLAYLIST_NOT_FOUND');
    }

    const playlist = response.items[0];
    if (!playlist) {
      throw new ApiError('Playlist not found', 404, 'PLAYLIST_NOT_FOUND');
    }

    return playlist;
  }

  async getComments(videoId, params: {
    maxResults?: number;
    pageToken?: string;
    order?: string;
  } = {}): Promise<{ items: Comment; nextPageToken?: string }> {
    // Check if YouTube Data API is blocked by admin settings
    if (isYouTubeDataApiBlocked()) {
      console.warn('YouTube Data API v3 is disabled when Google Custom Search JSON API is selected as the YouTube Search Provider.');
      return { items: [] };
    }
    const queryParams = new URLSearchParams();
    queryParams.set('part', 'snippet,replies');
    queryParams.set('videoId', videoId);
    queryParams.set('maxResults', String(params.maxResults || 20));
    queryParams.set('order', params.order || 'relevance');
    if (params.pageToken) {
queryParams.set('pageToken', params.pageToken);
}

    const cacheKey = `comments:${videoId}:${queryParams.toString()}`;
    return this.makeRequest(`/commentThreads?${queryParams}`, {}, cacheKey, 5 * 60 * 1000);
  }

  // Cache management
  clearCache(pattern?: string): void {
    this.cache.invalidate(pattern);
  }

  getCacheSize(): number {
    return this.cache.size();
  }

  // Configuration updates
  updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const unifiedApiService = new UnifiedApiService();
export default unifiedApiService;

// Export types for external use
export type { ApiConfig };