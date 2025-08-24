// Export all video-related types
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  channelId: string;
  channelName: string;
  publishedAt: string;
  tags: string[];
  category: string;
  isLive: boolean;
}

export interface VideoMetadata {
  title: string;
  description: string;
  tags: string[];
  category: string;
  privacy: 'public' | 'private' | 'unlisted';
  thumbnail?: File;
}

export interface VideoUploadProgress {
  uploadId: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackRate: number;
}

export interface VideoComment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likeCount: number;
  replyCount: number;
  replies?: VideoComment[];
}

export interface VideoQuality {
  label: string;
  value: string;
  resolution: string;
  bitrate: number;
}

export type VideoSortOption = 'newest' | 'oldest' | 'popular' | 'trending';
export type VideoFilterOption = 'all' | 'today' | 'week' | 'month' | 'year';
export type VideoCategory = 'music' | 'gaming' | 'sports' | 'news' | 'education' | 'entertainment' | 'technology' | 'other';