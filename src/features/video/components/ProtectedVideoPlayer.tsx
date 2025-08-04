import { useCallback, type FC } from 'react';
import { conditionalLogger } from '@/utils/conditionalLogger';
import { VideoErrorBoundary } from '@/components/ErrorBoundaries';
import { VideoPlayer, type VideoPlayerProps } from './VideoPlayer';




interface ProtectedVideoPlayerProps extends VideoPlayerProps {
  // Additional props specific to the protected version can be added here
}

/**
 * VideoPlayer wrapped with specialized error boundary
 * Provides enhanced error handling for video playback
 */
const ProtectedVideoPlayer: FC<ProtectedVideoPlayerProps> = ({
  videoId,
  src,
  poster,
  title,
  autoplay = false,
  startTime = 0,
  className = '',
  onReady,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  useYouTube = false,
  ...otherProps
}) => {
  const handleRetry = useCallback(() => {
    conditionalLogger.debug('Retrying video player', { videoId, src });
    // The error boundary will reset and re-render the component
  }, [videoId, src]);

  // Removed unused handleReload function

  return (
    <VideoErrorBoundary
        videoId={videoId || 'unknown'}
        onRetry={handleRetry}
      >
      <VideoPlayer
        videoId={videoId}
        {...(src && { src })}
        {...(poster && { poster })}
        {...(title && { title })}
        autoplay={autoplay}
        startTime={startTime}
        className={className}
        {...(onReady && { onReady })}
        {...(onTimeUpdate && { onTimeUpdate })}
        {...(onPlay && { onPlay })}
        {...(onPause && { onPause })}
        {...(onEnded && { onEnded })}
        useYouTube={useYouTube}
        {...otherProps}
      />
    </VideoErrorBoundary>
  );
};

export default ProtectedVideoPlayer;