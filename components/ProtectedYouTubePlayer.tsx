import React, { useCallback } from 'react';

import { VideoErrorBoundary } from '../src/components/ErrorBoundaries';
import { conditionalLogger } from '../src/utils/conditionalLogger';

import YouTubePlayer from './YouTubePlayer';

import type { YouTubeSearchResult } from '../services/googleSearchService';
import type { Video } from '../src/types/core';

interface ProtectedYouTubePlayerProps {
  video: YouTubeSearchResult | Video;
  width?: string | number;
  height?: string | number;
  autoplay?: boolean;
  controls?: boolean;
  className?: string;
  onReady?: (event: Event) => void;
  onStateChange?: (event: Event) => void;
  onError?: (event: Event) => void;
}

/**
 * YouTubePlayer wrapped with specialized error boundary
 * Provides enhanced error handling for YouTube video playback
 */
const ProtectedYouTubePlayer: React.FC<ProtectedYouTubePlayerProps> = ({
  video,
  width = '100%',
  height = '315',
  autoplay = false,
  controls = true,
  className = '',
  onReady,
  onStateChange,
  onError,
}) => {
  const videoId = typeof video === 'object' && 'id' in video ? video.id : '';

  const handleRetry = useCallback(() => {
    conditionalLogger.debug('Retrying YouTube player', { videoId });
    // The error boundary will reset and re-render the component
  }, [videoId]);

  return (
    <VideoErrorBoundary
      videoId={videoId}
      onRetry={handleRetry}
    >
      <YouTubePlayer
        video={video}
        width={width || 560}
        height={height || 315}
        autoplay={autoplay}
        controls={controls}
        className={className}
        {...(onReady && { onReady })}
        {...(onStateChange && { onStateChange })}
        {...(onError && { onError })}
      />
    </VideoErrorBoundary>
  );
};

export default ProtectedYouTubePlayer;


