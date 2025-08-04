import React from "react";
import { useCallback } from 'react';
import React from "react";
import { getVideos, getShortsVideos } from '../services/realVideoService';
import React from "react";
import { unifiedDataService } from '../src/services/unifiedDataService';
import React from "react";
import { useAsyncData } from './useAsyncData';
import type { UnifiedVideoMetadata } from '../src/services/metadataNormalizationService';
import type { Video } from '../src/types/core';






/**
 * Hook for fetching different types of videos using unified data service
 * @param type - The type of videos to fetch ('trending', 'shorts', 'all')
 * @param useUnified - Whether to use the unified data service (default: true)
 */
export function useVideosData(
  type: 'trending' | 'shorts' | 'all' = 'all',
  useUnified: boolean = true,
) {
  const fetchVideos = useCallback(async () => {
    if (useUnified) {
      // Use unified data service for normalized results
      switch (type) {
        case 'shorts': {
          const response = await unifiedDataService.getShortsVideos(30);
          return response.data;
        }
        case 'trending':
        case 'all':
        default: {
          const response = await unifiedDataService.getTrendingVideos(50);
          return response.data;
        }
      }
    } else {
      // Legacy mode - use original mock service
      switch (type) {
        case 'shorts':
          return getShortsVideos();
        case 'trending':
        case 'all':
        default:
          return getVideos();
      }
    }
  }, [type, useUnified]);

  return useAsyncData<UnifiedVideoMetadata[] | Video[]>(fetchVideos, { initialData: [] });
}

/**
 * Hook specifically for unified video data with better typing
 */
export function useUnifiedVideosData(
  type: 'trending' | 'shorts' | 'all' = 'all',
  limit: number = 50,
) {
  const fetchVideos = useCallback(async (): Promise<UnifiedVideoMetadata[]> => {
    switch (type) {
      case 'shorts': {
        const response = await unifiedDataService.getShortsVideos(limit);
        return response.data;
      }
      case 'trending':
      case 'all':
      default: {
        const response = await unifiedDataService.getTrendingVideos(limit);
        return response.data;
      }
    }
  }, [type, limit]);

  return useAsyncData<UnifiedVideoMetadata[]>(fetchVideos, { initialData: [] });
}
