// Settings service for managing application preferences

export type YouTubeSearchProvider = 'youtube-api' | 'google-search' | 'hybrid';
export type YouTubePlayerType = 'youtube-player' | 'youtube-player-wrapper';
export type LocalVideoPlayerType = 'advanced-video-player' | 'video-player';
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
  youtubePlayerType: 'youtube-player-wrapper',
  localVideoPlayerType: 'advanced-video-player',
  defaultVideoPlayerCategory: 'youtube',
};

// Video Player Configurations
export const VIDEO_PLAYER_CONFIGS: Record<VideoPlayerType, VideoPlayerConfig> = {
  // YouTube Players
  'youtube-player': {
    type: 'youtube-player',
    category: 'youtube',
    name: 'YouTube Player',
    description: 'Direct YouTube player component with basic YouTube API integration',
    features: ['YouTube API Integration', 'Basic Controls', 'Lightweight', 'Simple Setup'],
    useCases: ['Simple YouTube video embedding', 'Basic playback needs', 'Minimal configuration'],
    performance: 'high',
    complexity: 'simple',
  },
  'youtube-player-wrapper': {
    type: 'youtube-player-wrapper',
    category: 'youtube',
    name: 'YouTube Player Wrapper',
    description: 'Enhanced YouTube player with additional wrapper functionality and controls',
    features: ['Enhanced Controls', 'Wrapper Functionality', 'YouTube API', 'Custom Events', 'Error Handling'],
    useCases: ['Advanced YouTube integration', 'Custom player controls', 'Enhanced user experience'],
    performance: 'high',
    complexity: 'moderate',
  },
  // Local Video Players
  'advanced-video-player': {
    type: 'advanced-video-player',
    category: 'local',
    name: 'Advanced Video Player',
    description: 'Feature-rich video player with advanced controls and modern React patterns',
    features: ['Advanced Controls', 'Custom Hooks', 'State Management', 'Quality Selection', 'Fullscreen Support'],
    useCases: ['Professional video applications', 'Advanced playback features', 'Custom video experiences'],
    performance: 'high',
    complexity: 'advanced',
  },
  'video-player': {
    type: 'video-player',
    category: 'local',
    name: 'Standard Video Player',
    description: 'Standard HTML5 video player with essential controls and React integration',
    features: ['HTML5 Video', 'Standard Controls', 'React Integration', 'Responsive Design'],
    useCases: ['Standard video playback', 'Simple local videos', 'Basic video needs'],
    performance: 'medium',
    complexity: 'simple',
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