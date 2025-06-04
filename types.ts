
// Define interfaces for PlaylistSummary and CommunityPost first as Channel uses them
export interface PlaylistSummary {
  id: string;
  title: string;
  videoCount: number;
  thumbnailUrl?: string;
}

export interface CommunityPost {
  id: string;
  channelName: string;
  channelAvatarUrl: string;
  timestamp: string;
  textContent: string; 
  imageUrl?: string;
  likes: number;
  commentsCount: number;
}

export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  thumbnail?: string; // Alternative to thumbnailUrl
  channelName: string;
  channelAvatarUrl: string;
  channelAvatar?: string; // Alternative to channelAvatarUrl
  views: string;
  viewCount?: number; // Alternative to views as string
  uploadedAt: string;
  duration: string;
  videoUrl: string;
  description: string;
  category: string;
  isShort?: boolean;
  isLiveNow?: boolean;
  scheduledStartTime?: string; // ISO date string
  viewerCount?: string;
  likes?: number;
  dislikes?: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  isSaved?: boolean;
  commentCount?: number;
  tags?: string[];
  privacyStatus?: 'public' | 'private' | 'unlisted';
  publishedAt?: string; // ISO date string
  createdAt?: string; // ISO date string
  visibility?: 'public' | 'private' | 'unlisted';
  channelId?: string;
  // Additional metadata
  aspectRatio?: number;
  definition?: 'hd' | 'sd';
  dimension?: '2d' | '3d';
  caption?: boolean;
  licensedContent?: boolean;
  contentRating?: Record<string, any>;
  projection?: 'rectangular' | '360' | '3d';
  // Engagement
  likeCount?: number;
  favoriteCount?: number;
  // Status
  uploadStatus?: 'deleted' | 'failed' | 'processed' | 'rejected' | 'uploaded';
  failureReason?: string;
  rejectionReason?: string;
  // Monetization
  monetizationDetails?: {
    access?: {
      allowed: boolean;
      exception?: string[];
    };
    monetizationStatus?: 'monetized' | 'ineligible' | 'limited';
    adFormats?: string[];
  };
  // Localization
  defaultAudioLanguage?: string;
  defaultLanguage?: string;
  localized?: {
    title: string;
    description: string;
  };
}

export interface Channel {
  id: string;
  name: string;
  avatarUrl: string;
  subscribers: string;
  joinDate?: string; // Added
  totalViews?: string; // Added
  channelDescription?: string; // Added
  playlists?: PlaylistSummary[];
  communityPosts?: CommunityPost[];
}

export interface Comment {
  id: string;
  userAvatarUrl: string;
  userName: string;
  commentText: string;
  timestamp: string;
  likes: number;
  isLikedByCurrentUser?: boolean;
  isDislikedByCurrentUser?: boolean; // Added for UI state
  isEdited?: boolean; // To mark edited comments
  parentId?: string; // ID of the comment this is a reply to
  replies?: Comment[]; // Array of nested replies
  replyCount?: number; // Number of direct replies
  replyTo?: string; // Username of the person being replied to (e.g., "@username")
}

// User-specific playlists
export interface UserPlaylist {
  id: string;
  title: string;
  description?: string;
  videoIds: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface UserPlaylistDetails extends UserPlaylist {
  videoCount: number;
  thumbnailUrl?: string; // Thumbnail of the first video, or a default
}

// For AI Content Spark feature
export interface VideoIdeaResponse {
  ideas: string[];
  error?: string;
}

export interface VideoUploadData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  visibility: 'public' | 'unlisted' | 'private';
  videoFile: File | null;
  thumbnailFile: File | null;
  isShorts: boolean;
}

export interface UploadProgress {
  percentage: number;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  message: string;
}

// Type alias for shorts (videos with isShort: true)
export type Short = Omit<Video, 'isShort'> & {
  isShort: true;
  isVertical?: boolean;
  // Additional Short-specific properties
  musicInfo?: {
    title: string;
    artist: string;
    coverUrl?: string;
  };
  // Engagement metrics specific to Shorts
  shares?: number;
  saves?: number;
  // Shorts-specific features
  hasCaptions?: boolean;
  hasAudio?: boolean;
  // Analytics
  viewDuration?: number; // Average view duration in seconds
  swipeAwayRate?: number; // Percentage of viewers who swiped away
  // Additional metadata
  createdTime?: string;
  modifiedTime?: string;
  // Privacy and status
  visibility?: 'public' | 'private' | 'unlisted';
  // Monetization
  isMonetized?: boolean;
  // Interactive elements
  hasInteractiveElements?: boolean;
  // Thumbnail variants
  thumbnailOverlays?: {
    type: 'text' | 'image' | 'time';
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    style?: Record<string, any>;
  }[];
};
