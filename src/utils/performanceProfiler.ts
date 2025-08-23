// Performance Profiler - Minimal Implementation
import React from 'react';

export const withPerformanceProfiler = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return React.forwardRef<any, P>((props, ref) => {
    React.useEffect(() => {
      const componentName = Component.displayName || Component.name || 'Component';
      performance.mark(`${componentName}-render-start`);
      
      return () => {
        performance.mark(`${componentName}-render-end`);
        performance.measure(
          `${componentName}-render`,
          `${componentName}-render-start`,
          `${componentName}-render-end`
        );
      };
    });
    
    return React.createElement(Component, { ...props, ref });
  });
};

export default withPerformanceProfiler;