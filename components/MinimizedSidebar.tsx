import React, { memo, FC, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { QueueListIcon as QueueListSolidIcon, ChartBarIcon as ChartBarSolidIcon, VideoCameraIcon as VideoCameraSolidIcon } from '@heroicons/react/24/solid';
const QueueListIconSolid = QueueListSolidIcon;
const ChartBarIconSolid = ChartBarSolidIcon;
const VideoCameraIconSolid = VideoCameraSolidIcon;

import ClockIcon from './icons/ClockIcon';
import FireIcon from './icons/FireIcon';
import HistoryIcon from './icons/HistoryIcon';
import HomeIcon from './icons/HomeIcon';
import PlaylistIcon from './icons/PlaylistIcon';
import ShortsIcon from './icons/ShortsIcon';
import SubscriptionsIcon from './icons/SubscriptionsIcon';

interface MinimizedNavItemProps {
 to: string;
 icon: React.ReactNode;
 label: string;
 currentPath: string;
 title?: string;
}

const MinimizedNavItem: React.FC<MinimizedNavItemProps> = React.memo(({ to, icon, label, currentPath, title }: any) => {
 const isActive = currentPath === to ||
 (to === '/' && (currentPath.startsWith('/watch') || currentPath.startsWith('/channel') || currentPath.startsWith('/search') || currentPath.startsWith('/library')));

 return (
 <Link
 to={to}
 title={title || label}
 className={`flex flex-col items-center justify-center p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors duration-150 group min-h-[64px]
 ${isActive ? 'bg-neutral-200 dark:bg-neutral-800 font-medium text-neutral-900 dark:text-neutral-50' : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100'}`}
 aria-current={isActive ? 'page' : undefined}
 >
 <span className={`mb-1 ${isActive ? 'text-neutral-800 dark:text-neutral-50' : 'text-neutral-600 dark:text-neutral-300 group-hover:text-neutral-800 dark:group-hover:text-neutral-100'}`}>
 {icon}
 </span>
 <span className={`text-[10px] text-center leading-tight ${isActive ? 'text-neutral-900 dark:text-neutral-50' : 'text-neutral-700 dark:text-neutral-100 group-hover:text-neutral-900 dark:group-hover:text-neutral-50'}`}>
 {label}
 </span>
 </Link>
 );
});
MinimizedNavItem.displayName = 'MinimizedNavItem';

const MinimizedSidebar: React.FC = memo(() => {
 const location = useLocation();

 return (
 <aside
 className="fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] bg-white dark:bg-neutral-900 w-16 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto pb-4"
 aria-label="Minimized navigation"
 >
 <div className="flex flex-col h-full">
 <div className="flex-grow">
 <nav className="p-2 space-y-1">
 <MinimizedNavItem
 to="/"
 icon={<HomeIcon className="w-6 h-6"/>}
 label="Home"
 currentPath={location.pathname}
 title="Home"
 />
 <MinimizedNavItem
 to="/shorts"
 icon={<ShortsIcon className="w-6 h-6"/>}
 label="Shorts"
 currentPath={location.pathname}
 title="Shorts"
 />
 <MinimizedNavItem
 to="/subscriptions"
 icon={<SubscriptionsIcon className="w-6 h-6"/>}
 label="Subscriptions"
 currentPath={location.pathname}
 title="Subscriptions"
 />
 <MinimizedNavItem
 to="/library"
 icon={<QueueListIcon className="w-6 h-6"/>}
 label="Library"
 currentPath={location.pathname}
 title="Library"
 />
 </nav>

 <div className="border-t border-neutral-200 dark:border-neutral-700/70 my-2 mx-2" />

 <nav className="p-2 space-y-1">
 <MinimizedNavItem
 to="/history"
 icon={<HistoryIcon className="w-6 h-6"/>}
 label="History"
 currentPath={location.pathname}
 title="Watch History"
 />
 <MinimizedNavItem
 to="/playlists"
 icon={<PlaylistIcon className="w-6 h-6"/>}
 label="Playlists"
 currentPath={location.pathname}
 title="Your Playlists"
 />
 <MinimizedNavItem
 to="/watch-later"
 icon={<ClockIcon className="w-6 h-6"/>}
 label="Watch Later"
 currentPath={location.pathname}
 title="Watch Later"
 />
 <MinimizedNavItem
 to="/trending"
 icon={<FireIcon className="w-6 h-6"/>}
 label="Trending"
 currentPath={location.pathname}
 title="Trending"
 />
 </nav>

 <div className="border-t border-neutral-200 dark:border-neutral-700/70 my-2 mx-2" />

 <nav className="p-2 space-y-1">
 <MinimizedNavItem
 to="/studio"
 icon={<ChartBarIcon className="w-6 h-6"/>}
 label="Studio"
 currentPath={location.pathname}
 title="Studio Dashboard"
 />
 <MinimizedNavItem
 to="/upload"
 icon={<VideoCameraIcon className="w-6 h-6"/>}
 label="Upload"
 currentPath={location.pathname}
 title="Upload Video"
 />
 </nav>
 </div>
 </div>
 </aside>
 );
});

MinimizedSidebar.displayName = 'MinimizedSidebar';

export default MinimizedSidebar;
