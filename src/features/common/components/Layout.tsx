/// <reference types="react/jsx-runtime" />
// TODO: Fix import - import React from "react";
// TODO: Fix import - import { Outlet } from 'react-router-dom';
// TODO: Fix import - import type React from 'react';
import Footer from './Footer';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * Main layout component for the application
 * Provides the common structure for most pages including header, sidebar, and footer
 */
export const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 overflow-auto">
          {/* The Outlet component renders the current route's element */}
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Layout;


declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
