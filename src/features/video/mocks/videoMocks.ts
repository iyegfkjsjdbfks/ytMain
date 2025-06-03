import { Video, Channel, VideoVisibility } from '../types';

/**
 * Generate a random number between min and max (inclusive)
 */
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * Generate a random date within the last n months
 */
const randomDate = (monthsBack = 12): string => {
  const now = new Date();
  const randomMonths = randomInt(0, monthsBack);
  const randomDays = randomInt(0, 30);
  
  const date = new Date(
    now.getFullYear(),
    now.getMonth() - randomMonths,
    now.getDate() - randomDays
  );
  
  return date.toISOString();
};

/**
 * Mock channel data
 */
export const mockChannels: Channel[] = [
  {
    id: 'channel-1',
    name: 'Tech Insights',
    avatarUrl: 'https://via.placeholder.com/150/3498db/FFFFFF?text=TI',
    subscribers: 1250000,
    isVerified: true
  },
  {
    id: 'channel-2',
    name: 'Gaming Universe',
    avatarUrl: 'https://via.placeholder.com/150/e74c3c/FFFFFF?text=GU',
    subscribers: 876000,
    isVerified: true
  },
  {
    id: 'channel-3',
    name: 'Creative Studio',
    avatarUrl: 'https://via.placeholder.com/150/2ecc71/FFFFFF?text=CS',
    subscribers: 450000,
    isVerified: false
  },
  {
    id: 'channel-4',
    name: 'Daily Vlogs',
    avatarUrl: 'https://via.placeholder.com/150/f39c12/FFFFFF?text=DV',
    subscribers: 220000,
    isVerified: false
  },
  {
    id: 'channel-5',
    name: 'Science Explained',
    avatarUrl: 'https://via.placeholder.com/150/9b59b6/FFFFFF?text=SE',
    subscribers: 1800000,
    isVerified: true
  }
];

/**
 * Mock video titles
 */
const videoTitles = [
  'Getting Started with React and TypeScript - Complete Guide',
  'Top 10 Features in the Latest JavaScript Update',
  'Building a YouTube Clone with React - Part 1',
  'How to Deploy Your Web App to AWS in Minutes',
  'Understanding State Management with Zustand',
  'The Ultimate Guide to CSS Grid Layout',
  'Creating Beautiful UI Animations with Framer Motion',
  'React Router v6 Tutorial - Everything You Need to Know',
  'Full Stack Development with Next.js and MongoDB',
  'Tailwind CSS Tips and Tricks for Beginners',
  'How I Built a Successful Tech Channel',
  'Redux vs. Context API - Which One Should You Use?',
  'Optimizing React Performance - Advanced Techniques',
  'Building Accessible Web Applications',
  'The Complete GitHub Actions CI/CD Pipeline',
  'TypeScript for React Developers - Best Practices',
  'Creating a Dark Mode Toggle with CSS Variables',
  'Web Development Roadmap for 2025',
  'Testing React Components with Jest and Testing Library',
  'CSS-in-JS Solutions Compared'
];

/**
 * Generate a random mock video
 */
export const generateMockVideo = (id?: string): Video => {
  const channelIndex = randomInt(0, mockChannels.length - 1);
  const titleIndex = randomInt(0, videoTitles.length - 1);
  const visibilityOptions: VideoVisibility[] = ['public', 'unlisted', 'private'];

  // Ensure we have valid indices
  const selectedChannel = mockChannels[channelIndex];
  const selectedTitle = videoTitles[titleIndex];
  const selectedVisibility = visibilityOptions[randomInt(0, visibilityOptions.length - 1)];

  if (!selectedChannel || !selectedTitle || !selectedVisibility) {
    throw new Error('Failed to generate mock video: invalid data');
  }

  return {
    id: id || `video-${Date.now()}-${randomInt(1000, 9999)}`,
    title: selectedTitle,
    description: `This is a description for "${selectedTitle}". It provides additional context and information about the video content.`,
    thumbnailUrl: `https://picsum.photos/seed/${randomInt(1, 1000)}/640/360`,
    duration: randomInt(120, 1200),
    views: randomInt(1000, 1000000),
    likes: randomInt(100, 50000),
    createdAt: randomDate(),
    publishedAt: Math.random() > 0.2 ? randomDate() : randomDate(), // Always provide a value
    visibility: selectedVisibility,
    channel: selectedChannel,
    // Backward compatibility
    channelId: selectedChannel.id,
    channelTitle: selectedChannel.name,
    channelThumbnail: selectedChannel.avatarUrl || ''
  };
};

/**
 * Generate an array of mock videos
 */
export const generateMockVideos = (count = 12): Video[] => {
  return Array.from({ length: count }, (_, index) => 
    generateMockVideo(`video-${index + 1}`)
  );
};

/**
 * Mock data for featured videos
 */
export const mockFeaturedVideos = generateMockVideos(5);

/**
 * Mock data for recommended videos
 */
export const mockRecommendedVideos = generateMockVideos(8);

/**
 * Mock data for trending videos
 */
export const mockTrendingVideos = generateMockVideos(10);

/**
 * Mock data for user videos (for studio)
 */
export const mockUserVideos = generateMockVideos(15);
