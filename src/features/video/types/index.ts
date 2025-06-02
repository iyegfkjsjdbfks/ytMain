/**
 * Video feature type definitions
 */

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  likes: number;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
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
