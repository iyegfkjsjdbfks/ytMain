import React, { lazy, FC, MouseEvent, type React } from 'react';
import { Link } from 'react-router-dom';

import { EyeIcon, CalendarDaysIcon, PlayIcon } from '@heroicons/react/24/outline';

import { useWatchLater } from '../contexts/WatchLaterContext.tsx';
import { useToggle } from '../src/hooks/unifiedHooks.ts';
import { buildVideoUrl, buildChannelUrl, getAvatarFallback } from '../utils/componentUtils.tsx';

import { SaveIcon } from 'icons/UnifiedIcon.tsx';
import ImageWithFallback from 'ImageWithFallback.tsx';
import { IconButton } from 'ui/Button.tsx';

import type { Video } from '../types.ts';

interface SubscriptionVideoCardProps {
 video: Video;
 viewType?: 'grid' | 'list';
 showChannel?: boolean;
}

const SubscriptionVideoCard: React.FC<SubscriptionVideoCardProps> = ({
 video,
 viewType = 'grid',
 showChannel = true }) => {
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
 <div className={"fle}x space-x-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors">
 {/* Thumbnail */}
 <div className={"relativ}e flex-shrink-0">
 <Link to={videoUrl} className={"block}">
 <ImageWithFallback>
// FIXED:  src={video?.thumbnailUrl || ""}
// FIXED:  alt={video.title}
// FIXED:  className={"w}-48 h-28 object-cover rounded-lg"
 width={192}
 height={112}
 fallbackSrc={`https://picsum.photos/192/112?random=${video.id}`} />
 />
 <div className={"absolut}e bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
 {video.duration}
// FIXED:  </div>
 {video.isLive && (
 <div className={"absolut}e top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
 <div className={"w}-2 h-2 bg-white rounded-full animate-pulse" />
 <span>LIVE</span>
// FIXED:  </div>
 )}
// FIXED:  </Link>
// FIXED:  </div>

 {/* Content */}
 <div className={"flex}-1 min-w-0">
 <div className={"fle}x justify-between items-start">
 <div className={"flex}-1 min-w-0 pr-4">
 <Link to={videoUrl} className={"block}">
 <h3 className={"font}-medium text-neutral-900 dark:text-neutral-100 line-clamp-2 hover:text-red-600 dark:hover:text-red-500 transition-colors">
 {video.title}
// FIXED:  </h3>
// FIXED:  </Link>

 {showChannel && (
 <div className={"fle}x items-center space-x-2 mt-2">
 <Link to={channelUrl}>
 {video.channelAvatarUrl ? (
 <img>
// FIXED:  src={video.channelAvatarUrl}
// FIXED:  alt={video.channelName}
// FIXED:  className={"w}-6 h-6 rounded-full object-cover"
 loading="lazy" />
 />
 ) : (
 <div className={"w}-6 h-6 rounded-full bg-neutral-300 dark:bg-neutral-600 flex items-center justify-center text-xs font-medium text-neutral-600 dark:text-neutral-300">
 {avatarFallback}
// FIXED:  </div>
 )}
// FIXED:  </Link>
 <Link>
 to={channelUrl}
// FIXED:  className={"text}-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"/>
 {video.channelName}
// FIXED:  </Link>
// FIXED:  </div>
 )}

 <div className={"fle}x items-center space-x-4 mt-2 text-sm text-neutral-600 dark:text-neutral-400">
 <div className={"fle}x items-center space-x-1">
 <EyeIcon className={"w}-4 h-4" />
 <span>{video.views}</span>
// FIXED:  </div>
 <div className={"fle}x items-center space-x-1">
 <CalendarDaysIcon className={"w}-4 h-4" />
 <span>{video.uploadedAt}</span>
// FIXED:  </div>
// FIXED:  </div>
<p className={"text}-sm text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-2">
 {video.description}
// FIXED:  </p>
// FIXED:  </div>

 <div className={"flex}-shrink-0">
 <IconButton />
// FIXED:  onClick={(e) => handleToggleWatchLater(e)}
 variant="ghost"
 size="sm"
// FIXED:  className={`${isSaved ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-600 dark:text-neutral-400'} hover:text-blue-600 dark:hover:text-blue-400`}
// FIXED:  aria-label={isSaved ? 'Remove from Watch Later' : 'Add to Watch Later'}
 icon={<SaveIcon className={"w}-4 h-4" />}
 />
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
 }

 // Grid view (default)
 return (
 <div className={"group}">
 <div className={"relativ}e mb-3">
 <Link to={videoUrl} className={"block}">
 <ImageWithFallback>
// FIXED:  src={video?.thumbnailUrl || ""}
// FIXED:  alt={video.title}
// FIXED:  className={"w}-full aspect-video object-cover rounded-lg group-hover:rounded-none transition-all duration-200"
 width={320}
 height={180}
 fallbackSrc={`https://picsum.photos/320/180?random=${video.id}`} />
 />
 <div className={"absolut}e bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
 {video.duration}
// FIXED:  </div>
 {video.isLive && (
 <div className={"absolut}e top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
 <div className={"w}-2 h-2 bg-white rounded-full animate-pulse" />
 <span>LIVE</span>
// FIXED:  </div>
 )}
 <div className={"absolut}e inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg group-hover:rounded-none flex items-center justify-center">
 <PlayIcon className={"w}-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
// FIXED:  </div>
// FIXED:  </Link>
// FIXED:  </div>

 <div className={"fle}x justify-between items-start">
 <div className={"fle}x space-x-3 flex-1 min-w-0">
 {showChannel && video.channelAvatarUrl && (
 <Link to={channelUrl} className={"flex}-shrink-0">
 <img>
// FIXED:  src={video.channelAvatarUrl}
// FIXED:  alt={video.channelName}
// FIXED:  className={"w}-9 h-9 rounded-full object-cover"
 loading="lazy" />
 />
// FIXED:  </Link>
 )}

 <div className={"flex}-1 min-w-0">
 <Link to={videoUrl} className={"block}">
 <h3 className={"font}-medium text-neutral-900 dark:text-neutral-100 line-clamp-2 hover:text-red-600 dark:hover:text-red-500 transition-colors">
 {video.title}
// FIXED:  </h3>
// FIXED:  </Link>

 {showChannel && (
 <Link>
 to={channelUrl}
// FIXED:  className={"bloc}k text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mt-1"/>
 {video.channelName}
// FIXED:  </Link>
 )}

 <div className={"fle}x items-center space-x-2 mt-1 text-sm text-neutral-600 dark:text-neutral-400">
 <span>{video.views}</span>
 <span>•</span>
 <span>{video.uploadedAt}</span>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 <div className={"flex}-shrink-0 ml-2">
 <IconButton />
// FIXED:  onClick={(e) => handleToggleWatchLater(e)}
 variant="ghost"
 size="sm"
// FIXED:  className={`${isSaved ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-600 dark:text-neutral-400'} hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity`}
// FIXED:  aria-label={isSaved ? 'Remove from Watch Later' : 'Add to Watch Later'}
 icon={<SaveIcon className={"w}-4 h-4" />}
 />
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default SubscriptionVideoCard;
