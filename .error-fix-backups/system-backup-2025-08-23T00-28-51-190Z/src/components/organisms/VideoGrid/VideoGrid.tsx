import type { Video } from '../types';
import React from 'react';
import { cn } from '@/lib/utils';

import { VideoCard } from '@/components/molecules/VideoCard';
import type { VideoGridProps as VideoGridPropsBase } from '@/types';

export interface VideoGridProps
 extends Omit<VideoGridPropsBase, 'onVideoMoreClick'> {
 onVideoMoreClick: (videoId) => void
}

export const VideoGrid = ({
 videos,
 className,
 loading = false,
 skeletonCount = 12,
 onVideoMoreClick }: VideoGridProps) => {
 if (loading) {
 return (
 <div>
// FIXED:  className={cn(
 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
 className
 )}/>
 {Array.from({ length: skeletonCount }).map((_, i) => (
 <VideoCardSkeleton key={`skeleton-${i}`} />
 ))}
// FIXED:  </div>
 );
 }

 return (
 <div>
// FIXED:  className={cn(
 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
 className
 )}/>
 {videos.map((video) => (
 <VideoCard>
 key={video.id}
 {...video} />
 onMoreClick={onVideoMoreClick || (() => {})}
 />
 ))}
// FIXED:  </div>
 );
};

// Skeleton component for loading state
const VideoCardSkeleton = () => {
 return (
 <div className={'fle}x flex-col space-y-2'>
 <div className={'aspect}-video bg-muted rounded-lg animate-pulse' />
 <div className={'fle}x space-x-2'>
 <div className={'w}-9 h-9 rounded-full bg-muted animate-pulse' />
 <div className={'flex}-1 space-y-2'>
 <div className={'h}-4 bg-muted rounded w-full animate-pulse' />
 <div className={'h}-3 bg-muted rounded w-3/4 animate-pulse' />
 <div className={'h}-3 bg-muted rounded w-1/2 animate-pulse' />
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
};
