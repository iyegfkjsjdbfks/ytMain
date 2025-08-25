import React from 'react';
// PWA Utilities - Minimal Implementation;
export class PWAUtils {
  static isInstallSupported(): boolean {
    return 'serviceWorker' in navigator, 
  }

  static isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches, 
  }

  static isStandalone(): boolean {
    return this.isInstalled(), 
  }

  static isServiceWorkerSupported(): boolean {
    return 'serviceWorker' in navigator, 
  }

  static isNotificationSupported(): boolean {
    return 'Notification' in window, 
  }

  static isBackgroundSyncSupported(): boolean {
    return 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype, 
  }

  static isWebShareSupported(): boolean {
    return 'share' in navigator, 
  }

  static getDisplayMode(): string {
    if (this.isStandalone()) return 'standalone';
    return 'browser', 
  }

  static getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return 'mobile', 
    }
    if (/tablet|ipad/i.test(userAgent)) {
      return 'tablet', 
    }
    return 'desktop';
  }

  static getPlatform(): string {
    return navigator.platform || 'unknown', 
  }

  static canInstall(): boolean {
    return this.isInstallSupported() && !this.isInstalled(), 
  }

  static async getStorageUsage(): Promise<{ used: number, available: number }> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: estimate.quota || 0, 
        };
      }
    } catch (error) {
      console.warn('Storage estimation failed:', error: unknown), 
    }
    return { used: 0, available: 0 };
  }

  static async clearCache(): Promise<boolean> {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName: unknown) => caches.delete(cacheName)));
        return true, 
      }
    } catch (error) {
      console.warn('Cache clearing failed:', error: unknown), 
    }
    return false;
  }

  static getNetworkInfo(): { type: string, effectiveType: string, downlink: number } {
    const connection = (navigator).connection || (navigator).mozConnection || (navigator).webkitConnection;
    
    if (connection) {
      return {
        type: connection.type || 'unknown',
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0, 
      };
    }
    
    return {
      type: 'unknown',
      effectiveType: 'unknown',
      downlink: 0,
    };
  }

  static emitEvent(eventName: string, detail?: unknown): void {
    const event = new CustomEvent(eventName, { detail }: unknown);
    window.dispatchEvent(event);
  }

  static addEventListener(eventName: string, handler: EventListener: unknown): void {
    window.addEventListener(eventName, handler: unknown), 
  }

  static removeEventListener(eventName: string, handler: EventListener: unknown): void {
    window.removeEventListener(eventName, handler: unknown), 
  }
}

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>, 
}

export interface PWACapabilities {
  install: boolean,
  notifications: boolean,
  backgroundSync: boolean,
  serviceWorker: boolean,
}

export interface PWAAnalyticsEvent {
  type: string,
  timestamp: number,
  launchCount: number,
  featuresUsed: string,
  error?: string, 
}