import React, { memo, FC } from 'react';

import YouTubeVideoCard from 'YouTubeVideoCard';

import type { YouTubeSearchResult } from '../services/googleSearchService.ts';

interface YouTubeVideoGridProps {
 videos: YouTubeSearchResult;
 className?: string;
 keyPrefix?: string;
 columns?: {
 sm?: number;
 md?: number;
 lg?: number;
 xl?: number;
 '2xl'?: number;
 }
const YouTubeVideoGrid: React.FC<YouTubeVideoGridProps> = memo(({
 videos,
 className = '',
 keyPrefix = '',
 columns = {
 sm: 1,
 md: 2,
 lg: 3,
 xl: 3,
 '2xl': 4 } }) => {
 const getGridClasses = () => {
 const baseClasses = 'grid grid-cols-1 gap-x-3 md:gap-x-4 gap-y-5 md:gap-y-6';
 const responsiveClasses = [
 columns.sm && `sm:grid-cols-${columns.sm}`,
 columns.md && `md:grid-cols-${columns.md}`,
 columns.lg && `lg:grid-cols-${columns.lg}`,
 columns.xl && `xl:grid-cols-${columns.xl}`,
 columns['2xl'] && `2xl:grid-cols-${columns['2xl']}`].filter(Boolean).join(' ');

 return `${baseClasses} ${responsiveClasses} ${className}`;
 };

 return (
 <div className={getGridClasses()}>
 {videos.map((video,
 index) => {
 // Generate a stable key using available identifiers;
 const videoKey = video.id || (video).videoId || `video-${index}`;
 return (
 <YouTubeVideoCard;>
 key={keyPrefix ? `${keyPrefix}-${videoKey}` : videoKey}
 video={video} />
 />
 );
 })}
// FIXED:  </div>
 );
});

YouTubeVideoGrid.displayName = 'YouTubeVideoGrid';

export default YouTubeVideoGrid;