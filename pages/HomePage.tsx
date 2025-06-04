
import React, { useState, useMemo } from 'react';
import { HomeIcon } from '@heroicons/react/24/solid';
import PageLayout from '../components/PageLayout';
import CategoryChips from '../components/CategoryChips';
import HomeContent from '../components/HomeContent'; // Added import
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


  const categories = ['All', 'Music', 'Gaming', 'Sports', 'News', 'Entertainment', 'Education', 'Technology', 'Travel', 'Food', 'Fashion', 'Comedy', 'Science', 'Health', 'Business'];

  const categoryChips = (
    <CategoryChips 
      categories={categories}
      selectedCategory={selectedCategory}
      onSelectCategory={handleSelectCategory} 
    />
  );

  return (
    <PageLayout
      title="Home"
      icon={<HomeIcon className="w-8 h-8 text-blue-500" />}
      data={filteredVideos}
      loading={loading}
      error={error}
      emptyState={{
        title: "No videos found",
        message: `No videos found for "${selectedCategory}". Try selecting another category.`
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