import React, { useEffect, useState, lazy, FC, MouseEvent } from 'react';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
const HeartIconSolid = HeartSolidIcon;
import { Link } from 'react-router-dom';
import { formatRelativeTime, cn } from '@/lib/utils';
import { UnifiedButton } from '@/components/unified';
import type { Playlist } from '../../../types/core';
import { /** * Playlist Card Component * Displays playlist information with actions */ PlayIcon, EllipsisVerticalIcon, LockClosedIcon, EyeSlashIcon, ClockIcon, VideoCameraIcon, HeartIcon, ShareIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

export interface PlaylistCardProps {
  playlist: Playlist;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  showOwner?: boolean;
  isOwner?: boolean;
  isFollowed?: boolean;
  onPlay?: (playlist: Playlist) => void;
  onEdit?: (playlist: Playlist) => void;
  onDelete?: (playlist: Playlist) => void;
  onDuplicate?: (playlist: Playlist) => void;
  onFollow?: (playlist: Playlist) => void;
  onUnfollow?: (playlist: Playlist) => void;
  onShare?: (playlist: Playlist) => void;
  className?: string;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  variant = 'default',
  showActions = true,
  showOwner = true,
  isOwner = false,
  isFollowed = false,
  onPlay,
  onEdit,
  onDelete,
  onDuplicate,
  onFollow,
  onUnfollow,
  onShare,
  className,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const playlistUrl = `/playlist?list=${playlist.id}`;
  const ownerUrl = `/channel/${encodeURIComponent(playlist.ownerName)}`;

  const getVisibilityIcon = () => {
    switch (playlist.visibility) {
      case 'private':
        return <LockClosedIcon className='w-4 h-4' />;
      case 'unlisted':
        return <EyeSlashIcon className='w-4 h-4' />;
      default:
        return null;
    }
  };

  const getVisibilityText = () => {
    switch (playlist.visibility) {
      case 'private':
        return 'Private';
      case 'unlisted':
        return 'Unlisted';
      case 'public':
        return 'Public';
      default:
        return '';
    }
  };

  const handleAction = (action: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    setShowMenu(false);
  };

  const ThumbnailSection = () => (
    <div className='relative group'>
      <Link to={playlistUrl} className='block'>
        <div
          className={cn(
            'relative overflow-hidden bg-neutral-200 dark:bg-neutral-800',
            variant === 'compact' ? 'aspect-video w-32' : 'aspect-video w-full',
            'rounded-lg'
          )}
        >
          {!imageError && playlist.thumbnailUrl ? (
            <img
              src={playlist.thumbnailUrl}
              alt={playlist.title}
              className={cn(
                'w-full h-full object-cover transition-all duration-300',
                'group-hover:scale-105',
                !imageLoaded && 'opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading='lazy'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center'>
              <VideoCameraIcon className='w-8 h-8 text-neutral-400' />
            </div>
          )}

          {/* Overlay */}
          <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center'>
            <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-2'>
              <UnifiedButton
                variant='ghost'
                size='sm'
                onClick={handleAction(() => onPlay?.(playlist))}
                className='bg-black/50 text-white hover:bg-black/70'
              >
                <PlayIcon className='w-5 h-5' />
              </UnifiedButton>
            </div>
          </div>

          {/* Video count badge */}
          <div className='absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center space-x-1'>
            <VideoCameraIcon className='w-3 h-3' />
            <span>{playlist.videoCount}</span>
          </div>

          {/* Visibility indicator */}
          {playlist.visibility !== 'public' && (
            <div className='absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center space-x-1'>
              {getVisibilityIcon()}
              <span>{getVisibilityText()}</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );

  const ContentSection = () => (
    <div
      className={cn('flex-1 min-w-0', variant === 'compact' ? 'ml-3' : 'mt-3')}
    >
      {/* Title */}
      <Link to={playlistUrl} className='block'>
        <h3
          className={cn(
            'font-medium text-neutral-900 dark:text-neutral-100 line-clamp-2',
            'hover:text-red-600 dark:hover:text-red-400 transition-colors',
            variant === 'compact' ? 'text-sm' : 'text-base'
          )}
        >
          {playlist.title}
        </h3>
      </Link>

      {/* Owner */}
      {showOwner && (
        <Link
          to={ownerUrl}
          className={cn(
            'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100',
            'transition-colors block mt-1',
            variant === 'compact' ? 'text-xs' : 'text-sm'
          )}
        >
          {playlist.ownerName}
        </Link>
      )}

      {/* Description */}
      {variant === 'detailed' && playlist.description && (
        <p className='text-sm text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-2'>
          {playlist.description}
        </p>
      )}

      {/* Meta information */}
      <div
        className={cn(
          'flex items-center space-x-3 mt-2',
          variant === 'compact' ? 'text-xs' : 'text-sm',
          'text-neutral-500 dark:text-neutral-400'
        )}
      >
        <div className='flex items-center space-x-1'>
          <VideoCameraIcon className='w-3 h-3' />
          <span>{playlist.videoCount} videos</span>
        </div>

        {playlist.totalDuration && (
          <div className='flex items-center space-x-1'>
            <ClockIcon className='w-3 h-3' />
            <span>{playlist.totalDuration}</span>
          </div>
        )}

        <div className='flex items-center space-x-1'>
          <span>Updated {formatRelativeTime(playlist.updatedAt)}</span>
        </div>
      </div>

      {/* Tags */}
      {variant === 'detailed' && playlist.tags && playlist.tags.length > 0 && (
        <div className='flex flex-wrap gap-1 mt-2'>
          {playlist.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className='px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs rounded'
            >
              #{tag}
            </span>
          ))}
          {playlist.tags.length > 3 && (
            <span className='text-xs text-neutral-500'>
              +{playlist.tags.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );

  const ActionsSection = () =>
    showActions && (
      <div className='flex items-center space-x-2'>
        {/* Follow/Unfollow button */}
        {!isOwner && (
          <UnifiedButton
            variant={isFollowed ? 'secondary' : 'primary'}
            size='sm'
            onClick={handleAction(() =>
              isFollowed ? onUnfollow?.(playlist) : onFollow?.(playlist)
            )}
          >
            {isFollowed ? (
              <>
                <HeartIconSolid className='w-4 h-4 text-red-500' />
                Following
              </>
            ) : (
              <>
                <HeartIcon className='w-4 h-4' />
                Follow
              </>
            )}
          </UnifiedButton>
        )}

        {/* Share button */}
        <UnifiedButton
          variant='ghost'
          size='sm'
          onClick={handleAction(() => onShare?.(playlist))}
        >
          <ShareIcon className='w-4 h-4' />
        </UnifiedButton>

        {/* Menu button */}
        <div className='relative'>
          <UnifiedButton
            variant='ghost'
            size='sm'
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <EllipsisVerticalIcon className='w-4 h-4' />
          </UnifiedButton>

          {/* Dropdown menu */}
          {showMenu && (
            <div className='absolute right-0 top-full mt-1 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-lg border border-neutral-200 dark:border-neutral-700 z-50'>
              <div className='py-1'>
                {isOwner ? (
                  <>
                    <button
                      onClick={handleAction(() => onEdit?.(playlist))}
                      className='w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center space-x-2'
                    >
                      <PencilIcon className='w-4 h-4' />
                      <span>Edit playlist</span>
                    </button>
                    <button
                      onClick={handleAction(() => onDuplicate?.(playlist))}
                      className='w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center space-x-2'
                    >
                      <DocumentDuplicateIcon className='w-4 h-4' />
                      <span>Duplicate</span>
                    </button>
                    <button
                      onClick={handleAction(() => onDelete?.(playlist))}
                      className='w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2'
                    >
                      <TrashIcon className='w-4 h-4' />
                      <span>Delete playlist</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleAction(() => onDuplicate?.(playlist))}
                      className='w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center space-x-2'
                    >
                      <DocumentDuplicateIcon className='w-4 h-4' />
                      <span>Save to library</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );

  // Click outside to close menu
  React.useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
    return undefined;
  }, [showMenu]);

  return (
    <article
      className={cn(
        'group transition-all duration-200',
        variant === 'compact' ? 'flex items-start' : 'flex flex-col',
        variant === 'detailed' &&
          'p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm hover:shadow-md',
        className
      )}
      data-playlist-id={playlist.id}
    >
      <ThumbnailSection />
      <ContentSection />
      {variant !== 'compact' && <ActionsSection />}
    </article>
  );
};

export default PlaylistCard;


