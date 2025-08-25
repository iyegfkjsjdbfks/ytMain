import React, { useRef, useState, useCallback, useEffect } from 'react';

export interface CategoryChipsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  className?: string;
}

const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  className = ''
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  }, []);if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }, []);if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }, []);

  // Check scroll position on mount and scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollPosition();
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [checkScrollPosition]);

  // Check scroll position when categories change
  useEffect(() => {
    const timeout = setTimeout(checkScrollPosition, 100);
    return () => clearTimeout(timeout);
  }, [categories, checkScrollPosition]);

  return (
    <div className={`relative flex items-center py-2 sm:py-3 ${className} `}>
      {/* Left scroll button */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 z-10 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-50 transition-colors touch-manipulation"
          aria-label="Scroll left"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Category chips container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-2 px-10 sm:px-12"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories?.map?.((category: string) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`
              flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm font-medium 
              transition-all duration-200 touch-manipulation
              ${selectedCategory === category
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } `}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Right scroll button */}
      {canScrollRight && (
        <button
          onClick={scrollRight} className="absolute right-0 z-10 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-50 transition-colors touch-manipulation"
          aria-label="Scroll right"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default CategoryChips;
