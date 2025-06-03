import React, { memo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Video } from '../types';
import { useUnifiedAppState } from '../hooks/useRefactoredHooks';
import { formatCount } from '../utils/numberUtils';
import { formatDistanceToNow } from '../utils/dateUtils';
import { cn } from '../utils/cn';
import { 
  PlayIcon, 
  ClockIcon, 
  EyeIcon, 
  HeartIcon, 
  BookmarkIcon,
  ShareIcon,
  EllipsisVerticalIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

export interface ConsolidatedVideoCardProps {
  video: Video;
  variant?: 'default' | 'compact' | 'list' | 'grid' | 'shorts' | 'channel' | 'playlist';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showChannel?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
  showViews?: boolean;
  showDuration?: boolean;
  showTimestamp?: boolean;
  autoplay?: boolean;
  optimized?: boolean;
  className?: string;
  onVideoClick?: (video: Video) => void;
  onChannelClick?: (channelName: string) => void;
  onActionClick?: (action: string, video: Video) => void;
}

const sizeClasses = {
  sm: {
    container: 'max-w-xs',
    thumbnail: 'h-32',
    title: 'text-sm',
    metadata: 'text-xs',
    avatar: 'w-6 h-6'
  },
  md: {
    container: 'max-w-sm',
    thumbnail: 'h-40',
    title: 'text-base',
    metadata: 'text-sm',
    avatar: 'w-8 h-8'
  },
  lg: {
    container: 'max-w-md',
    thumbnail: 'h-48',
    title: 'text-lg',
    metadata: 'text-sm',
    avatar: 'w-10 h-10'
  },
  xl: {
    container: 'max-w-lg',
    thumbnail: 'h-56',
    title: 'text-xl',
    metadata: 'text-base',
    avatar: 'w-12 h-12'
  }
};

const variantClasses = {
  default: 'flex flex-col space-y-3',
  compact: 'flex flex-row space-x-3 items-start',
  list: 'flex flex-row space-x-4 items-start p-4 border-b border-gray-200 dark:border-gray-700',
  grid: 'flex flex-col space-y-2',
  shorts: 'flex flex-col space-y-2 aspect-[9/16]',
  channel: 'flex flex-col space-y-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-3',
  playlist: 'flex flex-row space-x-3 items-start bg-gray-50 dark:bg-gray-800 rounded-lg p-3'
};

/**
 * ConsolidatedVideoCard - A unified video card component that replaces all video card variants
 * 
 * Features:
 * - Multiple variants for different use cases
 * - Responsive sizing options
 * - Optimized performance with memoization
 * - Integrated with unified app state
 * - Accessibility features
 * - Hover effects and interactions
 */
export const ConsolidatedVideoCard: React.FC<ConsolidatedVideoCardProps> = memo(({
  video,
  variant = 'default',
  size = 'md',
  showChannel = true,
  showDescription = false,
  showActions = false,
  showViews = true,
  showDuration = true,
  showTimestamp = true,
  autoplay = false,
  optimized = true,
  className,
  onVideoClick,
  onChannelClick,
  onActionClick
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const { 
    isInWatchLater, 
    addToWatchLater, 
    removeFromWatchLater,
    addNotification 
  } = useUnifiedAppState();

  const sizeClass = sizeClasses[size];
  const variantClass = variantClasses[variant];
  const isCompact = variant === 'compact' || variant === 'list' || variant === 'playlist';
  const isInWatchLaterList = isInWatchLater(video.id);

  const handleVideoClick = useCallback(() => {
    onVideoClick?.(video);
  }, [onVideoClick, video]);

  const handleChannelClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChannelClick?.(video.channelName);
  }, [onChannelClick, video.channelName]);

  const handleWatchLaterToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWatchLaterList) {
      removeFromWatchLater(video.id);
      addNotification({
        id: Date.now().toString(),
        type: 'info',
        message: 'Removed from Watch Later',
        read: false,
        timestamp: new Date()
      });
    } else {
      addToWatchLater(video.id);
      addNotification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Added to Watch Later',
        read: false,
        timestamp: new Date()
      });
    }
    
    onActionClick?.('watchLater', video);
  }, [isInWatchLaterList, removeFromWatchLater, addToWatchLater, video, addNotification, onActionClick]);

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      navigator.share({
        title: video.title,
        url: `${window.location.origin}/watch?v=${video.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/watch?v=${video.id}`);
      addNotification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Link copied to clipboard',
        read: false,
        timestamp: new Date()
      });
    }
    
    onActionClick?.('share', video);
  }, [video, addNotification, onActionClick]);

  const videoUrl = `/watch?v=${video.id}`;
  const channelUrl = `/channel/${encodeURIComponent(video.channelName)}`;

  const thumbnailContent = (
    <div 
      className={cn(
        'relative bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden group',
        sizeClass.thumbnail,
        isCompact ? 'flex-shrink-0 w-40' : 'w-full aspect-video'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!imageError ? (
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className={cn(
            'w-full h-full object-cover transition-all duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0',
            isHovered && autoplay ? 'scale-105' : 'scale-100'
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          loading={optimized ? 'lazy' : 'eager'}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
          <PlayIcon className="w-8 h-8 text-gray-500" />
        </div>
      )}
      
      {/* Duration Badge */}
      {showDuration && video.duration && (
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
          {video.duration}
        </div>
      )}
      
      {/* Hover Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <PlayIcon className="w-12 h-12 text-white opacity-80" />
        </div>
      )}
    </div>
  );

  const metadataContent = (
    <div className={cn('flex-1', isCompact ? 'min-w-0' : 'space-y-2')}>
      {/* Title */}
      <h3 className={cn(
        'font-medium text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors',
        sizeClass.title
      )}>
        {video.title}
      </h3>
      
      {/* Channel Info */}
      {showChannel && (
        <div className="flex items-center space-x-2">
          {video.channelAvatar && (
            <img
              src={video.channelAvatar}
              alt={video.channelName}
              className={cn('rounded-full object-cover', sizeClass.avatar)}
            />
          )}
          <Link
            to={channelUrl}
            onClick={handleChannelClick}
            className={cn(
              'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors',
              sizeClass.metadata
            )}
          >
            {video.channelName}
          </Link>
        </div>
      )}
      
      {/* Video Stats */}
      <div className={cn('flex items-center space-x-2 text-gray-500 dark:text-gray-400', sizeClass.metadata)}>
        {showViews && (
          <span className="flex items-center space-x-1">
            <EyeIcon className="w-4 h-4" />
            <span>{formatCount(parseInt(video.views))}</span>
          </span>
        )}
        {showTimestamp && (
          <span className="flex items-center space-x-1">
            <ClockIcon className="w-4 h-4" />
            <span>{formatDistanceToNow(video.uploadedAt)}</span>
          </span>
        )}
      </div>
      
      {/* Description */}
      {showDescription && video.description && (
        <p className={cn('text-gray-600 dark:text-gray-400 line-clamp-2', sizeClass.metadata)}>
          {video.description}
        </p>
      )}
    </div>
  );

  const actionsContent = showActions && (
    <div className="flex items-center space-x-2 mt-2">
      <button
        onClick={handleWatchLaterToggle}
        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title={isInWatchLaterList ? 'Remove from Watch Later' : 'Add to Watch Later'}
      >
        {isInWatchLaterList ? (
          <BookmarkSolidIcon className="w-5 h-5 text-blue-600" />
        ) : (
          <BookmarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>
      
      <button
        onClick={handleShare}
        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Share"
      >
        <ShareIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>
      
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onActionClick?.('more', video);
        }}
        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="More options"
      >
        <EllipsisVerticalIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  );

  return (
    <div className={cn(variantClass, sizeClass.container, className)}>
      <Link to={videoUrl} onClick={handleVideoClick} className="block">
        {thumbnailContent}
      </Link>
      
      {metadataContent}
      {actionsContent}
    </div>
  );
});

ConsolidatedVideoCard.displayName = 'ConsolidatedVideoCard';

export default ConsolidatedVideoCard;
