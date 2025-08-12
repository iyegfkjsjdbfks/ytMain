import React, { useState, useEffect, FC } from 'react';
import { conditionalLogger } from '../utils/conditionalLogger';
import { usePWA, requestNotificationPermission } from '../hooks/usePWA';
import { SignalSlashIcon, ArrowDownTrayIcon, XMarkIcon, BellIcon } from '@heroicons/react/24/outline';

const PWAStatus: React.FC = () => {
  const {
    isInstalled,
    isOnline,
    canInstall,
    installPWA,
    dismissInstallPrompt,
    updateAvailable,
    installUpdate,
  } = usePWA();

  const [showInstallPrompt, setShowInstallPrompt] = React.useState(false);

  React.useEffect(() => {
    if (canInstall && !isInstalled) {
      setShowInstallPrompt(true);
    }
  }, [canInstall, isInstalled]);

  const handleInstall = async () => {
    await installPWA();
    setShowInstallPrompt(false);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      conditionalLogger.debug('Notifications enabled');
    }
  };

  return (
    <>
      {/* Offline Status Banner */}
      {!isOnline && (
        <div className='fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium z-50'>
          <div className='flex items-center justify-center gap-2'>
            <SignalSlashIcon className='w-4 h-4' />
            <span>You're offline. Some features may be limited.</span>
          </div>
        </div>
      )}

      {/* Update Available Banner */}
      {updateAvailable && (
        <div className='fixed top-0 left-0 right-0 bg-blue-600 text-white px-4 py-3 text-center z-50'>
          <div className='flex items-center justify-center gap-4'>
            <div className='flex items-center gap-2'>
              <ArrowDownTrayIcon className='w-5 h-5' />
              <span className='font-medium'>New version available!</span>
            </div>
            <button
              onClick={installUpdate}
              className='bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50 transition-colors'
            >
              Update Now
            </button>
          </div>
        </div>
      )}

      {/* Install App Prompt */}
      {showInstallPrompt && canInstall && !isInstalled && (
        <div className='fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-red-600 text-white rounded-lg shadow-lg p-4 z-50 animate-slide-in-right-mini'>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-2'>
                <img
                  src='/icons/icon-72x72.svg'
                  alt='YouTubeX'
                  className='w-8 h-8'
                />
                <div>
                  <h3 className='font-bold text-lg'>Install YouTubeX</h3>
                  <p className='text-sm opacity-90'>
                    Get the full app experience
                  </p>
                </div>
              </div>

              <div className='text-sm opacity-90 mb-3'>
                <ul className='space-y-1'>
                  <li>• Faster loading and better performance</li>
                  <li>• Offline video viewing</li>
                  <li>• Push notifications for new content</li>
                  <li>• Home screen access</li>
                </ul>
              </div>

              <div className='flex gap-2'>
                <button
                  onClick={handleInstall}
                  className='bg-white text-red-600 px-4 py-2 rounded font-medium hover:bg-red-50 transition-colors flex items-center gap-2'
                >
                  <ArrowDownTrayIcon className='w-4 h-4' />
                  Install App
                </button>

                <button
                  onClick={handleEnableNotifications}
                  className='bg-red-700 text-white px-3 py-2 rounded hover:bg-red-800 transition-colors flex items-center gap-2'
                >
                  <BellIcon className='w-4 h-4' />
                  Enable Notifications
                </button>
              </div>
            </div>

            <button
              onClick={dismissInstallPrompt}
              className='text-white hover:text-red-200 transition-colors p-1'
            >
              <XMarkIcon className='w-5 h-5' />
            </button>
          </div>
        </div>
      )}

      {/* Connection Status Indicator */}
      <div className='fixed bottom-4 right-4 z-40'>
        {!isOnline && (
          <div className='bg-gray-800 text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm'>
            <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse' />
            <span>Offline</span>
          </div>
        )}

        {isOnline && (
          <div className='bg-green-600 text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm opacity-0 hover:opacity-100 transition-opacity'>
            <div className='w-2 h-2 bg-green-300 rounded-full' />
            <span>Online</span>
          </div>
        )}
      </div>

      {/* PWA Features Info (for installed app) */}
      {isInstalled && (
        <div className='fixed top-4 right-4 z-40'>
          <div className='bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2'>
            <div className='w-2 h-2 bg-green-300 rounded-full' />
            <span>App Mode</span>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAStatus;


