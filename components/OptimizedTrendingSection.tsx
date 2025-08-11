import React, { useEffect, useMemo, useCallback,  useState } from 'react';
import { Link } from 'react-router-dom';
// @ts-nocheck

import { getVideos } from '../services/realVideoService';

import FireIcon from './icons/FireIcon';
import VideoCard from './VideoCard';

import type { Video } from '../types';

interface TrendingSectionProps {
  maxVideos?: number;
}

// Memoized VideoCard for better performance
const MemoizedVideoCard = memo(VideoCard);

const TrendingSection: React.FC<TrendingSectionProps> = memo(({ maxVideos = 6 }) => {
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingVideos = useCallback(async () => {
    try {
      setLoading(true);
      const allVideos = await getVideos();
      // Sort by views (convert string to number for sorting)
      const sortedByViews = allVideos
        .filter((video) => !video.isShort) // Exclude shorts from trending
        .sort((a, b) => {
          const viewsA = typeof a.views === 'string' ? parseInt(a.views.replace(/,/g, ''), 10) : a.views;
          const viewsB = typeof b.views === 'string' ? parseInt(b.views.replace(/,/g, ''), 10) : b.views;
          return viewsB - viewsA;
        })
        .slice(0, maxVideos);

      setTrendingVideos(sortedByViews);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch trending videos:', err);
      setError('Could not load trending videos at this time.');
    } finally {
      setLoading(false);
    }
  }, [maxVideos]);

  useEffect(() => {
    fetchTrendingVideos().catch(console.error);
  }, [fetchTrendingVideos]);

  // Memoized video grid to prevent unnecessary re-renders
  const videoGrid = useMemo(() => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {trendingVideos.map((video) => (
        <MemoizedVideoCard
          key={video.id}
          video={video}
        />
      ))}
    </div>
  ), [trendingVideos]);

  if (loading) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FireIcon className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Trending</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: maxVideos }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 w-full h-48" />
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FireIcon className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Trending</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchTrendingVideos}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (trendingVideos.length === 0) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FireIcon className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Trending</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">No trending videos available right now.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FireIcon className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Trending</h2>
        </div>
        <Link
          to="/trending"
          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm transition-colors"
        >
          View all
        </Link>
      </div>

      {videoGrid}
    </section>
  );
});

TrendingSection.displayName = 'TrendingSection';

export default TrendingSection;



