import React, { FC, ReactNode } from 'react';
import type { ReactNode } from 'react';

import { QueryClientProvider, type QueryClient  } from '@tanstack/react-query';

import ErrorBoundary from '../components/ErrorBoundary';
import FastLoadingSpinner from '../components/FastLoadingSpinner';
import SuspenseWrapper from '../components/SuspenseWrapper';
import { AuthProvider } from '../contexts/AuthContext';
import { OptimizedMiniplayerProvider } from '../contexts/OptimizedMiniplayerContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { UnifiedAppProvider } from '../contexts/UnifiedAppContext';
import { WatchLaterProvider } from '../contexts/WatchLaterContext';
import { queryClient } from '../src/hooks/useQueryClient';
import PWAStatus from '../src/components/PWAStatus';
import PWAUpdateNotification from '../src/components/PWAUpdateNotification';

interface RefactoredAppProvidersProps {
  children: ReactNode
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
  children }) => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <OptimizedMiniplayerProvider>
              <WatchLaterProvider>
                <UnifiedAppProvider>
                  <SuspenseWrapper fallback={<FastLoadingSpinner />}>
                    {children}
                    <PWAStatus />
                    <PWAUpdateNotification />
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
 * Provider for testing environments
 * Allows injection of custom QueryClient for testing
 */
interface TestAppProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

export const TestAppProviders: React.FC<TestAppProvidersProps> = ({
  children,
  queryClient: customQueryClient }) => {
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

