import { useState, useEffect } from 'react';
import type { FC } from 'react';

import { WifiIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface OfflineIndicatorProps {
  className?: string;
}

const OfflineIndicator: FC<OfflineIndicatorProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);
    if (!navigator.onLine) {
      setShowOfflineMessage(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-hide offline message after 5 seconds when back online
  useEffect(() => {
    if (isOnline && showOfflineMessage) {
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOnline, showOfflineMessage]);

  if (isOnline && !showOfflineMessage) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {!isOnline ? (
        <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full text-sm">
          <ExclamationTriangleIcon className="w-4 h-4" />
          <span className="font-medium">Offline</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm">
          <WifiIcon className="w-4 h-4" />
          <span className="font-medium">Back Online</span>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;