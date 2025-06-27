import { useState, useRef, useEffect, useCallback, type FC } from 'react';

import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, Cog6ToothIcon, RectangleStackIcon, ForwardIcon, BackwardIcon } from '@heroicons/react/24/outline';
import { PlayIcon as PlayIconSolid, PauseIcon as PauseIconSolid } from '@heroicons/react/24/solid';

interface VideoQuality {
  label: string;
  value: string;
  resolution: string;
}

interface Subtitle {
  id: string;
  language: string;
  label: string;
  src: string;
}

interface Chapter {
  id: string;
  title: string;
  startTime: number;
  thumbnail?: string;
}

interface AdvancedVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  qualities?: VideoQuality[];
  subtitles?: Subtitle[];
  chapters?: Chapter[];
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onQualityChange?: (quality: VideoQuality) => void;
  className?: string;
}

const AdvancedVideoPlayer: React.FC<AdvancedVideoPlayerProps> = ({
  src,
  poster,
  qualities = [],
  subtitles = [],
  chapters = [],
  autoPlay = false,
  muted = false,
  loop = false,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  onQualityChange,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  // const volumeRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentQuality, setCurrentQuality] = useState<VideoQuality | null>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState<Subtitle | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) {
return;
}

    if (isPlaying) {
      videoRef.current.pause();
      onPause?.();
    } else {
      videoRef.current.play();
      onPlay?.();
    }
  }, [isPlaying, onPlay, onPause]);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || isDragging) {
return;
}

    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;

    setCurrentTime(current);
    setDuration(total);
    onTimeUpdate?.(current, total);

    // Update buffered
    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered((bufferedEnd / total) * 100);
    }
  }, [isDragging, onTimeUpdate]);

  const handleLoadStart = () => setIsLoading(true);
  const handleCanPlay = () => setIsLoading(false);
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleEnded = () => {
    setIsPlaying(false);
    onEnded?.();
  };

  const seekTo = (time: number) => {
    if (!videoRef.current) {
return;
}
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current) {
return;
}

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    seekTo(newTime);
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleProgressClick(e);
  };

  const handleProgressMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !progressRef.current) {
return;
}

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;

    setDragTime(newTime);
  }, [isDragging, duration]);

  const handleProgressMouseUp = useCallback(() => {
    if (isDragging) {
      seekTo(dragTime);
      setIsDragging(false);
    }
  }, [isDragging, dragTime]);

  const changeVolume = (newVolume: number) => {
    if (!videoRef.current) {
return;
}

    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    videoRef.current.volume = clampedVolume;

    if (clampedVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) {
return;
}

    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) {
return;
}

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const changePlaybackRate = (rate: number) => {
    if (!videoRef.current) {
return;
}
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const changeQuality = (quality: VideoQuality) => {
    if (!videoRef.current) {
return;
}

    const { currentTime } = videoRef.current;
    const wasPlaying = !videoRef.current.paused;

    setCurrentQuality(quality);
    onQualityChange?.(quality);

    // In a real implementation, you would change the video source here
    // For now, we'll just update the state

    // Restore playback position
    videoRef.current.currentTime = currentTime;
    if (wasPlaying) {
      videoRef.current.play();
    }
  };

  const changeSubtitle = (subtitle: Subtitle | null) => {
    setCurrentSubtitle(subtitle);
    // In a real implementation, you would enable/disable subtitle tracks here
  };

  const jumpToChapter = (chapter: Chapter) => {
    seekTo(chapter.startTime);
    setShowChapters(false);
  };

  const skipForward = () => {
    const newTime = Math.min(currentTime + 10, duration);
    seekTo(newTime);
  };

  const skipBackward = () => {
    const newTime = Math.max(currentTime - 10, 0);
    seekTo(newTime);
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    // Hide controls after 3 seconds of inactivity
    setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
return;
}

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [handleTimeUpdate]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleProgressMouseMove);
      document.addEventListener('mouseup', handleProgressMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleProgressMouseMove);
        document.removeEventListener('mouseup', handleProgressMouseUp);
      };
    }
    return () => {}; // Empty cleanup for when not dragging
  }, [isDragging, handleProgressMouseMove, handleProgressMouseUp]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) {
return;
}

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(volume - 0.1);
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, volume, toggleMute, toggleFullscreen]);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black group aspect-video ${className}`}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        preload="metadata"
        className="w-full h-full object-contain"
        onClick={togglePlay}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      )}

      {/* Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Center Play/Pause Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-4 transition-all duration-200 transform hover:scale-110"
          >
            {isPlaying ? (
              <PauseIconSolid className="w-8 h-8 text-white" />
            ) : (
              <PlayIconSolid className="w-8 h-8 text-white" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div
              ref={progressRef}
              className="relative h-2 bg-white bg-opacity-30 rounded-full cursor-pointer group"
              onClick={handleProgressClick}
              onMouseDown={handleProgressMouseDown}
            >
              {/* Buffered Progress */}
              <div
                className="absolute top-0 left-0 h-full bg-white bg-opacity-50 rounded-full"
                style={{ width: `${buffered}%` }}
              />

              {/* Current Progress */}
              <div
                className="absolute top-0 left-0 h-full bg-red-500 rounded-full"
                style={{ width: `${isDragging ? (dragTime / duration) * 100 : progressPercentage}%` }}
              />

              {/* Progress Handle */}
              <div
                className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${isDragging ? (dragTime / duration) * 100 : progressPercentage}%`, marginLeft: '-8px' }}
              />
            </div>

            {/* Time Display */}
            <div className="flex justify-between text-white text-sm mt-1">
              <span>{formatTime(isDragging ? dragTime : currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-red-500 transition-colors"
              >
                {isPlaying ? (
                  <PauseIcon className="w-6 h-6" />
                ) : (
                  <PlayIcon className="w-6 h-6" />
                )}
              </button>

              {/* Skip Backward */}
              <button
                onClick={skipBackward}
                className="text-white hover:text-red-500 transition-colors"
              >
                <BackwardIcon className="w-6 h-6" />
              </button>

              {/* Skip Forward */}
              <button
                onClick={skipForward}
                className="text-white hover:text-red-500 transition-colors"
              >
                <ForwardIcon className="w-6 h-6" />
              </button>

              {/* Volume */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-red-500 transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <SpeakerXMarkIcon className="w-6 h-6" />
                  ) : (
                    <SpeakerWaveIcon className="w-6 h-6" />
                  )}
                </button>

                <div className="w-20">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => changeVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white bg-opacity-30 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>

              {/* Time Display */}
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Chapters */}
              {chapters.length > 0 && (
                <button
                  onClick={() => setShowChapters(!showChapters)}
                  className="text-white hover:text-red-500 transition-colors"
                >
                  <RectangleStackIcon className="w-6 h-6" />
                </button>
              )}

              {/* Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:text-red-500 transition-colors"
              >
                <Cog6ToothIcon className="w-6 h-6" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-red-500 transition-colors"
              >
                {isFullscreen ? (
                  <ArrowsPointingInIcon className="w-6 h-6" />
                ) : (
                  <ArrowsPointingOutIcon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Panel */}
      {showChapters && chapters.length > 0 && (
        <div className="absolute bottom-20 left-4 bg-black bg-opacity-90 text-white rounded-lg p-4 max-w-sm max-h-64 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Chapters</h3>
          <div className="space-y-2">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => jumpToChapter(chapter)}
                className="flex items-center space-x-3 w-full text-left p-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <div className="flex-shrink-0">
                  {chapter.thumbnail ? (
                    <img
                      src={chapter.thumbnail}
                      alt={chapter.title}
                      className="w-16 h-9 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-9 bg-gray-600 rounded flex items-center justify-center">
                      <PlayIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium">{chapter.title}</div>
                  <div className="text-sm text-gray-300">{formatTime(chapter.startTime)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute bottom-20 right-4 bg-black bg-opacity-90 text-white rounded-lg p-4 min-w-64">
          <h3 className="text-lg font-semibold mb-4">Settings</h3>

          {/* Playback Speed */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Playback Speed</h4>
            <div className="space-y-1">
              {playbackRates.map((rate) => (
                <button
                  key={rate}
                  onClick={() => changePlaybackRate(rate)}
                  className={`block w-full text-left px-3 py-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors ${
                    playbackRate === rate ? 'bg-white bg-opacity-20' : ''
                  }`}
                >
                  {rate === 1 ? 'Normal' : `${rate}x`}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          {qualities.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Quality</h4>
              <div className="space-y-1">
                {qualities.map((quality) => (
                  <button
                    key={quality.value}
                    onClick={() => changeQuality(quality)}
                    className={`block w-full text-left px-3 py-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors ${
                      currentQuality?.value === quality.value ? 'bg-white bg-opacity-20' : ''
                    }`}
                  >
                    {quality.label} ({quality.resolution})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subtitles */}
          {subtitles.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Subtitles</h4>
              <div className="space-y-1">
                <button
                  onClick={() => changeSubtitle(null)}
                  className={`block w-full text-left px-3 py-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors ${
                    !currentSubtitle ? 'bg-white bg-opacity-20' : ''
                  }`}
                >
                  Off
                </button>
                {subtitles.map((subtitle) => (
                  <button
                    key={subtitle.id}
                    onClick={() => changeSubtitle(subtitle)}
                    className={`block w-full text-left px-3 py-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors ${
                      currentSubtitle?.id === subtitle.id ? 'bg-white bg-opacity-20' : ''
                    }`}
                  >
                    {subtitle.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default AdvancedVideoPlayer;