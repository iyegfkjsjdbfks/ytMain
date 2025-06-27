import React, { useState, useEffect } from 'react';

import { BellIcon, CheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';


interface SubscriptionManagerProps {
  channelName: string;
  channelAvatarUrl: string;
  channelId: string;
  subscriberCount: string;
  onSubscriptionChange?: (isSubscribed: boolean) => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  channelName,
  channelAvatarUrl,
  channelId,
  subscriberCount,
  onSubscriptionChange,
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  useEffect(() => {
    // Load subscription status from localStorage
    const subscriptions = JSON.parse(localStorage.getItem('youtubeCloneSubscriptions_v1') || '{}');
    const channelData = subscriptions[channelId];
    if (channelData) {
      setIsSubscribed(channelData.isSubscribed);
      setNotificationsEnabled(channelData.notificationsEnabled || false);
    }
  }, [channelId]);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const subscriptions = JSON.parse(localStorage.getItem('youtubeCloneSubscriptions_v1') || '{}');
      const newSubscriptionStatus = !isSubscribed;

      if (newSubscriptionStatus) {
        subscriptions[channelId] = {
          channelName,
          channelAvatarUrl,
          subscriberCount,
          isSubscribed: true,
          notificationsEnabled: true,
          subscribedAt: new Date().toISOString(),
        };
        setNotificationsEnabled(true);
      } else {
        delete subscriptions[channelId];
        setNotificationsEnabled(false);
      }

      localStorage.setItem('youtubeCloneSubscriptions_v1', JSON.stringify(subscriptions));
      setIsSubscribed(newSubscriptionStatus);
      onSubscriptionChange?.(newSubscriptionStatus);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error updating subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    try {
      const subscriptions = JSON.parse(localStorage.getItem('youtubeCloneSubscriptions_v1') || '{}');
      if (subscriptions[channelId]) {
        subscriptions[channelId].notificationsEnabled = enabled;
        localStorage.setItem('youtubeCloneSubscriptions_v1', JSON.stringify(subscriptions));
        setNotificationsEnabled(enabled);
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
    setShowNotificationMenu(false);
  };

  return (
    <div className="flex items-center space-x-2">
      {isSubscribed ? (
        <div className="flex items-center space-x-1">
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
          >
            <CheckIcon className="w-4 h-4" />
            <span>Subscribed</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className={`p-2 rounded-full transition-colors ${
                notificationsEnabled
                  ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
              title={notificationsEnabled ? 'Notifications on' : 'Notifications off'}
            >
              {notificationsEnabled ? (
                <BellIconSolid className="w-4 h-4" />
              ) : (
                <BellIcon className="w-4 h-4" />
              )}
            </button>

            {showNotificationMenu && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 py-1">
                <button
                  onClick={() => handleNotificationToggle(true)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                    notificationsEnabled ? 'text-neutral-900 dark:text-neutral-100 font-medium' : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <BellIconSolid className="w-4 h-4" />
                    <span>All notifications</span>
                  </div>
                </button>
                <button
                  onClick={() => handleNotificationToggle(false)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                    !notificationsEnabled ? 'text-neutral-900 dark:text-neutral-100 font-medium' : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <BellIcon className="w-4 h-4" />
                    <span>None</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Subscribe</span>
        </button>
      )}
    </div>
  );
};

export default SubscriptionManager;