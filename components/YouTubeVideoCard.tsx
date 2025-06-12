// YouTube Video Card component for displaying YouTube search results
import React, { useState } from 'react';
import { YouTubeSearchResult } from '../src/types/youtube';
import YouTubePlayer from './YouTubePlayer';
import { PlayIcon } from './icons/UnifiedIcon';

interface YouTubeVideoCardProps {
  video: YouTubeSearchResult;
  className?: string;
}

const YouTubeVideoCard: React.FC<YouTubeVideoCardProps> = ({ video, className = '' }) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsPlayerLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setShowPlayer(true);
    } finally {
      setIsPlayerLoading(false);
    }
  };

  const handleClosePlayer = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowPlayer(false);
    setIsPlayerLoading(false);
  };

  const formatDuration = (duration?: string) => {
    if (!duration) return null;
    
    // Parse ISO 8601 duration format (PT4M13S) to readable format
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatUploadDate = (uploadDate?: string) => {
    if (!uploadDate) return null;
    
    try {
      const date = new Date(uploadDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return uploadDate;
    }
  };

  const handleCardClick = () => {
    window.open(video.videoUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className={`bg-transparent dark:bg-transparent rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-neutral-300/30 dark:hover:shadow-neutral-700/30 flex flex-col h-full cursor-pointer group ${className}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Watch ${video.title} on YouTube`}
    >
      {/* Video Thumbnail/Player Section */}
      <div className="relative aspect-video">
        {showPlayer ? (
          <div className="relative w-full h-full">
            <YouTubePlayer 
              video={video}
              width="100%"
              height="100%"
              autoplay={true}
              className="absolute inset-0"
            />
            {/* Close button */}
            <button
              onClick={handleClosePlayer}
              className="absolute top-2 right-2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 transition-colors"
              aria-label="Close player"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full group cursor-pointer" onClick={handlePlayClick}>
            {/* Thumbnail */}
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://img.youtube.com/vi/default/mqdefault.jpg';
              }}
            />
            
            {/* Play button overlay */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="bg-red-600 hover:bg-red-700 rounded-full p-3 transform group-hover:scale-110 transition-transform shadow-lg">
                {isPlayerLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                ) : (
                  <PlayIcon className="w-6 h-6 text-white ml-0.5" />
                )}
              </div>
            </div>
            
            {/* Duration badge */}
            {formatDuration(video.duration) && (
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                {formatDuration(video.duration)}
              </div>
            )}
            
            {/* YouTube badge */}
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YouTube
            </div>
          </div>
        )}
      </div>
      
      {/* Video Info Section */}
      <div className="p-3 flex-grow">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-9 h-9 rounded-full mt-0.5 bg-red-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
          </div>
          <div className="flex-grow overflow-hidden">
            <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-50 leading-snug line-clamp-2">
              {video.title}
            </h3>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 block truncate">
              {video.channelName}
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              YouTube • {formatUploadDate(video.uploadedAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeVideoCard;