/**
 * Video feature type definitions
 */

export interface Channel {
  id: string;
  name: string;
  avatarUrl?: string;
  subscribers?: number;
  isVerified?: boolean;
}

export type VideoVisibility = 'public' | 'unlisted' | 'private';

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  likes: number;
  createdAt: string;
  publishedAt?: string;
  visibility: VideoVisibility;
  channel: Channel;
  // Keeping these for backward compatibility
  channelId?: string;
  channelTitle?: string;
  channelThumbnail?: string;
}

export interface VideoMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTime: number;
}

export interface VideoPlaybackState {
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  playbackRate: number;
  quality: string;
}

export type VideoCategory = 'all' | 'music' | 'gaming' | 'news' | 'sports' | 'learning' | 'entertainment';
