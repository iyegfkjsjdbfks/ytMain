// Placeholder service to replace mockVideoService
// This provides test data for development while using YouTube API as primary source

// Test video data for development
const dummyVideos = [
  {
    id: 'test-1',
    title: 'Amazing Nature Documentary',
    description: 'Explore the wonders of nature in this stunning documentary.',
    thumbnailUrl: 'https://i.ytimg.com/vi/aqz-KE-bpKQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/aqz-KE-bpKQ',
    duration: '15:30',
    views: '2.5M views',
    likes: 45000,
    dislikes: 1200,
    uploadedAt: '2 weeks ago',
    channelId: 'nature-channel',
    channelName: 'Nature World',
    channelAvatarUrl: 'https://yt3.ggpht.com/a/default-user=s88-c-k-c0x00ffffff-no-rj',
    tags: ['nature', 'documentary', 'wildlife'],
    category: 'Education',
    isShort: false,
    visibility: 'public' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'test-2',
    title: 'Coding Tutorial: React Basics',
    description: 'Learn React fundamentals in this comprehensive tutorial.',
    thumbnailUrl: 'https://i.ytimg.com/vi/SqcY0GlETPk/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk',
    duration: '25:45',
    views: '1.2M views',
    likes: 28000,
    dislikes: 400,
    uploadedAt: '5 days ago',
    channelId: 'code-channel',
    channelName: 'Code Academy',
    channelAvatarUrl: 'https://yt3.ggpht.com/a/default-user=s88-c-k-c0x00ffffff-no-rj',
    tags: ['programming', 'react', 'tutorial'],
    category: 'Education',
    isShort: false,
    visibility: 'public' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'test-3',
    title: 'Quick Cooking Tip',
    description: 'Amazing cooking hack in 60 seconds!',
    thumbnailUrl: 'https://i.ytimg.com/vi/9x-5SfRaKZw/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/9x-5SfRaKZw',
    duration: '0:60',
    views: '500K views',
    likes: 15000,
    dislikes: 200,
    uploadedAt: '1 day ago',
    channelId: 'cooking-channel',
    channelName: 'Quick Recipes',
    channelAvatarUrl: 'https://yt3.ggpht.com/a/default-user=s88-c-k-c0x00ffffff-no-rj',
    tags: ['cooking', 'short', 'recipe'],
    category: 'Shorts',
    isShort: true,
    visibility: 'public' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'test-4',
    title: 'Tech Review: Latest Smartphone',
    description: 'Comprehensive review of the newest smartphone features.',
    thumbnailUrl: 'https://i.ytimg.com/vi/QaZJV25TzeM/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/QaZJV25TzeM',
    duration: '12:20',
    views: '800K views',
    likes: 22000,
    dislikes: 300,
    uploadedAt: '1 week ago',
    channelId: 'tech-channel',
    channelName: 'Tech Reviews',
    channelAvatarUrl: 'https://yt3.ggpht.com/a/default-user=s88-c-k-c0x00ffffff-no-rj',
    tags: ['technology', 'review', 'smartphone'],
    category: 'Science & Technology',
    isShort: false,
    visibility: 'public' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const getVideos = async () => dummyVideos;
export const getVideoById = async (id: string) => dummyVideos.find(v => v.id === id) || null;
export const getShortsVideos = async () => dummyVideos.filter(v => v.isShort);
export const getVideosByCategory = async (category: string) => dummyVideos.filter(v => v.category === category);
export const searchVideos = async (query: string) => dummyVideos.filter(v => 
  v.title.toLowerCase().includes(query.toLowerCase()) || 
  v.description.toLowerCase().includes(query.toLowerCase())
);
export const getChannels = async () => [];
export const getChannelById = async (_id: string) => null;
export const getChannelByName = async (_name: string) => null;
export const getVideosByChannelName = async (_name: string) => [];
export const getChannelPlaylists = async (_name: string) => [];
export const getChannelCommunityPosts = async (_name: string) => [];
export const getCommentsByVideoId = async (_videoId: string) => [];
export const getPlaylists = async () => [];
export const getCommunityPosts = async () => [];
export const getUserPlaylists = async () => [];
export const getUserPlaylistById = async (_id: string) => null;
export const getWatchHistoryVideos = async () => dummyVideos.slice(0, 2);
export const getLikedVideos = async () => dummyVideos.slice(1, 3);
export const getWatchLaterVideos = async () => dummyVideos.slice(0, 3);
export const getRecentSearches = async () => ['nature', 'coding', 'cooking'];
export const clearAllRecentSearches = async () => {};

// Default video data service
export default {
  getVideos,
  getVideoById,
  getShortsVideos,
  searchVideos,
  getChannels,
  getVideosByChannelName,
};
export const createUserPlaylist = async (name: string) => ({ id: '1', title: name, videoIds: [], videoCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
export const removeVideoFromPlaylist = async (_playlistId: string, _videoId: string) => {};
export const updateUserPlaylistDetails = async (_id: string, _details: any) => {};
export const getSubscribedChannelNames = async () => ['Nature World', 'Code Academy'];
export const getSubscribedChannels = async () => [];
export const updateSubscriptionNotifications = async (_channelId: string, _enabled: boolean) => {};
export const unsubscribeFromChannel = async (_channelId: string) => {};
export const getSearchSuggestions = async (query: string) => ['nature', 'coding', 'cooking'].filter(s => s.includes(query.toLowerCase()));
export const removeRecentSearch = async (_search: string) => [];
export const saveRecentSearch = async (_query: string) => {};
export const uploadVideo = async (_data: any, _onProgress?: any) => ({ percentage: 100, status: 'completed', message: 'Upload completed' });

// Export dummy videos for compatibility
export const mockVideos = dummyVideos;
