import React, { FC, ReactNode } from 'react';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';

import ErrorBoundary from '../components/ErrorBoundary.tsx';
import FastLoadingSpinner from '../components/FastLoadingSpinner.tsx';
import SuspenseWrapper from '../components/SuspenseWrapper.tsx';
import { AuthProvider } from '../contexts/AuthContext.tsx';
import { OptimizedMiniplayerProvider } from '../contexts/OptimizedMiniplayerContext.tsx';
import { ThemeProvider } from '../contexts/ThemeContext.tsx';
import { UnifiedAppProvider } from '../contexts/UnifiedAppContext.tsx';
import { WatchLaterProvider } from '../contexts/WatchLaterContext.tsx';
import { queryClient } from '../src/hooks/useQueryClient.ts';
import PWAStatus from '../src/components/PWAStatus.tsx';
import PWAUpdateNotification from '../src/components/PWAUpdateNotification.tsx';

interface RefactoredAppProvidersProps {
 children?: React.ReactNode
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
export const RefactoredAppProviders: React.FC<Props> = ({}
  // Props destructuring here
}
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
// FIXED:  </SuspenseWrapper>
// FIXED:  </UnifiedAppProvider>
// FIXED:  </WatchLaterProvider>
// FIXED:  </OptimizedMiniplayerProvider>
// FIXED:  </AuthProvider>
// FIXED:  </ThemeProvider>
// FIXED:  </QueryClientProvider>
// FIXED:  </ErrorBoundary>
 );
};

/**
 * Provider for testing environments
 * Allows injection of custom QueryClient for testing
 */
interface TestAppProvidersProps {
 children?: React.ReactNode;
 queryClient?: QueryClient;
}

export const TestAppProviders: React.FC<Props> = ({}
  // Props destructuring here
}
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
// FIXED:  </UnifiedAppProvider>
// FIXED:  </WatchLaterProvider>
// FIXED:  </OptimizedMiniplayerProvider>
// FIXED:  </AuthProvider>
// FIXED:  </ThemeProvider>
// FIXED:  </QueryClientProvider>
// FIXED:  </ErrorBoundary>
 );
};

export default RefactoredAppProviders;
