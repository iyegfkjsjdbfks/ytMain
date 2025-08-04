import type React from 'react';
import type { Video } from '../types';
import VideoCard from './VideoCard';

interface VideoListProps {
  videos: Video[];
  layout?: 'grid' | 'list';
  variant?: 'default' | 'compact' | 'studio';
  emptyMessage?: string;
  onVideoClick?: (video: Video) => void;
}

/**
 * VideoList component displays a collection of videos
 * Can be rendered in grid or list layout with different card variants
 */
const VideoList: React.FC<VideoListProps> = ({
  videos,
  layout = 'grid',
  variant = 'default',
  emptyMessage = 'No videos found',
  onVideoClick,
}) => {
  if (!videos.length) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="space-y-4">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            variant={variant}
            onClick={onVideoClick}
          />
        ))}
      </div>
    );
  }

  // Grid layout
  return (
    <div className={`grid grid-cols-1 gap-4 ${
      variant === 'compact'
        ? 'sm:grid-cols-1'
        : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
    }`}>
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          variant={variant}
          onClick={onVideoClick}
        />
      ))}
    </div>
  );
};

export default VideoList;
