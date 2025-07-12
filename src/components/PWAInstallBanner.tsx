import React, { useState, useEffect } from 'react';

import { X, Download, Smartphone, Monitor } from 'lucide-react';

import { usePWA } from '../hooks/usePWA';

interface PWAInstallBannerProps {
  onDismiss?: () => void;
  className?: string;
}

const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onDismiss, className = '' }) => {
  const { canInstall, installPWA, isInstalled } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the banner
    const dismissed = localStorage.getItem('pwa-install-banner-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show banner if PWA can be installed and hasn't been dismissed
    if (canInstall && !isInstalled && !isDismissed) {
      // Delay showing the banner to avoid being intrusive
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled, isDismissed]);

  const handleInstall = async () => {
    try {
      await installPWA();
      setIsVisible(false);
    } catch (error) {
      console.error('Failed to install PWA:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-banner-dismissed', 'true');
    onDismiss?.();
  };

  const handleNotNow = () => {
    setIsVisible(false);
    // Don't permanently dismiss, just hide for this session
  };

  if (!isVisible || isInstalled || !canInstall) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                <div className="w-0 h-0 border-l-[3px] border-l-red-600 border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Install YouTubeX
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Get the app experience
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Dismiss install banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-3">
          <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Smartphone className="w-3 h-3" />
              <span>Offline viewing</span>
            </div>
            <div className="flex items-center space-x-1">
              <Monitor className="w-3 h-3" />
              <span>Desktop app</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download className="w-3 h-3" />
              <span>Fast access</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleInstall}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors flex items-center justify-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span>Install</span>
          </button>
          <button
            onClick={handleNotNow}
            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium py-2 px-3 rounded-md transition-colors"
          >
            Not now
          </button>
        </div>

        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          Works on all devices • No app store needed
        </div>
      </div>
    </div>
  );
};

export default PWAInstallBanner;