// Real Video Data Service
// This service provides actual video data with playable video files

import type { Video } from '../types';
import type { VideoUploadData, UploadProgress } from '../types';

// Sample real videos with actual playable content from Google's sample videos
const sampleVideos = [
  {
    id: 'sample-1',
    title: 'Big Buck Bunny',
    description: 'A short computer-animated comedy film featuring a giant rabbit. Created by the Blender Foundation as an open-source project.',
    thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '9:56',
    views: '1.2M views',
    likes: 15000,
    dislikes: 200,
    uploadedAt: '2 weeks ago',
    channelId: 'blender-foundation',
    channelName: 'Blender Foundation',
    channelAvatarUrl: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=BF',
    tags: ['animation', 'short film', 'comedy'],
    category: 'Entertainment',
    isShort: false,
    visibility: 'public' as const, createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString() },
  {
    id: 'sample-2',
    title: 'Elephant Dream',
    description: 'The first open movie made entirely with open source graphics software. A surreal journey through a mechanical world.',
    thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '10:53',
    views: '890K views',
    likes: 12000,
    dislikes: 150,
    uploadedAt: '1 week ago',
    channelId: 'blender-foundation',
    channelName: 'Blender Foundation',
    channelAvatarUrl: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=BF',
    tags: ['animation', 'open source', 'experimental'],
    category: 'Film & Animation',
    isShort: false,
    visibility: 'public' as const, createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString() },
  {
    id: 'sample-3',
    title: 'For Bigger Blazes',
    description: 'A sample video showcasing high-quality video streaming capabilities.',
    thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '0:15',
    views: '2.1M views',
    likes: 25000,
    dislikes: 300,
    uploadedAt: '3 days ago',
    channelId: 'sample-channel',
    channelName: 'Sample Videos',
    channelAvatarUrl: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=SV',
    tags: ['sample', 'demo', 'short'],
    category: 'Entertainment',
    isShort: true,
    visibility: 'public' as const, createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString() },
  {
    id: 'sample-4',
    title: 'For Bigger Escape',
    description: 'Another sample video for testing video playback functionality with beautiful scenery.',
    thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration: '0:15',
    views: '1.8M views',
    likes: 20000,
    dislikes: 250,
    uploadedAt: '5 days ago',
    channelId: 'sample-channel',
    channelName: 'Sample Videos',
    channelAvatarUrl: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=SV',
    tags: ['sample', 'demo', 'escape'],
    category: 'Entertainment',
    isShort: true,
    visibility: 'public' as const, createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString() },
  {
    id: 'sample-5',
    title: 'Sintel',
    description: 'A fantasy short film about a girl named Sintel who is searching for her baby dragon. Another Blender Foundation masterpiece.',
    thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    duration: '14:48',
    views: '3.5M views',
    likes: 45000,
    dislikes: 400,
    uploadedAt: '1 month ago',
    channelId: 'blender-foundation',
    channelName: 'Blender Foundation',
    channelAvatarUrl: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=BF',
    tags: ['animation', 'fantasy', 'short film'],
    category: 'Film & Animation',
    isShort: false,
    visibility: 'public' as const, createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString() },
  {
    id: 'sample-6',
    title: 'Tears of Steel',
    description: 'A sci-fi short film about a group of warriors and scientists in a dystopian future.',
    thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration: '12:14',
    views: '2.8M views',
    likes: 35000,
    dislikes: 350,
    uploadedAt: '2 months ago',
    channelId: 'blender-foundation',
    channelName: 'Blender Foundation',
    channelAvatarUrl: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=BF',
    tags: ['sci-fi', 'animation', 'dystopian'],
    category: 'Film & Animation',
    isShort: false,
    visibility: 'public' as const, createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString() }];

// Video service functions
export const getVideos = async (): Promise<void> => sampleVideos;
export const getVideoById = async (id: string) => sampleVideos.find(v => v.id === id) || null;
export const getShortsVideos = async (): Promise<void> => sampleVideos.filter((v: any) => v.isShort);
export const getVideosByCategory = async (category: any) => sampleVideos.filter((v: any) => v.category === category);
export const searchVideos = async (query: any) => sampleVideos.filter((v: any) =>
  v.title.toLowerCase().includes(query.toLowerCase()) ||
  v.description.toLowerCase().includes(query.toLowerCase()),
);

// Channel and playlist functions (simplified for now)
export const getChannels = async (): Promise<void> => [];
export const getChannelById = async (_id: any) => null;
export const getChannelByName = async (_name: any) => null;
export const getVideosByChannelName = async (_name: any) => [];
export const getChannelPlaylists = async (_name: any) => [];
export const getChannelCommunityPosts = async (_name: any) => [];
export const getCommentsByVideoId = async (_videoId: any) => [];
export const getPlaylists = async (): Promise<void> => [];
export const getCommunityPosts = async (): Promise<void> => [];
export const getUserPlaylists = async (): Promise<void> => [];
export const getUserPlaylistById = async (_id: any) => null;

// User interaction functions
export const getWatchHistoryVideos = async (): Promise<void> => sampleVideos.slice(0, 3);
export const getLikedVideos = async (): Promise<void> => sampleVideos.slice(1, 4);
export const getWatchLaterVideos = async (): Promise<void> => sampleVideos.slice(0, 4);
export const getRecentSearches = async (): Promise<void> => ['animation', 'blender', 'short film'];
export const clearAllRecentSearches = async (): Promise<void> => {};

// Search functions
export const getSearchSuggestions = async (query: any) =>
  ['animation', 'blender', 'short film', 'sample video'].filter((s: any) => s.includes(query.toLowerCase()));
export const removeRecentSearch = async (_search: any) => [];
export const saveRecentSearch = async (_query: any): Promise<any> => {};

// Upload simulation
export const uploadVideo = async (_data: VideoUploadData, onProgress?: (progress: UploadProgress) => void): Promise<void> => {
  const progressSteps = [
    { percentage: 0, status: 'uploading' as const, message: 'Starting upload...' },
    { percentage: 25, status: 'uploading' as const, message: 'Uploading video file...' },
    { percentage: 50, status: 'uploading' as const, message: 'Processing video...' },
    { percentage: 75, status: 'processing' as const, message: 'Generating thumbnail...' },
    { percentage: 100, status: 'completed' as const, message: 'Upload completed successfully!' }];

  for (const step of progressSteps) {
    if (onProgress as any) {
      onProgress(step);
    }
    await new Promise(resolve => setTimeout((resolve) as any, 500));
  }
};

// Default export
export default {
  getVideos,
  getVideoById,
  getShortsVideos,
  searchVideos,
  getChannels,
  getVideosByChannelName };

// Playlist management functions (simplified for now)
export const removeVideoFromPlaylist = async (_playlistId: any, _videoId: any): Promise<any> => {};
export const updateUserPlaylistDetails = async (_playlistId: any, _details: any): Promise<any> => {};

// Subscription management functions (simplified for now)
export const getSubscribedChannels = async (): Promise<void> => [];
export const updateSubscriptionNotifications = async (_channelId: any, _enabled: any): Promise<any> => {};
export const unsubscribeFromChannel = async (_channelId: any): Promise<any> => {};

// Playlist creation function (simplified for now)
export const createUserPlaylist = async (_name: any, _description?: string) => ({
  id: `playlist-${Date.now()}`,
  name: _name,
  description: _description || '',
  videos: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString() });

// Export sample videos for compatibility
export const realVideos = sampleVideos;
export const getSubscribedChannelNames = async (): Promise<void> => ['blender-foundation', 'sample-channel'];
