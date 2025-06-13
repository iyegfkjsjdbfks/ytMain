import * as React from 'react';
import {  ReactNode  } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UnifiedAppProvider } from '../contexts/UnifiedAppContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { OptimizedMiniplayerProvider } from '../contexts/OptimizedMiniplayerContext';
import { WatchLaterProvider } from '../contexts/WatchLaterContext';
import { AuthProvider } from '../contexts/AuthContext';
import SuspenseWrapper from '../components/SuspenseWrapper';
import ErrorBoundary from '../components/ErrorBoundary';

// Create a single, optimized QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

interface RefactoredAppProvidersProps {
  children: ReactNode;
}

/**
 * Refactored AppProviders component that consolidates all application providers
 * into a single, optimized provider hierarchy.
 * 
 * Features:
 * - Unified context management through UnifiedAppProvider
 * - Optimized React Query configuration
 * - Proper error boundaries and suspense handling
 * - Reduced provider nesting for better performance
 */
export const RefactoredAppProviders: React.FC<RefactoredAppProvidersProps> = ({
  children
}) => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <OptimizedMiniplayerProvider>
              <WatchLaterProvider>
                <UnifiedAppProvider>
                  <SuspenseWrapper fallback={<div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  </div>}>
                    {children}
                  </SuspenseWrapper>
                </UnifiedAppProvider>
              </WatchLaterProvider>
            </OptimizedMiniplayerProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

/**
 * Hook to access the QueryClient instance
 * Useful for imperative cache operations
 */
export const useQueryClient = () => queryClient;

/**
 * Provider for testing environments
 * Allows injection of custom QueryClient for testing
 */
interface TestAppProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

export const TestAppProviders: React.FC<TestAppProvidersProps> = ({
  children,
  queryClient: customQueryClient
}) => {
  const client = customQueryClient || queryClient;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={client}>
        <ThemeProvider>
          <AuthProvider>
            <OptimizedMiniplayerProvider>
              <WatchLaterProvider>
                <UnifiedAppProvider>
                  {children}
                </UnifiedAppProvider>
              </WatchLaterProvider>
            </OptimizedMiniplayerProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default RefactoredAppProviders;
