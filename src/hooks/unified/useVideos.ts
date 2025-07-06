/**
 * Unified Video Hooks
 * Refactored video hooks using the new unified metadata system
 */

import { useQuery as useReactQuery } from '@tanstack/react-query';

import { videoApi, type VideoUploadData } from '../../services/api/videos';
import { type UnifiedVideoMetadata } from '../../services/metadataNormalizationService';
import { unifiedDataService, type UnifiedSearchFilters } from '../../services/unifiedDataService';

import { useQuery, useMutation, type UseApiConfig } from './useApi';

import type { Video, Short } from '../../types/core';

// Unified Video hooks using normalized metadata
export function useUnifiedVideos(
  limit: number = 50,
  filters: UnifiedSearchFilters = {},
  config?: UseApiConfig<UnifiedVideoMetadata[]>,
) {
  return useQuery(
    ['unified-videos', limit, JSON.stringify(filters)],
    async () => {
      const response = await unifiedDataService.getTrendingVideos(limit, filters);
      return { data: response.data, success: true, message: 'Videos fetched successfully' };
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...config,
    },
  );
}

export function useUnifiedVideo(videoId: string, config?: UseApiConfig<UnifiedVideoMetadata>) {
  console.log(`🎬 useUnifiedVideo hook called with videoId: ${videoId}`);
  console.log(`🎬 useUnifiedVideo hook enabled: ${!!videoId}`);

  // Use standard React Query hook with proper caching
  const result = useReactQuery({
    queryKey: ['unified-video', videoId], // Stable cache key
    queryFn: async () => {
      console.log(`🔍 useUnifiedVideo: Query function executing for ID: ${videoId}`);

      const video = await unifiedDataService.getVideoById(videoId);
      console.log(`📊 useUnifiedVideo: Result for ${videoId}:`, video ? `Found: ${video.title}` : 'Not found');
      return video;
    },
    enabled: !!videoId,
    staleTime: 5 * 60 * 1000, // 5 minutes - reasonable cache time
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
    refetchOnMount: false, // Don't refetch on mount if we have cached data
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 3, // Retry failed requests
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    ...config, // Allow overriding these settings
  });

  // Convert React Query result to match our custom hook format
  const customResult = {
    data: result.data,
    loading: result.isLoading,
    error: result.error ? String(result.error) : null,
    isStale: result.isStale,
    lastUpdated: result.dataUpdatedAt,
    refetch: result.refetch, // Expose refetch function
  };

  console.log('🎬 useUnifiedVideo hook result:', customResult);
  return customResult;
}

export function useUnifiedTrendingVideos(
  limit: number = 50,
  filters: UnifiedSearchFilters = {},
  config?: UseApiConfig<UnifiedVideoMetadata[]>,
) {
  return useQuery(
    ['unified-trending', limit, JSON.stringify(filters)],
    async () => {
      const response = await unifiedDataService.getTrendingVideos(limit, filters);
      return { data: response.data, success: true, message: 'Trending videos fetched successfully' };
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: true,
      ...config,
    },
  );
}

export function useFeaturedVideos(config?: UseApiConfig<Video[]>) {
  return useQuery(
    ['videos', 'featured'],
    () => videoApi.getFeaturedVideos(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...config,
    },
  );
}

export function useVideosByCategory(category: string, config?: UseApiConfig<Video[]>) {
  return useQuery(
    ['videos', 'category', category],
    () => videoApi.getVideosByCategory(category),
    {
      enabled: !!category,
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...config,
    },
  );
}

export function useSubscriptionFeed(config?: UseApiConfig<Video[]>) {
  return useQuery(
    ['videos', 'subscriptions'],
    () => videoApi.getSubscriptionFeed(),
    {
      staleTime: 1 * 60 * 1000, // 1 minute
      refetchOnWindowFocus: true,
      ...config,
    },
  );
}

export function useRelatedVideos(videoId: string, config?: UseApiConfig<Video[]>) {
  return useQuery(
    ['videos', 'related', videoId],
    () => videoApi.getRelatedVideos(videoId),
    {
      enabled: !!videoId,
      staleTime: 10 * 60 * 1000, // 10 minutes
      ...config,
    },
  );
}

export function useRecommendations(config?: UseApiConfig<Video[]>) {
  return useQuery(
    ['videos', 'recommendations'],
    () => videoApi.getRecommendations(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
      ...config,
    },
  );
}

export function useWatchHistory(config?: UseApiConfig<Video[]>) {
  return useQuery(
    ['videos', 'history'],
    () => videoApi.getWatchHistory(),
    {
      staleTime: 1 * 60 * 1000, // 1 minute
      ...config,
    },
  );
}

export function useLikedVideos(config?: UseApiConfig<Video[]>) {
  return useQuery(
    ['videos', 'liked'],
    () => videoApi.getLikedVideos(),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      ...config,
    },
  );
}

export function useSavedVideos(config?: UseApiConfig<Video[]>) {
  return useQuery(
    ['videos', 'saved'],
    () => videoApi.getSavedVideos(),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      ...config,
    },
  );
}

// Unified Shorts hooks
export function useUnifiedShorts(
  limit: number = 30,
  config?: UseApiConfig<UnifiedVideoMetadata[]>,
) {
  return useQuery(
    ['unified-shorts', String(limit)],
    async () => {
      const response = await unifiedDataService.getShortsVideos(limit);
      return { data: response.data, success: true, message: 'Shorts fetched successfully' };
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: true,
      ...config,
    },
  );
}

// Legacy shorts hooks (for backward compatibility)
export function useShorts(config?: UseApiConfig<Short[]>) {
  return useQuery(
    ['shorts'],
    () => videoApi.getShorts(),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: true,
      ...config,
    },
  );
}

export function useTrendingShorts(config?: UseApiConfig<Short[]>) {
  return useQuery(
    ['shorts', 'trending'],
    () => videoApi.getTrendingShorts(),
    {
      staleTime: 1 * 60 * 1000, // 1 minute
      refetchOnWindowFocus: true,
      ...config,
    },
  );
}

// Unified Search hook
export function useUnifiedSearchVideos(
  query: string,
  filters: UnifiedSearchFilters = {},
  limit: number = 50,
  config?: UseApiConfig<UnifiedVideoMetadata[]>,
) {
  return useQuery(
    ['unified-search', query, JSON.stringify(filters), String(limit)],
    async () => {
      const response = await unifiedDataService.searchVideos(query, filters, limit);
      return { data: response.data, success: true, message: 'Search results fetched successfully' };
    },
    {
      enabled: !!query && query.length > 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...config,
    },
  );
}

// Legacy search hook (for backward compatibility)
export function useSearchVideos(query: string, config?: UseApiConfig<Video[]>) {
  return useQuery(
    ['videos', 'search', query],
    () => videoApi.searchVideos({ query }),
    {
      enabled: !!query && query.length > 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...config,
    },
  );
}

// Mutation hooks
export function useUploadVideo() {
  return useMutation<Video, { file: File; data: VideoUploadData }>(
    ({ file, data }) => videoApi.uploadVideo(file, data),
    {
      onSuccess: (_data) => {
        },
      onError: (error) => {
        console.error('Video upload failed:', error.message);
      },
    },
  );
}

export function useUpdateVideo() {
  return useMutation<Video, { videoId: string; data: Partial<VideoUploadData> }>(
    ({ videoId, data }) => videoApi.updateVideo(videoId, data),
    {
      onSuccess: (_data) => {
        },
    },
  );
}

export function useDeleteVideo() {
  return useMutation<void, string>(
    (videoId) => videoApi.deleteVideo(videoId),
    {
      onSuccess: (_, _videoId) => {
        },
    },
  );
}

export function useLikeVideo() {
  return useMutation<void, string>(
    (videoId) => videoApi.likeVideo(videoId),
    {
      onSuccess: (_, _videoId) => {
        },
    },
  );
}

export function useUnlikeVideo() {
  return useMutation<void, string>(
    (videoId) => videoApi.unlikeVideo(videoId),
    {
      onSuccess: (_, _videoId) => {
        },
    },
  );
}

export function useSaveVideo() {
  return useMutation<void, string>(
    (videoId) => videoApi.saveVideo(videoId),
    {
      onSuccess: (_, _videoId) => {
        },
    },
  );
}

export function useUnsaveVideo() {
  return useMutation<void, string>(
    (videoId) => videoApi.unsaveVideo(videoId),
    {
      onSuccess: (_, _videoId) => {
        },
    },
  );
}

export function useIncrementViews() {
  return useMutation<void, string>(
    (videoId) => videoApi.incrementViews(videoId),
  );
}

export function useReportVideo() {
  return useMutation<void, { videoId: string; reason: string; description?: string }>(
    ({ videoId, reason, description }) => videoApi.reportVideo(videoId, reason, description),
    {
      onSuccess: () => {
        },
    },
  );
}

// Utility hooks
export function useVideoCategories(config?: UseApiConfig<string[]>) {
  return useQuery(
    ['videos', 'categories'],
    () => videoApi.getCategories(),
    {
      staleTime: 60 * 60 * 1000, // 1 hour
      ...config,
    },
  );
}

// Legacy hooks for backward compatibility
export function useVideos(params = {}, config?: UseApiConfig<Video[]>) {
  return useQuery(
    ['videos', JSON.stringify(params)],
    () => videoApi.getVideos(params),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...config,
    },
  );
}

export function useVideo(videoId: string, config?: UseApiConfig<Video>) {
  return useQuery(
    ['video', videoId],
    () => videoApi.getVideo(videoId),
    {
      enabled: !!videoId,
      staleTime: 10 * 60 * 1000, // 10 minutes
      ...config,
    },
  );
}

export function useTrendingVideos(config?: UseApiConfig<Video[]>) {
  return useQuery(
    ['videos', 'trending'],
    () => videoApi.getTrendingVideos(),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: true,
      ...config,
    },
  );
}

// Combined hooks for common patterns
export function useVideoWithRelated(videoId: string) {
  const video = useVideo(videoId);
  const relatedVideos = useRelatedVideos(videoId, {
    enabled: !!video.data,
  });

  return {
    video: video.data,
    relatedVideos: relatedVideos.data || [],
    loading: video.loading || relatedVideos.loading,
    error: video.error || relatedVideos.error,
    refetch: () => {
      video.refetch();
      relatedVideos.refetch();
    },
  };
}

export function useHomePageData() {
  const trendingVideos = useTrendingVideos();
  const featuredVideos = useFeaturedVideos();
  const recommendations = useRecommendations();

  return {
    trending: trendingVideos.data || [],
    featured: featuredVideos.data || [],
    recommendations: recommendations.data || [],
    loading: trendingVideos.loading || featuredVideos.loading || recommendations.loading,
    error: trendingVideos.error || featuredVideos.error || recommendations.error,
    refetch: () => {
      trendingVideos.refetch();
      featuredVideos.refetch();
      recommendations.refetch();
    },
  };
}
