/// <reference types="react/jsx-runtime" />
import React from 'react';
import { useState, useEffect, type FC } from 'react';

import { WifiOff, Wifi, Download, Clock, AlertCircle } from 'lucide-react';

import { createComponentError } from '@/utils/errorUtils';

import { conditionalLogger } from '../utils/conditionalLogger';

import { offlineStorage } from '../utils/offlineStorage';

import { usePWA } from '../hooks/usePWA';

interface OfflineIndicatorProps {
  className?: string;
}

const OfflineIndicator: FC<OfflineIndicatorProps> = ({ className = '' }) => {
  const { isOnline } = usePWA();
  const [showDetails, setShowDetails] = useState(false);
  const [offlineData, setOfflineData] = useState({
    videos: 0,
    watchHistory: 0,
    pendingActions: 0,
    pendingUploads: 0,
  });
  const [storageUsage, setStorageUsage] = useState({ used: 0, quota: 0 });

  useEffect(() => {
    if (!isOnline) {
      loadOfflineData();
    }
  }, [isOnline]);

  const loadOfflineData = async () => {
    try {
      const [videos, watchHistory, pendingActions, pendingUploads, storage] =
        await Promise.all([
          offlineStorage.getAllVideos(),
          offlineStorage.getWatchHistory(100),
          offlineStorage.getPendingActions(),
          offlineStorage.getPendingUploads(),
          offlineStorage.getStorageUsage(),
        ]);

      setOfflineData({
        videos: videos.length,
        watchHistory: watchHistory.length,
        pendingActions: pendingActions.length,
        pendingUploads: pendingUploads.length,
      });

      setStorageUsage(storage);
    } catch (error) {
      const componentError = createComponentError(
        'OfflineIndicator',
        'Failed to load offline data',
        error
      );
      conditionalLogger.error('Failed to load offline data:', componentError);
    }
  };

  const formatBytes = (bytes: any): string => {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getStoragePercentage = (): number => {
    if (storageUsage.quota === 0) {
      return 0;
    }
    return (storageUsage.used / storageUsage.quota) * 100;
  };

  if (isOnline) {
    return (
      <div
        className={`flex items-center space-x-1 text-green-600 dark:text-green-400 ${className}`}
      >
        <Wifi className='w-4 h-4' />
        <span className='text-xs font-medium'>Online</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDetails(!showDetails)}
        className='flex items-center space-x-1 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors'
        aria-label='Offline mode details'
      >
        <WifiOff className='w-4 h-4' />
        <span className='text-xs font-medium'>Offline</span>
      </button>

      {showDetails && (
        <div className='absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50'>
          <div className='flex items-center justify-between mb-3'>
            <h3 className='font-semibold text-gray-900 dark:text-white text-sm'>
              Offline Mode
            </h3>
            <button
              onClick={() => setShowDetails(false)}
              className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            >
              ×
            </button>
          </div>

          <div className='space-y-3'>
            <div className='flex items-center space-x-2 text-orange-600 dark:text-orange-400'>
              <AlertCircle className='w-4 h-4' />
              <span className='text-xs'>
                You're offline. Some features may be limited.
              </span>
            </div>

            <div className='border-t border-gray-200 dark:border-gray-700 pt-3'>
              <h4 className='text-xs font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Available Offline:
              </h4>
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-xs'>
                  <div className='flex items-center space-x-2'>
                    <Download className='w-3 h-3 text-blue-500' />
                    <span className='text-gray-600 dark:text-gray-400'>
                      Cached Videos
                    </span>
                  </div>
                  <span className='font-medium text-gray-900 dark:text-white'>
                    {offlineData.videos}
                  </span>
                </div>
                <div className='flex items-center justify-between text-xs'>
                  <div className='flex items-center space-x-2'>
                    <Clock className='w-3 h-3 text-green-500' />
                    <span className='text-gray-600 dark:text-gray-400'>
                      Watch History
                    </span>
                  </div>
                  <span className='font-medium text-gray-900 dark:text-white'>
                    {offlineData.watchHistory}
                  </span>
                </div>
              </div>
            </div>

            {(offlineData.pendingActions > 0 ||
              offlineData.pendingUploads > 0) && (
              <div className='border-t border-gray-200 dark:border-gray-700 pt-3'>
                <h4 className='text-xs font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Pending Sync:
                </h4>
                <div className='space-y-2'>
                  {offlineData.pendingActions > 0 && (
                    <div className='flex items-center justify-between text-xs'>
                      <span className='text-gray-600 dark:text-gray-400'>
                        User Actions
                      </span>
                      <span className='font-medium text-orange-600 dark:text-orange-400'>
                        {offlineData.pendingActions}
                      </span>
                    </div>
                  )}
                  {offlineData.pendingUploads > 0 && (
                    <div className='flex items-center justify-between text-xs'>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Video Uploads
                      </span>
                      <span className='font-medium text-orange-600 dark:text-orange-400'>
                        {offlineData.pendingUploads}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {storageUsage.quota > 0 && (
              <div className='border-t border-gray-200 dark:border-gray-700 pt-3'>
                <h4 className='text-xs font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Storage Usage:
                </h4>
                <div className='space-y-2'>
                  <div className='flex justify-between text-xs'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      {formatBytes(storageUsage.used)} /{' '}
                      {formatBytes(storageUsage.quota)}
                    </span>
                    <span className='font-medium text-gray-900 dark:text-white'>
                      {getStoragePercentage().toFixed(1)}%
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5'>
                    <div
                      className='bg-blue-500 h-1.5 rounded-full transition-all duration-300'
                      style={{
                        width: `${Math.min(getStoragePercentage(), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className='border-t border-gray-200 dark:border-gray-700 pt-3'>
              <div className='text-xs text-gray-500 dark:text-gray-400'>
                <p className='mb-1'>• Cached content will sync when online</p>
                <p className='mb-1'>• New uploads will be queued</p>
                <p>• Some features require internet connection</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
