
/// <reference types="react/jsx-runtime" />
import { useNavigate } from 'react-router-dom';
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName]: any;
    }
  }
}
import { useState, useRef, useEffect } from 'react';
import React from 'react';

import {
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface PictureInPictureProps {
  videoId: string;
  videoTitle: string;
  channelName: string;
  thumbnailUrl: string;
  videoUrl?: string;
  isVisible: boolean;
  onClose: () => void;
  onExpand?: () => void;
  className?: string;
}

const PictureInPicture: React.FC<PictureInPictureProps> = ({
  videoId,
  videoTitle,
  channelName,
  thumbnailUrl,
  videoUrl,
  isVisible,
  onClose,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && containerRef.current) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Keep within viewport bounds
        const maxX = window.innerWidth - containerRef.current.offsetWidth;
        const maxY = window.innerHeight - containerRef.current.offsetHeight;

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
return;
}

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          // Handle play promise rejection silently
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };


  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleExpand = () => {
    navigate(`/watch/${videoId}`);
    onClose();
  };

  if (!isVisible) {
return null;
}

  return (
    <div
      ref={containerRef}
      className={`fixed z-50 bg-black rounded-lg shadow-2xl border border-gray-600 overflow-hidden transition-all duration-200 ${
        isMinimized ? 'w-16 h-12' : 'w-80 h-48'
      } ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      {isMinimized ? (
        // Minimized view
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
            className="text-white hover:text-gray-300"
          >
            <PlayIcon className="w-6 h-6" />
          </button>
        </div>
      ) : (
        // Full view
        <>
          {/* Video */}
          <div className="relative w-full h-full">
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-cover"
                muted={isMuted}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <img
                src={thumbnailUrl}
                alt={videoTitle}
                className="w-full h-full object-cover"
              />
            )}

            {/* Controls Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
              {/* Top Controls */}
              <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMinimized(true);
                    }}
                    className="p-1 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
                    title="Minimize"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExpand();
                    }}
                    className="p-1 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
                    title="Expand to theater mode"
                  >
                    <ArrowsPointingOutIcon className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="p-1 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
                  title="Close"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>

              {/* Center Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  {isPlaying ? (
                    <PauseIcon className="w-6 h-6" />
                  ) : (
                    <PlayIcon className="w-6 h-6" />
                  )}
                </button>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                {/* Progress Bar */}
                {duration > 0 && (
                  <div
                    className="w-full h-1 bg-white/30 rounded-full mb-2 cursor-pointer"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-red-500 rounded-full transition-all"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute();
                      }}
                      className="hover:text-gray-300"
                    >
                      {isMuted ? (
                        <SpeakerXMarkIcon className="w-4 h-4" />
                      ) : (
                        <SpeakerWaveIcon className="w-4 h-4" />
                      )}
                    </button>

                    {duration > 0 && (
                      <span>
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExpand();
                    }}
                    className="hover:text-gray-300"
                    title="Open in new tab"
                  >
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Video Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-8">
            <h3 className="text-white text-sm font-medium line-clamp-2 mb-1">
              {videoTitle}
            </h3>
            <p className="text-gray-300 text-xs">
              {channelName}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default PictureInPicture;
