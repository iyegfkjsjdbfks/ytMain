
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
  channelName: string;
  channelAvatarUrl: string;
  views: string;
  uploadedAt: string;
  duration: string;
  videoUrl: string;
  description: string;
  category: string; // Added category
  isShort?: boolean;
  // Optional properties for live streams
  isLiveNow?: boolean;
  scheduledStartTime?: string; // ISO date string
  viewerCount?: string;
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
