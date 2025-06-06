import type React from 'react';

import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

import type { Video } from '../types';

interface VideoCardProps {
  video: Video;
  variant?: 'default' | 'compact' | 'studio';
  onClick?: ((video: Video) => void) | undefined;
}

/**
 * VideoCard component displays a video thumbnail with metadata
 * Can be displayed in different variants: default, compact, or studio
 */
const VideoCard: React.FC<VideoCardProps> = ({
  video,
  variant = 'default',
  onClick,
}) => {
  const {
    id,
    title,
    thumbnailUrl,
    views,
    createdAt,
    duration,
    channelName,
    channelAvatarUrl,
    channelId,
    description,
  } = video;

  const handleClick = () => {
    if (onClick) {
      onClick(video);
    }
  };

  const formattedDate = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : '';

  const viewsNumber = typeof views === 'string' ? parseInt(views, 10) : views;
  const formattedViews = viewsNumber > 999
    ? `${(viewsNumber / 1000).toFixed(1)}K`
    : viewsNumber.toString();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (variant === 'compact') {
    return (
      <div
        className="flex space-x-2 mb-2 hover:bg-gray-100 rounded p-1 cursor-pointer"
        onClick={handleClick}
      >
        <div className="relative flex-shrink-0 w-40 h-24">
          <Link to={`/watch/${id}`}>
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover rounded"
            />
            <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
              {formatDuration(typeof duration === 'string' ? parseInt(duration, 10) : duration)}
            </div>
          </Link>
        </div>
        <div className="flex-grow min-w-0">
          <Link to={`/watch/${id}`} className="block">
            <h3 className="font-medium text-sm line-clamp-2 mb-1">{title}</h3>
          </Link>
          <Link to={`/channel/${channelId}`} className="block">
            <p className="text-xs text-gray-600">{channelName}</p>
          </Link>
          <p className="text-xs text-gray-600">{formattedViews} views • {formattedDate}</p>
        </div>
      </div>
    );
  }

  if (variant === 'studio') {
    return (
      <div
        className="border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex p-3">
          <div className="relative w-40 h-24 flex-shrink-0">
            <Link to={`/studio/videos/edit/${id}`}>
              <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover rounded"
              />
              <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                {formatDuration(typeof duration === 'string' ? parseInt(duration, 10) : duration)}
              </div>
            </Link>
          </div>

          <div className="ml-3 flex-grow">
            <Link to={`/studio/videos/edit/${id}`} className="block">
              <h3 className="font-medium line-clamp-2 mb-1">{title}</h3>
            </Link>
            <p className="text-sm text-gray-600 line-clamp-2 mb-1">{description}</p>
            <div className="flex items-center text-xs text-gray-500">
              <span>{formattedDate}</span>
              <span className="mx-1">•</span>
              <span>{formattedViews} views</span>
              <span className="mx-1">•</span>
              <span className={video.visibility === 'public' ? 'text-green-600' : 'text-yellow-600'}>
                {video.visibility}
              </span>
            </div>
          </div>

          <div className="ml-2 flex flex-col space-y-2">
            <button className="p-1 hover:bg-gray-200 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="mb-4">
      <div className="relative">
        <Link to={`/watch/${id}`}>
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full aspect-video object-cover rounded-lg"
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
            {formatDuration(typeof duration === 'string' ? parseInt(duration, 10) : duration)}
          </div>
        </Link>
      </div>
      <div className="mt-2 flex">
        {channelAvatarUrl && (
          <Link to={`/channel/${channelId}`} className="flex-shrink-0 mr-2">
            <img
              src={channelAvatarUrl}
              alt={channelName}
              className="w-9 h-9 rounded-full"
            />
          </Link>
        )}
        <div>
          <Link to={`/watch/${id}`} className="block">
            <h3 className="font-medium line-clamp-2 mb-1">{title}</h3>
          </Link>
          <Link to={`/channel/${channelId}`} className="block">
            <p className="text-sm text-gray-600">{channelName}</p>
          </Link>
          <p className="text-sm text-gray-600">{formattedViews} views • {formattedDate}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
