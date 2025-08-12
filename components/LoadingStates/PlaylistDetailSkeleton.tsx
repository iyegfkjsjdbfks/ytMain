import React from 'react';
const PlaylistDetailSkeleton: React.FC = () => {
  return (
    <div className="p-4 md:p-6 animate-pulse bg-white dark:bg-neutral-950">
      <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-3" />
      <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-6" />
      <div className="flex space-x-3 mb-8">
          <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
          <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 py-2.5 border-b border-neutral-200 dark:border-neutral-800">
          <div className="w-6 text-neutral-400 dark:text-neutral-500 bg-neutral-200 dark:bg-neutral-700 h-6 rounded" />
          <div className="w-28 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-md flex-shrink-0" />
          <div className="flex-grow space-y-2">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlaylistDetailSkeleton;