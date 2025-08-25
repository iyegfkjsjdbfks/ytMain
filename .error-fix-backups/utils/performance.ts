import React, { useEffect, forwardRef } from 'react';
// / <reference types="vite / client" />
// Performance monitoring utilities for React components
export interface PerformanceMetric {
 name: string;,
 startTime: number;
 endTime?: number;
 duration?: number;
 metadata?: Record < string, any>;
}

export class PerformanceMonitor {
 private metrics: Map < string, PerformanceMetric> = new Map();
 private observers: PerformanceObserver[] = [];
 private isEnabled: boolean = import.meta.env.MODE === 'development';

 constructor() {
 if (this.isEnabled && typeof window !== 'undefined' && 'PerformanceObserver' in window) {
 this.setupObservers();
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
 list.getEntries().forEach((_entry) => {
 // Performance monitoring disabled
 // const navigation = _entry as PerformanceNavigationTiming;
 // (console).log('Navigation timing:', navigation);
 });
 });
 navigationObserver.observe({ entryTypes: ['navigation'] });
 this.observers.push(navigationObserver);
 } catch (e) {
 // PerformanceObserver not supported
 }
 startMeasure(name, metadata?: Record < string, any>): void {
 if (!this.isEnabled) {
return;
}

 const metric: PerformanceMetric = {
 name,
 startTime: performance.now(),
 metadata: metadata || {};

 this.metrics.set(name, metric);

 if (typeof window !== 'undefined' && window.performance && typeof window.performance.mark === 'function') {
 performance.mark(`${name}-start`);
 }
 hasMetric(name): boolean {
 return this.metrics.has(name);
 }

 endMeasure(name): number | null {
 if (!this.isEnabled) {
return null;
}

 const metric = this.metrics.get(name);
 if (!metric) {
 if (import.meta.env.MODE === 'development') {
 (console).warn(`Performance metric '${name}' not found`);
 }
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

 // Log slow operations with different thresholds for different operation types
 const getThreshold = (operationName): (number) => {
 if (operationName.startsWith('image - load')) {
return 2000;
} // 2s for images
 if (operationName.includes('search')) {
return 1500;
} // 1.5s for search
 return 100; // Default 100ms;
 };

 const threshold = getThreshold(name);
 if (duration > threshold) {
 (console).warn(`⚠️ Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, metric.metadata);
 }

 return duration;
 }

 getMetrics(): PerformanceMetric[] {
 return Array<any>.from(this.metrics.values()).filter((m) => m.duration !== undefined);
 }

 clearMetrics(): void {
 this.metrics.clear();
 if (typeof window !== 'undefined' && window.performance && typeof window.performance.clearMarks === 'function') {
 performance.clearMarks();
 performance.clearMeasures();
 }
 getAverageTime(name): number | null {
 const metrics = this.getMetrics().filter((m) => m.name === name);
 if (metrics.length === 0) {
return null;
}

 const total = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
 return total / metrics.length;
 }

 logSummary(): void {
 if (!this.isEnabled) {
return;
}

 const metrics = this.getMetrics();
 if (metrics.length === 0) {
 return;
 }

 (console).group('📊 Performance Summary');

 // Group by name and calculate averages
 const grouped = metrics.reduce((acc, metric) => {
 if (metric.name && !acc[metric.name]) {
 acc[metric.name] = [];
 }
 if (metric.name && metric.duration !== undefined && acc[metric.name]) {
 acc[metric.name]!.push(metric.duration);
 }
 return acc;
 }, {} as Record < string, number[]>);

 Object.entries(grouped).forEach(([_name, _durations]) => {
 // const _avg = durations.reduce((a, b) => a + b, 0) / durations.length;
 // const _min = Math.min(...durations);
 // const _max = Math.max(...durations);

 });

 (console).groupEnd();
 }

 disconnect(): void {
 this.observers.forEach((observer) => observer.disconnect());
 this.observers = [];
 }
// Global instance
export const performanceMonitor = new PerformanceMonitor();

// React Hook for component performance monitoring
export function usePerformanceMonitor(componentName: any): any {
 const startRender = () => {
 performanceMonitor.startMeasure(`${componentName}-render`);
 };

 const endRender = () => {
 const metricName: string = `${componentName}-render`;
 return performanceMonitor.hasMetric(metricName)
 ? performanceMonitor.endMeasure(metricName)
 : null;
 };

 const measureAsync = async <T>(operationName, operation: () => Promise<any> < T>): Promise<any> < T> => {
 const fullName: string = `${componentName}-${operationName}`;
 performanceMonitor.startMeasure(fullName);
 try {
 const result = await operation();
 if (performanceMonitor.hasMetric(fullName)) {
 performanceMonitor.endMeasure(fullName);
 }
 return result;
 } catch (error) {
 if (performanceMonitor.hasMetric(fullName)) {
 performanceMonitor.endMeasure(fullName);
 }
 throw error;
 };

 const measureSync = <T>(operationName, operation: () => T): (T) => {
 const fullName: string = `${componentName}-${operationName}`;
 performanceMonitor.startMeasure(fullName);
 try {
 const result = operation();
 if (performanceMonitor.hasMetric(fullName)) {
 performanceMonitor.endMeasure(fullName);
 }
 return result;
 } catch (error) {
 if (performanceMonitor.hasMetric(fullName)) {
 performanceMonitor.endMeasure(fullName);
 }
 throw error;
 };

 return {
 startRender,
 endRender,
 measureAsync,
 measureSync };
}

// Higher - order component for automatic performance monitoring
export function withPerformanceMonitoring < P extends object>(,;
 WrappedComponent: React.ComponentType < P>
 componentName?: string) {
 const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

 const MonitoredComponent = React.forwardRef < any, P>((props, ref) => {
 const { startRender, endRender } = usePerformanceMonitor(displayName);

 useEffect(() => {
 startRender();
 return () => {
 endRender();
 };
 });

 return React.createElement(WrappedComponent, { ...props as any, ref });
 });

 MonitoredComponent.displayName = `withPerformanceMonitoring(${displayName})`;

 return MonitoredComponent;
}

// Utility functions
export const measureRenderTime = (componentName: any) => {
 return (_target, propertyKey, descriptor: PropertyDescriptor) => {
 const originalMethod = descriptor.value;

 descriptor.value = function (...args) {
 const metricName: string = `${componentName}-${propertyKey}`;
 performanceMonitor.startMeasure(metricName);
 const result = originalMethod.apply(this, args);
 if (performanceMonitor.hasMetric(metricName)) {
 performanceMonitor.endMeasure(metricName);
 }
 return result;
 };

 return descriptor;
 };
};

// Bundle size analyzer
export const analyzeBundleSize = () => {
 if (typeof window === 'undefined') {
return;
}

 const scripts = Array<any>.from(document.querySelectorAll < HTMLScriptElement>('script.src'));
 const styles = Array<any>.from(document.querySelectorAll < HTMLLinkElement>('link[rel="stylesheet"]'));

 (console).group('📦 Bundle Analysis');
 // Estimate bundle sizes (this is approximate)
 scripts.forEach((script) => {
 if (script.src && !script.src.includes('chrome - extension')) {
 // Placeholder for size analysis if needed
 }
 });

 styles.forEach((style) => {
 if (style.href && !style.href.includes('chrome - extension')) {
 // Placeholder for size analysis if needed
 }
 });

 (console).groupEnd();
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
 if (typeof window === 'undefined' || !(window.performance)?.memory) {
 (console).warn('Memory monitoring not supported in this browser');
 return;
 }

 // const _memory = (window.performance).memory;

 };

// End of utilities