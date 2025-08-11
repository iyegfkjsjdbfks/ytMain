import { useEffect, useRef, useCallback, useState, memo } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  mountTime: number;
  updateCount: number;
  memoryUsage?: number;
  componentName: string;
  timestamp: number;
}

interface PerformanceConfig {
  enableMemoryTracking?: boolean;
  enableRenderTracking?: boolean;
  enableNetworkTracking?: boolean;
  sampleRate?: number; // 0-1, percentage of renders to track
  maxMetricsHistory?: number;
}

const DEFAULT_CONFIG: Required<PerformanceConfig> = {
  enableMemoryTracking: true,
  enableRenderTracking: true,
  enableNetworkTracking: true,
  sampleRate: 0.1, // Track 10% of renders
  maxMetricsHistory: 100,
};

// Global performance store
class PerformanceStore {
  private metrics: PerformanceMetrics = [];
  private observers: Array<(metrics: PerformanceMetrics) => void> = [];

  addMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    if (this.metrics.length > DEFAULT_CONFIG.maxMetricsHistory) {
      this.metrics.shift();
    }
    this.notifyObservers();
  }

  getMetrics() {
    return [...this.metrics];
  }

  getMetricsByComponent(componentName: any) {
    return this.metrics.filter((m: any) => m.componentName === componentName);
  }

  subscribe(observer: (metrics: PerformanceMetrics) => void) {
    this.observers.push(observer);
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  private notifyObservers() {
    this.observers.forEach(observer => observer(this.getMetrics()));
  }

  clear() {
    this.metrics = [];
    this.notifyObservers();
  }

  getAverageRenderTime(componentName?: string) {
    const relevantMetrics = componentName
      ? this.getMetricsByComponent(componentName)
      : this.metrics;

    if (relevantMetrics.length === 0) {
      return 0;
    }

    const totalTime = relevantMetrics.reduce(
      (sum: any, m: any) => sum + m.renderTime,
      0
    );
    return totalTime / relevantMetrics.length;
  }

  getSlowRenders(threshold = 16) {
    // 16ms = 60fps
    return this.metrics.filter((m: any) => m.renderTime > threshold);
  }
}

const performanceStore = new PerformanceStore();

export const usePerformanceMonitor = (
  componentName: any,
  config: PerformanceConfig = {}
) => {
  const opts = { ...DEFAULT_CONFIG, ...config };
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);
  const updateCount = useRef<number>(0);
  const [isTracking, setIsTracking] = useState(false);

  // Start tracking on mount
  useEffect(() => {
    mountTime.current = performance.now();
    setIsTracking(Math.random() < opts.sampleRate);
  }, [opts.sampleRate]);

  // Track render start
  const startRender = useCallback(() => {
    if (!isTracking || !opts.enableRenderTracking) {
      return;
    }
    renderStartTime.current = performance.now();
  }, [isTracking, opts.enableRenderTracking]);

  // Track render end and collect metrics
  const endRender = useCallback(() => {
    if (!isTracking || !opts.enableRenderTracking || !renderStartTime.current) {
      return;
    }

    const renderTime = performance.now() - renderStartTime.current;
    updateCount.current++;

    const metric: PerformanceMetrics = {
      renderTime,
      mountTime: performance.now() - mountTime.current,
      updateCount: updateCount.current,
      componentName,
      timestamp: Date.now(),
    };

    // Add memory usage if available and enabled
    if (opts.enableMemoryTracking && 'memory' in performance) {
      const { memory } = performance as any;
      metric.memoryUsage = memory.usedJSHeapSize;
    }

    performanceStore.addMetric(metric);
    renderStartTime.current = 0;
  }, [
    isTracking,
    opts.enableRenderTracking,
    opts.enableMemoryTracking,
    componentName,
  ]);

  // Auto-track renders
  useEffect(() => {
    startRender();
    return () => {
      endRender();
    };
  });

  // Manual tracking methods
  const trackAsyncOperation = useCallback(
    async <T>(operation: () => Promise<T>, operationName: any): Promise<T> => {
      const startTime = performance.now();

      try {
        const result = await operation();
        const duration = performance.now() - startTime;

        performanceStore.addMetric({
          renderTime: duration,
          mountTime: 0,
          updateCount: 0,
          componentName: `${componentName}.${operationName}`,
          timestamp: Date.now(),
        });

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;

        performanceStore.addMetric({
          renderTime: duration,
          mountTime: 0,
          updateCount: 0,
          componentName: `${componentName}.${operationName}.error`,
          timestamp: Date.now(),
        });

        throw error;
      }
    },
    [componentName]
  );

  const measureFunction = useCallback(
    <T extends any, R>(fn: (...args: T) => R, functionName: any) => {
      return (...args: T): R => {
        const startTime = performance.now();
        const result = fn(...args);
        const duration = performance.now() - startTime;

        performanceStore.addMetric({
          renderTime: duration,
          mountTime: 0,
          updateCount: 0,
          componentName: `${componentName}.${functionName}`,
          timestamp: Date.now(),
        });

        return result;
      };
    },
    [componentName]
  );

  return {
    startRender,
    endRender,
    trackAsyncOperation,
    measureFunction,
    isTracking,
  };
};

// Hook to access performance data
export const usePerformanceData = (componentName?: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);

  useEffect(() => {
    const updateMetrics = (allMetrics: PerformanceMetrics) => {
      const filteredMetrics = componentName
        ? allMetrics.filter((m: any) =>
            m.componentName.startsWith(componentName)
          )
        : allMetrics;
      setMetrics(filteredMetrics);
    };

    updateMetrics(performanceStore.getMetrics());
    const unsubscribe = performanceStore.subscribe(updateMetrics);

    return unsubscribe;
  }, [componentName]);

  const stats = {
    averageRenderTime: performanceStore.getAverageRenderTime(componentName),
    slowRenders: performanceStore
      .getSlowRenders()
      .filter(
        (m: any) => !componentName || m.componentName.startsWith(componentName)
      ),
    totalRenders: metrics.length,
    lastRender: metrics[metrics.length - 1],
  };

  return {
    metrics,
    stats,
    clearMetrics: () => performanceStore.clear(),
  };
};

// Hook for Core Web Vitals monitoring
export const useWebVitals = () => {
  const [vitals, setVitals] = useState<{
    CLS?: number;
    FID?: number;
    FCP?: number;
    LCP?: number;
    TTFB?: number;
  }>({});

  useEffect(() => {
    // Largest Contentful Paint
    const observeLCP = () => {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        setVitals(prev => ({ ...prev, LCP: lastEntry.startTime }));
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      return observer;
    };

    // First Contentful Paint
    const observeFCP = () => {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            setVitals(prev => ({ ...prev, FCP: entry.startTime }));
          }
        });
      });
      observer.observe({ entryTypes: ['paint'] });
      return observer;
    };

    // Cumulative Layout Shift
    const observeCLS = () => {
      let clsValue = 0;
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            setVitals(prev => ({ ...prev, CLS: clsValue }));
          }
        });
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      return observer;
    };

    const observers = [observeLCP(), observeFCP(), observeCLS()];

    // TTFB from Navigation Timing
    const navigation = performance.getEntriesByType('navigation')[0] as any;
    if (navigation) {
      setVitals(prev => ({
        ...prev,
        TTFB: navigation.responseStart - navigation.requestStart,
      }));
    }

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, []);

  return vitals;
};

// Performance budget checker
export const usePerformanceBudget = () => {
  const budgets = {
    renderTime: 16, // 60fps
    bundleSize: 250 * 1024, // 250KB
    imageSize: 100 * 1024, // 100KB
    apiResponse: 1000, // 1 second
  };

  const checkBudget = useCallback((metric: any, value: string | number) => {
    const budget = budgets[metric as keyof typeof budgets];
    if (!budget) {
      return { withinBudget: true, budget: 0, overage: 0 };
    }

    const withinBudget = value <= budget;
    const overage = withinBudget ? 0 : value - budget;

    return { withinBudget, budget, overage };
  }, []);

  return {
    budgets,
    checkBudget,
  };
};

export { performanceStore };
export default usePerformanceMonitor;
