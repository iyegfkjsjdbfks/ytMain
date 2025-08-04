import React from "react";
import { setupWorker } from 'msw/browser';
import React from "react";
import { handlers } from './handlers';



// Setup MSW worker for browser environment
export const worker = setupWorker(...handlers);

// Start the worker in development mode
if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
  worker.start({
    onUnhandledRequest: 'warn',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  }).catch(() => {
    // Handle MSW start failure silently
  });
}

// Export for manual control
export { handlers };