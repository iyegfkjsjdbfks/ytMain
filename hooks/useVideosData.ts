import { useCallback } from 'react';

import { getVideos, getShortsVideos } from '../services/mockVideoService';

import { useAsyncData } from './useAsyncData';

import type { Video } from '../src/types/core';


/**
 * Hook for fetching different types of videos
 * @param type - The type of videos to fetch ('trending', 'shorts', 'all')
 */
export function useVideosData(type: 'trending' | 'shorts' | 'all' = 'all') {
  const fetchVideos = useCallback(() => {
    switch (type) {
      case 'shorts':
        return getShortsVideos();
      case 'trending':
      case 'all':
      default:
        return getVideos();
    }
  }, [type]);

  return useAsyncData<Video[]>(fetchVideos, { initialData: [] });
}