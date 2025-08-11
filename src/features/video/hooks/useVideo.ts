
import { useQuery } from '@tanstack/react-query';

import { unifiedDataService } from '../../../services/unifiedDataService';

import { videoService } from '../services/videoService';

// Video query key factory
const videoKeys = {
  all: ['videos'] as const,
  lists: () => [...videoKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...videoKeys.lists(), filters] as const,
  details: () => [...videoKeys.all, 'detail'] as const,
  detail: (id) => [...videoKeys.details(), id] as const,
  unified: {
    all: ['unified-videos'] as const,
    lists: () => [...videoKeys.unified.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...videoKeys.unified.lists(), filters] as const,
    details: () => [...videoKeys.unified.all, 'detail'] as const,
    detail: (id) => [...videoKeys.unified.details(), id] as const,
  },
};

/**
 * Hook for fetching a single video by ID
 */
export const useVideo = (videoId) => {
  return useQuery({
    queryKey: videoKeys.detail(videoId),
    queryFn: () => videoService.getVideo(videoId),
    enabled: !!videoId,
  });
};

/**
 * Hook for fetching trending videos
 */
export const useTrendingVideos = (category?: string, limit: number = 20) => {
  return useQuery({
    queryKey: videoKeys.list({ type: 'trending', category, limit }),
    queryFn: () => videoService.getTrendingVideos(category, limit),
  });
};

/**
 * Hook for fetching recommended videos
 */
export const useRecommendedVideos = (videoId, limit: number = 10) => {
  return useQuery({
    queryKey: videoKeys.list({ type: 'recommended', videoId, limit }),
    queryFn: () => videoService.getRecommendedVideos(videoId, limit),
    enabled: !!videoId,
  });
};

/**
 * Hook for searching videos
 */
export const useSearchVideos = (query, limit: number = 20) => {
  return useQuery({
    queryKey: videoKeys.list({ type: 'search', query, limit }),
    queryFn: () => videoService.searchVideos(query, limit),
    enabled: !!query,
  });
};

// Unified video hooks for normalized metadata

/**
 * Hook for fetching a single video by ID using unified service
 */
export const useUnifiedVideo = (videoId) => {
  return useQuery({
    queryKey: videoKeys.unified.detail(videoId),
    queryFn: () => unifiedDataService.getVideoById(videoId),
    enabled: !!videoId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for fetching trending videos using unified service
 */
export const useUnifiedTrendingVideos = (limit: number = 50, filters = {}) => {
  return useQuery({
    queryKey: videoKeys.unified.list({ type: 'trending', limit, filters }),
    queryFn: async () => {
      const response = await unifiedDataService.getTrendingVideos(limit, filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for fetching shorts using unified service
 */
export const useUnifiedShorts = (limit: number = 30) => {
  return useQuery({
    queryKey: videoKeys.unified.list({ type: 'shorts', limit }),
    queryFn: async () => {
      const response = await unifiedDataService.getShortsVideos(limit);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for searching videos using unified service
 */
export const useUnifiedSearchVideos = (query, filters = {}, limit: number = 50) => {
  return useQuery({
    queryKey: videoKeys.unified.list({ type: 'search', query, filters, limit }),
    queryFn: async () => {
      const response = await unifiedDataService.searchVideos(query, filters, limit);
      return response.data;
    },
    enabled: !!query && query.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
