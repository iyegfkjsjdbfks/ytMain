import { useCallback } from 'react';
import type { Video } from '../types/core';
import { parseRelativeDate } from '../utils/dateUtils';
import { parseViewCount } from '../utils/numberUtils';
import { useAsyncData } from './useAsyncData';
// Use the mock realVideoService for demo data (these functions exist)
import { getVideos, getVideosByCategory, getVideosByChannelName, getSubscribedChannelNames } from '../../services/realVideoService';

/**
 * Hook for fetching all videos
 */
export function useVideos() {
  const fetchVideos = useCallback(async (): Promise<Video[]> => {
    const data = await getVideos();
    return data as unknown as Video;
  }, []);
  // Provide empty array as initial data to show UI immediately
  return useAsyncData<Video[]>(fetchVideos, {
    initialData: [],
    dependencies: [] });
}

/**
 * Hook for fetching trending videos with category filtering
 */
export function useTrendingVideos(category = 'all') {
  const fetchTrendingVideos = useCallback(async (): Promise<Video[]> => {
    // If category-specific API available, use it, then normalize to Video[]
    if (
      category &&
      category !== 'all' &&
      typeof getVideosByCategory === 'function'
    ) {
      const byCategory = await getVideosByCategory(category);
      const normalized = (byCategory as any).map((v: any) => ({
        // realVideoService returns fields like thumbnailUrl/publishedAt etc.
        // Map to Video shape expected by UI where necessary
        ...v,
        thumbnail: (v as any).thumbnail ?? (v as any).thumbnailUrl ?? '',
        publishedAt: (v as any).publishedAt ?? (v as any).uploadedAt ?? '',
        channelTitle: (v as any).channelTitle ?? (v as any).channelName ?? '' })) as Video;
      return [...normalized]
        .sort(
          (a, b) =>
            Number(parseViewCount((b as any).views)) -
            Number(parseViewCount((a as any).views))
        )
        .slice(0, 50);
    }

    // Fallback: get all videos then sort/filter
    const allVideosRaw = await getVideos();
    const allVideos = (allVideosRaw as any).map((v: any) => ({
      ...v,
      thumbnail: (v as any).thumbnail ?? (v as any).thumbnailUrl ?? '',
      publishedAt: (v as any).publishedAt ?? (v as any).uploadedAt ?? '',
      channelTitle: (v as any).channelTitle ?? (v as any).channelName ?? '' })) as Video;

    const sortedByViews = [...allVideos].sort((a, b) => {
      const viewsA = parseViewCount(a.views as string);
      const viewsB = parseViewCount(b.views as string);
      return viewsB - viewsA;
    });
    return sortedByViews.slice(0, 50);
  }, [category]);

  return useAsyncData<Video[]>(fetchTrendingVideos, {
    initialData: [],
    dependencies: [category] });
}

/**
 * Hook for fetching subscription feed
 */
export function useSubscriptionsFeed() {
  const fetchSubscriptionsFeed = useCallback(async (): Promise<Video[]> => {
    // getSubscribedChannelNames is provided by services/realVideoService.ts
    const channelNames: string[] = await getSubscribedChannelNames();
    if (channelNames.length === 0) {
      return [];
    }

    const videosPromises = channelNames.map(name =>
      getVideosByChannelName(name)
    );
    const videosByChannel = await Promise.all(videosPromises);

    const allVideos: Video[] = videosByChannel.flat();

    // Sort by upload date
    const sortedVideos = allVideos.sort(
      (a: Video, b: Video) =>
        parseRelativeDate(b.uploadedAt) - parseRelativeDate(a.uploadedAt)
    );

    return sortedVideos;
  }, []);

  return useAsyncData<Video[]>(fetchSubscriptionsFeed, {
    initialData: [],
    dependencies: [] });
}

/**
 * Hook for fetching videos by channel name
 */
export function useChannelVideos(channelName: any) {
  const fetchChannelVideos = useCallback(
    () => getVideosByChannelName(channelName),
    [channelName]
  );

  return useAsyncData<Video[]>(fetchChannelVideos, {
    initialData: [],
    dependencies: [channelName] });
}
