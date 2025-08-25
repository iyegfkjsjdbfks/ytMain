import React, { memo, FC } from 'react';
import { Link } from 'react-router-dom';

import { formatDistanceToNow } from 'date-fns';
import type { Video } from '../types';

interface VideoCardProps {
 video: Video;
 variant?: 'default' | 'compact' | 'studio';
 onClick?: ((video: Video) => void) | undefined
}

/**
 * VideoCard component displays a video thumbnail with metadata
 * Can be displayed in different variants: default, compact, or studio
 */
const VideoCard: React.FC<VideoCardProps> = React.memo(({ video, variant = 'default', onClick }) => {
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
 viewCount,
 likeCount,
 commentCount,
 publishedAt } = video;

 const handleClick = () => {
 if (onClick) {
 onClick(video);
 };

 const formattedDate =
 publishedAt || createdAt
 ? formatDistanceToNow(new Date(publishedAt || createdAt), {
 addSuffix: true })
 : '';

 // Use viewCount if available, fallback to views
 const actualViewCount =
 viewCount ||
 (typeof views === 'string' ? parseInt(views, 10) : views) ||
 0;
 const formattedViews =
 actualViewCount > 999999
 ? `${(actualViewCount / 1000000).toFixed(1)}M`
 : actualViewCount > 999
 ? `${(actualViewCount / 1000).toFixed(1)}K`
 : actualViewCount.toString();

 const formattedLikes =
 likeCount && likeCount > 999
 ? `${(likeCount / 1000).toFixed(1)}K`
 : likeCount?.toString() || '0';

 const formattedComments =
 commentCount && commentCount > 999
 ? `${(commentCount / 1000).toFixed(1)}K`
 : commentCount?.toString() || '0';

 const formatDuration = (seconds) => {
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
 <div>
// FIXED:  className={'fle}x space-x-2 mb-2 hover:bg-gray-100 rounded p-1 cursor-pointer' />
// FIXED:  onClick={(e) => handleClick(e)}
 >
 <div className={'relativ}e flex-shrink-0 w-40 h-24'>
 <Link to={`/watch/${id}`}>
 <img>
// FIXED:  src={thumbnailUrl}
// FIXED:  alt={title}
// FIXED:  className={'w}-full h-full object-cover rounded' />
 />
 <div className={'absolut}e bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded-sm font-medium'>
 {formatDuration(
 typeof duration === 'string'
 ? parseInt(duration, 10)
 : duration
 )}
// FIXED:  </div>
// FIXED:  </Link>
// FIXED:  </div>
 <div className={'flex}-grow min-w-0'>
 <Link to={`/watch/${id}`} className={'block}'>
 <h3 className={'font}-medium text-sm line-clamp-2 mb-1'>{title}</h3>
// FIXED:  </Link>
 <Link to={`/channel/${channelId}`} className={'block}'>
 <p className={'text}-xs text-gray-600'>{channelName}</p>
// FIXED:  </Link>
 <p className={'text}-xs text-gray-600'>
 {formattedViews} views • {formattedDate}
// FIXED:  </p>
 {(likeCount || commentCount) && (
 <div className={'fle}x items-center space-x-3 text-xs text-gray-500 mt-1'>
 {likeCount && (
 <span className={'fle}x items-center'>
 <svg>
// FIXED:  className={'w}-3 h-3 mr-1'
 fill='currentColor'
 viewBox='0 0 20 20'/>
 <path d='M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z' />
// FIXED:  </svg>
 {formattedLikes}
// FIXED:  </span>
 )}
 {commentCount && (
 <span className={'fle}x items-center'>
 <svg>
// FIXED:  className={'w}-3 h-3 mr-1'
 fill='currentColor'
 viewBox='0 0 20 20'/>
 <path>
 fillRule='evenodd'
 d='M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z'
 clipRule='evenodd' />
 />
// FIXED:  </svg>
 {formattedComments}
// FIXED:  </span>
 )}
// FIXED:  </div>
 )}
// FIXED:  </div>
// FIXED:  </div>
 );
 }

 if (variant === 'studio') {
 return (
 <div>
// FIXED:  className={'borde}r border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer' />
// FIXED:  onClick={(e) => handleClick(e)}
 >
 <div className={'fle}x p-3'>
 <div className={'relativ}e w-40 h-24 flex-shrink-0'>
 <Link to={`/studio/videos/edit/${id}`}>
 <img>
// FIXED:  src={thumbnailUrl}
// FIXED:  alt={title}
// FIXED:  className={'w}-full h-full object-cover rounded' />
 />
 <div className={'absolut}e bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded-sm font-medium'>
 {formatDuration(
 typeof duration === 'string'
 ? parseInt(duration, 10)
 : duration
 )}
// FIXED:  </div>
// FIXED:  </Link>
// FIXED:  </div>

 <div className={'ml}-3 flex-grow'>
 <Link to={`/studio/videos/edit/${id}`} className={'block}'>
 <h3 className={'font}-medium line-clamp-2 mb-1'>{title}</h3>
// FIXED:  </Link>
 <p className={'text}-sm text-gray-600 line-clamp-2 mb-1'>
 {description}
// FIXED:  </p>
 <div className={'fle}x items-center text-xs text-gray-500'>
 <span>{formattedDate}</span>
 <span className={'mx}-1'>•</span>
 <span>{formattedViews} views</span>
 <span className={'mx}-1'>•</span>
 <span>
// FIXED:  className={
 video.visibility === 'public'
 ? 'text-green-600'
 : 'text-yellow-600'
 }/>
 {video.visibility}
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </div>

 <div className={'ml}-2 flex flex-col space-y-2'>
 <button className={'p}-1 hover:bg-gray-200 rounded'>
 <svg>
 xmlns='http://www.w3.org/2000/svg'
// FIXED:  className={'h}-5 w-5'
 fill='none'
 viewBox='0 0 24 24'
 stroke='currentColor'/>
 <path>
 strokeLinecap='round'
 strokeLinejoin='round'
 strokeWidth={2}
 d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' />
 />
// FIXED:  </svg>
// FIXED:  </button>
 <button className={'p}-1 hover:bg-gray-200 rounded'>
 <svg>
 xmlns='http://www.w3.org/2000/svg'
// FIXED:  className={'h}-5 w-5'
 fill='none'
 viewBox='0 0 24 24'
 stroke='currentColor'/>
 <path>
 strokeLinecap='round'
 strokeLinejoin='round'
 strokeWidth={2}
 d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
 />
// FIXED:  </svg>
// FIXED:  </button>
 <button className={'p}-1 hover:bg-gray-200 rounded'>
 <svg>
 xmlns='http://www.w3.org/2000/svg'
// FIXED:  className={'h}-5 w-5'
 fill='none'
 viewBox='0 0 24 24'
 stroke='currentColor'/>
 <path>
 strokeLinecap='round'
 strokeLinejoin='round'
 strokeWidth={2}
 d='M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z' />
 />
// FIXED:  </svg>
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
 }

 // Default variant
 return (
 <div className={'mb}-4'>
 <div className={'relative}'>
 <Link to={`/watch/${id}`}>
 <img>
// FIXED:  src={thumbnailUrl}
// FIXED:  alt={title}
// FIXED:  className={'w}-full aspect-video object-cover rounded-lg' />
 />
 <div className={'absolut}e bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded-sm font-medium'>
 {formatDuration(
 typeof duration === 'string' ? parseInt(duration, 10) : duration
 )}
// FIXED:  </div>
// FIXED:  </Link>
// FIXED:  </div>
 <div className={'mt}-2 flex'>
 {channelAvatarUrl && (
 <Link to={`/channel/${channelId}`} className={'flex}-shrink-0 mr-2'>
 <img>
// FIXED:  src={channelAvatarUrl}
// FIXED:  alt={channelName}
// FIXED:  className={'w}-9 h-9 rounded-full' />
 />
// FIXED:  </Link>
 )}
 <div>
 <Link to={`/watch/${id}`} className={'block}'>
 <h3 className={'font}-medium line-clamp-2 mb-1'>{title}</h3>
// FIXED:  </Link>
 <Link to={`/channel/${channelId}`} className={'block}'>
 <p className={'text}-sm text-gray-600'>{channelName}</p>
// FIXED:  </Link>
 <p className={'text}-sm text-gray-600'>
 {formattedViews} views • {formattedDate}
// FIXED:  </p>
 {(likeCount || commentCount) && (
 <div className={'fle}x items-center space-x-4 text-sm text-gray-500 mt-1'>
 {likeCount && (
 <span className={'fle}x items-center'>
 <svg>
// FIXED:  className={'w}-4 h-4 mr-1'
 fill='currentColor'
 viewBox='0 0 20 20'/>
 <path d='M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z' />
// FIXED:  </svg>
 {formattedLikes}
// FIXED:  </span>
 )}
 {commentCount && (
 <span className={'fle}x items-center'>
 <svg>
// FIXED:  className={'w}-4 h-4 mr-1'
 fill='currentColor'
 viewBox='0 0 20 20'/>
 <path>
 fillRule='evenodd'
 d='M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z'
 clipRule='evenodd' />
 />
// FIXED:  </svg>
 {formattedComments}
// FIXED:  </span>
 )}
// FIXED:  </div>
 )}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
 }
);

export default VideoCard;
