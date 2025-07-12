import React, { useCallback } from 'react';
import { VideoErrorBoundary } from '../../../components/ErrorBoundaries';
import { conditionalLogger } from '../../../utils/conditionalLogger';
import { VideoPlayer } from './VideoPlayer';
import type { VideoPlayerProps } from './VideoPlayer';

interface ProtectedVideoPlayerProps extends VideoPlayerProps {
  // Additional props specific to the protected version can be added here
}

/**
 * VideoPlayer wrapped with specialized error boundary
 * Provides enhanced error handling for video playback
 */
const ProtectedVideoPlayer: React.FC<ProtectedVideoPlayerProps> = ({
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

  const handleReload = useCallback(() => {
    conditionalLogger.debug('Reloading video player', { videoId, src });
    // Additional reload logic can be added here
    // For example, clearing cached video data or resetting player state
  }, [videoId, src]);

  return (
    <VideoErrorBoundary
      videoId={videoId || 'unknown'}
      onRetry={handleRetry}
      onReload={handleReload}
    >
      <VideoPlayer
        videoId={videoId}
        src={src}
        poster={poster}
        title={title}
        autoplay={autoplay}
        startTime={startTime}
        className={className}
        onReady={onReady}
        onTimeUpdate={onTimeUpdate}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        useYouTube={useYouTube}
        {...otherProps}
      />
    </VideoErrorBoundary>
  );
};

export default ProtectedVideoPlayer;