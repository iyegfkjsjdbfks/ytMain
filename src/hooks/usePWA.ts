
// TODO: Fix import - import { useState, useEffect, useCallback } from 'react';

import { createComponentError } from '@/utils/errorUtils';

import { conditionalLogger } from '../utils/conditionalLogger';

import { PWAUtils } from '../utils/pwa';

import { useInstallPrompt } from './useInstallPrompt';

import { useOfflineStatus } from './useOfflineStatus';

import { usePWANotifications } from './usePWANotifications';

import { usePWAUpdates } from './usePWAUpdates';

interface PWAState {
  isInitialized: boolean;
  features: {
    installPrompt: boolean;
    notifications: boolean;
    backgroundSync: boolean;
    sharing: boolean;
    offlineSupport: boolean;
  };
}

interface UsePWAReturn {
  // Installation
  canInstall: boolean;
  isInstalled: boolean;
  installPWA: () => Promise<boolean>;
  showInstallPrompt: () => Promise<boolean>;
  dismissInstallPrompt: () => void;

  // Network & Offline
  isOnline: boolean;
  isOffline: boolean;
  networkQuality: 'fast' | 'slow' | 'offline';
  shouldReduceData: boolean;

  // Updates
  updateAvailable: boolean;
  isUpdating: boolean;
  checkForUpdates: () => Promise<boolean>;
  installUpdate: () => Promise<void>;

  // Notifications
  notificationPermission: NotificationPermission;
  canShowNotifications: boolean;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  showNotification: (options) => Promise<boolean>;

  // Features
  shareContent: (data: ShareData) => Promise<boolean>;
  addToHomeScreen: () => void;
  registerBackgroundSync: (tag: string) => Promise<void>;
  cacheVideo: (videoId: string, quality?: string) => Promise<boolean>;

  // Analytics
  getInstallStats: () => any;
  getUsageStats: () => any;

  // State
  isInitialized: boolean;
  supportedFeatures: string[];
}

export const usePWA = (): UsePWAReturn => {
  const [state, setState] = useState<PWAState>({
    isInitialized: false,
    features: {
      installPrompt: false,
      notifications: false,
      backgroundSync: false,
      sharing: false,
      offlineSupport: false,
    },
  });

  // Use specialized hooks
  const installPrompt = useInstallPrompt();
  const offlineStatus = useOfflineStatus();
  const pwaUpdates = usePWAUpdates();
  const notifications = usePWANotifications();

  // Initialize PWA features
  const initializePWA = useCallback(async () => {
    try {
      conditionalLogger.info('Initializing PWA features', undefined, 'usePWA');

      // Check feature support
      const features = {
        installPrompt: PWAUtils.isInstallSupported(),
        notifications: notifications.isSupported,
        backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
        sharing: 'share' in navigator,
        offlineSupport: 'serviceWorker' in navigator,
      };

      setState(prev => ({
        ...prev,
        features,
        isInitialized: true,
      }));

      conditionalLogger.info(
        'PWA features initialized',
        { supportedFeatures: Object.keys(features).filter((key) => features[key as keyof typeof features]) },
        'usePWA',
      );
    } catch (error) {
      conditionalLogger.error(
        'Failed to initialize PWA features',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'usePWA',
      );
    }
  }, [notifications.isSupported]);

  // Initialize PWA on mount (guard against StrictMode double-invoke)
  useEffect(() => {


    // Avoid re-initializing if already initialized
    if (!state.isInitialized) {
      initializePWA();
    }

    return () => {
      mounted = false;
    };
    // include state.isInitialized to prevent duplicate init logs
  }, [initializePWA, state.isInitialized]);

  // Track PWA usage (debounced to reduce noisy duplicates)
  useEffect(() => {
    if (!state.isInitialized) return;

    const timer = setTimeout(() => {
      const usageData = {
        timestamp: Date.now(),
        features: state.features,
        userAgent: navigator.userAgent,
        isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      };

      try {
        const existingData = JSON.parse(localStorage.getItem('pwa-usage-data') || '[]');
        existingData.push(usageData);

        // Keep only last 100 entries
        if (existingData.length > 100) {
          existingData.splice(0, existingData.length - 100);
        }

        localStorage.setItem('pwa-usage-data', JSON.stringify(existingData));
      } catch (error) {
        conditionalLogger.error(
          'Failed to track PWA usage',
          { error: error instanceof Error ? error.message : 'Unknown error' },
          'usePWA',
        );
      }
    }, 250); // debounce a bit to avoid StrictMode double logs

    return () => clearTimeout(timer);
  }, [state.isInitialized, state.features]);

  // Share content using Web Share API
  const shareContent = useCallback(async (data: ShareData): Promise<boolean> => {
    try {
      if (!('share' in navigator)) {
        conditionalLogger.warn('Web Share API not supported', undefined, 'usePWA');
        return false;
      }

      await navigator.share(data);
      conditionalLogger.debug('Content shared successfully', { title: data.title }, 'usePWA');
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        conditionalLogger.debug('Share cancelled by user', undefined, 'usePWA');
      } else {
        conditionalLogger.error(
          'Failed to share content',
          { error: error instanceof Error ? error.message : 'Unknown error' },
          'usePWA',
        );
      }
      return false;
    }
  }, []);

  // Add to home screen helper
  const addToHomeScreen = useCallback(() => {
    if (installPrompt.isInstallable) {
      installPrompt.installApp();
    } else {
      // For iOS Safari
      if ((navigator as any).standalone === false) {
        notifications.showNotification({
          title: 'Add to Home Screen',
          body: 'Tap the share button and then "Add to Home Screen".',
          icon: '/icons/icon-192x192.png',
        });
      }
    }
  }, [installPrompt.isInstallable, installPrompt.installApp, notifications.showNotification]);

  // Register background sync
  const registerBackgroundSync = useCallback(async (tag: string): Promise<void> => {
    try {
      if (!state.features.backgroundSync) {
        conditionalLogger.warn('Background sync not supported', undefined, 'usePWA');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(tag);
      conditionalLogger.debug('Background sync registered', { tag }, 'usePWA');
    } catch (error) {
      conditionalLogger.error(
        'Failed to register background sync',
        { error: error instanceof Error ? error.message : 'Unknown error', tag },
        'usePWA',
      );
    }
  }, [state.features.backgroundSync]);

  // Cache video for offline viewing
  const cacheVideo = useCallback(async (videoId: string, quality?: string): Promise<boolean> => {
    try {
      if (!('caches' in window)) {
        conditionalLogger.warn('Cache API not supported', undefined, 'usePWA');
        return false;
      }

      const cache = await caches.open(`youtubex-videos-${quality || 'default'}-v1`);
      const videoUrl = `/api/video/${videoId}${quality ? `?quality=${quality}` : ''}`;

      const response = await fetch(videoUrl);
      if (response.ok) {
        await cache.put(`video-${videoId}`, response.clone());
        conditionalLogger.debug('Video cached successfully', { videoId, quality }, 'usePWA');
        return true;
      }

      return false;
    } catch (error) {
      conditionalLogger.error(
        'Failed to cache video',
        { error: error instanceof Error ? error.message : 'Unknown error', videoId },
        'usePWA',
      );
      return false;
    }
  }, []);

  // Get install stats
  const getInstallStats = useCallback(() => {
    return {
      canInstall: installPrompt.isInstallable,
      isInstalled: installPrompt.isInstalled,
      installPromptShown: installPrompt.showPrompt,
      supportedFeatures: Object.keys(state.features).filter(key =>
        state.features[key as keyof typeof state.features],
      ),
    };
  }, [installPrompt.isInstallable, installPrompt.isInstalled, installPrompt.showPrompt, state.features]);

  // Get usage stats
  const getUsageStats = useCallback(() => {
    return {
      isOnline: offlineStatus.isOnline,
      networkQuality: offlineStatus.getNetworkQuality(),
      updateAvailable: pwaUpdates.updateAvailable,
      notificationPermission: notifications.permission,
      lastUpdateCheck: pwaUpdates.lastUpdateCheck,
    };
  }, [
    offlineStatus.isOnline,
    offlineStatus.getNetworkQuality(),
    pwaUpdates.updateAvailable,
    pwaUpdates.lastUpdateCheck,
    notifications.permission,
  ]);

  // const dismissInstallPrompt = (): void => {
  //   installPrompt.dismissPrompt(false);

  //   // Don't show again for this session
  //   sessionStorage.setItem('pwa-install-dismissed', 'true');
  // };

  // const updateApp = async (): Promise<void> => {
  //   try {
  //     await pwaUpdates.installUpdate();
  //   } catch (error) {
  //     conditionalLogger.error('Failed to update app', { error }, 'usePWA');
  //   }
  // };

  // Check if install prompt was previously dismissed
  useEffect(() => {
    const dismissed = sessionStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      installPrompt.dismissPrompt(false);
    }
    // do not re-run unnecessarily
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // Installation
    canInstall: installPrompt.isInstallable,
    isInstalled: installPrompt.isInstalled,
    installPWA: installPrompt.installApp,
    showInstallPrompt: installPrompt.installApp,
    dismissInstallPrompt: installPrompt.dismissPrompt,

    // Network & Offline
    isOnline: offlineStatus.isOnline,
    isOffline: offlineStatus.isOffline,
    networkQuality: offlineStatus.getNetworkQuality(),
    shouldReduceData: offlineStatus.shouldReduceData(),

    // Updates
    updateAvailable: pwaUpdates.updateAvailable,
    isUpdating: pwaUpdates.isUpdating,
    checkForUpdates: pwaUpdates.checkForUpdates,
    installUpdate: pwaUpdates.installUpdate,

    // Notifications
    notificationPermission: notifications.permission,
    canShowNotifications: notifications.canShowNotifications,
    requestNotificationPermission: notifications.requestPermission,
    showNotification: notifications.showNotification,

    // Features
    shareContent,
    addToHomeScreen,
    registerBackgroundSync,
    cacheVideo,

    // Analytics
    getInstallStats,
    getUsageStats,

    // State
    isInitialized: state.isInitialized,
    supportedFeatures: Object.keys(state.features).filter(key =>
      state.features[key as keyof typeof state.features],
    ),
  };
};

// Utility functions for PWA features
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    conditionalLogger.warn('This browser does not support notifications', undefined, 'usePWA');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const showNotification = (title: string, options?: NotificationOptions): void => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const defaultOptions: NotificationOptions = {
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/badge-72x72.svg',
      ...options,
    };

    const notification = new Notification(title, defaultOptions);
    // Notification will auto-close, no need to manage it further
    notification.addEventListener('click', () => notification.close());
  }
};

export const addToHomeScreen = (): void => {
  // For iOS Safari
  if ((navigator as any).standalone === false) {
    alert('To install this app on your iOS device, tap the share button and then "Add to Home Screen".');
  }
};

export const shareContent = async (data: ShareData): Promise<boolean> => {
  if ('share' in navigator) {
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      const componentError = createComponentError(
        `Error sharing: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'usePWA',
        'shareContent',
      );
      conditionalLogger.error('Error sharing', componentError, 'usePWA');
      return false;
    }
  }

  // Fallback to clipboard
  if ('clipboard' in navigator && (navigator as any).clipboard && data.url) {
    try {
      await (navigator as any).clipboard.writeText(data.url);
      showNotification('Link copied to clipboard!');
      return true;
    } catch (error) {
      const componentError = createComponentError(
        `Error copying to clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'usePWA',
        'shareContent',
      );
      conditionalLogger.error('Error copying to clipboard', componentError, 'usePWA');
      return false;
    }
  }

  return false;
};

export const getNetworkStatus = (): { online: boolean; effectiveType?: string; downlink?: number } => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
  };
};

export const enableBackgroundSync = (tag: string): void => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      return (registration as any).sync.register(tag);
    }).catch((error) => {
      const componentError = createComponentError(
        `Background sync registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'usePWA',
        'enableBackgroundSync',
      );
      conditionalLogger.error('Background sync registration failed', componentError, 'usePWA');
    });
  }
};

export const cacheVideo = async (videoUrl: string, videoId: string): Promise<boolean> => {
  if ('caches' in window) {
    try {
      const cache = await caches.open('youtubex-videos-v1');
      const response = await fetch(videoUrl);

      if (response.ok) {
        await cache.put(`video-${videoId}`, response);
        return true;
      }
    } catch (error) {
      const componentError = createComponentError(
        `Error caching video: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'usePWA',
        'cacheVideo',
      );
      conditionalLogger.error('Error caching video', componentError, 'usePWA');
    }
  }

  return false;
};

export const getCachedVideo = async (videoId: string): Promise<Response | null> => {
  if ('caches' in window) {
    try {
      const cache = await caches.open('youtubex-videos-v1');
      const response = await cache.match(`video-${videoId}`);
      return response || null;
    } catch (error) {
      const componentError = createComponentError(
        `Error retrieving cached video: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'usePWA',
        'getCachedVideo',
      );
      conditionalLogger.error('Error retrieving cached video', componentError, 'usePWA');
    }
  }

  return null;
};