/// <reference types="react/jsx-runtime" />
import React from 'react';
import { Outlet } from 'react-router-dom';
import StudioHeader from './StudioHeader';
import StudioSidebar from './StudioSidebar';

/**
 * Studio layout component for the YouTube Studio section
 * Provides the studio-specific structure including specialized header and sidebar
 */
export const StudioLayout: React.FC = () => {
  return (
    <div className='flex flex-col min-h-screen bg-gray-100'>
      <StudioHeader />

      <div className='flex flex-1'>
        <StudioSidebar />

        <main className='flex-1 p-6 overflow-auto'>
          <div className='max-w-7xl mx-auto'>
            {/* The Outlet component renders the current route's element */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudioLayout;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: any;
    }
  }
}
