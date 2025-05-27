
import React, { useState } from 'react';

const categories = [
  "All", "Music", "Gaming", "Live", "Playlists", "Trailers", "Sports", 
  "News", "Comedy", "Recently uploaded", "New to you", "Podcasts", "Computers", "Science"
];

interface CategoryChipsProps {
  onSelectCategory: (category: string) => void;
}

const CategoryChips: React.FC<CategoryChipsProps> = ({ onSelectCategory }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleChipClick = (category: string) => {
    setSelectedCategory(category);
    onSelectCategory(category);
  };

  return (
    <div className="sticky top-14 z-20 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm py-2.5 px-1 sm:px-0 mb-3 overflow-hidden">
      <div className="relative">
        <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar" role="tablist" aria-label="Content categories">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleChipClick(category)}
              role="tab"
              aria-selected={selectedCategory === category}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors duration-150
                ${selectedCategory === category 
                  ? 'bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900' 
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryChips;