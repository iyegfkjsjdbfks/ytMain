
// TODO: Fix import - import { lazy, Suspense, memo } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import type { Video } from '../../types/core';

// Lazy load the heavy video player component
const VideoPlayer = lazy(() => import('../../features/video/components/VideoPlayer'));
const YouTubePlayer = lazy(() => import('../YouTubePlayer'));

interface LazyVideoPlayerProps {
  video: Video;
  autoplay?: boolean;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  className?: string;
}

const VideoPlayerFallback = () => (
  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
    <LoadingSpinner size="lg" />
    <span className="ml-2 text-gray-600 dark:text-gray-400">Loading player...</span>
  </div>
);

const LazyVideoPlayer = memo<LazyVideoPlayerProps>(({
  video,
  autoplay = false,
  onReady,
  onPlay,
  onPause,
  onEnded,
  className,
}) => {
  const isYouTubeVideo = video.videoUrl?.includes('youtube.com') || video.videoUrl?.includes('youtu.be');

  return (
    <Suspense fallback={<VideoPlayerFallback />}>
      {isYouTubeVideo ? (
        <YouTubePlayer
          video={video}
          autoplay={autoplay}
          onStateChange={(state) => {
            if (state === 1) {
onPlay?.();
} // Playing
            if (state === 2) {
onPause?.();
} // Paused
            if (state === 0) {
onEnded?.();
} // Ended
          }}
          {...(className && { className })}
        />
      ) : (
        <VideoPlayer
          videoId={video.id}
          src={video.videoUrl}
          poster={video.thumbnailUrl}
          title={video.title}
          autoplay={autoplay}
          {...(onReady && { onReady })}
          {...(onPlay && { onPlay })}
          {...(onPause && { onPause })}
          {...(onEnded && { onEnded })}
          className={className || ''}
        />
      )}
    </Suspense>
  );
});

LazyVideoPlayer.displayName = 'LazyVideoPlayer';

export default LazyVideoPlayer;