import React, { MouseEvent, FC } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

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
 className = '' }) => {
 const handlePrevious: any = (e: React.MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 if (canGoPrevious as any) {
 onPrevious();
 };

 const handleNext: any = (e: React.MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 if (canGoNext as any) {
 onNext();
 };

 return (
 <div className={`flex flex-col space-y-3 ${className}`}>
 {/* Previous button */}
 <button />
// FIXED:  onClick={(e: any) => handlePrevious(e)}
// FIXED:  disabled={!canGoPrevious}
// FIXED:  className={`p-4 rounded-full backdrop-blur-sm transition-all duration-200 border border-white/20 ${
 canGoPrevious
 ? 'bg-white/30 text-white hover:bg-white/40 hover:scale-110 shadow-lg'
 : 'bg-white/10 text-white/40 cursor-not-allowed'
 }`}
// FIXED:  aria-label="Previous short"
// FIXED:  style={{ pointerEvents: 'auto' }
 >
 <ChevronUpIcon className="w-6 h-6" />
// FIXED:  </button>

 {/* Next button */}
 <button />
// FIXED:  onClick={(e: any) => handleNext(e)}
// FIXED:  disabled={!canGoNext}
// FIXED:  className={`p-4 rounded-full backdrop-blur-sm transition-all duration-200 border border-white/20 ${
 canGoNext
 ? 'bg-white/30 text-white hover:bg-white/40 hover:scale-110 shadow-lg'
 : 'bg-white/10 text-white/40 cursor-not-allowed'
 }`}
// FIXED:  aria-label="Next short"
// FIXED:  style={{ pointerEvents: 'auto' }
 >
 <ChevronDownIcon className="w-6 h-6" />
// FIXED:  </button>
// FIXED:  </div>
 );
};

export default ShortsNavigation;
