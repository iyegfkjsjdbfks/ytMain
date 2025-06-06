import * as React from 'react';
import {  ReactNode  } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { MiniplayerProvider } from '../contexts/MiniplayerContext';
import { WatchLaterProvider } from '../contexts/WatchLaterContext';

interface UnifiedProvidersProps {
  children: ReactNode;
}

/**
 * Unified provider component that wraps all context providers
 * This reduces nesting in App.tsx and provides a single entry point for all contexts
 */
export const UnifiedProviders: React.FC<UnifiedProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MiniplayerProvider>
          <WatchLaterProvider>
            {children}
          </WatchLaterProvider>
        </MiniplayerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default UnifiedProviders;