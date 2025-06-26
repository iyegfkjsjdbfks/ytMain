import React, { useState, useEffect, useRef, useCallback, useMemo, memo, type ReactNode } from 'react';

import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { withMemo } from '../utils/componentOptimizations';
import { performanceMonitor } from '../utils/performance';

interface OptimizedYouTubePlayerProps {
  videoId: string;
  width?: number | string;
  height?: number | string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  start?: number;
  end?: number;
  quality?: 'small' | 'medium' | 'large' | 'hd720' | 'hd1080' | 'highres' | 'default';
  className?: string;
  onReady?: (event: any) => void;
  onStateChange?: (event: any) => void;
  onError?: (event: any) => void;
  lazy?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  placeholder?: ReactNode;
}

// YouTube API loading state
let youtubeAPILoaded = false;
let youtubeAPILoading = false;
const youtubeAPICallbacks: Array<() => void> = [];

// Load YouTube API dynamically
const loadYouTubeAPI = (): Promise<void> => {
  return new Promise((resolve) => {
    if (youtubeAPILoaded) {
      resolve();
      return;
    }

    youtubeAPICallbacks.push(resolve);

    if (youtubeAPILoading) {
      return;
    }

    youtubeAPILoading = true;
    performanceMonitor.startMeasure('youtube-api-load');

    // Create script tag as per official documentation
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag?.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }

    // Global callback for YouTube API - must be on window object
    // Preserve any existing callback
    const originalCallback = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      youtubeAPILoaded = true;
      youtubeAPILoading = false;
      if (performanceMonitor.hasMetric('youtube-api-load')) {
        performanceMonitor.endMeasure('youtube-api-load');
      }

      // Execute all pending callbacks
      youtubeAPICallbacks.forEach(callback => callback());
      youtubeAPICallbacks.length = 0;

      // Call the original callback if it exists
      if (originalCallback && typeof originalCallback === 'function') {
        originalCallback();
      }
    };
  });
};

// Default placeholder component
const DefaultPlaceholder = memo(({ videoId, onClick }: { videoId: string; onClick: () => void }) => {
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div
      className="relative w-full h-full bg-black flex items-center justify-center cursor-pointer group"
      onClick={onClick}
    >
      <img
        src={thumbnailUrl}
        alt="Video thumbnail"
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
        Click to load video
      </div>
    </div>
  );
});

DefaultPlaceholder.displayName = 'DefaultPlaceholder';

// Main component
const OptimizedYouTubePlayer = ({
  videoId,
  width = '100%',
  height = '100%',
  autoplay = false,
  muted = false,
  controls = true,
  loop = false,
  start,
  end,
  quality = 'default',
  className = '',
  onReady,
  onStateChange,
  onError,
  lazy = true,
  placeholder,
}: OptimizedYouTubePlayerProps) => {
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const [apiReady, setApiReady] = useState(youtubeAPILoaded);
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<any>(null);
  // const containerRef = useRef<HTMLDivElement>(null); // Removed unused variable
  const playerInstanceRef = useRef<any>(null);

  // Intersection observer for lazy loading
  const { ref: intersectionRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    freezeOnceVisible: true,
  });

  // Determine if player should be loaded
  const shouldLoadPlayer = useMemo(() => {
    return !lazy || shouldLoad || isIntersecting;
  }, [lazy, shouldLoad, isIntersecting]);

  // Player configuration following official API documentation
  const playerVars = useMemo(() => {
    const vars: any = {
      autoplay: autoplay ? 1 : 0,
      controls: controls ? 1 : 0,
      rel: 0, // Don't show related videos
      modestbranding: 1, // Modest YouTube branding
      playsinline: 1, // Play inline on mobile
      enablejsapi: 1, // Enable JavaScript API
      origin: window.location.origin, // Add origin to fix postMessage error
    };

    // Add optional parameters only if they have values
    if (muted) {
vars.mute = 1;
}
    if (loop) {
vars.loop = 1;
}
    if (start !== undefined) {
vars.start = start;
}
    if (end !== undefined) {
vars.end = end;
}
    if (quality !== 'default') {
vars.quality = quality;
}

    return vars;
  }, [autoplay, muted, controls, loop, start, end, quality]);

  // Load YouTube API when needed
  useEffect(() => {
    if (shouldLoadPlayer && !apiReady) {
      loadYouTubeAPI().then(() => {
        setApiReady(true);
      }).catch((err) => {
        console.error('Failed to load YouTube API:', err);
        setError('Failed to load YouTube player');
      });
    }
  }, [shouldLoadPlayer, apiReady]);

  // Initialize player when API is ready
  useEffect(() => {
    if (shouldLoadPlayer && apiReady && !playerLoaded && playerRef.current && (window as any).YT?.Player) {
      performanceMonitor.startMeasure(`youtube-player-init-${videoId}`);

      // Ensure the player div has an ID (required by YouTube API)
      const playerId = `youtube-player-${videoId}-${Date.now()}`;
      if (!playerRef.current.id) {
        playerRef.current.id = playerId;
      }

      try {
        // Create player instance following official API documentation
        playerInstanceRef.current = new (window as any).YT.Player(playerRef.current.id, {
          height: typeof height === 'number' ? height.toString() : (height),
          width: typeof width === 'number' ? width.toString() : (width),
          videoId,
          playerVars,
          events: {
            onReady: (event: any) => {
              const metricName = `youtube-player-init-${videoId}`;
              if (performanceMonitor.hasMetric(metricName)) {
                performanceMonitor.endMeasure(metricName);
              }
              setPlayerLoaded(true);
              setError(null); // Clear any previous errors
              onReady?.(event);
            },
            onStateChange: (event: any) => {
              onStateChange?.(event);
            },
            onError: (event: any) => {
              console.error('YouTube player error:', event, 'Video ID:', videoId);
              setError('Video playback error');
              onError?.(event);
            },
          },
        });
      } catch (err) {
        console.error('Failed to initialize YouTube player:', err);
        setError('Failed to initialize player');
      }
    }

    // Cleanup
    return () => {
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (err) {
          console.error('Error destroying YouTube player:', err);
        }
        playerInstanceRef.current = null;
      }
    };
  }, [shouldLoadPlayer, apiReady, playerLoaded, videoId, width, height, playerVars]);

  // Handle manual load
  const handleLoad = useCallback(() => {
    setShouldLoad(true);
  }, []);

  // Player methods
  const playerMethods = useMemo(() => ({
    play: () => playerInstanceRef.current?.playVideo(),
    pause: () => playerInstanceRef.current?.pauseVideo(),
    stop: () => playerInstanceRef.current?.stopVideo(),
    seekTo: (seconds: number) => playerInstanceRef.current?.seekTo(seconds),
    setVolume: (volume: number) => playerInstanceRef.current?.setVolume(volume),
    mute: () => playerInstanceRef.current?.mute(),
    unMute: () => playerInstanceRef.current?.unMute(),
    getPlayerState: () => playerInstanceRef.current?.getPlayerState(),
    getCurrentTime: () => playerInstanceRef.current?.getCurrentTime(),
    getDuration: () => playerInstanceRef.current?.getDuration(),
  }), []);

  // Expose player methods via ref
  React.useImperativeHandle(playerRef, () => playerMethods, [playerMethods]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={{ width, height }}>
        <div className="text-center p-4">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setShouldLoad(true);
            }}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={intersectionRef as React.RefObject<HTMLDivElement>}
      className={`relative ${className}`}
      style={{ width, height }}
    >
      {shouldLoadPlayer ? (
        <>
          <div ref={playerRef} className="w-full h-full" />
          {!playerLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Loading player...</p>
              </div>
            </div>
          )}
        </>
      ) : (
        placeholder || <DefaultPlaceholder videoId={videoId} onClick={handleLoad} />
      )}
    </div>
  );
};

// Export with memoization
export default withMemo(OptimizedYouTubePlayer, (prevProps, nextProps) => {
  return (
    prevProps.videoId === nextProps.videoId &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.autoplay === nextProps.autoplay &&
    prevProps.muted === nextProps.muted &&
    prevProps.controls === nextProps.controls &&
    prevProps.loop === nextProps.loop &&
    prevProps.start === nextProps.start &&
    prevProps.end === nextProps.end &&
    prevProps.quality === nextProps.quality &&
    prevProps.lazy === nextProps.lazy &&
    prevProps.preload === nextProps.preload
  );
});

// Export player methods type for external use
export interface YouTubePlayerMethods {
  play: () => void;
  pause: () => void;
  stop: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
}