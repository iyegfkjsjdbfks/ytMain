/**
 * Mock Real Video Service
 * This is a placeholder service for testing purposes
 */

export interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: string;
  views?: number;
  category?: string;
  isShort?: boolean;
  isLive?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  avatarUrl?: string;
  description?: string;
}

export const getVideos = async (): Promise<Video[]> => {
  // Mock implementation - returns empty array
  return [];
};

export const getShortsVideos = async (): Promise<Video[]> => {
  // Mock implementation - returns empty array
  return [];
};

export const getVideosByCategory = async (_category: string): Promise<Video[]> => {
  // Mock implementation - returns empty array
  return [];
};

export const searchVideos = async (_query: string): Promise<Video[]> => {
  // Mock implementation - returns empty array
  return [];
};

export const getVideoById = async (_id: string): Promise<Video | null> => {
  // Mock implementation - returns null
  return null;
};

export const getChannelById = async (_id: string): Promise<Channel | null> => {
  // Mock implementation - returns null
  return null;
};
