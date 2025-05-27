
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Video } from '../types';


interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = React.memo(({ video }) => {
  const channelLink = `/channel/${encodeURIComponent(video.channelName)}`;
  const navigate = useNavigate(); // Initialize useNavigate

  const handleChannelNavigation = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation(); // Prevent outer link navigation
    navigate(channelLink);
  };

  const handleChannelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleChannelNavigation(e);
    }
  };

  return (
    <Link to={`/watch/${video.id}`} className="block group" aria-label={`Watch ${video.title}`}>
      <div className="bg-transparent dark:bg-transparent rounded-xl overflow-hidden shadow-none hover:shadow-neutral-300/30 dark:hover:shadow-neutral-700/30 transition-shadow duration-300 flex flex-col h-full">
        <div className="relative aspect-video">
          <img 
            src={video.thumbnailUrl} 
            alt={`Thumbnail for ${video.title}`} 
            className="w-full h-full object-cover rounded-lg" 
            loading="lazy"
          />
          <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded-sm">
            {video.duration}
          </div>
        </div>
        <div className="p-3 flex-grow">
          <div className="flex items-start space-x-3">
            <div 
              role="link"
              tabIndex={0}
              onClick={handleChannelNavigation}
              onKeyDown={handleChannelKeyDown}
              className="flex-shrink-0 cursor-pointer" 
              aria-label={`Go to ${video.channelName} channel`}
            >
              <img 
                src={video.channelAvatarUrl} 
                alt={`${video.channelName} channel avatar`} 
                className="w-9 h-9 rounded-full mt-0.5" 
                loading="lazy"
              />
            </div>
            <div className="flex-grow overflow-hidden">
              <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-50 leading-snug max-h-11 overflow-hidden text-ellipsis whitespace-normal break-words" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {video.title}
              </h3>
              <div 
                role="link"
                tabIndex={0}
                onClick={handleChannelNavigation}
                onKeyDown={handleChannelKeyDown}
                className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 mt-1.5 block truncate transition-colors cursor-pointer"
                aria-label={`Go to ${video.channelName} channel name`}
              >
                {video.channelName}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {video.views} &bull; {video.uploadedAt}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});
VideoCard.displayName = 'VideoCard'; // For better debugging

export default VideoCard;
