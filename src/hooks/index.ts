// Main hooks index - comprehensive exports
// Basic hooks
export { useFormState } from './useFormState';
export { useAsyncState } from './useAsyncState';
export { useTrendingSearch } from './useTrendingSearch';
export { useIntersectionObserver } from './useIntersectionObserver';
export { useVideoAutoplay } from './useVideoAutoplay';
export { useDebounce } from './useDebounce';
export { useLocalStorage } from './useLocalStorage';
export { useDropdownMenu } from './useDropdownMenu';
export { useOptimizedVideoData } from './useOptimizedVideoData';
export { useWatchPage } from './useWatchPage';

// Video hooks
export { useVideoPlayer } from './useVideoPlayer';
export { useVideoData } from './useVideoData';
export { useVideosData } from './useVideosData';

// Shorts and specialized hooks
export { useShortsData } from './useShortsData';

// Helper function for missing hooks
export const useHomeVideos = () => {
  // Placeholder implementation
  return [];
};

export const useShortsVideos = () => {
  // Placeholder implementation
  return [];
};

// Re-export from unified hooks
export * from './unifiedHooks';
export * from './unified';
