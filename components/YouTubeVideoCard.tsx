// YouTube Video Card component for displaying YouTube search results
import React, { useState } from 'react';
import { YouTubeSearchResult } from '../services/googleSearchService';
import YouTubePlayer from './YouTubePlayer';
import { PlayIcon } from '@heroicons/react/24/solid';

interface YouTubeVideoCardProps {
  video: YouTubeSearchResult;
  className?: string;
}

const YouTubeVideoCard: React.FC<YouTubeVideoCardProps> = ({ video, className = '' }) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);

  const handlePlayClick = () => {
    setIsPlayerLoading(true);
    setShowPlayer(true);
    // Reset loading state after a short delay
    setTimeout(() => setIsPlayerLoading(false), 1000);
  };

  const handleClosePlayer = () => {
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

  return (
    <div className={`bg-white dark:bg-neutral-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-neutral-200 dark:border-neutral-800 ${className}`}>
      {/* Video Thumbnail/Player Section */}
      <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-800">
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
              className="w-full h-full object-cover"
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
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm line-clamp-2 mb-2 leading-tight">
          {video.title}
        </h3>
        
        {/* Channel and metadata */}
        <div className="space-y-1">
          <p className="text-neutral-600 dark:text-neutral-400 text-sm font-medium">
            {video.channelName}
          </p>
          
          {formatUploadDate(video.uploadedAt) && (
            <p className="text-neutral-500 dark:text-neutral-500 text-xs">
              {formatUploadDate(video.uploadedAt)}
            </p>
          )}
        </div>
        
        {/* Description preview */}
        {video.description && (
          <p className="text-neutral-600 dark:text-neutral-400 text-xs mt-2 line-clamp-2 leading-relaxed">
            {video.description}
          </p>
        )}
        
        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <button
            onClick={handlePlayClick}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <PlayIcon className="w-4 h-4" />
            Play
          </button>
          
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium py-2 px-3 rounded-lg transition-colors text-center"
          >
            Open in YouTube
          </a>
        </div>
      </div>
    </div>
  );
};

export default YouTubeVideoCard;