/// <reference types="react/jsx-runtime" />
// TODO: Fix import - import React from "react";
// TODO: Fix import - import { FixedSizeList as List } from 'react-window';

// TODO: Fix import - import { memo, useMemo, useCallback, useState, useEffect } from 'react';

import { performanceMonitor } from '../../utils/performanceOptimizations';

import { useDebounce, useIntersectionObserver } from '../../hooks/usePerformanceOptimization';
import type { Video } from '../../types/core';

interface OptimizedSearchResultsProps {
  videos: Video;
  query: string;
  onVideoClick: (video: Video) => void;
  onLoadMore?: () => void;
  loading?: boolean;
  hasMore?: boolean;
  className?: string;
}

interface SearchResultItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    videos: Video;
    onVideoClick: (video: Video) => void;
    query: string;
  };
}

const SearchResultItem = memo<SearchResultItemProps>(({ index, style, data }: {data: any}: {style: any}: {index: number}) => {
  const { videos, onVideoClick, query } = data;
  const video = videos[index];

  const handleClick = useCallback(() => {
    if (video) {
      performanceMonitor.startMeasure('video-click');
      onVideoClick(video);
      performanceMonitor.endMeasure('video-click');
    }
  }, [video, onVideoClick]);

  // Highlight search terms in title
  const highlightedTitle = useMemo(() => {
    if (!query || !video?.title) {
return video?.title || '';
}

    const regex = new RegExp(`(${query})`, 'gi');
    return video.title.replace(regex, '<mark>$1</mark>');
  }, [video?.title, query]);

  if (!video) {
    return <div style={style} />;
  }

  return (
    <div style={style} className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <div
        className="flex space-x-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors"
        onClick={handleClick}
      >
        {/* Video Thumbnail */}
        <div className="flex-shrink-0">
          <div className="w-40 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Video Info */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-lg font-medium text-gray-900 dark:text-white line-clamp-2 mb-1"
            dangerouslySetInnerHTML={{ __html: highlightedTitle }}
          />

          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>{video.views} views</span>
            <span>•</span>
            <span>{video.publishedAt || video.uploadedAt}</span>
          </div>

          {/* Channel Info */}
          <div className="flex items-center space-x-2 mb-2">
            <img
              src={video.channel?.avatarUrl || 'https://via.placeholder.com/24'}
              alt={video.channel?.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {video.channel?.name}
            </span>
            {video.channel?.isVerified && (
              <span className="text-blue-500" title="Verified">✓</span>
            )}
          </div>

          {/* Description */}
          {video.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {video.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

SearchResultItem.displayName = 'SearchResultItem';

const OptimizedSearchResults = memo<OptimizedSearchResultsProps>(({
  videos,
  query,
  onVideoClick,
  onLoadMore,
  loading = false,
  hasMore = false,
  className = '',
}) => {
  const [containerHeight, setContainerHeight] = useState(600);
  const debouncedQuery = useDebounce(query, 300);

  // Measure container height
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          setContainerHeight(Math.min(entry.contentRect.height, 800));
        }
      });

      resizeObserver.observe(node);
      setContainerHeight(Math.min(node.offsetHeight, 800));

      return () => {
        resizeObserver.disconnect();
      };
    }
    return undefined;
  }, []);

  // Intersection observer for load more
  const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
  });

  // Load more when intersecting
  useEffect(() => {
    if (isIntersecting && hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  }, [isIntersecting, hasMore, loading, onLoadMore]);

  // Memoized list data
  const listData = useMemo(() => ({
    videos,
    onVideoClick,
    query: debouncedQuery,
  }), [videos, onVideoClick, debouncedQuery]);

  // Performance monitoring
  useEffect(() => {
    performanceMonitor.startMeasure('search-results-render');
    return () => {
      performanceMonitor.endMeasure('search-results-render');
    };
  }, [videos.length]);

  if (loading && videos.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="flex space-x-4 animate-pulse">
            <div className="w-40 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
          No results found for "{query}"
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          Try different keywords or check your spelling
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      <List
        height={containerHeight}
        width="100%"
        itemCount={videos.length}
        itemSize={140}
        itemData={listData}
        overscanCount={5}
      >
        {SearchResultItem}
      </List>

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Load more results...</p>
          )}
        </div>
      )}
    </div>
  );
});

OptimizedSearchResults.displayName = 'OptimizedSearchResults';

export default OptimizedSearchResults;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
