
// Mock video service with working video URLs
import { Video, Channel, Comment } from '../src/types/core';
import { PlaylistSummary, CommunityPost, UserPlaylistDetails, VideoUploadData, UploadProgress } from '../types';
// Removed unused imports

// Helper function to create complete video objects
const ___createMockVideo = (partial: Partial<Video>): Video => ({
  likes: 0,
  dislikes: 0,
  channelId: 'default-channel',
  tags: [],
  visibility: 'public' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...partial,
  id: partial.id || `video-${Date.now()}`,
  title: partial.title || 'Untitled Video',
  thumbnailUrl: partial.thumbnailUrl || 'https://picsum.photos/320/180',
  videoUrl: partial.videoUrl || 'https://example.com/video.mp4',
  duration: partial.duration || '10:00',
  views: partial.views || '0',
  channelName: partial.channelName || 'Unknown Channel',
  channelAvatarUrl: partial.channelAvatarUrl || 'https://picsum.photos/40/40',
  uploadedAt: partial.uploadedAt || new Date().toISOString(),
  description: partial.description || 'No description available',
  category: partial.category || 'Entertainment'
});

// Curated mock videos - removed duplicates and kept diverse, unique content
const mockVideos: Video[] = [
  // Travel & Nature
  ___createMockVideo({
    id: '1',
    title: 'Exploring the Alps: A Scenic Journey',
    thumbnailUrl: 'https://picsum.photos/seed/alps/680/380',
    channelName: 'Nature Explorers',
    channelAvatarUrl: 'https://picsum.photos/seed/channel1/48/48',
    channelId: 'channel1',
    views: '1.2M views',
    uploadedAt: '2 weeks ago',
    duration: '12:34',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'A breathtaking journey through the Swiss Alps, showcasing stunning landscapes and wildlife.',
    category: 'Travel',
    isShort: false,
    likes: 12000,
    dislikes: 150,
    tags: ['travel', 'alps', 'nature', 'scenic']
  }),

  // Gaming & Tech
  ___createMockVideo({
    id: '2',
    title: 'Ultimate Gaming Setup Tour 2024',
    thumbnailUrl: 'https://picsum.photos/seed/gaming/680/380',
    channelName: 'TechLevelUp',
    channelAvatarUrl: 'https://picsum.photos/seed/channel2/48/48',
    channelId: 'channel2',
    views: '870K views',
    uploadedAt: '5 days ago',
    duration: '22:10',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Check out my ultimate gaming setup for 2024!',
    category: 'Gaming',
    isShort: false,
    likes: 8700,
    dislikes: 120,
    tags: ['gaming', 'setup', 'tech', '2024']
  }),

  // Cooking
  ___createMockVideo({
    id: '3',
    title: 'Delicious & Easy Pasta Recipe',
    thumbnailUrl: 'https://picsum.photos/seed/pasta/680/380',
    channelName: 'Chef Studio',
    channelAvatarUrl: 'https://picsum.photos/seed/channel3/48/48',
    channelId: 'channel3',
    views: '2.5M views',
    uploadedAt: '1 month ago',
    duration: '8:15',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Learn how to make a delicious and easy pasta dish.',
    category: 'Cooking',
    isShort: false,
    likes: 25000,
    dislikes: 300,
    tags: ['cooking', 'pasta', 'recipe', 'easy']
  }),

  // Programming Education
  ___createMockVideo({
    id: '4',
    title: 'Building a Modern React App from Scratch',
    thumbnailUrl: 'https://picsum.photos/seed/react/680/380',
    channelName: 'CodeMaster Pro',
    channelAvatarUrl: 'https://picsum.photos/seed/channel4/48/48',
    channelId: 'channel4',
    views: '450K views',
    uploadedAt: '1 week ago',
    duration: '45:22',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Complete tutorial on building a modern React application with TypeScript and best practices.',
    category: 'Education',
    isShort: false,
    likes: 4500,
    dislikes: 50,
    tags: ['react', 'typescript', 'tutorial', 'programming']
  }),

  // Fitness
  ___createMockVideo({
    id: '5',
    title: 'Morning Workout Routine - 15 Minutes',
    thumbnailUrl: 'https://picsum.photos/seed/workout/680/380',
    channelName: 'FitLife Daily',
    channelAvatarUrl: 'https://picsum.photos/seed/channel5/48/48',
    channelId: 'channel5',
    views: '3.2M views',
    uploadedAt: '4 days ago',
    duration: '15:30',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Start your day right with this energizing 15-minute morning workout routine.',
    category: 'Sports',
    isShort: false,
    likes: 32000,
    dislikes: 200,
    tags: ['workout', 'fitness', 'morning', 'exercise']
  }),

  // Science
  ___createMockVideo({
    id: '6',
    title: 'The Science Behind Black Holes',
    thumbnailUrl: 'https://picsum.photos/seed/blackhole/680/380',
    channelName: 'Space Academy',
    channelAvatarUrl: 'https://picsum.photos/seed/channel6/48/48',
    channelId: 'channel6',
    views: '1.8M views',
    uploadedAt: '3 weeks ago',
    duration: '28:45',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Dive deep into the fascinating world of black holes and their impact on space-time.',
    category: 'Science',
    isShort: false,
    likes: 18000,
    dislikes: 100,
    tags: ['science', 'space', 'blackholes', 'physics']
  }),

  // Music Education
  ___createMockVideo({
    id: '7',
    title: 'Guitar Lesson: Master the Pentatonic Scale',
    thumbnailUrl: 'https://picsum.photos/seed/guitar/680/380',
    channelName: 'Music Theory Hub',
    channelAvatarUrl: 'https://picsum.photos/seed/channel7/48/48',
    channelId: 'channel7',
    views: '680K views',
    uploadedAt: '1 week ago',
    duration: '18:12',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Learn to master the pentatonic scale with practical exercises and tips.',
    category: 'Music',
    isShort: false,
    likes: 6800,
    dislikes: 80,
    tags: ['music', 'guitar', 'tutorial', 'scales']
  }),

  // Photography
  ___createMockVideo({
    id: '8',
    title: 'Photography Tips: Golden Hour Portraits',
    thumbnailUrl: 'https://picsum.photos/seed/photography/680/380',
    channelName: 'Photo Pro Tips',
    channelAvatarUrl: 'https://picsum.photos/seed/channel8/48/48',
    channelId: 'channel8',
    views: '890K views',
    uploadedAt: '5 days ago',
    duration: '14:30',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Master the art of golden hour portrait photography with these professional tips.',
    category: 'Photography',
    isShort: false,
    likes: 8900,
    dislikes: 90,
    tags: ['photography', 'portraits', 'goldenhour', 'tips']
  }),

  // SHORTS - Diverse short-form content
  ___createMockVideo({
    id: 's1',
    title: 'Amazing Basketball Trick Shot',
    thumbnailUrl: 'https://picsum.photos/seed/basketball/380/680',
    channelName: 'Sports Highlights',
    channelAvatarUrl: 'https://picsum.photos/seed/sports/48/48',
    channelId: 'channel-sports',
    views: '5.3M views',
    uploadedAt: '1 day ago',
    duration: '0:30',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Incredible basketball trick shot! #shorts #basketball #sports',
    category: 'Shorts',
    isShort: true,
    likes: 53000,
    dislikes: 200,
    tags: ['shorts', 'basketball', 'sports', 'trickshot']
  }),

  ___createMockVideo({
    id: 's2',
    title: 'Funny Cat Compilation',
    thumbnailUrl: 'https://picsum.photos/seed/cats/380/680',
    channelName: 'Pet Comedy',
    channelAvatarUrl: 'https://picsum.photos/seed/pets/48/48',
    channelId: 'channel-pets',
    views: '10.1M views',
    uploadedAt: '6 hours ago',
    duration: '0:45',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Hilarious cat moments that will make you laugh! #shorts #cats #funny',
    category: 'Shorts',
    isShort: true,
    likes: 101000,
    dislikes: 500,
    tags: ['shorts', 'cats', 'funny', 'pets']
  }),

  ___createMockVideo({
    id: 's3',
    title: 'Quick Cooking Hack',
    thumbnailUrl: 'https://picsum.photos/seed/cookinghack/380/680',
    channelName: 'Kitchen Hacks',
    channelAvatarUrl: 'https://picsum.photos/seed/kitchen/48/48',
    channelId: 'channel-kitchen',
    views: '2.8M views',
    uploadedAt: '2 days ago',
    duration: '0:35',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'This cooking hack will save you time! #shorts #cooking #lifehack',
    category: 'Shorts',
    isShort: true,
    likes: 28000,
    dislikes: 150,
    tags: ['shorts', 'cooking', 'lifehack', 'kitchen']
  }),

  ___createMockVideo({
    id: 's4',
    title: 'Dance Challenge Moves',
    thumbnailUrl: 'https://picsum.photos/seed/dance/380/680',
    channelName: 'Dance Trends',
    channelAvatarUrl: 'https://picsum.photos/seed/dance/48/48',
    channelId: 'channel-dance',
    views: '15.2M views',
    uploadedAt: '2 hours ago',
    duration: '0:30',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Learn the latest viral dance moves! #shorts #dance #viral',
    category: 'Shorts',
    isShort: true,
    likes: 152000,
    dislikes: 800,
    tags: ['shorts', 'dance', 'viral', 'trending']
  })
];

// Export functions
export const getVideos = (): Promise<Video[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockVideos), 100);
  });
};

// Helper function to convert YouTube search result to Video object
const createYouTubeVideoObject = (youtubeId: string): Video => {
  // Extract actual YouTube video ID by removing 'youtube-' prefix if present
  const actualYouTubeId = youtubeId.startsWith('youtube-') ? youtubeId.substring(8) : youtubeId;
  
  return {
    id: youtubeId,
    title: 'YouTube Video',
    description: 'This is a YouTube video playing within the app.',
    thumbnailUrl: `https://img.youtube.com/vi/${actualYouTubeId}/maxresdefault.jpg`,
    duration: '0:00',
    views: '0',
    likes: 0,
    dislikes: 0,
    videoUrl: `https://www.youtube.com/embed/${actualYouTubeId}`,
    channelId: 'youtube-channel',
    channelName: 'YouTube',
    channelAvatarUrl: '/youtube-avatar.png',
    tags: ['youtube'],
    category: 'entertainment',
    visibility: 'public' as const,
    monetization: {} as any,
    analytics: {} as any,


    uploadedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isShort: false
  };
};

export const getVideoById = (id: string): Promise<Video | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // First check if it's a local video
      const localVideo = mockVideos.find(v => v.id === id);
      if (localVideo) {
        resolve(localVideo);
        return;
      }
      
      // If not found in local videos, treat as YouTube video ID
      // YouTube video IDs are typically 11 characters long
      if (id && id.length >= 10) {
        const youtubeVideo = createYouTubeVideoObject(id);
        resolve(youtubeVideo);
      } else {
        resolve(null);
      }
    }, 100);
  });
};

export const getShortsVideos = (): Promise<Video[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const shorts = mockVideos.filter(video => video.isShort);
      resolve(shorts);
    }, 100);
  });
};

export const getVideosByCategory = (category: string): Promise<Video[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = mockVideos.filter(video => video.category === category);
      resolve(filtered);
    }, 100);
  });
};

export const searchVideos = (query: string): Promise<Video[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = mockVideos.filter(video => 
        video.title.toLowerCase().includes(query.toLowerCase()) ||
        video.description.toLowerCase().includes(query.toLowerCase())
      );
      resolve(filtered);
    }, 100);
  });
};

// Mock channels data
const mockChannels: Channel[] = [
  {
    id: 'channel1',
    name: 'Nature Explorers',
    avatarUrl: 'https://picsum.photos/seed/channel1/120/120',
    subscribers: 2500000,
    subscriberCount: '2.5M',
    videoCount: 156,
    description: 'Exploring the world\'s most beautiful natural landscapes.',
    isVerified: true,
    joinedDate: 'Jan 15, 2018',
    createdAt: '2018-01-15T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export const getChannels = (): Promise<Channel[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockChannels), 100);
  });
};

export const getChannelById = (id: string): Promise<Channel | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const channel = mockChannels.find(c => c.id === id) || null;
      resolve(channel);
    }, 100);
  });
};

// Mock comments
const mockComments: Comment[] = [
  {
    id: 'comment1',
    userAvatarUrl: 'https://picsum.photos/seed/user1/40/40',
    userName: 'John Doe',
    commentText: 'Amazing video! The scenery is breathtaking.',
    timestamp: '2 hours ago',
    likes: 42,
    replies: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isLikedByCurrentUser: false,
    isDislikedByCurrentUser: false,
    isEdited: false,
    replyCount: 0,
    videoId: 'video-1',
    authorId: 'user-1',
    authorName: 'John Doe',
    authorAvatar: 'https://picsum.photos/seed/user1/40/40',
    content: 'Amazing video! The scenery is breathtaking.',
    dislikes: 2,
    isPinned: false,
    isHearted: false
  }
];

export const getCommentsByVideoId = (_videoId: string): Promise<Comment[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return all mock comments for any video ID
      resolve(mockComments);
    }, 100);
  });
};

// Additional mock functions for completeness
export const getPlaylists = (): Promise<PlaylistSummary[]> => {
  return Promise.resolve([]);
};

export const getCommunityPosts = (): Promise<CommunityPost[]> => {
  return Promise.resolve([]);
};

export const getUserPlaylists = (): Promise<UserPlaylistDetails[]> => {
  return Promise.resolve([]);
};

export const getUserPlaylistById = (_id: string): Promise<UserPlaylistDetails & { videos: Video[] } | null> => {
  // Return a mock playlist with videos for testing
  return Promise.resolve({
    id: 'playlist-1',
    title: 'My Playlist',
    description: 'A sample playlist',
    videoIds: ['video-1', 'video-2'],
    videoCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    videos: [
      {
        id: 'video-1',
        title: 'Sample Video 1',
        description: 'A sample video',
        thumbnailUrl: 'https://picsum.photos/320/180?random=1',
        videoUrl: 'https://example.com/video1.mp4',
        duration: '5:30',
        views: '1,234',
        likes: 100,
        dislikes: 5,
        uploadedAt: '2 days ago',
        channelName: 'Sample Channel',
        channelId: 'channel-1',
        channelAvatarUrl: 'https://picsum.photos/40/40?random=1',
        category: 'Entertainment',
        tags: ['sample', 'video'],
        visibility: 'public' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'video-2',
        title: 'Sample Video 2',
        description: 'Another sample video',
        thumbnailUrl: 'https://picsum.photos/320/180?random=2',
        videoUrl: 'https://example.com/video2.mp4',
        duration: '3:45',
        views: '5,678',
        likes: 200,
        dislikes: 10,
        uploadedAt: '1 week ago',
        channelName: 'Sample Channel',
        channelId: 'channel-1',
        channelAvatarUrl: 'https://picsum.photos/40/40?random=1',
        category: 'Education',
        tags: ['sample', 'tutorial'],
        visibility: 'public' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ]
  });
};

export const uploadVideo = (
  data: VideoUploadData, 
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadProgress> => {
  return new Promise((resolve, reject) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5; // Random progress between 5-20%
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Simulate saving the video
        const newVideo: Video = {
          id: `video-${Date.now()}`,
          title: data.title,
          thumbnailUrl: data.thumbnailFile ? URL.createObjectURL(data.thumbnailFile) : 'https://picsum.photos/680/380',
          channelName: 'Your Channel',
          channelAvatarUrl: 'https://picsum.photos/seed/user/48/48',
          channelId: 'your-channel-id',
          views: '0 views',
          uploadedAt: 'Just now',
          duration: data.isShorts ? '0:30' : '10:00',
          videoUrl: data.videoFile ? URL.createObjectURL(data.videoFile) : '',
          description: data.description,
          category: data.category,
          tags: data.tags,
          likes: 0,
          dislikes: 0,
          visibility: data.visibility,
          isShort: data.isShorts,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add to mock videos array
        mockVideos.unshift(newVideo);
        
        // Store in localStorage for persistence
        const userVideos = JSON.parse(localStorage.getItem('youtubeCloneUserVideos_v1') || '[]');
        userVideos.unshift(newVideo);
        localStorage.setItem('youtubeCloneUserVideos_v1', JSON.stringify(userVideos));
        
        const finalProgress: UploadProgress = {
          percentage: 100,
          status: 'completed',
          message: 'Upload completed successfully!'
        };
        
        if (onProgress) onProgress(finalProgress);
        resolve(finalProgress);
      } else {
        const currentProgress: UploadProgress = {
          percentage: Math.floor(progress),
          status: 'uploading',
          message: `Uploading... ${Math.floor(progress)}%`
        };
        
        if (onProgress) onProgress(currentProgress);
      }
    }, 200); // Update every 200ms
    
    // Simulate potential upload failure (5% chance)
    setTimeout(() => {
      if (Math.random() < 0.05 && progress < 100) {
        clearInterval(interval);
        const errorProgress: UploadProgress = {
          percentage: 0,
          status: 'error',
          message: 'Upload failed. Please try again.'
        };
        if (onProgress) onProgress(errorProgress);
        reject(new Error('Upload failed'));
      }
    }, 1000);
  });
};

// Additional missing functions (only non-duplicate ones)
export const getChannelByName = (_name: string): Promise<Channel | null> => {
  return Promise.resolve(null);
};

export const getVideosByChannelName = (channelName: string): Promise<Video[]> => {
  return Promise.resolve(mockVideos.filter(v => v.channelName === channelName));
};

export const getVideosByChannelId = (_channelId: string): Promise<Video[]> => {
  return Promise.resolve([]);
};

export const getChannelPlaylists = (_channelName: string): Promise<PlaylistSummary[]> => {
  return Promise.resolve([]);
};

export const getChannelCommunityPosts = (_channelName: string): Promise<CommunityPost[]> => {
  return Promise.resolve([]);
};

export const getWatchHistoryVideos = (): Promise<Video[]> => {
  return Promise.resolve(mockVideos.slice(0, 5));
};

export const getLikedVideos = (): Promise<Video[]> => {
  return Promise.resolve(mockVideos.slice(0, 3));
};

export const getWatchLaterVideos = (): Promise<Video[]> => {
  return Promise.resolve(mockVideos.slice(2, 7));
};

export const getRecentSearches = (): Promise<string[]> => {
  return Promise.resolve(['gaming setup', 'travel vlog', 'cooking tips']);
};

export const clearAllRecentSearches = (): Promise<void> => {
  return Promise.resolve();
};

export const createUserPlaylist = (name: string): Promise<UserPlaylistDetails> => {
  return Promise.resolve({
    id: '1',
    title: name,
    videoIds: [],
    videoCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
};

export const removeVideoFromPlaylist = (_playlistId: string, _videoId: string): Promise<void> => {
  return Promise.resolve();
};

export const updateUserPlaylistDetails = (_id: string, _details: Partial<UserPlaylistDetails>): Promise<void> => {
  return Promise.resolve();
};

export const getSubscribedChannelNames = (): Promise<string[]> => {
  try {
    const subscriptions = JSON.parse(localStorage.getItem('youtubeCloneSubscriptions_v1') || '{}');
    const channelNames = Object.values(subscriptions).map((sub: any) => sub.channelName);

    // If no subscriptions exist, create some default ones for demo
    if (channelNames.length === 0) {
      const defaultSubscriptions = {
        'channel1': {
          channelName: 'Nature Explorers',
          channelAvatarUrl: 'https://picsum.photos/seed/channel1/120/120',
          subscriberCount: '2.5M',
          isSubscribed: true,
          notificationsEnabled: true,
          subscribedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        'channel2': {
          channelName: 'TechLevelUp',
          channelAvatarUrl: 'https://picsum.photos/seed/channel2/120/120',
          subscriberCount: '1.8M',
          isSubscribed: true,
          notificationsEnabled: false,
          subscribedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        'channel3': {
          channelName: 'Chef Studio',
          channelAvatarUrl: 'https://picsum.photos/seed/channel3/120/120',
          subscriberCount: '950K',
          isSubscribed: true,
          notificationsEnabled: true,
          subscribedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      };
      localStorage.setItem('youtubeCloneSubscriptions_v1', JSON.stringify(defaultSubscriptions));
      return Promise.resolve(Object.values(defaultSubscriptions).map(sub => sub.channelName));
    }

    return Promise.resolve(channelNames);
  } catch (error) {
    console.error('Error getting subscribed channel names:', error);
    return Promise.resolve(['Nature Explorers', 'TechLevelUp', 'Chef Studio']);
  }
};

export const getSubscribedChannels = (): Promise<any[]> => {
  try {
    // Ensure we have default subscriptions first
    const subscriptions = JSON.parse(localStorage.getItem('youtubeCloneSubscriptions_v1') || '{}');

    // If no subscriptions exist, create default ones
    if (Object.keys(subscriptions).length === 0) {
      const defaultSubscriptions = {
        'channel1': {
          channelName: 'Nature Explorers',
          channelAvatarUrl: 'https://picsum.photos/seed/channel1/120/120',
          subscriberCount: '2.5M',
          isSubscribed: true,
          notificationsEnabled: true,
          subscribedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        'channel2': {
          channelName: 'TechLevelUp',
          channelAvatarUrl: 'https://picsum.photos/seed/channel2/120/120',
          subscriberCount: '1.8M',
          isSubscribed: true,
          notificationsEnabled: false,
          subscribedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        'channel3': {
          channelName: 'Chef Studio',
          channelAvatarUrl: 'https://picsum.photos/seed/channel3/120/120',
          subscriberCount: '950K',
          isSubscribed: true,
          notificationsEnabled: true,
          subscribedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      };
      localStorage.setItem('youtubeCloneSubscriptions_v1', JSON.stringify(defaultSubscriptions));

      const channels = Object.entries(defaultSubscriptions).map(([id, data]: [string, any]) => ({
        id,
        name: data.channelName,
        avatar: data.channelAvatarUrl,
        subscribers: data.subscriberCount,
        notificationsEnabled: data.notificationsEnabled || false,
        subscribedAt: data.subscribedAt
      }));
      return Promise.resolve(channels);
    }

    const channels = Object.entries(subscriptions).map(([id, data]: [string, any]) => ({
      id,
      name: data.channelName,
      avatar: data.channelAvatarUrl,
      subscribers: data.subscriberCount,
      notificationsEnabled: data.notificationsEnabled || false,
      subscribedAt: data.subscribedAt
    }));
    return Promise.resolve(channels);
  } catch (error) {
    console.error('Error getting subscribed channels:', error);
    return Promise.resolve([]);
  }
};

export const updateSubscriptionNotifications = (channelId: string, enabled: boolean): Promise<void> => {
  try {
    const subscriptions = JSON.parse(localStorage.getItem('youtubeCloneSubscriptions_v1') || '{}');
    if (subscriptions[channelId]) {
      subscriptions[channelId].notificationsEnabled = enabled;
      localStorage.setItem('youtubeCloneSubscriptions_v1', JSON.stringify(subscriptions));
    }
    return Promise.resolve();
  } catch (error) {
    console.error('Error updating subscription notifications:', error);
    return Promise.reject(error);
  }
};

export const unsubscribeFromChannel = (channelId: string): Promise<void> => {
  try {
    const subscriptions = JSON.parse(localStorage.getItem('youtubeCloneSubscriptions_v1') || '{}');
    delete subscriptions[channelId];
    localStorage.setItem('youtubeCloneSubscriptions_v1', JSON.stringify(subscriptions));
    return Promise.resolve();
  } catch (error) {
    console.error('Error unsubscribing from channel:', error);
    return Promise.reject(error);
  }
};

export const getSearchSuggestions = (query: string): Promise<string[]> => {
  const suggestions = [
    'gaming setup',
    'travel vlog',
    'cooking tips',
    'tech review',
    'music video',
    'tutorial',
    'funny moments',
    'nature documentary'
  ];
  return Promise.resolve(
    suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase()))
  );
};

export const removeRecentSearch = (searchToRemove: string): Promise<string[]> => {
  // Mock implementation - in real app this would remove from storage
  const currentSearches = ['gaming setup', 'travel vlog', 'cooking tips'];
  const updatedSearches = currentSearches.filter(search => search !== searchToRemove);
  return Promise.resolve(updatedSearches);
};

export const saveRecentSearch = (_query: string): Promise<void> => {
  // Mock implementation - in real app this would save to storage
  return Promise.resolve();
};

// Export the mockVideos array for use in other components
export { mockVideos };
