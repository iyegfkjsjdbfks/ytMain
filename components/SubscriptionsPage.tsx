import React, { useState, useEffect } from 'react';

import {
  BellIcon,
  UserMinusIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  Squares2X2Icon,
  ListBulletIcon,
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

 

  const filterSubscriptions = () => {
    let filtered = subscriptions;

    if (searchQuery) {
      filtered = filtered.filter(sub =>
        sub.channelName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filterBy === 'notifications_on') {
      filtered = filtered.filter(sub => sub.notificationsEnabled);
    } else if (filterBy === 'notifications_off') {
      filtered = filtered.filter(sub => !sub.notificationsEnabled);
    } else if (filterBy === 'live') {
      filtered = filtered.filter(sub => sub.isLive);
    } else if (filterBy === 'recent_uploads') {
      filtered = filtered.filter(sub => sub.lastVideoUpload && (new Date().getTime() - new Date(sub.lastVideoUpload).getTime()) < (7 * 24 * 60 * 60 * 1000)); // Last 7 days
    }

    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.channelName.localeCompare(b.channelName));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime());
        break;
      case 'most_videos':
        filtered.sort((a, b) => b.videoCount - a.videoCount);
        break;
      case 'subscribers':
        filtered.sort((a, b) => b.subscriberCount - a.subscriberCount);
        break;
      default:
        break;
    }
    return filtered;
  };

  const toggleNotifications = (channelId: string) => {
    setSubscriptions(prev => prev.map(sub =>
      sub.channelId === channelId
        ? { ...sub, notificationsEnabled: !sub.notificationsEnabled }
        : sub,
    ));
    // Update localStorage
    const stored = JSON.parse(localStorage.getItem('youtubeCloneSubscriptions_v1') || '{}');
    const updatedStored = { ...stored };
    if (updatedStored[channelId]) {
      updatedStored[channelId].notificationsEnabled = !updatedStored[channelId].notificationsEnabled;
    }
    localStorage.setItem('youtubeCloneSubscriptions_v1', JSON.stringify(updatedStored));
  };

  const handleUnsubscribe = (channelId: string) => {
    setSubscriptions(prev => prev.filter(sub => sub.channelId !== channelId));
    // Update localStorage
    const stored = JSON.parse(localStorage.getItem('youtubeCloneSubscriptions_v1') || '{}');
    delete stored[channelId];
    localStorage.setItem('youtubeCloneSubscriptions_v1', JSON.stringify(stored));
    setShowUnsubscribeModal(null);
  };

  const toggleBulkSelection = (channelId: string) => {
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

  const handleBulkAction = (action: 'unsubscribe' | 'toggle_notifications') => {
    selectedSubscriptions.forEach(channelId => {
      if (action === 'unsubscribe') {
        handleUnsubscribe(channelId);
      } else if (action === 'toggle_notifications') {
        toggleNotifications(channelId);
      }
    });
    setSelectedSubscriptions(new Set());
    setBulkActionMode(false);
  };

  const filteredAndSortedSubscriptions = filterSubscriptions();

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Subscriptions</h1>

        {/* Controls: Search, Sort, Filter, View Mode */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="alphabetical">Sort by: A-Z</option>
              <option value="recent">Sort by: Recently Subscribed</option>
              <option value="most_videos">Sort by: Most Videos</option>
              <option value="subscribers">Sort by: Subscribers</option>
            </select>

            {/* Filter By */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Filter: All</option>
              <option value="notifications_on">Filter: Notifications On</option>
              <option value="notifications_off">Filter: Notifications Off</option>
              <option value="live">Filter: Live Now</option>
              <option value="recent_uploads">Filter: Recent Uploads</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow text-blue-600' : 'text-gray-500 dark:text-gray-400 hover:text-blue-600'}`}
                title="Grid View"
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow text-blue-600' : 'text-gray-500 dark:text-gray-400 hover:text-blue-600'}`}
                title="List View"
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => setBulkActionMode(!bulkActionMode)}
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {bulkActionMode ? 'Exit Bulk Mode' : 'Select Multiple'}
            </button>
            {bulkActionMode && selectedSubscriptions.size > 0 && (
              <>
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  {selectedSubscriptions.size} selected
                </span>
                <button
                  onClick={() => handleBulkAction('toggle_notifications')}
                  className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Toggle Notifications
                </button>
                <button
                  onClick={() => handleBulkAction('unsubscribe')}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
                >
                  Unsubscribe Selected
                </button>
              </>
            )}
          </div>
        </div>

        {/* Subscription List/Grid */}
        {filteredAndSortedSubscriptions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No subscriptions found matching your criteria.
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Try adjusting your search, sort, or filter options.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedSubscriptions.map((sub) => (
              <div key={sub.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                {bulkActionMode && (
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedSubscriptions.has(sub.channelId)}
                      onChange={() => toggleBulkSelection(sub.channelId)}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                )}
                <div className="relative h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <img
                    src={sub.channelArt || `/api/placeholder/480/180?text=${sub.channelName.split(' ')[0]}`}
                    alt={`${sub.channelName} channel art`}
                    className="w-full h-full object-cover"
                  />
                  <img
                    src={sub.channelAvatar}
                    alt={`${sub.channelName} avatar`}
                    className="absolute -bottom-8 left-4 w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 shadow-md"
                  />
                </div>
                <div className="p-4 pt-10">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
                    {sub.channelName}
                    {sub.channelVerified && (
                      <CheckIcon className="w-4 h-4 inline-block ml-1 text-blue-500" title="Verified Channel" />
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {sub.subscriberCount.toLocaleString()} subscribers • {sub.videoCount} videos
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Subscribed {formatDistanceToNow(new Date(sub.subscribedAt), { addSuffix: true })}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                    {sub.description}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => toggleNotifications(sub.channelId)}
                      className={`p-2 rounded-full ${sub.notificationsEnabled ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'} hover:bg-red-200 dark:hover:bg-red-900/20 transition-colors`}
                      title={sub.notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
                    >
                      {sub.notificationsEnabled ? (
                        <BellSolidIcon className="w-5 h-5" />
                      ) : (
                        <BellIcon className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => setShowUnsubscribeModal(sub.channelId)}
                      className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <UserMinusIcon className="w-4 h-4" />
                      <span>Unsubscribe</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedSubscriptions.map((sub) => (
              <div key={sub.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center p-4">
                {bulkActionMode && (
                  <div className="flex-shrink-0 mr-4">
                    <input
                      type="checkbox"
                      checked={selectedSubscriptions.has(sub.channelId)}
                      onChange={() => toggleBulkSelection(sub.channelId)}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                )}
                <img
                  src={sub.channelAvatar}
                  alt={`${sub.channelName} avatar`}
                  className="w-20 h-20 rounded-full object-cover flex-shrink-0 mr-4"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
                    {sub.channelName}
                    {sub.channelVerified && (
                      <CheckIcon className="w-4 h-4 inline-block ml-1 text-blue-500" title="Verified Channel" />
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {sub.subscriberCount.toLocaleString()} subscribers • {sub.videoCount} videos
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Subscribed {formatDistanceToNow(new Date(sub.subscribedAt), { addSuffix: true })}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                    {sub.description}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => toggleNotifications(sub.channelId)}
                    className={`p-2 rounded-full ${sub.notificationsEnabled ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'} hover:bg-red-200 dark:hover:bg-red-900/20 transition-colors`}
                    title={sub.notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
                  >
                    {sub.notificationsEnabled ? (
                      <BellSolidIcon className="w-5 h-5" />
                    ) : (
                      <BellIcon className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => setShowUnsubscribeModal(sub.channelId)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <UserMinusIcon className="w-4 h-4" />
                    <span>Unsubscribe</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Unsubscribe Confirmation Modal */}
        {showUnsubscribeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-sm w-full text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Unsubscribe?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to unsubscribe from {' '} 
                <span className="font-medium text-gray-900 dark:text-white">
                  {subscriptions.find(sub => sub.channelId === showUnsubscribeModal)?.channelName}
                </span>?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowUnsubscribeModal(null)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUnsubscribe(showUnsubscribeModal)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Unsubscribe
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

  const filterSubscriptions = () => {
    let filtered = subscriptions;

    if (searchQuery) {
      filtered = filtered.filter(sub =>
        sub.channelName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filterBy === 'notifications_on') {
      filtered = filtered.filter(sub => sub.notificationsEnabled);
    } else if (filterBy === 'notifications_off') {
      filtered = filtered.filter(sub => !sub.notificationsEnabled);
    } else if (filterBy === 'live') {
      filtered = filtered.filter(sub => sub.isLive);
    } else if (filterBy === 'recent_uploads') {
      filtered = filtered.filter(sub => sub.lastVideoUpload && (new Date().getTime() - new Date(sub.lastVideoUpload).getTime()) < (7 * 24 * 60 * 60 * 1000)); // Last 7 days
    }

    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.channelName.localeCompare(b.channelName));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime());
        break;
      case 'most_videos':
        filtered.sort((a, b) => b.videoCount - a.videoCount);
        break;
      case 'subscribers':
        filtered.sort((a, b) => b.subscriberCount - a.subscriberCount);
        break;
      default:
        break;
    }
    return filtered;
  };

  const toggleNotifications = (channelId: string) => {
    setSubscriptions(prev => prev.map(sub =>
      sub.channelId === channelId
        ? { ...sub, notificationsEnabled: !sub.notificationsEnabled }
        : sub,
    ));
    // Update localStorage
    const stored = JSON.parse(localStorage.getItem('youtubeCloneSubscriptions_v1') || '{}');
    const updatedStored = { ...stored };
    if (updatedStored[channelId]) {
      updatedStored[channelId].notificationsEnabled = !updatedStored[channelId].notificationsEnabled;
    }
    localStorage.setItem('youtubeCloneSubscriptions_v1', JSON.stringify(updatedStored));
  };

  const handleUnsubscribe = (channelId: string) => {
    setSubscriptions(prev => prev.filter(sub => sub.channelId !== channelId));
    // Update localStorage
    const stored = JSON.parse(localStorage.getItem('youtubeCloneSubscriptions_v1') || '{}');
    delete stored[channelId];
    localStorage.setItem('youtubeCloneSubscriptions_v1', JSON.stringify(stored));
    setShowUnsubscribeModal(null);
  };

  const toggleBulkSelection = (channelId: string) => {
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

  const handleBulkAction = (action: 'unsubscribe' | 'toggle_notifications') => {
    selectedSubscriptions.forEach(channelId => {
      if (action === 'unsubscribe') {
        handleUnsubscribe(channelId);
      } else if (action === 'toggle_notifications') {
        toggleNotifications(channelId);
      }
    });
    setSelectedSubscriptions(new Set());
    setBulkActionMode(false);
  };

  const filteredAndSortedSubscriptions = filterSubscriptions();

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Subscriptions</h1>

        {/* Controls: Search, Sort, Filter, View Mode */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="alphabetical">Sort by: A-Z</option>
              <option value="recent">Sort by: Recently Subscribed</option>
              <option value="most_videos">Sort by: Most Videos</option>
              <option value="subscribers">Sort by: Subscribers</option>
            </select>

            {/* Filter By */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Filter: All</option>
              <option value="notifications_on">Filter: Notifications On</option>
              <option value="notifications_off">Filter: Notifications Off</option>
              <option value="live">Filter: Live Now</option>
              <option value="recent_uploads">Filter: Recent Uploads</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow text-blue-600' : 'text-gray-500 dark:text-gray-400 hover:text-blue-600'}`}
                title="Grid View"
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow text-blue-600' : 'text-gray-500 dark:text-gray-400 hover:text-blue-600'}`}
                title="List View"
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => setBulkActionMode(!bulkActionMode)}
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {bulkActionMode ? 'Exit Bulk Mode' : 'Select Multiple'}
            </button>
            {bulkActionMode && selectedSubscriptions.size > 0 && (
              <>
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  {selectedSubscriptions.size} selected
                </span>
                <button
                  onClick={() => handleBulkAction('toggle_notifications')}
                  className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Toggle Notifications
                </button>
                <button
                  onClick={() => handleBulkAction('unsubscribe')}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
                >
                  Unsubscribe Selected
                </button>
              </>
            )}
          </div>
        </div>

        {/* Subscription List/Grid */}
        {filteredAndSortedSubscriptions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No subscriptions found matching your criteria.
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Try adjusting your search, sort, or filter options.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedSubscriptions.map((sub) => (
              <div key={sub.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                {bulkActionMode && (
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedSubscriptions.has(sub.channelId)}
                      onChange={() => toggleBulkSelection(sub.channelId)}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                )}
                <div className="relative h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <img
                    src={sub.channelArt || `/api/placeholder/480/180?text=${sub.channelName.split(' ')[0]}`}
                    alt={`${sub.channelName} channel art`}
                    className="w-full h-full object-cover"
                  />
                  <img
                    src={sub.channelAvatar}
                    alt={`${sub.channelName} avatar`}
                    className="absolute -bottom-8 left-4 w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 shadow-md"
                  />
                </div>
                <div className="p-4 pt-10">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
                    {sub.channelName}
                    {sub.channelVerified && (
                      <CheckIcon className="w-4 h-4 inline-block ml-1 text-blue-500" title="Verified Channel" />
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {sub.subscriberCount.toLocaleString()} subscribers • {sub.videoCount} videos
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Subscribed {formatDistanceToNow(new Date(sub.subscribedAt), { addSuffix: true })}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                    {sub.description}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => toggleNotifications(sub.channelId)}
                      className={`p-2 rounded-full ${sub.notificationsEnabled ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'} hover:bg-red-200 dark:hover:bg-red-900/20 transition-colors`}
                      title={sub.notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
                    >
                      {sub.notificationsEnabled ? (
                        <BellSolidIcon className="w-5 h-5" />
                      ) : (
                        <BellIcon className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => setShowUnsubscribeModal(sub.channelId)}
                      className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <UserMinusIcon className="w-4 h-4" />
                      <span>Unsubscribe</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedSubscriptions.map((sub) => (
              <div key={sub.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center p-4">
                {bulkActionMode && (
                  <div className="flex-shrink-0 mr-4">
                    <input
                      type="checkbox"
                      checked={selectedSubscriptions.has(sub.channelId)}
                      onChange={() => toggleBulkSelection(sub.channelId)}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                )}
                <img
                  src={sub.channelAvatar}
                  alt={`${sub.channelName} avatar`}
                  className="w-20 h-20 rounded-full object-cover flex-shrink-0 mr-4"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
                    {sub.channelName}
                    {sub.channelVerified && (
                      <CheckIcon className="w-4 h-4 inline-block ml-1 text-blue-500" title="Verified Channel" />
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {sub.subscriberCount.toLocaleString()} subscribers • {sub.videoCount} videos
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Subscribed {formatDistanceToNow(new Date(sub.subscribedAt), { addSuffix: true })}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                    {sub.description}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => toggleNotifications(sub.channelId)}
                    className={`p-2 rounded-full ${sub.notificationsEnabled ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'} hover:bg-red-200 dark:hover:bg-red-900/20 transition-colors`}
                    title={sub.notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
                  >
                    {sub.notificationsEnabled ? (
                      <BellSolidIcon className="w-5 h-5" />
                    ) : (
                      <BellIcon className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => setShowUnsubscribeModal(sub.channelId)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <UserMinusIcon className="w-4 h-4" />
                    <span>Unsubscribe</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Unsubscribe Confirmation Modal */}
        {showUnsubscribeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-sm w-full text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Unsubscribe?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to unsubscribe from {' '} 
                <span className="font-medium text-gray-900 dark:text-white">
                  {subscriptions.find(sub => sub.channelId === showUnsubscribeModal)?.channelName}
                </span>?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowUnsubscribeModal(null)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUnsubscribe(showUnsubscribeModal)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Unsubscribe
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
