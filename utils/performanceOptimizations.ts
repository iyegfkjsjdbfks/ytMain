import { memo, useMemo, useCallback, lazy, type ComponentType } from 'react';

// Performance optimization utilities

/**
 * Enhanced React.memo with custom comparison functions
 */
export const withPerformanceOptimization = {
  /**
   * Basic memoization for functional components
   */
  basic: <P extends object>(Component: ComponentType<P>) => memo(Component),

  /**
   * Shallow comparison memoization
   */
  shallow: <P extends object>(Component: ComponentType<P>) =>
    memo(Component, (prevProps, nextProps) => {
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
    }),

  /**
   * Memoization that ignores specific props
   */
  ignoring: <P extends object>(ignoredProps: Array<keyof P>) =>
    (Component: ComponentType<P>) =>
      memo(Component, (prevProps, nextProps) => {
        const filteredPrev = { ...prevProps };
        const filteredNext = { ...nextProps };

        ignoredProps.forEach(prop => {
          delete filteredPrev[prop];
          delete filteredNext[prop];
        });

        return JSON.stringify(filteredPrev) === JSON.stringify(filteredNext);
      }),

  /**
   * Memoization for components with array props
   */
  arrayOptimized: <P extends object>(Component: ComponentType<P>) =>
    memo(Component, (prevProps, nextProps) => {
      for (const key in prevProps) {
        const prevValue = prevProps[key];
        const nextValue = nextProps[key];

        if (Array.isArray(prevValue) && Array.isArray(nextValue)) {
          if (prevValue.length !== nextValue.length) {
            return false;
          }
          for (let i = 0; i < prevValue.length; i++) {
            if (prevValue[i] !== nextValue[i]) {
              return false;
            }
          }
        } else if (prevValue !== nextValue) {
          return false;
        }
      }
      return true;
    }) };

/**
 * Lazy loading utilities
 */
export const lazyWithFallback = {
  /**
   * Create a lazy component
   */
  create: <P extends object>(
    importFunc: () => Promise<{ default: ComponentType<P> }>
  ) => {
    return lazy(importFunc);
  } };

/**
 * Hook optimization utilities
 */
export const hookOptimizations = {
  /**
   * Create stable object reference
   */
  useStableObject: <T extends object>(obj: T): T =>
    useMemo(() => obj, Object.values(obj)),

  /**
   * Create stable array reference
   */
  useStableArray: <T extends any[]>(arr: T): T =>
    useMemo(() => arr, arr),

  /**
   * Create stable callback with dependency optimization
   */
  useOptimizedCallback: <T extends (...args) => any>(
    callback: T,
    deps: any): T => useCallback(callback, deps),

  /**
   * Memoized expensive computation
   */
  useExpensiveComputation: <T>(
    computeFn: () => T,
    deps: any,
    shouldRecompute?: (newDeps: any, oldDeps: any) => boolean,
  ): T => {
    return useMemo(() => {
      if (shouldRecompute) {
        // Custom recomputation logic would go here
        // For now, just use standard memoization
      }
      return computeFn();
    }, deps);
  } };

/**
 * List rendering optimizations
 */
export const listOptimizations = {
  /**
   * Generate stable keys for list items
   */
  generateStableKey: (item: any, index: number, prefix = 'item: any'): string => {
    if (item.id) {
return `${prefix}-${item.id}`;
}
    if (item.key) {
return `${prefix}-${item.key}`;
}
    if (item.name) {
return `${prefix}-${item.name}`;
}
    return `${prefix}-${index}`;
  },

  /**
   * Chunk large arrays for better performance
   */
  chunkArray: <T>(array: T[], chunkSize: any): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  },

  /**
   * Virtual scrolling helper for large lists
   */
  getVisibleItems: <T>(
    items: T[],
    startIndex: any,
    visibleCount: any): T[] => {
    return items.slice(startIndex, startIndex + visibleCount);
  } };

/**
 * Image loading optimizations
 */
export const imageOptimizations = {
  /**
   * Preload critical images
   */
  preloadImage: (src: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  },

  /**
   * Lazy load image with intersection observer
   */
  createLazyImageObserver: (
    callback: (entry: IntersectionObserverEntry) => void,
    options?: IntersectionObserverInit,
  ): IntersectionObserver => {
    return new IntersectionObserver((entries) => {
      entries.forEach(callback);
    }, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options });
  } };

/**
 * Bundle size optimizations
 */
export const bundleOptimizations = {
  /**
   * Dynamic import with error handling
   */
  dynamicImport: async <T>(
    importFunc: () => Promise<T>
  ): Promise<T | null> => {
    try {
      return await importFunc();
    } catch (error) {
      console.error('Dynamic import failed:', error);
      return null;
    }
  },

  /**
   * Tree-shaking friendly import helper
   */
  selectiveImport: <T, K extends keyof T>(
    module: T,
    keys: K[],
  ): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach((key: K) => {
      result[key] = module[key];
    });
    return result;
  } };

/**
 * Event handler optimizations
 */
export const eventOptimizations = {
  /**
   * Throttled event handler
   */
  throttle: <T extends (...args) => any>(
    func: T,
    delay: any): T => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastExecTime = 0;

    return ((...args) => {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) {
clearTimeout(timeoutId);
}
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    }) as T;
  },

  /**
   * Debounced event handler
   */
  debounce: <T extends (...args) => any>(
    func: T,
    delay: any): T => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return ((...args) => {
      if (timeoutId) {
clearTimeout(timeoutId);
}
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  },

  /**
   * Passive event listener helper
   */
  addPassiveListener: (
    element: Element,
    event: Event,
    handler: EventListener,
    options?: AddEventListenerOptions,
  ): void => {
    element.addEventListener(event, handler, {
      passive: true,
      ...options });
  } };

/**
 * Memory management utilities
 */
export const memoryOptimizations = {
  /**
   * WeakMap cache for component instances
   */
  createWeakCache: <K extends object, V>(): {
    get: (key: K) => V | undefined;
    set: (key: K, value: V) => void;
    has: (key: K) => boolean;
    delete: (key: K) => boolean;
  } => {
    const cache = new WeakMap<K, V>();

    return {
      get: (key: K) => cache.get(key),
      set: (key: K, value: V) => cache.set(key, value),
      has: (key: K) => cache.has(key),
      delete: (key: K) => cache.delete(key) };
  },

  /**
   * LRU cache implementation
   */
  createLRUCache: <K, V>(maxSize: any) => {
    const cache = new Map<K, V>();

    return {
      get: (key: K): V | undefined => {
        if (cache.has(key)) {
          const value = cache.get(key)!;
          cache.delete(key);
          cache.set(key, value);
          return value;
        }
        return undefined;
      },
      set: (key: K, value: V): void => {
        if (cache.has(key)) {
          cache.delete(key);
        } else if (cache.size >= maxSize) {
          const firstKey = cache.keys().next().value;
          if (firstKey !== undefined) {
            cache.delete(firstKey);
          }
        }
        cache.set(key, value);
      },
      has: (key: K): boolean => cache.has(key),
      clear: (): void => cache.clear(),
      size: (): number => cache.size };
  } };

// Export all optimizations as a single object
export const PerformanceOptimizations = {
  withPerformanceOptimization,
  lazyWithFallback,
  hookOptimizations,
  listOptimizations,
  imageOptimizations,
  bundleOptimizations,
  eventOptimizations,
  memoryOptimizations };

export default PerformanceOptimizations;
