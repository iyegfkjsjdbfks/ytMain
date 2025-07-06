// / <reference types="vite/client" />
// Settings service for managing application settings
import { isYouTubeDataApiBlocked } from '../src/utils/youtubeApiUtils';

export type YouTubeSearchProvider = 'youtube-api' | 'google-search' | 'hybrid';
export type YouTubePlayerType = 'youtube-player' | 'youtube-player-wrapper' | 'youtube-player-example';
export type LocalVideoPlayerType = 'advanced-video-player' | 'video-player' | 'shorts-player' | 'short-display-card';
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

export interface PagePlayerConfig {
  youtubePlayer: YouTubePlayerType;
  localPlayer: LocalVideoPlayerType;
  defaultCategory: 'youtube' | 'local';
}

export interface Settings {
  youtubeSearchProvider: YouTubeSearchProvider;
  youtubePlayerType: YouTubePlayerType;
  localVideoPlayerType: LocalVideoPlayerType;
  defaultVideoPlayerCategory: 'youtube' | 'local';
  enabledYouTubePlayers: YouTubePlayerType[];
  enabledLocalPlayers: LocalVideoPlayerType[];
  initialSearchKeyword?: string;
  pageConfigurations?: {
    watchPage: PagePlayerConfig;
    homePage: PagePlayerConfig;
    searchResultsPage: PagePlayerConfig;
  };
}


const defaultSettings: Settings = {
  youtubeSearchProvider: 'hybrid',
  youtubePlayerType: 'youtube-player',
  localVideoPlayerType: 'advanced-video-player',
  defaultVideoPlayerCategory: 'youtube',
  enabledYouTubePlayers: ['youtube-player', 'youtube-player-wrapper'],
  enabledLocalPlayers: ['advanced-video-player', 'video-player'],
  initialSearchKeyword: 'trending',
  pageConfigurations: {
    watchPage: {
      youtubePlayer: 'youtube-player',
      localPlayer: 'video-player',
      defaultCategory: 'youtube',
    },
    homePage: {
      youtubePlayer: 'youtube-player',
      localPlayer: 'advanced-video-player',
      defaultCategory: 'youtube',
    },
    searchResultsPage: {
      youtubePlayer: 'youtube-player-wrapper',
      localPlayer: 'advanced-video-player',
      defaultCategory: 'youtube',
    },
  },
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
  'youtube-player-wrapper': {
    type: 'youtube-player-wrapper',
    category: 'youtube',
    name: 'YouTube Player Wrapper',
    description: 'Simplified wrapper component that provides easy-to-use props interface for YouTube Player',
    features: ['Simplified API', 'Props-based configuration', 'Mock video object creation', 'YouTube Player integration'],
    useCases: ['Quick YouTube embedding', 'Simplified integration', 'Video cards', 'Component reusability'],
    performance: 'high',
    complexity: 'simple',
  },
  'youtube-player-example': {
    type: 'youtube-player-example',
    category: 'youtube',
    name: 'YouTube Player Example',
    description: 'Educational/demo implementation showcasing YouTube player capabilities and usage patterns',
    features: ['Demo functionality', 'Player state tracking', 'Control examples', 'Progress monitoring', 'Educational code'],
    useCases: ['Development demos', 'Testing', 'Learning examples', 'Prototyping'],
    performance: 'medium',
    complexity: 'simple',
  },
  'advanced-video-player': {
    type: 'advanced-video-player',
    category: 'local',
    name: 'Advanced Video Player',
    description: 'Feature-rich video player with advanced controls and modern React patterns for local video files',
    features: ['Advanced Controls', 'Custom Hooks', 'State Management', 'Quality Selection', 'Fullscreen Support', 'Chapter Support'],
    useCases: ['Local video files', 'Advanced playback features', 'Custom video experiences', 'Professional video playback'],
    performance: 'high',
    complexity: 'advanced',
  },
  'video-player': {
    type: 'video-player',
    category: 'local',
    name: 'Video Player',
    description: 'Hybrid player supporting both YouTube embeds and local videos with custom controls overlay',
    features: ['Dual-mode operation', 'YouTube iframe support', 'HTML5 video', 'Custom controls', 'Fullscreen support', 'Time tracking'],
    useCases: ['Mixed content', 'Flexible video sources', 'Alternative watch page', 'Unified video interface'],
    performance: 'high',
    complexity: 'moderate',
  },
  'shorts-player': {
    type: 'shorts-player',
    category: 'local',
    name: 'Shorts Player',
    description: 'Dedicated player optimized for short-form vertical videos with mobile-first design',
    features: ['Vertical video optimization', 'Swipe navigation', 'Mobile-first design', 'Auto-loop', 'Social interactions'],
    useCases: ['Short-form content', 'Vertical videos', 'Mobile viewing', 'Social media style videos', 'TikTok-like experience'],
    performance: 'high',
    complexity: 'moderate',
  },
  'short-display-card': {
    type: 'short-display-card',
    category: 'local',
    name: 'Short Display Card',
    description: 'Individual short video player with social features and intersection observer autoplay',
    features: ['Intersection observer autoplay', 'Social action buttons', 'Loading states', 'Manual pause tracking', 'Muted autoplay'],
    useCases: ['Shorts feed', 'Home page shorts', 'Social video cards', 'Auto-playing video previews'],
    performance: 'high',
    complexity: 'moderate',
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

// Enabled Players Management
export const getEnabledYouTubePlayers = (): YouTubePlayerType[] => {
  return getSettings().enabledYouTubePlayers;
};

export const getEnabledLocalPlayers = (): LocalVideoPlayerType[] => {
  return getSettings().enabledLocalPlayers;
};

export const setEnabledYouTubePlayers = (players: YouTubePlayerType[]): void => {
  const settings = getSettings();
  saveSettings({ ...settings, enabledYouTubePlayers: players });
};

export const setEnabledLocalPlayers = (players: LocalVideoPlayerType[]): void => {
  const settings = getSettings();
  saveSettings({ ...settings, enabledLocalPlayers: players });
};

export const toggleYouTubePlayer = (playerType: YouTubePlayerType): void => {
  const settings = getSettings();
  const enabled = settings.enabledYouTubePlayers;
  const isEnabled = enabled.includes(playerType);

  if (isEnabled) {
    // Don't allow disabling if it's the only enabled player
    if (enabled.length > 1) {
      settings.enabledYouTubePlayers = enabled.filter(p => p !== playerType);
    }
  } else {
    settings.enabledYouTubePlayers = [...enabled, playerType];
  }

  saveSettings(settings);
};

export const toggleLocalPlayer = (playerType: LocalVideoPlayerType): void => {
  const settings = getSettings();
  const enabled = settings.enabledLocalPlayers;
  const isEnabled = enabled.includes(playerType);

  if (isEnabled) {
    // Don't allow disabling if it's the only enabled player
    if (enabled.length > 1) {
      settings.enabledLocalPlayers = enabled.filter(p => p !== playerType);
    }
  } else {
    settings.enabledLocalPlayers = [...enabled, playerType];
  }

  saveSettings(settings);
};

export const isPlayerEnabled = (playerType: VideoPlayerType): boolean => {
  const settings = getSettings();
  const config = VIDEO_PLAYER_CONFIGS[playerType];

  if (config.category === 'youtube') {
    return settings.enabledYouTubePlayers.includes(playerType as YouTubePlayerType);
  }
    return settings.enabledLocalPlayers.includes(playerType as LocalVideoPlayerType);

};

// Get current YouTube search provider
export const getYouTubeSearchProvider = (): YouTubeSearchProvider => {
  // Always use hybrid mode to ensure fallback mechanism works
  return 'hybrid';
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

// Check if YouTube Data API is configured (has API key)
export const isYouTubeApiConfigured = (): boolean => {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  return !!apiKey;
};

// Check if YouTube Data API is available for use (configured and not blocked)
export const isYouTubeApiAvailable = (): boolean => {
  return isYouTubeApiConfigured() && !isYouTubeDataApiBlocked();
};

// Check if hybrid mode is available (both APIs configured)
export const isHybridModeAvailable = (): boolean => {
  return isYouTubeApiConfigured() && isGoogleSearchAvailable();
};

// Get initial search keyword
export const getInitialSearchKeyword = (): string => {
  return getSettings().initialSearchKeyword || 'trending';
};

// Set initial search keyword
export const setInitialSearchKeyword = (keyword: string): void => {
  const settings = getSettings();
  saveSettings({ ...settings, initialSearchKeyword: keyword });
};

// Page-specific configuration management
export type PageType = 'watchPage' | 'homePage' | 'searchResultsPage';

export const getPagePlayerConfig = (page: PageType): PagePlayerConfig => {
  const settings = getSettings();
  return settings.pageConfigurations?.[page] || defaultSettings.pageConfigurations![page];
};

export const setPagePlayerConfig = (page: PageType, config: PagePlayerConfig): void => {
  const settings = getSettings();
  const pageConfigurations = settings.pageConfigurations || defaultSettings.pageConfigurations!;
  saveSettings({
    ...settings,
    pageConfigurations: {
      ...pageConfigurations,
      [page]: config,
    },
  });
};

export const getAllPageConfigurations = (): Record<PageType, PagePlayerConfig> => {
  const settings = getSettings();
  return settings.pageConfigurations || defaultSettings.pageConfigurations!;
};

export const getPageDisplayName = (page: PageType): string => {
  const displayNames: Record<PageType, string> = {
    watchPage: 'WatchPage',
    homePage: 'HomePage',
    searchResultsPage: 'SearchResultsPage',
  };
  return displayNames[page];
};

export const getPlayerUsageByPage = (playerType: VideoPlayerType): PageType[] => {
  const pageConfigs = getAllPageConfigurations();
  const config = VIDEO_PLAYER_CONFIGS[playerType];
  const pages: PageType[] = [];

  Object.entries(pageConfigs).forEach(([page, pageConfig]) => {
    const isUsed = config.category === 'youtube'
      ? pageConfig.youtubePlayer === playerType
      : pageConfig.localPlayer === playerType;

    if (isUsed) {
      pages.push(page as PageType);
    }
  });

  return pages;
};
