import React from 'react';

// Re-export all error boundaries and their types
export { default as VideoErrorBoundary, type VideoErrorBoundaryProps } from './VideoErrorBoundary';
export { default as LiveStreamErrorBoundary, type LiveStreamErrorBoundaryProps } from './LiveStreamErrorBoundary';
export { default as DataFetchErrorBoundary, type DataFetchErrorBoundaryProps } from './DataFetchErrorBoundary';

// Re-export the main error boundary from the common components
export { ErrorBoundary as BaseErrorBoundary } from '../../features/common/components/ErrorBoundary';

// Re-export all protected components
export * from './ProtectedComponents';

// Higher-Order Components for wrapping components with error boundaries
export const withVideoErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<VideoErrorBoundaryProps>,
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <VideoErrorBoundary {...errorBoundaryProps}>
      <Component {...(props as P)} ref={ref} />
    </VideoErrorBoundary>
  ));

  WrappedComponent.displayName = `withVideoErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export const withLiveStreamErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<LiveStreamErrorBoundaryProps>,
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <LiveStreamErrorBoundary {...errorBoundaryProps}>
      <Component {...(props as P)} ref={ref} />
    </LiveStreamErrorBoundary>
  ));

  WrappedComponent.displayName = `withLiveStreamErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export const withDataFetchErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<DataFetchErrorBoundaryProps>,
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <DataFetchErrorBoundary {...errorBoundaryProps}>
      <Component {...(props as P)} ref={ref} />
    </DataFetchErrorBoundary>
  ));

  WrappedComponent.displayName = `withDataFetchErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};