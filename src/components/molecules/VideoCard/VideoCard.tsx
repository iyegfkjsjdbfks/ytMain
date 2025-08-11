import { User } from '../types';

/// <reference types="react/jsx-runtime" />
import React from 'react';
import { Link } from 'react-router-dom';

import { User, MoreVertical } from 'lucide-react';

import { useState } from 'react';

import { Button } from '@/components/atoms/Button';

import { formatNumber, getTimeAgo, cn } from '@/lib/utils';
import type { VideoCardProps as VideoCardPropsBase } from '@/types';

// Simple image component since we're not using Next.js
const Image = ({ src, alt, width, height, className, fill, sizes, ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn(className, { 'w-full h-full object-cover': fill })}
      {...props}
    />
  );
};

export interface VideoCardProps extends Omit<VideoCardPropsBase, 'onMoreClick'> {
  onMoreClick: (videoId: any) => void;
}

export const VideoCard = ({
  id,
  title,
  channelName,
  channelId,
  thumbnailUrl,
  viewCount,
  publishedAt,
  duration,
  avatarUrl,
  showChannelInfo = true,
  className,
  onMoreClick,
}: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn('flex flex-col space-y-2 group', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
        <Link to={`/watch?v=${id}`} className="block w-full h-full">
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className={cn(
              'object-cover transition-transform duration-300',
              isHovered ? 'scale-105' : 'scale-100',
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
          {formatDuration(duration)}
        </div>
      </div>

      <div className="flex space-x-2">
        {showChannelInfo && (
          <Link to={`/channel/${channelId}`} className="shrink-0">
            <div className="w-9 h-9 rounded-full bg-muted overflow-hidden">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={channelName}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted-foreground/10">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>
          </Link>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-sm line-clamp-2">
              <Link to={`/watch?v=${id}`} className="hover:text-primary">
                {title}
              </Link>
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onMoreClick(id)}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </div>

          {showChannelInfo && (
            <div className="text-xs text-muted-foreground">
              <Link to={`/channel/${channelId}`} className="hover:text-foreground">
                {channelName}
              </Link>
            </div>
          )}

          <div className="flex items-center text-xs text-muted-foreground">
            <span>{formatNumber(viewCount)} views</span>
            <span className="mx-1">•</span>
            <span>{getTimeAgo(publishedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format duration (moved from utils.ts for self-containment)
function formatDuration(seconds: any): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return [h, m, s]
    .filter((v, i) => v > 0 || i > 0)
    .map(v => v.toString().padStart(2, '0'))
    .join(':');
}


declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

