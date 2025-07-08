import { useState, useEffect } from 'react';

import {
  PlayIcon,
  StopIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  VideoCameraIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';

import { liveStreamService } from '../../../services/livestreamAPI';

import type { LiveStream } from '../../../types/livestream';

interface StreamManagementDashboardProps {
  className?: string;
}

interface StreamAction {
  id: string;
  type: 'start' | 'stop' | 'edit' | 'delete' | 'duplicate' | 'analytics' | 'share';
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  disabled?: boolean;
}

const StreamManagementDashboard: React.FC<StreamManagementDashboardProps> = ({
  className = '',
}) => {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStreams, setSelectedStreams] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'live' | 'scheduled' | 'ended'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'viewers' | 'duration' | 'revenue'>('date');

  useEffect(() => {
    const fetchStreams = async () => {
      setLoading(true);
      try {
        // Mock data - in production, this would fetch from API
        const mockStreams: LiveStream[] = [
          {
            id: 'stream_1',
            title: 'Gaming Session - Exploring New Worlds',
            description: 'Join me as we explore the latest game releases and have fun together!',
            thumbnailUrl: '/api/placeholder/320/180',
            streamUrl: 'rtmp://localhost:1935/live/gaming_session',
            streamKey: 'key_abc123',
            category: 'Gaming',
            tags: ['gaming', 'live', 'interactive'],
            visibility: 'public',
            status: 'live',
            actualStartTime: new Date(Date.now() - 3600000), // 1 hour ago
            creatorId: 'user_123',
            creatorName: 'StreamerPro',
            creatorAvatar: '/api/placeholder/40/40',
            settings: {
              enableChat: true,
              enableSuperChat: true,
              enablePolls: true,
              enableQA: true,
              chatMode: 'live',
              slowMode: 0,
              subscribersOnly: false,
              moderationLevel: 'moderate',
              quality: '1080p',
              bitrate: 4500,
              frameRate: 30,
              enableRecording: true,
              enableMultiplatform: false,
              platforms: [{ name: 'youtube', enabled: true }],
            },
            stats: {
              viewers: 1247,
              peakViewers: 2156,
              averageViewers: 987,
              duration: 3600,
              likes: 342,
              dislikes: 12,
              chatMessages: 1567,
              superChatAmount: 234.50,
              superChatCount: 23,
              pollVotes: 456,
              qaQuestions: 34,
              streamHealth: 'excellent',
              bitrate: 4500,
              frameDrops: 0,
              latency: 1800,
            },
            monetization: {
              totalRevenue: 234.50,
              superChatRevenue: 234.50,
              adRevenue: 0,
              membershipRevenue: 0,
              donationRevenue: 0,
              superChats: [],
            },
          },
          {
            id: 'stream_2',
            title: 'Weekly Q&A Session',
            description: 'Ask me anything about content creation, streaming tips, and more!',
            thumbnailUrl: '/api/placeholder/320/180',
            streamUrl: 'rtmp://localhost:1935/live/qa_session',
            streamKey: 'key_def456',
            category: 'Education',
            tags: ['qa', 'education', 'tips'],
            visibility: 'public',
            status: 'scheduled',
            scheduledStartTime: new Date(Date.now() + 86400000), // Tomorrow
            creatorId: 'user_123',
            creatorName: 'StreamerPro',
            creatorAvatar: '/api/placeholder/40/40',
            settings: {
              enableChat: true,
              enableSuperChat: true,
              enablePolls: true,
              enableQA: true,
              chatMode: 'live',
              slowMode: 5,
              subscribersOnly: false,
              moderationLevel: 'moderate',
              quality: '1080p',
              bitrate: 4500,
              frameRate: 30,
              enableRecording: true,
              enableMultiplatform: true,
              platforms: [
                { name: 'youtube', enabled: true },
                { name: 'twitch', enabled: true },
              ],
            },
            stats: {
              viewers: 0,
              peakViewers: 0,
              averageViewers: 0,
              duration: 0,
              likes: 0,
              dislikes: 0,
              chatMessages: 0,
              superChatAmount: 0,
              superChatCount: 0,
              pollVotes: 0,
              qaQuestions: 0,
              streamHealth: 'good',
              bitrate: 4500,
              frameDrops: 0,
              latency: 2000,
            },
            monetization: {
              totalRevenue: 0,
              superChatRevenue: 0,
              adRevenue: 0,
              membershipRevenue: 0,
              donationRevenue: 0,
              superChats: [],
            },
          },
          {
            id: 'stream_3',
            title: 'Music Production Masterclass',
            description: 'Learn music production techniques and create beats together!',
            thumbnailUrl: '/api/placeholder/320/180',
            streamUrl: 'rtmp://localhost:1935/live/music_production',
            streamKey: 'key_ghi789',
            category: 'Music',
            tags: ['music', 'production', 'tutorial'],
            visibility: 'public',
            status: 'ended',
            actualStartTime: new Date(Date.now() - 172800000), // 2 days ago
            endTime: new Date(Date.now() - 169200000), // 2 days ago + 1 hour
            creatorId: 'user_123',
            creatorName: 'StreamerPro',
            creatorAvatar: '/api/placeholder/40/40',
            settings: {
              enableChat: true,
              enableSuperChat: true,
              enablePolls: false,
              enableQA: true,
              chatMode: 'live',
              slowMode: 0,
              subscribersOnly: false,
              moderationLevel: 'moderate',
              quality: '1080p',
              bitrate: 4500,
              frameRate: 30,
              enableRecording: true,
              enableMultiplatform: false,
              platforms: [{ name: 'youtube', enabled: true }],
            },
            stats: {
              viewers: 0,
              peakViewers: 1834,
              averageViewers: 1245,
              duration: 3600,
              likes: 567,
              dislikes: 8,
              chatMessages: 2341,
              superChatAmount: 456.75,
              superChatCount: 34,
              pollVotes: 0,
              qaQuestions: 67,
              streamHealth: 'excellent',
              bitrate: 4500,
              frameDrops: 2,
              latency: 1900,
            },
            monetization: {
              totalRevenue: 456.75,
              superChatRevenue: 456.75,
              adRevenue: 0,
              membershipRevenue: 0,
              donationRevenue: 0,
              superChats: [],
            },
          },
        ];

        setStreams(mockStreams);
      } catch (error) {
        console.error('Failed to fetch streams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();
  }, []);

  const getStreamActions = (stream: LiveStream): StreamAction[] => {
    const baseActions: StreamAction[] = [
      {
        id: 'edit',
        type: 'edit',
        label: 'Edit',
        icon: PencilIcon as React.ComponentType<{ className?: string | undefined }>,
        color: 'text-blue-600 hover:text-blue-800',
      },
      {
        id: 'duplicate',
        type: 'duplicate',
        label: 'Duplicate',
        icon: DocumentDuplicateIcon as React.ComponentType<{ className?: string | undefined }>,
        color: 'text-green-600 hover:text-green-800',
      },
      {
        id: 'analytics',
        type: 'analytics',
        label: 'Analytics',
        icon: ChartBarIcon as React.ComponentType<{ className?: string | undefined }>,
        color: 'text-purple-600 hover:text-purple-800',
      },
      {
        id: 'share',
        type: 'share',
        label: 'Share',
        icon: ShareIcon as React.ComponentType<{ className?: string | undefined }>,
        color: 'text-indigo-600 hover:text-indigo-800',
      },
      {
        id: 'delete',
        type: 'delete',
        label: 'Delete',
        icon: TrashIcon as React.ComponentType<{ className?: string | undefined }>,
        color: 'text-red-600 hover:text-red-800',
      },
    ];

    if (stream.status === 'live') {
      return [
        {
          id: 'stop',
          type: 'stop',
          label: 'End Stream',
          icon: StopIcon as React.ComponentType<{ className?: string | undefined }>,
          color: 'text-red-600 hover:text-red-800',
        },
        ...baseActions.filter(a => a.id !== 'delete'),
      ];
    }

    if (stream.status === 'scheduled') {
      return [
        {
          id: 'start',
          type: 'start',
          label: 'Start Now',
          icon: PlayIcon as React.ComponentType<{ className?: string | undefined }>,
          color: 'text-green-600 hover:text-green-800',
        },
        ...baseActions,
      ];
    }

    return baseActions;
  };

  const handleStreamAction = async (stream: LiveStream, action: StreamAction) => {
    try {
      switch (action.type) {
        case 'start':
          await liveStreamService.streams.startStream(stream.id);
          // Refresh streams
          break;
        case 'stop':
          await liveStreamService.streams.endStream(stream.id);
          // Refresh streams
          break;
        case 'edit':
          // Edit functionality would open a modal
          console.log('Edit stream:', stream.id);
          break;
        case 'duplicate':
          const duplicatedStream = await liveStreamService.streams.createStream({
            ...stream,
            title: `${stream.title} (Copy)`,
            status: 'scheduled',
          });
          setStreams(prev => [...prev, duplicatedStream]);
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this stream?')) {
            // In production, call delete API
            setStreams(prev => prev.filter(s => s.id !== stream.id));
          }
          break;
        case 'analytics':
          // Navigate to analytics page
          console.log('Navigate to analytics for stream:', stream.id);
          break;
        case 'share':
          // Open share modal
          console.log('Share stream:', stream.id);
          break;
      }
    } catch (error) {
      console.error('Failed to perform action:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      switch (action) {
        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedStreams.length} streams?`)) {
            setStreams(prev => prev.filter(s => !selectedStreams.includes(s.id)));
            setSelectedStreams([]);
          }
          break;
        case 'archive':
          // Archive selected streams
          console.log('Archive streams:', selectedStreams);
          break;
      }
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };

  const getStatusIcon = (status: LiveStream['status']) => {
    switch (status) {
      case 'live':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'scheduled':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'ended':
        return <ArchiveBoxIcon className="h-5 w-5 text-gray-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: LiveStream['status']) => {
    switch (status) {
      case 'live': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredStreams = streams.filter(stream => {
    if (filter === 'all') {
return true;
}
    return stream.status === filter;
  });

  const sortedStreams = [...filteredStreams].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        const dateA = a.actualStartTime || a.scheduledStartTime || new Date(0);
        const dateB = b.actualStartTime || b.scheduledStartTime || new Date(0);
        return dateB.getTime() - dateA.getTime();
      case 'viewers':
        return b.stats.peakViewers - a.stats.peakViewers;
      case 'duration':
        return b.stats.duration - a.stats.duration;
      case 'revenue':
        return b.monetization.totalRevenue - a.monetization.totalRevenue;
      default:
        return 0;
    }
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
return `${(num / 1000000).toFixed(1)}M`;
}
    if (num >= 1000) {
return `${(num / 1000).toFixed(1)}K`;
}
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
return `${hours}h ${minutes}m`;
}
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Stream Management
        </h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Create New Stream
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Streams</option>
            <option value="live">Live</option>
            <option value="scheduled">Scheduled</option>
            <option value="ended">Ended</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="viewers">Sort by Viewers</option>
            <option value="duration">Sort by Duration</option>
            <option value="revenue">Sort by Revenue</option>
          </select>
        </div>

        {selectedStreams.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedStreams.length} selected
            </span>
            <button
              onClick={() => handleBulkAction('archive')}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Archive
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Streams List */}
      <div className="space-y-4">
        {sortedStreams.map((stream) => (
          <div
            key={stream.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-4">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedStreams.includes(stream.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedStreams(prev => [...prev, stream.id]);
                  } else {
                    setSelectedStreams(prev => prev.filter(id => id !== stream.id));
                  }
                }}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />

              {/* Thumbnail */}
              <img
                src={stream.thumbnailUrl}
                alt={stream.title}
                className="w-24 h-14 object-cover rounded"
              />

              {/* Stream Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {stream.title}
                  </h3>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stream.status)}`}>
                    {getStatusIcon(stream.status)}
                    <span className="ml-1 capitalize">{stream.status}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {stream.description}
                </p>

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <EyeIcon className="h-4 w-4" />
                    <span>{formatNumber(stream.stats.peakViewers)} peak viewers</span>
                  </div>

                  {stream.stats.duration > 0 && (
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{formatDuration(stream.stats.duration)}</span>
                    </div>
                  )}

                  {stream.monetization.totalRevenue > 0 && (
                    <div className="flex items-center space-x-1">
                      <span className="text-green-600 font-medium">
                        ${stream.monetization.totalRevenue.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      {stream.actualStartTime
                        ? stream.actualStartTime.toLocaleDateString()
                        : stream.scheduledStartTime?.toLocaleDateString() || 'No date'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {getStreamActions(stream).slice(0, 3).map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleStreamAction(stream, action)}
                    disabled={action.disabled}
                    className={`p-2 rounded-lg transition-colors ${action.color} ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    title={action.label}
                  >
                    <action.icon className="h-4 w-4" />
                  </button>
                ))}

                {getStreamActions(stream).length > 3 && (
                  <div className="relative">
                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600">
                      <Cog6ToothIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedStreams.length === 0 && (
        <div className="text-center py-12">
          <VideoCameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No streams found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {filter === 'all' ? 'You haven\'t created any streams yet.' : `No ${filter} streams found.`}
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create Your First Stream
          </button>
        </div>
      )}
    </div>
  );
};

export default StreamManagementDashboard;