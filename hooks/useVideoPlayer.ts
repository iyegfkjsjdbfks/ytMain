import { useState, useRef, useEffect, useCallback } from 'react';

interface VideoPlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isFullscreen: boolean;
  isLoading: boolean;
  error: string | null;
  playbackRate: number;
  quality: string;
  buffered: number;
}

interface VideoPlayerOptions {
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  playsinline?: boolean;
  initialVolume?: number;
  initialPlaybackRate?: number;
  initialQuality?: string;
}

interface UseVideoPlayerReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  state: VideoPlayerState;
  actions: {
    play: () => Promise<void>;
    pause: () => void;
    togglePlayPause: () => Promise<void>;
    mute: () => void;
    unmute: () => void;
    toggleMute: () => void;
    setVolume: (volume: number) => void;
    seek: (time: number) => void;
    setPlaybackRate: (rate: number) => void;
    setQuality: (quality: string) => void;
    enterFullscreen: () => Promise<void>;
    exitFullscreen: () => Promise<void>;
    toggleFullscreen: () => Promise<void>;
    reset: () => void;
  };
  events: {
    onLoadStart: () => void;
    onLoadedMetadata: () => void;
    onCanPlay: () => void;
    onPlay: () => void;
    onPause: () => void;
    onTimeUpdate: () => void;
    onDurationChange: () => void;
    onVolumeChange: () => void;
    onError: (error: Event) => void;
    onEnded: () => void;
    onProgress: () => void;
    onWaiting: () => void;
    onCanPlayThrough: () => void;
  };
}

/**
 * Custom hook for video player functionality
 * 
 * Provides comprehensive video player state management and controls:
 * - Play/pause functionality
 * - Volume and mute controls
 * - Seeking and time tracking
 * - Fullscreen support
 * - Playback rate control
 * - Quality selection
 * - Loading and error states
 * - Event handlers for all video events
 * 
 * Reduces code duplication across video player components
 */
export const useVideoPlayer = (options: VideoPlayerOptions = {}): UseVideoPlayerReturn => {
  const {
    autoplay = false,
    muted = false,
    loop = false,
    preload = 'metadata',
    playsinline = true,
    initialVolume = 1,
    initialPlaybackRate = 1,
    initialQuality = 'auto'
  } = options;

  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    isMuted: muted,
    volume: initialVolume,
    currentTime: 0,
    duration: 0,
    isFullscreen: false,
    isLoading: false,
    error: null,
    playbackRate: initialPlaybackRate,
    quality: initialQuality,
    buffered: 0
  });

  // Play video
  const play = useCallback(async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        // Clear any previous errors on successful play
        setState(prev => ({ ...prev, error: null }));
      } catch (error) {
        console.error('Error playing video:', error);
        // Don't set persistent error for autoplay failures - they're expected
        // Only set error for actual video loading/playback issues
        if (error instanceof Error && !error.message.includes('user didn\'t interact')) {
          setState(prev => ({ ...prev, error: 'Failed to play video' }));
        }
      }
    }
  }, []);

  // Pause video
  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback(async () => {
    if (state.isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [state.isPlaying, play, pause]);

  // Mute video
  const mute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
    }
  }, []);

  // Unmute video
  const unmute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = false;
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (state.isMuted) {
      unmute();
    } else {
      mute();
    }
  }, [state.isMuted, mute, unmute]);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  // Seek to time
  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(state.duration, time));
    }
  }, [state.duration]);

  // Set playback rate
  const setPlaybackRate = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setState(prev => ({ ...prev, playbackRate: rate }));
    }
  }, []);

  // Set quality (placeholder - implementation depends on video source)
  const setQuality = useCallback((quality: string) => {
    setState(prev => ({ ...prev, quality }));
    // Implementation would depend on video source (HLS, DASH, etc.)
  }, []);

  // Enter fullscreen
  const enterFullscreen = useCallback(async () => {
    if (videoRef.current && videoRef.current.requestFullscreen) {
      try {
        await videoRef.current.requestFullscreen();
      } catch (error) {
        console.error('Error entering fullscreen:', error);
      }
    }
  }, []);

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.error('Error exiting fullscreen:', error);
      }
    }
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (state.isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [state.isFullscreen, enterFullscreen, exitFullscreen]);

  // Reset video
  const reset = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      pause();
    }
  }, [pause]);

  // Event handlers
  const events = {
    onLoadStart: useCallback(() => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    }, []),

    onLoadedMetadata: useCallback(() => {
      if (videoRef.current) {
        setState(prev => ({
          ...prev,
          duration: videoRef.current?.duration || 0,
          volume: videoRef.current?.volume || 1,
          isMuted: videoRef.current?.muted || false
        }));
      }
    }, []),

    onCanPlay: useCallback(() => {
      setState(prev => ({ ...prev, isLoading: false }));
    }, []),

    onPlay: useCallback(() => {
      setState(prev => ({ ...prev, isPlaying: true }));
    }, []),

    onPause: useCallback(() => {
      setState(prev => ({ ...prev, isPlaying: false }));
    }, []),

    onTimeUpdate: useCallback(() => {
      if (videoRef.current) {
        setState(prev => ({ ...prev, currentTime: videoRef.current?.currentTime || 0 }));
      }
    }, []),

    onDurationChange: useCallback(() => {
      if (videoRef.current) {
        setState(prev => ({ ...prev, duration: videoRef.current?.duration || 0 }));
      }
    }, []),

    onVolumeChange: useCallback(() => {
      if (videoRef.current) {
        setState(prev => ({
          ...prev,
          volume: videoRef.current?.volume || 0,
          isMuted: videoRef.current?.muted || false
        }));
      }
    }, []),

    onError: useCallback((error: Event) => {
      console.error('Video error:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'An error occurred while loading the video',
        isLoading: false 
      }));
    }, []),

    onEnded: useCallback(() => {
      setState(prev => ({ ...prev, isPlaying: false }));
    }, []),

    onProgress: useCallback(() => {
      if (videoRef.current && videoRef.current.buffered.length > 0) {
        const buffered = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        setState(prev => ({ ...prev, buffered }));
      }
    }, []),

    onWaiting: useCallback(() => {
      setState(prev => ({ ...prev, isLoading: true }));
    }, []),

    onCanPlayThrough: useCallback(() => {
      setState(prev => ({ ...prev, isLoading: false }));
    }, [])
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setState(prev => ({ ...prev, isFullscreen: !!document.fullscreenElement }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Initialize video element
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.autoplay = autoplay;
      video.muted = muted;
      video.loop = loop;
      video.preload = preload;
      video.playsInline = playsinline;
      video.volume = initialVolume;
      video.playbackRate = initialPlaybackRate;
    }
  }, [autoplay, muted, loop, preload, playsinline, initialVolume, initialPlaybackRate]);

  return {
    videoRef,
    state,
    actions: {
      play,
      pause,
      togglePlayPause,
      mute,
      unmute,
      toggleMute,
      setVolume,
      seek,
      setPlaybackRate,
      setQuality,
      enterFullscreen,
      exitFullscreen,
      toggleFullscreen,
      reset
    },
    events
  };
};

export default useVideoPlayer;