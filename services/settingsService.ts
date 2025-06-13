// Settings service for managing application preferences

export type YouTubeSearchProvider = 'youtube-api' | 'google-search' | 'hybrid';
export type YouTubePlayerType = 'optimized' | 'iframe-api';

export interface AppSettings {
  youtubeSearchProvider: YouTubeSearchProvider;
  youtubePlayerType: YouTubePlayerType;
}

const SETTINGS_KEY = 'yt-studio-settings';

const defaultSettings: AppSettings = {
  youtubeSearchProvider: 'hybrid',
  youtubePlayerType: 'optimized'
};

// Get current settings from localStorage
export const getSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return defaultSettings;
};

// Save settings to localStorage
export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
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

// Get current YouTube player type
export const getYouTubePlayerType = (): YouTubePlayerType => {
  return getSettings().youtubePlayerType;
};

// Set YouTube player type
export const setYouTubePlayerType = (playerType: YouTubePlayerType): void => {
  const settings = getSettings();
  settings.youtubePlayerType = playerType;
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