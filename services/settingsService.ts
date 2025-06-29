// Settings service for managing application preferences

export type YouTubeSearchProvider = 'youtube-api' | 'google-search' | 'hybrid';
export type YouTubePlayerType = 'youtube-player';
export type LocalVideoPlayerType = 'refactored-video';
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


const defaultSettings: AppSettings = {
  youtubeSearchProvider: 'hybrid',
  youtubePlayerType: 'youtube-player',
  localVideoPlayerType: 'refactored-video',
  defaultVideoPlayerCategory: 'youtube',
};

// Video Player Configurations
export const VIDEO_PLAYER_CONFIGS: Record<VideoPlayerType, VideoPlayerConfig> = {
  // YouTube Players
  'youtube-player': {
    type: 'youtube-player',
    category: 'youtube',
    name: 'Simple YouTube Player',
    description: 'Lightweight YouTube integration with basic controls for simple needs',
    features: ['Basic Controls', 'Lightweight', 'Simple Integration', 'Fast Loading'],
    useCases: ['Simple video display', 'Embedded content', 'Minimal resource usage'],
    performance: 'high',
    complexity: 'simple',
  },
  // Local Video Players
  'refactored-video': {
    type: 'refactored-video',
    category: 'local',
    name: 'Refactored Video Player',
    description: 'Modern video player built with custom hooks and optimized React patterns',
    features: ['Custom Hooks', 'Modern React Patterns', 'State Management', 'Reusable Components'],
    useCases: ['Modern React applications', 'Component reusability', 'Custom video experiences'],
    performance: 'high',
    complexity: 'moderate',
  },
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