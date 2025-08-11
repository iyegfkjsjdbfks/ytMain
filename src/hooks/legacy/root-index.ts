// Legacy hooks from root level - re-exported for compatibility
export { default as useVideoPlayer } from './root-useVideoPlayer';
export { default as useLiveStream } from './root-useLiveStream';

// Analytics hooks
export { useAnalytics } from '../useAnalytics';

// Performance monitoring hooks
export { usePerformanceMonitor } from '../usePerformanceMonitor';

// PWA hooks
export { usePWA } from '../usePWA';
export { useInstallPrompt } from '../useInstallPrompt';
export { useServiceWorker } from '../useServiceWorker';
export { usePWAUpdates } from '../usePWAUpdates';

// Video data hooks
export { useVideoData } from '../useVideoData';
export { useVideosData } from '../useVideosData';
export { useOptimizedVideoData } from '../useOptimizedVideoData';

// Utility hooks
export { useDebounce } from '../useDebounce';
export { useLocalStorage } from '../useLocalStorage';
export { useLocalStorageSet } from '../useLocalStorageSet';
export { useMobileDetection } from '../useMobileDetection';
export { useOfflineStatus } from '../useOfflineStatus';

// Intersection observer hooks
export { useIntersectionObserver } from '../useIntersectionObserver';

// Video autoplay hooks
export { useVideoAutoplay } from '../useVideoAutoplay';
