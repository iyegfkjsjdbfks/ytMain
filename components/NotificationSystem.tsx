
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName]: any;
    }
  }
}
// TODO: Fix import - import { useState, useEffect, useRef, useCallback } from 'react';
// TODO: Fix import - import React from 'react';

import {
  BellIcon,
  XMarkIcon,
  PlayIcon,
  UserPlusIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
// TODO: Fix import - import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';

import { formatDistanceToNow } from '../utils/dateUtils';

export interface Notification {
  id: string;
  type: 'video_upload' | 'like' | 'comment' | 'subscription' | 'live_stream' | 'community_post';
  title: string;
  message: string;
  thumbnail?: string;
  channelName?: string;
  channelAvatar?: string;
  videoId?: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationSystemProps {
  className?: string;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ className = '' }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();

    // Simulate real-time notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance every 30 seconds
        generateMockNotification();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const count = notifications.filter((n) => !n.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  const loadNotifications = useCallback(() => {
    try {
      const stored = localStorage.getItem('youtubeCloneNotifications_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
      } else {
        // Generate initial mock notifications
        const initialNotifications = generateInitialNotifications();
        setNotifications(initialNotifications);
        localStorage.setItem('youtubeCloneNotifications_v1', JSON.stringify(initialNotifications));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, []);

  const generateInitialNotifications = (): Notification[] => {
    return [
      {
        id: '1',
        type: 'video_upload',
        title: 'New video from TechReviews',
        message: 'iPhone 15 Pro Max Review - Is it worth the upgrade?',
        thumbnail: 'https://picsum.photos/120/68?random=1',
        channelName: 'TechReviews',
        channelAvatar: 'https://picsum.photos/40/40?random=1',
        videoId: 'tech-review-1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        isRead: false,
        priority: 'medium',
      },
      {
        id: '2',
        type: 'like',
        title: 'Your video got 100 likes!',
        message: 'React Tutorial for Beginners reached 100 likes',
        thumbnail: 'https://picsum.photos/120/68?random=2',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        isRead: false,
        priority: 'low',
      },
      {
        id: '3',
        type: 'comment',
        title: 'New comment on your video',
        message: 'John Doe commented: "Great tutorial! Very helpful."',
        thumbnail: 'https://picsum.photos/120/68?random=3',
        channelName: 'John Doe',
        channelAvatar: 'https://picsum.photos/40/40?random=3',
        videoId: 'my-video-1',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        isRead: true,
        priority: 'medium',
      },
      {
        id: '4',
        type: 'subscription',
        title: 'New subscriber!',
        message: 'CodingMaster subscribed to your channel',
        channelName: 'CodingMaster',
        channelAvatar: 'https://picsum.photos/40/40?random=4',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        isRead: true,
        priority: 'medium',
      },
      {
        id: '5',
        type: 'live_stream',
        title: 'GameStreamer is live!',
        message: 'Playing the latest AAA game - Join now!',
        thumbnail: 'https://picsum.photos/120/68?random=5',
        channelName: 'GameStreamer',
        channelAvatar: 'https://picsum.photos/40/40?random=5',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        isRead: false,
        priority: 'high',
      },
    ];
  };

  const generateMockNotification = useCallback(() => {
    const types: Array<Notification['type']> = ['video_upload', 'like', 'comment', 'subscription', 'live_stream'];
    const type = types[Math.floor(Math.random() * types.length)];

    if (!type) {
return;
} // Safety check

    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      title: getNotificationTitle(type),
      message: getNotificationMessage(type),
      ...(type !== 'subscription' && { thumbnail: `https://picsum.photos/120/68?random=${Date.now()}` }),
      channelName: `Channel${Math.floor(Math.random() * 100)}`,
      channelAvatar: `https://picsum.photos/40/40?random=${Date.now()}`,
      ...(type === 'video_upload' ? { videoId: `video-${Date.now()}` } : {}),
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: type === 'live_stream' ? 'high' : 'medium',
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, 50); // Keep only latest 50
      localStorage.setItem('youtubeCloneNotifications_v1', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getNotificationTitle = (type: Notification['type']): string => {
    switch (type) {
      case 'video_upload': return 'New video uploaded';
      case 'like': return 'Your video got new likes!';
      case 'comment': return 'New comment on your video';
      case 'subscription': return 'New subscriber!';
      case 'live_stream': return 'Live stream started';
      default: return 'New notification';
    }
  };

  const getNotificationMessage = (type: Notification['type']): string => {
    switch (type) {
      case 'video_upload': return 'Check out the latest content from your subscribed channel';
      case 'like': return `Your video reached ${Math.floor(Math.random() * 1000) + 100} likes`;
      case 'comment': return 'Someone left a comment on your video';
      case 'subscription': return 'A new user subscribed to your channel';
      case 'live_stream': return 'Your favorite creator is now live!';
      default: return 'You have a new notification';
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => {
      const updated = prev.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n,
      );
      localStorage.setItem('youtubeCloneNotifications_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      localStorage.setItem('youtubeCloneNotifications_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => {
      const updated = prev.filter((n) => n.id !== notificationId);
      localStorage.setItem('youtubeCloneNotifications_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'video_upload': return <PlayIcon className="w-4 h-4" />;
      case 'like': return <HeartIcon className="w-4 h-4" />;
      case 'comment': return <ChatBubbleLeftIcon className="w-4 h-4" />;
      case 'subscription': return <UserPlusIcon className="w-4 h-4" />;
      case 'live_stream': return <PlayIcon className="w-4 h-4 text-red-500" />;
      default: return <BellIcon className="w-4 h-4" />;
    }
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter((n) => !n.isRead);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="w-6 h-6" />
        ) : (
          <BellIcon className="w-6 h-6" />
        )}

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {filter === 'all' ? 'Unread only' : 'Show all'}
                </button>
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  disabled={unreadCount === 0}
                >
                  Mark all read
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <BellIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Notification Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      notification.type === 'live_stream' ? 'bg-red-100 text-red-600' :
                      notification.type === 'like' ? 'bg-pink-100 text-pink-600' :
                      notification.type === 'comment' ? 'bg-blue-100 text-blue-600' :
                      notification.type === 'subscription' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {notification.message}
                          </p>
                          {notification.channelName && (
                            <div className="flex items-center mt-2">
                              {notification.channelAvatar && (
                                <img
                                  src={notification.channelAvatar}
                                  alt={notification.channelName}
                                  className="w-4 h-4 rounded-full mr-2"
                                />
                              )}
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {notification.channelName}
                              </span>
                            </div>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(notification.timestamp))} ago
                          </p>
                        </div>

                        {/* Thumbnail */}
                        {notification.thumbnail && (
                          <img
                            src={notification.thumbnail}
                            alt=""
                            className="w-16 h-9 object-cover rounded ml-3 flex-shrink-0"
                          />
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex space-x-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Mark as read
                            </button>
                          )}
                          {notification.videoId && (
                            <button
                              onClick={() => {
                                markAsRead(notification.id);
                                window.location.href = `/watch/${notification.videoId}`;
                              }}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Watch video
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center space-x-1">
                <Cog6ToothIcon className="w-4 h-4" />
                <span>Notification settings</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;
