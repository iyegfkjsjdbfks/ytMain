import { useQuery } from '@tanstack/react-query';

import { videoService } from '../services/videoService';

// Video query key factory
const videoKeys = {
  all: ['videos'] as const,
  lists: () => [...videoKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...videoKeys.lists(), filters] as const,
  details: () => [...videoKeys.all, 'detail'] as const,
  detail: (id: string) => [...videoKeys.details(), id] as const,
};

/**
 * Hook for fetching a single video by ID
 */
export const useVideo = (videoId: string) => {
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
export const useRecommendedVideos = (videoId: string, limit: number = 10) => {
  return useQuery({
    queryKey: videoKeys.list({ type: 'recommended', videoId, limit }),
    queryFn: () => videoService.getRecommendedVideos(videoId, limit),
    enabled: !!videoId,
  });
};

/**
 * Hook for searching videos
 */
export const useSearchVideos = (query: string, limit: number = 20) => {
  return useQuery({
    queryKey: videoKeys.list({ type: 'search', query, limit }),
    queryFn: () => videoService.searchVideos(query, limit),
    enabled: !!query,
  });
};
