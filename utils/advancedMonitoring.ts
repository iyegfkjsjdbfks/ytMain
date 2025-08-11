
/**
 * Advanced Monitoring and Observability System
 * Provides comprehensive application health monitoring, performance insights,
 * and automated quality gates for enhanced code quality and maintainability.
 */

// Types for monitoring data
interface MetricData {
  timestamp: number;
  value: number;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
}

interface AlertRule {
  id: string;
  name: string;
  condition: (value, threshold) => boolean;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cooldown: number; // minutes
  actions: AlertAction;
}

interface AlertAction {
  type: 'email' | 'webhook' | 'console' | 'storage';
  _config: Record<string, any>;
}

interface HealthCheck {
  name: string;
  check: () => Promise<{ healthy: boolean; details?: any }>;
  interval: number; // seconds
  timeout: number; // seconds
  retries: number;
}

interface QualityGate {
  name: string;
  rules: QualityRule;
  blocking: boolean;
}

interface QualityRule {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  message: string;
}

/**
 * Advanced Application Performance Monitoring (APM)
 */
class APMSystem {
  private metrics: Map<string, MetricData[]> = new Map();
  private alerts: Map<string, AlertRule> = new Map();
  private lastAlertTime: Map<string, number> = new Map();
  private healthChecks: Map<string, HealthCheck> = new Map();
  private qualityGates: Map<string, QualityGate> = new Map();
  private isMonitoring = false;

  constructor() {
    this.setupDefaultAlerts();
    this.setupDefaultHealthChecks();
    this.setupDefaultQualityGates();
  }

  /**
   * Start the monitoring system
   */
  start(): void {
    if (this.isMonitoring) {
return undefined;
}

    this.isMonitoring = true;
    this.startMetricsCollection();
    this.startHealthChecks();
    this.startAlertProcessing();

    console.log('🔍 Advanced monitoring system started');
  }

  /**
   * Stop the monitoring system
   */
  stop(): void {
    this.isMonitoring = false;
    console.log('🛑 Advanced monitoring system stopped');
  }

  /**
   * Record a custom metric
   */
  recordMetric(name, value, tags?: Record<string, string>): void {
    const metric: MetricData = {
      timestamp: Date.now(),
      value,
      tags: tags || {},
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.getSessionId(),
      },
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // Keep only last 1000 metrics per type
    if (metrics.length > 1000) {
      metrics.splice(0, metrics.length - 1000);
    }

    // Check alerts for this metric
    this.checkAlerts(name, value);
  }

  /**
   * Get metrics for a specific name
   */
  getMetrics(name, timeRange?: { start: number; end: number }): MetricData[] {
    const metrics = this.metrics.get(name) || [];

    if (!timeRange) {
return metrics;
}

    return metrics.filter(m =>
      m.timestamp >= timeRange.start && m.timestamp <= timeRange.end,
    );
  }

  /**
   * Get aggregated metrics
   */
  getAggregatedMetrics(name, timeRange?: { start: number; end: number }): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  } {
    const metrics = this.getMetrics(name, timeRange);
    const values = metrics.map(m => m.value).sort((a, b) => a - b);

    if (values.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, p95: 0, p99: 0 };
    }

    const sum = values.reduce((a, b) => a + b, 0);
    const p95Index = Math.floor(values.length * 0.95);
    const p99Index = Math.floor(values.length * 0.99);

    return {
      count: values.length,
      avg: sum / values.length,
      min: values[0] || 0,
      max: values[values.length - 1] || 0,
      p95: values[p95Index] || 0,
      p99: values[p99Index] || 0,
    };
  }

  /**
   * Add custom alert rule
   */
  addAlert(rule: AlertRule): void {
    this.alerts.set(rule.id, rule);
  }

  /**
   * Add health check
   */
  addHealthCheck(check: HealthCheck): void {
    this.healthChecks.set(check.name, check);
  }

  /**
   * Add quality gate
   */
  addQualityGate(gate: QualityGate): void {
    this.qualityGates.set(gate.name, gate);
  }

  /**
   * Run quality gates
   */
  async runQualityGates(gateName?: string): Promise<{
    passed: boolean;
    results: Array<{ gate: string; rule: string; passed: boolean; message: string; value?: number }>;
  }> {
    const results: Array<{ gate: string; rule: string; passed: boolean; message: string; value?: number }> = [];
    let allPassed = true;

    const gatesToRun = gateName
      ? [this.qualityGates.get(gateName)].filter(Boolean) as QualityGate[]
      : Array.from(this.qualityGates.values());

    for (const gate of gatesToRun) {
      for (const rule of gate.rules) {
        const metrics = this.getMetrics(rule.metric);
        if (metrics.length === 0) {
continue;
}

        const latestValue = metrics[metrics.length - 1]?.value || 0;
        const passed = this.evaluateRule(latestValue, rule);

        results.push({
          gate: gate.name,
          rule: rule.metric,
          passed,
          message: rule.message,
          value: latestValue,
        });

        if (!passed && gate.blocking) {
          allPassed = false;
        }
      }
    }

    return { passed: allPassed, results };
  }

  /**
   * Get system health status
   */
  async getHealthStatus(): Promise<{
    healthy: boolean;
    checks: Array<{ name: string; healthy: boolean; details?: any; error?: string }>;
  }> {
    const checks: Array<{ name: string; healthy: boolean; details?: any; error?: string }> = [];
    let overallHealthy = true;

    for (const [name, healthCheck] of this.healthChecks) {
      try {
        const result = await Promise.race([
          healthCheck.check(),
          new Promise<{ healthy: boolean }>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), healthCheck.timeout * 1000),
          ),
        ]);

        checks.push({
          name,
          healthy: result.healthy,
          details: (result as any)?.details,
        });

        if (!result.healthy) {
          overallHealthy = false;
        }
      } catch (error) {
        checks.push({
          name,
          healthy: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        overallHealthy = false;
      }
    }

    return { healthy: overallHealthy, checks };
  }

  /**
   * Export monitoring data
   */
  exportData(): {
    metrics: Record<string, MetricData[]>;
    alerts: AlertRule;
    timestamp: number;
  } {
    return {
      metrics: Object.fromEntries(this.metrics),
      alerts: Array.from(this.alerts.values()),
      timestamp: Date.now(),
    };
  }

  private setupDefaultAlerts(): void {
    // Performance alerts
    this.addAlert({
      id: 'high-memory-usage',
      name: 'High Memory Usage',
      condition: (value, threshold) => value > threshold,
      threshold: 100 * 1024 * 1024, // 100MB
      severity: 'high',
      cooldown: 5,
      actions: [{ type: 'console', _config: {} }],
    });

    this.addAlert({
      id: 'slow-page-load',
      name: 'Slow Page Load',
      condition: (value, threshold) => value > threshold,
      threshold: 3000, // 3 seconds
      severity: 'medium',
      cooldown: 2,
      actions: [{ type: 'console', _config: {} }],
    });

    this.addAlert({
      id: 'high-error-rate',
      name: 'High Error Rate',
      condition: (value, threshold) => value > threshold,
      threshold: 0.05, // 5%
      severity: 'critical',
      cooldown: 1,
      actions: [{ type: 'console', _config: {} }],
    });
  }

  private setupDefaultHealthChecks(): void {
    // API health check
    this.addHealthCheck({
      name: 'api-connectivity',
      check: async () => {
        try {
          const response = await fetch('/api/health', {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
          });
          return {
            healthy: response.ok,
            details: { status: response.status, statusText: response.statusText },
          };
        } catch {
          return { healthy: false, details: { _error: 'API unreachable' } };
        }
      },
      interval: 30,
      timeout: 10,
      retries: 3,
    });

    // Local storage health check
    this.addHealthCheck({
      name: 'local-storage',
      check: async () => {
        try {
          const testKey = '__health_check__';
          localStorage.setItem(testKey, 'test');
          const value = localStorage.getItem(testKey);
          localStorage.removeItem(testKey);
          return { healthy: value === 'test' };
        } catch {
          return { healthy: false };
        }
      },
      interval: 60,
      timeout: 5,
      retries: 1,
    });

    // Memory health check
    this.addHealthCheck({
      name: 'memory-usage',
      check: async () => {
        const memInfo = (((performance as any))).memory;
        if (!memInfo) {
return { healthy: true };
}

        const usageRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
        return {
          healthy: usageRatio < 0.9,
          details: {
            used: memInfo.usedJSHeapSize,
            total: memInfo.totalJSHeapSize,
            limit: memInfo.jsHeapSizeLimit,
            usageRatio,
          },
        };
      },
      interval: 30,
      timeout: 5,
      retries: 1,
    });
  }

  private setupDefaultQualityGates(): void {
    // Performance quality gate
    this.addQualityGate({
      name: 'performance',
      blocking: true,
      rules: [
        {
          metric: 'page-load-time',
          operator: 'lt',
          threshold: 3000,
          message: 'Page load time must be under 3 seconds',
        },
        {
          metric: 'first-contentful-paint',
          operator: 'lt',
          threshold: 1500,
          message: 'First Contentful Paint must be under 1.5 seconds',
        },
        {
          metric: 'cumulative-layout-shift',
          operator: 'lt',
          threshold: 0.1,
          message: 'Cumulative Layout Shift must be under 0.1',
        },
      ],
    });

    // Error rate quality gate
    this.addQualityGate({
      name: 'reliability',
      blocking: true,
      rules: [
        {
          metric: 'error-rate',
          operator: 'lt',
          threshold: 0.01,
          message: 'Error rate must be under 1%',
        },
        {
          metric: 'api-error-rate',
          operator: 'lt',
          threshold: 0.05,
          message: 'API error rate must be under 5%',
        },
      ],
    });
  }

  private startMetricsCollection(): void {
    // Collect Core Web Vitals
    setInterval(() => {
      if (!this.isMonitoring) {
return undefined;
}

      // Memory usage
      const memInfo = (((performance as any))).memory;
      if (memInfo) {
        this.recordMetric('memory-usage', memInfo.usedJSHeapSize);
      }

      // Connection info
      const { connection } = (((navigator as any)));
      if (connection) {
        this.recordMetric('network-downlink', connection.downlink);
        this.recordMetric('network-rtt', connection.rtt);
      }

      // Performance entries
      const entries = performance.getEntriesByType('navigation');
      if (entries.length > 0) {
        const nav = entries[0] as PerformanceNavigationTiming;
        this.recordMetric('page-load-time', nav.loadEventEnd - nav.fetchStart);
        this.recordMetric('dom-content-loaded', nav.domContentLoadedEventEnd - nav.fetchStart);
      }
    }, 5000);
  }

  private startHealthChecks(): void {
    for (const [name, check] of this.healthChecks) {
      const runCheck = async () => {
        if (!this.isMonitoring) {
return undefined;
}

        try {
          const result = await check.check();
          this.recordMetric(`health-${name}`, result.healthy ? 1 : 0);
        } catch (error) {
          this.recordMetric(`health-${name}`, 0);
          console.warn(`Health check ${name} failed:`, error);
        }
      };

      // Run immediately
      runCheck();

      // Schedule recurring checks
      setInterval(runCheck, check.interval * 1000);
    }
  }

  private startAlertProcessing(): void {
    setInterval(() => {
      if (!this.isMonitoring) {
return undefined;
}

      // Process any pending alerts
      this.processAlerts();
    }, 10000); // Check every 10 seconds
  }

  private checkAlerts(metricName, value): void {
    for (const [alertId, alert] of this.alerts) {
      const alertPrefix = alertId?.split('-')[0];
      if ((alertPrefix && metricName.includes(alertPrefix)) || alertId === metricName) {
        if (alert.condition(value, alert.threshold)) {
          this.triggerAlert(alert, value);
        }
      }
    }
  }

  private triggerAlert(alert: AlertRule, value): void {
    const now = Date.now();
    const lastAlert = this.lastAlertTime.get(alert.id) || 0;
    const cooldownMs = alert.cooldown * 60 * 1000;

    if (now - lastAlert < cooldownMs) {
return undefined;
}

    this.lastAlertTime.set(alert.id, now);

    for (const action of alert.actions) {
      this.executeAlertAction(action, alert, value);
    }
  }

  private executeAlertAction(action: AlertAction, alert: AlertRule, value): void {
    switch (action.type) {
      case 'console':
        console.warn(`🚨 Alert: ${alert.name} - Value: ${value}, Threshold: ${alert.threshold}`);
        break;
      case 'storage':
        const alertData = {
          id: alert.id,
          name: alert.name,
          value,
          threshold: alert.threshold,
          severity: alert.severity,
          timestamp: Date.now(),
        };
        localStorage.setItem(`alert_${alert.id}_${Date.now()}`, JSON.stringify(alertData));
        break;
      // Add more action types as needed
    }
  }

  private processAlerts(): void {
    // Clean up old alert timestamps
    const now = Date.now();
    for (const [alertId, timestamp] of this.lastAlertTime) {
      if (now - timestamp > 24 * 60 * 60 * 1000) { // 24 hours
        this.lastAlertTime.delete(alertId);
      }
    }
  }

  private evaluateRule(value, rule: QualityRule): boolean {
    switch (rule.operator) {
      case 'gt': return value > rule.threshold;
      case 'lt': return value < rule.threshold;
      case 'eq': return value === rule.threshold;
      case 'gte': return value >= rule.threshold;
      case 'lte': return value <= rule.threshold;
      default: return false;
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('monitoring_session_id');
    if (!sessionId) {
      sessionId = this.generateSecureToken(16);
      sessionStorage.setItem('monitoring_session_id', sessionId);
    }
    return sessionId;
  }

  private generateSecureToken(length): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

/**
 * Real User Monitoring (RUM) System
 */
class RUMSystem {
  private apm: APMSystem;
  private isTracking = false;

  constructor(apm: APMSystem) {
    this.apm = apm;
  }

  start(): void {
    if (this.isTracking) {
return undefined;
}

    this.isTracking = true;
    this.trackUserInteractions();
    this.trackPageViews();
    this.trackErrors();
    this.trackPerformance();

    console.log('👥 Real User Monitoring started');
  }

  stop(): void {
    this.isTracking = false;
    console.log('👥 Real User Monitoring stopped');
  }

  private trackUserInteractions(): void {
    const events = ['click', 'scroll', 'keydown', 'touchstart'];

    events.forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        if (!this.isTracking) {
return undefined;
}

        this.apm.recordMetric(`user-interaction-${eventType}`, 1, {
          target: (event.target as Element)?.tagName?.toLowerCase() || 'unknown',
          timestamp: Date.now().toString(),
        });
      }, { passive: true });
    });
  }

  private trackPageViews(): void {
    // Track initial page load
    this.apm.recordMetric('page-view', 1, {
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    });

    // Track SPA navigation
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = (data, unused, url?: string | URL | null) => {
      originalPushState.call(history, data, unused, url);
      if (this.isTracking) {
        this.apm.recordMetric('page-view', 1, {
          url: window.location.href,
          type: 'spa-navigation',
        });
      }
    };

    history.replaceState = (data, unused, url?: string | URL | null) => {
      originalReplaceState.call(history, data, unused, url);
      if (this.isTracking) {
        this.apm.recordMetric('page-view', 1, {
          url: window.location.href,
          type: 'spa-replace',
        });
      }
    };
  }

  private trackErrors(): void {
    window.addEventListener('error', (event) => {
      if (!this.isTracking) {
return undefined;
}

      this.apm.recordMetric('javascript-error', 1, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno?.toString(),
        colno: event.colno?.toString(),
        stack: event.error?.stack,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      if (!this.isTracking) {
return undefined;
}

      this.apm.recordMetric('promise-rejection', 1, {
        reason: event.reason?.toString() || 'Unknown rejection',
      });
    });
  }

  private trackPerformance(): void {
    // Track Core Web Vitals
    if ('web-vital' in window) {
      // This would integrate with web-vitals library
      // For now, we'll use Performance Observer
    }

    // Track resource loading
    const observer = new PerformanceObserver((list) => {
      if (!this.isTracking) {
return undefined;
}

      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          this.apm.recordMetric('resource-load-time', resource.duration, {
            name: resource.name,
            type: resource.initiatorType,
          });
        }
      }
    });

    observer.observe({ entryTypes: ['resource', 'navigation', 'paint'] });
  }
}

/**
 * Code Quality Metrics Collector
 */
class CodeQualityMetrics {
  private apm: APMSystem;
  private bundleAnalyzer: BundleAnalyzer;

  constructor(apm: APMSystem) {
    this.apm = apm;
    this.bundleAnalyzer = new BundleAnalyzer();
  }

  async collectMetrics(): Promise<{
    bundle;
    performance;
    accessibility;
    security;
  }> {
    const [bundle, performance, accessibility, security] = await Promise.all([
      this.bundleAnalyzer.analyze(),
      this.collectPerformanceMetrics(),
      this.collectAccessibilityMetrics(),
      this.collectSecurityMetrics(),
    ]);

    return { bundle, performance, accessibility, security };
  }

  private async collectPerformanceMetrics(): Promise<any> {
    const timeRange = { start: Date.now() - 60000, end: Date.now() };

    return {
      pageLoadTime: this.apm.getAggregatedMetrics('page-load-time', timeRange),
      memoryUsage: this.apm.getAggregatedMetrics('memory-usage', timeRange),
      errorRate: this.calculateErrorRate(timeRange),
    };
  }

  private async collectAccessibilityMetrics(): Promise<any> {
    // This would integrate with accessibility testing tools
    return {
      violations: 0, // Placeholder
      score: 100,    // Placeholder
    };
  }

  private async collectSecurityMetrics(): Promise<any> {
    // This would integrate with security scanning tools
    return {
      vulnerabilities: 0, // Placeholder
      score: 100,         // Placeholder
    };
  }

  private calculateErrorRate(timeRange: { start: number; end: number }): number {
    const errors = this.apm.getMetrics('javascript-error', timeRange).length +
                  this.apm.getMetrics('promise-rejection', timeRange).length;
    const pageViews = this.apm.getMetrics('page-view', timeRange).length;

    return pageViews > 0 ? errors / pageViews : 0;
  }
}

/**
 * Bundle Analyzer
 */
class BundleAnalyzer {
  async analyze(): Promise<{
    totalSize: number;
    gzippedSize: number;
    chunks: Array<{ name: string; size: number }>;
    duplicates: string;
  }> {
    // This would integrate with webpack-bundle-analyzer or similar
    // For now, return mock data
    return {
      totalSize: 500000, // 500KB
      gzippedSize: 150000, // 150KB
      chunks: [
        { name: 'main', size: 300000 },
        { name: 'vendor', size: 200000 },
      ],
      duplicates: [],
    };
  }
}

// Create singleton instances
export const advancedAPM = new APMSystem();
export const rumSystem = new RUMSystem(advancedAPM);
export const codeQualityMetrics = new CodeQualityMetrics(advancedAPM);

// Auto-start in development
if (process.env.NODE_ENV === 'development') {
  advancedAPM.start();
  rumSystem.start();
}

// Export types
export type {
  MetricData,
  AlertRule,
  AlertAction,
  HealthCheck,
  QualityGate,
  QualityRule,
};

// Export classes for custom implementations
export {
  APMSystem,
  RUMSystem,
  CodeQualityMetrics,
  BundleAnalyzer,
};