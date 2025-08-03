import type React from 'react';
import { useState, useEffect } from 'react';

import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

import { PWAUtils, PWAEvents } from '../src/utils/pwa';

interface PWAInstallBannerProps {
  className?: string;
}

const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ className = '' }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if PWA is already installed
    if (PWAUtils.isInstalled()) {
      return;
    }

    // Check if installation is supported
    if (!PWAUtils.canInstall()) {
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();

      // Save the event so it can be triggered later
      setDeferredPrompt(e);

      // Check if user has previously dismissed the banner
      const dismissedTime = localStorage.getItem('pwa-banner-dismissed');
      if (dismissedTime) {
        const dismissedDate = new Date(parseInt(dismissedTime, 10));
        const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

        // Don't show banner if dismissed within last 30 days
        if (daysSinceDismissed < 30) {
          return;
        }
      }

      // Show the banner after a delay
      setTimeout(() => {
        setShowBanner(true);
        PWAUtils.emitEvent(PWAEvents.INSTALL_PROMPT_SHOWN);
      }, 3000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
      PWAUtils.emitEvent(PWAEvents.INSTALL_SUCCESS);

      // Store install date
      localStorage.setItem('pwa-install-date', Date.now().toString());
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    setIsInstalling(true);

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        PWAUtils.emitEvent(PWAEvents.INSTALL_SUCCESS);
      } else {
        PWAUtils.emitEvent(PWAEvents.INSTALL_FAILED, { reason: 'User dismissed' });
      }

      // Clear the deferredPrompt
      setDeferredPrompt(null);
      setShowBanner(false);
    } catch (error) {
      console.error('Error during PWA installation:', error);
      PWAUtils.emitEvent(PWAEvents.INSTALL_FAILED, { error });
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);

    // Store dismissal time
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());

    PWAUtils.emitEvent(PWAEvents.INSTALL_PROMPT_DISMISSED);
  };

  const getInstallText = () => {
    const platform = PWAUtils.getPlatform();
    const deviceType = PWAUtils.getDeviceType();

    if (platform === 'ios') {
      return deviceType === 'mobile'
        ? 'Add to Home Screen for the best experience'
        : 'Install YouTubeX for quick access';
    }

    return 'Install YouTubeX app for faster access and offline features';
  };

  const getInstallInstructions = () => {
    const platform = PWAUtils.getPlatform();

    if (platform === 'ios') {
      return 'Tap the Share button and select "Add to Home Screen"';
    }

    return 'Click the install button to add YouTubeX to your device';
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform transition-transform duration-300 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ArrowDownTrayIcon className="h-6 w-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {getInstallText()}
              </p>
              <p className="text-xs opacity-90 mt-1">
                {getInstallInstructions()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {deferredPrompt && PWAUtils.getPlatform() !== 'ios' && (
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isInstalling ? 'Installing...' : 'Install'}
              </button>
            )}

            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Dismiss install banner"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallBanner;