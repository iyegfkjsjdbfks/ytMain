import React, { useEffect, useRef, useState, FC, MouseEvent } from 'react';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { MouseEvent } from 'react';
import { FC } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
const BellIconSolid = BellSolidIcon;
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../hooks/useNotifications';
import type { Notification } from '../services/notificationService';
import { BellIcon, XMarkIcon, CheckIcon, TrashIcon  } from '@heroicons/react/24/outline';

interface NotificationCenterProps {
  className?: string;
}

interface NotificationItemProps {
  notification: Notification;,
  onMarkAsRead: (id: string) => void;,
  onDelete: (id: string) => void;,
  onClick: (notification: Notification) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClick }) => {
  const getNotificationIcon: any = () => {
    switch (notification.type) {
      case 'video_upload':
        return '🎥';
      case 'comment_reply':
        return '💬';
      case 'like':
        return '👍';
      case 'subscribe':
        return '🔔';
      case 'live_stream':
        return '🔴';
      case 'mention':
        return '@';
      case 'milestone':
        return '🎉';
      case 'system':
        return 'ℹ️';
      default: return '📢'
    }
  };

  const getPriorityColor: any = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-blue-500';
      default: return 'border-l-gray-300'
    }
  };

  return (
    <div
      className={`p-4 border-l-4 ${getPriorityColor()} hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
      }`}
      onClick={() => onClick(notification)}
    >
      <div className='flex items-start gap-3'>
        {/* Avatar/Icon */}
        <div className='flex-shrink-0'>
          {notification.fromUserAvatar ? (
            <img
              src={notification.fromUserAvatar}
              alt={notification.fromUserName || 'User'}
              className='w-10 h-10 rounded-full object-cover'
            />
          ) : (
            <div className='w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-lg'>
              {getNotificationIcon()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <h4
                className={`text-sm font-medium ${
                  !notification.isRead
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {notification.title}
              </h4>
              <p className='text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2'>
                {notification.message}
              </p>
              <div className='flex items-center gap-2 mt-2'>
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true })}
                </span>
                {!notification.isRead && (
                  <span className='w-2 h-2 bg-blue-600 rounded-full' />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className='flex items-center gap-1 ml-2'>
              {!notification.isRead && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  className='p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
                  title='Mark as read'
                >
                  <CheckIcon className='w-4 h-4 text-gray-500' />
                </button>
              )}
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className='p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
                title='Delete'
              >
                <TrashIcon className='w-4 h-4 text-gray-500' />
              </button>
            </div>
          </div>

          {/* Thumbnail */}
          {notification.thumbnail && (
            <div className='mt-2'>
              <img
                src={notification.thumbnail}
                alt='Notification thumbnail'
                className='w-16 h-12 object-cover rounded'
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  className = '' }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll } = useNotifications();

  useEffect(() => {
    const handleClickOutside: any = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside as EventListener);
    return () => document.removeEventListener('mousedown', handleClickOutside as EventListener);
  }, []);

  const filteredNotifications = Array.isArray(notifications)
    ? notifications.filter((notification: any) => {
        if (filter === 'unread' && notification.isRead) {
          return false;
        }
        if (
          selectedCategory !== 'all' &&
          notification.category !== selectedCategory
        ) {
          return false;
        }
        return true;
      })
    : [];

  const handleNotificationClick: any = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }

    setIsOpen(false);
  };

  const categories = [
    { value: 'all',
          label: 'All' },
    { value: 'engagement',
          label: 'Engagement' },
    { value: 'content',
          label: 'Content' },
    { value: 'social',
          label: 'Social' },
    { value: 'system',
          label: 'System' }];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className='w-6 h-6 text-gray-700 dark:text-gray-300' />
        ) : (
          <BellIcon className='w-6 h-6 text-gray-700 dark:text-gray-300' />
        )}

        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className='absolute top-full right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden'>
          {/* Header */}
          <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Notifications
              </h3>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setIsOpen(false)}
                  className='p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'
                >
                  <XMarkIcon className='w-5 h-5' />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === 'unread'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              <div className='flex items-center gap-2'>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className='text-sm text-blue-600 hover:text-blue-700 font-medium'
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => clearAll()}
                  className='text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                >
                  Clear all
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className='mt-3'>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className='w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm'
              >
                {categories.map((category: any) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notifications List */}
          <div className='max-h-80 overflow-y-auto'>
            {isLoading ? (
              <div className='p-4 text-center text-gray-500 dark:text-gray-400'>
                Loading notifications...
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className='divide-y divide-gray-200 dark:divide-gray-700'>
                {filteredNotifications.map((notification: any) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    onClick={(e: any) => handleNotificationClick(e)}
                  />
                ))}
              </div>
            ) : (
              <div className='p-8 text-center text-gray-500 dark:text-gray-400'>
                <BellIcon className='w-12 h-12 mx-auto mb-4 opacity-50' />
                <p>No notifications found</p>
                {filter === 'unread' && (
                  <p className='text-sm mt-1'>All caught up! 🎉</p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className='p-3 border-t border-gray-200 dark:border-gray-700 text-center'>
              <button className='text-sm text-blue-600 hover:text-blue-700 font-medium'>
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

