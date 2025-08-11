
/// <reference types="react/jsx-runtime" />
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName]: any;
    }
  }
}
import type React from 'react';

import { XMarkIcon } from '@heroicons/react/24/outline';

interface ShortsFiltersProps {
  categories: string;
  selectedCategory: string;
  onCategoryChange: (category: any) => void;
  onClose: () => void;
}

const ShortsFilters: React.FC<ShortsFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  onClose,
}) => {
  const formatCategoryName = (category: any) => {
    if (category === 'all') {
return 'All';
}
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="px-4 pb-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium">Filter by Category</h3>
          <button
            onClick={onClose}
            className="p-1 text-white/60 hover:text-white transition-colors"
            aria-label="Close filters"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category: any) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-white text-black'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {formatCategoryName(category)}
            </button>
          ))}
        </div>

        {selectedCategory !== 'all' && (
          <button
            onClick={() => onCategoryChange('all')}
            className="mt-3 text-sm text-white/60 hover:text-white transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>
    </div>
  );
};

export default ShortsFilters;
