/**
 * Video feature type definitions
 */

// Re-export types from core to avoid conflicts
export type { Video, VideoVisibility } from '../../../types/core';

export interface Channel {
  id: string;
  name: string;
  avatarUrl?: string;
  subscribers?: number;
  isVerified?: boolean;
}

export interface VideoMetrics {
  views: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  watchTime: number;
  averageViewDuration: number;
  subscribersGained: number;
  subscribersLost: number
}

export interface VideoEngagement {
  watchTime: number;
  averageViewDuration: number;
  averageViewPercentage: number;
  audienceRetention: number;
  impressions: number;
  impressionsClickThroughRate: number;
  cards: {
    cardsShown: number;
    cardClicks: number;
    cardTeaserClicks: number;
    cardTeaserImpressions: number
  };
  endScreen: {
    endScreenShown: number;
    endScreenClicks: number
  };
}

export interface VideoStats {
  views: number;
  watchTime: number;
  averageViewDuration: number;
  averageViewPercentage: number;
  subscribersGained: number;
  subscribersLost: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  estimatedMinutesWatched: number;
  estimatedRedMinutesWatched: number;
  annotationClickThroughRate: number;
  annotationCloseRate: number;
  annotationImpressions: number;
  annotationClickableImpressions: number;
  annotationClosableImpressions: number;
  annotationClicks: number;
  annotationCloses: number;
  cardImpressions: number;
  cardClicks: number;
  cardTeaserClicks: number;
  cardTeaserImpressions: number;
  endScreenElementImpressions: number;
  endScreenElementClicks: number;
  endScreenElementClickThroughRate: number
}

export interface VideoPlaybackState {
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  playbackRate: number;
  quality: string;
  isMuted: boolean;
  isFullscreen: boolean;
  isTheaterMode: boolean;
  isMiniPlayer: boolean;
  isPictureInPicture: boolean;
  buffered: TimeRanges | null;
  duration: number;
  error: MediaError | null
}

export type VideoCategory =
  | 'all'
  | 'music'
  | 'gaming'
  | 'news'
  | 'sports'
  | 'learning'
  | 'entertainment';
