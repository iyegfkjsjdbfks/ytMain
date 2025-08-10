
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
import type React from 'react';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface VideoGridSkeletonProps {
  count?: number;
}

export const VideoGridSkeleton: React.FC<VideoGridSkeletonProps> = ({ count = 18 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-3 md:gap-x-4 gap-y-5 md:gap-y-6">
    {Array.from({ length: count }).map((_, index) => (
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

interface ErrorStateProps {
  title?: string;
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  icon,
  className = '',
}) => (
  <div className={`text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-xl shadow-lg ${className}`}>
    {icon || <ExclamationTriangleIcon className="w-16 h-16 text-red-400 dark:text-red-600 mx-auto mb-6" />}
    <p className="text-xl sm:text-2xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
      {title}
    </p>
    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-md mx-auto">
      {message}
    </p>
  </div>
);

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  className = '',
}) => (
  <div className={`text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-xl shadow-lg ${className}`}>
    {icon && <div className="mx-auto mb-6">{icon}</div>}
    <p className="text-xl sm:text-2xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
      {title}
    </p>
    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-md mx-auto">
      {message}
    </p>
  </div>
);