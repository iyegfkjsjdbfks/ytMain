/**
 * Unified Video Hooks
 * Refactored video hooks using the new unified API system
 */

import { videoApi, type GetVideosParams, type VideoUploadData } from '../../services/api/videos';

import { useQuery, useMutation, type UseApiConfig } from './useApi';

import type { Video, Short } from '../../types/core';

// Video hooks
export function useVideos(params: GetVideosParams = {}, config?: UseApiConfig<Video[]>) {
  return useQuery(
    `videos-${JSON.stringify(params)}`,
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

// Shorts hooks
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

// Search hook
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
      onSuccess: (data) => {
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
      onSuccess: (data) => {
        },
    },
  );
}

export function useDeleteVideo() {
  return useMutation<void, string>(
    (videoId) => videoApi.deleteVideo(videoId),
    {
      onSuccess: (_, videoId) => {
        },
    },
  );
}

export function useLikeVideo() {
  return useMutation<void, string>(
    (videoId) => videoApi.likeVideo(videoId),
    {
      onSuccess: (_, videoId) => {
        },
    },
  );
}

export function useUnlikeVideo() {
  return useMutation<void, string>(
    (videoId) => videoApi.unlikeVideo(videoId),
    {
      onSuccess: (_, videoId) => {
        },
    },
  );
}

export function useSaveVideo() {
  return useMutation<void, string>(
    (videoId) => videoApi.saveVideo(videoId),
    {
      onSuccess: (_, videoId) => {
        },
    },
  );
}

export function useUnsaveVideo() {
  return useMutation<void, string>(
    (videoId) => videoApi.unsaveVideo(videoId),
    {
      onSuccess: (_, videoId) => {
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
