import React, { useCallback, useMemo, useRef, useState, useEffect, type SyntheticEvent } from 'react';

import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { withMemo } from '../utils/componentOptimizations';
import { performanceMonitor } from '../utils/performance';

interface OptimizedVideoPlayerProps {
  videoId: string;
  title?: string;
  thumbnail?: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  width?: number | string;
  height?: number | string;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: any) => void;
  lazy?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
}

interface VideoState {
  isLoaded: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isBuffering: boolean;
  error: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
}

const OptimizedVideoPlayer = ({
  videoId,
  title = '',
  thumbnail,
  autoplay = false,
  muted = true,
  controls = true,
  width = '100%',
  height = 'auto',
  className = '',
  onPlay,
  onPause,
  onEnded,
  onError,
  lazy = true,
  preload = 'metadata',
}: OptimizedVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoState, setVideoState] = useState<VideoState>({
    isLoaded: false,
    isPlaying: false,
    isPaused: true,
    isBuffering: false,
    error: null,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: muted,
  });

  // Intersection observer for lazy loading
  const { isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
    freezeOnceVisible: false,
  });

  // Determine if video should be loaded
  const shouldLoad = useMemo(() => {
    return !lazy || isIntersecting;
  }, [lazy, isIntersecting]);

  // Video source URL (mock implementation)
  const videoSrc = useMemo(() => {
    if (!shouldLoad) {
return '';
}
    // In a real app, this would be the actual video URL
    return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  }, [shouldLoad, videoId]);

  // Memoized event handlers
  const handleLoadStart = useCallback(() => {
    performanceMonitor.startMeasure(`video-load-${videoId}`);
    setVideoState(prev => ({ ...prev, isBuffering: true, error: null }));
  }, [videoId]);

  const handleLoadedData = useCallback(() => {
    const metricName = `video-load-${videoId}`;
    const duration = performanceMonitor.hasMetric(metricName)
      ? performanceMonitor.endMeasure(metricName)
      : null;
    if (duration && duration > 3000) {
      console.warn(`Slow video load detected: ${duration}ms for video ${videoId}`);
    }

    setVideoState(prev => ({
      ...prev,
      isLoaded: true,
      isBuffering: false,
      duration: videoRef.current?.duration || 0,
    }));
  }, [videoId]);

  const handlePlay = useCallback(() => {
    setVideoState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    setVideoState(prev => ({ ...prev, isPlaying: false, isPaused: true }));
    onPause?.();
  }, [onPause]);

  const handleEnded = useCallback(() => {
    setVideoState(prev => ({ ...prev, isPlaying: false, isPaused: true }));
    onEnded?.();
  }, [onEnded]);

  const handleError = useCallback((event: SyntheticEvent<HTMLVideoElement, Event>) => {
    const { error } = (event.target as HTMLVideoElement);
    const errorMessage = error ? `Video error: ${error.code} - ${error.message}` : 'Unknown video error';

    setVideoState(prev => ({
      ...prev,
      error: errorMessage,
      isBuffering: false,
      isLoaded: false,
    }));

    onError?.(error);
  }, [onError]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setVideoState(prev => ({
        ...prev,
        currentTime: videoRef.current?.currentTime || 0,
      }));
    }
  }, []);

  const handleVolumeChange = useCallback(() => {
    if (videoRef.current) {
      setVideoState(prev => ({
        ...prev,
        volume: videoRef.current?.volume || 0,
        isMuted: videoRef.current?.muted || false,
      }));
    }
  }, []);

  const handleWaiting = useCallback(() => {
    setVideoState(prev => ({ ...prev, isBuffering: true }));
  }, []);

  const handleCanPlay = useCallback(() => {
    setVideoState(prev => ({ ...prev, isBuffering: false }));
  }, []);

  // Auto-play when in view (if enabled)
  useEffect(() => {
    if (autoplay && isIntersecting && videoRef.current && videoState.isLoaded) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Auto-play failed:', error);
          // Auto-play was prevented, this is normal in many browsers
        });
      }
    }
  }, [autoplay, isIntersecting, videoState.isLoaded]);

  // Pause when out of view (for performance)
  useEffect(() => {
    if (!isIntersecting && videoRef.current && videoState.isPlaying) {
      videoRef.current.pause();
    }
  }, [isIntersecting, videoState.isPlaying]);

  // Render placeholder when not loaded
  if (!shouldLoad) {
    return (
      <div
        ref={containerRef}
        className={`relative bg-gray-900 flex items-center justify-center ${className}`}
        style={{ width, height: height === 'auto' ? '200px' : height }}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="text-white text-center">
            <div className="w-16 h-16 mx-auto mb-2 bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-gray-300">Click to load video</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width, height }}
    >
      {videoState.error ? (
        <div className="w-full h-full bg-red-900 flex items-center justify-center text-white text-center p-4">
          <div>
            <div className="text-red-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm">{videoState.error}</p>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            controls={controls}
            muted={videoState.isMuted}
            preload={preload}
            onLoadStart={handleLoadStart}
            onLoadedData={handleLoadedData}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onError={handleError}
            onTimeUpdate={handleTimeUpdate}
            onVolumeChange={handleVolumeChange}
            onWaiting={handleWaiting}
            onCanPlay={handleCanPlay}
          >
            {videoSrc && (
              <source src={videoSrc} type="video/mp4" />
            )}
            Your browser does not support the video tag.
          </video>

          {videoState.isBuffering && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Export memoized component for better performance
export default withMemo(OptimizedVideoPlayer, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.videoId === nextProps.videoId &&
    prevProps.autoplay === nextProps.autoplay &&
    prevProps.muted === nextProps.muted &&
    prevProps.controls === nextProps.controls &&
    prevProps.lazy === nextProps.lazy &&
    prevProps.preload === nextProps.preload
  );
});