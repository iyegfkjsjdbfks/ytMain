/// <reference types="react/jsx-runtime" />
// TODO: Fix import - import React from "react";
// TODO: Fix import - import { useState  } from 'react';
// TODO: Fix import - import type * as React from 'react';

import { FlagIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';

interface ModerationItem {
  id: string;
  type: 'video' | 'comment' | 'user' | 'community_post';
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  reportedBy: {
    id: string;
    name: string;
    count: number;
  };
  reportReason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  createdAt: string;
  reportedAt: string;
  thumbnail?: string;
  metadata?: {
    views?: number;
    likes?: number;
    comments?: number;
    duration?: number;
  };
}

interface ModerationAction {
  action: 'approve' | 'reject' | 'remove' | 'restrict' | 'ban' | 'escalate';
  reason?: string;
  duration?: number; // in days
  notifyUser?: boolean;
}

export const ModerationDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'rejected' | 'escalated'>('pending');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Mock moderation data
  const moderationItems: ModerationItem[] = [
    {
      id: '1',
      type: 'video',
      title: 'Controversial Gaming Video',
      content: 'Video contains inappropriate language and behavior',
      author: {
        id: 'user1',
        name: 'GamerPro123',
        avatar: 'https://picsum.photos/40/40?random=1',
        isVerified: false,
      },
      reportedBy: {
        id: 'reporter1',
        name: 'ConcernedViewer',
        count: 15,
      },
      reportReason: 'Inappropriate content',
      severity: 'high',
      status: 'pending',
      createdAt: '2024-01-15T10:30:00Z',
      reportedAt: '2024-01-15T14:20:00Z',
      thumbnail: 'https://picsum.photos/160/90?random=1',
      metadata: {
        views: 25000,
        likes: 1200,
        comments: 340,
        duration: 720,
      },
    },
    {
      id: '2',
      type: 'comment',
      title: 'Spam Comment',
      content: 'Check out my channel! Subscribe for amazing content! Link in bio!',
      author: {
        id: 'user2',
        name: 'SpamBot2024',
        avatar: 'https://picsum.photos/40/40?random=2',
        isVerified: false,
      },
      reportedBy: {
        id: 'reporter2',
        name: 'RegularUser',
        count: 8,
      },
      reportReason: 'Spam',
      severity: 'medium',
      status: 'pending',
      createdAt: '2024-01-15T12:45:00Z',
      reportedAt: '2024-01-15T13:10:00Z',
    },
    {
      id: '3',
      type: 'user',
      title: 'Suspicious User Activity',
      content: 'User has been mass-uploading copyrighted content',
      author: {
        id: 'user3',
        name: 'ContentThief',
        avatar: 'https://picsum.photos/40/40?random=3',
        isVerified: false,
      },
      reportedBy: {
        id: 'reporter3',
        name: 'ContentCreator',
        count: 25,
      },
      reportReason: 'Copyright infringement',
      severity: 'critical',
      status: 'pending',
      createdAt: '2024-01-14T09:15:00Z',
      reportedAt: '2024-01-15T08:30:00Z',
    },
  ];

  const filteredItems = moderationItems.filter((item) => {
    if (item.status !== selectedTab) {
return false;
}
    if (filterSeverity !== 'all' && item.severity !== filterSeverity) {
return false;
}
    if (filterType !== 'all' && item.type !== filterType) {
return false;
}
    return true;
  });

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const handleModerationAction = (_itemId, _action: ModerationAction) => {
    // In a real app, this would make an API call
  };

  const handleBulkAction = (action: ModerationAction) => {
    selectedItems.forEach(itemId => {
      handleModerationAction(itemId, action);
    });
    setSelectedItems([]);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return VideoCameraIcon;
      case 'comment': return ChatBubbleLeftIcon;
      case 'user': return UserIcon;
      case 'community_post': return ChatBubbleLeftIcon;
      default: return FlagIcon;
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Content Moderation
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Review and moderate reported content
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>{filteredItems.length} items pending review</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {moderationItems.filter((item) => item.status === 'pending').length}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {moderationItems.filter((item) => item.status === 'approved').length}
                </p>
              </div>
              <CheckIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {moderationItems.filter((item) => item.status === 'rejected').length}
                </p>
              </div>
              <XMarkIcon className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Escalated</p>
                <p className="text-2xl font-bold text-purple-600">
                  {moderationItems.filter((item) => item.status === 'escalated').length}
                </p>
              </div>
              <ShieldCheckIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters and Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {(['pending', 'approved', 'rejected', 'escalated'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    selectedTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="video">Videos</option>
                  <option value="comment">Comments</option>
                  <option value="user">Users</option>
                  <option value="community_post">Community Posts</option>
                </select>
              </div>

              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedItems.length} selected
                  </span>
                  <button
                    onClick={() => handleBulkAction({ action: 'approve' })}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Approve All
                  </button>
                  <button
                    onClick={() => handleBulkAction({ action: 'reject' })}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Reject All
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Moderation Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select All
              </span>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredItems.map((item) => {
              const TypeIcon = getTypeIcon(item.type);

              return (
                <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-20 h-12 object-cover rounded"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <TypeIcon className="w-4 h-4 text-gray-500" />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(item.severity)}`}>
                          {item.severity}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {item.type.replace('_', ' ')}
                        </span>
                      </div>

                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                        {item.title}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {item.content}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span>By {item.author.name}</span>
                        <span>Reported by {item.reportedBy.name}</span>
                        <span>Reason: {item.reportReason}</span>
                        {item.metadata && (
                          <>
                            {item.metadata.views && <span>{item.metadata.views.toLocaleString()} views</span>}
                            {item.metadata.duration && <span>{formatDuration(item.metadata.duration)}</span>}
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleModerationAction(item.id, { action: 'approve' })}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          <CheckIcon className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleModerationAction(item.id, { action: 'reject' })}
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleModerationAction(item.id, { action: 'escalate' })}
                          className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
                        >
                          <ShieldCheckIcon className="w-4 h-4" />
                          Escalate
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors">
                          <EyeIcon className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="p-12 text-center">
              <ShieldCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No items to review
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                All content in this category has been reviewed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModerationDashboard;


declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
