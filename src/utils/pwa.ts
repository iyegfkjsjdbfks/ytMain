/**
 * PWA (Progressive Web App) utilities and configuration
 */

// PWA Configuration
export const PWA_CONFIG = {
  // App metadata
  name: 'YouTubeX',
  shortName: 'YouTubeX',
  description: 'Advanced YouTube client with enhanced features',

  // Installation
  installPrompt: {
    showAfterVisits: 3,
    showAfterDays: 7,
    dismissedDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
  },

  // Updates
  updates: {
    checkInterval: 60 * 60 * 1000, // 1 hour
    promptDelay: 5 * 1000, // 5 seconds
    autoUpdate: false,
  },

  // Notifications
  notifications: {
    enabled: true,
    badge: '/icons/badge-72x72.png',
    icon: '/icons/icon-192x192.png',
  },

  // Caching
  cache: {
    maxVideoSize: 100 * 1024 * 1024, // 100MB
    maxTotalSize: 500 * 1024 * 1024, // 500MB
    videoQuality: 'medium',
  },

  // Analytics
  analytics: {
    trackInstalls: true,
    trackUsage: true,
    trackPerformance: true,
  },
};

// PWA Events
export const PWAEvents = {
  INSTALL_PROMPT_SHOWN: 'pwa:install-prompt-shown',
  INSTALL_PROMPT_DISMISSED: 'pwa:install-prompt-dismissed',
  INSTALL_SUCCESS: 'pwa:install-success',
  INSTALL_FAILED: 'pwa:install-failed',
  UPDATE_AVAILABLE: 'pwa:update-available',
  UPDATE_INSTALLED: 'pwa:update-installed',
  UPDATE_FAILED: 'pwa:update-failed',
  OFFLINE: 'pwa:offline',
  ONLINE: 'pwa:online',
  NOTIFICATION_PERMISSION_GRANTED: 'pwa:notification-permission-granted',
  NOTIFICATION_PERMISSION_DENIED: 'pwa:notification-permission-denied',
  BACKGROUND_SYNC_REGISTERED: 'pwa:background-sync-registered',
  CACHE_UPDATED: 'pwa:cache-updated',
} as const;

// PWA Utilities
export class PWAUtils {
  /**
   * Check if PWA installation is supported
   */
  static isInstallSupported(): boolean {
    return 'beforeinstallprompt' in window ||
           (navigator as any).standalone !== undefined;
  }

  /**
   * Check if app is installed as PWA
   */
  static isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (navigator as any).standalone === true ||
           document.referrer.includes('android-app://');
  }

  /**
   * Check if running in standalone mode
   */
  static isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches;
  }

  /**
   * Check if service worker is supported
   */
  static isServiceWorkerSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  /**
   * Check if notifications are supported
   */
  static isNotificationSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Check if background sync is supported
   */
  static isBackgroundSyncSupported(): boolean {
    return 'serviceWorker' in navigator &&
           'sync' in window.ServiceWorkerRegistration.prototype;
  }

  /**
   * Check if Web Share API is supported
   */
  static isWebShareSupported(): boolean {
    return 'share' in navigator;
  }

  /**
   * Get PWA display mode
   */
  static getDisplayMode(): string {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return 'standalone';
    }
    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      return 'minimal-ui';
    }
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
      return 'fullscreen';
    }
    return 'browser';
  }

  /**
   * Get device type
   */
  static getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const userAgent = navigator.userAgent.toLowerCase();

    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return 'mobile';
    }

    if (/tablet|ipad/i.test(userAgent)) {
      return 'tablet';
    }

    return 'desktop';
  }

  /**
   * Get platform information
   */
  static getPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('android')) {
return 'android';
}
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
return 'ios';
}
    if (userAgent.includes('windows')) {
return 'windows';
}
    if (userAgent.includes('mac')) {
return 'macos';
}
    if (userAgent.includes('linux')) {
return 'linux';
}

    return 'unknown';
  }

  /**
   * Check if device supports installation
   */
  static canInstall(): boolean {
    const platform = this.getPlatform();

    // iOS Safari doesn't support beforeinstallprompt but supports Add to Home Screen
    if (platform === 'ios') {
      return (navigator as any).standalone !== undefined;
    }

    // Android and desktop support beforeinstallprompt
    return this.isInstallSupported();
  }

  /**
   * Get storage usage information
   */
  static async getStorageUsage(): Promise<{
    used: number;
    available: number;
    percentage: number;
  }> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const available = estimate.quota || 0;
        const percentage = available > 0 ? (used / available) * 100 : 0;

        return { used, available, percentage };
      }
    } catch (error) {
      console.warn('Failed to get storage usage:', error);
    }

    return { used: 0, available: 0, percentage: 0 };
  }

  /**
   * Clear PWA cache
   */
  static async clearCache(): Promise<boolean> {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName)),
        );
        return true;
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }

    return false;
  }

  /**
   * Get network connection information
   */
  static getNetworkInfo(): {
    type: string;
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  } {
    const connection = (navigator as any).connection ||
                      (navigator as any).mozConnection ||
                      (navigator as any).webkitConnection;

    if (connection) {
      return {
        type: connection.type || 'unknown',
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false,
      };
    }

    return {
      type: 'unknown',
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
      saveData: false,
    };
  }

  /**
   * Emit PWA event
   */
  static emitEvent(eventName: string, detail?: any): void {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
  }

  /**
   * Listen to PWA events
   */
  static addEventListener(eventName: string, handler: EventListener): void {
    window.addEventListener(eventName, handler);
  }

  /**
   * Remove PWA event listener
   */
  static removeEventListener(eventName: string, handler: EventListener): void {
    window.removeEventListener(eventName, handler);
  }
}

// Export types
export type PWAEventType = typeof PWAEvents[keyof typeof PWAEvents];

export interface PWAInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWACapabilities {
  install: boolean;
  notifications: boolean;
  backgroundSync: boolean;
  webShare: boolean;
  serviceWorker: boolean;
  offlineSupport: boolean;
}

export interface PWAMetrics {
  installDate?: number;
  launchCount: number;
  sessionDuration: number;
  featuresUsed: string[];
  errors: Array<{
    timestamp: number;
    error: string;
    context: string;
  }>;
}