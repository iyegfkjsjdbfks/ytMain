import React, { MouseEvent, KeyboardEvent, FC, useState, useEffect, useCallback, useRef } from 'react';
/// <reference types="node" />

declare namespace NodeJS {
 interface ProcessEnv {
 [key: string]: string | undefined
 }
 interface Process {
 env: ProcessEnv;
 }
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, Cog6ToothIcon, ForwardIcon, BackwardIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

import { useVideoPlayer } from '../src/hooks';

import type { Video } from '../src/types/core';

interface Chapter {
 title: string;
 startTime: number;
 endTime: number
}

interface AdvancedVideoPlayerProps {
 video: Video;
 chapters?: Chapter;
 autoplay?: boolean;
 muted?: boolean;
 className?: string;
 onTimeUpdate?: (currentTime: any) => void;
 onEnded?: () => void;
 onPlay?: () => void;
 onPause?: () => void;
}

interface VideoQuality {
 label: string;
 value: string;
 resolution: string
}

const VIDEO_QUALITIES: VideoQuality[] = [
 { label: 'Auto',
 value: 'auto', resolution: 'Auto' },
 { label: '1080p',
 value: '1080p', resolution: '1920x1080' },
 { label: '720p',
 value: '720p', resolution: '1280x720' },
 { label: '480p',
 value: '480p', resolution: '854x480' },
 { label: '360p',
 value: '360p', resolution: '640x360' },
 { label: '240p',
 value: '240p', resolution: '426x240' }];

const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const AdvancedVideoPlayer: React.FC<AdvancedVideoPlayerProps> = ({
 video,
 chapters = [],
 autoplay = false,
 muted = false,
 className = '',
 onTimeUpdate,
 onEnded,
 onPlay,
 onPause }) => {
 // Use the custom video player hook
 const videoPlayerInstance = useVideoPlayer({
 autoplay,
 muted,
 ...(onTimeUpdate && { onTimeUpdate }),
 ...(onEnded && { onEnded }),
 ...(onPlay && { onPlay }),
 ...(onPause && { onPause }) });

 // Local video ref
 const videoRef = useRef<HTMLVideoElement>(null);

 // Local state for UI controls
 const [showControls, setShowControls] = useState<boolean>(true);
 const [showSettings, setShowSettings] = useState<boolean>(false);
 const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);
 const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
 const [showChapters, setShowChapters] = useState<boolean>(false);
 const [selectedQuality, setSelectedQuality] = useState('auto');
 // const [isDragging] = useState<boolean>(false); // Not used yet
 const [previewTime, setPreviewTime] = useState<number>(0);
 const [showPreview, setShowPreview] = useState<boolean>(false);
 const [subtitlesEnabled, setSubtitlesEnabled] = useState<boolean>(false);
 const [autoplayNext, setAutoplayNext] = useState<boolean>(true);
 const [annotations, setAnnotations] = useState<boolean>(true);

 const containerRef = useRef<HTMLDivElement>(null);
 const progressRef = useRef<HTMLDivElement>(null);
 const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
 const settingsRef = useRef<HTMLDivElement>(null);

 // Connect videoRef to video player instance
 useEffect(() => {
 if (videoRef.current) {
 videoPlayerInstance.setVideoRef(videoRef.current);
 }

 }, [videoPlayerInstance]);

 // Format time for display
 const formatTime: any = (time: any): string => {
 const hours = Math.floor(time / 3600);
 const minutes = Math.floor((time % 3600) / 60);
 const seconds = Math.floor(time % 60);

 if (hours > 0) {
 return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
 }
 return `${minutes}:${seconds.toString().padStart(2, '0')}`;
 };

 // Get current chapter
 const getCurrentChapter: any = (): Chapter | undefined => {
 return chapters.find((chapter: any) => videoPlayerInstance.currentTime >= chapter.startTime && videoPlayerInstance.currentTime < chapter.endTime
 );
 };

 // Handle progress bar interaction
 const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
 if (!progressRef.current || !videoPlayerInstance.duration) {
return;
}

 const rect = progressRef.current.getBoundingClientRect();
 const clickX = e.clientX - rect.left;
 const newTime: any = (clickX / rect.width) * videoPlayerInstance.duration;
 videoPlayerInstance.seek(newTime);
 }, [videoPlayerInstance.duration]);

 const handleProgressMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
 if (!progressRef.current || !videoPlayerInstance.duration) {
return;
}

 const rect = progressRef.current.getBoundingClientRect();
 const hoverX = e.clientX - rect.left;
 const hoverTime: any = (hoverX / rect.width) * videoPlayerInstance.duration;
 setPreviewTime(hoverTime);
 setShowPreview(true);
 }, [videoPlayerInstance.duration]);

 const handleProgressMouseLeave = useCallback(() => {
 setShowPreview(false);
 }, []);

 // Keyboard shortcuts
 const handleKeyDown = useCallback((e: KeyboardEvent) => {
 if (!videoRef.current) {
return;
}

 switch (e.code) {
 case 'Space':
 e.preventDefault();
 videoPlayerInstance.togglePlay();
 break;
 case 'ArrowLeft':
 e.preventDefault();
 videoPlayerInstance.seek(Math.max(0, videoPlayerInstance.currentTime - 10));
 break;
 case 'ArrowRight':
 e.preventDefault();
 videoPlayerInstance.seek(Math.min(videoPlayerInstance.duration, videoPlayerInstance.currentTime + 10));
 break;
 case 'ArrowUp':
 e.preventDefault();
 videoPlayerInstance.setVolume(Math.min(1, videoPlayerInstance.volume + 0.1));
 break;
 case 'ArrowDown':
 e.preventDefault();
 videoPlayerInstance.setVolume(Math.max(0, videoPlayerInstance.volume - 0.1));
 break;
 case 'KeyM':
 e.preventDefault();
 videoPlayerInstance.toggleMute();
 break;
 case 'KeyF':
 e.preventDefault();
 videoPlayerInstance.toggleFullscreen();
 break;
 case 'Comma':
 if (e.shiftKey) {
 e.preventDefault();
 videoPlayerInstance.setPlaybackRate(Math.max(0.25, videoPlayerInstance.playbackRate - 0.25));
 }
 break;
 case 'Period':
 if (e.shiftKey) {
 e.preventDefault();
 videoPlayerInstance.setPlaybackRate(Math.min(2, videoPlayerInstance.playbackRate + 0.25));
 }
 break;
 }
 }, [videoPlayerInstance.currentTime, videoPlayerInstance.duration, videoPlayerInstance.volume, videoPlayerInstance.playbackRate]);

 // Auto-hide controls
 const resetControlsTimeout = useCallback(() => {
 if (controlsTimeoutRef.current) {
 clearTimeout(controlsTimeoutRef.current);
 }

 setShowControls(true);

 if (videoPlayerInstance.isPlaying) {
 controlsTimeoutRef.current = setTimeout((() => {
 setShowControls(false);
 }) as any, 3000);
 }
 }, [videoPlayerInstance.isPlaying]);

 // Handle mouse movement to show controls
 const handleMouseMove = useCallback(() => {
 resetControlsTimeout();
 }, [resetControlsTimeout]);

 // Handle click outside settings
 const handleClickOutside = useCallback((e: MouseEvent) => {
 if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
 setShowSettings(false);
 setShowQualityMenu(false);
 setShowSpeedMenu(false);
 }

 }, []);

 // Chapter navigation
 const goToChapter = useCallback((chapter: Chapter) => {
 videoPlayerInstance.seek(chapter.startTime);
 setShowChapters(false);
 }, []);

 // Skip forward/backward
 const skipForward = useCallback(() => {
 videoPlayerInstance.seek(Math.min(videoPlayerInstance.duration, videoPlayerInstance.currentTime + 10));
 }, [videoPlayerInstance.currentTime, videoPlayerInstance.duration]);

 const skipBackward = useCallback(() => {
 videoPlayerInstance.seek(Math.max(0, videoPlayerInstance.currentTime - 10));
 }, [videoPlayerInstance.currentTime]);

 // Picture-in-picture
 const togglePictureInPicture = useCallback(async (): Promise<void> => {
 if (!videoRef.current) {
return;
}

 try {
 if (document.pictureInPictureElement) {
 await document.exitPictureInPicture();
 } else {
 await videoRef.current.requestPictureInPicture();
 }
 } catch (error: any) {
 (console as any).error('Picture-in-picture failed:', error);
 }
 }, []);

 // Effects
 useEffect(() => {
 document.addEventListener('keydown', handleKeyDown as EventListener);
 document.addEventListener('click', handleClickOutside as EventListener);

 return () => {
 document.removeEventListener('keydown', handleKeyDown as EventListener);
 document.removeEventListener('click', handleClickOutside as EventListener);
 if (controlsTimeoutRef.current) {
 clearTimeout(controlsTimeoutRef.current);
 }

 }}, [handleKeyDown, handleClickOutside]);

 useEffect(() => {
 resetControlsTimeout();
 }, [videoPlayerInstance.isPlaying, resetControlsTimeout]);

 const currentChapter = getCurrentChapter();
 const progressPercentage = videoPlayerInstance.duration ? (videoPlayerInstance.currentTime / videoPlayerInstance.duration) * 100 : 0;
 const volumePercentage = videoPlayerInstance.volume * 100;
 const bufferPercentage = videoPlayerInstance.buffered ? 100 : 0; // Placeholder for buffered calculation

 return (
 <div
 ref={containerRef}
 className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
 onMouseMove={handleMouseMove}
 onMouseLeave={() => setShowControls(false)}
 >
 {/* Video Element */}
 <video
 ref={videoRef}
 src={video.videoUrl}
 poster={video.thumbnailUrl}
 className="w-full h-full object-contain"
 onClick={videoPlayerInstance.togglePlay}
 onDoubleClick={videoPlayerInstance.toggleFullscreen}
 aria-label={`Video: ${video.title}`}
 controls={false}
 >
 <track
 kind="captions"
 src=""
 srcLang="en"
 label="English captions"
 default
 />
 </video>

 {/* Loading Overlay */}
 {videoPlayerInstance.isLoading && (
 <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
 </div>
 )}

 {/* Error Overlay */}
 {videoPlayerInstance.error && (
 <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
 <div className="text-white text-center">
 <p className="text-lg mb-2">Video Error</p>
 <p className="text-sm opacity-75">{videoPlayerInstance.error?.message || "An error occurred"}</p>
 </div>
 </div>
 )}

 {/* Chapter Indicator */}
 {currentChapter && (
 <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
 {currentChapter.title}
 </div>
 )}

 {/* Controls Overlay */}
 <div
 className={`absolute inset-0 transition-opacity duration-300 ${
 showControls || !videoPlayerInstance.isPlaying ? 'opacity-100' : 'opacity-0'
 }`}
 >
 {/* Center Play/Pause Button */}
 <div className="absolute inset-0 flex items-center justify-center">
 <button
 onClick={videoPlayerInstance.togglePlay}
 onKeyDown={(e: any) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 videoPlayerInstance.togglePlay();
 }
 }
 className="bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-4 rounded-full transition-all duration-200 transform hover:scale-110"
 aria-label={videoPlayerInstance.isPlaying ? 'Pause video' : 'Play video'}
 >
 {videoPlayerInstance.isPlaying ? (
 <PauseIcon className="w-8 h-8" />
 ) : (
 <PlayIcon className="w-8 h-8 ml-1" />
 )}
 </button>
 </div>

 {/* Bottom Controls */}
 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
 {/* Progress Bar */}
 <div className="mb-4">
 <div
 ref={progressRef}
 className="relative h-2 bg-white bg-opacity-30 rounded-full cursor-pointer group"
 onClick={(e: any) => handleProgressClick(e)}
 onMouseMove={handleProgressMouseMove}
 onMouseLeave={handleProgressMouseLeave}
 onKeyDown={(e: any) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 handleProgressClick(e as any);
 }
 }
 role="slider"
 aria-label="Video progress"
 aria-valuemin={0}
 aria-valuemax={videoPlayerInstance.duration}
 aria-valuenow={videoPlayerInstance.currentTime}
 tabIndex={0}
 >
 {/* Buffer Bar */}
 <div
 className="absolute top-0 left-0 h-full bg-white bg-opacity-50 rounded-full"
 style={{ width: `${bufferPercentage}%` }
 />

 {/* Progress Bar */}
 <div
 className="absolute top-0 left-0 h-full bg-red-600 rounded-full"
 style={{ width: `${progressPercentage}%` }
 />

 {/* Progress Handle */}
 <div
 className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
 style={{ left: `calc(${progressPercentage}% - 8px)` }
 />

 {/* Chapter Markers */}
 {chapters.map((chapter: any,
 index: number) => {
 const markerPosition = videoPlayerInstance.duration ? (chapter.startTime / videoPlayerInstance.duration) * 100 : 0;
 return (
 <div
 key={index}
 className="absolute top-0 w-0.5 h-full bg-white bg-opacity-75"
 style={{ left: `${markerPosition}%` }
 title={chapter.title}
 />
 );
 })}

 {/* Time Preview */}
 {showPreview && (
 <div
 className="absolute bottom-full mb-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded whitespace-nowrap transform -translate-x-1/2"
 style={{ left: `${(previewTime / videoPlayerInstance.duration) * 100}%` }
 >
 {formatTime(previewTime)}
 </div>
 )}
 </div>
 </div>

 {/* Control Buttons */}
 <div className="flex items-center justify-between text-white">
 <div className="flex items-center space-x-2">
 {/* Play/Pause */}
 <button
 onClick={videoPlayerInstance.togglePlay}
 className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
 >
 {videoPlayerInstance.isPlaying ? (
 <PauseIcon className="w-6 h-6" />
 ) : (
 <PlayIcon className="w-6 h-6" />
 )}
 </button>

 {/* Skip Backward */}
 <button
 onClick={(e: any) => skipBackward(e)}
 className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
 title="Skip backward 10s"
 >
 <BackwardIcon className="w-6 h-6" />
 </button>

 {/* Skip Forward */}
 <button
 onClick={(e: any) => skipForward(e)}
 className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
 title="Skip forward 10s"
 >
 <ForwardIcon className="w-6 h-6" />
 </button>

 {/* Volume */}
 <div className="flex items-center group">
 <button
 onClick={videoPlayerInstance.toggleMute}
 className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
 >
 {videoPlayerInstance.isMuted || videoPlayerInstance.volume === 0 ? (
 <SpeakerXMarkIcon className="w-6 h-6" />
 ) : (
 <SpeakerWaveIcon className="w-6 h-6" />
 )}
 </button>

 <div className="w-0 group-hover:w-20 overflow-hidden transition-all duration-200">
 <input
 type="range"
 min="0"
 max="100"
 value={volumePercentage}
 onChange={(e) => videoPlayerInstance.setVolume(Number(e.target.value) / 100)}
 className="w-20 h-1 bg-white bg-opacity-30 rounded-lg appearance-none cursor-pointer"
 />
 </div>
 </div>

 {/* Time Display */}
 <span className="text-sm font-mono">
 {formatTime(videoPlayerInstance.currentTime)} / {formatTime(videoPlayerInstance.duration)}
 </span>
 </div>

 <div className="flex items-center space-x-2">
 {/* Chapters */}
 {chapters.length > 0 && (
 <div className="relative">
 <button
 onClick={() => setShowChapters(!showChapters)}
 className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
 title="Chapters"
 >
 <span className="text-sm">Chapters</span>
 </button>

 {showChapters && (
 <div className="absolute bottom-full right-0 mb-2 w-64 max-h-48 overflow-y-auto bg-black bg-opacity-90 rounded-lg">
 {chapters.map((chapter: any,
 index: number) => (
 <button
 key={index}
 onClick={() => goToChapter(chapter)}
 className="w-full text-left p-3 hover:bg-white hover:bg-opacity-20 transition-colors border-b border-white border-opacity-20 last:border-b-0"
 >
 <div className="text-sm font-medium">{chapter.title}</div>
 <div className="text-xs opacity-75">
 {formatTime(chapter.startTime)} - {formatTime(chapter.endTime)}
 </div>
 </button>
 ))}
 </div>
 )}
 </div>
 )}

 {/* Picture-in-Picture */}
 <button
 onClick={(e: any) => togglePictureInPicture(e)}
 className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
 title="Picture-in-picture"
 >
 <span className="text-sm">PiP</span>
 </button>

 {/* Settings */}
 <div className="relative" ref={settingsRef}>
 <button
 onClick={() => setShowSettings(!showSettings)}
 className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
 >
 <Cog6ToothIcon className="w-6 h-6" />
 </button>

 {showSettings && (
 <div className="absolute bottom-full right-0 mb-2 w-64 bg-black bg-opacity-90 rounded-lg overflow-hidden">
 {/* Quality Settings */}
 <div className="border-b border-white border-opacity-20">
 <button
 onClick={() => setShowQualityMenu(!showQualityMenu)}
 className="w-full flex items-center justify-between p-3 hover:bg-white hover:bg-opacity-20 transition-colors"
 >
 <span>Quality</span>
 <div className="flex items-center space-x-2">
 <span className="text-sm opacity-75">{selectedQuality}</span>
 <ChevronUpIcon className={`w-4 h-4 transition-transform ${showQualityMenu ? 'rotate-180' : ''}`} />
 </div>
 </button>

 {showQualityMenu && (
 <div className="bg-black bg-opacity-50">
 {VIDEO_QUALITIES.map((quality) => (
 <button
 key={quality.value}
 onClick={() => {
 setSelectedQuality(quality.value);
 videoPlayerInstance.setQuality(quality.value);
 setShowQualityMenu(false);
 }
 className={`w-full text-left p-3 hover:bg-white hover:bg-opacity-20 transition-colors ${
 selectedQuality === quality.value ? 'bg-white bg-opacity-20' : ''
 }`}
 >
 <div className="flex justify-between">
 <span>{quality.label}</span>
 <span className="text-sm opacity-75">{quality.resolution}</span>
 </div>
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Speed Settings */}
 <div className="border-b border-white border-opacity-20">
 <button
 onClick={() => setShowSpeedMenu(!showSpeedMenu)}
 className="w-full flex items-center justify-between p-3 hover:bg-white hover:bg-opacity-20 transition-colors"
 >
 <span>Playback Speed</span>
 <div className="flex items-center space-x-2">
 <span className="text-sm opacity-75">{videoPlayerInstance.playbackRate}x</span>
 <ChevronUpIcon className={`w-4 h-4 transition-transform ${showSpeedMenu ? 'rotate-180' : ''}`} />
 </div>
 </button>

 {showSpeedMenu && (
 <div className="bg-black bg-opacity-50">
 {PLAYBACK_RATES.map((rate) => (
 <button
 key={rate}
 onClick={() => {
 videoPlayerInstance.setPlaybackRate(rate);
 setShowSpeedMenu(false);
 }
 className={`w-full text-left p-3 hover:bg-white hover:bg-opacity-20 transition-colors ${
 videoPlayerInstance.playbackRate === rate ? 'bg-white bg-opacity-20' : ''
 }`}
 >
 {rate}x
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Other Settings */}
 <div className="p-3 space-y-3">
 <label className="flex items-center justify-between cursor-pointer">
 <span>Subtitles/CC</span>
 <input
 type="checkbox"
 checked={subtitlesEnabled}
 onChange={(e) => setSubtitlesEnabled(e.target.checked)}
 className="rounded"
 />
 </label>

 <label className="flex items-center justify-between cursor-pointer">
 <span>Autoplay</span>
 <input
 type="checkbox"
 checked={autoplayNext}
 onChange={(e) => setAutoplayNext(e.target.checked)}
 className="rounded"
 />
 </label>

 <label className="flex items-center justify-between cursor-pointer">
 <span>Annotations</span>
 <input
 type="checkbox"
 checked={annotations}
 onChange={(e) => setAnnotations(e.target.checked)}
 className="rounded"
 />
 </label>
 </div>
 </div>
 )}
 </div>

 {/* Fullscreen */}
 <button
 onClick={videoPlayerInstance.toggleFullscreen}
 className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
 >
 {videoPlayerInstance.isFullscreen ? (
 <ArrowsPointingInIcon className="w-6 h-6" />
 ) : (
 <ArrowsPointingOutIcon className="w-6 h-6" />
 )}
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};

export default AdvancedVideoPlayer;