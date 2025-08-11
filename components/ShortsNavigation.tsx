
/// <reference types="react/jsx-runtime" />
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName]: any;
    }
  }
}
// TODO: Fix import - import type React from 'react';

// TODO: Fix import - import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface ShortsNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  className?: string;
}

const ShortsNavigation: React.FC<ShortsNavigationProps> = ({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  className = '',
}) => {
  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canGoPrevious) {
      onPrevious();
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canGoNext) {
      onNext();
    }
  };

  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      {/* Previous button */}
      <button
        onClick={handlePrevious}
        disabled={!canGoPrevious}
        className={`p-4 rounded-full backdrop-blur-sm transition-all duration-200 border border-white/20 ${
          canGoPrevious
            ? 'bg-white/30 text-white hover:bg-white/40 hover:scale-110 shadow-lg'
            : 'bg-white/10 text-white/40 cursor-not-allowed'
        }`}
        aria-label="Previous short"
        style={{ pointerEvents: 'auto' }}
      >
        <ChevronUpIcon className="w-6 h-6" />
      </button>

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={!canGoNext}
        className={`p-4 rounded-full backdrop-blur-sm transition-all duration-200 border border-white/20 ${
          canGoNext
            ? 'bg-white/30 text-white hover:bg-white/40 hover:scale-110 shadow-lg'
            : 'bg-white/10 text-white/40 cursor-not-allowed'
        }`}
        aria-label="Next short"
        style={{ pointerEvents: 'auto' }}
      >
        <ChevronDownIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ShortsNavigation;
