import React, { useState } from 'react';

import { BellIcon } from '@heroicons/react/24/solid';

import { BellSlashIcon, BellIcon } from '@heroicons/react/24/outline';

import { useSubscription } from '../hooks/useSubscription';

interface SubscriptionButtonProps {
  channelId: string;
  channelName: string;
  subscriberCount?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showNotificationBell?: boolean;
  variant?: 'default' | 'compact';
}

export const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({
  channelId,
  channelName,
  subscriberCount,
  className = '',
  size = 'md',
  showNotificationBell = true,
  variant = 'default',
}) => {
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const {
    isSubscribed,
    notificationLevel,
    isLoading,
    subscribe,
    unsubscribe,
    updateNotificationLevel,
  } = useSubscription(channelId);

  const handleSubscriptionToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const handleNotificationChange = async (
    level: 'all' | 'personalized' | 'none'
  ) => {
    await updateNotificationLevel(level);
    setShowNotificationMenu(false);
  };

  const formatSubscriberCount = (count?: number): string => {
    if (!count) {
      return '';
    }
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const getNotificationIcon = () => {
    switch (notificationLevel) {
      case 'all':
        return <BellSolidIcon className='w-4 h-4' />;
      case 'personalized':
        return <BellIcon className='w-4 h-4' />;
      case 'none':
        return <BellSlashIcon className='w-4 h-4' />;
      default:
        return <BellIcon className='w-4 h-4' />;
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={handleSubscriptionToggle}
          disabled={isLoading}
          className={`${getSizeClasses()} font-medium rounded-full transition-all duration-200 disabled:opacity-50 ${
            isSubscribed
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {isLoading ? (
            <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
          ) : (
            <>
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
              {subscriberCount && variant !== 'compact' && (
                <span className='ml-1 opacity-75'>
                  {formatSubscriberCount(subscriberCount)}
                </span>
              )}
            </>
          )}
        </button>

        {isSubscribed && showNotificationBell && (
          <div className='relative'>
            <button
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
              title='Notification preferences'
            >
              {getNotificationIcon()}
            </button>

            {showNotificationMenu && (
              <div className='absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-10 min-w-[200px]'>
                <div className='px-4 py-2 text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700'>
                  Notifications
                </div>

                <button
                  onClick={() => handleNotificationChange('all')}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 ${
                    notificationLevel === 'all'
                      ? 'text-blue-600'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <BellSolidIcon className='w-4 h-4' />
                  <div>
                    <div className='font-medium'>All</div>
                    <div className='text-xs opacity-75'>
                      Get notified for all uploads
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleNotificationChange('personalized')}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 ${
                    notificationLevel === 'personalized'
                      ? 'text-blue-600'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <BellIcon className='w-4 h-4' />
                  <div>
                    <div className='font-medium'>Personalized</div>
                    <div className='text-xs opacity-75'>
                      Occasional notifications
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleNotificationChange('none')}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 ${
                    notificationLevel === 'none'
                      ? 'text-blue-600'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <BellSlashIcon className='w-4 h-4' />
                  <div>
                    <div className='font-medium'>None</div>
                    <div className='text-xs opacity-75'>
                      Turn off notifications
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleSubscriptionToggle}
        disabled={isLoading}
        className={`${getSizeClasses()} font-medium rounded-full transition-all duration-200 disabled:opacity-50 flex items-center gap-2 ${
          isSubscribed
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
            : 'bg-red-600 text-white hover:bg-red-700'
        }`}
      >
        {isLoading ? (
          <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
        ) : (
          <>
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
            {subscriberCount && (
              <span className='opacity-75'>
                {formatSubscriberCount(subscriberCount)}
              </span>
            )}
          </>
        )}
      </button>

      {isSubscribed && showNotificationBell && (
        <div className='relative'>
          <button
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
            title='Notification preferences'
          >
            {getNotificationIcon()}
          </button>

          {showNotificationMenu && (
            <div className='absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-10 min-w-[200px]'>
              <div className='px-4 py-2 text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700'>
                Notifications for {channelName}
              </div>

              <button
                onClick={() => handleNotificationChange('all')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 ${
                  notificationLevel === 'all'
                    ? 'text-blue-600'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <BellSolidIcon className='w-4 h-4' />
                <div>
                  <div className='font-medium'>All</div>
                  <div className='text-xs opacity-75'>
                    Get notified for all uploads
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleNotificationChange('personalized')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 ${
                  notificationLevel === 'personalized'
                    ? 'text-blue-600'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <BellIcon className='w-4 h-4' />
                <div>
                  <div className='font-medium'>Personalized</div>
                  <div className='text-xs opacity-75'>
                    Occasional notifications
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleNotificationChange('none')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 ${
                  notificationLevel === 'none'
                    ? 'text-blue-600'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <BellSlashIcon className='w-4 h-4' />
                <div>
                  <div className='font-medium'>None</div>
                  <div className='text-xs opacity-75'>
                    Turn off notifications
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionButton;


