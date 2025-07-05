import { memo } from 'react';

import { PlayIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

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
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const sizeClasses = {
    sm: {
      container: 'flex gap-2',
      thumbnail: 'w-40 h-24 flex-shrink-0',
      content: 'flex-1 min-w-0',
      title: 'text-sm font-medium line-clamp-2',
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
    <article
      className={`${classes.container} cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors`}
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
      <div className={`${classes.thumbnail} relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700`}>
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />

        {/* Duration and View Count Badges */}
        {video.duration && video.duration !== '00:00' && (
          <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
            {video.duration}
          </div>
        )}

        {/* View Count Badge on Thumbnail */}
        {video.views && parseInt(video.views.toString(), 10) > 0 && (
          <div className="absolute bottom-1 left-1 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
            <span>{formatViews(video.views)}</span>
          </div>
        )}

        {/* Live Badge */}
        {video.isLive && (
          <div className="absolute top-1 left-1 bg-red-600 text-white text-xs px-2 py-1 rounded font-medium">
            🔴 LIVE
          </div>
        )}

        {/* YouTube Badge */}
        <div className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span>YT</span>
        </div>

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

        {/* Channel Info with Avatar */}
        {showChannel && (
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-shrink-0">
              <img
                src={video.channelAvatarUrl}
                alt={`${video.channelName} avatar`}
                className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 object-cover"
                onError={(e) => {
                  // Fallback to default avatar on error
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(video.channelName)}&size=24&background=ff0000&color=ffffff&bold=true`;
                }}
                loading="lazy"
              />
              {/* Verified badge for popular channels */}
              {video.channelName.includes('VEVO') || video.channelName.includes('Official') && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className={`${classes.meta} hover:text-gray-900 dark:hover:text-white transition-colors truncate block font-medium`}>
                {video.channelName}
              </span>
            </div>
          </div>
        )}

        {/* Enhanced Meta Information */}
        <div className={`${classes.meta} space-y-1`}>
          {/* Views and Upload Date - More Prominent */}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatViews(video.views)} views
            </span>
            <span>•</span>
            <time dateTime={video.uploadedAt} className="text-gray-500 dark:text-gray-400">
              {formatTimeAgo(video.uploadedAt)}
            </time>
          </div>

          {/* Category and Additional Info */}
          <div className="flex items-center gap-1 flex-wrap">
            {video.category && video.category !== 'General' && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded text-xs font-medium">
                {video.category}
              </span>
            )}
            {video.duration && video.duration !== '00:00' && (
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded text-xs">
                {video.duration}
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {video.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {video.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{video.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Enhanced Description Preview */}
        {video.description && size !== 'sm' && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-2">
            {video.description}
          </p>
        )}

        {/* YouTube Source Indicator */}
        <div className="flex items-center gap-1 mt-2">
          <span className="text-xs text-red-600 font-medium">From YouTube</span>
          <ArrowTopRightOnSquareIcon className="w-3 h-3 text-red-600" />
        </div>
      </div>
    </article>
  );
};

export default memo(EnhancedYouTubeVideoCard);
