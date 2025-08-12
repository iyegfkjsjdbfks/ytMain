import React, { FC } from 'react';
import type React from 'react';
import type { Video } from '../types';
import VideoCard from './VideoCard';

interface VideoGridProps {
  title?: string;
  videos: Video;
  columns?: number;
  showMoreLink?: string;
  emptyMessage?: string;
  onVideoClick?: (video: Video) => void;
}

/**
 * VideoGrid component displays videos in a responsive grid with optional title and "show more" link
 */
const VideoGrid: React.FC<VideoGridProps> = ({
  title,
  videos,
  columns = 4,
  showMoreLink,
  emptyMessage = 'No videos available',
  onVideoClick,
}) => {
  // Determine grid column classes based on the columns prop
  const getGridClass = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case 5:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
      case 6:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
      default:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }
  };

  return (
    <div className='mb-8'>
      {/* Title row with optional "Show more" link */}
      {title && (
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-bold'>{title}</h2>
          {showMoreLink && (
            <a
              href={showMoreLink}
              className='text-blue-600 hover:text-blue-800 text-sm font-medium'
            >
              Show more
            </a>
          )}
        </div>
      )}

      {/* Video grid */}
      {videos.length > 0 ? (
        <div className={`grid ${getGridClass()} gap-4`}>
          {videos.map((video: any) => (
            <VideoCard
              key={video.id}
              video={video}
              onClick={onVideoClick ? onVideoClick : undefined}
            />
          ))}
        </div>
      ) : (
        <div className='flex items-center justify-center py-10'>
          <div className='text-center'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-16 w-16 mx-auto text-gray-400 mb-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
              />
            </svg>
            <p className='text-gray-600'>{emptyMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;


