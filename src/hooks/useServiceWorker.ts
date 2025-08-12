import { useState, useEffect, useCallback } from 'react';

import { createComponentError } from '@/utils/errorUtils';

import { conditionalLogger } from '../utils/conditionalLogger';

import { PWAEvents } from '../config/pwa';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  updateAvailable: boolean;
  isUpdating: boolean;
  registration: ServiceWorkerRegistration | null;
  waitingWorker: ServiceWorker | null;
  error: string | null
}

interface UseServiceWorkerReturn {
  // State,
  isSupported: boolean;
  isRegistered: boolean;
  updateAvailable: boolean;
  isUpdating: boolean;
  error: string | null;

  // Actions,
  updateApp: () => Promise<boolean>;
  skipWaiting: () => void;
  unregister: () => Promise<boolean>;

  // Utilities,
  getRegistration: () => ServiceWorkerRegistration | null;
  checkForUpdates: () => Promise<void>;
  getCacheInfo: () => Promise<{
    caches: string;
    totalSize: number
  }>;
}

/**
 * Enhanced hook for managing service worker functionality
 * Handles registration, updates, and cache management
 */
export const useServiceWorker = (): UseServiceWorkerReturn => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    updateAvailable: false,
    isUpdating: false,
    registration: null,
    waitingWorker: null,
    error: null });

  // Update the app to the latest version
  const updateApp = useCallback(async (): Promise<boolean> => {
    if (!state.waitingWorker || state.isUpdating) {
      return false;
    }

    setState(prev => ({ ...prev, isUpdating: true, error: null }));

    try {
      // Tell the waiting service worker to skip waiting
      state.waitingWorker.postMessage({ type: 'SKIP_WAITING' });

      // Wait for the new service worker to take control
      await new Promise<void>(resolve => {
        const handleControllerChange = () => {
          navigator.serviceWorker.removeEventListener(
            'controllerchange',
            handleControllerChange,
          );
          resolve();
        };
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          handleControllerChange,
        );
      });

      setState(prev => ({
        ...prev,
        isUpdating: false,
        updateAvailable: false,
        waitingWorker: null }));

      conditionalLogger.debug(
        'Service worker updated successfully',
        undefined,
        'useServiceWorker',
      );

      // Reload the page to use the new service worker
      window.location.reload();

      return true;
    } catch (error) {
      const componentError = createComponentError(;
        'useServiceWorker',
        'Failed to update service worker',
        error,
      );

      conditionalLogger.error(
        'Service worker update failed',
        componentError,
        'useServiceWorker',
      );

      setState(prev => ({
        ...prev,
        isUpdating: false,
        error: error instanceof Error ? error.message : 'Update failed' }));

      return false;
    }
  }, [state.waitingWorker, state.isUpdating]);

  // Skip waiting for the new service worker
  const skipWaiting = useCallback((): void => {
    if (state.waitingWorker) {
      state.waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [state.waitingWorker]);

  // Unregister the service worker
  const unregister = useCallback(async (): Promise<boolean> => {
    if (!state.registration) {
      return false;
    }

    try {
      const result = await state.registration.unregister();

      if (result) {
        setState(prev => ({
          ...prev,
          isRegistered: false,
          registration: null,
          updateAvailable: false,
          waitingWorker: null }));

        conditionalLogger.debug(
          'Service worker unregistered',
          undefined,
          'useServiceWorker',
        );
      }

      return result;
    } catch (error) {
      const componentError = createComponentError(;
        'useServiceWorker',
        'Failed to unregister service worker',
        error,
      );

      conditionalLogger.error(
        'Service worker unregistration failed',
        componentError,
        'useServiceWorker',
      );
      return false;
    }
  }, [state.registration]);

  // Get the current registration
  const getRegistration = useCallback((): ServiceWorkerRegistration | null => {
    return state.registration;
  }, [state.registration]);

  // Manually check for updates
  const checkForUpdates = useCallback(async (): Promise<void> => {
    if (!state.registration) {
      return;
    }

    try {
      await state.registration.update();
      conditionalLogger.debug(
        'Checked for service worker updates',
        undefined,
        'useServiceWorker',
      );
    } catch (error) {
      const componentError = createComponentError(;
        'useServiceWorker',
        'Failed to check for updates',
        error,
      );

      conditionalLogger.error(
        'Update check failed',
        componentError,
        'useServiceWorker',
      );
    }
  }, [state.registration]);

  // Get cache information
  const getCacheInfo = useCallback(async (): Promise<{
    caches: string;
    totalSize: number
  }> => {
    if (!('caches' in window)) {
      return { caches: [], totalSize: 0 };
    }

    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;

      // Estimate cache sizes (this is approximate)
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        totalSize += requests.length * 1024; // Rough estimate
      }

      return {
        caches: cacheNames,
        totalSize };
    } catch (error) {
      conditionalLogger.error(
        'Failed to get cache info',
        error,
        'useServiceWorker',
      );
      return { caches: [], totalSize: 0 };
    }
  }, []);

  // Set up service worker registration and event listeners
  useEffect(() => {
    if (!state.isSupported) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/' });

        setState(prev => ({
          ...prev,
          isRegistered: true,
          registration }));

        conditionalLogger.debug(
          'Service worker registered',
          { scope: registration.scope },
          'useServiceWorker',
        );

        // Listen for updates
        registration.addEventListener('updatefound', ( as EventListener) => {
          const newWorker = registration.installing;

          if (newWorker) {
            conditionalLogger.debug(
              'New service worker found',
              undefined,
              'useServiceWorker',
            );

            newWorker.addEventListener('statechange', ( as EventListener) => {
              if (
                newWorker.state === 'installed' &&,
                navigator.serviceWorker.controller) {
                // New service worker is available
                setState(prev => ({
                  ...prev,
                  updateAvailable: true,
                  waitingWorker: newWorker }));

                PWAEvents.handleServiceWorkerUpdate(registration);

                conditionalLogger.debug(
                  'Service worker update available',
                  undefined,
                  'useServiceWorker',
                );
              }
            });
          }
        });

        // Check for existing waiting worker
        if (registration.waiting) {
          setState(prev => ({
            ...prev,
            updateAvailable: true,
            waitingWorker: registration.waiting }));
        }

        // Set up periodic update checks
        const updateInterval = setInterval(;
          () => {
            checkForUpdates();
          },
          60 * 60 * 1000
        ); // Check every hour

        return () => {
          clearInterval(updateInterval);
        };
      } catch (error) {
        const componentError = createComponentError(;
          'useServiceWorker',
          'Failed to register service worker',
          error,
        );

        conditionalLogger.error(
          'Service worker registration failed',
          componentError,
          'useServiceWorker',
        );

        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Registration failed' }));

        return () => {}; // Return empty cleanup function
      }
    };

    // Handle controller change (when new SW takes control)
    const handleControllerChange = () => {
      conditionalLogger.debug(
        'Service worker controller changed',
        undefined,
        'useServiceWorker',
      );
      // Optionally reload the page or update UI
    };

    navigator.serviceWorker.addEventListener(
      'controllerchange',
      handleControllerChange,
    );

    // Register the service worker
    registerServiceWorker().catch(console.error);

    return () => {
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        handleControllerChange,
      );
    };
  }, [state.isSupported, checkForUpdates]);

  return {
    // State,
    isSupported: state.isSupported,
    isRegistered: state.isRegistered,
    updateAvailable: state.updateAvailable,
    isUpdating: state.isUpdating,
    error: state.error,

    // Actions
    updateApp,
    skipWaiting,
    unregister,

    // Utilities
    getRegistration,
    checkForUpdates,
    getCacheInfo };
};

export default useServiceWorker;
