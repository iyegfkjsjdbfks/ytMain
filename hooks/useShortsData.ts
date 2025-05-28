import { useCallback } from 'react';
import { Video } from '../types';
import { getShortsVideos } from '../services/mockVideoService';
import { useAsyncData } from './useAsyncData';

/**
 * Hook for fetching shorts videos
 */
export function useShortsVideos() {
  const fetchShorts = useCallback(() => getShortsVideos(), []);
  return useAsyncData<Video[]>(fetchShorts, { initialData: [] });
}