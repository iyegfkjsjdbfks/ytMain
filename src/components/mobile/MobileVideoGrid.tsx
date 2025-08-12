import React, { useState, useEffect, useMemo, useCallback, memo, lazy } from 'react';
import { FixedSizeList } from 'react-window';

import { useIntersectionObserver } from '../../hooks/usePerformanceOptimization';
import type { Video } from '../../types/core';

interface MobileVideoGridProps {
 videos: Video;
 onVideoClick: (video: Video) => void;
 onLoadMore?: () => void;
 loading?: boolean;
 hasMore?: boolean;
 className?: string;
}

interface MobileVideoItemProps {
 index;
 style: React.CSSProperties;
 data: {
 videos: Video;
 onVideoClick: (video: Video) => void
 }
const MobileVideoItem = memo<MobileVideoItemProps>(({ index, style, data }: any) => {
 const { videos, onVideoClick } = data;
 const video = videos[index];
 const [imageLoaded, setImageLoaded] = useState<boolean>(false);

 const handleClick = useCallback(() => {
 if (video as any) {
 onVideoClick(video);
 }
 }, [video, onVideoClick]);

 const handleImageLoad = useCallback(() => {
 setImageLoaded(true);
 }, []);

 if (!video) {
 return <div style={style} />;
 }

 return (
 <div style={style} className='px-2 pb-4'>
 <div
 className='bg-white dark:bg-gray-800 rounded-lg shadow-sm active:scale-95 transition-transform cursor-pointer'
 onClick={(e: any) => handleClick(e)}
 >
 {/* Video Thumbnail */}
 <div className='relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden'>
 {!imageLoaded && (
 <div className='absolute inset-0 flex items-center justify-center'>
 <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500' />
 </div>
 )}
 <img
 src={video.thumbnailUrl}
 alt={video.title}
 className={`w-full h-full object-cover transition-opacity duration-300 ${
 imageLoaded ? 'opacity-100' : 'opacity-0'
 }`}
 loading='lazy'
 onLoad={handleImageLoad}
 />

 {/* Duration Badge */}
 {video.duration && typeof video.duration === 'number' && (
 <div className='absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded'>
 {Math.floor(video.duration / 60)}:
 {(video.duration % 60).toString().padStart(2, '0')}
 </div>
 )}
 </div>

 {/* Video Info */}
 <div className='p-3'>
 {/* Channel Avatar and Title */}
 <div className='flex space-x-3'>
 <img
 src={video.channel?.avatarUrl || 'https://via.placeholder.com/36'}
 alt={video.channel?.name}
 className='w-9 h-9 rounded-full flex-shrink-0'
 loading='lazy'
 />
 <div className='flex-1 min-w-0'>
 <h3 className='font-medium text-sm text-gray-900 dark:text-white line-clamp-2 leading-tight mb-1'>
 {video.title}
 </h3>
 <p className='text-xs text-gray-600 dark:text-gray-400 mb-1'>
 {video.channel?.name}
 {video.channel?.isVerified && (
 <span className='ml-1 text-blue-500'>✓</span>
 )}
 </p>
 <div className='flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-500'>
 <span>{video.views || '0'} views</span>
 <span>•</span>
 <span>{video.publishedAt || 'Recently'}</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
});

MobileVideoItem.displayName = 'MobileVideoItem';

const MobileVideoGrid = memo<MobileVideoGridProps>(
 ({
 videos,
 onVideoClick,
 onLoadMore,
 loading = false,
 hasMore = false,
 className = '' }) => {
 // Calculate item height based on screen width
 const itemHeight = useMemo(() => {
 const screenWidth = window.innerWidth;
 const padding = 16; // 2 * 8px padding
 const videoWidth = screenWidth - padding;
 const videoHeight: any = (videoWidth * 9) / 16; // 16:9 aspect ratio
 const infoHeight = 80; // Approximate height of video info
 return videoHeight + infoHeight + 16; // Extra padding
 }, []);

 // Memoized list data
 const listData = useMemo(
 () => ({
 videos,
 onVideoClick }),
 [videos, onVideoClick]
 );

 // Intersection observer for load more
 const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({
 threshold: 0.1,
 rootMargin: '100px' });

 // Load more when intersecting
 useEffect(() => {
 if (isIntersecting && hasMore && !loading && onLoadMore) {
 onLoadMore();
 }

 }, [isIntersecting, hasMore, loading, onLoadMore]);

 if (loading && videos.length === 0) {
 return (
 <div className={`space-y-4 ${className}`}>
 {Array.from({ length: 6 }).map((_, index) => (
 <div key={index} className='px-2'>
 <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm animate-pulse'>
 <div className='aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-lg' />
 <div className='p-3'>
 <div className='flex space-x-3'>
 <div className='w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0' />
 <div className='flex-1 space-y-2'>
 <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-full' />
 <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4' />
 <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2' />
 </div>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 );
 }

 if (videos.length === 0) {
 return (
 <div
 className={`flex flex-col items-center justify-center h-64 ${className}`}
 >
 <p className='text-gray-500 dark:text-gray-400 text-center px-4'>
 No videos found
 </p>
 </div>
 );
 }

 return (
 <div className={`w-full ${className}`}>
 <List
 height={window.innerHeight - 120} // Account for header/navigation
 width='100%'
 itemCount={videos.length}
 itemSize={itemHeight}
 itemData={listData}
 overscanCount={2}
 >
 {MobileVideoItem}
 </List>

 {/* Load more trigger */}
 {hasMore && (
 <div
 ref={loadMoreRef}
 className='h-20 flex items-center justify-center'
 >
 {loading ? (
 <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500' />
 ) : (
 <p className='text-gray-500 dark:text-gray-400'>
 Load more videos...
 </p>
 )}
 </div>
 )}
 </div>
 );
 }
);

MobileVideoGrid.displayName = 'MobileVideoGrid';

export default MobileVideoGrid;
