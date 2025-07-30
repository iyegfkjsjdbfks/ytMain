import { useState, useEffect, type React } from 'react';

import { PWAUtils } from '../config/pwa';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { usePWA } from '../hooks/usePWA';
import { usePWAUpdates } from '../hooks/usePWAUpdates';
import { trackEvent } from '../utils/analytics';

interface PWAInstallBannerProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'detailed';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center';
  autoShow?: boolean;
  showBenefits?: boolean;
  onInstallSuccess?: () => void;
  onDismiss?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  className = '',
  variant = 'default',
  position = 'bottom-right',
  autoShow = true,
  showBenefits = true,
  onInstallSuccess,
  onDismiss,
}) => {
  const { canInstall, isInstalled } = usePWA();
  const {

    isInstalling,
    installError,
    installApp,
    dismissPrompt,
    resetError,
  } = useInstallPrompt();
  const { isOnline } = useOfflineStatus();
  const { updateAvailable, isUpdating, installUpdate } = usePWAUpdates();

  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!autoShow) {
return;
}

    const checkVisibility = () => {
      if (isInstalled || isDismissed || !canInstall) {
        setIsVisible(false);
        return;
      }

      // Check if user has dismissed the banner recently
      const dismissedTime = localStorage.getItem('pwa-banner-dismissed');
      if (dismissedTime) {
        const timeSinceDismissed = Date.now() - parseInt(dismissedTime, 10);
        const daysSinceDismissed = timeSinceDismissed / (1000 * 60 * 60 * 24);

        if (daysSinceDismissed < 7) {
          setIsVisible(false);
          return;
        }
      }

      // Check visit count
      const visitCount = PWAUtils.getVisitCount();
      if (visitCount >= 3) {
        setIsVisible(true);
      }
    };

    checkVisibility();
  }, [canInstall, isInstalled, isDismissed, autoShow]);

  const handleInstall = async () => {
    try {
      resetError();
      const success = await installApp();
      if (success) {
        trackEvent('pwa_install_success', {
          source: 'banner',
          variant,
          timestamp: Date.now(),
        });
        onInstallSuccess?.();
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Failed to install PWA:', error);
      trackEvent('pwa_install_error', {
        source: 'banner',
        variant,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
    setIsDismissed(true);
    setIsVisible(false);
    dismissPrompt();
    onDismiss?.();

    trackEvent('pwa_banner_dismissed', {
      variant,
      timestamp: Date.now(),
    });
  };

  const handleUpdateInstall = async () => {
    try {
      await installUpdate();
      trackEvent('pwa_update_installed', {
        source: 'banner',
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to install update:', error);
    }
  };

  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50';
    switch (position) {
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      case 'bottom-center':
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2`;
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      default:
        return `${baseClasses} bottom-4 right-4`;
    }
  };

  const renderMinimalVariant = () => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">Install App</span>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-medium py-1 px-2 rounded transition-colors"
          >
            {isInstalling ? 'Installing...' : 'Install'}
          </button>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  const renderDefaultVariant = () => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm">
      {updateAvailable && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800 dark:text-blue-200">Update available</span>
            <button
              onClick={handleUpdateInstall}
              disabled={isUpdating}
              className="text-xs bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-2 py-1 rounded"
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Install YouTubeX App
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Get the full app experience with offline access and faster loading.
          </p>

          {!isOnline && (
            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <span className="text-xs text-yellow-800 dark:text-yellow-200">You're offline - Install for better offline experience</span>
            </div>
          )}

          {showBenefits && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Works offline
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Faster loading
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Push notifications
              </div>
              {isOnline && (
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Works offline
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {installError && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <span className="text-xs text-red-800 dark:text-red-200">{installError}</span>
        </div>
      )}

      <div className="mt-4 flex space-x-2">
        <button
          onClick={handleInstall}
          disabled={isInstalling}
          className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
        >
          {isInstalling ? 'Installing...' : 'Install'}
        </button>
        <button
          onClick={handleDismiss}
          className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`${getPositionClasses()} ${className}`}>
      {variant === 'minimal' ? renderMinimalVariant() : renderDefaultVariant()}
    </div>
  );
};