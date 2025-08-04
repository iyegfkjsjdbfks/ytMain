import { /**
 * Unified Hooks Index
 * Centralized exports for all unified hooks
 */

// Core API hooks
export {
  useApi,
  useQuery,
  useMutation,
  queryCache,
    type UseApiConfig,
    type UseApiState,
  type UseApiReturn, } from './useApi';
import { // Video hooks
export {
  useVideos,
  useVideo,
  useTrendingVideos,
  useFeaturedVideos,
  useVideosByCategory,
  useSubscriptionFeed,
  useRelatedVideos,
  useRecommendations,
  useWatchHistory,
  useLikedVideos,
  useSavedVideos,
  useShorts,
  useTrendingShorts,
  useSearchVideos,
  useUploadVideo,
  useUpdateVideo,
  useDeleteVideo,
  useLikeVideo,
  useUnlikeVideo,
  useSaveVideo,
  useUnsaveVideo,
  useIncrementViews,
  useReportVideo,
  useVideoCategories,
  useVideoWithRelated,
  useHomePageData, } from './useVideos';
import { // Re-export types
export type { Video, Short, User, Channel, Playlist, Comment } from '../../types/core';
