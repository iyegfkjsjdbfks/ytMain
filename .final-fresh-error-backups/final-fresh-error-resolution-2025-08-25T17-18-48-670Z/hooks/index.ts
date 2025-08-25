/**
 * Root-level hooks index for backward compatibility
 * Re-export selected hooks from src/hooks and ensure pages importing from "../hooks" work.
 */
export { useVideoPlayer } from '../src/hooks/useVideoPlayer';
export { useFormState } from '../src/hooks/useFormState';
export { useAsyncState } from '../src/hooks/useAsyncState';
export { useTrendingSearch } from '../src/hooks/useTrendingSearch';
export { useIntersectionObserver, useVideoAutoplay } from '../src/hooks';

// Add missing re-exports used by pages
export { useSubscriptionsFeed, useTrendingVideos, useVideos, useChannelVideos } from '../src/hooks/useVideoData';

// Bridge for subscriptions feature hook expected at "../hooks"
export { default as useSubscriptions } from '../src/hooks/useSubscriptions';
