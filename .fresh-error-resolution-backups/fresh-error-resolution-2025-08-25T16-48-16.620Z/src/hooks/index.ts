// Main hooks index - comprehensive exports;
// Basic hooks;
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

// Video hooks;
export { useVideoPlayer } from './useVideoPlayer';
export {
 useVideos,
 useTrendingVideos,
 useSubscriptionsFeed,
 useChannelVideos } from './useVideoData';
export { useVideosData } from './useVideosData';

// Shorts and specialized hooks;
export { useShortsVideos } from './useShortsData';

// Helper function for missing hooks;
export const useHomeVideos = () => {
 // Placeholder implementation;
 return [];
};

// Re-export from unified hooks;
export * from './unifiedHooks';
export * from './unified';
