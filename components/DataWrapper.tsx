/// <reference types="react/jsx-runtime" />
import type React from 'react';

import { VideoGridSkeleton, ErrorState, EmptyState } from './LoadingStates';

interface DataWrapperProps<T> {
  data: T;
  loading: boolean;
  error: string | null;
  children: (data: T) => React.ReactNode;
  loadingSkeleton?: React.ReactNode;
  emptyState?: {
    title: string;
    message: string;
    icon?: React.ReactNode;
  };
  errorTitle?: string;
  isEmpty?: (data: T) => boolean;
}

/**
 * Higher-order component that handles common data fetching states
 * @param data - The fetched data
 * @param loading - Loading state
 * @param error - Error message if any
 * @param children - Render function for the data
 * @param loadingSkeleton - Custom loading component
 * @param emptyState - Configuration for empty state
 * @param errorTitle - Custom error title
 * @param isEmpty - Function to determine if data is empty
 */
export function DataWrapper<T>({
  data,
  loading,
  error,
  children,
  loadingSkeleton,
  emptyState,
  errorTitle,
  isEmpty = (data: T) => Array.isArray(data) ? data.length === 0 : !data,
}: DataWrapperProps<T>) {
  if (loading) {
    return loadingSkeleton || <VideoGridSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title={errorTitle || 'Failed to load data'}
        message={error}
      />
    );
  }

  if (isEmpty(data) && emptyState) {
    return (
      <EmptyState
        title={emptyState.title}
        message={emptyState.message}
        icon={emptyState.icon}
      />
    );
  }

  return <>{children(data)}</>;
}

export default DataWrapper;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: any;
    }
  }
}
