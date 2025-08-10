
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
// TODO: Fix import - import type React from 'react';

const LikedVideosPageSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-3 md:gap-x-4 gap-y-5 md:gap-y-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-neutral-900 rounded-xl animate-pulse">
          <div className="aspect-video bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
          <div className="p-3">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-full bg-neutral-300 dark:bg-neutral-700/80 mt-0.5 flex-shrink-0" />
              <div className="flex-grow space-y-1.5 pt-0.5">
                <div className="h-4 bg-neutral-300 dark:bg-neutral-700/80 rounded w-5/6" />
                <div className="h-3 bg-neutral-300 dark:bg-neutral-700/80 rounded w-3/4" />
                <div className="h-3 bg-neutral-300 dark:bg-neutral-700/80 rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LikedVideosPageSkeleton;