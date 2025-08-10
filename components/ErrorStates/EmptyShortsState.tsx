
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
import type React from 'react';

import { PlayIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface EmptyShortsStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

const EmptyShortsState: React.FC<EmptyShortsStateProps> = ({
  hasFilters = false,
  onClearFilters,
}) => {
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
        </h2>

        <p className="text-gray-300 mb-6">
          {hasFilters
            ? 'No shorts match your current search or filter criteria. Try adjusting your filters or search terms.'
            : 'There are no short videos to display right now. Check back later for new content!'
          }
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {hasFilters && onClearFilters && (
            <button
              onClick={onClearFilters}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Clear Filters
            </button>
          )}

          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmptyShortsState;