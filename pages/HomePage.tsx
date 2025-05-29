
import React, { useState, useMemo } from 'react';
import { HomeIcon } from '@heroicons/react/24/solid';
import PageLayout from '../components/PageLayout';
import VideoGrid from '../components/VideoGrid';
import CategoryChips from '../components/CategoryChips';
import ShortsSection from '../components/ShortsSection';
import TrendingSection from '../components/TrendingSection';
import SubscriptionFeed from '../components/SubscriptionFeed';
import WatchHistory from '../components/WatchHistory';
import LiveStreams from '../components/LiveStreams';
import { useVideos } from '../hooks';

const HomePage: React.FC = () => {
  const { data: videos, loading, error } = useVideos();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    window.scrollTo(0,0); // Scroll to top on category change
  };

  const filteredVideos = useMemo(() => {
    if (selectedCategory === "All") {
      return videos;
    }
    return videos.filter(video => video.category === selectedCategory);
  }, [videos, selectedCategory]);


  const categoryChips = <CategoryChips onSelectCategory={handleSelectCategory} />;

  const homeContent = (
    <>
      {selectedCategory === 'All' && (
        <>
          <ShortsSection maxShorts={8} />
          <WatchHistory maxVideos={4} />
          <SubscriptionFeed maxVideos={4} />
          <LiveStreams maxStreams={4} />
          <TrendingSection maxVideos={6} />
        </>
      )}
      {filteredVideos && filteredVideos.length > 0 && (
        <div className="px-4">
          <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
            {selectedCategory === 'All' ? 'Recommended' : selectedCategory}
          </h2>
          <VideoGrid videos={filteredVideos} />
        </div>
      )}
    </>
  );
  
  return (
    <PageLayout
      title="Home"
      icon={<HomeIcon className="w-8 h-8 text-blue-500" />}
      data={filteredVideos}
      loading={loading}
      error={error}
      emptyMessage={`No videos found for "${selectedCategory}". Try selecting another category.`}
      headerActions={categoryChips}
      skeletonCount={18}
    >
      {homeContent}
    </PageLayout>
  );
};

export default HomePage;