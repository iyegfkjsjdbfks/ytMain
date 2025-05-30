import React, { memo, useCallback, useMemo } from 'react';
import { Video } from '../types';
import { useMiniplayerActions } from '../contexts/OptimizedMiniplayerContext';
import { useWatchLater } from '../contexts/WatchLaterContext';
import { formatDuration, formatViews, formatTimeAgo } from '../utils/formatters';
import { cn } from '../utils/cn';
import {
  PlayIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

interface OptimizedVideoCardProps {
  video: Video;
  size?: 'sm' | 'md' | 'lg';
  showChannel?: boolean;
  showDescription?: boolean;
  className?: string;
  onClick?: (video: Video) => void;
  onChannelClick?: (channelId: string) => void;
}

const sizeClasses = {
  sm: {
    container: 'w-full max-w-sm',
    thumbnail: 'aspect-video',
    title: 'text-sm font-medium line-clamp-2',
    channel: 'text-xs text-gray-600',
    meta: 'text-xs text-gray-500',
  },
  md: {
    container: 'w-full max-w-md',
    thumbnail: 'aspect-video',
    title: 'text-base font-medium line-clamp-2',
    channel: 'text-sm text-gray-600',
    meta: 'text-sm text-gray-500',
  },
  lg: {
    container: 'w-full max-w-lg',
    thumbnail: 'aspect-video',
    title: 'text-lg font-semibold line-clamp-2',
    channel: 'text-base text-gray-600',
    meta: 'text-base text-gray-500',
  },
};

const OptimizedVideoCard: React.FC<OptimizedVideoCardProps> = memo((
  {
    video,
    size = 'md',
    showChannel = true,
    showDescription = false,
    className,
    onClick,
    onChannelClick,
  }
) => {
  const { showMiniplayer } = useMiniplayerActions();
  const { addToWatchLater, removeFromWatchLater, isInWatchLater } = useWatchLater();
  
  const classes = sizeClasses[size];
  const isWatchLater = isInWatchLater(video.id);

  // Memoized formatted values
  const formattedDuration = useMemo(() => formatDuration(video.duration), [video.duration]);
  const formattedViews = useMemo(() => formatViews(video.views), [video.views]);
  const formattedTimeAgo = useMemo(() => formatTimeAgo(video.uploadDate), [video.uploadDate]);

  // Event handlers
  const handleVideoClick = useCallback(() => {
    if (onClick) {
      onClick(video);
    } else {
      showMiniplayer(video);
    }
  }, [onClick, video, showMiniplayer]);

  const handleChannelClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChannelClick) {
      onChannelClick(video.channelId);
    }
  }, [onChannelClick, video.channelId]);

  const handleWatchLaterToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWatchLater) {
      removeFromWatchLater(video.id);
    } else {
      addToWatchLater(video);
    }
  }, [isWatchLater, video, addToWatchLater, removeFromWatchLater]);

  const handleMenuClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement dropdown menu
  }, []);

  return (
    <div 
      className={cn(
        classes.container,
        'group cursor-pointer transition-transform hover:scale-105',
        className
      )}
      onClick={handleVideoClick}
    >
      {/* Thumbnail Container */}
      <div className="relative overflow-hidden rounded-lg bg-gray-200">
        <img
          src={video.thumbnail}
          alt={video.title}
          className={cn(
            classes.thumbnail,
            'w-full object-cover transition-transform group-hover:scale-110'
          )}
          loading="lazy"
        />
        
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
          {formattedDuration}
        </div>
        
        {/* Live Badge */}
        {video.isLive && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-medium">
            LIVE
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <PlayIcon className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
          <button
            onClick={handleWatchLaterToggle}
            className="p-1.5 bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full transition-colors"
            title={isWatchLater ? 'Remove from Watch Later' : 'Add to Watch Later'}
          >
            {isWatchLater ? (
              <CheckIcon className="w-4 h-4 text-white" />
            ) : (
              <ClockIcon className="w-4 h-4 text-white" />
            )}
          </button>
          <button
            onClick={handleMenuClick}
            className="p-1.5 bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full transition-colors"
            title="More options"
          >
            <EllipsisVerticalIcon className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="mt-3 space-y-2">
        {/* Title */}
        <h3 className={cn(classes.title, 'hover:text-blue-600 transition-colors')}>
          {video.title}
        </h3>
        
        {/* Channel Info */}
        {showChannel && (
          <div className="flex items-center gap-2">
            <img
              src={video.channelAvatar}
              alt={video.channelName}
              className="w-6 h-6 rounded-full object-cover"
              loading="lazy"
            />
            <button
              onClick={handleChannelClick}
              className={cn(
                classes.channel,
                'hover:text-gray-900 transition-colors truncate'
              )}
            >
              {video.channelName}
            </button>
          </div>
        )}
        
        {/* Meta Info */}
        <div className={cn(classes.meta, 'flex items-center gap-1')}>
          <span>{formattedViews} views</span>
          <span>•</span>
          <span>{formattedTimeAgo}</span>
        </div>
        
        {/* Description */}
        {showDescription && video.description && (
          <p className={cn(classes.meta, 'line-clamp-2 mt-2')}>
            {video.description}
          </p>
        )}
        
        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {video.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

OptimizedVideoCard.displayName = 'OptimizedVideoCard';

export default OptimizedVideoCard;