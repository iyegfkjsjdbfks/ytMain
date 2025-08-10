
// TODO: Fix import - import { useState, useEffect, useCallback, useRef } from 'react';

import { CONSTANTS } from '../../lib/constants';
import type { ApiResponse } from '../../types/core';

/**
 * Unified API Hook
 * Centralized hook for API calls with caching, loading states, and error handling
 */

// Hook configuration
export interface UseApiConfig<T> {
  initialData?: T;
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  cacheTime?: number;
  staleTime?: number;
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

// Hook state
export interface UseApiState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  isStale: boolean;
  lastUpdated: number | null;
}

// Hook return type
export interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
  reset: () => void;
}

// Cache implementation
class ApiCache {
  private cache = new Map<string, {
    data: any;
    timestamp: number;
    staleTime: number;
  }>();

  set<T>(key: string, data: T, staleTime: number = 0): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      staleTime,
    });

    // Clean up old entries
    if (this.cache.size > CONSTANTS.CACHE_CONFIG.MAX_CACHE_SIZE) {
      const oldestKey = Array.from(this.cache.keys())[0];
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
return undefined;
}

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if data is still valid
    if (age > CONSTANTS.CACHE_CONFIG.VIDEO_DATA_TTL) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data;
  }

  isStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
return true;
}

    const now = Date.now();
    const age = now - entry.timestamp;
    return age > entry.staleTime;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global cache instance
const apiCache = new ApiCache();

/**
 * Unified API hook for data fetching with advanced features
 */
export function useApi<T>(
  queryKey: string | string[],
  queryFn: () => Promise<ApiResponse<T>>,
  config: UseApiConfig<T> = {},
): UseApiReturn<T> {
  const {
    initialData,
    enabled = true,
    refetchOnMount = true,
    refetchOnWindowFocus = false,
    // cacheTime = CONSTANTS.CACHE_CONFIG.VIDEO_DATA_TTL,
    staleTime = 0,
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = config;

  // Generate cache key
  const cacheKey = Array.isArray(queryKey) ? queryKey.join(':') : queryKey;

  // State
  const [state, setState] = useState<UseApiState<T>>(() => {
    const cachedData = apiCache.get<T>(cacheKey);
    return {
      data: cachedData || initialData,
      loading: false,
      error: null,
      isStale: cachedData ? apiCache.isStale(cacheKey) : true,
      lastUpdated: cachedData ? Date.now() : null,
    };
  });

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Fetch function
  const fetchData = useCallback(async (retryCount = 0): Promise<void> => {
    if (!enabled || !mountedRef.current) {
return;
}

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev: any => ({ ...prev: any, loading: true, error: null }));

    try {
      const response = await queryFn();

      if (!mountedRef.current) {
return;
}

      const newData = response.data;
      const timestamp = Date.now();

      // Update cache
      apiCache.set(cacheKey, newData, staleTime);

      // Update state
      setState({
        data: newData,
        loading: false,
        error: null,
        isStale: false,
        lastUpdated: timestamp,
      });

      // Call success callback
      onSuccess?.(newData);

    } catch (error) {
      if (!mountedRef.current) {
return;
}

      const errorMessage = error instanceof Error ? error.message : 'An error occurred';

      // Retry logic
      if (retryCount < retry && (error as Error).name !== 'AbortError') {
        retryTimeoutRef.current = setTimeout(() => {
          fetchData(retryCount + 1);
        }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
        return;
      }

      setState(prev: any => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      // Call error callback
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [queryFn, enabled, cacheKey, staleTime, retry, retryDelay, onSuccess, onError]);

  // Refetch function
  const refetch = useCallback(async (): Promise<void> => {
    apiCache.invalidate(cacheKey);
    await fetchData();
  }, [fetchData, cacheKey]);

  // Mutate function (optimistic updates)
  const mutate = useCallback((data: T): void => {
    const timestamp = Date.now();

    // Update cache
    apiCache.set(cacheKey, data, staleTime);

    // Update state
    setState(prev: any => ({
      ...prev,
      data,
      isStale: false,
      lastUpdated: timestamp,
    }));
  }, [cacheKey, staleTime]);

  // Reset function
  const reset = useCallback((): void => {
    apiCache.invalidate(cacheKey);
    setState({
      data: initialData,
      loading: false,
      error: null,
      isStale: true,
      lastUpdated: null,
    });
  }, [cacheKey, initialData]);

  // Initial fetch
  useEffect(() => {
    if (enabled && refetchOnMount && state.isStale) {
      fetchData();
    }
  }, [enabled, refetchOnMount, fetchData, state.isStale]);

  // Window focus refetch
  useEffect(() => {
    if (!refetchOnWindowFocus) {
return;
}

    const handleFocus = () => {
      if (state.isStale) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, fetchData, state.isStale]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    refetch,
    mutate,
    reset,
  };
}

// Specialized hooks for common patterns
export function useQuery<T>(
  queryKey: string | string[],
  queryFn: () => Promise<ApiResponse<T>>,
  config?: UseApiConfig<T>,
) {
  return useApi(queryKey, queryFn, config);
}

export function useMutation<T, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<T>>,
  config: {
    onSuccess?: (data: T, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    onSettled?: (data: T | undefined, error: Error | null, variables: TVariables) => void;
  } = {},
) {
  const [state, setState] = useState<{
    data: T | undefined;
    loading: boolean;
    error: string | null;
  }>({
    data: undefined,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (variables: TVariables): Promise<T> => {
    setState({ data: undefined, loading: true, error: null });

    try {
      const response = await mutationFn(variables);
      const { data } = response;

      setState({ data, loading: false, error: null });
      config.onSuccess?.(data, variables);
      config.onSettled?.(data, null, variables);

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';

      setState(prev: any => ({ ...prev: any, loading: false, error: errorMessage }));
      config.onError?.(error instanceof Error ? error : new Error(errorMessage), variables);
      config.onSettled?.(undefined, error instanceof Error ? error : new Error(errorMessage), variables);

      throw error;
    }
  }, [mutationFn, config]);

  const reset = useCallback(() => {
    setState({ data: undefined, loading: false, error: null });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

// Cache utilities
export const queryCache = {
  invalidate: (key: string) => apiCache.invalidate(key),
  clear: () => apiCache.clear(),
  get: <T>(key: string) => apiCache.get<T>(key),
  set: <T>(key: string, data: T, staleTime?: number) => apiCache.set(key, data, staleTime),
};

export default useApi;
