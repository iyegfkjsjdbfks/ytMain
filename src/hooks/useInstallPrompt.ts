import { useState, useEffect, useCallback } from 'react';

import { createComponentError } from '@/utils/errorUtils';

import { PWAUtils, PWAEvents } from '../config/pwa';
import { conditionalLogger } from '../utils/conditionalLogger';

interface PWAInstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptState {
  isInstallable: boolean;
  isInstalled: boolean;
  showPrompt: boolean;
  isInstalling: boolean;
  installError: string | null;
  deferredPrompt: PWAInstallPrompt | null;
}

interface UseInstallPromptReturn {
  // State
  isInstallable: boolean;
  isInstalled: boolean;
  showPrompt: boolean;
  isInstalling: boolean;
  installError: string | null;

  // Actions
  installApp: () => Promise<boolean>;
  dismissPrompt: (permanent?: boolean) => void;
  resetError: () => void;

  // Utilities
  canShowPrompt: () => boolean;
  getInstallStats: () => {
    visitCount: number;
    lastDismissed: number | null;
    canShow: boolean;
  };
}

/**
 * Enhanced hook for managing PWA installation prompts
 * Separated from main usePWA hook for better separation of concerns
 */
export const useInstallPrompt = (): UseInstallPromptReturn => {
  const [state, setState] = useState<InstallPromptState>({
    isInstallable: false,
    isInstalled: PWAUtils.isInstalled(),
    showPrompt: false,
    isInstalling: false,
    installError: null,
    deferredPrompt: null,
  });

  // Check if prompt can be shown based on visit count and dismissal status
  const canShowPrompt = useCallback((): boolean => {
    if (state.isInstalled || !state.isInstallable) {
      return false;
    }
    return PWAUtils.shouldShowInstallPrompt();
  }, [state.isInstalled, state.isInstallable]);

  // Get installation statistics
  const getInstallStats = useCallback(() => {
    const visitCount = PWAUtils.getVisitCount();
    const dismissedTime = localStorage.getItem(PWAUtils.getInstallPromptKey());
    const lastDismissed = dismissedTime ? parseInt(dismissedTime, 10) : null;

    return {
      visitCount,
      lastDismissed,
      canShow: canShowPrompt(),
    };
  }, [canShowPrompt]);

  // Install the PWA
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!state.deferredPrompt || state.isInstalling) {
      return false;
    }

    setState(prev => ({ ...prev, isInstalling: true, installError: null }));

    try {
      // Show the install prompt
      await state.deferredPrompt.prompt();

      // Wait for user choice
      const choiceResult = await state.deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        conditionalLogger.debug('User accepted PWA install prompt', undefined, 'useInstallPrompt');

        // Update state
        setState(prev => ({
          ...prev,
          isInstalling: false,
          showPrompt: false,
          deferredPrompt: null,
        }));

        return true;
      }
        conditionalLogger.debug('User dismissed PWA install prompt', undefined, 'useInstallPrompt');

        // Mark as dismissed
        PWAUtils.dismissInstallPrompt();

        setState(prev => ({
          ...prev,
          isInstalling: false,
          showPrompt: false,
          deferredPrompt: null,
        }));

        return false;

    } catch (error) {
      const componentError = createComponentError(
        'useInstallPrompt',
        'Failed to install PWA',
        error,
      );

      conditionalLogger.error('PWA installation failed', componentError, 'useInstallPrompt');

      setState(prev => ({
        ...prev,
        isInstalling: false,
        installError: error instanceof Error ? error.message : 'Installation failed',
      }));

      return false;
    }
  }, [state.deferredPrompt, state.isInstalling]);

  // Dismiss the install prompt
  const dismissPrompt = useCallback((permanent: boolean = false): void => {
    if (permanent) {
      PWAUtils.dismissInstallPrompt();
    } else {
      // Just hide for this session
      sessionStorage.setItem('pwa-install-dismissed-session', 'true');
    }

    setState(prev => ({ ...prev, showPrompt: false }));

    conditionalLogger.debug(
      `PWA install prompt dismissed (permanent: ${permanent})`,
      undefined,
      'useInstallPrompt',
    );
  }, []);

  // Reset installation error
  const resetError = useCallback((): void => {
    setState(prev => ({ ...prev, installError: null }));
  }, []);

  // Set up event listeners
  useEffect(() => {
    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      PWAEvents.handleBeforeInstallPrompt(event);

      const installPrompt = event as PWAInstallPrompt;

      setState(prev => ({
        ...prev,
        deferredPrompt: installPrompt,
        isInstallable: true,
      }));

      // Show prompt after delay if conditions are met
      setTimeout(() => {
        if (canShowPrompt() && !sessionStorage.getItem('pwa-install-dismissed-session')) {
          setState(prev => ({ ...prev, showPrompt: true }));
        }
      }, 3000);
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      PWAEvents.handleAppInstalled();

      setState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        showPrompt: false,
        deferredPrompt: null,
      }));

      // Show success notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('YouTubeX Installed!', {
          body: 'You can now access YouTubeX from your home screen.',
          icon: '/icons/icon-192x192.svg',
          badge: '/icons/badge-72x72.svg',
        });
      }
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Increment visit count
    PWAUtils.incrementVisitCount();

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [canShowPrompt]);

  return {
    // State
    isInstallable: state.isInstallable,
    isInstalled: state.isInstalled,
    showPrompt: state.showPrompt,
    isInstalling: state.isInstalling,
    installError: state.installError,

    // Actions
    installApp,
    dismissPrompt,
    resetError,

    // Utilities
    canShowPrompt,
    getInstallStats,
  };
};

export default useInstallPrompt;