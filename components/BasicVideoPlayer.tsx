import React, { useRef, useState, useEffect } from 'react';

interface BasicVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoplay?: boolean;
  muted?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

/**
 * Basic Video Player - Simple HTML5 video player with essential controls
 *
 * This component provides a lightweight video player with basic functionality:
 * - Standard HTML5 video controls
 * - Play/pause, volume, seek, fullscreen
 * - Minimal overhead and high performance
 * - Cross-browser compatibility
 */
const BasicVideoPlayer: React.FC<BasicVideoPlayerProps> = ({
  src,
  poster,
  title,
  autoplay = false,
  muted = false,
  onTimeUpdate,
  onEnded,
  onError,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
return;
}

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
      onError?.('Failed to load video');
    };
    const handleTimeUpdate = () => {
      onTimeUpdate?.(video.currentTime);
    };
    const handleEnded = () => {
      onEnded?.();
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onTimeUpdate, onEnded, onError]);

  if (hasError) {
    return (
      <div className={`bg-gray-900 rounded-lg flex items-center justify-center h-96 ${className}`}>
        <div className="text-center text-white">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Video Error</h3>
          <p className="text-gray-300">Failed to load video content</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
            <p>Loading video...</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        autoPlay={autoplay}
        muted={muted}
        className="w-full h-auto"
        style={{ aspectRatio: '16/9' }}
        preload="metadata"
      >
        <p className="text-white p-4">
          Your browser does not support the video tag.
          <a href={src} className="text-blue-400 underline ml-2">
            Download the video
          </a>
        </p>
      </video>

      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="text-white text-sm font-medium truncate">{title}</h3>
        </div>
      )}
    </div>
  );
};

export default BasicVideoPlayer;