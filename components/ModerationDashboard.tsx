import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  FlagIcon,
  ChatBubbleLeftIcon,
  VideoCameraIcon,
  UserIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from '../utils/dateUtils';

export interface ModerationItem {
  id: string;
  type: 'video' | 'comment' | 'user' | 'community_post';
  status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'removed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  reportReason: string;
  reportCount: number;
  reportedAt: string;
  reportedBy: string[];
  
  // Content details
  content: {
    id: string;
    title?: string;
    text?: string;
    thumbnail?: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    createdAt: string;
    views?: number;
    likes?: number;
    comments?: number;
  };
  
  // AI Analysis
  aiAnalysis?: {
    toxicityScore: number;
    categories: string[];
    confidence: number;
    suggestedAction: 'approve' | 'review' | 'remove';
  };
  
  // Moderation history
  moderationHistory: Array<{
    action: string;
    moderatorId: string;
    moderatorName: string;
    timestamp: string;
    reason?: string;
  }>;
}

interface ModerationDashboardProps {
  onModerate: (itemId: string, action: 'approve' | 'reject' | 'remove' | 'flag', reason?: string) => void;
  onBulkModerate: (itemIds: string[], action: 'approve' | 'reject' | 'remove') => void;
  className?: string;
}

const ModerationDashboard: React.FC<ModerationDashboardProps> = ({
  onModerate,
  onBulkModerate,
  className = ''
}) => {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'flagged' | 'approved' | 'rejected'>('all');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'comment' | 'user' | 'community_post'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority' | 'reports'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModerationModal, setShowModerationModal] = useState<string | null>(null);
  const [moderationReason, setModerationReason] = useState('');

  useEffect(() => {
    loadModerationItems();
  }, []);

  const loadModerationItems = () => {
    // Mock moderation items
    const mockItems: ModerationItem[] = [
      {
        id: '1',
        type: 'video',
        status: 'pending',
        priority: 'high',
        reportReason: 'Inappropriate content',
        reportCount: 5,
        reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        reportedBy: ['user1', 'user2', 'user3'],
        content: {
          id: 'video1',
          title: 'Controversial Video Title',
          thumbnail: 'https://picsum.photos/320/180?random=1',
          authorId: 'creator1',
          authorName: 'Content Creator',
          authorAvatar: 'https://picsum.photos/40/40?random=1',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          views: 15000,
          likes: 200,
          comments: 45
        },
        aiAnalysis: {
          toxicityScore: 0.75,
          categories: ['harassment', 'hate_speech'],
          confidence: 0.85,
          suggestedAction: 'review'
        },
        moderationHistory: []
      },
      {
        id: '2',
        type: 'comment',
        status: 'flagged',
        priority: 'critical',
        reportReason: 'Hate speech',
        reportCount: 12,
        reportedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        reportedBy: ['user4', 'user5', 'user6'],
        content: {
          id: 'comment1',
          text: 'This is an inappropriate comment that violates community guidelines...',
          authorId: 'user123',
          authorName: 'Anonymous User',
          authorAvatar: 'https://picsum.photos/40/40?random=2',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 0
        },
        aiAnalysis: {
          toxicityScore: 0.92,
          categories: ['hate_speech', 'harassment'],
          confidence: 0.95,
          suggestedAction: 'remove'
        },
        moderationHistory: [
          {
            action: 'flagged',
            moderatorId: 'ai_system',
            moderatorName: 'AI Moderator',
            timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
            reason: 'High toxicity score detected'
          }
        ]
      },
      {
        id: '3',
        type: 'user',
        status: 'pending',
        priority: 'medium',
        reportReason: 'Spam account',
        reportCount: 3,
        reportedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        reportedBy: ['user7', 'user8'],
        content: {
          id: 'user456',
          authorId: 'user456',
          authorName: 'Suspicious Account',
          authorAvatar: 'https://picsum.photos/40/40?random=3',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        moderationHistory: []
      }
    ];
    
    setItems(mockItems);
  };

  const filteredItems = items
    .filter(item => {
      if (filterStatus !== 'all' && item.status !== filterStatus) return false;
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (filterPriority !== 'all' && item.priority !== filterPriority) return false;
      if (searchQuery && !item.content.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !item.content.text?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !item.content.authorName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
        case 'oldest':
          return new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime();
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'reports':
          return b.reportCount - a.reportCount;
        default:
          return 0;
      }
    });

  const handleModerate = (itemId: string, action: 'approve' | 'reject' | 'remove' | 'flag') => {
    onModerate(itemId, action, moderationReason);
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            status: action === 'approve' ? 'approved' : 
                   action === 'reject' ? 'rejected' : 
                   action === 'remove' ? 'removed' : 'flagged',
            moderationHistory: [
              ...item.moderationHistory,
              {
                action,
                moderatorId: 'current_user',
                moderatorName: 'Current Moderator',
                timestamp: new Date().toISOString(),
                reason: moderationReason
              }
            ]
          }
        : item
    ));
    setShowModerationModal(null);
    setModerationReason('');
  };

  const handleBulkAction = (action: 'approve' | 'reject' | 'remove') => {
    const itemIds = Array.from(selectedItems);
    onBulkModerate(itemIds, action);
    
    setItems(prev => prev.map(item => 
      selectedItems.has(item.id)
        ? { 
            ...item, 
            status: action === 'approve' ? 'approved' : 
                   action === 'reject' ? 'rejected' : 'removed'
          }
        : item
    ));
    setSelectedItems(new Set());
  };

  const toggleSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'approved': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'flagged': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'removed': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <VideoCameraIcon className="w-5 h-5" />;
      case 'comment': return <ChatBubbleLeftIcon className="w-5 h-5" />;
      case 'user': return <UserIcon className="w-5 h-5" />;
      case 'community_post': return <FlagIcon className="w-5 h-5" />;
      default: return <FlagIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <ShieldCheckIcon className="w-8 h-8" />
            <span>Content Moderation</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredItems.length} items requiring review
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Pending', count: items.filter(i => i.status === 'pending').length, color: 'text-yellow-600' },
            { label: 'Flagged', count: items.filter(i => i.status === 'flagged').length, color: 'text-red-600' },
            { label: 'Critical', count: items.filter(i => i.priority === 'critical').length, color: 'text-red-600' },
            { label: 'Total Reports', count: items.reduce((sum, i) => sum + i.reportCount, 0), color: 'text-blue-600' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search content..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="flagged">Flagged</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="video">Videos</option>
            <option value="comment">Comments</option>
            <option value="user">Users</option>
            <option value="community_post">Posts</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">By Priority</option>
            <option value="reports">Most Reports</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 dark:text-blue-200">
              {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
            </span>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleBulkAction('approve')}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Approve All
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
              >
                Reject All
              </button>
              <button
                onClick={() => handleBulkAction('remove')}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Remove All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Items */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${
              selectedItems.has(item.id) ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              {/* Selection Checkbox */}
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={() => toggleSelection(item.id)}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />

              {/* Content Preview */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(item.type)}
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {item.content.title || item.content.text || `${item.type} by ${item.content.authorName}`}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span>By {item.content.authorName}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(item.reportedAt))} ago</span>
                        <span>•</span>
                        <span>{item.reportCount} reports</span>
                      </div>
                    </div>
                  </div>

                  {/* Status and Priority Badges */}
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Content Preview */}
                  <div className="md:col-span-2">
                    {item.content.thumbnail && (
                      <img
                        src={item.content.thumbnail}
                        alt="Content thumbnail"
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    )}
                    {item.content.text && (
                      <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
                        {item.content.text}
                      </p>
                    )}
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <strong>Report Reason:</strong> {item.reportReason}
                    </div>
                  </div>

                  {/* AI Analysis */}
                  {item.aiAnalysis && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">AI Analysis</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Toxicity Score:</span>
                          <span className={`ml-2 font-medium ${
                            item.aiAnalysis.toxicityScore > 0.8 ? 'text-red-600' :
                            item.aiAnalysis.toxicityScore > 0.5 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {(item.aiAnalysis.toxicityScore * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Categories:</span>
                          <div className="mt-1">
                            {item.aiAnalysis.categories.map((category, index) => (
                              <span
                                key={index}
                                className="inline-block bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs mr-1 mb-1"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Suggested:</span>
                          <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">
                            {item.aiAnalysis.suggestedAction}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleModerate(item.id, 'approve')}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      <CheckIcon className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowModerationModal(item.id);
                      }}
                      className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                    
                    <button
                      onClick={() => handleModerate(item.id, 'remove')}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <ClockIcon className="w-4 h-4" />
                    <span>Reported {formatDistanceToNow(new Date(item.reportedAt))} ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Moderation Modal */}
      {showModerationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Moderation Action
            </h3>
            
            <textarea
              value={moderationReason}
              onChange={(e) => setModerationReason(e.target.value)}
              placeholder="Enter reason for this action (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-4"
            />
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowModerationModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleModerate(showModerationModal, 'reject')}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationDashboard;
