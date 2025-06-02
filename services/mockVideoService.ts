
// Mock video service with working video URLs
import { Video, Channel, Comment, PlaylistSummary, CommunityPost, UserPlaylist, UserPlaylistDetails, VideoUploadData, UploadProgress } from '../types';

const mockVideos: Video[] = [
  {
    id: '1',
    title: 'Exploring the Alps: A Scenic Journey',
    thumbnailUrl: 'https://picsum.photos/seed/alps/680/380',
    channelName: 'Nature Explorers',
    channelAvatarUrl: 'https://picsum.photos/seed/channel1/48/48',
    views: '1.2M views',
    uploadedAt: '2 weeks ago',
    duration: '12:34',
    videoUrl: '/placeholder-video.mp4',
    description: 'A breathtaking journey through the Swiss Alps, showcasing stunning landscapes and wildlife.',
    category: 'Travel',
    isShort: false,
  },
  {
    id: 's1', 
    title: 'Coolest 30s Trick Shot!',
    thumbnailUrl: 'https://picsum.photos/seed/shorttrick/380/680', 
    channelName: 'TrickShotMasters',
    channelAvatarUrl: 'https://picsum.photos/seed/channelShort1/48/48',
    views: '5.3M views',
    uploadedAt: '1 day ago',
    duration: '0:30',
    videoUrl: '/placeholder-video.mp4',
    description: 'Check out this insane trick shot! #shorts #trickshot',
    category: 'Shorts',
    isShort: true,
  },
  {
    id: '2',
    title: 'Ultimate Gaming Setup Tour 2024',
    thumbnailUrl: 'https://picsum.photos/seed/gaming/680/380',
    channelName: 'TechLevelUp',
    channelAvatarUrl: 'https://picsum.photos/seed/channel2/48/48',
    views: '870K views',
    uploadedAt: '5 days ago',
    duration: '22:10',
    videoUrl: '/placeholder-video.mp4',
    description: 'Check out my ultimate gaming setup for 2024!',
    category: 'Gaming',
    isShort: false,
  },
  {
    id: 's2', 
    title: 'QuickLaughs: Funny Cat Moment',
    thumbnailUrl: 'https://picsum.photos/seed/catshort/380/680', 
    channelName: 'Funny Pets TV',
    channelAvatarUrl: 'https://picsum.photos/seed/channelFunnyPets/48/48',
    views: '10.1M views',
    uploadedAt: '6 hours ago',
    duration: '0:15',
    videoUrl: '/placeholder-video.mp4',
    description: 'This cat is hilarious! 😂 #shorts #funnycat #pets',
    category: 'Shorts',
    isShort: true,
  },
  {
    id: '3',
    title: 'Delicious & Easy Pasta Recipe',
    thumbnailUrl: 'https://picsum.photos/seed/pasta/680/380',
    channelName: 'Chef Studio',
    channelAvatarUrl: 'https://picsum.photos/seed/channel3/48/48',
    views: '2.5M views',
    uploadedAt: '1 month ago',
    duration: '8:15',
    videoUrl: '/placeholder-video.mp4',
    description: 'Learn how to make a delicious and easy pasta dish.',
    category: 'Cooking',
    isShort: false,
  },
  {
    id: 's3', 
    title: 'Mind-Blowing Magic Trick',
    thumbnailUrl: 'https://picsum.photos/seed/magicshort/380/680', 
    channelName: 'Magic Masters',
    channelAvatarUrl: 'https://picsum.photos/seed/channelMagic/48/48',
    views: '8.7M views',
    uploadedAt: '3 days ago',
    duration: '0:45',
    videoUrl: '/placeholder-video.mp4',
    description: 'You won\'t believe this magic trick! #shorts #magic #mindblown',
    category: 'Shorts',
    isShort: true,
  }
];

// Export functions
export const getVideos = (): Promise<Video[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockVideos), 100);
  });
};

export const getVideoById = (id: string): Promise<Video | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const video = mockVideos.find(v => v.id === id) || null;
      resolve(video);
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
    handle: '@natureexplorers',
    avatarUrl: 'https://picsum.photos/seed/channel1/120/120',
    bannerUrl: 'https://picsum.photos/seed/banner1/1200/300',
    subscriberCount: '2.5M',
    videoCount: 156,
    description: 'Exploring the world\'s most beautiful natural landscapes.',
    isVerified: true,
    joinedDate: 'Jan 15, 2018'
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
    videoId: '1',
    author: 'John Doe',
    authorAvatar: 'https://picsum.photos/seed/user1/40/40',
    content: 'Amazing video! The scenery is breathtaking.',
    timestamp: '2 hours ago',
    likes: 42,
    replies: []
  }
];

export const getCommentsByVideoId = (videoId: string): Promise<Comment[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const comments = mockComments.filter(c => c.videoId === videoId);
      resolve(comments);
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

export const getUserPlaylists = (): Promise<UserPlaylist[]> => {
  return Promise.resolve([]);
};

export const getUserPlaylistById = (id: string): Promise<UserPlaylistDetails | null> => {
  return Promise.resolve(null);
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
          views: '0 views',
          uploadedAt: 'Just now',
          duration: data.isShorts ? '0:30' : '10:00',
          videoUrl: data.videoFile ? URL.createObjectURL(data.videoFile) : '',
          description: data.description,
          category: data.category,
          isShort: data.isShorts
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
export const getChannelByName = (name: string): Promise<Channel | null> => {
  return Promise.resolve(null);
};

export const getVideosByChannelName = (channelName: string): Promise<Video[]> => {
  return Promise.resolve(mockVideos.filter(v => v.channelName === channelName));
};

export const getVideosByChannelId = (channelId: string): Promise<Video[]> => {
  return Promise.resolve([]);
};

export const getChannelPlaylists = (channelName: string): Promise<PlaylistSummary[]> => {
  return Promise.resolve([]);
};

export const getChannelCommunityPosts = (channelName: string): Promise<CommunityPost[]> => {
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

export const createUserPlaylist = (name: string): Promise<UserPlaylist> => {
  return Promise.resolve({ id: '1', name, videoCount: 0, thumbnailUrl: '' });
};

export const removeVideoFromPlaylist = (playlistId: string, videoId: string): Promise<void> => {
  return Promise.resolve();
};

export const updateUserPlaylistDetails = (id: string, details: Partial<UserPlaylistDetails>): Promise<void> => {
  return Promise.resolve();
};

export const getSubscribedChannelNames = (): Promise<string[]> => {
  return Promise.resolve(['Nature Explorers', 'TechLevelUp', 'CookingMaster']);
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

export const saveRecentSearch = (query: string): Promise<void> => {
  // Mock implementation - in real app this would save to storage
  console.log('Saving recent search:', query);
  return Promise.resolve();
};
