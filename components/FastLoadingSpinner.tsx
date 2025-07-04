import type React from 'react';

/**
 * Fast loading component optimized for immediate display
 * Shows minimal but effective loading state
 */
const FastLoadingSpinner: React.FC = () => (
  <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      {/* Simple, fast-rendering spinner */}
      <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      
      {/* Minimal text */}
      <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
        Loading YouTube Studio
      </div>
    </div>
  </div>
);

export default FastLoadingSpinner;
