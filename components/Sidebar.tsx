
/// <reference types="react/jsx-runtime" />
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName]: any;
    }
  }
}

// TODO: Fix import - import React, { memo } from 'react';

// TODO: Fix import - import { QueueListIcon, ChartBarIcon, CogIcon, CurrencyDollarIcon, DocumentTextIcon, VideoCameraIcon, ChatBubbleLeftRightIcon, UserGroupIcon, PaintBrushIcon, FilmIcon } from '@heroicons/react/24/solid'; // Added for Library and Studio
// TODO: Fix import - import { Link, useLocation } from 'react-router-dom';

import ClockIcon from './icons/ClockIcon';
import FireIcon from './icons/FireIcon';
import HistoryIcon from './icons/HistoryIcon';
import HomeIcon from './icons/HomeIcon';
import PlaylistIcon from './icons/PlaylistIcon';
import PlaylistPlayIcon from './icons/PlaylistPlayIcon';
import ShortsIcon from './icons/ShortsIcon';
import SubscriptionsIcon from './icons/SubscriptionsIcon';


interface SidebarProps {
  isOpen: boolean;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  currentPath: string;
  title?: string;
}

const NavItem: React.FC<NavItemProps> = React.memo(({ to, icon, label, currentPath, title }: {title: string}: {currentPath: any}: {label: any}: {icon: any}: {to: any}) => {
  const isActive = currentPath === to ||
                   (to === '/' && (currentPath.startsWith('/watch') || currentPath.startsWith('/channel') || currentPath.startsWith('/search') || currentPath.startsWith('/library')));

  return (
    <Link
      to={to}
      title={title || label}
      className={`flex items-center px-3 py-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors duration-150 group 
        ${isActive ? 'bg-neutral-200 dark:bg-neutral-800 font-medium text-neutral-900 dark:text-neutral-50' : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100'}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className={`mr-5 ${isActive ? 'text-neutral-800 dark:text-neutral-50' : 'text-neutral-600 dark:text-neutral-300 group-hover:text-neutral-800 dark:group-hover:text-neutral-100'}`}>{icon}</span>
      <span className={`text-sm ${isActive ? 'text-neutral-900 dark:text-neutral-50' : 'text-neutral-700 dark:text-neutral-100 group-hover:text-neutral-900 dark:group-hover:text-neutral-50'}`}>{label}</span>
    </Link>
  );
});
NavItem.displayName = 'NavItem'; // For better debugging

const Sidebar: React.FC<SidebarProps> = memo(({ isOpen }: {isOpen: boolean}) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={'fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300 ease-in-out overflow-y-auto hidden md:block w-60'}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          <div className="flex-grow">
            <nav className="p-3 space-y-0.5">
              <NavItem to="/" icon={<HomeIcon className="w-5 h-5"/>} label="Home" currentPath={location.pathname} title="Home"/>
              <NavItem to="/shorts" icon={<ShortsIcon className="w-5 h-5"/>} label="Shorts" currentPath={location.pathname} title="Shorts"/>
              <NavItem to="/subscriptions" icon={<SubscriptionsIcon className="w-5 h-5"/>} label="Subscriptions" currentPath={location.pathname} title="Subscriptions"/>
              <NavItem to="/trending" icon={<FireIcon className="w-5 h-5"/>} label="Trending" currentPath={location.pathname} title="Trending"/>
              <NavItem to="/library" icon={<QueueListIcon className="w-5 h-5"/>} label="Library" currentPath={location.pathname} title="Library"/>
            </nav>

            <hr className="border-neutral-200 dark:border-neutral-700/70 my-3 mx-3" />

            <nav className="p-3 space-y-0.5">
              <h3 className="px-3 pt-1 pb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">You</h3>
              <NavItem to="/history" icon={<HistoryIcon className="w-5 h-5"/>} label="History" currentPath={location.pathname} title="Watch History"/>
              <NavItem to="/playlists" icon={<PlaylistIcon className="w-5 h-5"/>} label="Playlists" currentPath={location.pathname} title="Your Playlists"/>
              <NavItem to="/watch-later" icon={<ClockIcon className="w-5 h-5"/>} label="Watch Later" currentPath={location.pathname} title="Watch Later"/>
              <NavItem to="/liked-videos" icon={<PlaylistPlayIcon className="w-5 h-5"/>} label="Liked Videos" currentPath={location.pathname} title="Liked Videos"/>
            </nav>

            <hr className="border-neutral-200 dark:border-neutral-700/70 my-3 mx-3" />

            <nav className="p-3 space-y-0.5">
              <h3 className="px-3 pt-1 pb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Creator Studio</h3>
              <NavItem to="/studio" icon={<ChartBarIcon className="w-5 h-5"/>} label="Dashboard" currentPath={location.pathname} title="Studio Dashboard"/>
              <NavItem to="/upload" icon={<VideoCameraIcon className="w-5 h-5"/>} label="Upload" currentPath={location.pathname} title="Upload Video"/>
              <NavItem to="/studio/content" icon={<DocumentTextIcon className="w-5 h-5"/>} label="Content" currentPath={location.pathname} title="Content Manager"/>
              <NavItem to="/studio/analytics" icon={<ChartBarIcon className="w-5 h-5"/>} label="Analytics" currentPath={location.pathname} title="Analytics"/>
              <NavItem to="/studio/comments" icon={<ChatBubbleLeftRightIcon className="w-5 h-5"/>} label="Comments" currentPath={location.pathname} title="Comment Moderation"/>
              <NavItem to="/studio/monetization" icon={<CurrencyDollarIcon className="w-5 h-5"/>} label="Monetization" currentPath={location.pathname} title="Monetization"/>
              <NavItem to="/studio/community" icon={<UserGroupIcon className="w-5 h-5"/>} label="Community" currentPath={location.pathname} title="Community Posts"/>
                <NavItem to="/studio/playlists" icon={<PlaylistIcon className="w-5 h-5"/>} label="Playlists" currentPath={location.pathname} title="Playlist Manager"/>
                <NavItem to="/studio/customization" icon={<PaintBrushIcon className="w-5 h-5"/>} label="Customization" currentPath={location.pathname} title="Channel Customization"/>
                <NavItem to="/studio/editor" icon={<FilmIcon className="w-5 h-5"/>} label="Editor" currentPath={location.pathname} title="Video Editor"/>
                <NavItem to="/go-live" icon={<VideoCameraIcon className="w-5 h-5"/>} label="Go Live" currentPath={location.pathname} title="Go Live"/>
               <NavItem to="/ai-content-spark" icon={<DocumentTextIcon className="w-5 h-5"/>} label="AI Content" currentPath={location.pathname} title="AI Content Spark"/>
               <NavItem to="/settings" icon={<CogIcon className="w-5 h-5"/>} label="Settings" currentPath={location.pathname} title="Settings"/>
            </nav>
          </div>

          <div className="px-4 pt-4 border-t border-neutral-200 dark:border-neutral-700/70">
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">&copy; ${new Date().getFullYear()} YouTube Clone.</p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Inspired by YouTube.</p>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-14 left-0 z-50 h-[calc(100vh-3.5rem)] bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-transform duration-300 ease-in-out overflow-y-auto w-64 md:hidden
          ${isOpen ? 'transform translate-x-0' : 'transform -translate-x-full'}
        `}
        aria-label="Mobile navigation"
      >
        <div className="flex flex-col h-full">
          <div className="flex-grow">
            <nav className="p-3 space-y-0.5">
              <NavItem to="/" icon={<HomeIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Home" currentPath={location.pathname} title="Home"/>
              <NavItem to="/shorts" icon={<ShortsIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Shorts" currentPath={location.pathname} title="Shorts"/>
              <NavItem to="/subscriptions" icon={<SubscriptionsIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Subscriptions" currentPath={location.pathname} title="Subscriptions"/>
              <NavItem to="/trending" icon={<FireIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Trending" currentPath={location.pathname} title="Trending"/>
              <NavItem to="/library" icon={<QueueListIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Library" currentPath={location.pathname} title="Library"/>
            </nav>

            <hr className="border-neutral-200 dark:border-neutral-700/70 my-3 mx-3" />

            <nav className="p-3 space-y-0.5">
              <h3 className="px-3 pt-1 pb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">You</h3>
              <NavItem to="/history" icon={<HistoryIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="History" currentPath={location.pathname} title="Watch History"/>
              <NavItem to="/playlists" icon={<PlaylistIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Playlists" currentPath={location.pathname} title="Your Playlists"/>
              <NavItem to="/watch-later" icon={<ClockIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Watch Later" currentPath={location.pathname} title="Watch Later"/>
              <NavItem to="/liked-videos" icon={<PlaylistPlayIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Liked Videos" currentPath={location.pathname} title="Liked Videos"/>
            </nav>

            <hr className="border-neutral-200 dark:border-neutral-700/70 my-3 mx-3" />

            <nav className="p-3 space-y-0.5">
              <h3 className="px-3 pt-1 pb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Creator Studio</h3>
              <NavItem to="/studio" icon={<ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Dashboard" currentPath={location.pathname} title="Studio Dashboard"/>
              <NavItem to="/upload" icon={<VideoCameraIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Upload" currentPath={location.pathname} title="Upload Video"/>
              <NavItem to="/studio/content" icon={<DocumentTextIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Content" currentPath={location.pathname} title="Content Manager"/>
              <NavItem to="/studio/analytics" icon={<ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Analytics" currentPath={location.pathname} title="Analytics"/>
              <NavItem to="/studio/comments" icon={<ChatBubbleLeftRightIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Comments" currentPath={location.pathname} title="Comment Moderation"/>
              <NavItem to="/studio/monetization" icon={<CurrencyDollarIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Monetization" currentPath={location.pathname} title="Monetization"/>
              <NavItem to="/studio/community" icon={<UserGroupIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Community" currentPath={location.pathname} title="Community Posts"/>
                <NavItem to="/studio/playlists" icon={<PlaylistIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Playlists" currentPath={location.pathname} title="Playlist Manager"/>
                <NavItem to="/studio/customization" icon={<PaintBrushIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Customization" currentPath={location.pathname} title="Channel Customization"/>
                <NavItem to="/studio/editor" icon={<FilmIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Editor" currentPath={location.pathname} title="Video Editor"/>
                <NavItem to="/go-live" icon={<VideoCameraIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Go Live" currentPath={location.pathname} title="Go Live"/>
               <NavItem to="/ai-content-spark" icon={<DocumentTextIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="AI Content" currentPath={location.pathname} title="AI Content Spark"/>
               <NavItem to="/settings" icon={<CogIcon className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Settings" currentPath={location.pathname} title="Settings"/>
            </nav>
          </div>

          <div className="px-4 pt-4 border-t border-neutral-200 dark:border-neutral-700/70">
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">&copy; ${new Date().getFullYear()} YouTube Clone.</p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Inspired by YouTube.</p>
          </div>
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;