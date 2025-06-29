import React, { memo, useMemo, useState, useEffect } from 'react';

import { FixedSizeList as List } from 'react-window';

import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { withMemo } from '../utils/componentOptimizations';
import { performanceMonitor } from '../utils/performance';

import OptimizedVideoCard from './OptimizedVideoCard';

import type { YouTubeSearchResult, GoogleSearchResult } from '../services/googleSearchService';
import type { Video } from '../types';

// Helper function to convert search results to Video type
const convertToVideo = (item: Video | YouTubeSearchResult | GoogleSearchResult): Video => {
  if ('views' in item && 'likes' in item) {
    // Already a Video type
    return item;
  }

  // Convert YouTubeSearchResult or GoogleSearchResult to Video
  const searchResult = item;
  return {
    id: searchResult.id,
    title: searchResult.title,
    description: searchResult.description,
    thumbnailUrl: searchResult.thumbnailUrl,
    videoUrl: searchResult.videoUrl,
    duration: searchResult.duration || '0:00',
    views: '0', // Default value since search results don't have view counts
    likes: 0,
    dislikes: 0,
    uploadedAt: searchResult.uploadedAt || new Date().toISOString(),
    channelName: searchResult.channelName,
    channelId: '', // Default empty since search results don't have channel IDs
    channelAvatarUrl: '', // Default empty
    category: '',
    tags: [],
    visibility: 'public' as const, // Default visibility
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Video;
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
    itemHeight: number;
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

// Grid item component for responsive grid layout
const GridItem: React.FC<{
  item: Video | YouTubeSearchResult | GoogleSearchResult;
  onVideoClick: (video: Video | YouTubeSearchResult | GoogleSearchResult) => void;
}> = memo(({ item, onVideoClick }) => {
  const convertedVideo = convertToVideo(item);

  return (
    <div className="group">
      <OptimizedVideoCard
        video={convertedVideo}
        onClick={() => onVideoClick(item)}
        lazy={true}
        size="md"
        showChannel={true}
        className="transition-transform duration-200 hover:scale-105 hover:shadow-lg"
      />
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

  return (
    <div style={style} className="p-2">
      <OptimizedVideoCard
        video={convertedVideo}
        onClick={() => onVideoClick(item)}
        lazy={true}
      />
    </div>
  );
});

VirtualizedItem.displayName = 'VirtualizedItem';

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
  const [containerHeight, setContainerHeight] = useState(600);
  const [itemHeight] = useState(280); // Fixed height for each item
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
      ...(videos || []).map(v => ({ ...v, source: 'local' as const })),
      ...(youtubeVideos || []).map(v => ({ ...v, source: 'youtube' as const })),
      ...(googleSearchVideos || []).map(v => ({ ...v, source: 'google' as const })),
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

  // Update container height based on viewport
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - rect.top - 100; // 100px buffer
        setContainerHeight(Math.max(400, Math.min(800, availableHeight)));
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Handle infinite scroll
  useEffect(() => {
    if (isIntersecting && hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  }, [isIntersecting, hasMore, loading, onLoadMore]);

  // Memoized data for virtualized list
  const listData = useMemo(() => ({
    items: allResults,
    onVideoClick,
    itemHeight,
  }), [allResults, onVideoClick, itemHeight]);

  // Loading skeleton
  const LoadingSkeleton = memo(() => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
      {Array.from({ length: 20 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 aspect-video rounded-lg mb-3" />
          <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded mb-2" />
          <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-3/4 mb-1" />
          <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-1/2" />
        </div>
      ))}
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
    <div ref={containerRef} className="w-full">
      {/* Results header */}
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {allResults.length} results for "{debouncedQuery}"
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500">
          Sorted by {sortBy}
        </div>
      </div>

      {/* Grid layout for desktop/tablet, virtualized list for mobile */}
      <div className="relative">
        {/* Desktop/Tablet Grid View */}
        <div className="hidden sm:block">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-4">
            {allResults.map((item, index) => (
              <GridItem
                key={`${item.id}-${index}`}
                item={item}
                onVideoClick={onVideoClick}
              />
            ))}
          </div>
        </div>

        {/* Mobile Virtualized List View */}
        <div className="block sm:hidden">
          <List
            height={containerHeight}
            width="100%"
            itemCount={allResults.length}
            itemSize={itemHeight}
            itemData={listData}
            overscanCount={5}
            className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          >
            {VirtualizedItem}
          </List>
        </div>

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
      </div>

      {/* Performance indicator (development only) */}
      {import.meta.env.MODE === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-50">
          {allResults.length} items • Grid: {window.innerWidth >= 640 ? 'ON' : 'OFF'}
        </div>
      )}
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