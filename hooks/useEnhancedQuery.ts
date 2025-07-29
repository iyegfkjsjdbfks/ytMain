/**
 * Enhanced React Query wrapper with better error handling, caching, and performance monitoring
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { performanceMonitor } from '../utils/performanceMonitor';

// Enhanced error types
export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, any>;
  timestamp: number;
  retryable: boolean;
}

// Query configuration presets
export const queryPresets = {
  // Fast-changing data (user interactions, live data)
  realtime: {
    staleTime: 0,
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },
  // Moderately changing data (video lists, user profiles)
  standard: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
  // Rarely changing data (static content, configurations)
  stable: {
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },
  // Critical data that should always be fresh
  critical: {
    staleTime: 0,
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
} as const;

// Enhanced error handler
function createApiError(error: any): ApiError {
  const apiError: ApiError = {
    name: 'ApiError',
    message: error?.message || 'An unexpected error occurred',
    status: error?.status || error?.response?.status,
    code: error?.code || error?.response?.data?.code,
    details: error?.response?.data || error?.details,
    timestamp: Date.now(),
    retryable: isRetryableError(error),
    stack: error?.stack,
  };

  return apiError;
}

function isRetryableError(error: any): boolean {
  const status = error?.status || error?.response?.status;
  
  // Network errors are retryable
  if (!status) return true;
  
  // Server errors (5xx) are retryable
  if (status >= 500) return true;
  
  // Rate limiting is retryable
  if (status === 429) return true;
  
  // Timeout errors are retryable
  if (status === 408) return true;
  
  // Client errors (4xx) are generally not retryable
  return false;
}

// Enhanced retry logic
function createRetryFn(maxRetries: number = 3) {
  return (failureCount: number, error: any) => {
    const apiError = createApiError(error);
    
    // Don't retry if error is not retryable
    if (!apiError.retryable) return false;
    
    // Don't retry if we've exceeded max retries
    if (failureCount >= maxRetries) return false;
    
    return true;
  };
}

// Enhanced delay function with exponential backoff and jitter
function createRetryDelay(baseDelay: number = 1000, maxDelay: number = 30000) {
  return (attemptIndex: number, error: any) => {
    // Create API error to ensure proper error handling
    createApiError(error);
    
    // Use server-provided retry-after header if available
    const retryAfter = error?.response?.headers?.['retry-after'];
    if (retryAfter) {
      const retryAfterMs = parseInt(retryAfter) * 1000;
      return Math.min(retryAfterMs, maxDelay);
    }
    
    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, attemptIndex);
    const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
    
    return Math.min(exponentialDelay + jitter, maxDelay);
  };
}

// Performance monitoring wrapper
function withPerformanceMonitoring<T>(
  queryFn: () => Promise<T>,
  queryKey: string[]
): () => Promise<T> {
  return async () => {
    const startTime = performance.now();
    const endpoint = queryKey.join('/');
    
    try {
      const result = await queryFn();
      const duration = performance.now() - startTime;
      
      performanceMonitor.trackApiCall(endpoint, duration, 200);
      
      return result;
    } catch (error: any) {
      const duration = performance.now() - startTime;
      const status = error?.status || error?.response?.status || 0;
      
      performanceMonitor.trackApiCall(endpoint, duration, status);
      
      throw createApiError(error);
    }
  };
}

// Enhanced useQuery hook
export function useEnhancedQuery<TData = unknown, TError = ApiError>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options: {
    preset?: keyof typeof queryPresets;
    maxRetries?: number;
    baseRetryDelay?: number;
    maxRetryDelay?: number;
    enablePerformanceMonitoring?: boolean;
  } & Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn' | 'retry' | 'retryDelay'> = {}
) {
  const {
    preset = 'standard',
    maxRetries = 3,
    baseRetryDelay = 1000,
    maxRetryDelay = 30000,
    enablePerformanceMonitoring = true,
    ...queryOptions
  } = options;

  const presetConfig = queryPresets[preset];
  const enhancedQueryFn = enablePerformanceMonitoring 
    ? withPerformanceMonitoring(queryFn, queryKey)
    : queryFn;

  return useQuery({
    queryKey,
    queryFn: enhancedQueryFn,
    retry: createRetryFn(maxRetries),
    retryDelay: createRetryDelay(baseRetryDelay, maxRetryDelay),
    ...presetConfig,
    ...queryOptions,
  });
}

// Enhanced useMutation hook
export function useEnhancedMutation<TData = unknown, TError = ApiError, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    maxRetries?: number;
    baseRetryDelay?: number;
    maxRetryDelay?: number;
    enablePerformanceMonitoring?: boolean;
    invalidateQueries?: string[][];
    optimisticUpdate?: {
      queryKey: string[];
      updateFn: (oldData: any, variables: TVariables) => any;
    };
  } & Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn' | 'retry' | 'retryDelay'> = {}
) {
  const {
    maxRetries = 1, // Mutations typically shouldn't auto-retry
    baseRetryDelay = 1000,
    maxRetryDelay = 30000,
    enablePerformanceMonitoring = true,
    invalidateQueries = [],
    optimisticUpdate,
    ...mutationOptions
  } = options;

  const queryClient = useQueryClient();
  
  const enhancedMutationFn = enablePerformanceMonitoring
    ? async (variables: TVariables) => {
        const startTime = performance.now();
        const endpoint = 'mutation'; // Could be enhanced to include specific mutation name
        
        try {
          const result = await mutationFn(variables);
          const duration = performance.now() - startTime;
          
          performanceMonitor.trackApiCall(endpoint, duration, 200);
          
          return result;
        } catch (error: any) {
          const duration = performance.now() - startTime;
          const status = error?.status || error?.response?.status || 0;
          
          performanceMonitor.trackApiCall(endpoint, duration, status);
          
          throw createApiError(error);
        }
      }
    : mutationFn;

  return useMutation({
    mutationFn: enhancedMutationFn,
    retry: createRetryFn(maxRetries),
    retryDelay: createRetryDelay(baseRetryDelay, maxRetryDelay),
    onMutate: async (variables) => {
      // Handle optimistic updates
      if (optimisticUpdate) {
        await queryClient.cancelQueries({ queryKey: optimisticUpdate.queryKey });
        const previousData = queryClient.getQueryData(optimisticUpdate.queryKey);
        
        queryClient.setQueryData(
          optimisticUpdate.queryKey,
          (oldData: any) => optimisticUpdate.updateFn(oldData, variables)
        );
        
        return { previousData };
      }
      
      return mutationOptions.onMutate?.(variables);
    },
    onError: (error, variables, context) => {
      // Rollback optimistic updates on error
      if (optimisticUpdate && context && typeof context === 'object' && 'previousData' in context) {
        queryClient.setQueryData(optimisticUpdate.queryKey, (context as any).previousData);
      }
      
      mutationOptions.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      // Invalidate related queries
      invalidateQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
      
      mutationOptions.onSuccess?.(data, variables, context);
    },
    ...mutationOptions,
  });
}

// Utility hooks for common patterns
export function useInfiniteEnhancedQuery<TData = unknown, _TError = ApiError>(
  _queryKey: string[],
  _queryFn: ({ pageParam }: { pageParam: unknown }) => Promise<TData>,
  _options: Parameters<typeof useEnhancedQuery>[2] & {
    getNextPageParam?: (lastPage: TData, allPages: TData[]) => unknown;
    getPreviousPageParam?: (firstPage: TData, allPages: TData[]) => unknown;
  } = {}
) {
  // Implementation would use useInfiniteQuery with similar enhancements
  // This is a placeholder for the infinite query pattern
  throw new Error('useInfiniteEnhancedQuery not yet implemented');
}

// Cache management utilities
export function useCacheManager() {
  const queryClient = useQueryClient();
  
  return {
    // Prefetch data
    prefetch: <TData>(queryKey: string[], queryFn: () => Promise<TData>, preset: keyof typeof queryPresets = 'standard') => {
      return queryClient.prefetchQuery({
        queryKey,
        queryFn,
        ...queryPresets[preset],
      });
    },
    
    // Clear specific cache
    clearCache: (queryKey?: string[]) => {
      if (queryKey) {
        queryClient.removeQueries({ queryKey });
      } else {
        queryClient.clear();
      }
    },
    
    // Get cache size and stats
    getCacheStats: () => {
      const cache = queryClient.getQueryCache();
      return {
        size: cache.getAll().length,
        queries: cache.getAll().map(query => ({
          queryKey: query.queryKey,
          state: query.state.status,
          dataUpdatedAt: query.state.dataUpdatedAt,
          errorUpdatedAt: query.state.errorUpdatedAt,
        })),
      };
    },
  };
}