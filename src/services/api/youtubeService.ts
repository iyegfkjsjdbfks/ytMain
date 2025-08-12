import type { Video } from '../types';
import type { Channel } from '../types';
import { ApiError } from './base';
import { CACHE_CONFIG } from '../../lib/constants';
import { logger } from '../../utils/logger';
import type { Video, Channel } from '../../types/core';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const GOOGLE_API_URL = 'https://www.googleapis.com/youtube/v3';

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
      tags?: string;
      categoryId: string;
      defaultLanguage?: string;
      liveBroadcastContent?: string;
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
      licensedContent?: boolean;
      contentRating?: Record<string, string>;
      projection?: string;
    };
  }>;
  nextPageToken?: string;
}

interface YouTubeSearchResponse {
  items: Array<{
    id: {
      kind: string;
      videoId: string;
    };
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
    };
  }>;
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
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
  private cache = new Map<string, { data; timestamp: number; ttl: number }>();

  private buildUrl(endpoint: any, params: Record<string, string>): string {
    const isDevelopment = import.meta.env.MODE === 'development';
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:5173';
    const baseUrl = isDevelopment ? `${origin}/api/youtube/v3` : GOOGLE_API_URL;

    const url = new URL(`${baseUrl}/${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
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

  private setCachedData(key: string, data: any, ttl: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl });
  }

  async fetchVideos(videoIds: any): Promise<Video[]> {
    if (!API_KEY) {
      logger.warn(
        'YouTube Data API v3 key not available. Metadata fetching will use fallback methods.'
      );
      return [];
    }

    if (!videoIds.length) {
      return [];
    }

    const cacheKey = `videos_${videoIds.join(',')}`;
    const cached = this.getCachedData<Video[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const url = this.buildUrl('videos', {
        part: 'snippet,statistics,contentDetails',
        id: videoIds.join(',') });

      const response = await fetch(url);
      if (!response.ok) {
        throw new ApiError(
          `YouTube API error: ${response.statusText}`,
          response.status,
          'youtube_api_error'
        );
      }

      const data: YouTubeVideoResponse = await response.json();

      const videos: Video[] = (data.items || []).map(item => {
        const { snippet, statistics, contentDetails } = item;
        return {
          id: item.id,
          title: snippet?.title || 'Untitled Video',
          description: snippet?.description || '',
          thumbnailUrl:
            snippet?.thumbnails?.medium?.url ||
            snippet?.thumbnails?.high?.url ||
            '',
          duration: contentDetails?.duration
            ? this.parseDuration(contentDetails.duration)
            : '0:00',
          views: statistics?.viewCount || '0',
          viewCount: parseInt(statistics?.viewCount || '0', 10),
          likes: parseInt(statistics?.likeCount || '0', 10),
          likeCount: parseInt(statistics?.likeCount || '0', 10),
          dislikes: parseInt(statistics?.dislikeCount || '0', 10),
          dislikeCount: parseInt(statistics?.dislikeCount || '0', 10),
          commentCount: parseInt(statistics?.commentCount || '0', 10),
          publishedAt: snippet?.publishedAt || new Date().toISOString(),
          uploadedAt: snippet?.publishedAt || new Date().toISOString(),
          channelId: snippet?.channelId || '',
          channelName: snippet?.channelTitle || 'Unknown Channel',
          channelAvatarUrl: '',
          category: snippet?.categoryId
            ? this.getCategoryName(snippet.categoryId)
            : 'Unknown',
          tags: snippet?.tags || [],
          isLive: snippet?.liveBroadcastContent === 'live',
          isShort: contentDetails?.duration
            ? this.isShortVideo(contentDetails.duration)
            : false,
          createdAt: snippet?.publishedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          videoUrl: `https://www.youtube.com/watch?v=${item.id}` } as Video;
      });

      this.setCachedData(cacheKey, videos, CACHE_CONFIG.VIDEO_DATA_TTL);
      return videos;
    } catch (error) {
      logger.error('Error fetching videos:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Failed to fetch video data',
        500,
        'fetchVideosError',
        error
      );
    }
  }

  async fetchChannel(channelId: any): Promise<Channel | null> {
    if (!API_KEY) {
      logger.warn(
        'YouTube Data API v3 key not available. Channel metadata fetching will use fallback methods.'
      );
      return null;
    }

    if (!channelId) {
      return null;
    }

    const cacheKey = `channel_${channelId}`;
    const cached = this.getCachedData<Channel>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const url = this.buildUrl('channels', {
        part: 'snippet,statistics',
        id: channelId });

      const response = await fetch(url);
      if (!response.ok) {
        throw new ApiError(
          `YouTube API error: ${response.statusText}`,
          response.status,
          'youtube_api_error'
        );
      }

      const data: YouTubeChannelResponse = await response.json();
      const item = data.items?.[0];

      if (!item) {
        return null;
      }

      const channel: Channel = {
        id: item.id,
        name: item.snippet?.title || 'Unknown Channel',
        description: item.snippet?.description || '',
        avatarUrl:
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.high?.url ||
          '',
        banner: item.snippet?.thumbnails?.high?.url || '',
        subscribers: parseInt(item.statistics?.subscriberCount || '0', 10),
        subscriberCount: this.formatSubscriberCount(
          parseInt(item.statistics?.subscriberCount || 0, 10)
        ),
        videoCount: parseInt(item.statistics?.videoCount || '0', 10),
        totalViews: parseInt(item.statistics?.viewCount || '0', 10),
        isVerified: false, // This would require a separate mechanism to verify
        joinedDate: item.snippet?.publishedAt || new Date().toISOString(),
        country: item.snippet?.country || 'Unknown',
        createdAt: item.snippet?.publishedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString() };

      this.setCachedData(cacheKey, channel, CACHE_CONFIG.USER_DATA_TTL);
      return channel;
    } catch (error) {
      logger.error('Error fetching channel:', error);
      return null; // Return null for graceful degradation
    }
  }

  private parseDuration(duration: any): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) {
      return '0:00';
    }

    const hours = parseInt(match[1]?.replace('H', '') || '0', 10);
    const minutes = parseInt(match[2]?.replace('M', '') || '0', 10);
    const seconds = parseInt(match[3]?.replace('S', '') || '0', 10);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private formatSubscriberCount(count: any): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toString();
  }

  private isShortVideo(duration: any): boolean {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) {
      return false;
    }

    const hours = parseInt(match[1]?.replace('H', '') || '0', 10);
    const minutes = parseInt(match[2]?.replace('M', '') || '0', 10);
    const seconds = parseInt(match[3]?.replace('S', '') || '0', 10);

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    return totalSeconds > 0 && totalSeconds <= 60;
  }

  private getCategoryName(categoryId: any): string {
    const categories: Record<string, string> = {
      '1': 'Film & Animation',
      '2': 'Autos & Vehicles',
      '10': 'Music',
      '15': 'Pets & Animals',
      '17': 'Sports',
      '20': 'Gaming',
      '22': 'People & Blogs',
      '23': 'Comedy',
      '24': 'Entertainment',
      '25': 'News & Politics',
      '26': 'Howto & Style',
      '27': 'Education',
      '28': 'Science & Technology',
      '29': 'Nonprofits & Activism' };
    return categories[categoryId] || 'Unknown';
  }

  async searchVideos(
    query: any,
    options: { maxResults?: number } = {}
  ): Promise<Video[]> {
    if (!API_KEY) {
      logger.warn(
        'YouTube Data API v3 key not available. Video search will use fallback methods.'
      );
      return [];
    }

    if (!query.trim()) {
      return [];
    }

    const cacheKey = `search_${query}_${JSON.stringify(options)}`;
    const cached = this.getCachedData<Video[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const searchUrl = this.buildUrl('search', {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: String(options.maxResults || 25) });

      const searchResponse = await fetch(searchUrl);
      if (!searchResponse.ok) {
        throw new ApiError(
          `YouTube Search API error: ${searchResponse.statusText}`,
          searchResponse.status,
          'youtube_search_error'
        );
      }

      const searchData: YouTubeSearchResponse = await searchResponse.json();
      const videoIds = (searchData.items || [])
        .map(item => item.id.videoId)
        .filter(Boolean);

      if (videoIds.length === 0) {
        return [];
      }

      const videos = await this.fetchVideos(videoIds);

      this.setCachedData(cacheKey, videos, CACHE_CONFIG.VIDEO_DATA_TTL);
      return videos;
    } catch (error) {
      logger.error('Error searching videos:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Failed to search videos',
        500,
        'searchVideosError',
        error
      );
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const youtubeService = new YouTubeService();
