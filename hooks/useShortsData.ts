import { useCallback } from 'react';

import { getShortsVideos } from '../services/mockVideoService';

import { useAsyncData } from './useAsyncData';

import type { Video } from '../types';


/**
 * Hook for fetching shorts videos
 */
export function useShortsVideos() {
  const fetchShorts = useCallback(() => getShortsVideos(), []);
  return useAsyncData<Video[]>(fetchShorts, { initialData: [] });
}