import { useEffect, useState, type FC } from 'react';

import { Link } from 'react-router-dom';

import { getVideos } from '../services/mockVideoService';


import HistoryIcon from './icons/HistoryIcon';
import VideoCard from './VideoCard';

import type { Video } from '../types';

interface WatchHistoryProps {
  maxVideos?: number;
}

const WatchHistory: React.FC<WatchHistoryProps> = ({ maxVideos = 6 }) => {
  const [historyVideos, setHistoryVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWatchHistory = async () => {
      try {
        setLoading(true);
        const allVideos = await getVideos();

        // Mock watch history - in a real app, this would come from user's watch history
        // Simulate recently watched videos by taking a random subset
        const watchedVideoIds = [
          '1', '2', '3', '4', '5',
          '6', '7', '8', '9', '10',
        ];

        const historyFeed = allVideos
          .filter(video => watchedVideoIds.includes(video.id) && !video.isShort)
          .sort(() => Math.random() - 0.5) // Randomize order to simulate different watch times
          .slice(0, maxVideos);

        setHistoryVideos(historyFeed);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch watch history:', err);
        setError('Could not load watch history at this time.');
      } finally {
        setLoading(false);
      }
    };

    fetchWatchHistory();
  }, [maxVideos]);

  if (loading) {
    return (
      <div className="mb-8 px-4">
        <div className="flex items-center mb-4">
          <HistoryIcon className="w-6 h-6 mr-2 text-neutral-600 dark:text-neutral-400" />
          <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">Continue watching</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-neutral-900 rounded-xl animate-pulse">
              <div className="aspect-video bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
              <div className="p-3">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-full bg-neutral-300 dark:bg-neutral-700/80 mt-0.5 flex-shrink-0" />
                  <div className="flex-grow space-y-1.5 pt-0.5">
                    <div className="h-4 bg-neutral-300 dark:bg-neutral-700/80 rounded w-5/6" />
                    <div className="h-3 bg-neutral-300 dark:bg-neutral-700/80 rounded w-3/4" />
                    <div className="h-3 bg-neutral-300 dark:bg-neutral-700/80 rounded w-1/2" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8 px-4">
        <div className="flex items-center mb-4">
          <HistoryIcon className="w-6 h-6 mr-2 text-neutral-600 dark:text-neutral-400" />
          <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">Continue watching</h2>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400">{error}</p>
      </div>
    );
  }

  if (historyVideos.length === 0) {
    return (
      <div className="mb-8 px-4">
        <div className="flex items-center mb-4">
          <HistoryIcon className="w-6 h-6 mr-2 text-neutral-600 dark:text-neutral-400" />
          <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">Continue watching</h2>
        </div>
        <div className="text-center py-8 text-neutral-600 dark:text-neutral-400">
          <p className="mb-2">No watch history yet</p>
          <p className="text-sm">Videos you watch will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 px-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <HistoryIcon className="w-6 h-6 mr-2 text-neutral-600 dark:text-neutral-400" />
          <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">Continue watching</h2>
        </div>
        <Link
          to="/history"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500"
        >
          View All
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {historyVideos.map(video => (
          <div key={video.id} className="relative">
            <VideoCard video={video} />
            {/* Progress bar overlay to simulate watch progress */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-b-lg overflow-hidden">
              <div
                className="h-full bg-red-600 dark:bg-red-500"
                style={{ width: `${Math.floor(Math.random() * 70) + 10}%` }}
               />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchHistory;