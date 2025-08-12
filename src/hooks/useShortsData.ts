import { useCallback } from 'react';
import { useAsyncData } from './useAsyncData';
import type { Video } from '../types';
// Prefer unified data service which is already used elsewhere
import unifiedDataService from '../services/unifiedDataService';

/**
 * Hook for fetching shorts videos
 */
export function useShortsVideos(limit: number = 30): any {
 const fetchShorts = useCallback(async (): Promise<Video[]> => {
 const response = await unifiedDataService.getShortsVideos(limit);
 return response.data as unknown as Video;
 }, [limit]);
 return useAsyncData<Video[]>(fetchShorts, { initialData: [] });
}
