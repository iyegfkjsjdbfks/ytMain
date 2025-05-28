
import React, { useEffect, useState, useMemo } from 'react';
import { Video } from '../types';
import VideoCard from '../components/VideoCard';
import CategoryChips from '../components/CategoryChips';
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


  const renderSkeleton = () => (
    <>
      <CategoryChips onSelectCategory={handleSelectCategory} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-3 md:gap-x-4 gap-y-5 md:gap-y-6">
        {Array.from({ length: 18 }).map((_, index) => (
          <div key={index} className="bg-white dark:bg-neutral-900 rounded-xl animate-pulse"> {/* Updated background */}
            <div className="aspect-video bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
            <div className="p-3">
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-full bg-neutral-300 dark:bg-neutral-700/80 mt-0.5 flex-shrink-0"></div>
                <div className="flex-grow space-y-1.5 pt-0.5">
                  <div className="h-4 bg-neutral-300 dark:bg-neutral-700/80 rounded w-5/6"></div>
                  <div className="h-3 bg-neutral-300 dark:bg-neutral-700/80 rounded w-3/4"></div>
                  <div className="h-3 bg-neutral-300 dark:bg-neutral-700/80 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  if (loading) {
    return renderSkeleton();
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-neutral-950">
        <CategoryChips onSelectCategory={handleSelectCategory} />
        <div className="text-center py-16 text-red-600 dark:text-red-400 text-lg">
          Failed to load videos: {error}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-neutral-950"> {/* Added explicit background for page container */}
      <CategoryChips onSelectCategory={handleSelectCategory} />
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-3 md:gap-x-4 gap-y-5 md:gap-y-6">
          {filteredVideos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-neutral-600 dark:text-neutral-400 text-lg">
            No videos found for "{selectedCategory}". Try selecting another category.
        </div>
      )}
    </div>
  );
};

export default HomePage;