/**
 * Application Constants
 * Centralized configuration and constants for the YouTube clone
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 } as const;

// UI Constants
export const UI_CONSTANTS = {
  HEADER_HEIGHT: '3.5rem',
  SIDEBAR_WIDTH: '240px',
  SIDEBAR_COLLAPSED_WIDTH: '72px',
  MOBILE_BREAKPOINT: '768px',
  TABLET_BREAKPOINT: '1024px',
  DESKTOP_BREAKPOINT: '1280px' } as const;

// Video Configuration
export const VIDEO_CONFIG = {
  THUMBNAIL_SIZES: {
    SMALL: { width: 168, height: 94 },
    MEDIUM: { width: 320, height: 180 },
    LARGE: { width: 480, height: 270 },
    EXTRA_LARGE: { width: 640, height: 360 } },
  SUPPORTED_FORMATS: ['mp4', 'webm', 'ogg'],
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  QUALITY_LEVELS: ['144p', '240p', '360p', '480p', '720p', '1080p'],
  AUTOPLAY_THRESHOLD: 0.5, // 50% visibility
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  INFINITE_SCROLL_THRESHOLD: 0.8 } as const;

// Cache Configuration
export const CACHE_CONFIG = {
  VIDEO_DATA_TTL: 5 * 60 * 1000, // 5 minutes
  SEARCH_RESULTS_TTL: 2 * 60 * 1000, // 2 minutes
  USER_DATA_TTL: 10 * 60 * 1000, // 10 minutes
  MAX_CACHE_SIZE: 50, // Maximum number of cached items
} as const;

// Animation Durations
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000 } as const;

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  NOTIFICATION: 1080 } as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'youtube-clone-theme',
  USER_PREFERENCES: 'youtube-clone-preferences',
  WATCH_HISTORY: 'youtube-clone-watch-history',
  LIKED_VIDEOS: 'youtube-clone-liked-videos',
  SUBSCRIPTIONS: 'youtubeCloneSubscriptions_v1',
  PLAYLISTS: 'youtube-clone-playlists',
  SEARCH_HISTORY: 'youtube-clone-search-history',
  VOLUME_LEVEL: 'youtube-clone-volume',
  PLAYBACK_SPEED: 'youtube-clone-playback-speed' } as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  VIDEO_NOT_FOUND: 'Video not found or has been removed.',
  UNAUTHORIZED: 'You need to be logged in to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UPLOAD_ERROR: 'Failed to upload file. Please try again.',
  PLAYBACK_ERROR: 'Video playback failed. Please try again.' } as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  VIDEO_UPLOADED: 'Video uploaded successfully!',
  COMMENT_POSTED: 'Comment posted successfully!',
  SUBSCRIPTION_ADDED: 'Successfully subscribed to channel!',
  SUBSCRIPTION_REMOVED: 'Successfully unsubscribed from channel!',
  PLAYLIST_CREATED: 'Playlist created successfully!',
  VIDEO_LIKED: 'Video added to liked videos!',
  VIDEO_SAVED: 'Video saved to Watch Later!' } as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_LIVE_STREAMING: true,
  ENABLE_SHORTS: true,
  ENABLE_COMMUNITY_POSTS: true,
  ENABLE_PREMIUM_FEATURES: false,
  ENABLE_ANALYTICS: true,
  ENABLE_MONETIZATION: false,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_DARK_MODE: true } as const;

// Social Media Links
export const SOCIAL_LINKS = {
  TWITTER: 'https://twitter.com/youtubeclone',
  FACEBOOK: 'https://facebook.com/youtubeclone',
  INSTAGRAM: 'https://instagram.com/youtubeclone',
  GITHUB: 'https://github.com/youtubeclone' } as const;

// Content Categories
export const CATEGORIES = [
  'All',
  'Gaming',
  'Music',
  'Sports',
  'News',
  'Entertainment',
  'Education',
  'Science & Technology',
  'Travel & Events',
  'People & Blogs',
  'Comedy',
  'Film & Animation',
  'Autos & Vehicles',
  'Pets & Animals',
  'Howto & Style',
  'Nonprofits & Activism',
] as const;

// Video Qualities
export const VIDEO_QUALITIES = [
  { label: 'Auto', value: 'auto' },
  { label: '1080p', value: '1080' },
  { label: '720p', value: '720' },
  { label: '480p', value: '480' },
  { label: '360p', value: '360' },
  { label: '240p', value: '240' },
  { label: '144p', value: '144' },
] as const;

// Playback Speeds
export const PLAYBACK_SPEEDS = [
  { label: '0.25x', value: 0.25 },
  { label: '0.5x', value: 0.5 },
  { label: '0.75x', value: 0.75 },
  { label: 'Normal', value: 1 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x', value: 1.5 },
  { label: '1.75x', value: 1.75 },
  { label: '2x', value: 2 },
] as const;

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  VIDEO_ID: /^[a-zA-Z0-9_-]{11}$/,
  CHANNEL_ID: /^UC[a-zA-Z0-9_-]{22}$/,
  PLAYLIST_ID: /^PL[a-zA-Z0-9_-]{32}$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/ } as const;

// Date Formats
export const DATE_FORMATS = {
  FULL: 'MMMM d, yyyy',
  SHORT: 'MMM d, yyyy',
  RELATIVE: 'relative',
  TIME_AGO: 'time-ago' } as const;

// Export all constants as a single object for easier importing
export const CONSTANTS = {
  API_CONFIG,
  UI_CONSTANTS,
  VIDEO_CONFIG,
  PAGINATION,
  CACHE_CONFIG,
  ANIMATIONS,
  Z_INDEX,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURE_FLAGS,
  SOCIAL_LINKS,
  CATEGORIES,
  VIDEO_QUALITIES,
  PLAYBACK_SPEEDS,
  REGEX_PATTERNS,
  DATE_FORMATS } as const;
