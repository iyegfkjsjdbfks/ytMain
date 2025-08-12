// Unified hooks system

// API hooks
export { useApi } from './useApi';
export { useEnhancedQuery } from '../useEnhancedQuery';
export type { UseApiConfig, UseApiState, UseApiReturn } from './useApi';

// Video hooks
export {
  useVideo,
  useTrendingVideos,
  useRecommendedVideos,
  useSearchVideos,
  useUnifiedVideo,
  useUnifiedTrendingVideos,
  useUnifiedShorts,
  useUnifiedSearchVideos } from '../../features/video/hooks/useVideo';

// Core type re-exports
export type {
  Video,
  Short,
  User,
  Channel,
  Playlist,
  Comment } from '../../types/core';
