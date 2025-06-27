import { useState, useRef, useEffect, type FC } from 'react';

import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  HeartIcon,
  ShareIcon,
  EllipsisVerticalIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

import type { Short } from '../src/types/core';

interface ShortsPlayerProps {
  shorts: Short[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onLike: (shortId: string) => void;
  onSubscribe: (channelId: string) => void;
  onComment: (shortId: string) => void;
  onShare: (shortId: string) => void;
  className?: string;
}

const ShortsPlayer: React.FC<ShortsPlayerProps> = ({
  shorts,
  currentIndex,
  onIndexChange,
  onLike,
  onSubscribe,
  onComment,
  onShare,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const currentShort = shorts[currentIndex];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
return;
}

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
    };

    const handleEnded = () => {
      // Auto-advance to next short
      if (currentIndex < shorts.length - 1) {
        onIndexChange(currentIndex + 1);
      } else {
        // Loop back to first short
        onIndexChange(0);
      }
    };

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentIndex, shorts.length, onIndexChange]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
return;
}

    // Auto-play when short changes
    if (isPlaying) {
      video.play().catch(console.error);
    }
  }, [currentIndex, isPlaying]);

  useEffect(() => {
    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowUp':
          e.preventDefault();
          navigateShort('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigateShort('down');
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) {
return;
}

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) {
return;
}

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const navigateShort = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    } else if (direction === 'down' && currentIndex < shorts.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  const handleVideoClick = () => {
    togglePlay();
    setShowControls(true);
    setTimeout(() => setShowControls(false), 2000);
  };

  const handleSeek = (e: React.MouseEvent) => {
    const video = videoRef.current;
    const progressBar = progressRef.current;
    if (!video || !progressBar) {
return;
}

    const rect = progressBar.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const newTime = ((rect.height - clickY) / rect.height) * video.duration;

    video.currentTime = newTime;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)  }M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)  }K`;
    }
    return num.toString();
  };

  if (!currentShort) {
return null;
}

  return (
    <div className={`relative w-full h-screen bg-black overflow-hidden ${className}`} ref={containerRef}>
      {/* Video */}
      <video
        ref={videoRef}
        src={currentShort.videoUrl}
        className="w-full h-full object-cover"
        loop={false}
        muted={isMuted}
        playsInline
        onClick={handleVideoClick}
        poster={currentShort.thumbnailUrl}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Progress Bar */}
      <div
        ref={progressRef}
        className="absolute right-2 top-20 bottom-20 w-1 bg-white/30 rounded-full cursor-pointer"
        onClick={handleSeek}
      >
        <div
          className="w-full bg-white rounded-full transition-all duration-100"
          style={{ height: `${progress}%` }}
        />
      </div>

      {/* Navigation Arrows */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4">
        <button
          onClick={() => navigateShort('up')}
          disabled={currentIndex === 0}
          className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronUpIcon className="w-6 h-6" />
        </button>

        <button
          onClick={() => navigateShort('down')}
          disabled={currentIndex === shorts.length - 1}
          className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronDownIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Play/Pause Overlay */}
      {showControls && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="p-4 bg-black/50 rounded-full">
            {isPlaying ? (
              <PauseIcon className="w-12 h-12 text-white" />
            ) : (
              <PlayIcon className="w-12 h-12 text-white" />
            )}
          </div>
        </div>
      )}

      {/* Content Info */}
      <div className="absolute bottom-0 left-0 right-16 p-4 bg-gradient-to-t from-black/80 to-transparent">
        {/* Channel Info */}
        <div className="flex items-center space-x-3 mb-3">
          <img
            src={currentShort.channelAvatarUrl}
            alt={currentShort.channelName}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium">{currentShort.channelName}</span>
              {currentShort.channel?.isVerified && (
                <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-gray-300 text-sm">{formatNumber(parseInt(currentShort.views, 10) || 0)} views</p>
          </div>

          <button
            onClick={() => onSubscribe(currentShort.channelId)}
            className="bg-white text-black px-4 py-1 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Subscribe
          </button>
        </div>

        {/* Video Title & Description */}
        <div className="mb-3">
          <h3 className="text-white font-medium mb-1 line-clamp-2">
            {currentShort.title}
          </h3>
          {currentShort.description && (
            <p className="text-gray-300 text-sm line-clamp-2">
              {currentShort.description}
            </p>
          )}
        </div>

        {/* Hashtags */}
        {currentShort.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {currentShort.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-blue-400 text-sm hover:text-blue-300 cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-20 right-4 flex flex-col space-y-6">
        {/* Like */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onLike(currentShort.id)}
            className={`p-3 rounded-full transition-colors ${
              currentShort.isLiked
                ? 'bg-red-500 text-white'
                : 'bg-black/50 text-white hover:bg-black/70'
            }`}
          >
            {currentShort.isLiked ? (
              <HeartSolidIcon className="w-6 h-6" />
            ) : (
              <HeartIcon className="w-6 h-6" />
            )}
          </button>
          <span className="text-white text-xs mt-1">
            {formatNumber(currentShort.likes)}
          </span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onComment(currentShort.id)}
            className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            <ChatBubbleLeftIcon className="w-6 h-6" />
          </button>
          <span className="text-white text-xs mt-1">
            {formatNumber(currentShort.commentCount || 0)}
          </span>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onShare(currentShort.id)}
            className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            <ShareIcon className="w-6 h-6" />
          </button>
          <span className="text-white text-xs mt-1">
            {formatNumber(currentShort.analytics?.engagement?.shares || 0)}
          </span>
        </div>

        {/* More Options */}
        <button className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
          <EllipsisVerticalIcon className="w-6 h-6" />
        </button>

        {/* Mute/Unmute */}
        <button
          onClick={toggleMute}
          className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
        >
          {isMuted ? (
            <SpeakerXMarkIcon className="w-6 h-6" />
          ) : (
            <SpeakerWaveIcon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Short Counter */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
        {currentIndex + 1} / {shorts.length}
      </div>
    </div>
  );
};

export default ShortsPlayer;
