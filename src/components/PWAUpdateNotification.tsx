import React from "react";
import { RefreshCw, X, Download } from 'lucide-react';

import { useState, useEffect, type FC } from 'react';

import { createComponentError } from '@/utils/errorUtils';

import { conditionalLogger } from '../utils/conditionalLogger';

import { usePWA } from '../hooks/usePWA';

interface PWAUpdateNotificationProps {
  className?: string;
}

const PWAUpdateNotification: FC<PWAUpdateNotificationProps> = ({ className = '' }) => {
  const { updateAvailable, installUpdate } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (updateAvailable) {
      setIsVisible(true);
    }
  }, [updateAvailable]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await installUpdate();
      // The page will reload automatically after update
    } catch (error) {
      const componentError = createComponentError('PWAUpdateNotification', 'Failed to update app', error);
      conditionalLogger.error('Failed to update app:', componentError);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleLater = () => {
    setIsVisible(false);
    // Show again after 1 hour
    setTimeout(() => {
      if (updateAvailable) {
        setIsVisible(true);
      }
    }, 60 * 60 * 1000);
  };

  if (!isVisible || !updateAvailable) {
    return null;
  }

  return (
    <div className={`fixed top-16 right-4 z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Update Available
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                New version ready
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Dismiss update notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            A new version of YouTubeX is available with improvements and bug fixes.
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors flex items-center justify-center space-x-1"
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Update Now</span>
              </>
            )}
          </button>
          <button
            onClick={handleLater}
            disabled={isUpdating}
            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium py-2 px-3 rounded-md transition-colors disabled:opacity-50"
          >
            Later
          </button>
        </div>

        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          Update will reload the app
        </div>
      </div>
    </div>
  );
};

export default PWAUpdateNotification;