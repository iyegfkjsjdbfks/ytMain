
/// <reference types="react/jsx-runtime" />
// TODO: Fix import - import { Link } from 'react-router-dom';
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName]: any;
    }
  }
}

// TODO: Fix import - import { useState, useRef, useEffect, useCallback, memo } from 'react';
// TODO: Fix import - import React from 'react';

// TODO: Fix import - import { ArrowUpTrayIcon, SignalIcon, PencilSquareIcon, LightBulbIcon, UserIcon } from '@heroicons/react/24/outline'; // Added LightBulbIcon
// TODO: Fix import - import { Link } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

import Button from './forms/Button';
import MenuIcon from './icons/MenuIcon';
import VideoPlusIcon from './icons/VideoPlusIcon';
import YouTubeLogo from './icons/YouTubeLogo';
import NotificationSystem from './NotificationSystem';
import OfflineIndicator from './OfflineIndicator';
import PWAInstallBanner from './PWAInstallBanner';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';
// UserIcon not used if avatar image is present


interface HeaderProps {
  toggleSidebar: () => void;
}

const CreateMenuItem: React.FC<{ children: React.ReactNode; onClick: () => void; icon: React.ReactNode; to?: string }> = ({ children, onClick, icon, to }: {to: any; icon: any; onClick: Function; children: any}) => {
  const commonClasses = 'flex items-center px-4 py-3 text-sm w-full text-left text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700/70 transition-colors duration-150';

  const content = (
    <>
      {icon && <span className="mr-3.5 w-5 h-5 text-neutral-500 dark:text-neutral-300">{icon}</span>}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={commonClasses} role="menuitem">
        {content}
      </Link>
    );
  }
  return (
    <button
      onClick={onClick}
      className={commonClasses}
      role="menuitem"
    >
      {content}
    </button>
  );
};


// Component for authenticated user section
interface AuthenticatedUserSectionProps {
  userMenuRef: React.RefObject<HTMLDivElement>;
  userMenuButtonRef: React.RefObject<HTMLButtonElement>;
  toggleUserMenu: () => void;
  isUserMenuOpen: boolean; handleCloseUserMenu: () => void
}

const AuthenticatedUserSection: React.FC<AuthenticatedUserSectionProps> = ({
  userMenuRef,
  userMenuButtonRef,
  toggleUserMenu,
  isUserMenuOpen,
  handleCloseUserMenu,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center space-x-2">
        <Link to="/login">
          <Button
            variant="secondary"
            size="sm"
            className="text-blue-600 border border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20"
          >
            <UserIcon className="w-4 h-4 mr-1" />
            Sign in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={userMenuRef}>
      <button
        ref={userMenuButtonRef}
        onClick={toggleUserMenu}
        className={`p-1.5 rounded-full transition-colors ${isUserMenuOpen ? 'bg-neutral-300 dark:bg-neutral-700' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700/80'}`}
        aria-label="User account options"
        aria-expanded={isUserMenuOpen}
        aria-haspopup="true"
        aria-controls="user-menu"
        id="user-menu-button"
        title="Your Account"
      >
        {user.avatar ? (
          <img src={user.avatar} alt="User Avatar" className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-white" />
          </div>
        )}
      </button>
      <UserMenu isOpen={isUserMenuOpen} onClose={handleCloseUserMenu} />
    </div>
  );
};

const Header: React.FC<HeaderProps> = memo(({ toggleSidebar }: {toggleSidebar: any}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);
  const notificationsPanelRef = useRef<HTMLDivElement>(null);
  const notificationsButtonRef = useRef<HTMLButtonElement>(null);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);

  const toggleUserMenu = () => {
    setIsUserMenuOpen(prev => !prev);
    if (isNotificationsPanelOpen) {
setIsNotificationsPanelOpen(false);
}
    if (isCreateMenuOpen) {
setIsCreateMenuOpen(false);
}
  };


  const toggleCreateMenu = () => {
    setIsCreateMenuOpen(prev => !prev);
    if (isUserMenuOpen) {
setIsUserMenuOpen(false);
}
    if (isNotificationsPanelOpen) {
setIsNotificationsPanelOpen(false);
}
  };

  const handleCloseUserMenu = useCallback(() => setIsUserMenuOpen(false), []);

  const handleCloseCreateMenu = useCallback(() => setIsCreateMenuOpen(false), []);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // User Menu
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        userMenuButtonRef.current &&
        !userMenuButtonRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      // Notifications Panel
      if (
        notificationsPanelRef.current &&
        !notificationsPanelRef.current.contains(event.target as Node) &&
        notificationsButtonRef.current &&
        !notificationsButtonRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsPanelOpen(false);
      }
      // Create Menu
      if (
        createMenuRef.current &&
        !createMenuRef.current.contains(event.target as Node) &&
        createButtonRef.current &&
        !createButtonRef.current.contains(event.target as Node)
      ) {
        setIsCreateMenuOpen(false);
      }
    };

    if (isUserMenuOpen || isNotificationsPanelOpen || isCreateMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, isNotificationsPanelOpen, isCreateMenuOpen]);


  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm h-14 flex items-center justify-between px-2 sm:px-4 border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-1.5 sm:p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700/80 mr-1 sm:mr-3 text-neutral-700 dark:text-neutral-100 transition-colors"
          aria-label="Toggle sidebar menu"
          title="Menu"
        >
          <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <Link to="/" className="flex items-center" aria-label="YoutubeX Home">
          <YouTubeLogo className="h-4 sm:h-5 md:h-[22px]" />
          <span className="ml-1 text-base sm:text-lg md:text-xl font-semibold text-black dark:text-white hidden sm:block tracking-tighter relative top-[-1px]">YoutubeX</span>
        </Link>
      </div>

      <div className="flex-1 flex justify-center px-1 sm:px-2 md:px-4">
        <SearchBar />
      </div>

      <div className="flex items-center space-x-0.5 sm:space-x-1 md:space-x-1.5">
        {/* PWA Offline Indicator */}
        <OfflineIndicator className="hidden md:flex" />

        <div className="relative">
            <button
              ref={createButtonRef}
              onClick={toggleCreateMenu}
              className={`p-2 rounded-full text-neutral-700 dark:text-neutral-100 transition-all duration-150 ease-in-out
                ${isCreateMenuOpen ? 'bg-neutral-300 dark:bg-neutral-600 scale-95' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700/80'}
              `}
              aria-label="Create video or post"
              aria-expanded={isCreateMenuOpen}
              aria-haspopup="true"
              aria-controls="create-menu"
              id="create-button"
              title="Create"
            >
              <VideoPlusIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            {isCreateMenuOpen && (
                 <div
                    ref={createMenuRef}
                    id="create-menu"
                    className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 rounded-xl shadow-2xl z-[100] py-1.5 animate-fade-in-down-menu"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="create-button"
                >
                    <CreateMenuItem icon={<ArrowUpTrayIcon />} to="/upload" onClick={handleCloseCreateMenu}>Upload video</CreateMenuItem>
                    <CreateMenuItem icon={<SignalIcon />} to="/go-live" onClick={handleCloseCreateMenu}>Go live</CreateMenuItem>
                    <CreateMenuItem icon={<PencilSquareIcon />} onClick={() => {
 window.open('https://studio.youtube.com/channel/community', '_blank'); handleCloseCreateMenu();
}}>Create post</CreateMenuItem>
                    <hr className="border-neutral-200 dark:border-neutral-700/70 my-1" />
                    <CreateMenuItem
                        icon={<LightBulbIcon />}
                        to="/ai-content-spark"
                        onClick={handleCloseCreateMenu}
                    >
                        AI Content Spark ✨
                    </CreateMenuItem>
                 </div>
            )}
        </div>

        {/* Enhanced Notification System */}
        <div className="hidden sm:block">
          <NotificationSystem className="relative" />
        </div>

        <AuthenticatedUserSection
          userMenuRef={userMenuRef}
          userMenuButtonRef={userMenuButtonRef}
          toggleUserMenu={toggleUserMenu}
          isUserMenuOpen={isUserMenuOpen}
          handleCloseUserMenu={handleCloseUserMenu}
        />
      </div>

      {/* PWA Install Banner */}
      <PWAInstallBanner />
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
