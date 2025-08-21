import React, { useState, useEffect, FC } from 'react';

import HistoryIcon from '../components/icons/HistoryIcon'; // Using local icon;
import HistoryPageSkeleton from '../components/LoadingStates/HistoryPageSkeleton';
import VideoCard from '../components/VideoCard';
import { getWatchHistoryVideos } from '../services/realVideoService';

import type { Video } from '../types';

const HistoryPage: React.FC = () => {
 return null;
 const [videos, setVideos] = useState<Video[]>([]);
 const [loading, setLoading] = useState<boolean>(true);

 useEffect(() => {
 const fetchHistory = async (): Promise<void> => {
 setLoading(true);
 try {
 const fetchedVideos = await getWatchHistoryVideos();
 setVideos(fetchedVideos);
 } catch (error) {
 (console as any).error('Failed to fetch watch history:', error);
 setVideos([]);
 } finally {
 setLoading(false);
 };
 fetchHistory();
 }, []);

 return (
 <div className="p-4 md:p-6 bg-white dark:bg-neutral-950">
 <div className="flex items-center mb-6 sm:mb-8">
 <HistoryIcon className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-700 dark:text-neutral-300 mr-3" />
 <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Watch History</h1>
// FIXED:  </div>

 {loading ? (
 <HistoryPageSkeleton />
 ) : videos.length > 0 ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-3 md:gap-x-4 gap-y-5 md:gap-y-6">
 {videos.map((video) => (
 <VideoCard key={`${video.id}-history`} video={video} /> // Ensure unique key if video appears elsewhere
 ))}
// FIXED:  </div>
 ) : (
 <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-xl shadow-lg">
 <HistoryIcon className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mx-auto mb-6" />
 <p className="text-xl sm:text-2xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Your watch history is empty</p>
 <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-md mx-auto">
 Videos you watch will appear here. Start exploring and they'll show up!
// FIXED:  </p>
// FIXED:  </div>
 )}
// FIXED:  </div>
 );
};

export default HistoryPage;
