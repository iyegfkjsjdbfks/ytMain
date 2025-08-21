import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Test router with v7 future flags - using all available future flags
const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <div>
        <h1>YouTube Clone - Test</h1>
        <p>Testing React Router v7 Future Flags</p>
        <ul>
          <li>✅ v7_startTransition enabled</li>
          <li>✅ v7_relativeSplatPath enabled</li>
          <li>✅ v7_fetcherPersist enabled</li>
          <li>✅ v7_normalizeFormMethod enabled</li>
          <li>✅ v7_partialHydration enabled</li>
          <li>✅ v7_skipActionErrorRevalidation enabled</li>
        </ul>
        <p style={{ marginTop: '20px', color: 'green' }}>
          If you see this message and no warnings in console, the fix is working!
        </p>
      </div>
    },
    {
      path: '*',
      element: <div>404 - Page Not Found</div>
    }
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true
    }
  }
);

const TestApp: React.FC = () => {
  console.log('TestApp: React Router v7 future flags are enabled');
  return <RouterProvider router={router} />;
};

export default TestApp;
