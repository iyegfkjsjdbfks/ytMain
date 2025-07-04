import { CACHE_CONFIG } from '../../lib/constants';

import { ApiError } from './base';

import type { Video, Channel } from '../../types/core';

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
      ? `${window.location.origin  }/api/youtube/v3/`
      : 'https://www.googleapis.com/youtube/v3/';

    const url = new URL(endpoint, baseUrl);
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
        part: 'snippet,statistics,contentDetails,status,recordingDetails,liveStreamingDetails,localizations,topicDetails',
        id: videoIds.join(','),
      });

      const response = await fetch(url);
      if (!response.ok) {
        throw new ApiError(
          `YouTube API error: ${response.statusText}`,
          response.status,
          'youtube_api_error',
        );
      }

      const data: YouTubeVideoResponse = await response.json();

      // Create videos with comprehensive metadata
      const videos: Video[] = data.items.map(item => {
        const { contentDetails } = item;
        const { snippet } = item;
        const { statistics } = item;
        const { status } = (item as any);
        const { recordingDetails } = (item as any);
        const { liveStreamingDetails } = (item as any);
        const { topicDetails } = (item as any);

        return {
          id: item.id,
          title: snippet.title,
          description: snippet.description,
          thumbnailUrl: snippet.thumbnails.medium?.url || snippet.thumbnails.high?.url || '',
          duration: this.parseDuration(contentDetails.duration),
          views: statistics.viewCount || '0',
          viewCount: parseInt(statistics.viewCount || '0', 10),
          likes: parseInt(statistics.likeCount || '0', 10),
          likeCount: parseInt(statistics.likeCount || '0', 10),
          dislikes: parseInt(statistics.dislikeCount || '0', 10),
          dislikeCount: parseInt(statistics.dislikeCount || '0', 10),
          commentCount: parseInt(statistics.commentCount || '0', 10),
          publishedAt: snippet.publishedAt,
          uploadedAt: snippet.publishedAt,
          channelId: snippet.channelId,
          channelName: snippet.channelTitle,
          channelAvatarUrl: '',
          category: this.getCategoryName(snippet.categoryId),
          tags: snippet.tags || [],
          visibility: this.mapPrivacyStatus(status?.privacyStatus) as any,
          isLive: snippet.liveBroadcastContent === 'live' || liveStreamingDetails?.actualStartTime,
          isShort: this.isShortVideo(contentDetails.duration),
          createdAt: snippet.publishedAt,
          updatedAt: new Date().toISOString(),
          videoUrl: `https://www.youtube.com/watch?v=${item.id}`,

          // Enhanced metadata
          privacyStatus: status?.privacyStatus || 'public',
          definition: contentDetails.definition,
          license: status?.license,

          // Statistics object
          statistics: {
            viewCount: parseInt(statistics.viewCount || '0', 10),
            likeCount: parseInt(statistics.likeCount || '0', 10),
            dislikeCount: parseInt(statistics.dislikeCount || '0', 10),
            favoriteCount: parseInt(statistics.favoriteCount || '0', 10),
            commentCount: parseInt(statistics.commentCount || '0', 10),
          },

          // Content details
          contentDetails: {
            duration: contentDetails.duration,
            dimension: contentDetails.dimension,
            definition: contentDetails.definition,
            caption: contentDetails.caption,
            licensedContent: contentDetails.licensedContent || false,
            contentRating: contentDetails.contentRating || {},
            projection: contentDetails.projection || 'rectangular',
          },

          // Topic details
          topicDetails: {
            topicIds: topicDetails?.topicIds || [],
            relevantTopicIds: topicDetails?.relevantTopicIds || [],
            topicCategories: topicDetails?.topicCategories || [],
          },

          // Channel object
          channel: {
            id: snippet.channelId,
            name: snippet.channelTitle,
            avatarUrl: '',
            isVerified: false,
          },

          // Additional metadata for watch page
          metadata: {
            defaultLanguage: snippet.defaultLanguage,
            uploadLocation: recordingDetails?.location,
            recordingDate: recordingDetails?.recordingDate,
            actualStartTime: liveStreamingDetails?.actualStartTime,
            actualEndTime: liveStreamingDetails?.actualEndTime,
            scheduledStartTime: liveStreamingDetails?.scheduledStartTime,
            concurrentViewers: liveStreamingDetails?.concurrentViewers,
            embeddable: status?.embeddable,
            publicStatsViewable: status?.publicStatsViewable,
            madeForKids: status?.madeForKids,
            selfDeclaredMadeForKids: status?.selfDeclaredMadeForKids,
          },
        };
      });

      // Fetch channel data for all unique channels to get avatars
      const uniqueChannelIds = [...new Set(data.items.map(item => item.snippet.channelId))];
      const channelPromises = uniqueChannelIds.map(channelId =>
        this.fetchChannel(channelId).catch(() => null),
      );
      const channels = await Promise.all(channelPromises);

      // Create a map of channel ID to channel data
      const channelMap = new Map();
      channels.forEach(channel => {
        if (channel) {
          channelMap.set(channel.id, channel);
        }
      });

      // Update videos with channel avatar URLs
      videos.forEach(video => {
        const channelData = channelMap.get(video.channelId);
        if (channelData) {
          video.channelAvatarUrl = channelData.avatarUrl;
          video.channel.avatarUrl = channelData.avatarUrl;
          video.channel.isVerified = channelData.isVerified;
        }
      });

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
        id: channelId,
      });

      const response = await fetch(url);
      if (!response.ok) {
        throw new ApiError(
          `YouTube API error: ${response.statusText}`,
          response.status,
          'youtube_api_error',
        );
      }

      const data: YouTubeChannelResponse = await response.json();
      const item = data.items[0];

      if (!item) {
return null;
}

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
        updatedAt: new Date().toISOString(),
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
   * Determine if video is a YouTube Short based on duration
   */
  private isShortVideo(duration: string): boolean {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) {
return false;
}

    const hours = parseInt(match[1]?.replace('H', '') || '0', 10);
    const minutes = parseInt(match[2]?.replace('M', '') || '0', 10);
    const seconds = parseInt(match[3]?.replace('S', '') || '0', 10);

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    return totalSeconds <= 60; // YouTube Shorts are 60 seconds or less
  }

  /**
   * Map YouTube privacy status to our visibility type
   */
  private mapPrivacyStatus(privacyStatus: string): string {
    switch (privacyStatus) {
      case 'public':
        return 'public';
      case 'unlisted':
        return 'unlisted';
      case 'private':
        return 'private';
      case 'scheduled':
        return 'scheduled';
      default:
        return 'public';
    }
  }

  /**
   * Get category name from category ID
   */
  private getCategoryName(categoryId: string): string {
    const categories: Record<string, string> = {
      '1': 'Film & Animation',
      '2': 'Autos & Vehicles',
      '10': 'Music',
      '15': 'Pets & Animals',
      '17': 'Sports',
      '18': 'Short Movies',
      '19': 'Travel & Events',
      '20': 'Gaming',
      '21': 'Videoblogging',
      '22': 'People & Blogs',
      '23': 'Comedy',
      '24': 'Entertainment',
      '25': 'News & Politics',
      '26': 'Howto & Style',
      '27': 'Education',
      '28': 'Science & Technology',
      '29': 'Nonprofits & Activism',
      '30': 'Movies',
      '31': 'Anime/Animation',
      '32': 'Action/Adventure',
      '33': 'Classics',
      '34': 'Comedy',
      '35': 'Documentary',
      '36': 'Drama',
      '37': 'Family',
      '38': 'Foreign',
      '39': 'Horror',
      '40': 'Sci-Fi/Fantasy',
      '41': 'Thriller',
      '42': 'Shorts',
      '43': 'Shows',
      '44': 'Trailers',
    };

    return categories[categoryId] || 'Entertainment';
  }

  /**
   * Clear cached data
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const youtubeService = new YouTubeService();

