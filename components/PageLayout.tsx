import React from 'react';
import { DataWrapper } from './DataWrapper';
import { VideoGridSkeleton } from './LoadingStates';

interface PageLayoutProps<T> {
  title: string;
  icon?: React.ReactNode;
  data: T;
  loading: boolean;
  error: string | null;
  children: (data: T) => React.ReactNode;
  headerActions?: React.ReactNode;
  emptyState?: {
    title: string;
    message: string;
    icon?: React.ReactNode;
  };
  className?: string;
  skeletonCount?: number;
}

export function PageLayout<T>({
  title,
  icon,
  data,
  loading,
  error,
  children,
  headerActions,
  emptyState,
  className = '',
  skeletonCount = 18
}: PageLayoutProps<T>) {
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-3 md:gap-x-4 gap-y-5 md:gap-y-6">
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-neutral-900 rounded-xl animate-pulse">
          <div className="aspect-video bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
          <div className="p-3">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-full bg-neutral-300 dark:bg-neutral-700/80 mt-0.5 flex-shrink-0"></div>
              <div className="flex-grow space-y-1.5 pt-0.5">
                <div className="h-4 bg-neutral-300 dark:bg-neutral-700/80 rounded w-5/6"></div>
                <div className="h-3 bg-neutral-300 dark:bg-neutral-700/80 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-300 dark:bg-neutral-700/80 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`p-4 md:p-6 bg-white dark:bg-neutral-950 ${className}`}>
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center">
          {icon && <div className="w-7 h-7 sm:w-8 sm:h-8 mr-3">{icon}</div>}
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {title}
          </h1>
        </div>
        {headerActions && (
          <div className="flex items-center space-x-2">
            {headerActions}
          </div>
        )}
      </div>

      <DataWrapper
        data={data}
        loading={loading}
        error={error}
        loadingSkeleton={renderSkeleton()}
        emptyState={emptyState}
      >
        {(data) => children(data)}
      </DataWrapper>
    </div>
  );
}

export default PageLayout;