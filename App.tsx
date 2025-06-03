import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RefactoredAppProviders } from './providers/RefactoredAppProviders';
import { routes } from './config/routes';

// Create router with our route configuration
const router = createBrowserRouter(routes);

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
