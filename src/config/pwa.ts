// PWA Configuration and Utilities

export const PWA_CONFIG = {
  // App Information
  APP_NAME: 'YouTubeX',
  APP_SHORT_NAME: 'YouTubeX',
  APP_DESCRIPTION: 'Enhanced YouTube experience with advanced features',
  
  // URLs and Paths
  START_URL: '/',
  SCOPE: '/',
  MANIFEST_PATH: '/manifest.json',
  SERVICE_WORKER_PATH: '/sw.js',
  
  // Display Settings
  DISPLAY: 'standalone' as const,
  ORIENTATION: 'portrait-primary' as const,
  
  // Theme Colors
  THEME_COLOR: '#dc2626',
  BACKGROUND_COLOR: '#ffffff',
  
  // Cache Settings
  CACHE_NAMES: {
    STATIC: 'youtubex-static-v1',
    DYNAMIC: 'youtubex-dynamic-v1',
    IMAGES: 'youtubex-images-v1',
    API: 'youtubex-api-v1',
  },
  
  // Cache Durations (in milliseconds)
  CACHE_DURATIONS: {
    STATIC: 30 * 24 * 60 * 60 * 1000, // 30 days
    DYNAMIC: 7 * 24 * 60 * 60 * 1000, // 7 days
    IMAGES: 14 * 24 * 60 * 60 * 1000, // 14 days
    API: 5 * 60 * 1000, // 5 minutes
  },
  
  // Installation Settings
  INSTALL_PROMPT: {
    SHOW_AFTER_VISITS: 3,
    DISMISS_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days
    STORAGE_KEY: 'pwa-install-dismissed',
  },
  
  // Update Settings
  UPDATE_CHECK_INTERVAL: 60 * 60 * 1000, // 1 hour
  
  // Notification Settings
  NOTIFICATION_SETTINGS: {
    BADGE: '/icons/badge-72x72.svg',
    DEFAULT_ICON: '/icons/icon-192x192.svg',
    VIBRATE_PATTERN: [200, 100, 200],
  },
  
  // Offline Storage Settings
  OFFLINE_STORAGE: {
    DB_NAME: 'YouTubeXOfflineDB',
    DB_VERSION: 1,
    MAX_VIDEOS: 50,
    MAX_HISTORY_ITEMS: 1000,
    MAX_PLAYLISTS: 20,
    CLEANUP_THRESHOLD: 0.8, // Clean up when 80% full
  },
  
  // Background Sync Settings
  BACKGROUND_SYNC: {
    TAGS: {
      VIDEO_UPLOAD: 'video-upload',
      USER_ACTION: 'user-action',
      ANALYTICS: 'analytics',
    },
    RETRY_DELAY: 5 * 60 * 1000, // 5 minutes
    MAX_RETRIES: 3,
  },
  
  // Feature Flags
  FEATURES: {
    OFFLINE_VIDEO_CACHING: true,
    BACKGROUND_SYNC: true,
    PUSH_NOTIFICATIONS: true,
    SHARE_TARGET: true,
    SHORTCUTS: true,
  },
};

// PWA Detection Utilities
export const PWAUtils = {
  // Check if app is installed as PWA
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  },
  
  // Check if PWA installation is supported
  isInstallSupported(): boolean {
    return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
  },
  
  // Check if device is mobile
  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },
  
  // Check if device supports notifications
  supportsNotifications(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  },
  
  // Check if device supports background sync
  supportsBackgroundSync(): boolean {
    return 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
  },
  
  // Get installation prompt storage key
  getInstallPromptKey(): string {
    return PWA_CONFIG.INSTALL_PROMPT.STORAGE_KEY;
  },
  
  // Check if install prompt was dismissed recently
  isInstallPromptDismissed(): boolean {
    const dismissed = localStorage.getItem(PWA_CONFIG.INSTALL_PROMPT.STORAGE_KEY);
    if (!dismissed) return false;
    
    const dismissedTime = parseInt(dismissed, 10);
    const now = Date.now();
    return (now - dismissedTime) < PWA_CONFIG.INSTALL_PROMPT.DISMISS_DURATION;
  },
  
  // Mark install prompt as dismissed
  dismissInstallPrompt(): void {
    localStorage.setItem(
      PWA_CONFIG.INSTALL_PROMPT.STORAGE_KEY,
      Date.now().toString()
    );
  },
  
  // Get app visit count
  getVisitCount(): number {
    const count = localStorage.getItem('pwa-visit-count');
    return count ? parseInt(count, 10) : 0;
  },
  
  // Increment app visit count
  incrementVisitCount(): number {
    const count = this.getVisitCount() + 1;
    localStorage.setItem('pwa-visit-count', count.toString());
    return count;
  },
  
  // Check if should show install prompt based on visit count
  shouldShowInstallPrompt(): boolean {
    if (this.isInstalled() || this.isInstallPromptDismissed()) {
      return false;
    }
    return this.getVisitCount() >= PWA_CONFIG.INSTALL_PROMPT.SHOW_AFTER_VISITS;
  },
};

// PWA Event Handlers
export const PWAEvents = {
  // Handle beforeinstallprompt event
  handleBeforeInstallPrompt(event: Event): void {
    event.preventDefault();
    // Store the event for later use
    (window as any).deferredPrompt = event;
  },
  
  // Handle app installed event
  handleAppInstalled(): void {
    console.log('PWA was installed');
    // Clear the deferred prompt
    (window as any).deferredPrompt = null;
    // Track installation analytics
    if ('gtag' in window) {
      (window as any).gtag('event', 'pwa_install', {
        event_category: 'PWA',
        event_label: 'App Installed',
      });
    }
  },
  
  // Handle service worker update
  handleServiceWorkerUpdate(registration: ServiceWorkerRegistration): void {
    console.log('Service worker updated');
    // Notify user about update
    if (registration.waiting) {
      // Post message to service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  },
};

// PWA Manifest Generator (for dynamic manifest generation if needed)
export const generateManifest = () => ({
  name: PWA_CONFIG.APP_NAME,
  short_name: PWA_CONFIG.APP_SHORT_NAME,
  description: PWA_CONFIG.APP_DESCRIPTION,
  start_url: PWA_CONFIG.START_URL,
  scope: PWA_CONFIG.SCOPE,
  display: PWA_CONFIG.DISPLAY,
  orientation: PWA_CONFIG.ORIENTATION,
  theme_color: PWA_CONFIG.THEME_COLOR,
  background_color: PWA_CONFIG.BACKGROUND_COLOR,
  icons: [
    {
      src: '/icons/icon-72x72.svg',
      sizes: '72x72',
      type: 'image/svg+xml',
      purpose: 'any maskable',
    },
    {
      src: '/icons/icon-96x96.svg',
      sizes: '96x96',
      type: 'image/svg+xml',
      purpose: 'any maskable',
    },
    {
      src: '/icons/icon-128x128.svg',
      sizes: '128x128',
      type: 'image/svg+xml',
      purpose: 'any maskable',
    },
    {
      src: '/icons/icon-144x144.svg',
      sizes: '144x144',
      type: 'image/svg+xml',
      purpose: 'any maskable',
    },
    {
      src: '/icons/icon-152x152.svg',
      sizes: '152x152',
      type: 'image/svg+xml',
      purpose: 'any maskable',
    },
    {
      src: '/icons/icon-192x192.svg',
      sizes: '192x192',
      type: 'image/svg+xml',
      purpose: 'any maskable',
    },
    {
      src: '/icons/icon-384x384.svg',
      sizes: '384x384',
      type: 'image/svg+xml',
      purpose: 'any maskable',
    },
    {
      src: '/icons/icon-512x512.svg',
      sizes: '512x512',
      type: 'image/svg+xml',
      purpose: 'any maskable',
    },
  ],
  shortcuts: [
    {
      name: 'Upload Video',
      short_name: 'Upload',
      description: 'Upload a new video',
      url: '/upload',
      icons: [{ src: '/icons/icon-192x192.svg', sizes: '192x192' }],
    },
    {
      name: 'Shorts',
      short_name: 'Shorts',
      description: 'Browse YouTube Shorts',
      url: '/shorts',
      icons: [{ src: '/icons/icon-192x192.svg', sizes: '192x192' }],
    },
    {
      name: 'Subscriptions',
      short_name: 'Subs',
      description: 'View your subscriptions',
      url: '/subscriptions',
      icons: [{ src: '/icons/icon-192x192.svg', sizes: '192x192' }],
    },
    {
      name: 'Library',
      short_name: 'Library',
      description: 'Access your library',
      url: '/library',
      icons: [{ src: '/icons/icon-192x192.svg', sizes: '192x192' }],
    },
  ],
});

export default PWA_CONFIG;