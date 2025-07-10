import { useState, useEffect, useCallback } from 'react';
import { offlineStorage } from '../utils/offlineStorage';
import { PWA_CONFIG, PWAUtils, PWAEvents } from '../config/pwa';

interface PWAInstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  installApp: () => Promise<void>;
  showInstallPrompt: boolean;
  dismissInstallPrompt: () => void;
  updateAvailable: boolean;
  updateApp: () => void;
}

export const usePWA = (): UsePWAReturn => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      setIsInstalled(PWAUtils.isInstalled());
    };

    checkInstalled();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      PWAEvents.handleBeforeInstallPrompt(e);
      const installPrompt = e as PWAInstallPrompt;
      setDeferredPrompt(installPrompt);
      setIsInstallable(true);
      
      // Show install prompt after a delay if not dismissed
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 3000);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      PWAEvents.handleAppInstalled();
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      
      // Show success notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('YouTubeX Installed!', {
          body: 'You can now access YouTubeX from your home screen.',
          icon: '/icons/icon-192x192.svg'
        });
      }
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Service Worker update detection
    const handleServiceWorkerUpdate = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

        navigator.serviceWorker.ready.then((registration) => {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              setWaitingWorker(newWorker);
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        });
      }
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    handleServiceWorkerUpdate();

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isInstalled]);

  const installApp = async (): Promise<void> => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error during app installation:', error);
    }
  };

  const dismissInstallPrompt = (): void => {
    setShowInstallPrompt(false);
    
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  const updateApp = (): void => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
    }
  };

  // Check if install prompt was previously dismissed
  useEffect(() => {
    const dismissed = sessionStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setShowInstallPrompt(false);
    }
  }, []);

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installApp,
    showInstallPrompt,
    dismissInstallPrompt,
    updateAvailable,
    updateApp
  };
};

// Utility functions for PWA features
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
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
      vibrate: [200, 100, 200],
      ...options
    };
    
    new Notification(title, defaultOptions);
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
      console.error('Error sharing:', error);
      return false;
    }
  }
  
  // Fallback to clipboard
  if ('clipboard' in navigator && data.url) {
    try {
      await navigator.clipboard.writeText(data.url);
      showNotification('Link copied to clipboard!');
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
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
    downlink: connection?.downlink
  };
};

export const enableBackgroundSync = (tag: string): void => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      return (registration as any).sync.register(tag);
    }).catch((error) => {
      console.error('Background sync registration failed:', error);
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
      console.error('Error caching video:', error);
    }
  }
  
  return false;
};

export const getCachedVideo = async (videoId: string): Promise<Response | null> => {
  if ('caches' in window) {
    try {
      const cache = await caches.open('youtubex-videos-v1');
      return await cache.match(`video-${videoId}`);
    } catch (error) {
      console.error('Error retrieving cached video:', error);
    }
  }
  
  return null;
};