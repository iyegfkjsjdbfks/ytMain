import type * as React from 'react';
import {  useState, useRef, useEffect  } from 'react';

import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  Cog6ToothIcon,
  ForwardIcon,
  BackwardIcon,
} from '@heroicons/react/24/outline';

import { logger } from '../../utils/logger';


interface VideoPlayerProps {
  videoId: string;
  src?: string;
  poster?: string;
  title?: string;
  autoplay?: boolean;
  startTime?: number;
  className?: string;
  onReady?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  useYouTube?: boolean;
}

interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  showControls: boolean;
  buffered: number;
  playbackRate: number;
  quality: string;
}

/**
 * Advanced video player component that supports both YouTube embeds and custom video sources
 * with full controls including play/pause, volume, fullscreen, and settings.
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
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
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    showControls: true,
    buffered: 0,
    playbackRate: 1,
    quality: 'auto',
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Move all hooks before conditional returns
  useEffect(() => {
    // Only run for custom video player, not YouTube
    if (useYouTube || (!src && videoId)) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleLoadedMetadata = () => {
      setState(prev => ({ ...prev, duration: video.duration }));
      if (startTime > 0) {
        video.currentTime = startTime;
      }
      onReady?.();
    };

    const handleTimeUpdate = () => {
      const { currentTime } = video;
      const { duration } = video;
      setState(prev => ({ ...prev, currentTime }));
      onTimeUpdate?.(currentTime, duration);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const buffered = (video.buffered.end(0) / video.duration) * 100;
        setState(prev => ({ ...prev, buffered }));
      }
    };

    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true }));
      onPlay?.();
    };

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      onPause?.();
    };

    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      onEnded?.();
    };

    const handleVolumeChange = () => {
      setState(prev => ({
        ...prev,
        volume: video.volume,
        isMuted: video.muted,
      }));
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [onTimeUpdate, onPlay, onPause, onEnded, onReady, startTime, useYouTube, src, videoId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setState(prev => ({
        ...prev,
        isFullscreen: !!document.fullscreenElement,
      }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // If using YouTube, render iframe
  if (useYouTube || (!src && videoId)) {
    const videoUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&start=${Math.floor(startTime)}&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&controls=1&rel=0&modestbranding=1&playsinline=1&fs=1&cc_load_policy=1&iv_load_policy=3&disablekb=0&widget_referrer=${encodeURIComponent(window.location.origin)}`;

    return (
      <div className={`video-player-container ${className}`}>
        <div className="video-player-wrapper relative">
          <iframe
            src={videoUrl}
            title={title || `Video ${videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full aspect-video"
            loading="lazy"
            frameBorder="0"
            onLoad={onReady}
          />
        </div>
      </div>
    );
  }

  // Rest of the component for custom video player
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) {
return;
}

    if (state.isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const seek = (time: number) => {
    const video = videoRef.current;
    if (!video) {
return;
}

    video.currentTime = Math.max(0, Math.min(time, state.duration));
  };

  const setVolume = (volume: number) => {
    const video = videoRef.current;
    if (!video) {
return;
}

    video.volume = Math.max(0, Math.min(1, volume));
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) {
return;
}

    video.muted = !video.muted;
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) {
return;
}

    try {
      if (state.isFullscreen) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch (error) {
      logger.error('Fullscreen error:', error);
    }
  };

  const setPlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) {
return;
}

    video.playbackRate = rate;
    setState(prev => ({ ...prev, playbackRate: rate }));
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressRef.current;
    if (!progressBar) {
return;
}

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * state.duration;
    seek(newTime);
  };

  const showControlsTemporarily = () => {
    setState(prev => ({ ...prev, showControls: true }));

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (state.isPlaying) {
        setState(prev => ({ ...prev, showControls: false }));
      }
    }, 3000);
  };

  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
  const bufferedPercentage = state.buffered;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black group ${className} ${state.isFullscreen ? 'fixed inset-0 z-50' : 'aspect-video'}`}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => {
        if (state.isPlaying) {
          setState(prev => ({ ...prev, showControls: false }));
        }
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        autoPlay={autoplay}
        playsInline
        onClick={togglePlay}
      >
        {src && <source src={src} type="video/mp4" />}
        Your browser does not support the video tag.
      </video>

      {/* Loading Overlay */}
      {!state.duration && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      )}

      {/* Play Button Overlay */}
      {!state.isPlaying && state.duration > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-4 transition-all duration-200 transform hover:scale-110"
          >
            <PlayIcon className="w-12 h-12 text-white ml-1" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 transition-opacity duration-300 ${
          state.showControls || !state.isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <div
            ref={progressRef}
            className="relative h-1 bg-white bg-opacity-30 rounded-full cursor-pointer hover:h-2 transition-all duration-200"
            onClick={handleProgressClick}
          >
            {/* Buffered Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-white bg-opacity-50 rounded-full"
              style={{ width: `${bufferedPercentage}%` }}
            />
            {/* Current Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-red-600 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
            {/* Progress Handle */}
            <div
              className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ left: `${progressPercentage}%`, marginLeft: '-6px' }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-red-400 transition-colors p-1"
            >
              {state.isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6" />
              )}
            </button>

            {/* Skip Backward */}
            <button
              onClick={() => seek(state.currentTime - 10)}
              className="text-white hover:text-red-400 transition-colors p-1"
            >
              <BackwardIcon className="w-5 h-5" />
            </button>

            {/* Skip Forward */}
            <button
              onClick={() => seek(state.currentTime + 10)}
              className="text-white hover:text-red-400 transition-colors p-1"
            >
              <ForwardIcon className="w-5 h-5" />
            </button>

            {/* Volume */}
            <div
              className="flex items-center gap-2 relative"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                onClick={toggleMute}
                className="text-white hover:text-red-400 transition-colors p-1"
              >
                {state.isMuted || state.volume === 0 ? (
                  <SpeakerXMarkIcon className="w-5 h-5" />
                ) : (
                  <SpeakerWaveIcon className="w-5 h-5" />
                )}
              </button>

              {/* Volume Slider */}
              {showVolumeSlider && (
                <div className="absolute bottom-full left-0 mb-2 bg-black bg-opacity-80 p-2 rounded">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={state.isMuted ? 0 : state.volume}
                    onChange={(e) => {
                      const volume = parseFloat(e.target.value);
                      setVolume(volume);
                      if (volume > 0 && state.isMuted) {
                        toggleMute();
                      }
                    }}
                    className="w-20 h-1 bg-white bg-opacity-30 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Time Display */}
            <span className="text-white text-sm font-mono">
              {formatTime(state.currentTime)} / {formatTime(state.duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Settings */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:text-red-400 transition-colors p-1"
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </button>

              {/* Settings Menu */}
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-90 rounded-lg p-3 min-w-48">
                  <div className="space-y-3">
                    {/* Playback Speed */}
                    <div>
                      <label htmlFor="playback-speed" className="text-white text-sm font-medium block mb-1">
                        Playback Speed
                      </label>
                      <select
                        id="playback-speed"
                        value={state.playbackRate}
                        onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                        className="w-full bg-white bg-opacity-20 text-white rounded px-2 py-1 text-sm"
                      >
                        <option value={0.25}>0.25x</option>
                        <option value={0.5}>0.5x</option>
                        <option value={0.75}>0.75x</option>
                        <option value={1}>Normal</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={1.75}>1.75x</option>
                        <option value={2}>2x</option>
                      </select>
                    </div>

                    {/* Quality */}
                    <div>
                      <label htmlFor="video-quality" className="text-white text-sm font-medium block mb-1">
                        Quality
                      </label>
                      <select
                        id="video-quality"
                        value={state.quality}
                        onChange={(e) => setState(prev => ({ ...prev, quality: e.target.value }))}
                        className="w-full bg-white bg-opacity-20 text-white rounded px-2 py-1 text-sm"
                      >
                        <option value="auto">Auto</option>
                        <option value="1080p">1080p</option>
                        <option value="720p">720p</option>
                        <option value="480p">480p</option>
                        <option value="360p">360p</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-red-400 transition-colors p-1"
            >
              {state.isFullscreen ? (
                <ArrowsPointingInIcon className="w-5 h-5" />
              ) : (
                <ArrowsPointingOutIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Title Overlay */}
      {title && state.showControls && (
        <div className="absolute top-4 left-4 right-4">
          <h2 className="text-white text-lg font-medium truncate bg-black bg-opacity-50 px-3 py-2 rounded">
            {title}
          </h2>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
