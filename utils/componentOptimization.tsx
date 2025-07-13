/**
 * Component optimization utilities for React performance enhancement
 */

import React, { 
  memo, 
  useMemo, 
  useCallback, 
  useRef, 
  useEffect, 
  useState,
  type ComponentType,
  type ReactNode,
  type MemoExoticComponent
} from 'react';
import { performanceMonitor } from './performanceMonitor';

// Performance monitoring hook for components
export function useComponentPerformance(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  // Track component mount time
  useEffect(() => {
    mountTime.current = performance.now();
    
    return () => {
      const unmountTime = performance.now();
      const totalLifetime = unmountTime - mountTime.current;
      
      if (import.meta.env.DEV) {
        console.log(`Component ${componentName} lifetime: ${totalLifetime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  // Track render performance
  useEffect(() => {
    renderCount.current += 1;
    const renderEndTime = performance.now();
    const renderDuration = renderEndTime - renderStartTime.current;
    
    performanceMonitor.trackComponentRender(componentName, renderDuration);
    
    if (import.meta.env.DEV && renderDuration > 16) {
      console.warn(`Slow render detected in ${componentName}: ${renderDuration.toFixed(2)}ms`);
    }
  });

  // Track visibility for lazy loading optimization
  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, []);

  // Mark render start time
  renderStartTime.current = performance.now();

  return {
    elementRef,
    isVisible,
    renderCount: renderCount.current,
    trackCustomMetric: (metricName: string, value: number) => {
      performanceMonitor.trackCustomMetric(`${componentName}_${metricName}`, value);
    },
  };
}

// Smart memo wrapper that includes performance tracking
export function smartMemo<P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean,
  componentName?: string
): MemoExoticComponent<ComponentType<P>> {
  const displayName = componentName || Component.displayName || Component.name || 'Component';
  
  const MemoizedComponent = memo(Component, (prevProps, nextProps) => {
    const startTime = performance.now();
    
    // Use custom comparison if provided
    if (propsAreEqual) {
      const result = propsAreEqual(prevProps, nextProps);
      const comparisonTime = performance.now() - startTime;
      
      if (import.meta.env.DEV && comparisonTime > 1) {
        console.warn(`Slow props comparison in ${displayName}: ${comparisonTime.toFixed(2)}ms`);
      }
      
      return result;
    }
    
    // Default shallow comparison with performance tracking
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);
    
    if (prevKeys.length !== nextKeys.length) {
      return false;
    }
    
    for (const key of prevKeys) {
      if (prevProps[key as keyof P] !== nextProps[key as keyof P]) {
        return false;
      }
    }
    
    const comparisonTime = performance.now() - startTime;
    if (import.meta.env.DEV && comparisonTime > 1) {
      console.warn(`Slow props comparison in ${displayName}: ${comparisonTime.toFixed(2)}ms`);
    }
    
    return true;
  });
  
  MemoizedComponent.displayName = `SmartMemo(${displayName})`;
  return MemoizedComponent;
}

// Optimized callback hook with dependency tracking
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  debugName?: string
): T {
  const callbackRef = useRef(callback);
  const depsRef = useRef(deps);
  const creationTime = useRef(performance.now());
  
  // Track dependency changes
  const depsChanged = useMemo(() => {
    if (!depsRef.current) return true;
    
    const changed = deps.some((dep, index) => dep !== depsRef.current[index]);
    
    if (changed && import.meta.env.DEV && debugName) {
      const timeSinceCreation = performance.now() - creationTime.current;
      console.log(`Callback ${debugName} recreated after ${timeSinceCreation.toFixed(2)}ms`);
      creationTime.current = performance.now();
    }
    
    return changed;
  }, deps);
  
  return useCallback(callback, deps);
}

// Optimized memo hook with size tracking
export function useOptimizedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  debugName?: string
): T {
  const valueRef = useRef<T>();
  const depsRef = useRef(deps);
  const creationTime = useRef(performance.now());
  const computationTime = useRef(0);
  
  return useMemo(() => {
    const startTime = performance.now();
    const result = factory();
    const endTime = performance.now();
    
    computationTime.current = endTime - startTime;
    
    if (import.meta.env.DEV) {
      if (computationTime.current > 5) {
        console.warn(`Expensive memo computation${debugName ? ` in ${debugName}` : ''}: ${computationTime.current.toFixed(2)}ms`);
      }
      
      // Estimate memory usage for objects
      if (typeof result === 'object' && result !== null) {
        const jsonSize = JSON.stringify(result).length;
        if (jsonSize > 10000) { // 10KB threshold
          console.warn(`Large memo value${debugName ? ` in ${debugName}` : ''}: ~${(jsonSize / 1024).toFixed(1)}KB`);
        }
      }
    }
    
    return result;
  }, deps);
}

// Lazy component wrapper with loading states
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ReactNode,
  errorFallback?: ReactNode
) {
  const LazyComponent = React.lazy(importFn);
  
  return function LazyWrapper(props: P) {
    const [error, setError] = useState<Error | null>(null);
    
    if (error) {
      return errorFallback || (
        <div className="p-4 text-center text-red-600">
          <p>Failed to load component</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      );
    }
    
    return (
      <React.Suspense 
        fallback={fallback || (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      >
        <LazyComponent {...props} />
      </React.Suspense>
    );
  };
}

// Virtual scrolling hook for large lists
export function useVirtualScrolling({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 5,
}: {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, itemCount, overscan]);
  
  const totalHeight = itemCount * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;
  
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);
  
  return {
    visibleRange,
    totalHeight,
    offsetY,
    handleScroll,
  };
}

// Image optimization hook with lazy loading
export function useOptimizedImage(src: string, options: {
  placeholder?: string;
  sizes?: string;
  quality?: number;
  priority?: boolean;
} = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isVisible, setIsVisible] = useState(options.priority || false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Intersection observer for lazy loading
  useEffect(() => {
    if (options.priority || !imgRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [options.priority]);
  
  // Generate optimized image URL
  const optimizedSrc = useMemo(() => {
    if (!isVisible) return options.placeholder || '';
    
    // Add optimization parameters if supported
    const url = new URL(src, window.location.origin);
    if (options.quality) {
      url.searchParams.set('quality', options.quality.toString());
    }
    
    return url.toString();
  }, [src, isVisible, options.placeholder, options.quality]);
  
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setIsError(false);
  }, []);
  
  const handleError = useCallback(() => {
    setIsError(true);
    setIsLoaded(false);
  }, []);
  
  return {
    imgRef,
    src: optimizedSrc,
    isLoaded,
    isError,
    isVisible,
    onLoad: handleLoad,
    onError: handleError,
  };
}

// Bundle splitting utility
export function createAsyncComponent<P extends object>(
  componentPath: string,
  chunkName?: string
) {
  return React.lazy(() => {
    const startTime = performance.now();
    
    return import(/* webpackChunkName: "[request]" */ componentPath)
      .then(module => {
        const loadTime = performance.now() - startTime;
        
        if (import.meta.env.DEV) {
          console.log(`Loaded chunk ${chunkName || componentPath} in ${loadTime.toFixed(2)}ms`);
        }
        
        performanceMonitor.trackCustomMetric(
          `chunk_load_${chunkName || componentPath.replace(/[^a-zA-Z0-9]/g, '_')}`,
          loadTime
        );
        
        return module;
      })
      .catch(error => {
        console.error(`Failed to load chunk ${chunkName || componentPath}:`, error);
        throw error;
      });
  });
}

// Performance monitoring wrapper for components
export function withPerformanceMonitoring<P extends object>(
  Component: ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || Component.displayName || Component.name || 'Component';
  
  return function PerformanceMonitoredComponent(props: P) {
    const { elementRef, isVisible, renderCount, trackCustomMetric } = useComponentPerformance(displayName);
    
    // Track visibility changes
    useEffect(() => {
      if (isVisible) {
        trackCustomMetric('visibility_time', performance.now());
      }
    }, [isVisible, trackCustomMetric]);
    
    // Add performance data to dev tools
    useEffect(() => {
      if (import.meta.env.DEV && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = (
          id: any,
          root: any,
          priorityLevel: any
        ) => {
          // Custom performance tracking logic
        };
      }
    }, []);
    
    return (
      <div ref={elementRef} data-component={displayName} data-render-count={renderCount}>
        <Component {...props} />
      </div>
    );
  };
}

// Debounced state hook for performance
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, T, (value: T) => void] {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return [value, debouncedValue, setValue];
}

// Throttled callback hook
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): T {
  const lastCall = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      return callback(...args);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCall.current = Date.now();
        callback(...args);
      }, delay - (now - lastCall.current));
    }
  }, [callback, delay]) as T;
}

// Export optimization utilities
export const optimizationUtils = {
  smartMemo,
  useOptimizedCallback,
  useOptimizedMemo,
  createLazyComponent,
  useVirtualScrolling,
  useOptimizedImage,
  createAsyncComponent,
  withPerformanceMonitoring,
  useDebouncedState,
  useThrottledCallback,
  useComponentPerformance,
};

export default optimizationUtils;