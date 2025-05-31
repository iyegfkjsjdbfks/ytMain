
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '../utils/cn';

interface CategoryChipsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  className?: string;
}

const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  className,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position and update button states
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  // Scroll functions
  const scrollLeft = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    container.scrollBy({
      left: -200,
      behavior: 'smooth',
    });
  }, []);

  const scrollRight = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    container.scrollBy({
      left: 200,
      behavior: 'smooth',
    });
  }, []);

  // Set up scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener('scroll', checkScrollPosition);
    
    // Check on resize
    const resizeObserver = new ResizeObserver(checkScrollPosition);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      resizeObserver.disconnect();
    };
  }, [checkScrollPosition]);

  // Scroll to selected category when it changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const selectedButton = container.querySelector(`[data-category="${selectedCategory}"]`) as HTMLElement;
    if (!selectedButton) return;

    const containerRect = container.getBoundingClientRect();
    const buttonRect = selectedButton.getBoundingClientRect();
    
    // Check if button is fully visible
    const isVisible = 
      buttonRect.left >= containerRect.left && 
      buttonRect.right <= containerRect.right;

    if (!isVisible) {
      const scrollLeft = selectedButton.offsetLeft - container.offsetWidth / 2 + selectedButton.offsetWidth / 2;
      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth',
      });
    }
  }, [selectedCategory]);

  return (
    <div className={cn('relative flex items-center', className)}>
      {/* Left scroll button */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 z-10 flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-50 transition-colors"
          aria-label="Scroll left"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Category chips container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-12"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories?.map((category) => {
          const isSelected = category === selectedCategory;
          
          return (
            <button
              key={category}
              data-category={category}
              onClick={() => onSelectCategory(category)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
                'hover:scale-105 active:scale-95',
                isSelected
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              )}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Right scroll button */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute right-0 z-10 flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-50 transition-colors"
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default CategoryChips;