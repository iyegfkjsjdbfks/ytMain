import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export interface HoverAutoplayVideoCardProps {
  video: {
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    views: number;
    uploadedAt: string;
    channel: {
      name: string;
      avatar: string;
    };
  };
  className?: string;
}

const HoverAutoplayVideoCard: React.FC<HoverAutoplayVideoCardProps> = ({ video, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const playTimeoutRef = useRef<NodeJS.Timeout>();

  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  const formatDuration = (duration: string): string => {
    return duration;
  };

  const getTimeAgo = (date: string): string => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return '1 day ago';
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    
    // Clear any existing timeouts
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Start autoplay after a delay
    hoverTimeoutRef.current = setTimeout(() => {
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.play().catch(() => {
          // Handle autoplay failure silently
        });
      }
    }, 1000);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPlaying(false);
    setShowControls(false);
    
    // Clear timeouts
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
    }
    
    // Pause video
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div>
      className={`group cursor-pointer ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link to={`/watch?v=${video.id}`} className="block">
        <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
          {/* Thumbnail */}
          <img />
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
 />
          
          {/* Video overlay for autoplay */}
          {isPlaying && (
            <video>
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(false)}
            >
              <source src={`/api/videos/${video.id}/preview`} type="video/mp4" />
            </video>
          )}
          
          {/* Duration */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </div>
          
          {/* Video controls overlay */}
          {showControls && isPlaying && (
            <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center">
              <button
          onClick={(e) => {
                  e.preventDefault();
                  setIsMuted(!isMuted);
                }}
                className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>
          )}
        </div>
        
        {/* Video info */}
        <div className="mt-3 flex gap-3">
          <img />
            src={video.channel.avatar}
            alt={video.channel.name}
            className="w-9 h-9 rounded-full flex-shrink-0"
 />
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium line-clamp-2 text-gray-900 group-hover:text-gray-700">
              {video.title}
            </h3>
            
            <p className="text-sm text-gray-600 mt-1">
              {video.channel.name}
            </p>
            
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-0.5">
              <span>{formatViews(video.views)}</span>
              <span>•</span>
              <span>{getTimeAgo(video.uploadedAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default HoverAutoplayVideoCard;
