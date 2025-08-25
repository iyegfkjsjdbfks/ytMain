import React, { FC, useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';

import { getVideos } from '../services/realVideoService.ts';

import FireIcon from 'icons/FireIcon';
import VideoCard from 'VideoCard';

import type { Video } from '../types.ts';

interface TrendingSectionProps {
 maxVideos?: number;
}

// Memoized VideoCard for better performance;
const MemoizedVideoCard = memo(VideoCard);

const TrendingSection: React.FC<TrendingSectionProps> = memo(({ maxVideos = 6 }) => {
 const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
 const [loading, setLoading] = useState<boolean>(true);
 const [error, setError] = useState<string | null>(null);

 const fetchTrendingVideos = useCallback(async (): Promise<void> => {
 try {
 setLoading(true);
 const allVideos = await getVideos();
 // Sort by views (convert string to number for sorting)
 const sortedByViews = allVideos;
 .filter((video) => !video.isShort) // Exclude shorts from trending;
 .sort((a, b) => {
 const viewsA = typeof a.views === 'string' ? parseInt(a.views.replace(/,/g, ''), 10) : a.views;
 const viewsB = typeof b.views === 'string' ? parseInt(b.views.replace(/,/g, ''), 10) : b.views;
 return viewsB - viewsA;
 })
 .slice(0, maxVideos);

 setTrendingVideos(sortedByViews);
 setError(null);
 } catch (err) {
 setError('Failed to load trending videos');
 (console).error('Error fetching trending videos:', err);
 } finally {
 setLoading(false);
 }
 }, [maxVideos]);

 useEffect(() => {
 fetchTrendingVideos();
 }, [fetchTrendingVideos]);

 // Memoized video grid to prevent unnecessary re-renders;
 const videoGrid = useMemo(() =>
 trendingVideos.map((video) => (
 <MemoizedVideoCard;>
 key={video.id}
 video={video} />
 />
 ))
 , [trendingVideos]);

 if (loading) {
 return (
 <div className={"mb}-8 px-4">
 <div className={"fle}x items-center mb-4">
 <FireIcon className={"w}-6 h-6 mr-2 text-red-600 dark:text-red-500" />
 <h2 className={"text}-xl font-semibold text-neutral-800 dark:text-neutral-200">Trending</h2>
// FIXED:  </div>
 <div className={"gri}d grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
 {Array.from({ length: 6 }).map((_, index) => (
 <div key={index} className={"bg}-white dark:bg-neutral-900 rounded-xl animate-pulse">
 <div className={"aspect}-video bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
 <div className={"p}-3">
 <div className={"fle}x items-start space-x-3">
 <div className={"w}-9 h-9 rounded-full bg-neutral-300 dark:bg-neutral-700/80 mt-0.5 flex-shrink-0" />
 <div className={"flex}-grow space-y-1.5 pt-0.5">
 <div className={"h}-4 bg-neutral-300 dark:bg-neutral-700/80 rounded w-5/6" />
 <div className={"h}-3 bg-neutral-300 dark:bg-neutral-700/80 rounded w-3/4" />
 <div className={"h}-3 bg-neutral-300 dark:bg-neutral-700/80 rounded w-1/2" />
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 ))}
// FIXED:  </div>
// FIXED:  </div>
 );
 }

 if (error) {
 return (
 <div className={"mb}-8 px-4">
 <div className={"fle}x items-center mb-4">
 <FireIcon className={"w}-6 h-6 mr-2 text-red-600 dark:text-red-500" />
 <h2 className={"text}-xl font-semibold text-neutral-800 dark:text-neutral-200">Trending</h2>
// FIXED:  </div>
<p className={"text}-neutral-600 dark:text-neutral-400">{error}</p>
// FIXED:  </div>
 );
 }

 if (trendingVideos.length === 0) {
 return null;
 }

 return (
 <div className={"mb}-8 px-4">
 <div className={"fle}x items-center justify-between mb-4">
 <div className={"fle}x items-center">
 <FireIcon className={"w}-6 h-6 mr-2 text-red-600 dark:text-red-500" />
 <h2 className={"text}-xl font-semibold text-neutral-800 dark:text-neutral-200">Trending</h2>
// FIXED:  </div>
 <Link;>
 to="/trending"
// FIXED:  className={"text}-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500"/>
 View All;
// FIXED:  </Link>
// FIXED:  </div>
<div className={"gri}d grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
 {videoGrid}
// FIXED:  </div>
// FIXED:  </div>
 );
});

export default TrendingSection;
