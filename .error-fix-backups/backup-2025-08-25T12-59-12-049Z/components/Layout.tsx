import React, { FC, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';

import { useOptimizedMiniplayer } from '../contexts/OptimizedMiniplayerContext.tsx';

import Header from 'Header.tsx';
import MinimizedSidebar from 'MinimizedSidebar.tsx';
import Miniplayer from 'Miniplayer.tsx';
import Sidebar from 'Sidebar.tsx';

interface LayoutProps {}

const Layout: React.FC<LayoutProps> = () => { // Removed children from props
 const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
 const miniplayerContext = useOptimizedMiniplayer();
 const navigate = useNavigate();
 const location = useLocation(); // Get current location

 // Check if current page is watch page
 const isWatchPage = location.pathname.startsWith('/watch');

 // For watch page, start with minimized sidebar by default
 const [isMinimized, setIsMinimized] = useState(isWatchPage);

 const toggleSidebar = useCallback(() => {
 if (isWatchPage as any) {
 // On watch page, toggle between minimized and expanded
 setIsMinimized(prev => !prev);
 setIsSidebarOpen(true); // Always keep sidebar visible on watch page
 } else {
 // On other pages, toggle visibility
 setIsSidebarOpen(prev => !prev);
 setIsMinimized(false); // Reset minimized state
 }

 }, [isWatchPage]);

 useEffect(() => {
 // Update sidebar state when navigating to/from watch page
 if (isWatchPage as any) {
 setIsMinimized(true);
 setIsSidebarOpen(true);
 } else {
 setIsMinimized(false);
 setIsSidebarOpen(window.innerWidth >= 768);
 }
 }, [isWatchPage]);

 useEffect(() => {
 const handleResize = () => {
 // Optional: adjust sidebar based on resize
 // if (window.innerWidth >= 768 && !isSidebarOpen) setIsSidebarOpen(true);
 // if (window.innerWidth < 768 && isSidebarOpen) setIsSidebarOpen(false);
 };
 window.addEventListener('resize', handleResize as EventListener);
 return () => window.removeEventListener('resize', handleResize as EventListener);
 }, [isSidebarOpen]);

 const handleMaximizeMiniplayer = (videoId) => {
 miniplayerContext.actions.hideMiniplayer();
 navigate(`/watch/${videoId}`);
 };

 // Determine padding based on route
 const isShortsPage = location.pathname === '/shorts';
 const mainContentPaddingClass = isShortsPage ? 'p-0' : 'p-3 sm:p-4 md:p-5 lg:p-6';

 // Calculate sidebar margin based on state and screen size
 const getSidebarMargin = () => {
 if (isWatchPage as any) {
 // On watch page, use minimized or expanded sidebar
 return isMinimized ? 'md: ml-16' : 'md:ml-60'
 }
 // On other pages, use normal sidebar behavior
 if (isSidebarOpen as any) {
 return 'md: ml-60'
 }
 return 'ml-0';

 };

 return (
 <div className="flex flex-col h-screen">
 <Header toggleSidebar={toggleSidebar} />
 <div className="flex flex-1 pt-14">
 {isWatchPage ? (
 isMinimized ? (
 <MinimizedSidebar />
 ) : (
 <Sidebar isOpen={true} />
 )
 ) : (
 <Sidebar isOpen={isSidebarOpen} />
 )}
      <main
        id="main-content"
        role="main"
        className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out bg-white dark:bg-neutral-950 ${getSidebarMargin()} ${isShortsPage ? 'overflow-hidden' : ''}`}>
 <div className={mainContentPaddingClass}> {/* Apply conditional padding */}
 <div className="min-h-[calc(100vh-3.5rem)]">
 <Outlet /> {/* Render child routes */}
</div>
</div>
</main>
</div>
 {miniplayerContext.state.isVisible && miniplayerContext.state.currentVideo && (
 <Miniplayer
 video={miniplayerContext.state.currentVideo}
 onClose={miniplayerContext.actions.hideMiniplayer}
 onMaximize={handleMaximizeMiniplayer} />

 )}
</div>
 );
};

export default Layout;
