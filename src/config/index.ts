import { FC } from 'react';
// Environment configuration
export const ENV = {
 NODE_ENV: import.meta.env.NODE_ENV || 'development',
 PROD: import.meta.env.PROD,
 DEV: import.meta.env.DEV,
 SSR: import.meta.env.SSR } as const;

// API Configuration
export const API_CONFIG = {
 BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
 TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
 RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3', 10),
 RETRY_DELAY: parseInt(import.meta.env.VITE_API_RETRY_DELAY || '1000', 10),

 // External APIs,
 YOUTUBE_API_KEY: import.meta.env.VITE_YOUTUBE_API_KEY || '',
 GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
 GOOGLE_SEARCH_API_KEY: import.meta.env.VITE_GOOGLE_SEARCH_API_KEY || '',
 GOOGLE_SEARCH_ENGINE_ID: import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID || '',

 // Rate limiting,
 RATE_LIMIT_REQUESTS: parseInt(import.meta.env.VITE_RATE_LIMIT_REQUESTS || '100', 10),
 RATE_LIMIT_WINDOW: parseInt(import.meta.env.VITE_RATE_LIMIT_WINDOW || '60000', 10), // 1 minute
} as const;

// Performance Configuration
export const PERFORMANCE_CONFIG = {
 // Caching,
 CACHE_TTL: parseInt(import.meta.env.VITE_CACHE_TTL || '300000', 10), // 5 minutes,
 CACHE_MAX_SIZE: parseInt(import.meta.env.VITE_CACHE_MAX_SIZE || '100', 10),

 // Video loading,
 VIDEO_PRELOAD_COUNT: parseInt(import.meta.env.VITE_VIDEO_PRELOAD_COUNT || '5', 10),
 VIDEO_CACHE_SIZE: parseInt(import.meta.env.VITE_VIDEO_CACHE_SIZE || '50', 10),

 // Pagination,
 DEFAULT_PAGE_SIZE: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE || '20', 10),
 MAX_PAGE_SIZE: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE || '100', 10),

 // Performance monitoring,
 PERFORMANCE_SAMPLE_RATE: parseFloat(import.meta.env.VITE_PERFORMANCE_SAMPLE_RATE || '0.1'),
 PERFORMANCE_BUDGET: {
 LCP: parseInt(import.meta.env.VITE_PERFORMANCE_LCP_BUDGET || '2500', 10),
 FCP: parseInt(import.meta.env.VITE_PERFORMANCE_FCP_BUDGET || '1800', 10),
 CLS: parseFloat(import.meta.env.VITE_PERFORMANCE_CLS_BUDGET || '0.1'),
 TTFB: parseInt(import.meta.env.VITE_PERFORMANCE_TTFB_BUDGET || '800', 10) },

 // Bundle size limits (in KB)
 BUNDLE_SIZE_BUDGET: {
 MAIN: parseInt(import.meta.env.VITE_BUNDLE_MAIN_BUDGET || '500', 10),
 VENDOR: parseInt(import.meta.env.VITE_BUNDLE_VENDOR_BUDGET || '1000', 10),
 CHUNK: parseInt(import.meta.env.VITE_BUNDLE_CHUNK_BUDGET || '200', 10) } } as const;

// Analytics Configuration
export const ANALYTICS_CONFIG = {
 ENABLED: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
 GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
 MIXPANEL_TOKEN: import.meta.env.VITE_MIXPANEL_TOKEN || '',

 // Tracking settings,
 TRACK_PAGE_VIEWS: import.meta.env.VITE_TRACK_PAGE_VIEWS !== 'false',
 TRACK_CLICKS: import.meta.env.VITE_TRACK_CLICKS === 'true',
 TRACK_SCROLL_DEPTH: import.meta.env.VITE_TRACK_SCROLL_DEPTH === 'true',
 TRACK_PERFORMANCE: import.meta.env.VITE_TRACK_PERFORMANCE === 'true',
 TRACK_ERRORS: import.meta.env.VITE_TRACK_ERRORS !== 'false',

 // Data retention,
 LOCAL_STORAGE_TTL: parseInt(import.meta.env.VITE_ANALYTICS_LOCAL_TTL || '604800000', 10), // 7 days,
 BATCH_SIZE: parseInt(import.meta.env.VITE_ANALYTICS_BATCH_SIZE || '10', 10),
 FLUSH_INTERVAL: parseInt(import.meta.env.VITE_ANALYTICS_FLUSH_INTERVAL || '30000', 10), // 30 seconds
} as const;

// Error Handling Configuration
export const ERROR_CONFIG = {
 ENABLED: import.meta.env.VITE_ERROR_TRACKING_ENABLED !== 'false',
 SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',

 // Error reporting,
 REPORT_ERRORS: import.meta.env.VITE_REPORT_ERRORS === 'true',
 ERROR_ENDPOINT: import.meta.env.VITE_ERROR_ENDPOINT || '',

 // Error filtering,
 IGNORE_ERRORS: [
 'ResizeObserver loop limit exceeded',
 'Non-Error promise rejection captured',
 'ChunkLoadError',
 'Loading chunk',
 'Script error'],

 // Rate limiting for error reports,
 MAX_ERRORS_PER_SESSION: parseInt(import.meta.env.VITE_MAX_ERRORS_PER_SESSION || '50', 10),
 ERROR_THROTTLE_MS: parseInt(import.meta.env.VITE_ERROR_THROTTLE_MS || '1000', 10) } as const;

// Feature Flags
export const FEATURE_FLAGS = {
 // UI Features,
 DARK_MODE: import.meta.env.VITE_FEATURE_DARK_MODE !== 'false',
 INFINITE_SCROLL: import.meta.env.VITE_FEATURE_INFINITE_SCROLL !== 'false',
 VIDEO_AUTOPLAY: import.meta.env.VITE_FEATURE_VIDEO_AUTOPLAY === 'true',
 LAZY_LOADING: import.meta.env.VITE_FEATURE_LAZY_LOADING !== 'false',

 // Advanced Features,
 OFFLINE_MODE: import.meta.env.VITE_FEATURE_OFFLINE_MODE === 'true',
 PWA: import.meta.env.VITE_FEATURE_PWA === 'true',
 PUSH_NOTIFICATIONS: import.meta.env.VITE_FEATURE_PUSH_NOTIFICATIONS === 'true',

 // Experimental Features,
 AI_RECOMMENDATIONS: import.meta.env.VITE_FEATURE_AI_RECOMMENDATIONS === 'true',
 VOICE_SEARCH: import.meta.env.VITE_FEATURE_VOICE_SEARCH === 'true',
 GESTURE_CONTROLS: import.meta.env.VITE_FEATURE_GESTURE_CONTROLS === 'true',

 // Development Features,
 DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true' || ENV.DEV,
 MOCK_API: import.meta.env.VITE_MOCK_API === 'true',
 PERFORMANCE_OVERLAY: import.meta.env.VITE_PERFORMANCE_OVERLAY === 'true' } as const;

// UI Configuration
export const UI_CONFIG = {
 // Theme,
 DEFAULT_THEME: import.meta.env.VITE_DEFAULT_THEME || 'light',
 THEME_STORAGE_KEY: 'yt-theme-preference',

 // Layout,
 SIDEBAR_WIDTH: parseInt(import.meta.env.VITE_SIDEBAR_WIDTH || '280', 10),
 HEADER_HEIGHT: parseInt(import.meta.env.VITE_HEADER_HEIGHT || '64', 10),
 FOOTER_HEIGHT: parseInt(import.meta.env.VITE_FOOTER_HEIGHT || '80', 10),

 // Video player,
 DEFAULT_VOLUME: parseFloat(import.meta.env.VITE_DEFAULT_VOLUME || '0.8'),
 DEFAULT_QUALITY: import.meta.env.VITE_DEFAULT_QUALITY || 'auto',
 AUTOPLAY_DELAY: parseInt(import.meta.env.VITE_AUTOPLAY_DELAY || '3000', 10),

 // Animations,
 ANIMATION_DURATION: parseInt(import.meta.env.VITE_ANIMATION_DURATION || '300', 10),
 REDUCED_MOTION: import.meta.env.VITE_REDUCED_MOTION === 'true',

 // Responsive breakpoints,
 BREAKPOINTS: {
 XS: 480,
 SM: 640,
 MD: 768,
 LG: 1024,
 XL: 1280,
 XXL: 1536 } } as const;

// Storage Configuration
export const STORAGE_CONFIG = {
 // Local Storage keys,
 KEYS: {
 USER_PREFERENCES: 'yt-user-preferences',
 WATCH_HISTORY: 'yt-watch-history',
 SEARCH_HISTORY: 'yt-search-history',
 FAVORITES: 'yt-favorites',
 PLAYLISTS: 'yt-playlists',
 CACHE: 'yt-cache',
 ANALYTICS: 'yt-analytics',
 ERRORS: 'yt-errors',
 PERFORMANCE: 'yt-performance' },

 // Storage limits,
 MAX_HISTORY_ITEMS: parseInt(import.meta.env.VITE_MAX_HISTORY_ITEMS || '1000', 10),
 MAX_SEARCH_HISTORY: parseInt(import.meta.env.VITE_MAX_SEARCH_HISTORY || '100', 10),
 MAX_CACHE_SIZE_MB: parseInt(import.meta.env.VITE_MAX_CACHE_SIZE_MB || '50', 10),

 // Cleanup intervals,
 CLEANUP_INTERVAL: parseInt(import.meta.env.VITE_STORAGE_CLEANUP_INTERVAL || '86400000', 10), // 24 hours,
 CACHE_CLEANUP_THRESHOLD: parseFloat(import.meta.env.VITE_CACHE_CLEANUP_THRESHOLD || '0.8'), // 80%
} as const;

// Security Configuration
export const SECURITY_CONFIG = {
 // Content Security Policy,
 CSP_ENABLED: import.meta.env.VITE_CSP_ENABLED === 'true',

 // API Security,
 API_KEY_ROTATION_INTERVAL: parseInt(import.meta.env.VITE_API_KEY_ROTATION_INTERVAL || '86400000', 10), // 24 hours

 // Input validation,
 MAX_INPUT_LENGTH: parseInt(import.meta.env.VITE_MAX_INPUT_LENGTH || '1000', 10),
 ALLOWED_FILE_TYPES: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,webp,mp4,webm').split(','),
 MAX_FILE_SIZE_MB: parseInt(import.meta.env.VITE_MAX_FILE_SIZE_MB || '10', 10),

 // Rate limiting,
 SEARCH_RATE_LIMIT: parseInt(import.meta.env.VITE_SEARCH_RATE_LIMIT || '10', 10), // per minute,
 COMMENT_RATE_LIMIT: parseInt(import.meta.env.VITE_COMMENT_RATE_LIMIT || '5', 10), // per minute,
 LIKE_RATE_LIMIT: parseInt(import.meta.env.VITE_LIKE_RATE_LIMIT || '30', 10), // per minute
} as const;

// Development Configuration
export const DEV_CONFIG = {
 // Hot reload,
 HOT_RELOAD: ENV.DEV,

 // Logging,
 LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || (ENV.DEV ? 'debug' : 'error'),
 CONSOLE_LOGS: ENV.DEV || import.meta.env.VITE_CONSOLE_LOGS === 'true',

 // Testing,
 MOCK_DELAY: parseInt(import.meta.env.VITE_MOCK_DELAY || '500', 10),
 MOCK_ERROR_RATE: parseFloat(import.meta.env.VITE_MOCK_ERROR_RATE || '0.1'),

 // Debug tools,
 REACT_DEVTOOLS: ENV.DEV,
 REDUX_DEVTOOLS: ENV.DEV,
 PERFORMANCE_DEVTOOLS: ENV.DEV || FEATURE_FLAGS.PERFORMANCE_OVERLAY } as const;

// Export all configurations
export const CONFIG = {
 ENV,
 API: API_CONFIG,
 PERFORMANCE: PERFORMANCE_CONFIG,
 ANALYTICS: ANALYTICS_CONFIG,
 ERROR: ERROR_CONFIG,
 FEATURES: FEATURE_FLAGS,
 UI: UI_CONFIG,
 STORAGE: STORAGE_CONFIG,
 SECURITY: SECURITY_CONFIG,
 DEV: DEV_CONFIG } as const;

// Type definitions
export type Config = typeof CONFIG;
export type FeatureFlags = typeof FEATURE_FLAGS;
export type ApiConfig = typeof API_CONFIG;
export type PerformanceConfig = typeof PERFORMANCE_CONFIG;
export type AnalyticsConfig = typeof ANALYTICS_CONFIG;
export type ErrorConfig = typeof ERROR_CONFIG;
export type UiConfig = typeof UI_CONFIG;
export type StorageConfig = typeof STORAGE_CONFIG;
export type SecurityConfig = typeof SECURITY_CONFIG;
export type DevConfig = typeof DEV_CONFIG;

// Validation functions
export const validateConfig = () => {
 const errors: string[] = [];

 // Validate required API keys in production
 if (ENV.PROD) {
 if (!API_CONFIG.YOUTUBE_API_KEY) {
 errors.push('VITE_YOUTUBE_API_KEY is required in production');
 }

 if (ANALYTICS_CONFIG.ENABLED && !ANALYTICS_CONFIG.GOOGLE_ANALYTICS_ID) {
 errors.push('VITE_GOOGLE_ANALYTICS_ID is required when analytics is enabled');
 }

 if (ERROR_CONFIG.REPORT_ERRORS && !ERROR_CONFIG.SENTRY_DSN && !ERROR_CONFIG.ERROR_ENDPOINT) {
 errors.push('Error reporting endpoint is required when error reporting is enabled');
 }
 // Validate numeric ranges
 if (PERFORMANCE_CONFIG.DEFAULT_PAGE_SIZE > PERFORMANCE_CONFIG.MAX_PAGE_SIZE) {
 errors.push('DEFAULT_PAGE_SIZE cannot be greater than MAX_PAGE_SIZE');
 }

 if (UI_CONFIG.DEFAULT_VOLUME < 0 || UI_CONFIG.DEFAULT_VOLUME > 1) {
 errors.push('DEFAULT_VOLUME must be between 0 and 1');
 }

 if (PERFORMANCE_CONFIG.PERFORMANCE_SAMPLE_RATE < 0 || PERFORMANCE_CONFIG.PERFORMANCE_SAMPLE_RATE > 1) {
 errors.push('PERFORMANCE_SAMPLE_RATE must be between 0 and 1');
 }
 }

 return errors;
};

// Initialize configuration validation
if (ENV.DEV) {
 const configErrors = validateConfig();
 if (configErrors.length > 0) {
 (console as any).warn('Configuration validation errors:', configErrors);
 }
}

export default CONFIG;