
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { useWatchLater } from '../contexts/WatchLaterContext';
import { buildCardClasses, buildTruncateClasses, buildVideoUrl, buildChannelUrl, getAvatarFallback } from '../utils/componentUtils';
import { SaveIcon } from './icons/UnifiedIcon';
import { IconButton } from './ui/Button';
import { useToggle } from '../hooks/unifiedHooks';


interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = React.memo(({ video }) => {
  const { addToWatchLater, removeFromWatchLater, isWatchLater } = useWatchLater();
  const [isSaved, toggleSaved] = useToggle(isWatchLater(video.id));
  const navigate = useNavigate();

  const videoUrl = buildVideoUrl(video.id);
  const channelUrl = buildChannelUrl(encodeURIComponent(video.channelName));
  const avatarFallback = getAvatarFallback(video.channelName);

  const handleToggleWatchLater = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaved) {
      removeFromWatchLater(video.id);
    } else {
      addToWatchLater(video);
    }
    toggleSaved();
  };

  const handleChannelNavigation = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    navigate(channelUrl);
  };

  const handleChannelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleChannelNavigation(e);
    }
  };

  return (
    <Link to={videoUrl} className="block group cursor-pointer" aria-label={`Watch ${video.title}`}>
      <div className="bg-transparent dark:bg-transparent rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-neutral-300/30 dark:hover:shadow-neutral-700/30 flex flex-col h-full">
        <div className="relative aspect-video">
          <img 
            src={video.thumbnailUrl} 
            alt={`Thumbnail for ${video.title}`} 
            className="w-full h-full object-cover rounded-lg" 
            loading="lazy"
          />
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
            {video.duration}
          </div>
          <IconButton
            onClick={handleToggleWatchLater}
            variant={isSaved ? 'primary' : 'ghost'}
            size="sm"
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white transition-colors z-20 group-hover:opacity-100 opacity-0 focus:opacity-100"
            aria-label={isSaved ? 'Remove from Watch Later' : 'Save to Watch Later'}
            title={isSaved ? 'Remove from Watch Later' : 'Save to Watch Later'}
          >
            <SaveIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </IconButton>
        </div>
        <div className="p-3 flex-grow">
          <div className="flex items-start space-x-3">
            <div 
              role="button"
              tabIndex={0}
              onClick={handleChannelNavigation}
              onKeyDown={handleChannelKeyDown}
              className="flex-shrink-0 cursor-pointer z-10 relative" 
              aria-label={`Go to ${video.channelName} channel`}
            >
              {video.channelAvatarUrl ? (
                <img 
                  src={video.channelAvatarUrl} 
                  alt={`${video.channelName} channel avatar`} 
                  className="w-9 h-9 rounded-full mt-0.5" 
                  loading="lazy"
                />
              ) : (
                <div className="w-9 h-9 rounded-full mt-0.5 bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                  {avatarFallback}
                </div>
              )}
            </div>
            <div className="flex-grow overflow-hidden">
              <h3 className={buildTruncateClasses(2, 'text-sm font-medium text-neutral-800 dark:text-neutral-50 leading-snug')}>
                {video.title}
              </h3>
              <div 
                role="button"
                tabIndex={0}
                onClick={handleChannelNavigation}
                onKeyDown={handleChannelKeyDown}
                className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 mt-1.5 block truncate transition-colors cursor-pointer z-10 relative"
                aria-label={`Go to ${video.channelName} channel`}
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
