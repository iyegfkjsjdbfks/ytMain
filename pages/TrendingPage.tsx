
import React, { useState } from 'react';
import { FireIcon } from '@heroicons/react/24/solid';
import PageLayout from '../components/PageLayout';
import VideoGrid from '../components/VideoGrid';
import { useTrendingVideos } from '../hooks';

const TrendingPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'music' | 'gaming' | 'news' | 'movies'>('all');
  const { data: trendingVideos, loading, error } = useTrendingVideos(activeCategory);

  const categories = [
    { id: 'all' as const, label: 'All', icon: '🔥' },
    { id: 'music' as const, label: 'Music', icon: '🎵' },
    { id: 'gaming' as const, label: 'Gaming', icon: '🎮' },
    { id: 'news' as const, label: 'News', icon: '📰' },
    { id: 'movies' as const, label: 'Movies', icon: '🎬' },
  ];

  const categoryTabs = (
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
  );

  return (
    <PageLayout
      title="Trending"
      icon={<FireIcon className="w-8 h-8 text-red-500" />}
      data={trendingVideos}
      loading={loading}
      error={error}
      emptyMessage="No trending videos found."
      headerActions={categoryTabs}
    >
      <VideoGrid videos={trendingVideos || []} />
    </PageLayout>
  );
};

export default TrendingPage;