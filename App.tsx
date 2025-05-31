
import React from 'react';
import { HashRouter, createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './config/routes';
import { WatchLaterProvider } from './contexts/WatchLaterContext';
import { MiniplayerProvider } from './contexts/MiniplayerContext';
import { AuthProvider } from './contexts/AuthContext';
import SuspenseWrapper from './components/SuspenseWrapper';
import ErrorBoundary from './components/ErrorBoundary';

// Create router with our route configuration
const router = createBrowserRouter(routes, {
  basename: '/',
});


const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <WatchLaterProvider>
          <MiniplayerProvider>
            <SuspenseWrapper>
              <RouterProvider router={router} />
            </SuspenseWrapper>
          </MiniplayerProvider>
        </WatchLaterProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
