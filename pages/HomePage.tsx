
import type * as React from 'react';
import {  useState, useMemo, useCallback  } from 'react';

import { HomeIcon } from '@heroicons/react/24/solid';

import CategoryChips from '../components/CategoryChips';
import HomeContent from '../components/HomeContent'; // Added import
import PageLayout from '../components/PageLayout';
import { useVideos } from '../hooks';

const HomePage: React.FC = () => {
  const { data: videos, loading, error } = useVideos();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const handleSelectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
    window.scrollTo(0, 0); // Scroll to top on category change
  }, []);

  const filteredVideos = useMemo(() => {
    if (!videos || videos.length === 0) {
      return [];
    }
    if (selectedCategory === 'All') {
      return videos;
    }
    return videos.filter(video => video.category === selectedCategory);
  }, [videos, selectedCategory]);

  const categories = useMemo(() => [
    'All', 'Music', 'Gaming', 'Sports', 'News', 'Entertainment',
    'Education', 'Technology', 'Travel', 'Food', 'Fashion',
    'Comedy', 'Science', 'Health', 'Business',
  ], []);

  const categoryChips = useMemo(() => (
    <CategoryChips
      categories={categories}
      selectedCategory={selectedCategory}
      onSelectCategory={handleSelectCategory}
    />
  ), [categories, selectedCategory, handleSelectCategory]);

  return (
    <PageLayout
      title="Home"
      icon={<HomeIcon className="w-8 h-8 text-blue-500" />}
      data={filteredVideos}
      loading={loading}
      error={error}
      emptyState={{
        title: 'No videos found',
        message: `No videos found for "${selectedCategory}". Try selecting another category.`,
      }}
      headerActions={categoryChips}
      skeletonCount={18}
    >
      {(data) => (
        <HomeContent selectedCategory={selectedCategory} videos={data} />
      )}
    </PageLayout>
  );
};

export default HomePage;