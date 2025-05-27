
import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserCircleIcon, Cog8ToothIcon, ArrowRightStartOnRectangleIcon, SunIcon, MoonIcon,
  ShieldCheckIcon, QuestionMarkCircleIcon, ChatBubbleLeftEllipsisIcon, VideoCameraIcon, PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext'; // Ensure correct relative path


interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuItem: React.FC<{ children: React.ReactNode; onClick?: () => void; to?: string; icon?: React.ReactNode; isDestructive?: boolean }> = ({ children, onClick, to, icon, isDestructive }) => {
  const commonClasses = `flex items-center px-4 py-3 text-sm w-full text-left transition-colors duration-150
    ${isDestructive ? 'text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/10'
                    : 'text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700/70'}`;

  const content = (
    <>
      {icon && <span className="mr-3.5 w-5 h-5 text-neutral-500 dark:text-neutral-300">{icon}</span>}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={commonClasses} onClick={onClick}>
        {content}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={commonClasses}>
      {content}
    </button>
  );
};

const UserMenu: React.FC<UserMenuProps> = ({ isOpen, onClose }) => { // Added onClose to props
  const { theme, toggleTheme } = useTheme(); // Use the theme context

  if (!isOpen) return null;

  const handleSignOut = () => {
    onClose(); // Close menu on action
  };

  const handleThemeToggle = () => {
    toggleTheme();
  }

  const handleGenericClick = () => {
    onClose(); // Close menu on any item click
  }

  return (
    <div
      className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 rounded-xl shadow-2xl z-[100] py-1.5 animate-fade-in-down-menu"
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="user-menu-button"
    >
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700/80">
        <div className="flex items-center space-x-3">
          <img src="https://picsum.photos/seed/currentUserMenu/40/40" alt="Current User" className="w-10 h-10 rounded-full" />
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Your Name</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer">@yourhandle</p>
            <Link 
              to="/channel/YourChannelName" // Example, replace with actual dynamic channel name/ID
              onClick={handleGenericClick} 
              className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 mt-0.5 block"
            >
              View your channel
            </Link>
          </div>
        </div>
      </div>
      <div className="py-1">
        <MenuItem to="#" icon={<UserCircleIcon />} onClick={handleGenericClick}>Switch account</MenuItem>
        <MenuItem to="#" icon={<VideoCameraIcon />} onClick={handleGenericClick}>YouTube Studio</MenuItem>
      </div>
      <hr className="border-neutral-200 dark:border-neutral-700/70 my-1" />
      <div className="py-1">
        <MenuItem onClick={handleSignOut} icon={<ArrowRightStartOnRectangleIcon />} isDestructive>Sign out</MenuItem>
      </div>
      <hr className="border-neutral-200 dark:border-neutral-700/70 my-1" />
      <div className="py-1">
         <MenuItem onClick={handleThemeToggle} icon={theme === 'dark' ? <SunIcon className="text-yellow-500 dark:text-yellow-400" /> : <MoonIcon className="text-sky-500 dark:text-sky-400" />}>
            Appearance: {theme === 'dark' ? 'Light' : 'Dark'}
         </MenuItem>
      </div>
      <hr className="border-neutral-200 dark:border-neutral-700/70 my-1" />
      <div className="py-1">
        <MenuItem to="/account/data" icon={<PresentationChartLineIcon />} onClick={handleGenericClick}>Your data in YouTube</MenuItem> {/* Updated to prop */}
        <MenuItem to="/account/settings" icon={<Cog8ToothIcon />} onClick={handleGenericClick}>Settings</MenuItem> {/* Updated to prop */}
      </div>
      <hr className="border-neutral-200 dark:border-neutral-700/70 my-1" />
      <div className="py-1">
        <MenuItem to="#" icon={<QuestionMarkCircleIcon />} onClick={handleGenericClick}>Help</MenuItem>
        <MenuItem to="#" icon={<ChatBubbleLeftEllipsisIcon />} onClick={handleGenericClick}>Send feedback</MenuItem>
      </div>
    </div>
  );
};

export default UserMenu;