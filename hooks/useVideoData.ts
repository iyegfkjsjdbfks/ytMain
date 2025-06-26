import { useCallback } from 'react';

import { getVideos, getVideosByChannelName, getSubscribedChannelNames } from '../services/mockVideoService';
import { parseRelativeDate } from '../utils/dateUtils';
import { parseViewCount } from '../utils/numberUtils';

import { useAsyncData } from './useAsyncData';

import type { Video } from '../src/types/core';

/**
 * Hook for fetching all videos
 */
export function useVideos() {
  const fetchVideos = useCallback(() => getVideos(), []);
  return useAsyncData<Video[]>(fetchVideos, { initialData: [] });
}

/**
 * Hook for fetching trending videos with category filtering
 */
export function useTrendingVideos(category: string = 'all') {
  const fetchTrendingVideos = useCallback(async (): Promise<Video[]> => {
    const allVideos = await getVideos();

    // Sort by view count to get trending videos
    const sortedByViews = [...allVideos].sort((a, b) => {
      const viewsA = parseViewCount(a.views);
      const viewsB = parseViewCount(b.views);
      return viewsB - viewsA;
    });

    // Filter by category if not 'all'
    let filteredVideos = sortedByViews;
    if (category !== 'all') {
      filteredVideos = sortedByViews.filter(video =>
        video.category.toLowerCase().includes(category.toLowerCase()),
      );
    }

    return filteredVideos.slice(0, 50); // Top 50 trending
  }, [category]);

  return useAsyncData<Video[]>(fetchTrendingVideos, {
    initialData: [],
    dependencies: [category],
  });
}

/**
 * Hook for fetching subscription feed
 */
export function useSubscriptionsFeed() {
  const fetchSubscriptionsFeed = useCallback(async (): Promise<Video[]> => {
    const channelNames = await getSubscribedChannelNames();
    if (channelNames.length === 0) {
      return [];
    }

    const videosPromises = channelNames.map(name => getVideosByChannelName(name));
    const videosByChannel = await Promise.all(videosPromises);

    const allVideos = videosByChannel.flat();

    // Sort by upload date
    const sortedVideos = allVideos.sort((a, b) =>
      parseRelativeDate(b.uploadedAt) - parseRelativeDate(a.uploadedAt),
    );

    return sortedVideos;
  }, []);

  return useAsyncData<Video[]>(fetchSubscriptionsFeed, { initialData: [] });
}

/**
 * Hook for fetching videos by channel name
 */
export function useChannelVideos(channelName: string) {
  const fetchChannelVideos = useCallback(() =>
    getVideosByChannelName(channelName), [channelName],
  );

  return useAsyncData<Video[]>(fetchChannelVideos, {
    initialData: [],
    dependencies: [channelName],
  });
}