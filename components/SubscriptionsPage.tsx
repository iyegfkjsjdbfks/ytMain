import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  UserMinusIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  EyeIcon,
  CalendarDaysIcon,
  PlayIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from '../utils/dateUtils';

export interface SubscriptionData {
  id: string;
  channelId: string;
  channelName: string;
  channelAvatar: string;
  channelVerified: boolean;
  subscriberCount: number;
  videoCount: number;
  subscribedAt: string;
  notificationsEnabled: boolean;
  lastVideoUpload?: string;
  category: string;
  description: string;
  isLive?: boolean;
  recentVideos: Array<{
    id: string;
    title: string;
    thumbnail: string;
    views: number;
    uploadedAt: string;
    duration: string;
  }>;
}

interface SubscriptionsPageProps {
  className?: string;
}

const SubscriptionsPage: React.FC<SubscriptionsPageProps> = ({ className = '' }) => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'alphabetical' | 'recent' | 'most_videos' | 'subscribers'>('alphabetical');
  const [filterBy, setFilterBy] = useState<'all' | 'notifications_on' | 'notifications_off' | 'live' | 'recent_uploads'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState<string | null>(null);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<Set<string>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = () => {
    try {
      const stored = localStorage.getItem('youtubeCloneSubscriptions_v1');
      if (stored) {
        const subscriptionsData = JSON.parse(stored);
        const subscriptionsList: SubscriptionData[] = Object.entries(subscriptionsData).map(([channelId, data]: [string, any]) => ({
          id: channelId,
          channelId,
          channelName: data.channelName,
          channelAvatar: data.channelAvatarUrl,
          channelVerified: Math.random() > 0.7,
          subscriberCount: parseInt(data.subscriberCount?.replace(/[^\d]/g, '') || '0') || Math.floor(Math.random() * 1000000),
          videoCount: Math.floor(Math.random() * 500) + 10,
          subscribedAt: data.subscribedAt,
          notificationsEnabled: data.notificationsEnabled,
          lastVideoUpload: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          category: ['Gaming', 'Music', 'Education', 'Entertainment', 'Technology'][Math.floor(Math.random() * 5)],
          description: `Welcome to ${data.channelName}! We create amazing content for our viewers.`,
          isLive: Math.random() > 0.9,
          recentVideos: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
            id: `video-${channelId}-${i}`,
            title: `Amazing Video ${i + 1} from ${data.channelName}`,
            thumbnail: `https://picsum.photos/320/180?random=${channelId}-${i}`,
            views: Math.floor(Math.random() * 1000000),
            uploadedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            duration: `${Math.floor(Math.random() * 20) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
          }))
        }));
        setSubscriptions(subscriptionsList);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const handleUnsubscribe = (channelId: string) => {
    try {
      const stored = localStorage.getItem('youtubeCloneSubscriptions_v1');
      if (stored) {
        const subscriptionsData = JSON.parse(stored);
        delete subscriptionsData[channelId];
        localStorage.setItem('youtubeCloneSubscriptions_v1', JSON.stringify(subscriptionsData));
        setSubscriptions(prev => prev.filter(sub => sub.channelId !== channelId));
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  };

  const handleToggleNotifications = (channelId: string, enabled: boolean) => {
    try {
      const stored = localStorage.getItem('youtubeCloneSubscriptions_v1');
      if (stored) {
        const subscriptionsData = JSON.parse(stored);
        if (subscriptionsData[channelId]) {
          subscriptionsData[channelId].notificationsEnabled = enabled;
          localStorage.setItem('youtubeCloneSubscriptions_v1', JSON.stringify(subscriptionsData));
          setSubscriptions(prev => prev.map(sub => 
            sub.channelId === channelId ? { ...sub, notificationsEnabled: enabled } : sub
          ));
        }
      }
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  };

  const handleVisitChannel = (channelId: string) => {
    window.location.href = `/channel/${channelId}`;
  };

  const handleWatchVideo = (videoId: string) => {
    window.location.href = `/watch/${videoId}`;
  };

  // Filter and sort subscriptions
  const filteredSubscriptions = subscriptions
    .filter(sub => {
      if (searchQuery && !sub.channelName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      switch (filterBy) {
        case 'notifications_on':
          return sub.notificationsEnabled;
        case 'notifications_off':
          return !sub.notificationsEnabled;
        case 'live':
          return sub.isLive;
        case 'recent_uploads':
          return sub.lastVideoUpload && 
                 new Date(sub.lastVideoUpload).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.channelName.localeCompare(b.channelName);
        case 'recent':
          return new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime();
        case 'most_videos':
          return b.videoCount - a.videoCount;
        case 'subscribers':
          return b.subscriberCount - a.subscriberCount;
        default:
          return 0;
      }
    });

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleBulkUnsubscribe = () => {
    selectedSubscriptions.forEach(channelId => {
      handleUnsubscribe(channelId);
    });
    setSelectedSubscriptions(new Set());
    setBulkActionMode(false);
  };

  const handleBulkNotifications = (enabled: boolean) => {
    selectedSubscriptions.forEach(channelId => {
      handleToggleNotifications(channelId, enabled);
    });
    setSelectedSubscriptions(new Set());
  };

  const toggleSelection = (channelId: string) => {
    setSelectedSubscriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(channelId)) {
        newSet.delete(channelId);
      } else {
        newSet.add(channelId);
      }
      return newSet;
    });
  };

  const renderSubscriptionCard = (subscription: SubscriptionData) => (
    <div
      key={subscription.id}
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow ${
        selectedSubscriptions.has(subscription.channelId) ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {bulkActionMode && (
            <input
              type="checkbox"
              checked={selectedSubscriptions.has(subscription.channelId)}
              onChange={() => toggleSelection(subscription.channelId)}
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          )}
          
          <div className="relative">
            <img
              src={subscription.channelAvatar}
              alt={subscription.channelName}
              className="w-12 h-12 rounded-full cursor-pointer"
              onClick={() => handleVisitChannel(subscription.channelId)}
            />
            {subscription.isLive && (
              <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs px-1 rounded">
                LIVE
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3
                className="font-medium text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => handleVisitChannel(subscription.channelId)}
              >
                {subscription.channelName}
              </h3>
              {subscription.channelVerified && (
                <CheckIcon className="w-4 h-4 text-blue-500" />
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span>{formatNumber(subscription.subscriberCount)} subscribers</span>
              <span>{subscription.videoCount} videos</span>
            </div>

            {subscription.lastVideoUpload && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Last upload: {formatDistanceToNow(new Date(subscription.lastVideoUpload))} ago
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleToggleNotifications(subscription.channelId, !subscription.notificationsEnabled)}
              className={`p-2 rounded-full transition-colors ${
                subscription.notificationsEnabled
                  ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={subscription.notificationsEnabled ? 'Turn off notifications' : 'Turn on notifications'}
            >
              {subscription.notificationsEnabled ? (
                <BellSolidIcon className="w-5 h-5" />
              ) : (
                <BellIcon className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => setShowUnsubscribeModal(subscription.channelId)}
              className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Unsubscribe"
            >
              <UserMinusIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {subscription.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
            {subscription.description}
          </p>
        )}
      </div>

      {subscription.recentVideos.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Recent videos</h4>
          <div className="space-y-2">
            {subscription.recentVideos.slice(0, 2).map((video) => (
              <div
                key={video.id}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
                onClick={() => handleWatchVideo(video.id)}
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-16 h-9 object-cover rounded"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                    {video.duration}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                    {video.title}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{formatNumber(video.views)} views</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(video.uploadedAt))} ago</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (subscriptions.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 dark:text-gray-600 mb-4">
          <UserMinusIcon className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No subscriptions yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start subscribing to channels to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Subscriptions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {subscriptions.length} channels
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setBulkActionMode(!bulkActionMode)}
            className={`px-4 py-2 rounded-md transition-colors ${
              bulkActionMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {bulkActionMode ? 'Cancel' : 'Manage'}
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {viewMode === 'grid' ? (
              <ListBulletIcon className="w-5 h-5" />
            ) : (
              <Squares2X2Icon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {bulkActionMode && selectedSubscriptions.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 dark:text-blue-200">
              {selectedSubscriptions.size} channel{selectedSubscriptions.size !== 1 ? 's' : ''} selected
            </span>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleBulkNotifications(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Enable Notifications
              </button>
              <button
                onClick={() => handleBulkNotifications(false)}
                className="px-3 py-1 border border-blue-600 text-blue-600 rounded text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Disable Notifications
              </button>
              <button
                onClick={handleBulkUnsubscribe}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Unsubscribe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subscriptions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="alphabetical">A-Z</option>
          <option value="recent">Recently subscribed</option>
          <option value="most_videos">Most videos</option>
          <option value="subscribers">Most subscribers</option>
        </select>

        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All subscriptions</option>
          <option value="notifications_on">Notifications on</option>
          <option value="notifications_off">Notifications off</option>
          <option value="live">Live now</option>
          <option value="recent_uploads">Recent uploads</option>
        </select>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubscriptions.map(subscription => renderSubscriptionCard(subscription))}
      </div>

      {/* Unsubscribe Modal */}
      {showUnsubscribeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Unsubscribe from channel?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You won't get notifications about new videos from this channel.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUnsubscribeModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showUnsubscribeModal) {
                    handleUnsubscribe(showUnsubscribeModal);
                  }
                  setShowUnsubscribeModal(null);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Unsubscribe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;
