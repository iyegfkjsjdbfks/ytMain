import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Minimal route configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <div>YouTube Clone - Home</div>
  },
  {
    path: '*',
    element: <div>404 - Page Not Found</div>
  }
]);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
