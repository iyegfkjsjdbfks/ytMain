import { QueryClient } from '@tanstack/react-query';

// Create a single, optimized QueryClient instance with performance-focused settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes (reduced from 5)
      gcTime: 5 * 60 * 1000, // 5 minutes (reduced from 10)
      retry: (failureCount, error: Error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const { status } = error as any;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 1; // Reduced from 2 for faster failures
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: false, // Disabled for faster perceived performance,
  networkMode: 'offlineFirst', // Try cache first
    },
    mutations: {
      retry: 0, // No retries for mutations for faster UX,
  networkMode: 'offlineFirst' } } });

export { queryClient };
