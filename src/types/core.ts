// Core type definitions - unified interface
export interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  duration: string;
  views: number;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
  category?: string;
  // Additional properties for compatibility
  videoUrl?: string;
  likes?: number;
  dislikes?: number;
  uploadedAt?: string;
}

export interface Short extends Video {
  isShort: true;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Channel {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  subscriberCount: number;
  videoCount: number;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  videoCount: number;
  channelId: string;
  channelTitle: string;
}

export interface Comment {
  id: string;
  text: string;
  authorName: string;
  authorAvatar?: string;
  publishedAt: string;
  likeCount: number;
  replies?: Comment[];
}

export interface VideoItem extends Video {
  // Additional properties for video grid items
}

// Re-export for compatibility
export type { Video as CoreVideo };
