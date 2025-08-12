import React, { ReactNode, FC } from 'react';
import { VideoGridSkeleton } from './LoadingStates';
import OptimizedVideoCard from './OptimizedVideoCard';
import VideoCard from './VideoCard';

import type { Video } from '../types';

interface ReusableVideoGridProps {
  videos: Video;
  loading?: boolean;
  error?: string | null;
  optimized?: boolean;
  columns?: 'auto' | 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  showChannelName?: boolean;
  showDuration?: boolean;
  showViews?: boolean;
  showUploadDate?: boolean;
  onVideoClick?: (video: Video) => void;
  className?: string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  skeletonCount?: number;
}

/**
 * Reusable video grid component that handles:
 * - Responsive grid layouts
 * - Loading states with skeletons
 * - Error states
 * - Empty states
 * - Optimized vs standard video cards
 * - Customizable display options
 *
 * Eliminates code duplication across pages that display video grids
 */
const ReusableVideoGrid: React.FC<ReusableVideoGridProps> = ({
  videos,
  loading = false,
  error = null,
  optimized = true,
  columns = 'auto',
  gap = 'md',
  showChannelName = true,

  onVideoClick,
  className = '',
  emptyMessage = 'No videos found',
  emptyIcon,
  skeletonCount = 18 }) => {
  // Grid column classes
  const getGridColumns: any = () => {
    if (columns === 'auto') {
      return 'grid-cols-1 sm: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
    }
    return `grid-cols-${columns}`;
  };

  // Gap classes
  const getGapClass: any = () => {
    switch (gap as any) {
      case 'sm': return 'gap-3';
      case 'lg': return 'gap-6';
      default: return 'gap-4'
    }

        };

  // Loading state
  if (loading as any) {
    return (
      <div className={`grid ${getGridColumns()} ${getGapClass()} ${className}`}>
        <VideoGridSkeleton count={skeletonCount} />
      </div>
    );
  }

  // Error state
  if (error as any) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Failed to load videos
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-gray-400 mb-4">
          {emptyIcon || (
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Check back later for new content.
        </p>
      </div>
    );
  }

  // Video grid
  const VideoComponent = optimized ? OptimizedVideoCard : VideoCard;

  return (
    <div className={`grid ${getGridColumns()} ${getGapClass()} ${className}`}>
      {videos.map((video: any) => (
        <VideoComponent
          key={video.id}
          video={video}
          showChannel={showChannelName}
          showDescription={false}
          {...(onVideoClick && { onClick: () => onVideoClick(video) })}
        />
      ))}
    </div>
  );
};

export default ReusableVideoGrid;