
import { memo } from 'react';

import { PlayIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

import ImageWithFallback from './ImageWithFallback';

import type { Video } from '../types';

interface EnhancedYouTubeVideoCardProps {
  video: Video;
  onVideoSelect?: ((videoId: string) => void) | undefined;
  showChannel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const EnhancedYouTubeVideoCard: React.FC<EnhancedYouTubeVideoCardProps> = ({
  video,
  onVideoSelect,
  showChannel = true,
  size = 'md',
}) => {
  const handleClick = () => {
    if (onVideoSelect) {
      onVideoSelect(video.id);
    } else {
      // Open YouTube video in new tab
      window.open(video.videoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const formatViews = (views: string | number): string => {
    const num = typeof views === 'string' ? parseInt(views, 10) : views;
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatTimeAgo = (dateStr: string): string => {
    try {
      return formatDistanceToNow(new Date(dateStr || Date.now()), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const sizeClasses = {
    sm: {
      container: 'flex gap-2',
      thumbnail: 'w-[168px] h-[94px] flex-shrink-0',
      content: 'flex-1 min-w-0',
      title: 'text-sm font-medium line-clamp-2 leading-5',
      meta: 'text-xs text-gray-600',
    },
    md: {
      container: 'flex gap-3',
      thumbnail: 'w-48 h-28 flex-shrink-0',
      content: 'flex-1 min-w-0',
      title: 'text-base font-medium line-clamp-2',
      meta: 'text-sm text-gray-600',
    },
    lg: {
      container: 'block',
      thumbnail: 'w-full h-48',
      content: 'mt-3',
      title: 'text-lg font-semibold line-clamp-2',
      meta: 'text-sm text-gray-600',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={`${classes.container} cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md p-1 transition-colors`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Play ${video.title}`}
    >
      {/* Thumbnail */}
      <div className={`${classes.thumbnail} relative overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700`}>
        <ImageWithFallback
          src={(video.thumbnailUrl || video.thumbnail)}
          alt={video.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          width={size === 'sm' ? 168 : size === 'md' ? 192 : 320}
          height={size === 'sm' ? 94 : size === 'md' ? 112 : 180}
          fallbackSrc={`https://picsum.photos/${size === 'sm' ? 168 : size === 'md' ? 192 : 320}/${size === 'sm' ? 94 : size === 'md' ? 112 : 180}?random=${video.id}`}
        />

        {/* Duration and View Count Badges */}
        {video.duration && video.duration !== '00:00' && (
          <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
            {video.duration}
          </div>
        )}

        {/* Remove view count badge from thumbnail for cleaner look like YouTube */}

        {/* Live Badge */}
        {(video.isLive || false) && (
          <div className="absolute top-1 left-1 bg-red-600 text-white text-xs px-2 py-1 rounded font-medium">
            🔴 LIVE
          </div>
        )}

        {/* Remove YouTube badge for cleaner look */}

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors">
              <PlayIcon className="w-5 h-5 text-white" />
            </div>
            <ArrowTopRightOnSquareIcon className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={classes.content}>
        {/* Title */}
        <h3 className={`${classes.title} text-gray-900 dark:text-white group-hover:text-red-600 transition-colors mb-1`}>
          {video.title}
        </h3>

        {/* Channel Info - Simplified like YouTube */}
        {showChannel && (
          <div className={`${classes.meta} text-gray-600 dark:text-gray-400 mb-1`}>
            <span className="hover:text-gray-900 dark:hover:text-white transition-colors">
              {(video.channelName || video.channelTitle)}
            </span>
          </div>
        )}

        {/* Simplified Meta Information like YouTube */}
        <div className={`${classes.meta} text-gray-600 dark:text-gray-400`}>
          <div className="flex items-center gap-1">
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <time dateTime={video.uploadedAt}>
              {formatTimeAgo(video.uploadedAt || video.publishedAt || new Date().toISOString())}
            </time>
          </div>
        </div>

        {/* Remove extra elements for YouTube-like minimal design */}
      </div>
    </div>
  );
};

export default memo(EnhancedYouTubeVideoCard);
