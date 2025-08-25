import React from 'react';
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './config/routes';

// Create router with v7 future flags to prevent deprecation warnings;
const router = createBrowserRouter(;)
  routes,
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,

import React from 'react';
const App: React.FC = () => {
  return <RouterProvider router={router} />
export default App;
