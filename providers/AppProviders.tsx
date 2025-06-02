import React, { ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { WatchLaterProvider } from '../contexts/WatchLaterContext';
import { MiniplayerProvider } from '../contexts/MiniplayerContext';
import SuspenseWrapper from '../components/SuspenseWrapper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
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
      <AuthProvider>
        <WatchLaterProvider>
          <MiniplayerProvider>
            <SuspenseWrapper>
              {children}
            </SuspenseWrapper>
          </MiniplayerProvider>
        </WatchLaterProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
