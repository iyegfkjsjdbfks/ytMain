import type { Video } from '../types';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';

import { logger } from '../utils/logger';

export interface VideoPlayerOptions {
  autoplay?: boolean;
  muted?: boolean;
  onTimeUpdate?: (currentTime: any) => void;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
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
  buffered?: TimeRanges;
  setQuality?: (quality: any) => void
}

export interface VideoPlayerControls {
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => Promise<void>;
  seek: (time: any) => void;
  setVolume: (volume: any) => void;
  mute: () => void;
  unmute: () => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: any) => void;
  requestFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
  requestPictureInPicture: () => Promise<void>;
  exitPictureInPicture: () => Promise<void>;
  togglePictureInPicture: () => Promise<void>;
  setVideoRef: (element: HTMLVideoElement | null) => void;
  setQuality: (quality: any) => void
}

export const useVideoPlayer: any = (;
  options: VideoPlayerOptions = {},
): VideoPlayerState & VideoPlayerControls => {
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
    onError } = options;

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
    error: null });

  // Set up event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handlePlay: any = () => {
      setState(prev => ({ ...prev as any, isPlaying: true }));
      onPlay?.();
    };

    const handlePause: any = () => {
      setState(prev => ({ ...prev as any, isPlaying: false }));
      onPause?.();
    };

    const handleTimeUpdate: any = () => {
      if (video as any) {
        setState(prev => ({ ...prev as any, currentTime: video.currentTime }));
        onTimeUpdate?.(video.currentTime);
      }
    };

    const handleDurationChange: any = () => {
      if (video as any) {
        setState(prev => ({ ...prev as any, duration: video.duration }));
        onDurationChange?.(video.duration);
      }
    };

    const handleVolumeChange: any = () => {
      if (video as any) {
        setState(prev => ({
          ...prev as any,
          volume: video.volume,
          isMuted: video.muted }));
        onVolumeChange?.(video.volume);
      }
    };

    const handlePlaybackRateChange: any = () => {
      if (video as any) {
        setState(prev => ({ ...prev as any, playbackRate: video.playbackRate }));
        onPlaybackRateChange?.(video.playbackRate);
      }
    };

    const handleFullscreenChange: any = () => {
      const isFullscreen = !!document.fullscreenElement;
      setState(prev => ({ ...prev as any, isFullscreen }));
      onFullscreenChange?.(isFullscreen);
    };

    const handleError: any = () => {
      const error = new Error(;
        `Video error: ${video.error?.message || 'Unknown error'}`,
      );
      setState(prev => ({ ...prev as any, error, isLoading: false }));
      onError?.(error);
    };

    const handleLoadedData: any = () => {
      setState(prev => ({ ...prev as any, isLoading: false }));
    };

    const handleWaiting: any = () => {
      setState(prev => ({ ...prev as any, isLoading: true }));
    };

    const handlePlaying: any = () => {
      setState(prev => ({ ...prev as any, isLoading: false }));
    };

    // Set initial state
    video.autoplay = autoplay;
    video.muted = muted;
    video.loop = loop;

    if (controls as any) {
      video.controls = true;
    }

    // Add event listeners
    video.addEventListener('play', handlePlay as EventListener);
    video.addEventListener('pause', handlePause as EventListener);
    video.addEventListener('timeupdate', handleTimeUpdate as EventListener);
    video.addEventListener('durationchange', handleDurationChange as EventListener);
    video.addEventListener('volumechange', handleVolumeChange as EventListener);
    video.addEventListener('ratechange', handlePlaybackRateChange as EventListener);
    video.addEventListener('enterpictureinpicture', ( as EventListener) =>
      setState(prev => ({ ...prev as any, isPictureInPicture: true }))
    );
    video.addEventListener('leavepictureinpicture', ( as EventListener) =>
      setState(prev => ({ ...prev as any, isPictureInPicture: false }))
    );
    video.addEventListener('error', handleError as EventListener);
    video.addEventListener('loadeddata', handleLoadedData as EventListener);
    video.addEventListener('waiting', handleWaiting as EventListener);
    video.addEventListener('playing', handlePlaying as EventListener);
    video.addEventListener('ended', ( as EventListener) => onEnded?.());

    document.addEventListener('fullscreenchange', handleFullscreenChange as EventListener);

    // Clean up
    return () => {
      video.removeEventListener('play', handlePlay as EventListener);
      video.removeEventListener('pause', handlePause as EventListener);
      video.removeEventListener('timeupdate', handleTimeUpdate as EventListener);
      video.removeEventListener('durationchange', handleDurationChange as EventListener);
      video.removeEventListener('volumechange', handleVolumeChange as EventListener);
      video.removeEventListener('ratechange', handlePlaybackRateChange as EventListener);
      video.removeEventListener('enterpictureinpicture', ( as EventListener) =>
        setState(prev => ({ ...prev as any, isPictureInPicture: true }))
      );
      video.removeEventListener('leavepictureinpicture', ( as EventListener) =>
        setState(prev => ({ ...prev as any, isPictureInPicture: false }))
      );
      video.removeEventListener('error', handleError as EventListener);
      video.removeEventListener('loadeddata', handleLoadedData as EventListener);
      video.removeEventListener('waiting', handleWaiting as EventListener);
      video.removeEventListener('playing', handlePlaying as EventListener);
      video.removeEventListener('ended', ( as EventListener) => onEnded?.());

      document.removeEventListener('fullscreenchange', handleFullscreenChange as EventListener);
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
    onError
  ]);

  // Play the video
  const play = useCallback(async (): Promise<void> => {
    try {
      if (videoRef.current) {
        await videoRef.current.play();
      }
    } catch (error: any) {
      // Handle AbortError gracefully - this is common when play() is interrupted by pause()
      if (error instanceof DOMException && error.name === 'AbortError') {
        // This is expected behavior, don't log as error
        logger.debug('Play request was interrupted:', error.message);
        setState(prev => ({ ...prev as any, isPlaying: false }));
      } else {
        // More specific error handling for network and cache issues
        const errorMessage =;
          error instanceof Error ? error.message : String(error);
        logger.warn('Video playback issue:', errorMessage);

        // Don't treat network/cache errors as critical errors
        if (
          errorMessage.includes('CACHE_OPERATION_NOT_SUPPORTED') ||
          errorMessage.includes('ERR_NETWORK')
        ) {
          logger.info(
            'Video may be temporarily unavailable due to network/cache issues',
          );
          setState(prev => ({ ...prev as any, isPlaying: false }));
        } else {
          setState(prev => ({ ...prev as any, error: error as Error }));
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
  const toggle = useCallback(async (): Promise<void> => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        await play();
      } else {
        pause();
      }
    }
  }, [play, pause]);

  // Seek to a specific time
  const seek = useCallback((time: any) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setState(prev => ({ ...prev as any, currentTime: time }));
    }
  }, []);

  // Set volume (0-1)
  const setVolume = useCallback((volume: any) => {
      if (videoRef.current) {
        const newVolume = Math.min(1, Math.max(0, volume));
        videoRef.current.volume = newVolume;
        videoRef.current.muted = newVolume === 0;
        setState(prev => ({
          ...prev as any,
          volume: newVolume,
          isMuted: newVolume === 0 }));
        onVolumeChange?.(newVolume);
      }
    },
    [onVolumeChange]
  );

  // Mute the video
  const mute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      setState(prev => ({ ...prev as any, isMuted: true }));
    }
  }, []);

  // Unmute the video
  const unmute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setState(prev => ({ ...prev as any, isMuted: false }));
    }
  }, []);

  // Toggle mute/unmute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setState(prev => ({
        ...prev as any,
        isMuted: videoRef.current?.muted ?? false }));
    }
  }, []);

  // Set playback rate
  const setPlaybackRate = useCallback((rate: any) => {
      if (videoRef.current) {
        videoRef.current.playbackRate = rate;
        setState(prev => ({ ...prev as any, playbackRate: rate }));
        onPlaybackRateChange?.(rate);
      }
    },
    [onPlaybackRateChange]
  );

  // Request fullscreen
  const requestFullscreen = useCallback(async (): Promise<void> => {
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
  const exitFullscreen = useCallback(async (): Promise<void> => {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      await (document as any).msExitFullscreen();
    }
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async (): Promise<void> => {
    if (state.isFullscreen) {
      await exitFullscreen();
    } else {
      await requestFullscreen();
    }
  }, [state.isFullscreen, exitFullscreen, requestFullscreen]);

  // Request Picture-in-Picture
  const requestPictureInPicture = useCallback(async (): Promise<void> => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        await videoRef.current.requestPictureInPicture();
      } catch (error: any) {
        logger.error('Error entering Picture-in-Picture:', error);
        setState(prev => ({ ...prev as any, error: error as Error }));
        onError?.(error as Error);
      }
    }
  }, [onError]);

  // Exit Picture-in-Picture
  const exitPictureInPicture = useCallback(async (): Promise<void> => {
    if (document.pictureInPictureElement) {
      try {
        await document.exitPictureInPicture();
      } catch (error: any) {
        logger.error('Error exiting Picture-in-Picture:', error);
        setState(prev => ({ ...prev as any, error: error as Error }));
        onError?.(error as Error);
      }
    }
  }, [onError]);

  // Toggle Picture-in-Picture
  const togglePictureInPicture = useCallback(async (): Promise<void> => {
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
    videoRef,
    state: {
      isPlaying,
      isMuted,
      volume,
      currentTime,
      duration,
      isLoading,
      error },
    actions: {
      play,
      pause,
      toggle,
      mute,
      unmute,
      toggleMute,
      setVolume,
      setPlaybackRate,
      toggleFullscreen,
      togglePictureInPicture,
      setVideoRef,
      seek,
      reset } };
};
