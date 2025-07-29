import React from 'react';

// Import the components for HOCs
import DataFetchErrorBoundary from './DataFetchErrorBoundary';
import LiveStreamErrorBoundary from './LiveStreamErrorBoundary';
import VideoErrorBoundary from './VideoErrorBoundary';

// Re-export all error boundaries and their types
export { default as VideoErrorBoundary, type VideoErrorBoundaryProps } from './VideoErrorBoundary';
export { default as LiveStreamErrorBoundary, type LiveStreamErrorBoundaryProps } from './LiveStreamErrorBoundary';
export { default as DataFetchErrorBoundary, type DataFetchErrorBoundaryProps } from './DataFetchErrorBoundary';

// Re-export the main error boundary from the common components
export { ErrorBoundary as BaseErrorBoundary } from '../common/components/ErrorBoundary';

// Re-export all protected components
export * from './ProtectedComponents';

// Higher-Order Components for wrapping components with error boundaries
export const withVideoErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<VideoErrorBoundaryProps>,
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <VideoErrorBoundary {...errorBoundaryProps}>
      <Component {...props} ref={ref} />
    </VideoErrorBoundary>
  ));
};

export const withLiveStreamErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<LiveStreamErrorBoundaryProps>,
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <LiveStreamErrorBoundary {...errorBoundaryProps}>
      <Component {...props} ref={ref} />
    </LiveStreamErrorBoundary>
  ));
};

export const withDataFetchErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<DataFetchErrorBoundaryProps>,
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <DataFetchErrorBoundary {...errorBoundaryProps}>
      <Component {...props} ref={ref} />
    </DataFetchErrorBoundary>
  ));
};