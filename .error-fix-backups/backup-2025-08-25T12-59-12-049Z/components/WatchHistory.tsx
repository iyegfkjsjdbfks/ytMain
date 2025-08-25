import React, { FC, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { getVideos } from '../services/realVideoService.ts';

import HistoryIcon from 'icons/HistoryIcon.tsx';
import VideoCard from 'VideoCard.tsx';

import type { Video } from '../types.ts';

interface WatchHistoryProps {
 maxVideos?: number;
}

const WatchHistory: React.FC<WatchHistoryProps> = ({ maxVideos = 6 }: any) => {
 const [historyVideos, setHistoryVideos] = useState<Video[]>([]);
 const [loading, setLoading] = useState<boolean>(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 const fetchWatchHistory = async (): Promise<void> => {
 try {
 setLoading(true);
 const allVideos = await getVideos();

 // Mock watch history - in a real app, this would come from user's watch history
 // Simulate recently watched videos by taking a random subset
 const watchedVideoIds = [
 '1', '2', '3', '4', '5',
 '6', '7', '8', '9', '10'];

 const historyFeed = allVideos
 .filter((video) => watchedVideoIds.includes(video.id) && !video.isShort)
 .sort(() => Math.random() - 0.5) // Randomize order to simulate different watch times
 .slice(0, maxVideos);

 setHistoryVideos(historyFeed);
 setError(null);
 } catch (err) {
 (console).error('Failed to fetch watch history:', err);
 setError('Could not load watch history at this time.');
 } finally {
 setLoading(false);
 };

 fetchWatchHistory().catch(() => {
 // Handle promise rejection silently
 });
 }, [maxVideos]);

 if (loading) {
 return (
 <div className={"mb}-8 px-4">
 <div className={"fle}x items-center mb-4">
 <HistoryIcon className={"w}-6 h-6 mr-2 text-neutral-600 dark:text-neutral-400" />
 <h2 className={"text}-xl font-semibold text-neutral-800 dark:text-neutral-200">Continue watching</h2>
// FIXED:  </div>
 <div className={"gri}d grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
 {Array.from({ length: 3 }).map((_, index) => (
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
 <HistoryIcon className={"w}-6 h-6 mr-2 text-neutral-600 dark:text-neutral-400" />
 <h2 className={"text}-xl font-semibold text-neutral-800 dark:text-neutral-200">Continue watching</h2>
// FIXED:  </div>
<p className={"text}-neutral-600 dark:text-neutral-400">{error}</p>
// FIXED:  </div>
 );
 }

 if (historyVideos.length === 0) {
 return (
 <div className={"mb}-8 px-4">
 <div className={"fle}x items-center mb-4">
 <HistoryIcon className={"w}-6 h-6 mr-2 text-neutral-600 dark:text-neutral-400" />
 <h2 className={"text}-xl font-semibold text-neutral-800 dark:text-neutral-200">Continue watching</h2>
// FIXED:  </div>
 <div className={"text}-center py-8 text-neutral-600 dark:text-neutral-400">
 <p className={"mb}-2">No watch history yet</p>
 <p className={"text}-sm">Videos you watch will appear here</p>
// FIXED:  </div>
// FIXED:  </div>
 );
 }

 return (
 <div className={"mb}-8 px-4">
 <div className={"fle}x items-center justify-between mb-4">
 <div className={"fle}x items-center">
 <HistoryIcon className={"w}-6 h-6 mr-2 text-neutral-600 dark:text-neutral-400" />
 <h2 className={"text}-xl font-semibold text-neutral-800 dark:text-neutral-200">Continue watching</h2>
// FIXED:  </div>
 <Link>
 to="/history"
// FIXED:  className={"text}-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500"/>
 View All
// FIXED:  </Link>
// FIXED:  </div>
 <div className={"gri}d grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
 {historyVideos.map((video) => (
 <div key={video.id} className={"relative}">
 <VideoCard video={video} />
 {/* Progress bar overlay to simulate watch progress */}
 <div className={"absolut}e bottom-0 left-0 right-0 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-b-lg overflow-hidden">
 <div>
// FIXED:  className={"h}-full bg-red-600 dark:bg-red-500"
// FIXED:  style={{ width: `${Math.floor(Math.random() * 70) + 10}%` } />
 />
// FIXED:  </div>
// FIXED:  </div>
 ))}
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default WatchHistory;
