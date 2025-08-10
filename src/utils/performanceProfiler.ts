// TODO: Fix import - import React from 'react';

// Performance monitoring utility for React components

export const withPerformanceProfiler = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string,
) => {
  const WrappedComponent = (props: P) => {
    if (process.env.NODE_ENV === 'development') {
      return React.createElement(
        React.Profiler,
        {
          id: componentName,
          onRender: (id: string, phase: string, actualDuration: number) => {
            if (actualDuration > 16) {
              console.warn(
                `⚡ Slow render detected: ${id} (${phase}) took ${actualDuration.toFixed(2)}ms`,
              );
            }
          },
        },
        React.createElement(Component, props),
      );
    }
    return React.createElement(Component, props);
  };

  return React.memo(WrappedComponent);
};