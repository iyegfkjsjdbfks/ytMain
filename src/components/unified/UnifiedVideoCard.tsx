import React, { useState, memo, lazy, MouseEvent } from 'react';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
const HeartIconSolid = HeartSolidIcon;
import { Link } from 'react-router-dom';
import { formatRelativeTime, cn } from '../../lib/utils';
import { UnifiedButton } from './UnifiedButton';
import type { Video } from '../../types/core';
import { /** * Unified Video Card Component * Consolidates all video card variants into a single, comprehensive component */ PlayIcon, EyeIcon, ClockIcon, HeartIcon, ShareIcon, BookmarkIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';

export type VideoCardVariant =
 | 'default'
 | 'compact'
 | 'list'
 | 'grid'
 | 'shorts';
export type VideoCardSize = 'sm' | 'md' | 'lg';

export interface UnifiedVideoCardProps {
 video: Video;
 variant?: VideoCardVariant;
 size?: VideoCardSize;
 showChannel?: boolean;
 showDescription?: boolean;
 showActions?: boolean;
 showDuration?: boolean;
 showViews?: boolean;
 showDate?: boolean;
 isLiked?: boolean;
 isSaved?: boolean;
 onLike?: (videoId) => void;
 onSave?: (video: Video) => void;
 onShare?: (video: Video) => void;
 onChannelClick?: (channelName) => void;
 className?: string;
 keyPrefix?: string;
}

// Variant-specific styles
const variantStyles: Record<
 VideoCardVariant,
 {
 container: string;
 thumbnail: string;
 content: string;
 title: string;
 meta: string;
 }
> = {
 default: {
 container: 'flex flex-col space-y-3',
 thumbnail: 'aspect-video w-full',
 content: 'flex space-x-3',
 title: 'font-medium text-neutral-900 dark:text-neutral-100 line-clamp-2',
 meta: 'text-sm text-neutral-600 dark:text-neutral-400' },
 compact: {
 container: 'flex space-x-3',
 thumbnail: 'w-40 aspect-video flex-shrink-0',
 content: 'flex-1 min-w-0',
 title:
 'font-medium text-neutral-900 dark:text-neutral-100 line-clamp-2 text-sm',
 meta: 'text-xs text-neutral-600 dark:text-neutral-400' },
 list: {
 container: 'flex space-x-4 p-4',
 thumbnail: 'w-48 aspect-video flex-shrink-0',
 content: 'flex-1 min-w-0',
 title: 'font-medium text-neutral-900 dark:text-neutral-100 line-clamp-2',
 meta: 'text-sm text-neutral-600 dark:text-neutral-400' },
 grid: {
 container: 'flex flex-col space-y-2',
 thumbnail: 'aspect-video w-full',
 content: 'space-y-1',
 title:
 'font-medium text-neutral-900 dark:text-neutral-100 line-clamp-2 text-sm',
 meta: 'text-xs text-neutral-600 dark:text-neutral-400' },
 shorts: {
 container: 'flex flex-col',
 thumbnail: 'aspect-[9/16] w-full',
 content: 'p-3 space-y-2',
 title: 'font-medium text-white line-clamp-2 text-sm',
 meta: 'text-xs text-white/80' };

// Size-specific styles
const sizeStyles: Record<
 VideoCardSize,
 {
 thumbnail: string;
 title: string;
 avatar: string;
 }
> = {
 sm: {
 thumbnail: 'rounded-md',
 title: 'text-sm',
 avatar: 'w-6 h-6' },
 md: {
 thumbnail: 'rounded-lg',
 title: 'text-base',
 avatar: 'w-8 h-8' },
 lg: {
 thumbnail: 'rounded-xl',
 title: 'text-lg',
 avatar: 'w-10 h-10' };

export const UnifiedVideoCard = memo<UnifiedVideoCardProps>(
 ({
 video,
 variant = 'default',
 size = 'md',
 showChannel = true,
 showDescription = false,
 showActions = false,
 showDuration = true,
 showViews = true,
 showDate = true,
 isLiked = false,
 isSaved = false,
 onLike,
 onSave,
 onShare,
 onChannelClick,
 className,
 keyPrefix = 'video' }) => {
 const [imageLoaded, setImageLoaded] = useState<boolean>(false);
 const [imageError, setImageError] = useState<boolean>(false);

 const styles = variantStyles[variant];
 const sizeStyle = sizeStyles[size];

 const videoUrl = `/watch?v=${video.id}`;
 const channelUrl = `/channel/${encodeURIComponent(video.channelName)}`;

 const handleLike = (e: React.MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 onLike?.(video.id);
 };

 const handleSave = (e: React.MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 onSave?.(video);
 };

 const handleShare = (e: React.MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 onShare?.(video);
 };

 const handleChannelClick = (e: React.MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 onChannelClick?.(video.channelName);
 };

 const ThumbnailContent = () => (
 <div
// FIXED:  className={cn(
 'relative group overflow-hidden',
 styles.thumbnail,
 sizeStyle.thumbnail
 )} />
 >
 {/* Thumbnail Image */}
 <Link to={videoUrl} className='block w-full h-full'>
 {!imageError ? (
 <img
// FIXED:  src={video.thumbnailUrl}
// FIXED:  alt={video.title}
// FIXED:  className={cn(
 'w-full h-full object-cover transition-all duration-300',
 'group-hover:scale-105',
 !imageLoaded &&
 'bg-neutral-200 dark:bg-neutral-800 animate-pulse'
 )} />
 onLoad={() => setImageLoaded(true)}
 onError={() => setImageError(true)}
 loading='lazy'
 />
 ) : (
 <div className='w-full h-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center'>
 <PlayIcon className='w-8 h-8 text-neutral-400' />
// FIXED:  </div>
 )}

 {/* Overlay on hover */}
 <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center'>
 <PlayIcon className='w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
// FIXED:  </div>
// FIXED:  </Link>

 {/* Duration Badge */}
 {showDuration && video.duration && (
 <div className='absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded'>
 {video.duration}
// FIXED:  </div>
 )}

 {/* Live Badge */}
 {video.isLive && (
 <div className='absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center space-x-1'>
 <div className='w-2 h-2 bg-white rounded-full animate-pulse' />
 <span>LIVE</span>
// FIXED:  </div>
 )}

 {/* Actions Overlay */}
 {showActions && (
 <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
 <div className='flex flex-col space-y-1'>
 <UnifiedButton
 variant='ghost'
 size='xs' />
// FIXED:  onClick={(e) => handleLike(e)}
// FIXED:  className='bg-black/50 text-white hover:bg-black/70'
 >
 {isLiked ? (
 <HeartIconSolid className='w-4 h-4 text-red-500' />
 ) : (
 <HeartIcon className='w-4 h-4' />
 )}
// FIXED:  </UnifiedButton>

 <UnifiedButton
 variant='ghost'
 size='xs' />
// FIXED:  onClick={(e) => handleSave(e)}
// FIXED:  className='bg-black/50 text-white hover:bg-black/70'
 >
 <BookmarkIcon
// FIXED:  className={cn('w-4 h-4', isSaved && 'fill-current')} />
 />
// FIXED:  </UnifiedButton>

 <UnifiedButton
 variant='ghost'
 size='xs' />
// FIXED:  onClick={(e) => handleShare(e)}
// FIXED:  className='bg-black/50 text-white hover:bg-black/70'
 >
 <ShareIcon className='w-4 h-4' />
// FIXED:  </UnifiedButton>
// FIXED:  </div>
// FIXED:  </div>
 )}
// FIXED:  </div>
 );

 const ContentSection = () => (
 <div className={styles.content}>
 {/* Channel Avatar (for default and list variants) */}
 {showChannel &&
 video.channelAvatarUrl &&
 (variant === 'default' || variant === 'list') && (
 <Link
 to={channelUrl} />
// FIXED:  onClick={(e) => handleChannelClick(e)}
// FIXED:  className='flex-shrink-0'
 >
 <img
// FIXED:  src={video.channelAvatarUrl}
// FIXED:  alt={video.channelName}
// FIXED:  className={cn('rounded-full object-cover', sizeStyle.avatar)} />
 />
// FIXED:  </Link>
 )}

 {/* Video Info */}
 <div className='flex-1 min-w-0 space-y-1'>
 {/* Title */}
 <Link to={videoUrl} className='block'>
 <h3
// FIXED:  className={cn(
 styles.title,
 sizeStyle.title,
 'hover:text-red-600 dark:hover:text-red-400 transition-colors'
 )} />
 >
 {video.title}
// FIXED:  </h3>
// FIXED:  </Link>

 {/* Channel Name */}
 {showChannel && (
 <Link
 to={channelUrl} />
// FIXED:  onClick={(e) => handleChannelClick(e)}
// FIXED:  className={cn(
 styles.meta,
 'hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors'
 )}
 >
 {video.channelName}
// FIXED:  </Link>
 )}

 {/* Meta Information */}
 <div className={cn(styles.meta, 'flex items-center space-x-2')}>
 {showViews && (
 <div className='flex items-center space-x-1'>
 <EyeIcon className='w-3 h-3' />
 <span>{video.views}</span>
// FIXED:  </div>
 )}

 {showDate && (
 <div className='flex items-center space-x-1'>
 <ClockIcon className='w-3 h-3' />
 <span>{formatRelativeTime(video.uploadedAt)}</span>
// FIXED:  </div>
 )}
// FIXED:  </div>

 {/* Description */}
 {showDescription && video.description && (
 <p className={cn(styles.meta, 'line-clamp-2')}>
 {video.description}
// FIXED:  </p>
 )}
// FIXED:  </div>

 {/* Actions Menu */}
 {showActions && variant !== 'shorts' && (
 <div className='flex-shrink-0'>
 <UnifiedButton variant='ghost' size='xs'>
 <EllipsisVerticalIcon className='w-4 h-4' />
// FIXED:  </UnifiedButton>
// FIXED:  </div>
 )}
// FIXED:  </div>
 );

 return (
 <article
// FIXED:  className={cn(
 'group transition-all duration-200 hover:shadow-lg',
 variant === 'shorts' &&
 'bg-black text-white rounded-lg overflow-hidden',
 variant === 'list' &&
 'hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg',
 styles.container,
 className
 )}
 data-video-id={video.id}
// FIXED:  data-testid={`${keyPrefix}-${video.id}`} />
 >
 <ThumbnailContent />
 <ContentSection />
// FIXED:  </article>
 );
 }
);

UnifiedVideoCard.displayName = 'UnifiedVideoCard';

export default UnifiedVideoCard;
