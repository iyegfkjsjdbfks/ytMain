// Performance monitoring utilities for React components


interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private observers: PerformanceObserver[] = [];
  private isEnabled: boolean = process.env.NODE_ENV === 'development';

  constructor() {
    if (this.isEnabled && typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.setupObservers();
    }
  }

  private setupObservers() {
    // Observe paint metrics
    try {
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((_entry) => {
          });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    } catch (e) {
      // PerformanceObserver not supported
    }

    // Observe navigation metrics
    try {
      const navigationObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          const __navigation = entry as PerformanceNavigationTiming;
          });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);
    } catch (e) {
      // PerformanceObserver not supported
    }
  }

  startMeasure(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata: metadata || {},
    };
    
    this.metrics.set(name, metric);
    
    if (typeof window !== 'undefined' && window.performance && typeof window.performance.mark === 'function') {
      performance.mark(`${name}-start`);
    }
  }

  endMeasure(name: string): number | null {
    if (!this.isEnabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric '${name}' not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    metric.endTime = endTime;
    metric.duration = duration;

    if (typeof window !== 'undefined' && window.performance && typeof window.performance.mark === 'function' && typeof window.performance.measure === 'function') {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }

    // Log slow operations
    if (duration > 100) {
      console.warn(`⚠️ Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, metric.metadata);
    } else if (duration > 16) {
      }

    return duration;
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter(m => m.duration !== undefined);
  }

  clearMetrics(): void {
    this.metrics.clear();
    if (typeof window !== 'undefined' && window.performance && typeof window.performance.clearMarks === 'function') {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }

  getAverageTime(name: string): number | null {
    const metrics = this.getMetrics().filter(m => m.name === name);
    if (metrics.length === 0) return null;
    
    const total = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / metrics.length;
  }

  logSummary(): void {
    if (!this.isEnabled) return;

    const metrics = this.getMetrics();
    if (metrics.length === 0) {
      return;
    }

    console.group('📊 Performance Summary');
    
    // Group by name and calculate averages
    const grouped = metrics.reduce((acc, metric) => {
      if (metric.name && !acc[metric.name]) {
        acc[metric.name] = [];
      }
      if (metric.name && metric.duration !== undefined) {
        acc[metric.name].push(metric.duration);
      }
      return acc;
    }, {} as Record<string, number[]>);

    Object.entries(grouped).forEach(([_name, _durations]) => {
      // const _avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      // const _min = Math.min(...durations);
      // const _max = Math.max(...durations);
      
      });
    
    console.groupEnd();
  }

  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// React Hook for component performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const startRender = () => {
    performanceMonitor.startMeasure(`${componentName}-render`);
  };

  const endRender = () => {
    return performanceMonitor.endMeasure(`${componentName}-render`);
  };

  const measureAsync = async <T>(operationName: string, operation: () => Promise<T>): Promise<T> => {
    const fullName = `${componentName}-${operationName}`;
    performanceMonitor.startMeasure(fullName);
    try {
      const result = await operation();
      performanceMonitor.endMeasure(fullName);
      return result;
    } catch (error) {
      performanceMonitor.endMeasure(fullName);
      throw error;
    }
  };

  const measureSync = <T>(operationName: string, operation: () => T): T => {
    const fullName = `${componentName}-${operationName}`;
    performanceMonitor.startMeasure(fullName);
    try {
      const result = operation();
      performanceMonitor.endMeasure(fullName);
      return result;
    } catch (error) {
      performanceMonitor.endMeasure(fullName);
      throw error;
    }
  };

  return {
    startRender,
    endRender,
    measureAsync,
    measureSync,
  };
}

// Higher-order component for automatic performance monitoring
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const MonitoredComponent = React.forwardRef((props: P, ref: any) => {
    const { startRender, endRender } = usePerformanceMonitor(displayName);
    
    React.useEffect(() => {
      startRender();
      return () => {
        endRender();
      };
    });

    return React.createElement(WrappedComponent, { ...props, ref });
  });

  MonitoredComponent.displayName = `withPerformanceMonitoring(${displayName})`;
  
  return MonitoredComponent;
}

// Utility functions
export const measureRenderTime = (componentName: string) => {
  return (_target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      performanceMonitor.startMeasure(`${componentName}-${propertyKey}`);
      const result = originalMethod.apply(this, args);
      performanceMonitor.endMeasure(`${componentName}-${propertyKey}`);
      return result;
    };
    
    return descriptor;
  };
};

// Bundle size analyzer
export const analyzeBundleSize = () => {
  if (typeof window === 'undefined') return;
  
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  
  console.group('📦 Bundle Analysis');
  // Estimate bundle sizes (this is approximate)
  scripts.forEach((script: any) => {
    if (script.src && !script.src.includes('chrome-extension')) {
      }
  });
  
  styles.forEach((style: any) => {
    if (style.href && !style.href.includes('chrome-extension')) {
      }
  });
  
  console.groupEnd();
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if (typeof window === 'undefined' || !(window.performance as any)?.memory) {
    console.warn('Memory monitoring not supported in this browser');
    return;
  }
  
  // const _memory = (window.performance as any).memory;
  
  };

// React import (assuming it's available globally or imported elsewhere)
declare const React: any;