// Settings service for managing application preferences

export type YouTubeSearchProvider = 'youtube-api' | 'google-search' | 'hybrid';
export type YouTubePlayerType = 'optimized' | 'iframe-api' | 'advanced' | 'youtube-player' | 'optimized-video';
export type LocalVideoPlayerType = 'advanced-video' | 'basic-video' | 'refactored-video';
export type VideoPlayerType = YouTubePlayerType | LocalVideoPlayerType;

export interface VideoPlayerConfig {
  type: VideoPlayerType;
  category: 'youtube' | 'local';
  name: string;
  description: string;
  features: string[];
  useCases: string[];
  performance: 'high' | 'medium' | 'low';
  complexity: 'simple' | 'moderate' | 'advanced';
}

export interface AppSettings {
  youtubeSearchProvider: YouTubeSearchProvider;
  youtubePlayerType: YouTubePlayerType;
  localVideoPlayerType: LocalVideoPlayerType;
  defaultVideoPlayerCategory: 'youtube' | 'local';
}

const SETTINGS_KEY = 'yt-studio-settings';

const defaultSettings: AppSettings = {
  youtubeSearchProvider: 'hybrid',
  youtubePlayerType: 'optimized',
  localVideoPlayerType: 'advanced-video',
  defaultVideoPlayerCategory: 'youtube'
};

// Video Player Configurations
export const VIDEO_PLAYER_CONFIGS: Record<VideoPlayerType, VideoPlayerConfig> = {
  // YouTube Players
  'optimized': {
    type: 'optimized',
    category: 'youtube',
    name: 'Optimized YouTube Player',
    description: 'Best balance of features and performance with lazy loading and custom controls',
    features: ['Lazy Loading', 'Custom Controls', 'Performance Monitoring', 'Intersection Observer'],
    useCases: ['General YouTube video playback', 'Video grids', 'Performance-critical apps'],
    performance: 'high',
    complexity: 'moderate'
  },
  'iframe-api': {
    type: 'iframe-api',
    category: 'youtube',
    name: 'IFrame API Player',
    description: 'Full YouTube API integration with advanced features and detailed event handling',
    features: ['Full YouTube API', 'Quality Control', 'Advanced Events', 'Playback Control'],
    useCases: ['Professional video apps', 'Advanced playback control', 'Custom player interfaces'],
    performance: 'medium',
    complexity: 'advanced'
  },
  'advanced': {
    type: 'advanced',
    category: 'youtube',
    name: 'Advanced YouTube Player',
    description: 'Feature-rich player with advanced controls and professional features',
    features: ['Advanced Controls', 'Quality Selection', 'Subtitle Support', 'Chapter Navigation'],
    useCases: ['Professional applications', 'Educational content', 'Training platforms'],
    performance: 'medium',
    complexity: 'advanced'
  },
  'youtube-player': {
    type: 'youtube-player',
    category: 'youtube',
    name: 'Simple YouTube Player',
    description: 'Lightweight YouTube integration with basic controls for simple needs',
    features: ['Basic Controls', 'Lightweight', 'Simple Integration', 'Fast Loading'],
    useCases: ['Simple video display', 'Embedded content', 'Minimal resource usage'],
    performance: 'high',
    complexity: 'simple'
  },
  'optimized-video': {
    type: 'optimized-video',
    category: 'youtube',
    name: 'Optimized Video Player',
    description: 'High-performance player optimized for speed and minimal resource usage',
    features: ['High Performance', 'Minimal Resources', 'Fast Rendering', 'Optimized Loading'],
    useCases: ['Performance-critical applications', 'Mobile devices', 'Low-bandwidth scenarios'],
    performance: 'high',
    complexity: 'simple'
  },
  // Local Video Players
  'advanced-video': {
    type: 'advanced-video',
    category: 'local',
    name: 'Advanced Video Player',
    description: 'Feature-rich HTML5 video player with advanced controls, subtitles, and quality selection',
    features: ['Quality Selection', 'Subtitle Support', 'Chapter Navigation', 'Fullscreen', 'Custom Controls'],
    useCases: ['Local video files', 'Educational content', 'Professional video playback', 'Training materials'],
    performance: 'medium',
    complexity: 'advanced'
  },
  'basic-video': {
    type: 'basic-video',
    category: 'local',
    name: 'Basic Video Player',
    description: 'Simple HTML5 video player with essential controls for local video files',
    features: ['Basic Controls', 'HTML5 Video', 'Lightweight', 'Cross-browser Support'],
    useCases: ['Simple local video playback', 'Basic media display', 'Lightweight applications'],
    performance: 'high',
    complexity: 'simple'
  },
  'refactored-video': {
    type: 'refactored-video',
    category: 'local',
    name: 'Refactored Video Player',
    description: 'Modern video player built with custom hooks and optimized React patterns',
    features: ['Custom Hooks', 'Modern React Patterns', 'State Management', 'Reusable Components'],
    useCases: ['Modern React applications', 'Component reusability', 'Custom video experiences'],
    performance: 'high',
    complexity: 'moderate'
  }
};

export const getSettings = (): AppSettings => {
  const stored = localStorage.getItem('appSettings');
  if (stored) {
    try {
      return { ...defaultSettings, ...JSON.parse(stored) };
    } catch (error) {
      console.error('Error parsing stored settings:', error);
    }
  }
  return defaultSettings;
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem('appSettings', JSON.stringify(settings));
};

export const getYouTubePlayerType = (): YouTubePlayerType => {
  return getSettings().youtubePlayerType;
};

export const setYouTubePlayerType = (playerType: YouTubePlayerType): void => {
  const settings = getSettings();
  saveSettings({ ...settings, youtubePlayerType: playerType });
};

export const getLocalVideoPlayerType = (): LocalVideoPlayerType => {
  return getSettings().localVideoPlayerType;
};

export const setLocalVideoPlayerType = (playerType: LocalVideoPlayerType): void => {
  const settings = getSettings();
  saveSettings({ ...settings, localVideoPlayerType: playerType });
};

export const getDefaultVideoPlayerCategory = (): 'youtube' | 'local' => {
  return getSettings().defaultVideoPlayerCategory;
};

export const setDefaultVideoPlayerCategory = (category: 'youtube' | 'local'): void => {
  const settings = getSettings();
  saveSettings({ ...settings, defaultVideoPlayerCategory: category });
};

export const getVideoPlayerConfig = (type: VideoPlayerType): VideoPlayerConfig => {
  return VIDEO_PLAYER_CONFIGS[type];
};

export const getVideoPlayersByCategory = (category: 'youtube' | 'local'): VideoPlayerConfig[] => {
  return Object.values(VIDEO_PLAYER_CONFIGS).filter(config => config.category === category);
};

export const getAllVideoPlayers = (): VideoPlayerConfig[] => {
  return Object.values(VIDEO_PLAYER_CONFIGS);
};

// Get current YouTube search provider
export const getYouTubeSearchProvider = (): YouTubeSearchProvider => {
  return getSettings().youtubeSearchProvider;
};

// Set YouTube search provider
export const setYouTubeSearchProvider = (provider: YouTubeSearchProvider): void => {
  const settings = getSettings();
  settings.youtubeSearchProvider = provider;
  saveSettings(settings);
};

// Check if Google Custom Search is available
export const isGoogleSearchAvailable = (): boolean => {
  const apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
  const engineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;
  return !!(apiKey && engineId);
};

// Check if YouTube Data API is available
export const isYouTubeApiAvailable = (): boolean => {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  return !!apiKey;
};

// Check if hybrid mode is available (both APIs configured)
export const isHybridModeAvailable = (): boolean => {
  return isYouTubeApiAvailable() && isGoogleSearchAvailable();
};