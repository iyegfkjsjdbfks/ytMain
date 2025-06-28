import { memo, useMemo, useCallback, useState, useRef, useEffect, type MouseEvent } from 'react';

import {
  PlayIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

import { useMiniplayerActions } from '../contexts/OptimizedMiniplayerContext';
import { useWatchLater } from '../contexts/WatchLaterContext';
import { useDropdownMenu } from '../hooks/useDropdownMenu';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { cn } from '../utils/cn';
import { withMemo } from '../utils/componentOptimizations';
import { formatDuration, formatViews, formatTimeAgo } from '../utils/formatters';
import { performanceMonitor } from '../utils/performance';

import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from './ui/DropdownMenu';

import type { Video } from '../types';

// Simple image cache to prevent repeated loading
const imageCache = new Set<string>();
const failedImages = new Set<string>();

interface OptimizedVideoCardProps {
  video: Video;
  size?: 'sm' | 'md' | 'lg';
  showChannel?: boolean;
  showDescription?: boolean;
  className?: string;
  onClick?: (video: Video) => void;
  onChannelClick?: (channelId: string) => void;
  lazy?: boolean;
  priority?: 'high' | 'low';
  index?: number;
}

// Lazy image component with intersection observer
const LazyImage = memo<{
  src: string;
  alt: string;
  className?: string;
  priority?: 'high' | 'low';
  lazy?: boolean;
}>(({ src, alt, className, priority = 'low', lazy = true }) => {
  const [loaded, setLoaded] = useState(() => imageCache.has(src));
  const [error, setError] = useState(() => failedImages.has(src));
  const imgRef = useRef<HTMLImageElement>(null);

  const { ref: intersectionRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
    freezeOnceVisible: true,
  });

  const handleLoad = useCallback(() => {
    setLoaded(true);
    imageCache.add(src); // Cache successful loads
    const metricName = `image-load-${src}`;
    if (performanceMonitor.hasMetric(metricName)) {
      performanceMonitor.endMeasure(metricName);
    }
  }, [src]);

  const handleError = useCallback(() => {
    setError(true);
    setLoaded(true);
    failedImages.add(src); // Cache failed loads to avoid retrying
    const metricName = `image-load-${src}`;
    if (performanceMonitor.hasMetric(metricName)) {
      performanceMonitor.endMeasure(metricName);
    }
  }, [src]);

  const shouldLoad = !lazy || priority === 'high' || isIntersecting;

  useEffect(() => {
    if (shouldLoad && !loaded && !error && !imageCache.has(src) && !failedImages.has(src)) {
      performanceMonitor.startMeasure(`image-load-${src}`);

      // Set a timeout to prevent indefinite loading
      const timeoutId = setTimeout(() => {
        if (!loaded && !error) {
          console.warn(`Image loading timeout for: ${src}`);
          handleError();
        }
      }, 5000); // 5 second timeout

      return () => {
        clearTimeout(timeoutId);
      };
    }

    // Return empty cleanup function for else case
    return () => {};
  }, [shouldLoad, loaded, error, src, handleError]);

  return (
    <div ref={intersectionRef as any} className={`relative overflow-hidden ${className}`}>
      {shouldLoad ? (
        <>
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority === 'high' ? 'eager' : 'lazy'}
            decoding="async"
          />
          {!loaded && !error && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

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

const OptimizedVideoCard = memo<OptimizedVideoCardProps>(
  ({
    video,
    size = 'md',
    showChannel = true,
    showDescription = false,
    className,
    onClick,
    onChannelClick,
    lazy = true,
    priority = 'low',
    index = 0,
  }) => {
  const { showMiniplayer } = useMiniplayerActions();
  const { addToWatchLater, removeFromWatchLater } = useWatchLater();

  const classes = sizeClasses[size];
  const isWatchLater = false; // Simplified for now

  // Memoized formatted values
  const formattedDuration = useMemo(() => {
    const durationNum = typeof video.duration === 'string' ? parseInt(video.duration, 10) : video.duration;
    return formatDuration(durationNum || 0);
  }, [video.duration]);
  const formattedViews = useMemo(() => {
    const viewsNum = typeof video.views === 'string' ? parseInt(video.views, 10) : video.views;
    return formatViews(viewsNum || 0);
  }, [video.views]);
  const formattedTimeAgo = useMemo(() => formatTimeAgo(video.uploadedAt), [video.uploadedAt]);

  // Event handlers with performance monitoring
  const handleVideoClick = useCallback(() => {
    performanceMonitor.startMeasure('video-card-click');
    if (onClick) {
      onClick(video);
    } else {
      showMiniplayer(video);
    }
    if (performanceMonitor.hasMetric('video-card-click')) {
      performanceMonitor.endMeasure('video-card-click');
    }
  }, [onClick, video, showMiniplayer]);

  const handleChannelClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    if (onChannelClick) {
      onChannelClick(video.channelId);
    }
  }, [onChannelClick, video.channelId]);

  const handleWatchLaterToggle = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    if (isWatchLater) {
      removeFromWatchLater(video.id);
    } else {
      addToWatchLater(video);
    }
  }, [isWatchLater, video, addToWatchLater, removeFromWatchLater]);

  const { isOpen: showMenu, toggle: toggleMenu, close: closeMenu, menuRef } = useDropdownMenu();

  const handleMenuClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    toggleMenu();
  }, [toggleMenu]);

  return (
    <div
      className={cn(
        classes.container,
        'group cursor-pointer transition-transform hover:scale-105',
        className,
      )}
      onClick={handleVideoClick}
    >
      {/* Thumbnail Container */}
      <div className="relative overflow-hidden rounded-lg bg-gray-200">
        <LazyImage
          src={video.thumbnailUrl}
          alt={video.title}
          className={cn(
            classes.thumbnail,
            'transition-transform group-hover:scale-110',
          )}
          priority={index < 4 ? 'high' : priority}
          lazy={lazy}
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

        {/* Dropdown Menu */}
        <DropdownMenu
          isOpen={showMenu}
          onClose={closeMenu}
          menuRef={menuRef}
          className="top-12 right-2"
          position="bottom-right"
        >
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              closeMenu();
              // Open save to playlist modal
              const event = new CustomEvent('openSaveToPlaylist', { detail: { video } });
              window.dispatchEvent(event);
            }}
            icon={<PlusIcon className="w-4 h-4" />}
          >
            Save to playlist
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              closeMenu();
              // Share video functionality
              const shareData = {
                title: video.title,
                text: `Check out this video: ${video.title}`,
                url: `${window.location.origin}/watch?v=${video.id}`,
              };

              if (navigator.share) {
                navigator.share(shareData).catch(console.error);
              } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(shareData.url).then(() => {
                  alert('Video link copied to clipboard!');
                }).catch(() => {
                  // Final fallback: show share modal
                  const event = new CustomEvent('openShareModal', { detail: shareData });
                  window.dispatchEvent(event);
                });
              }
            }}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            }
          >
            Share
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              closeMenu();
              // Mark video as not interested
              const notInterestedVideos = JSON.parse(localStorage.getItem('youtubeCloneNotInterested_v1') || '[]');
              if (!notInterestedVideos.includes(video.id)) {
                notInterestedVideos.push(video.id);
                localStorage.setItem('youtubeCloneNotInterested_v1', JSON.stringify(notInterestedVideos));

                // Dispatch event to remove video from current view
                const event = new CustomEvent('videoNotInterested', { detail: { videoId: video.id } });
                window.dispatchEvent(event);

                // Show feedback
                const feedback = document.createElement('div');
                feedback.className = 'fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg z-50';
                feedback.textContent = 'Video marked as not interested';
                document.body.appendChild(feedback);
                setTimeout(() => feedback.remove(), 3000);
              }
            }}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            }
          >
            Not interested
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              closeMenu();
              // Report video functionality
              const reportReasons = [
                'Spam or misleading',
                'Hateful or abusive content',
                'Harmful or dangerous acts',
                'Child safety',
                'Promotes terrorism',
                'Spam or scams',
                'Infringes my rights',
                'Captions issue',
              ];

              const reason = prompt(`Report this video for:\n\n${reportReasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\nEnter the number (1-${reportReasons.length}):`);

              if (reason && !isNaN(Number(reason)) && Number(reason) >= 1 && Number(reason) <= reportReasons.length) {
                const selectedReason = reportReasons[Number(reason) - 1];

                // Store report (in real app, this would be sent to server)
                const reports = JSON.parse(localStorage.getItem('youtubeCloneReports_v1') || '[]');
                reports.push({
                  videoId: video.id,
                  reason: selectedReason,
                  timestamp: new Date().toISOString(),
                  videoTitle: video.title,
                });
                localStorage.setItem('youtubeCloneReports_v1', JSON.stringify(reports));

                alert(`Thank you for your report. We'll review this video for: ${selectedReason}`);
              }
            }}
            variant="danger"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            }
          >
            Report
          </DropdownMenuItem>
        </DropdownMenu>
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
              src={video.channelAvatarUrl}
              alt={video.channelName}
              className="w-6 h-6 rounded-full object-cover"
              loading="lazy"
            />
            <button
              onClick={handleChannelClick}
              className={cn(
                classes.channel,
                'hover:text-gray-900 transition-colors truncate',
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

// Export with enhanced memoization
export default withMemo(OptimizedVideoCard, (prevProps, nextProps) => {
  return (
    prevProps.video.id === nextProps.video.id &&
    prevProps.video.title === nextProps.video.title &&
    prevProps.video.thumbnailUrl === nextProps.video.thumbnailUrl &&
    prevProps.video.views === nextProps.video.views &&
    prevProps.video.uploadedAt === nextProps.video.uploadedAt &&
    prevProps.size === nextProps.size &&
    prevProps.showChannel === nextProps.showChannel &&
    prevProps.showDescription === nextProps.showDescription &&
    prevProps.priority === nextProps.priority &&
    prevProps.lazy === nextProps.lazy &&
    prevProps.index === nextProps.index
  );
});