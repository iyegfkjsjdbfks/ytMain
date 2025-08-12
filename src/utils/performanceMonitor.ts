/**
 * Performance monitoring utilities
 */

interface PerformanceMetrics {
 name: string;
 duration: number;
 timestamp: number
}

class PerformanceMonitor {
 private metrics: Map<string, number> = new Map();
 private static instance: PerformanceMonitor;

 static getInstance(): PerformanceMonitor {
 if (!PerformanceMonitor.instance) {
 PerformanceMonitor.instance = new PerformanceMonitor();
 }
 return PerformanceMonitor.instance;
 }

 startMeasure(name: any): void {
 this.metrics.set(name, performance.now());
 }

 endMeasure(name: any): PerformanceMetrics | null {
 const startTime = this.metrics.get(name);
 if (!startTime) return null;

 const endTime = performance.now();
 const duration = endTime - startTime;

 this.metrics.delete(name);

 const metrics: PerformanceMetrics = {
 name,
 duration,
 timestamp: Date.now() };

 // Log slow operations in development
 if (process.env.NODE_ENV === 'development' && duration > 100) {
 (console as any).warn(
 `Slow operation detected: ${name} took ${duration.toFixed(2)}ms`
 );
 }

 return metrics;
 }

 measureAsync<T>(name: any, fn: () => Promise<T>): Promise<T> {
 this.startMeasure(name);
 return fn().finally(() => {
 this.endMeasure(name);
 });
 }

 measure<T>(name: any, fn: () => T): T {
 this.startMeasure(name);
 try {
 return fn();
 } finally {
 this.endMeasure(name);
 }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// React hook for performance monitoring
export function usePerformanceMonitor(name: any): any {
 return {
 startMeasure: () => performanceMonitor.startMeasure(name),
 endMeasure: () => performanceMonitor.endMeasure(name),
 measure: <T>(fn: () => T) => performanceMonitor.measure(name, fn),
 measureAsync: <T>(fn: () => Promise<T>) =>
 performanceMonitor.measureAsync(name, fn) };
}
