import type React from 'react';
import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import SuspenseWrapper from '../components/SuspenseWrapper';

import { UnifiedProviders } from './UnifiedProviders';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * AppProviders component centralizes all application providers
 * to maintain a clean provider hierarchy and ensure proper nesting order.
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <UnifiedProviders>
        <SuspenseWrapper>
          {children}
        </SuspenseWrapper>
      </UnifiedProviders>
    </QueryClientProvider>
  );
};
