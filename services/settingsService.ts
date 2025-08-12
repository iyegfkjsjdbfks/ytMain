// / <reference types="vite/client" />
// Settings service for managing application settings
import type { Video } from '../types';
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
  features: string;
  useCases: string;
  performance: 'high' | 'medium' | 'low';
  complexity: 'simple' | 'moderate' | 'advanced'
}

export interface PagePlayerConfig {
  youtubePlayer: YouTubePlayerType;
  localPlayer: LocalVideoPlayerType;
  defaultCategory: 'youtube' | 'local'
}

export interface Settings {
  youtubeSearchProvider: YouTubeSearchProvider;
  youtubePlayerType: YouTubePlayerType;
  localVideoPlayerType: LocalVideoPlayerType;
  defaultVideoPlayerCategory: 'youtube' | 'local';
  enabledYouTubePlayers: YouTubePlayerType;
  enabledLocalPlayers: LocalVideoPlayerType;
  initialSearchKeyword?: string;
  pageConfigurations?: {
    watchPage: PagePlayerConfig;
    homePage: PagePlayerConfig;
    searchResultsPage: PagePlayerConfig
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
      defaultCategory: 'youtube' },
    homePage: {
      youtubePlayer: 'youtube-player',
      localPlayer: 'advanced-video-player',
      defaultCategory: 'youtube' },
    searchResultsPage: {
      youtubePlayer: 'youtube-player-wrapper',
      localPlayer: 'advanced-video-player',
      defaultCategory: 'youtube' } } };

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
    complexity: 'simple' },
  'youtube-player-wrapper': {
    type: 'youtube-player-wrapper',
    category: 'youtube',
    name: 'YouTube Player Wrapper',
    description: 'Simplified wrapper component that provides easy-to-use props interface for YouTube Player',
    features: ['Simplified API', 'Props-based configuration', 'Mock video object creation', 'YouTube Player integration'],
    useCases: ['Quick YouTube embedding', 'Simplified integration', 'Video cards', 'Component reusability'],
    performance: 'high',
    complexity: 'simple' },
  'youtube-player-example': {
    type: 'youtube-player-example',
    category: 'youtube',
    name: 'YouTube Player Example',
    description: 'Educational/demo implementation showcasing YouTube player capabilities and usage patterns',
    features: ['Demo functionality', 'Player state tracking', 'Control examples', 'Progress monitoring', 'Educational code'],
    useCases: ['Development demos', 'Testing', 'Learning examples', 'Prototyping'],
    performance: 'medium',
    complexity: 'simple' },
  'advanced-video-player': {
    type: 'advanced-video-player',
    category: 'local',
    name: 'Advanced Video Player',
    description: 'Feature-rich video player with advanced controls and modern React patterns for local video files',
    features: ['Advanced Controls', 'Custom Hooks', 'State Management', 'Quality Selection', 'Fullscreen Support', 'Chapter Support'],
    useCases: ['Local video files', 'Advanced playback features', 'Custom video experiences', 'Professional video playback'],
    performance: 'high',
    complexity: 'advanced' },
  'video-player': {
    type: 'video-player',
    category: 'local',
    name: 'Video Player',
    description: 'Hybrid player supporting both YouTube embeds and local videos with custom controls overlay',
    features: ['Dual-mode operation', 'YouTube iframe support', 'HTML5 video', 'Custom controls', 'Fullscreen support', 'Time tracking'],
    useCases: ['Mixed content', 'Flexible video sources', 'Alternative watch page', 'Unified video interface'],
    performance: 'high',
    complexity: 'moderate' },
  'shorts-player': {
    type: 'shorts-player',
    category: 'local',
    name: 'Shorts Player',
    description: 'Dedicated player optimized for short-form vertical videos with mobile-first design',
    features: ['Vertical video optimization', 'Swipe navigation', 'Mobile-first design', 'Auto-loop', 'Social interactions'],
    useCases: ['Short-form content', 'Vertical videos', 'Mobile viewing', 'Social media style videos', 'TikTok-like experience'],
    performance: 'high',
    complexity: 'moderate' },
  'short-display-card': {
    type: 'short-display-card',
    category: 'local',
    name: 'Short Display Card',
    description: 'Individual short video player with social features and intersection observer autoplay',
    features: ['Intersection observer autoplay', 'Social action buttons', 'Loading states', 'Manual pause tracking', 'Muted autoplay'],
    useCases: ['Shorts feed', 'Home page shorts', 'Social video cards', 'Auto-playing video previews'],
    performance: 'high',
    complexity: 'moderate' } };

export const getSettings: any = (): Settings => {
  const stored = (localStorage as any).getItem('appSettings');
  if (stored as any) {
    try {
      return { ...defaultSettings as any, ...JSON.parse(stored) };
    } catch (error: any) {
      (console as any).error('Error parsing stored settings:', error);
    }
  }
  return defaultSettings;
};

export const saveSettings: any = (settings: Settings): void => {
  (localStorage as any).setItem('appSettings', JSON.stringify(settings));
};

export const getYouTubePlayerType: any = (): YouTubePlayerType => {
  return getSettings().youtubePlayerType;
};

export const setYouTubePlayerType: any = (playerType: YouTubePlayerType): void => {
  const settings = getSettings();
  saveSettings({ ...settings as any, youtubePlayerType: playerType });
};

export const getLocalVideoPlayerType: any = (): LocalVideoPlayerType => {
  return getSettings().localVideoPlayerType;
};

export const setLocalVideoPlayerType: any = (playerType: LocalVideoPlayerType): void => {
  const settings = getSettings();
  saveSettings({ ...settings as any, localVideoPlayerType: playerType });
};

export const getDefaultVideoPlayerCategory: any = (): 'youtube' | 'local' => {
  return getSettings().defaultVideoPlayerCategory;
};

export const setDefaultVideoPlayerCategory: any = (category: 'youtube' | 'local'): void => {
  const settings = getSettings();
  saveSettings({ ...settings as any, defaultVideoPlayerCategory: category });
};

export const getVideoPlayerConfig: any = (type: VideoPlayerType): VideoPlayerConfig => {
  return VIDEO_PLAYER_CONFIGS[type];
};

export const getVideoPlayersByCategory: any = (category: 'youtube' | 'local'): VideoPlayerConfig[] => {
  return Object.values(VIDEO_PLAYER_CONFIGS).filter((config: any) => config.category === category);
};

export const getAllVideoPlayers: any = (): VideoPlayerConfig[] => {
  return Object.values(VIDEO_PLAYER_CONFIGS);
};

// Enabled Players Management
export const getEnabledYouTubePlayers: any = (): YouTubePlayerType[] => {
  return getSettings().enabledYouTubePlayers;
};

export const getEnabledLocalPlayers: any = (): LocalVideoPlayerType[] => {
  return getSettings().enabledLocalPlayers;
};

export const setEnabledYouTubePlayers: any = (players: YouTubePlayerType): void => {
  const settings = getSettings();
  saveSettings({ ...settings as any, enabledYouTubePlayers: players });
};

export const setEnabledLocalPlayers: any = (players: LocalVideoPlayerType): void => {
  const settings = getSettings();
  saveSettings({ ...settings as any, enabledLocalPlayers: players });
};

export const toggleYouTubePlayer: any = (playerType: YouTubePlayerType): void => {
  const settings = getSettings();
  const enabled = settings.enabledYouTubePlayers;
  const isEnabled = enabled.includes(playerType);

  if (isEnabled as any) {
    // Don't allow disabling if it's the only enabled player
    if (enabled.length > 1) {
      settings.enabledYouTubePlayers = enabled.filter((p: any) => p !== playerType)
    }
  } else {
    settings.enabledYouTubePlayers = [...enabled as any, playerType];
  }

  saveSettings(settings);
};

export const toggleLocalPlayer: any = (playerType: LocalVideoPlayerType): void => {
  const settings = getSettings();
  const enabled = settings.enabledLocalPlayers;
  const isEnabled = enabled.includes(playerType);

  if (isEnabled as any) {
    // Don't allow disabling if it's the only enabled player
    if (enabled.length > 1) {
      settings.enabledLocalPlayers = enabled.filter((p: any) => p !== playerType)
    }
  } else {
    settings.enabledLocalPlayers = [...enabled as any, playerType];
  }

  saveSettings(settings);
};

export const isPlayerEnabled: any = (playerType: VideoPlayerType): boolean => {
  const settings = getSettings();
  const config = VIDEO_PLAYER_CONFIGS[playerType];

  if (config.category === 'youtube') {
    return settings.enabledYouTubePlayers.includes(playerType as YouTubePlayerType);
  }
    return settings.enabledLocalPlayers.includes(playerType as LocalVideoPlayerType);

};

// Get current YouTube search provider
export const getYouTubeSearchProvider: any = (): YouTubeSearchProvider => {
  // Always use hybrid mode to ensure fallback mechanism works
  return 'hybrid';
};

// Set YouTube search provider
export const setYouTubeSearchProvider: any = (provider: YouTubeSearchProvider): void => {
  const settings = getSettings();
  settings.youtubeSearchProvider = provider;
  saveSettings(settings);
};

// Check if Google Custom Search is available
export const isGoogleSearchAvailable: any = (): boolean => {
  const apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
  const engineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;
  return !!(apiKey && engineId);
};

// Check if YouTube Data API is configured (has API key)
export const isYouTubeApiConfigured: any = (): boolean => {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  return !!apiKey;
};

// Check if YouTube Data API is available for use (configured and not blocked)
export const isYouTubeApiAvailable: any = (): boolean => {
  return isYouTubeApiConfigured() && !isYouTubeDataApiBlocked();
};

// Check if hybrid mode is available (both APIs configured)
export const isHybridModeAvailable: any = (): boolean => {
  return isYouTubeApiConfigured() && isGoogleSearchAvailable();
};

// Get initial search keyword
export const getInitialSearchKeyword: any = (): string => {
  return getSettings().initialSearchKeyword || 'trending';
};

// Set initial search keyword
export const setInitialSearchKeyword: any = (keyword: any): void => {
  const settings = getSettings();
  saveSettings({ ...settings as any, initialSearchKeyword: keyword });
};

// Page-specific configuration management
export type PageType = 'watchPage' | 'homePage' | 'searchResultsPage';

export const getPagePlayerConfig: any = (page: PageType): PagePlayerConfig => {
  const settings = getSettings();
  return settings.pageConfigurations?.[page] || defaultSettings.pageConfigurations![page];
};

export const setPagePlayerConfig: any = (page: PageType, config: PagePlayerConfig): void => {
  const settings = getSettings();
  const pageConfigurations = settings.pageConfigurations || defaultSettings.pageConfigurations!;
  saveSettings({
    ...settings as any,
    pageConfigurations: {
      ...pageConfigurations as any,
      [page]: config } });
};

export const getAllPageConfigurations: any = (): Record<PageType, PagePlayerConfig> => {
  const settings = getSettings();
  return settings.pageConfigurations || defaultSettings.pageConfigurations!;
};

export const getPageDisplayName: any = (page: PageType): string => {
  const displayNames: Record<PageType, string> = {
    watchPage: 'WatchPage',
    homePage: 'HomePage',
    searchResultsPage: 'SearchResultsPage' };
  return displayNames[page];
};

export const getPlayerUsageByPage: any = (playerType: VideoPlayerType): PageType[] => {
  const pageConfigs = getAllPageConfigurations();
  const config = VIDEO_PLAYER_CONFIGS[playerType];
  const pages: PageType = [];

  Object.entries(pageConfigs).forEach(([page, pageConfig]) => {
    const isUsed = config.category === 'youtube'
      ? pageConfig.youtubePlayer === playerType
      : pageConfig.localPlayer === playerType;

    if (isUsed as any) {
      pages.push(page as PageType);
    }
  });

  return pages;
};
