import { memo, useMemo, forwardRef, lazy, createElement, useEffect, type ComponentType, type EffectCallback, type DependencyList, type LazyExoticComponent } from 'react';

/**
 * Higher-order component that adds React.memo with custom comparison
 */
export function withMemo<P extends object>(
  Component: ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean,
): ComponentType<P> {
  return memo(Component, areEqual) as unknown as ComponentType<P>;
}

/**
 * Higher-order component for lazy loading components
 */
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  _fallback?: ComponentType<any>,
): LazyExoticComponent<ComponentType<P>> {
  return lazy(importFunc);
}

/**
 * Utility for creating stable object references to prevent unnecessary re-renders
 */
export function useStableObject<T extends object>(obj: T): T {
  return useMemo(() => obj, Object.values(obj));
}

/**
 * Utility for creating stable array references
 */
export function useStableArray<T>(arr: T): T[] {
  return useMemo(() => arr, arr);
}

/**
 * Custom comparison functions for React.memo
 */
export const memoComparisons = {
  /**
   * Shallow comparison for props
   */
  shallow: <P extends object>(prevProps: P, nextProps: P): boolean => {
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

    return true;
  },

  /**
   * Deep comparison for props (use sparingly)
   */
  deep: <P extends object>(prevProps: P, nextProps: P): boolean => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  },

  /**
   * Comparison that ignores specific props
   */
  ignoring: <P extends object>(ignoredProps: Array<keyof P>) =>
    (prevProps: P, nextProps: P): boolean => {
      const filteredPrev = { ...prevProps };
      const filteredNext = { ...nextProps };

      ignoredProps.forEach(prop => {
        delete filteredPrev[prop];
        delete filteredNext[prop];
      });

      return memoComparisons.shallow(filteredPrev, filteredNext);
    },
};

/**
 * Utility for optimizing list rendering
 */
export const listOptimizations = {
  /**
   * Generate stable keys for list items
   */
  generateKey: (item: any, index: number, prefix = 'item'): string => {
    if (item.id) {
return `${prefix}-${item.id}`;
}
    if (item.key) {
return `${prefix}-${item.key}`;
}
    return `${prefix}-${index}`;
  },

  /**
   * Chunk large arrays for better performance
   */
  chunkArray: <T>(array: T, chunkSize: any): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  },
};

/**
 * Performance monitoring for components
 */
export const componentPerformance = {
  /**
   * HOC to measure component render time
   */
  withRenderTime: <P extends object>(Component: ComponentType<P>, _name?: string) => {
    return forwardRef<any, P>((props, ref) => {
      useEffect(() => {
        // Performance monitoring disabled
        // const startTime = performance.now();

        return () => {
          // const endTime = performance.now();
          // const componentName = name || Component.displayName || Component.name || 'Component';
          // console.log(`${componentName} render time: ${endTime - startTime}ms`);
          };
      });

      return createElement(Component, { ...props, ref } as any);
    });
  },

  /**
   * Hook to measure effect execution time
   */
  useMeasuredEffect: (effect: EffectCallback, deps: DependencyList, _effectName = 'Effect') => {
    useEffect(() => {
      // Performance monitoring disabled
      // const startTime = performance.now();
      const cleanup = effect();
      // const endTime = performance.now();
      // console.log(`${_effectName} execution time: ${endTime - startTime}ms`);

      return cleanup;
    }, deps);
  },
};

/**
 * Bundle size optimization utilities
 */
export const bundleOptimizations = {
  /**
   * Dynamic import with error handling
   */
  dynamicImport: async <T>(importFunc: () => Promise<T>): Promise<T | null> => {
    try {
      return await importFunc();
    } catch (error) {
      console.error('Dynamic import failed:', error);
      return null;
    }
  },

  /**
   * Preload component for better UX
   */
  preloadComponent: (importFunc: () => Promise<any>) => {
    // Start loading the component but don't wait for it
    importFunc().catch(error => {
      console.warn('Component preload failed:', error);
    });
  },
};