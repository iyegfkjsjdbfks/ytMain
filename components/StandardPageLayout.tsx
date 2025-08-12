import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { ErrorState } from './LoadingStates';
import { ReactNode } from 'react';
import { FC } from 'react';

interface StandardPageLayoutProps {
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

/**
 * Standardized page layout component that handles common page patterns:
 * - Loading states with customizable skeletons
 * - Error states with retry functionality
 * - Empty states with custom messaging
 * - Consistent header structure
 *
 * Reduces code duplication across pages by providing a unified layout structure
 */
const StandardPageLayout: React.FC<StandardPageLayoutProps> = ({
  children,
  loading = false,
  error = null,
  isEmpty = false,
  title,
  subtitle,
  headerActions,
  loadingComponent,
  errorComponent,
  emptyComponent,
  className = '',
  containerClassName = 'container mx-auto px-4 py-6' }) => {
  // Default loading component
  const defaultLoadingComponent: any = (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" />
    </div>
  );

  // Default error component
  const defaultErrorComponent: any = (
    <ErrorState
      title="Something went wrong"
      message={error || 'An unexpected error occurred'}
    />
  );

  // Default empty component
  const defaultEmptyComponent: any = (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="text-gray-400 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No content found
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        There's nothing to display at the moment.
      </p>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      <div className={containerClassName}>
        {/* Page Header */}
        {(title || subtitle || headerActions) && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                {title && (
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
              {headerActions && (
                <div className="flex items-center space-x-4">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="relative">
          {loading && (loadingComponent || defaultLoadingComponent)}

          {!loading && error && (errorComponent || defaultErrorComponent)}

          {!loading && !error && isEmpty && (emptyComponent || defaultEmptyComponent)}

          {!loading && !error && !isEmpty && children}
        </div>
      </div>
    </div>
  );
};

export default StandardPageLayout;