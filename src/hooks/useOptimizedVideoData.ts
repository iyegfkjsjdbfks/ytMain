import { useState, useEffect, useMemo, useCallback } from 'react';

// import { getVideos, getVideosByCategory } // // from '../services/realVideoService' // Service not found // Service not found;
import type { Video } from '../types';

interface UseVideoDataOptions {
  category?: string;
  limit?: number;
  enableCache?: boolean;
  refetchInterval?: number;
}

interface UseVideoDataReturn {
  data: Video;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>
}

// Simple in-memory cache
const videoCache = new Map<string, { data: Video; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Real video data fetcher
const fetchRealVideos = async (category?: string): Promise<Video[]> => {
  if (category && category !== 'all') {
    return getVideosByCategory(category);
  }
  return getVideos();
};

export const useOptimizedVideoData = ({
  category,
  limit = 20,
  enableCache = true,
  refetchInterval }: UseVideoDataOptions = {}): UseVideoDataReturn => {
  const [data, setData] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const cacheKey = useMemo(() => {
    return `videos-${category || 'all'}-${limit}`;
  }, [category, limit]);

  const fetchVideos = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        if (enableCache && pageNum === 1) {
          const cached = videoCache.get(cacheKey);
          if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            setData(cached.data);
            setLoading(false);
            return;
          }
        }

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Fetch real video data
        const allVideos = await fetchRealVideos(category);

        // Simulate pagination with real videos
        const startIndex = (pageNum - 1) * limit;
        const endIndex = startIndex + limit;
        const newVideos = allVideos.slice(startIndex, endIndex);

        // Check if there are more videos
        if (endIndex >= allVideos.length) {
          setHasMore(false);
        }

        const updatedData = append ? [...data, ...newVideos] : newVideos;
        setData(updatedData);

        // Cache the data
        if (enableCache && pageNum === 1) {
          videoCache.set(cacheKey, {
            data: updatedData,
            timestamp: Date.now() });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch videos';
        setError(errorMessage);
        console.error('Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    },
    [category, limit, enableCache, cacheKey, data]
  );

  const refetch = useCallback(async () => {
    setPage(1);
    setHasMore(true);
    await fetchVideos(1, false);
  }, [fetchVideos]);

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchVideos(nextPage, true);
    }
  }, [loading, hasMore, page, fetchVideos]);

  // Initial fetch
  useEffect(() => {
    fetchVideos(1, false);
  }, [category, limit]); // Removed fetchVideos from deps to avoid infinite loop

  // Auto-refetch interval
  useEffect(() => {
    if (!refetchInterval) {
      return;
    }

    const interval = setInterval(() => {
      refetch();
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval, refetch]);

  return {
    data,
    loading,
    error,
    refetch,
    hasMore,
    loadMore };
};

// Specialized hooks for different video types
export const useHomeVideos = (category?: string) => {
  return useOptimizedVideoData({
    ...(category && { category }),
    limit: 24,
    enableCache: true });
};

export const useTrendingVideos = () => {
  return useOptimizedVideoData({
    category: 'trending',
    limit: 20,
    enableCache: true,
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });
};

export const useChannelVideos = (channelId: any) => {
  return useOptimizedVideoData({
    category: `channel-${channelId}`,
    limit: 15,
    enableCache: true });
};

export const useSearchVideos = (query: any) => {
  return useOptimizedVideoData({
    category: `search-${query}`,
    limit: 20,
    enableCache: false, // Don't cache search results
  });
};
