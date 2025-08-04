import React from "react";
import { useCallback } from 'react';

// import { getShortsVideos } // from '../services/realVideoService' // Service not found;

import { useAsyncData } from './useAsyncData';
import type { Video } from '../types';

/**
 * Hook for fetching shorts videos
 */
export function useShortsVideos() {
  const fetchShorts = useCallback(() => getShortsVideos(), []);
  return useAsyncData<Video[]>(fetchShorts, { initialData: [] });
}