
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName]: any;
    }
  }
}
// TODO: Fix import - import type React from 'react';

import {
  EyeIcon,
  CalendarDaysIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
// TODO: Fix import - import { Link } from 'react-router-dom';

import { useWatchLater } from '../contexts/WatchLaterContext';
import { useToggle } from '../src/hooks/unifiedHooks';
import { buildVideoUrl, buildChannelUrl, getAvatarFallback } from '../utils/componentUtils';

import { SaveIcon } from './icons/UnifiedIcon';
import ImageWithFallback from './ImageWithFallback';
import { IconButton } from './ui/Button';

import type { Video } from '../types';


interface SubscriptionVideoCardProps {
  video: Video;
  viewType?: 'grid' | 'list';
  showChannel?: boolean;
}

const SubscriptionVideoCard: React.FC<SubscriptionVideoCardProps> = ({
  video,
  viewType = 'grid',
  showChannel = true,
}) => {
  const { addToWatchLater, removeFromWatchLater, isWatchLater } = useWatchLater();
  const [isSaved, toggleSaved] = useToggle(isWatchLater(video.id));


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


  if (viewType === 'list') {
    return (
      <div className="flex space-x-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors">
        {/* Thumbnail */}
        <div className="relative flex-shrink-0">
          <Link to={videoUrl} className="block">
            <ImageWithFallback
              src={video?.thumbnailUrl || ""}
              alt={video.title}
              className="w-48 h-28 object-cover rounded-lg"
              width={192}
              height={112}
              fallbackSrc={`https://picsum.photos/192/112?random=${video.id}`}
            />
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
              {video.duration}
            </div>
            {video.isLive && (
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span>LIVE</span>
              </div>
            )}
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 pr-4">
              <Link to={videoUrl} className="block">
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100 line-clamp-2 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                  {video.title}
                </h3>
              </Link>

              {showChannel && (
                <div className="flex items-center space-x-2 mt-2">
                  <Link to={channelUrl}>
                    {video.channelAvatarUrl ? (
                      <img
                        src={video.channelAvatarUrl}
                        alt={video.channelName}
                        className="w-6 h-6 rounded-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-neutral-300 dark:bg-neutral-600 flex items-center justify-center text-xs font-medium text-neutral-600 dark:text-neutral-300">
                        {avatarFallback}
                      </div>
                    )}
                  </Link>
                  <Link
                    to={channelUrl}
                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  >
                    {video.channelName}
                  </Link>
                </div>
              )}

              <div className="flex items-center space-x-4 mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center space-x-1">
                  <EyeIcon className="w-4 h-4" />
                  <span>{video.views}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span>{video.uploadedAt}</span>
                </div>
              </div>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-2">
                {video.description}
              </p>
            </div>

            <div className="flex-shrink-0">
              <IconButton
                onClick={handleToggleWatchLater}
                variant="ghost"
                size="sm"
                className={`${isSaved ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-600 dark:text-neutral-400'} hover:text-blue-600 dark:hover:text-blue-400`}
                aria-label={isSaved ? 'Remove from Watch Later' : 'Add to Watch Later'}
                icon={<SaveIcon className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="group">
      <div className="relative mb-3">
        <Link to={videoUrl} className="block">
          <ImageWithFallback
            src={video?.thumbnailUrl || ""}
            alt={video.title}
            className="w-full aspect-video object-cover rounded-lg group-hover:rounded-none transition-all duration-200"
            width={320}
            height={180}
            fallbackSrc={`https://picsum.photos/320/180?random=${video.id}`}
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
            {video.duration}
          </div>
          {video.isLive && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>LIVE</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg group-hover:rounded-none flex items-center justify-center">
            <PlayIcon className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </Link>
      </div>

      <div className="flex justify-between items-start">
        <div className="flex space-x-3 flex-1 min-w-0">
          {showChannel && video.channelAvatarUrl && (
            <Link to={channelUrl} className="flex-shrink-0">
              <img
                src={video.channelAvatarUrl}
                alt={video.channelName}
                className="w-9 h-9 rounded-full object-cover"
                loading="lazy"
              />
            </Link>
          )}

          <div className="flex-1 min-w-0">
            <Link to={videoUrl} className="block">
              <h3 className="font-medium text-neutral-900 dark:text-neutral-100 line-clamp-2 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                {video.title}
              </h3>
            </Link>

            {showChannel && (
              <Link
                to={channelUrl}
                className="block text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mt-1"
              >
                {video.channelName}
              </Link>
            )}

            <div className="flex items-center space-x-2 mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              <span>{video.views}</span>
              <span>•</span>
              <span>{video.uploadedAt}</span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 ml-2">
          <IconButton
            onClick={handleToggleWatchLater}
            variant="ghost"
            size="sm"
            className={`${isSaved ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-600 dark:text-neutral-400'} hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity`}
            aria-label={isSaved ? 'Remove from Watch Later' : 'Add to Watch Later'}
            icon={<SaveIcon className="w-4 h-4" />}
          />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionVideoCard;
