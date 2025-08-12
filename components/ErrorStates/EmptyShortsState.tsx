import React, { FC } from 'react';
import { PlayIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface EmptyShortsStateProps {
 hasFilters?: boolean;
 onClearFilters?: () => void;
}

const EmptyShortsState: React.FC<EmptyShortsStateProps> = ({
 hasFilters = false,
 onClearFilters }) => {
 return (
 <div className="flex flex-col items-center justify-center h-full bg-black text-white p-8">
 <div className="text-center max-w-md">
 {hasFilters ? (
 <FunnelIcon className="w-16 h-16 mx-auto mb-6 text-gray-400" />
 ) : (
 <PlayIcon className="w-16 h-16 mx-auto mb-6 text-gray-400" />
 )}

 <h2 className="text-2xl font-bold mb-4">
 {hasFilters ? 'No Shorts Found' : 'No Shorts Available'}
// FIXED:  </h2>

 <p className="text-gray-300 mb-6">
 {hasFilters
 ? 'No shorts match your current search or filter criteria. Try adjusting your filters or search terms.'
 : 'There are no short videos to display right now. Check back later for new content!'
 }
// FIXED:  </p>

 <div className="flex flex-col sm:flex-row gap-3 justify-center">
 {hasFilters && onClearFilters && (
 <button />
// FIXED:  onClick={(e: any) => onClearFilters(e)}
// FIXED:  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors"
 >
 Clear Filters
// FIXED:  </button>
 )}

 <button />
// FIXED:  onClick={() => window.location.reload()}
// FIXED:  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
 >
 Refresh
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default EmptyShortsState;