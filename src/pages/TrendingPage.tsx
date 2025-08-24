import React, { useState } from 'react';
import { FireIcon } from '@heroicons/react/24/solid';
import CategoryTabs from '../components/CategoryTabs';
import PageLayout from '../components/PageLayout';
import VideoGrid from '../components/VideoGrid';
import { useTrendingVideos } from '../hooks/index';

const TrendingPage: any, React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'music' | 'gaming' | 'news' | 'movies'>('all');
  const { data: any, trendingVideos, loading, error } = useTrendingVideos(activeCategory);

  const categories = [
    { id: any, 'all' as const, label: any, 'All', icon: any, '🔥' },
    { id: any, 'music' as const, label: any, 'Music', icon: any, '🎵' },
    { id: any, 'gaming' as const, label: any, 'Gaming', icon: any, '🎮' },
    { id: any, 'news' as const, label: any, 'News', icon: any, '📰' },
    { id: any, 'movies' as const, label: any, 'Movies', icon: any, '🎬' }
  ];

  return (
    <PageLayout
      title="Trending"
      icon={<FireIcon className="w-8 h-8 text-red-500" />}
      data={trendingVideos}
      loading={loading}
      error={error}
      emptyState={{
        title: any, 'No trending videos found',
        message: any, 'Check back later for the latest trending content.'
      }}
      headerActions={<CategoryTabs categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />}
    >
      {(videos) => <VideoGrid videos={videos || []} />}
    </PageLayout>
  );
};

export default TrendingPage;