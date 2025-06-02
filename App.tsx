import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import ErrorBoundary from './components/ErrorBoundary';
import { routes } from './config/routes';

// Create router with our route configuration
const router = createBrowserRouter(routes);

/**
 * Main application component that sets up the provider structure
 * and router configuration for the application.
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProviders>
        <Suspense fallback={<div>Loading...</div>}>
          <RouterProvider router={router} />
        </Suspense>
      </AppProviders>
    </ErrorBoundary>
  );
};

export default App;
