
import React, { useEffect, useState } from 'react';
import { Video } from '../types';
import { getVideos } from '../services/mockVideoService';
import VideoCard from '../components/VideoCard';
import { FireIcon } from '@heroicons/react/24/solid';
import { parseViewCount } from '../utils/numberUtils';

const TrendingPage: React.FC = () => {
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'music' | 'gaming' | 'news' | 'movies'>('all');

  useEffect(() => {
    const fetchTrendingVideos = async () => {
      setLoading(true);
      try {
        const allVideos = await getVideos();

        // Sort by view count to get trending videos
        const sortedByViews = [...allVideos].sort((a, b) => {
          const viewsA = parseViewCount(a.views);
          const viewsB = parseViewCount(b.views);
          return viewsB - viewsA;
        });

        // Filter by category if not 'all'
        let filteredVideos = sortedByViews;
        if (activeCategory !== 'all') {
          filteredVideos = sortedByViews.filter(video =>
            video.category.toLowerCase().includes(activeCategory.toLowerCase())
          );
        }

        setTrendingVideos(filteredVideos.slice(0, 50)); // Top 50 trending
      } catch (error) {
        console.error('Failed to fetch trending videos:', error);
        setTrendingVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingVideos();
  }, [activeCategory]);

  const categories = [
    { id: 'all' as const, label: 'All', icon: '🔥' },
    { id: 'music' as const, label: 'Music', icon: '🎵' },
    { id: 'gaming' as const, label: 'Gaming', icon: '🎮' },
    { id: 'news' as const, label: 'News', icon: '📰' },
    { id: 'movies' as const, label: 'Movies', icon: '🎬' },
  ];

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-3 md:gap-x-4 gap-y-5 md:gap-y-6">
      {Array.from({ length: 20 }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-neutral-900 rounded-xl animate-pulse">
          <div className="aspect-video bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
          <div className="p-3">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-full bg-neutral-300 dark:bg-neutral-700/80 mt-0.5 flex-shrink-0"></div>
              <div className="flex-grow space-y-1.5 pt-0.5">
                <div className="h-4 bg-neutral-300 dark:bg-neutral-700/80 rounded"></div>
                <div className="h-3 bg-neutral-300 dark:bg-neutral-700/80 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-300 dark:bg-neutral-700/80 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-neutral-950">
      <div className="flex items-center mb-6 sm:mb-8">
        <FireIcon className="w-7 h-7 sm:w-8 sm:h-8 text-red-500 mr-3" />
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Trending</h1>
      </div>

      {/* Category Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 overflow-x-auto no-scrollbar">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeCategory === category.id
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        renderSkeleton()
      ) : trendingVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-3 md:gap-x-4 gap-y-5 md:gap-y-6">
          {trendingVideos.map((video, index) => (
            <div key={video.id} className="relative">
              <VideoCard video={video} />
              {index < 3 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                  #{index + 1} Trending
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-xl shadow-lg">
          <FireIcon className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mx-auto mb-6" />
          <p className="text-xl sm:text-2xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
            No trending videos in {categories.find(c => c.id === activeCategory)?.label}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-md mx-auto">
            Try selecting a different category or check back later for trending content.
          </p>
        </div>
      )}
    </div>
  );
};

export default TrendingPage;