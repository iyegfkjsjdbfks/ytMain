// Unified hooks system

// API hooks
export { 
  useApi,
  useQueryClient,
  useEnhancedQuery
} from './useApi';
export type { 
  UseApiConfig,
  UseApiState,
  UseApiReturn 
} from './useApi';

// Video hooks
export {
  useVideos,
  useVideo,
  useVideoSearch,
  useVideoCache,
  useVideoInteractions,
  useTrendingVideos,
  useChannelVideos,
  usePlaylistVideos,
  useVideoRecommendations,
  useVideoAnalytics,
  useVideoUpload,
  useVideoMetadata,
  useVideoComments,
  useVideoLikes,
  useVideoShares,
  useVideoSaves,
  useShortsData,
  useHomePageData
} from './useVideos';

// Core type re-exports
export type { Video, Short, User, Channel, Playlist, Comment } from '../../types/core';
