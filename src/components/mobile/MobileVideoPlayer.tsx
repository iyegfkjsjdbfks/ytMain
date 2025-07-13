import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon 
} from '@heroicons/react/24/outline';

import { useIntersectionObserver } from '../../hooks/usePerformanceOptimization';

import type { Video } from '../../types/core';

interface MobileVideoPlayerProps {
  video: Video;
  autoplay?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  className?: string;
}

const MobileVideoPlayer = memo<MobileVideoPlayerProps>(({
  video,
  autoplay = false,
  onPlay,
  onPause,
  onEnded,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Intersection observer for autoplay on mobile
  const { ref: intersectionRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: '0px',
  });

  // Handle play/pause
  const togglePlay = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        await videoRef.current.pause();
        setIsPlaying(false);
        onPause?.();
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
        onPlay?.();
      }
    } catch (error) {
      console.error('Error toggling video playback:', error);
    }
  }, [isPlaying, onPlay, onPause]);

  // Handle volume/mute
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;

    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  }, [isMuted]);

  // Handle fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  }, [isFullscreen]);

  // Handle seek
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;

    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  // Show controls temporarily
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  // Video event handlers
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      // Update buffered
      const bufferedEnd = videoRef.current.buffered.length > 0 
        ? videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
        : 0;
      setBuffered(bufferedEnd);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onEnded?.();
  }, [onEnded]);

  // Touch handling for mobile
  const handleTouchStart = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  // Autoplay when in view (mobile-friendly)
  useEffect(() => {
    if (autoplay && isIntersecting && !isPlaying && videoRef.current) {
      // Only autoplay if user has interacted with the page
      videoRef.current.play().catch(() => {
        // Autoplay failed, which is expected on mobile
      });
    }
  }, [autoplay, isIntersecting, isPlaying]);

  // Format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        intersectionRef(node);
      }}
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onTouchStart={handleTouchStart}
      onClick={showControlsTemporarily}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.thumbnailUrl}
        className="w-full h-full object-cover"
        playsInline
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Mobile Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="bg-black/50 backdrop-blur-sm rounded-full p-4 text-white hover:bg-black/70 transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <PauseIcon className="w-8 h-8" />
            ) : (
              <PlayIcon className="w-8 h-8 ml-1" />
            )}
          </button>
        </div>

        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={toggleMute}
            className="bg-black/50 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/70 transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <SpeakerXMarkIcon className="w-5 h-5" />
            ) : (
              <SpeakerWaveIcon className="w-5 h-5" />
            )}
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="bg-black/50 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/70 transition-colors"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon className="w-5 h-5" />
            ) : (
              <ArrowsPointingOutIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/30 rounded-lg appearance-none slider-thumb"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)`
              }}
            />
            {/* Buffered indicator */}
            <div 
              className="absolute h-1 bg-white/50 rounded-lg pointer-events-none"
              style={{
                width: `${(buffered / duration) * 100}%`,
                marginTop: '-4px'
              }}
            />
          </div>

          {/* Time Display */}
          <div className="flex justify-between items-center text-white text-sm">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {!duration && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        </div>
      )}
    </div>
  );
});

MobileVideoPlayer.displayName = 'MobileVideoPlayer';

export default MobileVideoPlayer;