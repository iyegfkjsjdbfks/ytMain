import { useState, useRef, useEffect } from 'react';

import { useVideoPlayer } from '../../hooks';
import { LoadingSpinner, ErrorMessage } from '../ui';

import VideoControls from './VideoControls';

import type { VideoQuality, Subtitle } from './VideoSettings';

interface Chapter {
  title: string;
  startTime: number;
  endTime: number;
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
  qualities?: VideoQuality[];
  subtitles?: Subtitle[];
  chapters?: Chapter[];
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  qualities = [],
  subtitles = [],
  autoplay = false,
  muted = false,
  loop = false,
  onTimeUpdate,
  onEnded,
  onError,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [currentQuality, setCurrentQuality] = useState(qualities[0]?.value || 'auto');
  const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null);
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  const { videoRef, state, actions, events } = useVideoPlayer({
    autoplay,
    muted,
    loop,
    playsinline: true,
  });

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }

    if (showControls && state.isPlaying) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      setControlsTimeout(timeout);
    }

    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [showControls, state.isPlaying]);

  // Handle mouse movement to show controls
  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    if (state.isPlaying) {
      setShowControls(false);
    }
  };

  const handleFullscreenToggle = async () => {
    if (!containerRef.current) {
return;
}

    try {
      if (isFullscreen) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleQualityChange = (quality: string) => {
    setCurrentQuality(quality);
    // In a real implementation, you would switch video sources here
    };

  const handleSubtitleChange = (subtitle: string | null) => {
    setCurrentSubtitle(subtitle);
    // In a real implementation, you would enable/disable subtitle tracks here
    };

  // Custom event handlers
  const handleTimeUpdate = () => {
    events.onTimeUpdate();
    onTimeUpdate?.(state.currentTime);
  };

  const handleEnded = () => {
    events.onEnded();
    onEnded?.();
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    events.onError(e.nativeEvent);
    onError?.(state.error || 'Video playback error');
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-black overflow-hidden group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video Element - Disabled to prevent loading errors */}
      {false && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          onPlay={events.onPlay}
          onPause={events.onPause}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={events.onLoadedMetadata}
          onVolumeChange={events.onVolumeChange}
          onEnded={handleEnded}
          onError={handleError}
          onWaiting={events.onWaiting}
          onCanPlay={events.onCanPlay}
          className="w-full h-full object-contain"
          onClick={() => actions.togglePlayPause()}
        />
      )}

      {/* Loading Indicator */}
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <LoadingSpinner size="lg" color="white" />
        </div>
      )}

      {/* Error State */}
      {state.error && (
        <ErrorMessage
          message={state.error}
          onRetry={() => actions.play()}
          variant="overlay"
        />
      )}

      {/* Video Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${
          showControls || !state.isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <VideoControls
          isPlaying={state.isPlaying}
          isMuted={state.isMuted}
          isFullscreen={isFullscreen}
          volume={state.volume}
          currentTime={state.currentTime}
          duration={state.duration}
          playbackRate={playbackRate}
          onPlayPause={actions.togglePlayPause}
          onMuteToggle={actions.toggleMute}
          onVolumeChange={actions.setVolume}
          onSeek={handleSeek}
          onFullscreenToggle={handleFullscreenToggle}
          onPlaybackRateChange={handlePlaybackRateChange}
          onSettingsToggle={() => setShowSettings(!showSettings)}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
export type { VideoQuality, Subtitle, Chapter };