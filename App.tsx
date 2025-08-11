import React from 'react';
import { FC } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { routes } from './config/routes';
import { RefactoredAppProviders } from './providers/RefactoredAppProviders';
const router = createBrowserRouter(routes, {
  future: {
    // Only include future flags supported in react-router-dom v6.20.1
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_relativeSplatPath: true,
    v7_skipActionErrorRevalidation: true,
  },
});

/**
 * Main application component that sets up the refactored provider structure
 * and router configuration for the application.
 *
 * Features:
 * - Uses RefactoredAppProviders for optimized context management
 * - Built-in error boundaries and suspense handling
 * - Optimized React Query configuration
 * - Enhanced performance through reduced provider nesting
 */
const App: React.FC = () => {
  return (
    <RefactoredAppProviders>
      <RouterProvider router={router} />
    </RefactoredAppProviders>
  );
};

export default App;

