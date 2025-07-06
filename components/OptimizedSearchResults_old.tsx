import React, { memo, useMemo, useState, useEffect, useCallback } from 'react';

import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { withMemo } from '../utils/componentOptimizations';
import { performanceMonitor } from '../utils/performance';
import { getYouTubeVideoId } from '../src/lib/youtube-utils';

import OptimizedVideoCard from './OptimizedVideoCard';

import type { YouTubeSearchResult, GoogleSearchResult } from '../services/googleSearchService';
import type { Video } from '../types';

// Helper function to convert search results to Video type
const convertToVideo = (item: Video | YouTubeSearchResult | GoogleSearchResult): Video => {
  if ('views' in item && 'likes' in item && 'visibility' in item) {
    // Already a Video type
    return item;
  }

  // Convert YouTubeSearchResult or GoogleSearchResult to Video
  const searchResult = item;
  const now = new Date().toISOString();
  return {
    id: searchResult.id,
    title: searchResult.title,
    description: searchResult.description || '',
    thumbnailUrl: searchResult.thumbnailUrl,
    videoUrl: searchResult.videoUrl,
    duration: searchResult.duration || '0:00',
    views: searchResult.viewCount ? searchResult.viewCount.toString() : '0',
    likes: searchResult.likeCount || 0,
    dislikes: searchResult.dislikeCount || 0,
    uploadedAt: searchResult.uploadedAt || now,
    channelName: searchResult.channelName,
    channelId: searchResult.channelId || 'unknown',
    channelAvatarUrl: searchResult.channelAvatarUrl || '',
    category: searchResult.categoryId || '',
    tags: searchResult.tags || [],
    visibility: 'public' as const,
    // Required BaseEntity properties
    createdAt: now,
    updatedAt: now,
  };
};

interface OptimizedSearchResultsProps {
  videos: Video[];
  youtubeVideos: YouTubeSearchResult[];
  googleSearchVideos: GoogleSearchResult[];
  loading: boolean;
  query: string;
  sortBy: string;
  onVideoClick: (video: Video | YouTubeSearchResult | GoogleSearchResult) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

interface VirtualizedItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    items: Array<Video | YouTubeSearchResult | GoogleSearchResult>;
    onVideoClick: (video: Video | YouTubeSearchResult | GoogleSearchResult) => void;
  };
}

// Debounce hook for search optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Memoized sorting functions
const sortingFunctions = {
  relevance: (items: any[], query: string) => {
    return items.sort((a, b) => {
      const aRelevance = a.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      const bRelevance = b.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      return bRelevance - aRelevance;
    });
  },
  date: (items: any[]) => {
    return items.sort((a, b) => {
      const dateA = a.uploadedAt || a.publishedAt || '';
      const dateB = b.uploadedAt || b.publishedAt || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  },
  views: (items: any[]) => {
    return items.sort((a, b) => {
      const viewsA = typeof a.views === 'string' ? parseInt(a.views, 10) || 0 : (a.views || 0);
      const viewsB = typeof b.views === 'string' ? parseInt(b.views, 10) || 0 : (b.views || 0);
      return viewsB - viewsA;
    });
  },
};

// Helper function to extract video ID for iframe embedding
const extractVideoId = (video: Video) => {
  let videoId = getYouTubeVideoId(video.videoUrl);
  if (!videoId) {
    videoId = video.id;
    if (videoId && videoId.includes('-')) {
      const parts = videoId.split('-');
      const lastPart = parts[parts.length - 1];
      if (lastPart && lastPart.length === 11) {
        videoId = lastPart;
      }
    }
  }
  return videoId && videoId.length === 11 ? videoId : null;
};

// YouTube-style search result card component
const YouTubeSearchResultCard: React.FC<{
  item: Video | YouTubeSearchResult | GoogleSearchResult;
  onVideoClick: (video: Video | YouTubeSearchResult | GoogleSearchResult) => void;
}> = memo(({ item, onVideoClick }) => {
  const convertedVideo = convertToVideo(item);
  
  const formatDuration = (duration: string | number) => {
    if (typeof duration === 'string') return duration;
    if (typeof duration === 'number') {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return '0:00';
  };

  const formatViews = (views: string | number) => {
    const num = typeof views === 'string' ? parseInt(views, 10) || 0 : views || 0;
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
      return `${Math.floor(diffInSeconds / 31536000)} years ago`;
    } catch {
      return 'Recently';
    }
  };

  const videoId = extractVideoId(convertedVideo);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking on video player
    if (videoId && (e.target as HTMLElement).closest('iframe, [id*="youtube-player"]')) {
      e.stopPropagation();
      return;
    }
    onVideoClick(item);
  };

  return (
    <div 
      className="flex flex-col sm:flex-row gap-4 sm:gap-6 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-3 transition-colors"
      onClick={handleCardClick}
    >
      {/* YouTube Player or Thumbnail */}
      <div className="relative flex-shrink-0">
        <div className="w-full sm:w-[480px] h-[270px] sm:h-[270px] aspect-video sm:aspect-auto bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
          {videoId ? (
            <div 
              className="w-full h-full" 
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&controls=1&enablejsapi=0&origin=${encodeURIComponent(window.location.origin)}`}
                title={convertedVideo.title}
                className="w-full h-full border-0 rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ) : (
            <>
              <img
                src={convertedVideo.thumbnailUrl}
                alt={convertedVideo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
              {/* Duration badge */}
              {convertedVideo.duration && convertedVideo.duration !== '0:00' && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded-sm font-medium">
                  {formatDuration(convertedVideo.duration)}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white line-clamp-2 leading-6 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {convertedVideo.title}
        </h3>
        
        {/* Minimal metadata line - YouTube style */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span className="hover:text-gray-900 dark:hover:text-white transition-colors">
            {convertedVideo.channelName}
          </span>
          <span className="mx-1">•</span>
          <span>{formatViews(convertedVideo.views)} views</span>
          <span className="mx-1">•</span>
          <span>{formatTimeAgo(convertedVideo.uploadedAt)}</span>
        </div>

        {/* Description - only first line visible */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 leading-5">
          {convertedVideo.description}
        </p>
      </div>
    </div>
  );
});

// Virtualized item component for mobile view
const VirtualizedItem: React.FC<VirtualizedItemProps> = memo(({ index, style, data }) => {
  const { items, onVideoClick } = data;
  const item = items[index];

  if (!item) {
    return (
      <div style={style} className="p-4">
        <div className="animate-pulse bg-gray-200 h-48 rounded" />
      </div>
    );
  }

  const convertedVideo = convertToVideo(item);
  const videoId = extractVideoId(convertedVideo);

  return (
    <div style={style} className="p-2">
      {videoId ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="relative aspect-video bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&controls=1&enablejsapi=0`}
              title={convertedVideo.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
              {convertedVideo.title}
            </h3>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <p className="mb-1">{convertedVideo.channelName}</p>
            </div>
          </div>
        </div>
      ) : (
        <OptimizedVideoCard
          video={convertedVideo}
          onClick={() => onVideoClick(item)}
          lazy={true}
        />
      )}
    </div>
  );
});

VirtualizedItem.displayName = 'VirtualizedItem';

// Filters Modal Component
const FiltersModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}> = memo(({ isOpen, onClose, filters, onFiltersChange }) => {
  if (!isOpen) return null;

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const updateFeature = (feature: keyof SearchFilters['features'], enabled: boolean) => {
    onFiltersChange({
      ...filters,
      features: { ...filters.features, [feature]: enabled },
    });
  };

  const resetFilters = () => {
    onFiltersChange(defaultFilters);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Search filters</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Upload Date */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Upload date</h3>
            <div className="space-y-2">
              {[
                { value: 'any', label: 'Any time' },
                { value: 'hour', label: 'Last hour' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This week' },
                { value: 'month', label: 'This month' },
                { value: 'year', label: 'This year' },
              ].map(option => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="uploadDate"
                    value={option.value}
                    checked={filters.uploadDate === option.value}
                    onChange={(e) => updateFilter('uploadDate', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Duration</h3>
            <div className="space-y-2">
              {[
                { value: 'any', label: 'Any duration' },
                { value: 'short', label: 'Under 4 minutes' },
                { value: 'medium', label: '4 - 20 minutes' },
                { value: 'long', label: 'Over 20 minutes' },
              ].map(option => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="duration"
                    value={option.value}
                    checked={filters.duration === option.value}
                    onChange={(e) => updateFilter('duration', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Sort by</h3>
            <div className="space-y-2">
              {[
                { value: 'relevance', label: 'Relevance' },
                { value: 'upload_date', label: 'Upload date' },
                { value: 'view_count', label: 'View count' },
                { value: 'rating', label: 'Rating' },
              ].map(option => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sortBy"
                    value={option.value}
                    checked={filters.sortBy === option.value}
                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Features</h3>
            <div className="space-y-2">
              {[
                { key: 'hd', label: 'HD' },
                { key: 'subtitles', label: 'Subtitles/CC' },
                { key: 'creativeCommons', label: 'Creative Commons' },
                { key: 'live', label: 'Live' },
                { key: 'vr180', label: 'VR180' },
                { key: '3d', label: '3D' },
                { key: 'hdr', label: 'HDR' },
                { key: 'location', label: 'Location' },
                { key: 'purchased', label: 'Purchased' },
              ].map(feature => (
                <label key={feature.key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.features[feature.key as keyof SearchFilters['features']]}
                    onChange={(e) => updateFeature(feature.key as keyof SearchFilters['features'], e.target.checked)}
                    className="text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
});

FiltersModal.displayName = 'FiltersModal';

// Filter tab types
type FilterTab = 'all' | 'videos' | 'channels' | 'playlists' | 'live' | 'shorts';

// Filter types
interface SearchFilters {
  uploadDate: 'any' | 'hour' | 'today' | 'week' | 'month' | 'year';
  duration: 'any' | 'short' | 'medium' | 'long';
  sortBy: 'relevance' | 'upload_date' | 'view_count' | 'rating';
  features: {
    hd: boolean;
    subtitles: boolean;
    creativeCommons: boolean;
    live: boolean;
    vr180: boolean;
    '3d': boolean;
    hdr: boolean;
    location: boolean;
    purchased: boolean;
  };
}

const defaultFilters: SearchFilters = {
  uploadDate: 'any',
  duration: 'any',
  sortBy: 'relevance',
  features: {
    hd: false,
    subtitles: false,
    creativeCommons: false,
    live: false,
    vr180: false,
    '3d': false,
    hdr: false,
    location: false,
    purchased: false,
  },
};

// Main component
const OptimizedSearchResults: React.FC<OptimizedSearchResultsProps> = ({
  videos,
  youtubeVideos,
  googleSearchVideos,
  loading,
  query,
  sortBy,
  onVideoClick,
  onLoadMore,
  hasMore = false,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Debounce query for performance
  const debouncedQuery = useDebounce(query, 300);

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
  });

  // Combine and sort all results
  const allResults = useMemo(() => {
    performanceMonitor.startMeasure('search-results-processing');

    const combined = [
      ...(videos || []).map(v => ({ ...v, source: 'local' as const, contentType: 'video' as const })),
      ...(youtubeVideos || []).map(v => ({ ...v, source: 'youtube' as const, contentType: 'video' as const })),
      ...(googleSearchVideos || []).map(v => ({ ...v, source: 'google-search' as const, contentType: 'video' as const })),
    ];

    let sorted = combined;
    if (sortingFunctions[sortBy as keyof typeof sortingFunctions]) {
      sorted = sortingFunctions[sortBy as keyof typeof sortingFunctions](combined, debouncedQuery);
    }

    if (performanceMonitor.hasMetric('search-results-processing')) {
      performanceMonitor.endMeasure('search-results-processing');
    }
    return sorted;
  }, [videos, youtubeVideos, googleSearchVideos, sortBy, debouncedQuery]);

  // Apply filters to results
  const applyFilters = useCallback((results: any[], filters: SearchFilters) => {
    return results.filter(item => {
      const video = 'duration' in item ? item : convertToVideo(item);
      
      // Duration filter
      if (filters.duration !== 'any') {
        if (typeof video.duration === 'string') {
          const parts = video.duration.split(':');
          if (parts.length === 2 && parts[0] && parts[1]) {
            const minutes = parseInt(parts[0], 10);
            const totalSeconds = minutes * 60 + parseInt(parts[1], 10);
            
            switch (filters.duration) {
              case 'short':
                if (totalSeconds > 240) return false; // Under 4 minutes
                break;
              case 'medium':
                if (totalSeconds <= 240 || totalSeconds > 1200) return false; // 4-20 minutes
                break;
              case 'long':
                if (totalSeconds <= 1200) return false; // Over 20 minutes
                break;
            }
          }
        }
      }
      
      // Features filter
      if (filters.features.live && !video.isLive) return false;
      if (filters.features.hd && !video.title.toLowerCase().includes('hd')) return false;
      if (filters.features.subtitles && !video.title.toLowerCase().includes('subtitle')) return false;
      
      return true;
    });
  }, []);

  // Filter results based on active tab
  const tabFilteredResults = useMemo(() => {
    switch (activeTab) {
      case 'videos':
        return allResults.filter(item => {
          // For videos tab, show all video content
          return true; // All our current content are videos
        });
      case 'channels':
        // For now, return empty as we don't have channel results
        // In a real implementation, this would filter for channel results
        return [];
      case 'playlists':
        // For now, return empty as we don't have playlist results
        return [];
      case 'live':
        return allResults.filter(item => {
          const video = 'isLive' in item ? item : convertToVideo(item);
          return video.isLive;
        });
      case 'shorts':
        return allResults.filter(item => {
          const video = 'duration' in item ? item : convertToVideo(item);
          // Consider videos under 60 seconds as shorts
          if (typeof video.duration === 'string') {
            const parts = video.duration.split(':');
            if (parts.length === 2 && parts[0] && parts[1]) {
              const minutes = parseInt(parts[0], 10);
              const seconds = parseInt(parts[1], 10);
              return minutes === 0 && seconds <= 60;
            }
          }
          return false;
        });
      case 'all':
      default:
        return allResults;
    }
  }, [allResults, activeTab]);

  // Apply additional filters to tab-filtered results
  const filteredResults = useMemo(() => {
    return applyFilters(tabFilteredResults, filters);
  }, [tabFilteredResults, filters, applyFilters]);

  // Handle infinite scroll
  useEffect(() => {
    if (isIntersecting && hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  }, [isIntersecting, hasMore, loading, onLoadMore]);

  // Loading skeleton
  const LoadingSkeleton = memo(() => (
    <div className="w-full max-w-[1280px] mx-auto">
      {/* Filter tabs skeleton */}
      <div className="mb-4 px-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="h-8 w-18 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="h-8 w-14 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="mb-4 px-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
      </div>
      <div className="space-y-4 px-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-pulse p-3">
            <div className="w-full sm:w-[480px] h-[270px] bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  ));

  // Empty state
  const EmptyState = memo(() => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
      <p className="text-gray-500 max-w-md">
        Try adjusting your search terms or filters to find what you're looking for.
      </p>
    </div>
  ));

  if (loading && allResults.length === 0) {
    return <LoadingSkeleton />;
  }

  if (!loading && allResults.length === 0) {
    return <EmptyState />;
  }

  return (
    <div ref={containerRef} className="w-full max-w-[1280px] mx-auto">
      {/* YouTube-style filter tabs */}
      <div className="mb-4 px-4">
        <div className="flex items-center gap-3 mb-4 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'all' 
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveTab('videos')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'videos' 
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Videos
          </button>
          <button 
            onClick={() => setActiveTab('channels')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'channels' 
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Channels
          </button>
          <button 
            onClick={() => setActiveTab('playlists')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'playlists' 
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Playlists
          </button>
          <button 
            onClick={() => setActiveTab('live')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'live' 
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Live
          </button>
          <button 
            onClick={() => setActiveTab('shorts')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'shorts' 
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Shorts
          </button>
          <div className="flex-shrink-0 w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
          <button 
            onClick={() => setIsFiltersOpen(true)}
            className="flex-shrink-0 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>
      </div>

      {/* Results header - YouTube style */}
      <div className="mb-4 px-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          About {filteredResults.length.toLocaleString()} results
        </div>
      </div>

      {/* Filtered results or empty state */}
      {filteredResults.length > 0 ? (
        <div className="space-y-4 px-4">
          {filteredResults.map((item, index) => (
            <YouTubeSearchResultCard
              key={`${item.id}-${index}`}
              item={item}
              onVideoClick={onVideoClick}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No {activeTab === 'all' ? '' : activeTab} found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            {activeTab === 'channels' && 'No channels found for this search. Try searching for specific channel names.'}
            {activeTab === 'playlists' && 'No playlists found for this search. Try searching for specific playlist names.'}
            {activeTab === 'live' && 'No live videos found for this search. Try searching for current live streams.'}
            {activeTab === 'shorts' && 'No shorts found for this search. Try searching for short-form video content.'}
            {activeTab === 'videos' && 'No videos found for this search. Try different search terms.'}
            {activeTab === 'all' && 'No results found for this search. Try different search terms.'}
          </p>
        </div>
      )}

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef as React.RefObject<HTMLDivElement>} className="h-20 flex items-center justify-center mt-8">
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
          ) : (
            <button
              onClick={onLoadMore}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Load More Videos
            </button>
          )}
        </div>
      )}

      {/* Filters Modal */}
      <FiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
};

// Export memoized component
export default withMemo(OptimizedSearchResults, (prevProps, nextProps) => {
  return (
    prevProps.query === nextProps.query &&
    prevProps.sortBy === nextProps.sortBy &&
    prevProps.loading === nextProps.loading &&
    prevProps.videos.length === nextProps.videos.length &&
    prevProps.youtubeVideos.length === nextProps.youtubeVideos.length &&
    prevProps.googleSearchVideos.length === nextProps.googleSearchVideos.length
  );
});