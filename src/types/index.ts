export interface VideoItem {
  id: string;
  title: string;
  channelName: string;
  channelId: string;
  thumbnailUrl: string;
  viewCount: number;
  publishedAt: Date;
  duration: number;
  avatarUrl?: string;
}

export interface VideoCardProps extends VideoItem {
  showChannelInfo?: boolean;
  className?: string;
  onMoreClick: (videoId: any) => void;
}

export interface VideoGridProps {
  videos: VideoItem;
  className?: string;
  loading?: boolean;
  skeletonCount?: number;
  onVideoMoreClick: (videoId: any) => void;
}

// Re-export all types for convenience
export * from './video';
// Add more type exports here as needed
