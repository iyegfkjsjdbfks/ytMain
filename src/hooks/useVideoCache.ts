import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useRef } from 'react';



interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  views: number;
  uploadDate: string;
  channel: string;
  url?: string;
}

interface VideoCacheOptions {
  prefetchCount?: number;
  cacheTime?: number;
  staleTime?: number;
  enableIntersectionObserver?: boolean;
}

const DEFAULT_OPTIONS: Required<VideoCacheOptions> = {
  prefetchCount: 5,
  cacheTime: 1000 * 60 * 30, // 30 minutes
  staleTime: 1000 * 60 * 5,  // 5 minutes
  enableIntersectionObserver: true,
};

export const useVideoCache = (options: VideoCacheOptions = {}) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const queryClient = useQueryClient();
  const [visibleVideos, setVisibleVideos] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const observedElements = useRef<Map<string, Element>>(new Map());

  // Initialize intersection observer for lazy loading
  useEffect(() => {
    if (!opts.enableIntersectionObserver) {
return;
}

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoId = entry.target.getAttribute('data-video-id');
          if (!videoId) {
return;
}

          if (entry.isIntersecting) {
            setVisibleVideos(prev => new Set([...prev, videoId]));
            // Prefetch video data when it becomes visible
            prefetchVideo(videoId);
          } else {
            setVisibleVideos(prev => {
              const newSet = new Set(prev);
              newSet.delete(videoId);
              return newSet;
            });
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before element is visible
        threshold: 0.1,
      },
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [opts.enableIntersectionObserver]);

  // Observe video elements
  const observeVideo = useCallback((element: Element, videoId: string) => {
    if (!observerRef.current || !opts.enableIntersectionObserver) {
return;
}

    element.setAttribute('data-video-id', videoId);
    observerRef.current.observe(element);
    observedElements.current.set(videoId, element);
  }, [opts.enableIntersectionObserver]);

  // Unobserve video elements
  const unobserveVideo = useCallback((videoId: string) => {
    if (!observerRef.current) {
return;
}

    const element = observedElements.current.get(videoId);
    if (element) {
      observerRef.current.unobserve(element);
      observedElements.current.delete(videoId);
    }
  }, []);

  // Prefetch video data
  const prefetchVideo = useCallback(async (videoId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['video', videoId],
      queryFn: async () => {
        // Mock API call - replace with actual video service
        const response = await fetch(`/api/videos/${videoId}`);
        if (!response.ok) {
throw new Error('Failed to fetch video');
}
        return response.json();
      },
      staleTime: opts.staleTime,
      gcTime: opts.cacheTime,
    });
  }, [queryClient, opts.staleTime, opts.cacheTime]);

  // Prefetch multiple videos
  const prefetchVideos = useCallback(async (videoIds: string[]) => {
    const promises = videoIds.slice(0, opts.prefetchCount).map(prefetchVideo);
    await Promise.allSettled(promises);
  }, [prefetchVideo, opts.prefetchCount]);

  // Get cached video data
  const getCachedVideo = useCallback((videoId: string): VideoData | undefined => {
    return queryClient.getQueryData(['video', videoId]);
  }, [queryClient]);

  // Check if video is cached
  const isVideoCached = useCallback((videoId: string): boolean => {
    const data = queryClient.getQueryData(['video', videoId]);
    return data !== undefined;
  }, [queryClient]);

  // Invalidate video cache
  const invalidateVideo = useCallback(async (videoId: string) => {
    await queryClient.invalidateQueries({ queryKey: ['video', videoId] });
  }, [queryClient]);

  // Clear all video cache
  const clearVideoCache = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['video'] });
  }, [queryClient]);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const videoQueries = cache.findAll({ queryKey: ['video'] });

    return {
      totalCached: videoQueries.length,
      visibleCount: visibleVideos.size,
      observedCount: observedElements.current.size,
      cacheSize: videoQueries.reduce((size, query) => {
        const { data } = query.state;
        return size + (data ? JSON.stringify(data).length : 0);
      }, 0),
    };
  }, [queryClient, visibleVideos.size]);

  // Preload video thumbnails
  const preloadThumbnails = useCallback((videos: VideoData[]) => {
    videos.forEach((video) => {
      if (video.thumbnail) {
        const img = new Image();
        img.src = video.thumbnail;
      }
    });
  }, []);

  // Smart prefetch based on user behavior
  const smartPrefetch = useCallback(async (currentVideoId: string, allVideoIds: string[]) => {
    const currentIndex = allVideoIds.indexOf(currentVideoId);
    if (currentIndex === -1) {
return;
}

    // Prefetch next few videos
    const nextVideos = allVideoIds.slice(
      currentIndex + 1,
      currentIndex + 1 + opts.prefetchCount,
    );

    // Also prefetch previous videos for back navigation
    const prevVideos = allVideoIds.slice(
      Math.max(0, currentIndex - 2),
      currentIndex,
    );

    await prefetchVideos([...nextVideos, ...prevVideos]);
  }, [prefetchVideos, opts.prefetchCount]);

  return {
    // Observer methods
    observeVideo,
    unobserveVideo,

    // Prefetch methods
    prefetchVideo,
    prefetchVideos,
    smartPrefetch,
    preloadThumbnails,

    // Cache methods
    getCachedVideo,
    isVideoCached,
    invalidateVideo,
    clearVideoCache,

    // State
    visibleVideos,
    getCacheStats,

    // Configuration
    options: opts,
  };
};

// Hook for individual video with caching
export const useCachedVideo = (videoId: string, options: VideoCacheOptions = {}) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return useQuery({
    queryKey: ['video', videoId],
    queryFn: async (): Promise<VideoData> => {
      // Mock API call - replace with actual video service
      const response = await fetch(`/api/videos/${videoId}`);
      if (!response.ok) {
throw new Error('Failed to fetch video');
}
      return response.json();
    },
    staleTime: opts.staleTime,
    gcTime: opts.cacheTime,
    enabled: !!videoId,
  });
};

export default useVideoCache;