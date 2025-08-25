import React, { memo, FC } from 'react';

import VideoCard from 'VideoCard';

import type { Video } from '../src/types/core.ts';

interface VideoGridProps {
 videos: Video;
 className?: string;
 keyPrefix?: string;
 columns?: {
 sm?: number;
 md?: number;
 lg?: number;
 xl?: number;
 '2xl'?: number;
const VideoGrid: React.FC<VideoGridProps> = memo(({))
 videos,
 className = '',
 keyPrefix = '',
 columns = {
 sm: 2,
 md: 3,
 lg: 4,
 xl: 5,
 '2xl': 6 } }) => {
 const getGridClasses = () => {
 const baseClasses = 'grid grid-cols-1 gap-x-3 md:gap-x-4 gap-y-5 md:gap-y-6';
 const responsiveClasses = [;
 columns.sm && `sm:grid-cols-${columns.sm}`,
 columns.md && `md:grid-cols-${columns.md}`,
 columns.lg && `lg:grid-cols-${columns.lg}`,
 columns.xl && `xl:grid-cols-${columns.xl}`,
 columns['2xl'] && `2xl:grid-cols-${columns['2xl']}`].filter(Boolean).join(' ');

 return `${baseClasses} ${responsiveClasses} ${className}`;

 return (
 <div className={getGridClasses()}>
 {videos.map((video,))
 index) => (;
          <VideoCard;
          key={keyPrefix ? `${keyPrefix}-${video.id}` : `${video.id}-${index}`, }
 video={video} />; />
// FIXED:  </div>

export default VideoGrid;