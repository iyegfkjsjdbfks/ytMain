
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
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
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
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
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
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
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
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
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
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
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
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'You won\'t believe this magic trick! #shorts #magic #mindblown',
    category: 'Shorts',
    isShort: true,
  },
  {
    id: '4',
    title: 'Building a Modern React App from Scratch',
    thumbnailUrl: 'https://picsum.photos/seed/react/680/380',
    channelName: 'CodeMaster Pro',
    channelAvatarUrl: 'https://picsum.photos/seed/channel4/48/48',
    views: '450K views',
    uploadedAt: '1 week ago',
    duration: '45:22',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Complete tutorial on building a modern React application with TypeScript and best practices.',
    category: 'Education',
    isShort: false,
  },
  {
    id: '5',
    title: 'Morning Workout Routine - 15 Minutes',
    thumbnailUrl: 'https://picsum.photos/seed/workout/680/380',
    channelName: 'FitLife Daily',
    channelAvatarUrl: 'https://picsum.photos/seed/channel5/48/48',
    views: '3.2M views',
    uploadedAt: '4 days ago',
    duration: '15:30',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Start your day right with this energizing 15-minute morning workout routine.',
    category: 'Sports',
    isShort: false,
  },
  {
    id: 's4',
    title: 'Life Hack: Phone Organization',
    thumbnailUrl: 'https://picsum.photos/seed/lifehack/380/680',
    channelName: 'Quick Tips',
    channelAvatarUrl: 'https://picsum.photos/seed/channelTips/48/48',
    views: '2.8M views',
    uploadedAt: '2 days ago',
    duration: '0:35',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Organize your phone like a pro! #shorts #lifehack #productivity',
    category: 'Shorts',
    isShort: true,
  },
  {
    id: '6',
    title: 'The Science Behind Black Holes',
    thumbnailUrl: 'https://picsum.photos/seed/blackhole/680/380',
    channelName: 'Space Academy',
    channelAvatarUrl: 'https://picsum.photos/seed/channel6/48/48',
    views: '1.8M views',
    uploadedAt: '3 weeks ago',
    duration: '28:45',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Dive deep into the fascinating world of black holes and their impact on space-time.',
    category: 'Science',
    isShort: false,
  },
  {
    id: '7',
    title: 'Guitar Lesson: Master the Pentatonic Scale',
    thumbnailUrl: 'https://picsum.photos/seed/guitar/680/380',
    channelName: 'Music Theory Hub',
    channelAvatarUrl: 'https://picsum.photos/seed/channel7/48/48',
    views: '680K views',
    uploadedAt: '1 week ago',
    duration: '18:12',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Learn to master the pentatonic scale with practical exercises and tips.',
    category: 'Music',
    isShort: false,
  },
  {
    id: 's5',
    title: 'Amazing Street Art Time-lapse',
    thumbnailUrl: 'https://picsum.photos/seed/streetart/380/680',
    channelName: 'Urban Artists',
    channelAvatarUrl: 'https://picsum.photos/seed/channelArt/48/48',
    views: '4.5M views',
    uploadedAt: '5 hours ago',
    duration: '0:50',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Watch this incredible street art come to life! #shorts #art #timelapse',
    category: 'Shorts',
    isShort: true,
  },
  {
    id: '8',
    title: 'Top 10 Travel Destinations 2024',
    thumbnailUrl: 'https://picsum.photos/seed/travel2024/680/380',
    channelName: 'Wanderlust Adventures',
    channelAvatarUrl: 'https://picsum.photos/seed/channel8/48/48',
    views: '920K views',
    uploadedAt: '2 weeks ago',
    duration: '16:40',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Discover the most amazing travel destinations you must visit in 2024.',
    category: 'Travel',
    isShort: false,
  },
  {
    id: '9',
    title: 'Cryptocurrency Explained for Beginners',
    thumbnailUrl: 'https://picsum.photos/seed/crypto/680/380',
    channelName: 'Finance Simplified',
    channelAvatarUrl: 'https://picsum.photos/seed/channel9/48/48',
    views: '1.5M views',
    uploadedAt: '1 month ago',
    duration: '32:18',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'A comprehensive guide to understanding cryptocurrency and blockchain technology.',
    category: 'Education',
    isShort: false,
  },
  {
    id: 's6',
    title: 'Satisfying Soap Cutting ASMR',
    thumbnailUrl: 'https://picsum.photos/seed/asmr/380/680',
    channelName: 'ASMR Relaxation',
    channelAvatarUrl: 'https://picsum.photos/seed/channelASMR/48/48',
    views: '12.3M views',
    uploadedAt: '1 day ago',
    duration: '0:25',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'So satisfying! Perfect for relaxation 😌 #shorts #asmr #satisfying',
    category: 'Shorts',
    isShort: true,
  },
  {
    id: '10',
    title: 'Home Automation with Smart Devices',
    thumbnailUrl: 'https://picsum.photos/seed/smarthome/680/380',
    channelName: 'Smart Home Tech',
    channelAvatarUrl: 'https://picsum.photos/seed/channel10/48/48',
    views: '750K views',
    uploadedAt: '6 days ago',
    duration: '24:55',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Transform your home into a smart home with these amazing automation ideas.',
    category: 'Technology',
    isShort: false,
  },
  {
    id: '11',
    title: 'Meditation for Stress Relief - Guided Session',
    thumbnailUrl: 'https://picsum.photos/seed/meditation/680/380',
    channelName: 'Mindful Living',
    channelAvatarUrl: 'https://picsum.photos/seed/channel11/48/48',
    views: '2.1M views',
    uploadedAt: '1 week ago',
    duration: '20:00',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'A peaceful guided meditation session to help you relax and reduce stress.',
    category: 'Lifestyle',
    isShort: false,
  },
  {
    id: 's7',
    title: 'Quick Recipe: 2-Minute Mug Cake',
    thumbnailUrl: 'https://picsum.photos/seed/mugcake/380/680',
    channelName: 'Quick Bites',
    channelAvatarUrl: 'https://picsum.photos/seed/channelQuick/48/48',
    views: '6.7M views',
    uploadedAt: '3 days ago',
    duration: '0:40',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Delicious mug cake in just 2 minutes! #shorts #recipe #dessert',
    category: 'Shorts',
    isShort: true,
  },
  {
    id: '12',
    title: 'Photography Tips: Golden Hour Portraits',
    thumbnailUrl: 'https://picsum.photos/seed/photography/680/380',
    channelName: 'Photo Pro Tips',
    channelAvatarUrl: 'https://picsum.photos/seed/channel12/48/48',
    views: '890K views',
    uploadedAt: '5 days ago',
    duration: '14:30',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Master the art of golden hour portrait photography with these professional tips.',
    category: 'Photography',
    isShort: false,
  },
  {
    id: '13',
    title: 'AI and Machine Learning Explained Simply',
    thumbnailUrl: 'https://picsum.photos/seed/aiml/680/380',
    channelName: 'Tech Simplified',
    channelAvatarUrl: 'https://picsum.photos/seed/channel13/48/48',
    views: '1.3M views',
    uploadedAt: '3 days ago',
    duration: '19:45',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Understand AI and Machine Learning concepts without the technical jargon.',
    category: 'Technology',
    isShort: false,
  },
  {
    id: '14',
    title: 'Sustainable Living: Zero Waste Tips',
    thumbnailUrl: 'https://picsum.photos/seed/zerowaste/680/380',
    channelName: 'Eco Warriors',
    channelAvatarUrl: 'https://picsum.photos/seed/channel14/48/48',
    views: '980K views',
    uploadedAt: '1 week ago',
    duration: '16:20',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Practical tips for reducing waste and living more sustainably.',
    category: 'Lifestyle',
    isShort: false,
  },
  {
    id: '15',
    title: 'Digital Art Tutorial: Character Design',
    thumbnailUrl: 'https://picsum.photos/seed/digitalart/680/380',
    channelName: 'Digital Creators',
    channelAvatarUrl: 'https://picsum.photos/seed/channel15/48/48',
    views: '720K views',
    uploadedAt: '4 days ago',
    duration: '35:12',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Learn professional character design techniques using digital art tools.',
    category: 'Art',
    isShort: false,
  },
  {
    id: '16',
    title: 'Mental Health: Managing Anxiety',
    thumbnailUrl: 'https://picsum.photos/seed/mentalhealth/680/380',
    channelName: 'Wellness Guide',
    channelAvatarUrl: 'https://picsum.photos/seed/channel16/48/48',
    views: '2.4M views',
    uploadedAt: '2 weeks ago',
    duration: '22:30',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Evidence-based strategies for managing anxiety and improving mental well-being.',
    category: 'Health',
    isShort: false,
  },
  {
    id: '17',
    title: 'Entrepreneurship 101: Starting Your Business',
    thumbnailUrl: 'https://picsum.photos/seed/business/680/380',
    channelName: 'Business Builders',
    channelAvatarUrl: 'https://picsum.photos/seed/channel17/48/48',
    views: '1.1M views',
    uploadedAt: '1 week ago',
    duration: '28:15',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Essential steps and tips for starting your own successful business.',
    category: 'Business',
    isShort: false,
  },
  {
    id: '18',
    title: 'Climate Change: What You Need to Know',
    thumbnailUrl: 'https://picsum.photos/seed/climate/680/380',
    channelName: 'Science Today',
    channelAvatarUrl: 'https://picsum.photos/seed/channel18/48/48',
    views: '1.7M views',
    uploadedAt: '5 days ago',
    duration: '26:40',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Understanding climate change: causes, effects, and solutions.',
    category: 'Science',
    isShort: false,
  },
  {
    id: 's8',
    title: 'Dance Challenge: Viral Moves',
    thumbnailUrl: 'https://picsum.photos/seed/dance/380/680',
    channelName: 'Dance Trends',
    channelAvatarUrl: 'https://picsum.photos/seed/channelDance/48/48',
    views: '15.2M views',
    uploadedAt: '2 hours ago',
    duration: '0:30',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Learn the hottest dance moves! #shorts #dance #viral',
    category: 'Shorts',
    isShort: true,
  },
  {
    id: 's9',
    title: 'DIY Phone Case Decoration',
    thumbnailUrl: 'https://picsum.photos/seed/diyphone/380/680',
    channelName: 'Crafty Corner',
    channelAvatarUrl: 'https://picsum.photos/seed/channelCraft/48/48',
    views: '3.8M views',
    uploadedAt: '1 day ago',
    duration: '0:45',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Transform your phone case with these easy DIY ideas! #shorts #diy #craft',
    category: 'Shorts',
    isShort: true,
  },
  {
    id: '19',
    title: 'History Mysteries: Ancient Civilizations',
    thumbnailUrl: 'https://picsum.photos/seed/ancient/680/380',
    channelName: 'History Unveiled',
    channelAvatarUrl: 'https://picsum.photos/seed/channel19/48/48',
    views: '1.9M views',
    uploadedAt: '1 week ago',
    duration: '31:25',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Explore the fascinating mysteries of ancient civilizations and their secrets.',
    category: 'History',
    isShort: false,
  },
  {
    id: '20',
    title: 'Language Learning: Spanish Basics',
    thumbnailUrl: 'https://picsum.photos/seed/spanish/680/380',
    channelName: 'Language Masters',
    channelAvatarUrl: 'https://picsum.photos/seed/channel20/48/48',
    views: '850K views',
    uploadedAt: '3 days ago',
    duration: '18:50',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Learn essential Spanish phrases and grammar for beginners.',
    category: 'Education',
    isShort: false,
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
