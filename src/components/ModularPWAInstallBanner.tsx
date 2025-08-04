import React from "react";
import { useState, useEffect, useCallback, type FC } from 'react';

import { conditionalLogger } from '../utils/conditionalLogger';

import { useInstallPrompt } from '../hooks/useInstallPrompt';

import { useOfflineStatus } from '../hooks/useOfflineStatus';

import { usePWA } from '../hooks/usePWA';

import { usePWANotifications } from '../hooks/usePWANotifications';

import { usePWAUpdates } from '../hooks/usePWAUpdates';

interface ModularPWAInstallBannerProps {
  variant?: 'default' | 'minimal' | 'detailed' | 'floating';
  position?: 'top' | 'bottom' | 'center';
  autoShow?: boolean;
  showBenefits?: boolean;
  showNetworkStatus?: boolean;
  showUpdateStatus?: boolean;
  customTheme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
  };
  onInstallSuccess?: () => void;
  onInstallDismiss?: () => void;
  onUpdateInstall?: () => void;
}

interface BannerState {
  isVisible: boolean;
  currentView: 'install' | 'update' | 'offline' | 'notification';
  isAnimating: boolean;
  dismissedAt: number | null;
}

const ModularPWAInstallBanner: FC<ModularPWAInstallBannerProps> = ({
  variant = 'default',
  position = 'bottom',
  autoShow = true,
  showBenefits = true,
  showNetworkStatus = false,
  showUpdateStatus = true,
  customTheme,
  onInstallSuccess,
  onInstallDismiss,
  onUpdateInstall,
}) => {
  const [state, setState] = useState<BannerState>({
    isVisible: false,
    currentView: 'install',
    isAnimating: false,
    dismissedAt: null,
  });

  // Use modular hooks
  const pwa = usePWA();
  const installPrompt = useInstallPrompt();
  const offlineStatus = useOfflineStatus();
  const pwaUpdates = usePWAUpdates();
  const notifications = usePWANotifications();

  // Determine what to show
  const shouldShowInstall = installPrompt.isInstallable && !installPrompt.isInstalled;
  const shouldShowUpdate = pwaUpdates.updateAvailable && showUpdateStatus;
  const shouldShowOffline = offlineStatus.isOffline && showNetworkStatus;
  const shouldShowNotification = !notifications.canShowNotifications && notifications.isSupported;

  // Auto-show logic
  useEffect(() => {
    if (!autoShow) {
return;
}

    const checkAutoShow = () => {
      // Don't show if recently dismissed (within 24 hours)
      const dismissedAt = localStorage.getItem('pwa-banner-dismissed');
      if (dismissedAt) {
        const dismissedTime = parseInt(dismissedAt, 10);
        const dayInMs = 24 * 60 * 60 * 1000;
        if (Date.now() - dismissedTime < dayInMs) {
          return;
        }
      }

      // Determine priority view
      let currentView: BannerState['currentView'] = 'install';
      let shouldShow = false;

      if (shouldShowUpdate) {
        currentView = 'update';
        shouldShow = true;
      } else if (shouldShowInstall) {
        currentView = 'install';
        shouldShow = true;
      } else if (shouldShowNotification) {
        currentView = 'notification';
        shouldShow = true;
      } else if (shouldShowOffline) {
        currentView = 'offline';
        shouldShow = true;
      }

      if (shouldShow) {
        setState(prev => ({
          ...prev,
          isVisible: true,
          currentView,
        }));
      }
    };

    // Delay auto-show to avoid immediate popup
    const timer = setTimeout(checkAutoShow, 2000);
    return () => clearTimeout(timer);
  }, [
    autoShow,
    shouldShowInstall,
    shouldShowUpdate,
    shouldShowOffline,
    shouldShowNotification,
  ]);

  // Handle install
  const handleInstall = useCallback(async () => {
    setState(prev => ({ ...prev, isAnimating: true }));

    try {
      const success = await installPrompt.installApp();

      if (success) {
        conditionalLogger.info('PWA installed successfully', undefined, 'ModularPWAInstallBanner');
        onInstallSuccess?.();

        setState(prev => ({
          ...prev,
          isVisible: false,
          isAnimating: false,
        }));
      } else {
        setState(prev => ({ ...prev, isAnimating: false }));
      }
    } catch (error) {
      conditionalLogger.error(
        'Failed to install PWA',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'ModularPWAInstallBanner',
      );
      setState(prev => ({ ...prev, isAnimating: false }));
    }
  }, [installPrompt.installApp, onInstallSuccess]);

  // Handle update
  const handleUpdate = useCallback(async () => {
    setState(prev => ({ ...prev, isAnimating: true }));

    try {
      await pwaUpdates.installUpdate();
      onUpdateInstall?.();
    } catch (error) {
      conditionalLogger.error(
        'Failed to install update',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'ModularPWAInstallBanner',
      );
    }

    setState(prev => ({ ...prev, isAnimating: false }));
  }, [pwaUpdates.installUpdate, onUpdateInstall]);

  // Handle notification permission
  const handleNotificationPermission = useCallback(async () => {
    setState(prev => ({ ...prev, isAnimating: true }));

    try {
      await notifications.requestPermission();
      setState(prev => ({
        ...prev,
        isVisible: false,
        isAnimating: false,
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isAnimating: false }));
    }
  }, [notifications.requestPermission]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: false,
      dismissedAt: Date.now(),
    }));

    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
    onInstallDismiss?.();
  }, [onInstallDismiss]);

  // Don't render if not visible or not initialized
  if (!state.isVisible || !pwa.isInitialized) {
    return null;
  }

  // Theme styles
  const theme = {
    primaryColor: customTheme?.primaryColor || '#007bff',
    backgroundColor: customTheme?.backgroundColor || '#ffffff',
    textColor: customTheme?.textColor || '#333333',
    borderRadius: customTheme?.borderRadius || '8px',
  };

  // Position classes
  const positionClasses = {
    top: 'top-4 left-4 right-4',
    bottom: 'bottom-4 left-4 right-4',
    center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  };

  // Variant classes
  const variantClasses = {
    default: 'p-4 shadow-lg',
    minimal: 'p-2 shadow-md',
    detailed: 'p-6 shadow-xl',
    floating: 'p-4 shadow-2xl rounded-full',
  };

  // Content based on current view
  const renderContent = () => {
    switch (state.currentView) {
      case 'install':
        return (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1" style={{ color: theme.textColor }}>
                Install YouTubeX
              </h3>
              <p className="text-sm opacity-80" style={{ color: theme.textColor }}>
                Get the full app experience with offline access and notifications.
              </p>
              {showBenefits && variant !== 'minimal' && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    📱 Home Screen Access
                  </span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                    🔔 Push Notifications
                  </span>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                    📶 Offline Support
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={handleInstall}
                disabled={state.isAnimating}
                className="px-4 py-2 text-white rounded font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {state.isAnimating ? 'Installing...' : 'Install'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        );

      case 'update':
        return (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1" style={{ color: theme.textColor }}>
                Update Available
              </h3>
              <p className="text-sm opacity-80" style={{ color: theme.textColor }}>
                A new version of YouTubeX is ready to install.
              </p>
              {pwaUpdates.updateVersion && (
                <p className="text-xs mt-1 opacity-60" style={{ color: theme.textColor }}>
                  Version: {pwaUpdates.updateVersion}
                </p>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={handleUpdate}
                disabled={state.isAnimating}
                className="px-4 py-2 text-white rounded font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {state.isAnimating ? 'Updating...' : 'Update'}
              </button>
              <button
                onClick={() => pwaUpdates.skipUpdate()}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        );

      case 'notification':
        return (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1" style={{ color: theme.textColor }}>
                Enable Notifications
              </h3>
              <p className="text-sm opacity-80" style={{ color: theme.textColor }}>
                Stay updated with new videos and important updates.
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={handleNotificationPermission}
                disabled={state.isAnimating}
                className="px-4 py-2 text-white rounded font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {state.isAnimating ? 'Requesting...' : 'Enable'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        );

      case 'offline':
        return (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1" style={{ color: theme.textColor }}>
                You're Offline
              </h3>
              <p className="text-sm opacity-80" style={{ color: theme.textColor }}>
                Some features may be limited. Check your connection.
              </p>
              {offlineStatus.offlineDuration > 0 && (
                <p className="text-xs mt-1 opacity-60" style={{ color: theme.textColor }}>
                  Offline for: {Math.floor(offlineStatus.offlineDuration / 1000)}s
                </p>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => offlineStatus.testConnection()}
                className="px-4 py-2 text-white rounded font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Retry
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed z-50 ${positionClasses[position]} ${variantClasses[variant]} transition-all duration-300 ease-in-out`}
      style={{
        backgroundColor: theme.backgroundColor,
        borderRadius: theme.borderRadius,
        transform: state.isVisible ? 'translateY(0)' : 'translateY(100%)',
        opacity: state.isVisible ? 1 : 0,
      }}
    >
      {renderContent()}

      {/* Network status indicator */}
      {showNetworkStatus && (
        <div className="absolute top-2 right-2">
          <div
            className={`w-2 h-2 rounded-full ${
              offlineStatus.isOnline
                ? offlineStatus.getNetworkQuality() === 'fast'
                  ? 'bg-green-500'
                  : 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            title={`Network: ${offlineStatus.getNetworkQuality()}`}
          />
        </div>
      )}
    </div>
  );
};

export default ModularPWAInstallBanner;