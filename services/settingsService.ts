// / <reference types="vite/client" />
// Settings service for managing application settings

export type YouTubeSearchProvider = 'youtube-api' | 'google-search' | 'hybrid';
export type YouTubePlayerType = 'youtube-player';
export type LocalVideoPlayerType = 'advanced-video-player';
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

export interface Settings {
  youtubeSearchProvider: YouTubeSearchProvider;
  youtubePlayerType: YouTubePlayerType;
  localVideoPlayerType: LocalVideoPlayerType;
  defaultVideoPlayerCategory: 'youtube' | 'local';
}


const defaultSettings: Settings = {
  youtubeSearchProvider: 'google-search',
  youtubePlayerType: 'youtube-player',
  localVideoPlayerType: 'advanced-video-player',
  defaultVideoPlayerCategory: 'youtube',
};

// Video Player Configurations
export const VIDEO_PLAYER_CONFIGS: Record<VideoPlayerType, VideoPlayerConfig> = {
  'youtube-player': {
    type: 'youtube-player',
    category: 'youtube',
    name: 'YouTube Player',
    description: 'Direct YouTube player component with YouTube API integration for seamless video playback',
    features: ['YouTube API Integration', 'Responsive Design', 'Lightweight', 'Auto Quality', 'Fullscreen Support'],
    useCases: ['YouTube video embedding', 'Search result playback', 'Video streaming'],
    performance: 'high',
    complexity: 'simple',
  },
  'advanced-video-player': {
    type: 'advanced-video-player',
    category: 'local',
    name: 'Advanced Video Player',
    description: 'Feature-rich video player with advanced controls and modern React patterns for local video files',
    features: ['Advanced Controls', 'Custom Hooks', 'State Management', 'Quality Selection', 'Fullscreen Support'],
    useCases: ['Local video files', 'Advanced playback features', 'Custom video experiences'],
    performance: 'high',
    complexity: 'advanced',
  },
};

export const getSettings = (): Settings => {
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

export const saveSettings = (settings: Settings): void => {
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