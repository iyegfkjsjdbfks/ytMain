/**
 * Unified Type Index
 * Central export point for all types to prevent conflicts
 */

// Core types - primary source
export * from './src/types/core';

// YouTube types (excluding conflicting ones)
export type {
  YouTubeVideo,
  YouTubeChannel,
  YouTubePlaylist,
  YouTubeSearchResult,
  YouTubeVideoStatus,
  YouTubeChannelContentDetails,
  YouTubeSearchResponse,
  YouTubeVideosResponse,
  YouTubeChannelsResponse,
  YouTubePlaylistsResponse,
} from './src/types/youtube';

// Error types (primary source for YouTubeApiError)
export * from './src/types/errors';

// Livestream types
export * from './src/types/livestream';

// Unified exports
export type { UnifiedVideo } from './src/types/unified';