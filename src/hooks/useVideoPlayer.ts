import { useState, useRef, useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';

export interface VideoPlayerOptions {
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playbackRate?: number;
  volume?: number;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onVolumeChange?: (volume: number) => void;
  onPlaybackRateChange?: (rate: number) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  onError?: (error: Error) => void;
}

export interface VideoPlayerState {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  isMuted: boolean;
  volume: number;
  isFullscreen: boolean;
  isPictureInPicture: boolean;
  playbackRate: number;
  isLoading: boolean;
  error: Error | null;
}

export interface VideoPlayerControls {
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => Promise<void>;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unmute: () => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  requestFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
  requestPictureInPicture: () => Promise<void>;
  exitPictureInPicture: () => Promise<void>;
  togglePictureInPicture: () => Promise<void>;
  setVideoRef: (element: HTMLVideoElement | null) => void;
}

export const useVideoPlayer = (options: VideoPlayerOptions = {}): VideoPlayerState & VideoPlayerControls => {
  const {
    autoplay = false,
    muted = false,
    loop = false,
    controls = false,
    playbackRate: initialPlaybackRate = 1,
    volume: initialVolume = 1,
    onEnded,
    onTimeUpdate,
    onDurationChange,
    onPlay,
    onPause,
    onVolumeChange,
    onPlaybackRateChange,
    onFullscreenChange,
    onError,
  } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    duration: 0,
    currentTime: 0,
    isMuted: muted,
    volume: initialVolume,
    isFullscreen: false,
    isPictureInPicture: false,
    playbackRate: initialPlaybackRate,
    isLoading: true,
    error: null,
  });

  // Set up event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
return;
}

    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true }));
      onPlay?.();
    };

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      onPause?.();
    };

    const handleTimeUpdate = () => {
      if (video) {
        setState(prev => ({ ...prev, currentTime: video.currentTime }));
        onTimeUpdate?.(video.currentTime);
      }
    };

    const handleDurationChange = () => {
      if (video) {
        setState(prev => ({ ...prev, duration: video.duration }));
        onDurationChange?.(video.duration);
      }
    };

    const handleVolumeChange = () => {
      if (video) {
        setState(prev => ({
          ...prev,
          volume: video.volume,
          isMuted: video.muted,
        }));
        onVolumeChange?.(video.volume);
      }
    };

    const handlePlaybackRateChange = () => {
      if (video) {
        setState(prev => ({ ...prev, playbackRate: video.playbackRate }));
        onPlaybackRateChange?.(video.playbackRate);
      }
    };

    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      setState(prev => ({ ...prev, isFullscreen }));
      onFullscreenChange?.(isFullscreen);
    };

    const handleError = () => {
      const error = new Error(`Video error: ${video.error?.message || 'Unknown error'}`);
      setState(prev => ({ ...prev, error, isLoading: false }));
      onError?.(error);
    };

    const handleLoadedData = () => {
      setState(prev => ({ ...prev, isLoading: false }));
    };

    const handleWaiting = () => {
      setState(prev => ({ ...prev, isLoading: true }));
    };

    const handlePlaying = () => {
      setState(prev => ({ ...prev, isLoading: false }));
    };

    // Set initial state
    video.autoplay = autoplay;
    video.muted = muted;
    video.loop = loop;

    if (controls) {
      video.controls = true;
    }

    // Add event listeners
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('ratechange', handlePlaybackRateChange);
    video.addEventListener('enterpictureinpicture', () =>
      setState(prev => ({ ...prev, isPictureInPicture: true })),
    );
    video.addEventListener('leavepictureinpicture', () =>
      setState(prev => ({ ...prev, isPictureInPicture: false })),
    );
    video.addEventListener('error', handleError);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('ended', () => onEnded?.());

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Clean up
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('ratechange', handlePlaybackRateChange);
      video.removeEventListener('enterpictureinpicture', () =>
        setState(prev => ({ ...prev, isPictureInPicture: true })),
      );
      video.removeEventListener('leavepictureinpicture', () =>
        setState(prev => ({ ...prev, isPictureInPicture: false })),
      );
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('ended', () => onEnded?.());

      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [
    autoplay,
    controls,
    loop,
    muted,
    onEnded,
    onPause,
    onPlay,
    onDurationChange,
    onTimeUpdate,
    onVolumeChange,
    onPlaybackRateChange,
    onFullscreenChange,
    onError,
  ]);

  // Play the video
  const play = useCallback(async () => {
    try {
      if (videoRef.current) {
        await videoRef.current.play();
      }
    } catch (error) {
      // Handle AbortError gracefully - this is common when play() is interrupted by pause()
      if (error instanceof DOMException && error.name === 'AbortError') {
        // This is expected behavior, don't log as error
        logger.debug('Play request was interrupted:', error.message);
        setState(prev => ({ ...prev, isPlaying: false }));
      } else {
        // More specific error handling for network and cache issues
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.warn('Video playback issue:', errorMessage);

        // Don't treat network/cache errors as critical errors
        if (errorMessage.includes('CACHE_OPERATION_NOT_SUPPORTED') ||
            errorMessage.includes('ERR_NETWORK')) {
          logger.info('Video may be temporarily unavailable due to network/cache issues');
          setState(prev => ({ ...prev, isPlaying: false }));
        } else {
          setState(prev => ({ ...prev, error: error as Error }));
          onError?.(error as Error);
        }
      }
    }
  }, [onError]);

  // Pause the video
  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  // Toggle play/pause
  const togglePlay = useCallback(async () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        await play();
      } else {
        pause();
      }
    }
  }, [play, pause]);

  // Seek to a specific time
  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  // Set volume (0-1)
  const setVolume = useCallback((volume: number) => {
    if (videoRef.current) {
      const newVolume = Math.min(1, Math.max(0, volume));
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setState(prev => ({
        ...prev,
        volume: newVolume,
        isMuted: newVolume === 0,
      }));
      onVolumeChange?.(newVolume);
    }
  }, [onVolumeChange]);

  // Mute the video
  const mute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      setState(prev => ({ ...prev, isMuted: true }));
    }
  }, []);

  // Unmute the video
  const unmute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setState(prev => ({ ...prev, isMuted: false }));
    }
  }, []);

  // Toggle mute/unmute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setState(prev => ({ ...prev, isMuted: videoRef.current?.muted ?? false }));
    }
  }, []);

  // Set playback rate
  const setPlaybackRate = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setState(prev => ({ ...prev, playbackRate: rate }));
      onPlaybackRateChange?.(rate);
    }
  }, [onPlaybackRateChange]);

  // Request fullscreen
  const requestFullscreen = useCallback(async () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        await videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        await (videoRef.current as any).webkitRequestFullscreen();
      } else if ((videoRef.current as any).msRequestFullscreen) {
        await (videoRef.current as any).msRequestFullscreen();
      }
    }
  }, []);

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      await (document as any).msExitFullscreen();
    }
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (state.isFullscreen) {
      await exitFullscreen();
    } else {
      await requestFullscreen();
    }
  }, [state.isFullscreen, exitFullscreen, requestFullscreen]);

  // Request Picture-in-Picture
  const requestPictureInPicture = useCallback(async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        await videoRef.current.requestPictureInPicture();
      } catch (error) {
        logger.error('Error entering Picture-in-Picture:', error);
        setState(prev => ({ ...prev, error: error as Error }));
        onError?.(error as Error);
      }
    }
  }, [onError]);

  // Exit Picture-in-Picture
  const exitPictureInPicture = useCallback(async () => {
    if (document.pictureInPictureElement) {
      try {
        await document.exitPictureInPicture();
      } catch (error) {
        logger.error('Error exiting Picture-in-Picture:', error);
        setState(prev => ({ ...prev, error: error as Error }));
        onError?.(error as Error);
      }
    }
  }, [onError]);

  // Toggle Picture-in-Picture
  const togglePictureInPicture = useCallback(async () => {
    if (state.isPictureInPicture) {
      await exitPictureInPicture();
    } else {
      await requestPictureInPicture();
    }
  }, [state.isPictureInPicture, exitPictureInPicture, requestPictureInPicture]);

  // Set video element reference
  const setVideoRef = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
  }, []);

  return {
    // State
    ...state,

    // Controls
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    mute,
    unmute,
    toggleMute,
    setPlaybackRate,
    requestFullscreen,
    exitFullscreen,
    toggleFullscreen,
    requestPictureInPicture,
    exitPictureInPicture,
    togglePictureInPicture,
    setVideoRef,
  };
};
