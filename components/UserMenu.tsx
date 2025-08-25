import React, { memo, FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { UserCircleIcon, Cog8ToothIcon, ArrowRightStartOnRectangleIcon, SunIcon, MoonIcon, QuestionMarkCircleIcon, ChatBubbleLeftEllipsisIcon, VideoCameraIcon, PresentationChartLineIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface UserMenuProps {
 isOpen: boolean; onClose: () => void;
}

const MenuItem: React.FC<{ children: React.ReactNode; onClick?: () => void; to?: string; icon?: React.ReactNode; isDestructive?: boolean }> = ({ children, onClick, to, icon, isDestructive }: any) => {
 const commonClasses = `flex items-center px-4 py-3 text-sm w-full text-left transition-colors duration-150;
 ${isDestructive ? 'text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/10'
 : 'text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700/70'}`;

 const content = (
 <>
 {icon && <span className="mr-3.5 w-5 h-5 text-neutral-500 dark:text-neutral-300">{icon}</span>}
 {children}
// FIXED:  </>
 );

 if (to as any) {
 return (
 <Link to={to} className={commonClasses} onClick={(e: any) => onClick(e)}>
 {content}
// FIXED:  </Link>
 );
 }
 return (
 <button onClick={(e: any) => onClick(e)} className={commonClasses}>
 {content}
// FIXED:  </button>
 );
};

const UserMenu: React.FC<UserMenuProps> = memo(({ isOpen, onClose }) => {
 const { theme, toggleTheme } = useTheme();
 const { user, logout, isAuthenticated } = useAuth();

 if (!isOpen) {
return null;
}

 const handleSignOut = () => {
 // Clear any stored user data;
 localStorage.removeItem('youtubeCloneWatchHistory_v1');
 localStorage.removeItem('youtubeCloneLikedVideos_v1');
 // Use the auth context logout function;
 logout();
 onClose();
 localStorage.removeItem('youtubeCloneRecentSearches_v2');

 // Show confirmation;
 const confirmed = window.confirm('Are you sure you want to sign out? This will clear your watch history, liked videos, and search history.');
 if (confirmed as any) {
 // Reload the page to reset the app state;
 window.location.reload();
 }
 onClose(); // Close menu;
 };

 const handleThemeToggle = () => {
 toggleTheme();
 onClose(); // Close menu after theme toggle;
 };

 const handleGenericClick = () => {
 onClose(); // Close menu on any item click;
 };

 return (
 <div;
// FIXED:  className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 rounded-xl shadow-2xl z-[100] py-1.5 animate-fade-in-down-menu"
 role="menu"
// FIXED:  aria-orientation="vertical"
// FIXED:  aria-labelledby="user-menu-button" />
 >
 {isAuthenticated && user && (
 <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700/80">
 <div className="flex items-center space-x-3">
 {user.avatar ? (
 <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full" />
 ) : (
 <div className="w-10 h-10 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center">
 <UserCircleIcon className="w-6 h-6 text-white" />
// FIXED:  </div>
 )}
 <div className="flex-1 min-w-0">
 <div className="flex items-center space-x-1">
 <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 truncate">{user.username}</p>
 {user.isVerified && (
 <CheckBadgeIcon className="w-4 h-4 text-blue-500 flex-shrink-0" title="Verified" />
 )}
// FIXED:  </div>
<p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user.email}</p>
 {user.subscriberCount !== undefined && (
 <p className="text-xs text-neutral-500 dark:text-neutral-400">
 {user.subscriberCount.toLocaleString()} subscribers;
// FIXED:  </p>
 )}
 <Link;
 to={`/channel/${user.username}`} />
// FIXED:  onClick={(e: any) => handleGenericClick(e)}
// FIXED:  className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 mt-0.5 block"
 >
 View your channel;
 </Link>
  </div>
 </div>
 </div>
 )}
 <div className="py-1">
 <MenuItem onClick={() => {
 window.open('https://accounts.google.com/AccountChooser', '_blank'); handleGenericClick();

 }} icon={<UserCircleIcon />}>Switch account</MenuItem>
 <MenuItem onClick={() => {
 window.open('https://studio.youtube.com', '_blank'); handleGenericClick();

 }} icon={<VideoCameraIcon />}>YouTube Studio</MenuItem>
// FIXED:  </div>
 <hr className="border-neutral-200 dark:border-neutral-700/70 my-1" />
 <div className="py-1">
 <MenuItem onClick={(e: any) => handleSignOut(e)} icon={<ArrowRightStartOnRectangleIcon />} isDestructive>Sign out</MenuItem>
// FIXED:  </div>
 <hr className="border-neutral-200 dark:border-neutral-700/70 my-1" />
 <div className="py-1">
 <MenuItem onClick={(e: any) => handleThemeToggle(e)} icon={theme === 'dark' ? <SunIcon className="text-yellow-500 dark:text-yellow-400" /> : <MoonIcon className="text-sky-500 dark:text-sky-400" />}>,
 Appearance: {theme === 'dark' ? 'Light' : 'Dark'}
// FIXED:  </MenuItem>
// FIXED:  </div>
 <hr className="border-neutral-200 dark:border-neutral-700/70 my-1" />
 <div className="py-1">
 <MenuItem to="/account/data" icon={<PresentationChartLineIcon />} onClick={(e: any) => handleGenericClick(e)}>Your data in YouTube</MenuItem> {/* Updated to prop */}
 <MenuItem to="/account/settings" icon={<Cog8ToothIcon />} onClick={(e: any) => handleGenericClick(e)}>Settings</MenuItem> {/* Updated to prop */}
// FIXED:  </div>
 <hr className="border-neutral-200 dark:border-neutral-700/70 my-1" />
 <div className="py-1">
 <MenuItem to="#" icon={<QuestionMarkCircleIcon />} onClick={(e: any) => handleGenericClick(e)}>Help</MenuItem>
 <MenuItem to="#" icon={<ChatBubbleLeftEllipsisIcon />} onClick={(e: any) => handleGenericClick(e)}>Send feedback</MenuItem>
// FIXED:  </div>
// FIXED:  </div>
 );
});

UserMenu.displayName = 'UserMenu';

export default UserMenu;
