import type { Video as LocalVideo, Channel as LocalChannel } from '../types/core';
import { youtubeService } from './api/youtubeService';

/**
 * Unified Video Metadata Interface
 * 
 * This interface represents the normalized structure that all video data
 * should conform to, regardless of source (local, YouTube, etc.)
 */
export interface UnifiedVideoMetadata {
  // Core identification
  id: string;
  title: string;
  description: string;
  
  // Media assets
  thumbnailUrl: string;
  videoUrl: string;
  
  // View metrics
  views: number;
  viewsFormatted: string; // e.g., "1.2M views"
  
  // Engagement metrics
  likes: number;
  dislikes: number;
  commentCount: number;
  
  // Channel information
  channel: {
    id: string;
    name: string;
    avatarUrl: string;
    subscribers: number;
    subscribersFormatted: string; // e.g., "2.5M subscribers"
    isVerified: boolean;
  };
  
  // Temporal data
  duration: string; // e.g., "12:34"
  publishedAt: string;
  publishedAtFormatted: string; // e.g., "2 weeks ago"
  
  // Content metadata
  category: string;
  tags: string[];
  isLive: boolean;
  isShort: boolean;
  
  // Content visibility
  visibility: 'public' | 'unlisted' | 'private' | 'scheduled';
  
  // Source information
  source: 'local' | 'youtube' | 'external';
  
  // Additional metadata
  metadata: {
    quality?: string;
    definition?: string;
    captions?: boolean;
    language?: string;
    license?: string;
  };
}

/**
 * Unified Channel Metadata Interface
 */
export interface UnifiedChannelMetadata {
  id: string;
  name: string;
  handle?: string;
  description: string;
  avatarUrl: string;
  bannerUrl?: string;
  subscribers: number;
  subscribersFormatted: string;
  videoCount: number;
  totalViews: number;
  isVerified: boolean;
  joinedDate?: string;
  country?: string;
  source: 'local' | 'youtube' | 'external';
}

/**
 * Service for normalizing metadata from different sources
 */
class MetadataNormalizationService {
  
  /**
   * Normalize local video data to unified format
   */
  normalizeLocalVideo(localVideo: LocalVideo): UnifiedVideoMetadata {
    const viewCount = this.parseViewCount(localVideo.views || '0');
    const subscriberCount = this.parseSubscriberCount(localVideo.channel?.subscribers || 0);
    
    return {
      id: localVideo.id,
      title: localVideo.title,
      description: localVideo.description || '',
      thumbnailUrl: localVideo.thumbnailUrl,
      videoUrl: localVideo.videoUrl,
      views: viewCount,
      viewsFormatted: this.formatViews(viewCount),
      likes: localVideo.likes || localVideo.likeCount || 0,
      dislikes: localVideo.dislikes || localVideo.dislikeCount || 0,
      commentCount: localVideo.commentCount || 0,
      channel: {
        id: localVideo.channelId,
        name: localVideo.channelName,
        avatarUrl: localVideo.channelAvatarUrl || localVideo.channel?.avatarUrl || '',
        subscribers: subscriberCount,
        subscribersFormatted: this.formatSubscribers(subscriberCount),
        isVerified: localVideo.channel?.isVerified || false,
      },
      duration: this.normalizeDuration(localVideo.duration),
      publishedAt: localVideo.publishedAt || localVideo.uploadedAt || localVideo.createdAt,
      publishedAtFormatted: this.formatTimeAgo(localVideo.uploadedAt || localVideo.createdAt),
      category: localVideo.category || 'Entertainment',
      tags: localVideo.tags || [],
      isLive: localVideo.isLive || false,
      isShort: localVideo.isShort || false,
      visibility: localVideo.visibility || 'public',
      source: 'local',
      metadata: {
        quality: localVideo.definition,
        definition: localVideo.contentDetails?.definition,
        captions: Boolean(localVideo.captions?.length || localVideo.subtitles?.length),
        language: localVideo.contentDetails?.caption,
        license: localVideo.license,
      },
    };
  }

  /**
   * Normalize YouTube video data to unified format
   */
  async normalizeYouTubeVideo(youtubeVideo: any, channelData?: any): Promise<UnifiedVideoMetadata> {
    console.log('normalizeYouTubeVideo - Full input data structure:', youtubeVideo);
    console.log('normalizeYouTubeVideo - Input data:', {
      videoId: youtubeVideo.id,
      channelTitle: youtubeVideo.snippet?.channelTitle,
      channelId: youtubeVideo.snippet?.channelId,
      title: youtubeVideo.snippet?.title,
      hasSnippet: !!youtubeVideo.snippet,
      snippetKeys: youtubeVideo.snippet ? Object.keys(youtubeVideo.snippet) : 'no snippet'
    });
    
    const viewCount = parseInt(youtubeVideo.statistics?.viewCount || '0', 10);
    const likeCount = parseInt(youtubeVideo.statistics?.likeCount || '0', 10);
    const dislikeCount = parseInt(youtubeVideo.statistics?.dislikeCount || '0', 10);
    const commentCount = parseInt(youtubeVideo.statistics?.commentCount || '0', 10);
    
    // Fetch channel data if not provided
    let channel = channelData;
    if (!channel && youtubeVideo.snippet?.channelId) {
      try {
        console.log(`Fetching channel data for channelId: ${youtubeVideo.snippet.channelId}`);
        channel = await youtubeService.fetchChannel(youtubeVideo.snippet.channelId);
        console.log('Fetched channel data:', channel);
      } catch (error) {
        console.warn('Failed to fetch channel data:', error);
      }
    }
    
    const subscriberCount = channel?.subscribers || 0;
    
    const normalizedVideo = {
      id: youtubeVideo.id,
      title: youtubeVideo.snippet?.title || '',
      description: youtubeVideo.snippet?.description || '',
      thumbnailUrl: this.selectBestThumbnail(youtubeVideo.snippet?.thumbnails),
      videoUrl: `https://www.youtube.com/watch?v=${youtubeVideo.id}`,
      views: viewCount,
      viewsFormatted: this.formatViews(viewCount),
      likes: likeCount,
      dislikes: dislikeCount,
      commentCount: commentCount,
      channel: {
        id: youtubeVideo.snippet?.channelId || '',
        name: youtubeVideo.snippet?.channelTitle || '',
        avatarUrl: channel?.avatarUrl || '',
        subscribers: subscriberCount,
        subscribersFormatted: this.formatSubscribers(subscriberCount),
        isVerified: channel?.isVerified || false,
      },
      duration: this.parseDuration(youtubeVideo.contentDetails?.duration || 'PT0S'),
      publishedAt: youtubeVideo.snippet?.publishedAt || '',
      publishedAtFormatted: this.formatTimeAgo(youtubeVideo.snippet?.publishedAt || ''),
      category: youtubeVideo.snippet?.categoryId || 'Entertainment',
      tags: youtubeVideo.snippet?.tags || [],
      isLive: youtubeVideo.snippet?.liveBroadcastContent === 'live',
      isShort: this.isShortVideo(youtubeVideo.contentDetails?.duration),
      visibility: this.mapYouTubeVisibility(youtubeVideo.status?.privacyStatus),
      source: 'youtube',
      metadata: {
        quality: youtubeVideo.contentDetails?.definition,
        definition: youtubeVideo.contentDetails?.definition,
        captions: youtubeVideo.contentDetails?.caption === 'true',
        language: youtubeVideo.snippet?.defaultLanguage || youtubeVideo.snippet?.defaultAudioLanguage,
        license: youtubeVideo.status?.license,
      },
    };
    
    console.log('normalizeYouTubeVideo - Final normalized data:', {
      id: normalizedVideo.id,
      channelName: normalizedVideo.channel.name,
      channelId: normalizedVideo.channel.id,
      title: normalizedVideo.title
    });
    
    return normalizedVideo;
  }

  /**
   * Normalize local channel data to unified format
   */
  normalizeLocalChannel(localChannel: LocalChannel): UnifiedChannelMetadata {
    return {
      id: localChannel.id,
      name: localChannel.name,
      handle: localChannel.handle,
      description: localChannel.description || '',
      avatarUrl: localChannel.avatarUrl,
      bannerUrl: localChannel.banner,
      subscribers: localChannel.subscribers || 0,
      subscribersFormatted: localChannel.subscriberCount || this.formatSubscribers(localChannel.subscribers || 0),
      videoCount: localChannel.videoCount || 0,
      totalViews: localChannel.totalViews || 0,
      isVerified: localChannel.isVerified || false,
      joinedDate: localChannel.joinedDate,
      country: localChannel.country,
      source: 'local',
    };
  }

  /**
   * Normalize YouTube channel data to unified format
   */
  normalizeYouTubeChannel(youtubeChannel: any): UnifiedChannelMetadata {
    const subscriberCount = parseInt(youtubeChannel.statistics?.subscriberCount || '0', 10);
    const videoCount = parseInt(youtubeChannel.statistics?.videoCount || '0', 10);
    const totalViews = parseInt(youtubeChannel.statistics?.viewCount || '0', 10);
    
    return {
      id: youtubeChannel.id,
      name: youtubeChannel.snippet?.title || '',
      handle: youtubeChannel.snippet?.customUrl,
      description: youtubeChannel.snippet?.description || '',
      avatarUrl: this.selectBestThumbnail(youtubeChannel.snippet?.thumbnails),
      bannerUrl: youtubeChannel.brandingSettings?.image?.bannerExternalUrl,
      subscribers: subscriberCount,
      subscribersFormatted: this.formatSubscribers(subscriberCount),
      videoCount: videoCount,
      totalViews: totalViews,
      isVerified: false, // Would need additional verification data
      joinedDate: youtubeChannel.snippet?.publishedAt,
      country: youtubeChannel.snippet?.country,
      source: 'youtube',
    };
  }

  /**
   * Batch normalize multiple videos from mixed sources
   */
  async normalizeVideosBatch(videos: Array<{ data: any; source: 'local' | 'youtube' }>): Promise<UnifiedVideoMetadata[]> {
    const normalized: UnifiedVideoMetadata[] = [];
    
    for (const { data, source } of videos) {
      try {
        if (source === 'local') {
          normalized.push(this.normalizeLocalVideo(data));
        } else if (source === 'youtube') {
          normalized.push(await this.normalizeYouTubeVideo(data));
        }
      } catch (error) {
        console.error(`Failed to normalize ${source} video:`, error);
        // Continue processing other videos
      }
    }
    
    return normalized;
  }

  // Utility methods

  private parseViewCount(views: string | number): number {
    if (typeof views === 'number') return views;
    if (typeof views === 'string') {
      // Remove commas and non-numeric characters except K, M, B
      const cleanViews = views.replace(/[^\d.KMB]/gi, '');
      const multiplier = cleanViews.toUpperCase();
      const num = parseFloat(cleanViews);
      
      if (multiplier.includes('B')) return Math.floor(num * 1000000000);
      if (multiplier.includes('M')) return Math.floor(num * 1000000);
      if (multiplier.includes('K')) return Math.floor(num * 1000);
      
      return parseInt(cleanViews, 10) || 0;
    }
    return 0;
  }

  private parseSubscriberCount(subscribers: string | number): number {
    if (typeof subscribers === 'number') return subscribers;
    return this.parseViewCount(subscribers);
  }

  private formatViews(count: number): string {
    if (count >= 1000000000) return `${(count / 1000000000).toFixed(1)}B views`;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
    return `${count} views`;
  }

  private formatSubscribers(count: number): string {
    if (count >= 1000000000) return `${(count / 1000000000).toFixed(1)}B subscribers`;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M subscribers`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K subscribers`;
    return `${count} subscribers`;
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

  private normalizeDuration(duration: string | number): string {
    if (typeof duration === 'number') {
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return duration || '0:00';
  }

  private parseDuration(isoDuration: string): string {
    // Parse ISO 8601 duration format (PT#H#M#S)
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private isShortVideo(duration?: string): boolean {
    if (!duration) return false;
    
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return false;
    
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    return totalSeconds <= 60; // YouTube Shorts are 60 seconds or less
  }

  private selectBestThumbnail(thumbnails: any): string {
    if (!thumbnails) return '';
    
    // Prefer higher quality thumbnails
    const priorities = ['maxres', 'standard', 'high', 'medium', 'default'];
    
    for (const quality of priorities) {
      if (thumbnails[quality]?.url) {
        return thumbnails[quality].url;
      }
    }
    
    return '';
  }

  private mapYouTubeVisibility(privacyStatus?: string): 'public' | 'unlisted' | 'private' {
    switch (privacyStatus) {
      case 'public':
        return 'public';
      case 'unlisted':
        return 'unlisted';
      case 'private':
        return 'private';
      default:
        return 'public';
    }
  }
}

// Export singleton instance
export const metadataNormalizationService = new MetadataNormalizationService();
export default metadataNormalizationService;
