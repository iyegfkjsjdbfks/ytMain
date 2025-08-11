/// <reference types="react/jsx-runtime" />
import type * as React from 'react';
import {  useState, useEffect  } from 'react';

import { FolderIcon, CalendarIcon, EyeIcon, ClockIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon, ShareIcon, ChartBarIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';

import { getVideos } from '../services/realVideoService';
import { parseRelativeDate } from '../utils/dateUtils';
import { formatNumber } from '../utils/numberUtils';

import type { ContentItem } from '../types';


type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'published' | 'scheduled' | 'draft' | 'private' | 'unlisted';
type SortType = 'newest' | 'oldest' | 'mostViews' | 'leastViews' | 'alphabetical' | 'duration';

const ContentManagerPage: React.FC = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const videos = await getVideos();
        const contentItems: ContentItem[] = videos.map(video => {
          const status = Math.random() > 0.8 ? 'draft' : Math.random() > 0.9 ? 'scheduled' : Math.random() > 0.95 ? 'private' : 'published';
          const item: ContentItem = {
            ...video,
            status: status as 'published' | 'scheduled' | 'draft' | 'private' | 'unlisted',
            lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          };
          if (Math.random() > 0.9) {
            item.scheduledDate = new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
          }
          return item;
        });
        setContent(contentItems);
      } catch (error) {
        console.error('Failed to fetch content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  useEffect(() => {
    let filtered = content;

    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter((item) => item.status === filter);
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.channelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())),
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case 'oldest':
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        case 'mostViews':
          return parseInt(b.views, 10) - parseInt(a.views, 10);
        case 'leastViews':
          return parseInt(a.views, 10) - parseInt(b.views, 10);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'duration':
          const aDurationParts = a.duration?.split(':') || ['0', '0'];
          const bDurationParts = b.duration?.split(':') || ['0', '0'];
          return parseInt(bDurationParts[0] || '0', 10) * 60 + parseInt(bDurationParts[1] || '0', 10) -
          (parseInt(aDurationParts[0] || '0', 10) * 60 + parseInt(aDurationParts[1] || '0', 10));
        default:
          return 0;
      }
    });

    setFilteredContent(filtered);
  }, [content, filter, searchQuery, sortBy]);

  const handleSelectItem = (itemId: any) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredContent.length) {
      setSelectedItems(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedItems(new Set(filteredContent.map(item => item.id)));
      setShowBulkActions(true);
    }
  };

  const handleBulkAction = (action: 'publish' | 'unpublish' | 'schedule' | 'delete' | 'duplicate') => {
    if (action === 'schedule') {
      setShowScheduleModal(true);
      return;
    }

    setContent(prevContent =>
      prevContent.map(item => {
        if (selectedItems.has(item.id)) {
          switch (action) {
            case 'publish':
              return { ...item, status: 'published' as const };
            case 'unpublish':
              return { ...item, status: 'private' as const };
            case 'delete':
              return null; // Will be filtered out
            case 'duplicate':
              return item;
            default:
              return item;
          }
        }
        return item;
      }).filter(Boolean) as ContentItem,
    );

    if (action === 'duplicate') {
      // Add duplicated items
      const duplicatedItems = content
        .filter((item) => selectedItems.has(item.id))
        .map(item => ({
          ...item,
          id: `${item.id}-copy`,
          title: `${item.title} (Copy)`,
          status: 'draft' as const,
          uploadedAt: new Date().toISOString(),
          views: '0',
        }));
      setContent(prev => [...prev, ...duplicatedItems]);
    }

    setSelectedItems(new Set());
    setShowBulkActions(false);
  };

  const handleSchedule = () => {
    if (!scheduleDate || !scheduleTime) {
return;
}

    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();

    setContent(prevContent =>
      prevContent.map(item => {
        if (selectedItems.has(item.id)) {
          return {
            ...item,
            status: 'scheduled' as const,
            scheduledDate: scheduledDateTime,
          };
        }
        return item;
      }),
    );

    setSelectedItems(new Set());
    setShowBulkActions(false);
    setShowScheduleModal(false);
    setScheduleDate('');
    setScheduleTime('');
  };

  const getStatusBadge = (status: any, scheduledDate?: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';

    switch (status) {
      case 'published':
        return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`}>Published</span>;
      case 'scheduled':
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`}>
            <CalendarIcon className="w-3 h-3 inline mr-1" />
            Scheduled {scheduledDate && `(${new Date(scheduledDate).toLocaleDateString()})`}
          </span>
        );
      case 'draft':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`}>Draft</span>;
      case 'private':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400`}>Private</span>;
      case 'unlisted':
        return <span className={`${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400`}>Unlisted</span>;
      default:
        return null;
    }
  };

  const getFilterCount = (filterType: FilterType) => {
    if (filterType === 'all') {
return content.length;
}
    return content.filter((item) => item.status === filterType).length;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-4 sm:mb-0">
          Content Manager
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {filteredContent.length} of {content.length} items
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'published', 'scheduled', 'draft', 'private', 'unlisted'] as FilterType).map((filterType: any) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterType
                    ? 'bg-blue-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)} ({getFilterCount(filterType)})
              </button>
            ))}
          </div>

          {/* Search and Sort */}
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-3 pr-10 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="mostViews">Most Views</option>
              <option value="leastViews">Least Views</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="duration">Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('publish')}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
              >
                <PlayIcon className="w-4 h-4 inline mr-1" />
                Publish
              </button>
              <button
                onClick={() => handleBulkAction('schedule')}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
              >
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                Schedule
              </button>
              <button
                onClick={() => handleBulkAction('unpublish')}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
              >
                <PauseIcon className="w-4 h-4 inline mr-1" />
                Unpublish
              </button>
              <button
                onClick={() => handleBulkAction('duplicate')}
                className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors"
              >
                <DocumentDuplicateIcon className="w-4 h-4 inline mr-1" />
                Duplicate
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
              >
                <TrashIcon className="w-4 h-4 inline mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Grid/List */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
        {/* Header with Select All */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedItems.size === filteredContent.length && filteredContent.length > 0}
              onChange={handleSelectAll}
              className="rounded border-neutral-300 dark:border-neutral-600 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Select All
            </span>
          </label>
        </div>

        {/* Content */}
        {filteredContent.length === 0 ? (
          <div className="p-8 text-center">
            <FolderIcon className="w-16 h-16 text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              No content found
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400">
              {searchQuery ? 'Try adjusting your search or filters.' : 'No content matches the current filter.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {filteredContent.map((item) => (
              <div key={item.id} className="group relative">
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="rounded border-neutral-300 text-blue-500 focus:ring-blue-500 bg-white/90"
                  />
                </div>
                <div className="bg-neutral-100 dark:bg-neutral-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {item.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-50 line-clamp-2 text-sm">
                        {item.title}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {getStatusBadge(item.status, item.scheduledDate)}
                      <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 space-x-4">
                        <span className="flex items-center">
                          <EyeIcon className="w-3 h-3 mr-1" />
                          {formatNumber(parseInt(item.views, 10))}
                        </span>
                        <span className="flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {parseRelativeDate(item.uploadedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {                          }}
                          className="p-1 text-neutral-500 hover:text-blue-500 transition-colors"
                          title="Edit video"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {                          }}
                          className="p-1 text-neutral-500 hover:text-green-500 transition-colors"
                          title="View analytics"
                        >
                          <ChartBarIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`https://youtube.com/watch?v=${item.id}`);
                          }}
                          className="p-1 text-neutral-500 hover:text-purple-500 transition-colors"
                          title="Share video"
                        >
                          <ShareIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
                            // Delete video logic here
                          }
                        }}
                        className="p-1 text-neutral-500 hover:text-red-500 transition-colors"
                        title="Delete video"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {filteredContent.map((item) => (
              <div key={item.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="rounded border-neutral-300 dark:border-neutral-600 text-blue-500 focus:ring-blue-500"
                  />
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-20 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-50 truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      {getStatusBadge(item.status, item.scheduledDate)}
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        {formatNumber(parseInt(item.views, 10))} views
                      </span>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        {parseRelativeDate(item.uploadedAt)}
                      </span>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        {item.duration}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {                      }}
                      className="p-2 text-neutral-500 hover:text-blue-500 transition-colors"
                      title="Edit video"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {                      }}
                      className="p-2 text-neutral-500 hover:text-green-500 transition-colors"
                      title="View analytics"
                    >
                      <ChartBarIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://youtube.com/watch?v=${item.id}`);
                      }}
                      className="p-2 text-neutral-500 hover:text-purple-500 transition-colors"
                      title="Share video"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
                          // Delete video logic here
                        }
                      }}
                      className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
                      title="Delete video"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
              Schedule Content
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="schedule-date" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="schedule-time" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={!scheduleDate || !scheduleTime}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagerPage;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
