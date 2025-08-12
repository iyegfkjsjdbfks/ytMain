import React, { useEffect, useCallback, useRef, useState } from 'react';
import type { Video } from '../types';
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
 buffered: number
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
 onTimeUpdate?: ((currentTime: any) => void) | undefined;
 onEnded?: (() => void) | undefined;
 onPlay?: (() => void) | undefined;
 onPause?: (() => void) | undefined;
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
 setVolume: (volume: any) => void;
 seek: (time: any) => void;
 setPlaybackRate: (rate: any) => void;
 setQuality: (quality: any) => void;
 enterFullscreen: () => Promise<void>;
 exitFullscreen: () => Promise<void>;
 toggleFullscreen: () => Promise<void>;
 reset: () => void
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
 onError: (error: Error) => void;
 onEnded: () => void;
 onProgress: () => void;
 onWaiting: () => void;
 onCanPlayThrough: () => void
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
export const useVideoPlayer: any = (,
 options: VideoPlayerOptions = {}
): UseVideoPlayerReturn => {
 const {
 autoplay = false,
 muted = false,
 loop = false,
 preload = 'metadata',
 playsinline = true,
 initialVolume = 1,
 initialPlaybackRate = 1,
 initialQuality = 'auto' } = options;

 const videoRef = useRef<HTMLVideoElement>(null);
 const [state, setState] = useState<VideoPlayerState>({
 isPlaying: false,
 isMuted: muted,
 volume: initialVolume,
 currentTime: 0,
 duration: 0,
 isFullscreen: false,
 isLoading: true,
 error: null,
 playbackRate: initialPlaybackRate,
 quality: initialQuality,
 buffered: 0 });

 // Play function
 const play = useCallback(async (): Promise<void> => {
 const video = videoRef.current;
 if (!video) {
 return;
 }

 try {
 await video.play();
 setState(prev => ({ ...prev as any, isPlaying: true, error: null }));
 } catch (error: any) {
 // Handle AbortError gracefully - this is common when play() is interrupted by pause()
 if (error instanceof DOMException && error.name === 'AbortError') {
 // This is expected behavior, don't log as error
 (console as any).debug('Play request was interrupted:', error.message);
 setState(prev => ({ ...prev as any, isPlaying: false }));
 } else {
 // More specific error handling for network and cache issues
 const errorMessage =
 error instanceof Error ? error.message : String(error);
 (console as any).warn('Video playback issue:', errorMessage);

 // Don't treat network/cache errors as critical errors
 if (
 errorMessage.includes('CACHE_OPERATION_NOT_SUPPORTED') ||
 errorMessage.includes('ERR_NETWORK')
 ) {
 (console as any).info(
 'Video may be temporarily unavailable due to network/cache issues'
 );
 setState(prev => ({ ...prev as any, isPlaying: false }));
 } else {
 setState(prev => ({
 ...prev as any,
 error: 'Failed to play video',
 isPlaying: false }));
 }
 }
 }, []);

 const pause = useCallback(() => {
 const video = videoRef.current;
 if (!video) {
 return;
 }

 video.pause();
 setState(prev => ({ ...prev as any, isPlaying: false }));
 }, []);

 const togglePlayPause = useCallback(async (): Promise<void> => {
 if (state.isPlaying) {
 pause();
 } else {
 await play();
 }
 }, [state.isPlaying, play, pause]);

 const mute = useCallback(() => {
 const video = videoRef.current;
 if (!video) {
 return;
 }

 video.muted = true;
 setState(prev => ({ ...prev as any, isMuted: true }));
 }, []);

 const unmute = useCallback(() => {
 const video = videoRef.current;
 if (!video) {
 return;
 }

 video.muted = false;
 setState(prev => ({ ...prev as any, isMuted: false }));
 }, []);

 const toggleMute = useCallback(() => {
 if (state.isMuted) {
 unmute();
 } else {
 mute();
 }
 }, [state.isMuted, mute, unmute]);

 const setVolume = useCallback((volume: any) => {
 const video = videoRef.current;
 if (!video) {
 return;
 }

 const clampedVolume = Math.max(0, Math.min(1, volume));
 video.volume = clampedVolume;
 setState(prev => ({ ...prev as any, volume: clampedVolume }));
 }, []);

 const seek = useCallback((time: any) => {
 const video = videoRef.current;
 if (!video) {
 return;
 }

 video.currentTime = time;
 setState(prev => ({ ...prev as any, currentTime: time }));
 }, []);

 const setPlaybackRate = useCallback((rate: any) => {
 const video = videoRef.current;
 if (!video) {
 return;
 }

 video.playbackRate = rate;
 setState(prev => ({ ...prev as any, playbackRate: rate }));
 }, []);

 const setQuality = useCallback((quality: any) => {
 setState(prev => ({ ...prev as any, quality }));
 }, []);

 const enterFullscreen = useCallback(async (): Promise<void> => {
 const video = videoRef.current;
 if (!video) {
 return;
 }

 try {
 if (video.requestFullscreen) {
 await video.requestFullscreen();
 }
 setState(prev => ({ ...prev as any, isFullscreen: true }));
 } catch (error: any) {
 (console as any).error('Error entering fullscreen:', error);
 }
 }, []);

 const exitFullscreen = useCallback(async (): Promise<void> => {
 try {
 if (document.exitFullscreen) {
 await document.exitFullscreen();
 }
 setState(prev => ({ ...prev as any, isFullscreen: false }));
 } catch (error: any) {
 (console as any).error('Error exiting fullscreen:', error);
 }
 }, []);

 const toggleFullscreen = useCallback(async (): Promise<void> => {
 if (state.isFullscreen) {
 await exitFullscreen();
 } else {
 await enterFullscreen();
 }
 }, [state.isFullscreen, enterFullscreen, exitFullscreen]);

 const reset = useCallback(() => {
 const video = videoRef.current;
 if (!video) {
 return;
 }

 video.currentTime = 0;
 video.pause();
 setState(prev => ({
 ...prev as any,
 isPlaying: false,
 currentTime: 0,
 error: null }));
 }, []);

 // Event handlers
 const events = {
 onLoadStart: useCallback(() => {
 setState(prev => ({ ...prev as any, isLoading: true, error: null }));
 }, []),

 onLoadedMetadata: useCallback(() => {
 const video = videoRef.current;
 if (!video) {
 return;
 }

 setState(prev => ({
 ...prev as any,
 duration: video.duration,
 isLoading: false }));
 }, []),

 onCanPlay: useCallback(() => {
 setState(prev => ({ ...prev as any, isLoading: false }));
 }, []),

 onPlay: useCallback(() => {
 setState(prev => ({ ...prev as any, isPlaying: true }));
 }, []),

 onPause: useCallback(() => {
 setState(prev => ({ ...prev as any, isPlaying: false }));
 }, []),

 onTimeUpdate: useCallback(() => {
 const video = videoRef.current;
 if (!video) {
 return;
 }

 setState(prev => ({ ...prev as any, currentTime: video.currentTime }));
 }, []),

 onDurationChange: useCallback(() => {
 const video = videoRef.current;
 if (!video) {
 return;
 }

 setState(prev => ({ ...prev as any, duration: video.duration }));
 }, []),

 onVolumeChange: useCallback(() => {
 const video = videoRef.current;
 if (!video) {
 return;
 }

 setState(prev => ({
 ...prev as any,
 volume: video.volume,
 isMuted: video.muted }));
 }, []),

 onError: useCallback((error: Error) => {
 (console as any).error('Video error:', error);
 setState(prev => ({
 ...prev as any,
 error: 'Failed to load video',
 isLoading: false,
 isPlaying: false }));
 }, []),

 onEnded: useCallback(() => {
 setState(prev => ({ ...prev as any, isPlaying: false, currentTime: 0 }));
 }, []),

 onProgress: useCallback(() => {
 const video = videoRef.current;
 if (!video?.buffered.length) {
 return;
 }

 const buffered = video.buffered.end(video.buffered.length - 1);
 setState(prev => ({ ...prev as any, buffered }));
 }, []),

 onWaiting: useCallback(() => {
 setState(prev => ({ ...prev as any, isLoading: true }));
 }, []),

 onCanPlayThrough: useCallback(() => {
 setState(prev => ({ ...prev as any, isLoading: false }));
 }, []) };

 // Set up video element and event listeners
 useEffect(() => {
 const video = videoRef.current;
 if (!video) {
 return;
 }

 // Set initial properties
 video.autoplay = autoplay;
 video.muted = muted;
 video.loop = loop;
 video.preload = preload;
 video.playsInline = playsinline;
 video.volume = initialVolume;
 video.playbackRate = initialPlaybackRate;

 // Attach event listeners
 video.addEventListener('loadstart', events.onLoadStart as EventListener);
 video.addEventListener('loadedmetadata', events.onLoadedMetadata as EventListener);
 video.addEventListener('canplay', events.onCanPlay as EventListener);
 video.addEventListener('play', events.onPlay as EventListener);
 video.addEventListener('pause', events.onPause as EventListener);
 video.addEventListener('timeupdate', events.onTimeUpdate as EventListener);
 video.addEventListener('durationchange', events.onDurationChange as EventListener);
 video.addEventListener('volumechange', events.onVolumeChange as EventListener);
 video.addEventListener('error', events.onError as EventListener);
 video.addEventListener('ended', events.onEnded as EventListener);
 video.addEventListener('progress', events.onProgress as EventListener);
 video.addEventListener('waiting', events.onWaiting as EventListener);
 video.addEventListener('canplaythrough', events.onCanPlayThrough as EventListener);

 // Cleanup function
 return () => {
 video.removeEventListener('loadstart', events.onLoadStart as EventListener);
 video.removeEventListener('loadedmetadata', events.onLoadedMetadata as EventListener);
 video.removeEventListener('canplay', events.onCanPlay as EventListener);
 video.removeEventListener('play', events.onPlay as EventListener);
 video.removeEventListener('pause', events.onPause as EventListener);
 video.removeEventListener('timeupdate', events.onTimeUpdate as EventListener);
 video.removeEventListener('durationchange', events.onDurationChange as EventListener);
 video.removeEventListener('volumechange', events.onVolumeChange as EventListener);
 video.removeEventListener('error', events.onError as EventListener);
 video.removeEventListener('ended', events.onEnded as EventListener);
 video.removeEventListener('progress', events.onProgress as EventListener);
 video.removeEventListener('waiting', events.onWaiting as EventListener);
 video.removeEventListener('canplaythrough', events.onCanPlayThrough as EventListener);
 };
 }, [
 autoplay,
 muted,
 loop,
 preload,
 playsinline,
 initialVolume,
 initialPlaybackRate,
 events]);

 // Handle fullscreen changes
 useEffect(() => {
 const handleFullscreenChange: any = () => {
 setState(prev => ({
 ...prev as any,
 isFullscreen: !!document.fullscreenElement }));
 };

 document.addEventListener('fullscreenchange', handleFullscreenChange as EventListener);
 return () =>
 document.removeEventListener('fullscreenchange', handleFullscreenChange as EventListener);
 }, []);

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
 reset },
 events };
};

export default useVideoPlayer;
