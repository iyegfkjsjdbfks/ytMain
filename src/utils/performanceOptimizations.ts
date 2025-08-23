// Performance Optimizations - Minimal Implementation
import React from 'react';

export const withMemo = <P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return React.memo(Component, propsAreEqual);
};

export const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  
  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    
    return true;
  }
  
  return false;
};

export const shallowEqual = <T extends object>(a: T, b: T): boolean => {
  const keysA = Object.keys(a) as Array<keyof T>;
  const keysB = Object.keys(b) as Array<keyof T>;
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }
  
  return true;
};

export class PerformanceObserver {
  private observers: PerformanceObserver[] = [];

  observeFID(callback: (entry: PerformanceEntry) => void): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new window.PerformanceObserver((list) => {
          list.getEntries().forEach(callback);
        });
        observer.observe({ entryTypes: ['first-input'] });
        this.observers.push(observer);
      } catch (error) {
        console.warn('FID observation failed:', error);
      }
    }
  }

  observeCLS(callback: (entry: PerformanceEntry) => void): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new window.PerformanceObserver((list) => {
          list.getEntries().forEach(callback);
        });
        observer.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(observer);
      } catch (error) {
        console.warn('CLS observation failed:', error);
      }
    }
  }

  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  hasMetric(name: string): boolean {
    return performance.getEntriesByName(name).length > 0;
  }
}

export const optimizeImageUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): string => {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    
    if (options.width) {
      urlObj.searchParams.set('w', options.width.toString());
    }
    
    if (options.height) {
      urlObj.searchParams.set('h', options.height.toString());
    }
    
    if (options.quality) {
      urlObj.searchParams.set('q', options.quality.toString());
    }
    
    return urlObj.toString();
  } catch (error) {
    console.warn('Image URL optimization failed:', error);
    return url;
  }
};

export const preloadComponent = (
  componentImport: () => Promise<any>
) => {
  let componentPromise: Promise<any> | null = null;
  
  return {
    preload: () => {
      if (!componentPromise) {
        componentPromise = componentImport();
      }
      return componentPromise;
    },
    
    load: () => {
      if (!componentPromise) {
        componentPromise = componentImport();
      }
      return componentPromise;
    }
  };
};

export const createMemoryManager = () => {
  const cache = new Map<string, any>();
  const maxSize = 100;
  
  return {
    set(key: string, value: any): void {
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    },
    
    get(key: string): any {
      return cache.get(key);
    },
    
    has(key: string): boolean {
      return cache.has(key);
    },
    
    delete(key: string): boolean {
      return cache.delete(key);
    },
    
    clear(): void {
      cache.clear();
    },
    
    size(): number {
      return cache.size;
    }
  };
};

export const createRequestDeduplicator = () => {
  const pendingRequests = new Map<string, Promise<any>>();
  
  return {
    deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
      if (pendingRequests.has(key)) {
        return pendingRequests.get(key) as Promise<T>;
      }
      
      const promise = requestFn().finally(() => {
        pendingRequests.delete(key);
      });
      
      pendingRequests.set(key, promise);
      return promise;
    }
  };
};