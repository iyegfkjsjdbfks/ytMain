import React, { useState } from 'react';

import {
  EyeIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  VideoCameraIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

// Icon wrapper components to fix type compatibility
const VideoCameraIconWrapper: React.FC<{ className?: string }> = ({ className }) => (
  <VideoCameraIcon className={className} />
);


interface DashboardMetrics {
  views: {
    total: number;
    change: number;
    trend: 'up' | 'down';
  };
  watchTime: {
    total: number; // in seconds
    change: number;
    trend: 'up' | 'down';
  };
  subscribers: {
    total: number;
    change: number;
    trend: 'up' | 'down';
  };
  revenue: {
    total: number;
    change: number;
    trend: 'up' | 'down';
  };
}

interface RecentVideo {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
  status: 'published' | 'processing' | 'scheduled' | 'draft';
  visibility: 'public' | 'unlisted' | 'private';
}

interface Notification {
  id: string;
  type: 'milestone' | 'comment' | 'copyright' | 'monetization' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  color: string;
}

export const CreatorStudioDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock data
  const metrics: DashboardMetrics = {
    views: { total: 1250000, change: 12.5, trend: 'up' },
    watchTime: { total: 45000000, change: 8.3, trend: 'up' },
    subscribers: { total: 125000, change: -2.1, trend: 'down' },
    revenue: { total: 3450, change: 15.7, trend: 'up' },
  };

  const recentVideos: RecentVideo[] = [
    {
      id: '1',
      title: 'How to Build a React App in 2024',
      thumbnail: 'https://picsum.photos/160/90?random=1',
      views: 125000,
      likes: 8900,
      comments: 1200,
      publishedAt: '2024-01-15T10:00:00Z',
      status: 'published',
      visibility: 'public',
    },
    {
      id: '2',
      title: 'Advanced TypeScript Tips',
      thumbnail: 'https://picsum.photos/160/90?random=2',
      views: 98000,
      likes: 7200,
      comments: 890,
      publishedAt: '2024-01-10T14:30:00Z',
      status: 'published',
      visibility: 'public',
    },
    {
      id: '3',
      title: 'CSS Grid vs Flexbox',
      thumbnail: 'https://picsum.photos/160/90?random=3',
      views: 0,
      likes: 0,
      comments: 0,
      publishedAt: '2024-01-20T09:00:00Z',
      status: 'scheduled',
      visibility: 'public',
    },
  ];

  const notifications: Notification[] = [
    {
      id: '1',
      type: 'milestone',
      title: 'Congratulations!',
      message: 'Your video "React Tutorial" reached 100K views!',
      timestamp: '2024-01-15T12:00:00Z',
      isRead: false,
      priority: 'high',
    },
    {
      id: '2',
      type: 'comment',
      title: 'New comment',
      message: 'Someone commented on your video "TypeScript Guide"',
      timestamp: '2024-01-15T11:30:00Z',
      isRead: false,
      priority: 'medium',
    },
    {
      id: '3',
      type: 'copyright',
      title: 'Copyright claim',
      message: 'A copyright claim was made on your video',
      timestamp: '2024-01-14T16:20:00Z',
      isRead: true,
      priority: 'high',
    },
  ];

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Upload Video',
      description: 'Upload a new video to your channel',
      icon: VideoCameraIconWrapper,
      action: () => {
        // Handle upload video action
      },
      color: 'bg-purple-500',
    },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
return `${(num / 1000000).toFixed(1)}M`;
}
    if (num >= 1000) {
return `${(num / 1000).toFixed(1)}K`;
}
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'processing': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'scheduled': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'draft': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'milestone': return CheckCircleIcon;
      case 'comment': return ChatBubbleLeftIcon;
      case 'copyright': return ExclamationTriangleIcon;
      case 'monetization': return CurrencyDollarIcon;
      case 'system': return BellIcon;
      default: return BellIcon;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Creator Studio
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your channel and track performance
            </p>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Views</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(metrics.views.total)}
                </p>
                <div className={`flex items-center mt-2 text-sm ${
                  metrics.views.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metrics.views.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(metrics.views.change)}%
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-500">
                <EyeIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Watch Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatDuration(metrics.watchTime.total)}
                </p>
                <div className={`flex items-center mt-2 text-sm ${
                  metrics.watchTime.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metrics.watchTime.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(metrics.watchTime.change)}%
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-500">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Subscribers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(metrics.subscribers.total)}
                </p>
                <div className={`flex items-center mt-2 text-sm ${
                  metrics.subscribers.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metrics.subscribers.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(metrics.subscribers.change)}%
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-500">
                <UserGroupIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${metrics.revenue.total.toLocaleString()}
                </p>
                <div className={`flex items-center mt-2 text-sm ${
                  metrics.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metrics.revenue.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(metrics.revenue.change)}%
                </div>
              </div>
              <div className="p-3 rounded-full bg-orange-500">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <div className={`p-3 rounded-full ${action.color}`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {action.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Videos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Videos
                </h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View all
                </button>
              </div>
              <div className="space-y-4">
                {recentVideos.map((video) => (
                  <div key={video.id} className="flex items-center gap-4">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-20 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>{formatNumber(video.views)} views</span>
                        <span>{formatNumber(video.likes)} likes</span>
                        <span>{formatNumber(video.comments)} comments</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(video.status)}`}>
                        {video.status}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(video.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Mark all read
              </button>
            </div>
            <div className="space-y-4">
              {notifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      notification.isRead
                        ? 'border-gray-200 dark:border-gray-600'
                        : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent className={`w-5 h-5 mt-0.5 ${
                        notification.priority === 'high' ? 'text-red-500' :
                        notification.priority === 'medium' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorStudioDashboard;
