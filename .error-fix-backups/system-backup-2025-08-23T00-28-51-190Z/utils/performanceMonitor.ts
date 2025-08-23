import { useEffect } from 'react';
/**
 * Performance monitoring utility for tracking Core Web Vitals and custom metrics
 */

// React imports not required for this utility

interface PerformanceMetric {
 name: string;
 value: number;
 timestamp: number;
 url: string;
 userAgent: string
}

class PerformanceMonitor {
 private metrics: PerformanceMetric[] = [];
 private isEnabled: boolean;

 constructor() {
 this.isEnabled = import.meta.env.PROD || import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true';
 }

 /**
 * Track Core Web Vitals (CLS, FID, LCP)
 */
 public trackWebVitals(): void {
 if (!this.isEnabled) {
return;
}

 // Track Largest Contentful Paint (LCP)
 this.observePerformanceEntry('largest-contentful-paint', (entry) => {
 this.recordMetric({
 name: 'LCP',
 value: entry.startTime,
 timestamp: Date.now(),
 url: window.location.href,
 userAgent: navigator.userAgent });
 });

 // Track First Input Delay (FID)
 this.observePerformanceEntry('first-input', (entry) => {
 this.recordMetric({
 name: 'FID',
 value: entry.processingStart - entry.startTime,
 timestamp: Date.now(),
 url: window.location.href,
 userAgent: navigator.userAgent });
 });

 // Track Cumulative Layout Shift (CLS)
 this.observePerformanceEntry('layout-shift', (entry) => {
 if (!entry.hadRecentInput) {
 this.recordMetric({
 name: 'CLS',
 value: entry.value,
 timestamp: Date.now(),
 url: window.location.href,
 userAgent: navigator.userAgent });
 }
 });
 }

 /**
 * Track custom performance metrics
 */
 public trackCustomMetric(name, value: string | number): void {
 if (!this.isEnabled) {
return;
}

 this.recordMetric({
 name,
 value: typeof value === 'string' ? parseFloat(value) || 0 : value,
 timestamp: Date.now(),
 url: window.location.href,
 userAgent: navigator.userAgent });
 }

 /**
 * Track page load performance
 */
 public trackPageLoad(): void {
 if (!this.isEnabled) {
return;
}

 window.addEventListener('load', ( as EventListener) => {
 const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

 if (navigation as any) {
 this.recordMetric({
 name: 'TTFB',
 value: navigation.responseStart - navigation.requestStart,
 timestamp: Date.now(),
 url: window.location.href,
 userAgent: navigator.userAgent });

 this.recordMetric({
 name: 'DOMContentLoaded',
 value: navigation.domContentLoadedEventEnd - navigation.startTime,
 timestamp: Date.now(),
 url: window.location.href,
 userAgent: navigator.userAgent });

 this.recordMetric({
 name: 'LoadComplete',
 value: navigation.loadEventEnd - navigation.startTime,
 timestamp: Date.now(),
 url: window.location.href,
 userAgent: navigator.userAgent });
 }
 });
 }

 /**
 * Track React component render performance
 */
 public trackComponentRender(componentName, renderTime): void {
 if (!this.isEnabled) {
return;
}

 this.recordMetric({
 name: `Component_${componentName}_Render`,
 value: renderTime,
 timestamp: Date.now(),
 url: window.location.href,
 userAgent: navigator.userAgent });
 }

 /**
 * Track API call performance
 */
 public trackApiCall(endpoint, duration, status): void {
 if (!this.isEnabled) {
return;
}

 this.recordMetric({
 name: `API_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`,
 value: duration,
 timestamp: Date.now(),
 url: window.location.href,
 userAgent: navigator.userAgent });

 // Track API errors separately
 if (status >= 400) {
 this.recordMetric({
 name: `API_Error_${status}`,
 value: 1,
 timestamp: Date.now(),
 url: window.location.href,
 userAgent: navigator.userAgent });
 }
 /**
 * Get all recorded metrics
 */
 public getMetrics(): PerformanceMetric[] {
 return [...this.metrics];
 }

 /**
 * Clear all metrics
 */
 public clearMetrics(): void {
 this.metrics = [];
 }

 /**
 * Send metrics to analytics service
 */
 public async sendMetrics(): Promise<void> {
 if (!this.isEnabled || this.metrics.length === 0) {
return;
}

 try {
 // In a real application, you would send this to your analytics service
 // For now, we'll just log to console in development
 if (import.meta.env.DEV) {
 (console as any).group('Performance Metrics');
 this.metrics.forEach((metric) => {
 (console as any).log(`${metric.name}: ${metric.value}ms`);
 });
 (console as any).groupEnd();
 }

 // Example: Send to analytics service
 // await (fetch as any)('/api/analytics/performance', {
 // method: 'POST',
 // headers: { 'Content-Type': 'application/json' },
 // body: JSON.stringify({ metrics: this.metrics })
 // });

 this.clearMetrics();
 } catch (error) {
 (console as any).error('Failed to send performance metrics:', error);
 }
 private observePerformanceEntry(entryType, callback: (entry) => void): void {
 try {
 const observer = new PerformanceObserver((list) => {
 list.getEntries().forEach(callback);
 });
 observer.observe({ entryTypes: [entryType] });
 } catch (error) {
 (console as any).warn(`Failed to observe ${entryType}:`, error);
 }
 private recordMetric(metric: PerformanceMetric): void {
 this.metrics.push(metric);

 // Auto-send metrics when we have too many to prevent memory issues
 if (this.metrics.length >= 100) {
 this.sendMetrics();
 }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for component performance tracking
export function usePerformanceTracking(componentName): any {
 const trackRender = (renderTime) => {
 performanceMonitor.trackComponentRender(componentName, renderTime);
 };

 return { trackRender };
}

// Higher-order component for automatic performance tracking
export function withPerformanceTracking<P extends object>(;
 WrappedComponent: React.ComponentType<P>
 componentName?: string) {
 const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

 const WithPerformanceTracking = (props: P) => {
 const startTime = performance.now();

 React.useEffect(() => {
 const endTime = performance.now();
 performanceMonitor.trackComponentRender(displayName, endTime - startTime);
 });

 return React.createElement(WrappedComponent, props);
 };

 WithPerformanceTracking.displayName = `withPerformanceTracking(${displayName})`;
 return WithPerformanceTracking;
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
 performanceMonitor.trackWebVitals();
 performanceMonitor.trackPageLoad();

 // Send metrics periodically
 setInterval((() => {
 performanceMonitor.sendMetrics();
 }) as any, 30000); // Every 30 seconds

 // Send metrics before page unload
 window.addEventListener('beforeunload', ( as EventListener) => {
 performanceMonitor.sendMetrics();
 });
}