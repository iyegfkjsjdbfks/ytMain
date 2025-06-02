import React, { memo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Video } from '../types';
import { formatDuration, formatViewCount, formatTimeAgo } from '../utils/format';
import { useVideoAutoplay } from '../hooks/useVideoAutoplay';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { cn } from '../utils/cn';
import { UnifiedButton } from './ui/UnifiedButton';

interface UnifiedVideoCardProps {
  video: Video;
  variant?: 'default' | 'compact' | 'detailed' | 'grid' | 'list';
  size?: 'sm' | 'md' | 'lg';
  showActions?: boolean;
  showChannel?: boolean;
  showDescription?: boolean;
  showViews?: boolean;
  showDuration?: boolean;
  showTimestamp?: boolean;
  optimized?: boolean;
  autoplay?: boolean;
  className?: string;
  onVideoClick?: (video: Video) => void;
  onChannelClick?: (channelId: string) => void;
  onActionClick?: (action: string, video: Video) => void;
}

const variantClasses = {
  default: 'flex flex-col space-y-3',
  compact: 'flex space-x-3',
  detailed: 'flex flex-col space-y-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg',
  grid: 'flex flex-col space-y-2',
  list: 'flex space-x-4 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg',
};

const sizeClasses = {
  sm: {
    thumbnail: 'aspect-video w-full max-w-[160px]',
    title: 'text-sm font-medium',
    metadata: 'text-xs text-neutral-600 dark:text-neutral-400',
  },
  md: {
    thumbnail: 'aspect-video w-full',
    title: 'text-base font-medium',
    metadata: 'text-sm text-neutral-600 dark:text-neutral-400',
  },
  lg: {
    thumbnail: 'aspect-video w-full',
    title: 'text-lg font-semibold',
    metadata: 'text-base text-neutral-600 dark:text-neutral-400',
  },
};

const VideoThumbnail: React.FC<{
  video: Video;
  size: keyof typeof sizeClasses;
  autoplay: boolean;
  optimized: boolean;
  onVideoClick?: (video: Video) => void;
}> = memo(({ video, size, autoplay, optimized, onVideoClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });
  
  // Disabled useVideoAutoplay to prevent video loading errors
  // const {
  //   videoRef,
  //   isPlaying,
  //   handleMouseEnter,
  //   handleMouseLeave,
  // } = useVideoAutoplay({
  //   enabled: autoplay && isIntersecting,
  //   delay: 1000,
  // });
  
  // Mock values to replace the disabled hook
  const videoRef = { current: null };
  const isPlaying = false;
  const handleMouseEnter = () => {};
  const handleMouseLeave = () => {};

  const handleClick = useCallback(() => {
    onVideoClick?.(video);
  }, [onVideoClick, video]);

  const shouldShowVideo = optimized ? isIntersecting : true;
  const thumbnailUrl = imageError ? '/placeholder-thumbnail.jpg' : video.thumbnail;

  return (
    <div 
      ref={elementRef}
      className={cn(
        'relative overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800 cursor-pointer group',
        sizeClasses[size].thumbnail
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {shouldShowVideo && (
        <>
          {/* Thumbnail Image */}
          <img
            src={thumbnailUrl}
            alt={video.title}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading={optimized ? 'lazy' : 'eager'}
          />
          
          {/* Video Preview (disabled to prevent loading errors) */}
          {false && autoplay && (
            <video
              ref={videoRef}
              className={cn(
                'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
                isPlaying ? 'opacity-100' : 'opacity-0'
              )}
              muted
              loop
              playsInline
              preload="none"
            >
              <source src={video.videoUrl} type="video/mp4" />
            </video>
          )}
          
          {/* Duration Badge */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
              {formatDuration(video.duration)}
            </div>
          )}
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-black bg-opacity-50 rounded-full p-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          
          {/* Loading Skeleton */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          )}
        </>
      )}
    </div>
  );
});

const VideoMetadata: React.FC<{
  video: Video;
  size: keyof typeof sizeClasses;
  showChannel: boolean;
  showViews: boolean;
  showTimestamp: boolean;
  onChannelClick?: (channelId: string) => void;
}> = memo(({ video, size, showChannel, showViews, showTimestamp, onChannelClick }) => {
  const handleChannelClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChannelClick?.(video.channelId);
  }, [onChannelClick, video.channelId]);

  return (
    <div className="space-y-1">
      {showChannel && (
        <div className="flex items-center space-x-2">
          {video.channelAvatar && (
            <img
              src={video.channelAvatar}
              alt={video.channelName}
              className="w-6 h-6 rounded-full"
              loading="lazy"
            />
          )}
          <button
            onClick={handleChannelClick}
            className={cn(
              'hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors',
              sizeClasses[size].metadata
            )}
          >
            {video.channelName}
          </button>
        </div>
      )}
      
      <div className={cn('flex items-center space-x-2', sizeClasses[size].metadata)}>
        {showViews && video.views && (
          <span>{formatViewCount(video.views)} views</span>
        )}
        {showViews && showTimestamp && video.views && video.publishedAt && (
          <span>•</span>
        )}
        {showTimestamp && video.publishedAt && (
          <span>{formatTimeAgo(video.publishedAt)}</span>
        )}
      </div>
    </div>
  );
});

const VideoActions: React.FC<{
  video: Video;
  onActionClick?: (action: string, video: Video) => void;
}> = memo(({ video, onActionClick }) => {
  const handleAction = useCallback((action: string) => {
    onActionClick?.(action, video);
  }, [onActionClick, video]);

  return (
    <div className="flex items-center space-x-2 mt-2">
      <UnifiedButton
        variant="ghost"
        size="sm"
        onClick={() => handleAction('like')}
        leftIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7v13m-3-4h-2m0-4h2m-2-4h2" />
          </svg>
        }
      >
        Like
      </UnifiedButton>
      
      <UnifiedButton
        variant="ghost"
        size="sm"
        onClick={() => handleAction('save')}
        leftIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        }
      >
        Save
      </UnifiedButton>
      
      <UnifiedButton
        variant="ghost"
        size="sm"
        onClick={() => handleAction('share')}
        leftIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        }
      >
        Share
      </UnifiedButton>
    </div>
  );
});

export const UnifiedVideoCard: React.FC<UnifiedVideoCardProps> = memo(({
  video,
  variant = 'default',
  size = 'md',
  showActions = false,
  showChannel = true,
  showDescription = false,
  showViews = true,
  showDuration = true,
  showTimestamp = true,
  optimized = true,
  autoplay = false,
  className,
  onVideoClick,
  onChannelClick,
  onActionClick,
}) => {
  const isCompactVariant = variant === 'compact' || variant === 'list';
  
  const videoLink = `/watch?v=${video.id}`;
  
  const content = (
    <>
      <VideoThumbnail
        video={video}
        size={size}
        autoplay={autoplay}
        optimized={optimized}
        onVideoClick={onVideoClick}
      />
      
      <div className={cn('flex-1', isCompactVariant ? 'min-w-0' : '')}>
        <Link
          to={videoLink}
          className={cn(
            'block hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors',
            sizeClasses[size].title
          )}
          onClick={() => onVideoClick?.(video)}
        >
          <h3 className={cn(
            'line-clamp-2',
            isCompactVariant ? 'line-clamp-1' : 'line-clamp-2'
          )}>
            {video.title}
          </h3>
        </Link>
        
        {showDescription && video.description && (
          <p className={cn(
            'mt-1 line-clamp-2',
            sizeClasses[size].metadata
          )}>
            {video.description}
          </p>
        )}
        
        <div className="mt-1">
          <VideoMetadata
            video={video}
            size={size}
            showChannel={showChannel}
            showViews={showViews}
            showTimestamp={showTimestamp}
            onChannelClick={onChannelClick}
          />
        </div>
        
        {showActions && (
          <VideoActions
            video={video}
            onActionClick={onActionClick}
          />
        )}
      </div>
    </>
  );
  
  return (
    <article className={cn(variantClasses[variant], className)}>
      {content}
    </article>
  );
});

// Export as default for backward compatibility
export default UnifiedVideoCard;

// Type exports
export type { UnifiedVideoCardProps };