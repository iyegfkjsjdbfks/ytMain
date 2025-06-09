import { useState, useEffect, useMemo, useCallback } from 'react';
import { Video } from '../types';

interface UseVideoDataOptions {
  category?: string;
  limit?: number;
  enableCache?: boolean;
  refetchInterval?: number;
}

interface UseVideoDataReturn {
  data: Video[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

// Simple in-memory cache
const videoCache = new Map<string, { data: Video[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Mock data generator for development
const generateMockVideos = (count: number, category?: string): Video[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `video-${Date.now()}-${index}`,
    title: `Sample Video ${index + 1} ${category ? `- ${category}` : ''}`,
    description: `This is a sample video description for video ${index + 1}`,
    thumbnailUrl: `https://picsum.photos/320/180?random=${index}`,
    videoUrl: `https://example.com/video-${index}.mp4`,
    duration: `${Math.floor(Math.random() * 600) + 60}`, // 1-10 minutes as string
    views: `${Math.floor(Math.random() * 1000000)}`,
    uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    channelName: `Channel ${Math.floor(Math.random() * 100)}`,
    channelAvatarUrl: `https://picsum.photos/40/40?random=${index + 1000}`,
    category: category ?? ['Technology', 'Gaming', 'Music', 'Education', 'Entertainment'][Math.floor(Math.random() * 5)],
    tags: [`tag${index}`, `sample`, category || 'general'].filter(Boolean),
    likes: Math.floor(Math.random() * 10000),
    dislikes: Math.floor(Math.random() * 1000),
    isLive: Math.random() > 0.9,
    channelId: `channel-${Math.floor(Math.random() * 100)}`,
    isSaved: false,
    isLiked: false,
    isDisliked: false,
    visibility: 'public' as const,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  }));
};

export const useOptimizedVideoData = ({
  category,
  limit = 20,
  enableCache = true,
  refetchInterval,
}: UseVideoDataOptions = {}): UseVideoDataReturn => {
  const [data, setData] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const cacheKey = useMemo(() => {
    return `videos-${category || 'all'}-${limit}`;
  }, [category, limit]);

  const fetchVideos = useCallback(async (pageNum: number = 1, append: boolean = false) => {
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

      // Generate mock data
      const newVideos = generateMockVideos(limit, category);
      
      // Simulate pagination
      if (pageNum > 3) {
        setHasMore(false);
        return;
      }

      const updatedData = append ? [...data, ...newVideos] : newVideos;
      setData(updatedData);

      // Cache the data
      if (enableCache && pageNum === 1) {
        videoCache.set(cacheKey, {
          data: updatedData,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch videos';
      setError(errorMessage);
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  }, [category, limit, enableCache, cacheKey, data]);

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
    if (!refetchInterval) return;

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
    loadMore,
  };
};

// Specialized hooks for different video types
export const useHomeVideos = (category?: string) => {
  return useOptimizedVideoData({
    ...(category && { category }),
    limit: 24,
    enableCache: true,
  });
};

export const useTrendingVideos = () => {
  return useOptimizedVideoData({
    category: 'trending',
    limit: 20,
    enableCache: true,
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });
};

export const useChannelVideos = (channelId: string) => {
  return useOptimizedVideoData({
    category: `channel-${channelId}`,
    limit: 15,
    enableCache: true,
  });
};

export const useSearchVideos = (query: string) => {
  return useOptimizedVideoData({
    category: `search-${query}`,
    limit: 20,
    enableCache: false, // Don't cache search results
  });
};