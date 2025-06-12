import React, { useState, useEffect, useRef, useCallback   } from 'react';
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
  title,
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
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality | null>(null);
  const [selectedSubtitle, setSelectedSubtitle] = useState<Subtitle | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  // Check if the source is a YouTube video
  const isYouTubeVideo = src.includes('youtube.com/embed/') || src.includes('youtu.be/');
  
  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  
  useEffect(() => {
    if (qualities.length > 0 && !selectedQuality) {
      setSelectedQuality(qualities[0] || null);
    }
  }, [qualities, selectedQuality]);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };
    
    const handleTimeUpdate = () => {
      const current = video.currentTime;
      setCurrentTime(current);
      onTimeUpdate?.(current, video.duration);
      
      // Update buffered progress
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
      
      // Update current chapter
      const chapter = chapters.find((ch, index) => {
        const nextChapter = chapters[index + 1];
        return current >= ch.startTime && (!nextChapter || current < nextChapter.startTime);
      });
      setCurrentChapter(chapter || null);
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };
    
    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [chapters, onTimeUpdate, onPlay, onPause, onEnded]);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    const handlePictureInPictureChange = () => {
      setIsPictureInPicture(!!document.pictureInPictureElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('enterpictureinpicture', handlePictureInPictureChange);
    document.addEventListener('leavepictureinpicture', handlePictureInPictureChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('enterpictureinpicture', handlePictureInPictureChange);
      document.removeEventListener('leavepictureinpicture', handlePictureInPictureChange);
    };
  }, []);
  
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(error => {
        console.error('Error playing video:', error);
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);
  
  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressRef.current;
    if (!video || !progressBar) return;
    
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    video.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);
  
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);
  
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);
  
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;
    
    try {
      if (isFullscreen) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, [isFullscreen]);
  
  const togglePictureInPicture = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    
    try {
      if (isPictureInPicture) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.error('Picture-in-picture error:', error);
    }
  }, [isPictureInPicture]);
  
  const changePlaybackRate = useCallback((rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);
  
  const changeQuality = useCallback((quality: VideoQuality) => {
    const video = videoRef.current;
    if (!video) return;
    
    // const savedCurrentTime = video.currentTime;
    // const savedWasPlaying = !video.paused;
    
    setSelectedQuality(quality);
    onQualityChange?.(quality);
    
    // In a real implementation, you would change the video source here
    // video.src = quality.value;
    // video.currentTime = currentTime;
    // if (wasPlaying) video.play();
  }, [onQualityChange]);
  
  const changeSubtitle = useCallback((subtitle: Subtitle | null) => {
    setSelectedSubtitle(subtitle);
    // In a real implementation, you would enable/disable subtitle tracks here
  }, []);
  
  const seekToChapter = useCallback((chapter: Chapter) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = chapter.startTime;
    setCurrentTime(chapter.startTime);
  }, []);
  
  const skip = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    video.currentTime = newTime;
    setCurrentTime(newTime);
  }, [currentTime, duration]);
  
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
  
  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return (
    <div
      ref={containerRef}
      className={`relative bg-black group aspect-video ${className}`}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element or YouTube Iframe */}
      {isYouTubeVideo ? (
        <iframe
          ref={iframeRef}
          src={`${src}?autoplay=${autoPlay ? 1 : 0}&mute=${muted ? 1 : 0}&controls=1&rel=0&modestbranding=1`}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title || 'YouTube Video'}
        />
      ) : (
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
      )}
      
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Title Overlay */}
      {title && (
        <div className="absolute top-4 left-4 right-4">
          <h2 className="text-white text-lg font-semibold bg-black bg-opacity-50 px-3 py-2 rounded">
            {title}
          </h2>
        </div>
      )}
      
      {/* Current Chapter */}
      {currentChapter && (
        <div className="absolute top-16 left-4">
          <div className="bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
            {currentChapter.title}
          </div>
        </div>
      )}
      
      {/* Controls Overlay - Hide for YouTube videos */}
      {!isYouTubeVideo && (
        <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
        {/* Center Play/Pause Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-75 transition-all"
          >
            {isPlaying ? (
              <PauseIconSolid className="w-8 h-8" />
            ) : (
              <PlayIconSolid className="w-8 h-8 ml-1" />
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
              onClick={handleSeek}
            >
              {/* Buffered Progress */}
              <div
                className="absolute top-0 left-0 h-full bg-white bg-opacity-50 rounded-full"
                style={{ width: `${buffered}%` }}
              />
              
              {/* Current Progress */}
              <div
                className="absolute top-0 left-0 h-full bg-red-600 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
              
              {/* Progress Handle */}
              <div
                className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${progressPercentage}%`, marginLeft: '-8px' }}
              />
              
              {/* Chapter Markers */}
              {chapters.map((chapter) => {
                const chapterPercentage = (chapter.startTime / duration) * 100;
                return (
                  <div
                    key={chapter.id}
                    className="absolute top-0 w-1 h-full bg-yellow-400 opacity-75"
                    style={{ left: `${chapterPercentage}%` }}
                    title={chapter.title}
                  />
                );
              })}
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                {isPlaying ? (
                  <PauseIcon className="w-6 h-6" />
                ) : (
                  <PlayIcon className="w-6 h-6" />
                )}
              </button>
              
              {/* Skip Buttons */}
              <button
                onClick={() => skip(-10)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                title="Skip back 10s"
              >
                <BackwardIcon className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => skip(10)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                title="Skip forward 10s"
              >
                <ForwardIcon className="w-5 h-5" />
              </button>
              
              {/* Volume Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <SpeakerXMarkIcon className="w-6 h-6" />
                  ) : (
                    <SpeakerWaveIcon className="w-6 h-6" />
                  )}
                </button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white bg-opacity-30 rounded-full appearance-none slider"
                />
              </div>
              
              {/* Time Display */}
              <div className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Chapters Button */}
              {chapters.length > 0 && (
                <button
                  onClick={() => setShowChapters(!showChapters)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                  title="Chapters"
                >
                  <RectangleStackIcon className="w-6 h-6" />
                </button>
              )}
              
              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                title="Settings"
              >
                <Cog6ToothIcon className="w-6 h-6" />
              </button>
              
              {/* Picture-in-Picture */}
              <button
                onClick={togglePictureInPicture}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                title="Picture in Picture"
              >
                <ArrowsPointingOutIcon className="w-6 h-6" />
              </button>
              
              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                title="Fullscreen"
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
                      selectedQuality?.value === quality.value ? 'bg-white bg-opacity-20' : ''
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
                    !selectedSubtitle ? 'bg-white bg-opacity-20' : ''
                  }`}
                >
                  Off
                </button>
                {subtitles.map((subtitle) => (
                  <button
                    key={subtitle.id}
                    onClick={() => changeSubtitle(subtitle)}
                    className={`block w-full text-left px-3 py-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors ${
                      selectedSubtitle?.id === subtitle.id ? 'bg-white bg-opacity-20' : ''
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
      
      {/* Chapters Panel */}
      {showChapters && chapters.length > 0 && (
        <div className="absolute bottom-20 right-4 bg-black bg-opacity-90 text-white rounded-lg p-4 min-w-80 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Chapters</h3>
          <div className="space-y-2">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => seekToChapter(chapter)}
                className={`block w-full text-left p-3 rounded hover:bg-white hover:bg-opacity-20 transition-colors ${
                  currentChapter?.id === chapter.id ? 'bg-white bg-opacity-20' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {chapter.thumbnail && (
                    <img
                      src={chapter.thumbnail}
                      alt={chapter.title}
                      className="w-16 h-9 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="font-medium">{chapter.title}</div>
                    <div className="text-sm text-gray-300">{formatTime(chapter.startTime)}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
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