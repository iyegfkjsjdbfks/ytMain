
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from './icons/HomeIcon';
import FireIcon from './icons/FireIcon';
import ShortsIcon from './icons/ShortsIcon';
import SubscriptionsIcon from './icons/SubscriptionsIcon';
import HistoryIcon from './icons/HistoryIcon';
import ClockIcon from './icons/ClockIcon';
import PlaylistPlayIcon from './icons/PlaylistPlayIcon';
import PlaylistIcon from './icons/PlaylistIcon'; 
import { QueueListIcon } from '@heroicons/react/24/solid'; // Added for Library


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

const NavItem: React.FC<NavItemProps> = React.memo(({ to, icon, label, currentPath, title }) => {
  const isActive = currentPath === to || 
                   (to === "/" && (currentPath.startsWith("/watch") || currentPath.startsWith("/channel") || currentPath.startsWith("/search") || currentPath.startsWith("/library"))); 
  
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

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();

  return (
    <aside 
      className={`fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] bg-white dark:bg-neutral-900 transition-transform duration-300 ease-in-out w-60 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto pb-4
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:w-60 
      `}
      aria-label="Main navigation"
    >
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <nav className="p-3 space-y-0.5">
            <NavItem to="/" icon={<HomeIcon className="w-5 h-5"/>} label="Home" currentPath={location.pathname} title="Home"/>
            <NavItem to="/shorts" icon={<ShortsIcon className="w-5 h-5"/>} label="Shorts" currentPath={location.pathname} title="Shorts"/>
            <NavItem to="/subscriptions" icon={<SubscriptionsIcon className="w-5 h-5"/>} label="Subscriptions" currentPath={location.pathname} title="Subscriptions"/>
            <NavItem to="/trending" icon={<FireIcon className="w-5 h-5"/>} label="Trending" currentPath={location.pathname} title="Trending"/>
            <NavItem to="/library" icon={<QueueListIcon className="w-5 h-5"/>} label="Library" currentPath={location.pathname} title="Library"/> {/* New Library Link */}
          </nav>

          <hr className="border-neutral-200 dark:border-neutral-700/70 my-3 mx-3" />

          <nav className="p-3 space-y-0.5">
            <h3 className="px-3 pt-1 pb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">You</h3>
            <NavItem to="/history" icon={<HistoryIcon className="w-5 h-5"/>} label="History" currentPath={location.pathname} title="Watch History"/>
            <NavItem to="/playlists" icon={<PlaylistIcon className="w-5 h-5"/>} label="Playlists" currentPath={location.pathname} title="Your Playlists"/>
            <NavItem to="/watch-later" icon={<ClockIcon className="w-5 h-5"/>} label="Watch Later" currentPath={location.pathname} title="Watch Later"/>
            <NavItem to="/liked-videos" icon={<PlaylistPlayIcon className="w-5 h-5"/>} label="Liked Videos" currentPath={location.pathname} title="Liked Videos"/>
          </nav>
        </div>
      
        <div className="px-4 pt-4 border-t border-neutral-200 dark:border-neutral-700/70">
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">&copy; ${new Date().getFullYear()} YouTube Clone.</p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Inspired by YouTube.</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;