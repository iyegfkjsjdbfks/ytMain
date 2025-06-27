import type React from 'react';
import { useState, useEffect, useCallback } from 'react';

import { useNavigate, useLocation, Outlet } from 'react-router-dom';

import { useOptimizedMiniplayer } from '../contexts/OptimizedMiniplayerContext';

import Header from './Header';
import Miniplayer from './Miniplayer';
import Sidebar from './Sidebar';


interface LayoutProps {}

const Layout: React.FC<LayoutProps> = () => { // Removed children from props
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const miniplayerContext = useOptimizedMiniplayer();
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      // Optional: adjust sidebar based on resize
      // if (window.innerWidth >= 768 && !isSidebarOpen) setIsSidebarOpen(true);
      // if (window.innerWidth < 768 && isSidebarOpen) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  const handleMaximizeMiniplayer = (videoId: string) => {
    miniplayerContext.actions.hideMiniplayer();
    navigate(`/watch/${videoId}`);
  };

  // Determine padding based on route
  const isShortsPage = location.pathname === '/shorts';
  const mainContentPaddingClass = isShortsPage ? 'p-0' : 'p-3 sm:p-4 md:p-5 lg:p-6';

  return (
    <div className="flex flex-col h-screen">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 pt-14">
        <Sidebar isOpen={isSidebarOpen} />
        <main
          id="main-content"
          role="main"
          className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out bg-white dark:bg-neutral-950
            ${isSidebarOpen && window.innerWidth >= 768 ? 'md:ml-60' : 'ml-0'} 
            ${isShortsPage ? 'overflow-hidden' : ''} // Prevent scroll on main if shorts page
            `}
        >
          <div className={mainContentPaddingClass}> {/* Apply conditional padding */}
            <Outlet /> {/* Render child routes */}
          </div>
        </main>
      </div>
      {miniplayerContext.state.isVisible && miniplayerContext.state.currentVideo && (
        <Miniplayer
          video={miniplayerContext.state.currentVideo}
          onClose={miniplayerContext.actions.hideMiniplayer}
          onMaximize={handleMaximizeMiniplayer}
        />
      )}
    </div>
  );
};

export default Layout;