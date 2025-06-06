import React, { ReactNode } from 'react';
import { UnifiedProviders } from './UnifiedProviders';
import SuspenseWrapper from '../components/SuspenseWrapper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
