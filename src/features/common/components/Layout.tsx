import React, { FC } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from 'Footer.tsx';
import Header from 'Header.tsx';
import Sidebar from 'Sidebar.tsx';

/**
 * Main layout component for the application
 * Provides the common structure for most pages including header, sidebar, and footer
 */
export const Layout: React.FC = () => {
 return (
 <div className='flex flex-col min-h-screen bg-gray-100'>
 <Header />

 <div className='flex flex-1'>
 <Sidebar />

 <main className='flex-1 p-4 overflow-auto'>
 {/* The Outlet component renders the current route's element */}
 <Outlet />
// FIXED:  </main>
// FIXED:  </div>

 <Footer />
// FIXED:  </div>
 );
};

export default Layout;
