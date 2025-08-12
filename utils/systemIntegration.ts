/**
 * System Integration Hub
 * Centralizes and orchestrates all monitoring, automation, and quality systems
 * Provides unified configuration, event handling, and cross-system communication
 */

import { advancedAPM } from './advancedMonitoring';

import { deploymentAutomation } from './deploymentAutomation';

import { featureFlagManager } from './featureFlagSystem';

import { intelligentCodeMonitor } from './intelligentCodeMonitor';

import { performanceMonitor } from './performanceMonitor';

import { securityMonitoring } from './securityMonitoring';

// System integration types
interface SystemEvent {
  id: string;
  type: "performance" as const | 'security' | 'deployment' | 'quality' | 'feature' | 'workflow';
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  data;
  timestamp: number;
  handled: boolean
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  systems: {
    performance: 'healthy' | 'degraded' | 'critical';
    security: 'healthy' | 'degraded' | 'critical';
    deployment: 'healthy' | 'degraded' | 'critical';
    codeQuality: 'healthy' | 'degraded' | 'critical';
    featureFlags: 'healthy' | 'degraded' | 'critical';
    monitoring: 'healthy' | 'degraded' | 'critical'
  };
  lastCheck: number
}

interface IntegrationConfig {
  autoStart: boolean;
  healthCheckInterval: number;
  eventRetentionDays: number;
  alertThresholds: {
    performance: number;
    security: number;
    quality: number
  };
  notifications: {
    email: boolean;
    slack: boolean;
    webhook?: string;
  };
  emergencyContacts: string
}

interface SystemMetrics {
  performance: {
    score: number;
    responseTime: number;
    errorRate: number;
    throughput: number
  };
  security: {
    score: number;
    threats: number;
    vulnerabilities: number;
    compliance: number
  };
  deployment: {
    successRate: number;
    frequency: number;
    leadTime: number;
    mttr: number; // Mean Time To Recovery
  };
  quality: {
    score: number;
    coverage: number;
    complexity: number;
    debt: number
  };
  features: {
    totalFlags: number;
    activeExperiments: number;
    conversionRate: number
  };
}

class SystemIntegrationHub {
  private events: SystemEvent[] = [];
  private health: SystemHealth;
  private config: IntegrationConfig;
  private metrics: SystemMetrics;
  private eventHandlers: Map<string, Array<(data: any) => void>> = new Map();
  private healthCheckInterval?: ReturnType<typeof setTimeout>;
  private isInitialized = false;

  constructor() {
    this.config = {
      autoStart: true,
      healthCheckInterval: 60000, // 1 minute,
  eventRetentionDays: 30,
      alertThresholds: {
        performance: 70,
        security: 80,
        quality: 75 },
      notifications: {
        email: false,
        slack: false },
      emergencyContacts: '' };

    this.health = {
      overall: 'healthy',
      systems: {
        performance: 'healthy',
        security: 'healthy',
        deployment: 'healthy',
        codeQuality: 'healthy',
        featureFlags: 'healthy',
        monitoring: 'healthy' },
      lastCheck: Date.now() };

    this.metrics = {
      performance: { score: 0, responseTime: 0, errorRate: 0, throughput: 0 },
      security: { score: 0, threats: 0, vulnerabilities: 0, compliance: 0 },
      deployment: { successRate: 0, frequency: 0, leadTime: 0, mttr: 0 },
      quality: { score: 0, coverage: 0, complexity: 0, debt: 0 },
      features: { totalFlags: 0, activeExperiments: 0, conversionRate: 0 } };
  }

  // Initialize the integration hub
  async initialize(): Promise<void> {
    if (this.isInitialized) {
return;
}

    try {
      (console as any).log('🚀 Initializing System Integration Hub...');

      // Setup event listeners for all systems
      this.setupEventListeners();

      // Start health monitoring
      this.startHealthMonitoring();

      // Setup cross-system integrations
      this.setupCrossSystemIntegrations();

      // Initial health check
      await this.performHealthCheck();

      // Initial metrics collection
      await this.collectMetrics();

      this.isInitialized = true;
      (console as any).log('✅ System Integration Hub initialized successfully');

      // Emit initialization event
      this.emitEvent({
        type: "workflow" as const,
        source: 'SystemIntegrationHub',
        severity: 'low',
        title: 'System Integration Hub Initialized',
        description: 'All systems are now integrated and monitoring is active',
        data: { timestamp: Date.now() } });

    } catch (error: any) {
      (console as any).error('❌ Failed to initialize System Integration Hub:', error);
      throw error;
    }
  }

  // Setup event listeners for all monitoring systems
  private setupEventListeners(): void {
    // Performance monitoring events
    this.addEventListener('performance-alert', (data: any) => {
      this.handlePerformanceAlert(data);
    });

    // Security monitoring events
    this.addEventListener('security-threat', (data: any) => {
      this.handleSecurityThreat(data);
    });

    // Deployment events
    this.addEventListener('deployment-failed', (data: any) => {
      this.handleDeploymentFailure(data);
    });

    // Code quality events
    this.addEventListener('quality-degraded', (data: any) => {
      this.handleQualityDegradation(data);
    });

    // Feature flag events
    this.addEventListener('feature-rollback', (data: any) => {
      this.handleFeatureRollback(data);
    });
  }

  // Setup cross-system integrations
  private setupCrossSystemIntegrations(): void {
    // When security threat is detected, pause deployments
    this.addEventListener('security-threat', async (data: any): Promise<any> => {
      if (data.severity === 'critical') {
        (console as any).log('🛑 Critical security threat detected, pausing deployments');
        // deploymentAutomation.pauseAllDeployments();
      }
    });

    // When deployment fails, trigger code analysis
    this.addEventListener('deployment-failed', async (_data: any): Promise<any> => {
      (console as any).log('🔍 Deployment failed, triggering code analysis');
      // codeAnalysisEngine.analyzeFailure(data);
    });

    // When performance degrades, check feature flags
    this.addEventListener('performance-alert', async (data: any): Promise<any> => {
      if (data.metric === 'response-time' && data.value > 2000) {
        (console as any).log('⚡ High response time detected, checking feature flags');
        // featureFlagManager.checkPerformanceImpact();
      }
    });

    // When code quality drops, suggest feature flag rollback
    this.addEventListener('quality-degraded', async (data: any): Promise<any> => {
      if (data.score < this.config.alertThresholds.quality) {
        (console as any).log('📉 Code quality degraded, reviewing recent feature releases');
        // featureFlagManager.reviewRecentReleases();
      }
    });
  }

  // Start health monitoring
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval((async (): Promise<void> => {
      await this.performHealthCheck();
      await this.collectMetrics();
    }) as any, this.config.healthCheckInterval);
  }

  // Perform comprehensive health check
  private async performHealthCheck(): Promise<void> {
    try {
      const healthChecks = {
        performance: await this.checkPerformanceHealth(),
        security: await this.checkSecurityHealth(),
        deployment: await this.checkDeploymentHealth(),
        codeQuality: await this.checkCodeQualityHealth(),
        featureFlags: await this.checkFeatureFlagsHealth(),
        monitoring: await this.checkMonitoringHealth() };

      this.health.systems = healthChecks;
      this.health.lastCheck = Date.now();

      // Determine overall health
      const criticalSystems = Object.values(healthChecks).filter((status) => status === 'critical').length;
      const degradedSystems = Object.values(healthChecks).filter((status) => status === 'degraded').length;

      if (criticalSystems > 0) {
        this.health.overall = 'critical';
      } else if (degradedSystems > 1) {
        this.health.overall = 'degraded';
      } else {
        this.health.overall = 'healthy';
      }

      // Emit health status event
      this.emitEvent({
        type: "workflow" as const,
        source: 'HealthMonitor',
        severity: this.health.overall === 'critical' ? 'critical' :
                 this.health.overall === 'degraded' ? 'medium' : 'low',
        title: 'System Health Check',
        description: `Overall system health: ${this.health.overall}`,
        data: this.health });

    } catch (error: any) {
      (console as any).error('Health check failed:', error);
      this.health.overall = 'critical';
    }
  }

  // Individual system health checks
  private async checkPerformanceHealth(): Promise<'healthy' | 'degraded' | 'critical'> {
    try {
      const metrics = performanceMonitor.getMetrics();
      const performanceScore = metrics.find(m => m.name === 'performance-score')?.value || 0;

      if (performanceScore < 60) {
return 'critical';
}
      if (performanceScore < this.config.alertThresholds.performance) {
return 'degraded';
}
      return 'healthy';
    } catch {
      return 'critical';
    }
  }

  private async checkSecurityHealth(): Promise<'healthy' | 'degraded' | 'critical'> {
    try {
      const metrics = securityMonitoring.getSecurityMetrics();

      if (metrics.threatsDetected > 5) {
return 'critical';
}
      if (metrics.securityScore < this.config.alertThresholds.security) {
return 'degraded';
}
      return 'healthy';
    } catch {
      return 'critical';
    }
  }

  private async checkDeploymentHealth(): Promise<'healthy' | 'degraded' | 'critical'> {
    try {
      const metrics = deploymentAutomation.getDeploymentMetrics();

      if (metrics.successRate < 0.8) {
return 'critical';
}
      if (metrics.successRate < 0.95) {
return 'degraded';
}
      return 'healthy';
    } catch {
      return 'critical';
    }
  }

  private async checkCodeQualityHealth(): Promise<'healthy' | 'degraded' | 'critical'> {
    try {
      const metrics = intelligentCodeMonitor.getLatestMetrics();

      if (!metrics) {
        return 'critical';
      }

      // Calculate quality score from available metrics
      const qualityScore = Math.max(0, 100 -
        (metrics.complexity * 0.2) -
        (metrics.technicalDebt * 0.3) -
        (metrics.duplicateCode * 0.2) -
        (metrics.securityVulnerabilities * 0.3));

      if (qualityScore < 60) {
        return 'critical';
      }
      if (qualityScore < this.config.alertThresholds.quality) {
        return 'degraded';
      }
      return 'healthy';
    } catch {
      return 'critical';
    }
  }

  private async checkFeatureFlagsHealth(): Promise<'healthy' | 'degraded' | 'critical'> {
    try {
      // Get basic flag metrics from available methods
      const allFlags = featureFlagManager.getAllFlags();

      // Check for any emergency rollbacks in the last hour
      const recentRollbacks = allFlags
        .filter((flag) => flag.enabled &&
                Date.now() - flag.metadata.createdAt < 3600000).length;

      if (recentRollbacks > 2) {
return 'critical';
}
      if (recentRollbacks > 0) {
return 'degraded';
}
      return 'healthy';
    } catch {
      return 'critical';
    }
  }

  private async checkMonitoringHealth(): Promise<'healthy' | 'degraded' | 'critical'> {
    try {
      // Check if all monitoring systems are responsive
      const checks = [
        advancedAPM.getMetrics('system').length > 0,
        performanceMonitor.getMetrics().length > 0,
        securityMonitoring.getSecurityMetrics() !== null];

      const failedChecks = checks.filter((check) => !check).length;

      if (failedChecks > 1) {
return 'critical';
}
      if (failedChecks > 0) {
return 'degraded';
}
      return 'healthy';
    } catch {
      return 'critical';
    }
  }

  // Collect metrics from all systems
  private async collectMetrics(): Promise<void> {
    try {
      // Performance metrics
      const perfMetrics = performanceMonitor.getMetrics();
      this.metrics.performance = {
        score: perfMetrics.find(m => m.name === 'performance-score')?.value || 0,
        responseTime: perfMetrics.find(m => m.name === 'response-time')?.value || 0,
        errorRate: perfMetrics.find(m => m.name === 'error-rate')?.value || 0,
        throughput: perfMetrics.find(m => m.name === 'throughput')?.value || 0 };

      // Security metrics
      const secMetrics = securityMonitoring.getSecurityMetrics();
      this.metrics.security = {
        score: secMetrics.securityScore,
        threats: secMetrics.threatsDetected,
        vulnerabilities: secMetrics.vulnerabilities.total,
        compliance: secMetrics.complianceScore };

      // Deployment metrics
      const depMetrics = deploymentAutomation.getDeploymentMetrics();
      this.metrics.deployment = {
        successRate: depMetrics.successRate,
        frequency: depMetrics.deploymentFrequency,
        leadTime: depMetrics.averageDeployTime,
        mttr: depMetrics.recoveryTime || 0 };

      // Code quality metrics
      const qualityMetrics = intelligentCodeMonitor.getLatestMetrics();
      if (qualityMetrics as any) {
        // Calculate quality score from available metrics
        const qualityScore = Math.max(0, 100 -
          (qualityMetrics.complexity * 0.2) -
          (qualityMetrics.technicalDebt * 0.3) -
          (qualityMetrics.duplicateCode * 0.2) -
          (qualityMetrics.securityVulnerabilities * 0.3));

        this.metrics.quality = {
          score: qualityScore,
          coverage: qualityMetrics.testCoverage,
          complexity: qualityMetrics.complexity,
          debt: qualityMetrics.technicalDebt };
      }

      // Feature flag metrics
      const allFlags = featureFlagManager.getAllFlags();
      const activeFlags = allFlags.filter((flag) => flag.enabled);
      this.metrics.features = {
        totalFlags: allFlags.length,
        activeExperiments: activeFlags.length,
        conversionRate: 0, // Default value since we don't have conversion tracking
      };

    } catch (error: any) {
      (console as any).error('Failed to collect metrics:', error);
    }
  }

  // Event handling methods
  private handlePerformanceAlert(data: any): void {
    this.emitEvent({
      type: "performance" as const,
      source: 'PerformanceMonitor',
      severity: data.severity || 'medium',
      title: 'Performance Alert',
      description: data.message || 'Performance threshold exceeded',
      data });
  }

  private handleSecurityThreat(data: any): void {
    this.emitEvent({
      type: "security" as const,
      source: 'SecurityMonitor',
      severity: 'high',
      title: 'Security Threat Detected',
      description: data.description || 'Security threat detected',
      data });
  }

  private handleDeploymentFailure(data: any): void {
    this.emitEvent({
      type: "deployment" as const,
      source: 'DeploymentAutomation',
      severity: 'high',
      title: 'Deployment Failed',
      description: data.error || 'Deployment pipeline failed',
      data });
  }

  private handleQualityDegradation(data: any): void {
    this.emitEvent({
      type: "quality" as const,
      source: 'CodeQualityMonitor',
      severity: 'medium',
      title: 'Code Quality Degraded',
      description: data.message || 'Code quality metrics have degraded',
      data });
  }

  private handleFeatureRollback(data: any): void {
    this.emitEvent({
      type: "feature" as const,
      source: 'FeatureFlagManager',
      severity: 'medium',
      title: 'Feature Flag Rollback',
      description: data.reason || 'Feature flag was rolled back',
      data });
  }

  // Event system
  private emitEvent(eventData: Omit<SystemEvent, 'id' | 'timestamp' | 'handled'>): void {
    const event: SystemEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      handled: false,
      ...eventData };

    this.events.push(event);
    this.cleanupOldEvents();

    // Trigger event handlers
    const handlers = this.eventHandlers.get(event.type) || [];
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error: any) {
        (console as any).error(`Event handler failed for ${event.type}:`, error);
      }
    });

    // Log critical events
    if (event.severity === 'critical') {
      (console as any).error(`🚨 CRITICAL EVENT: ${event.title} - ${event.description}`);
    }
  }

  private addEventListener(eventType: any, handler: (data: any) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  private cleanupOldEvents(): void {
    const cutoffTime = Date.now() - (this.config.eventRetentionDays * 24 * 60 * 60 * 1000);
    this.events = this.events.filter((event: SystemEvent) => event.timestamp > cutoffTime)
  }

  // Public API methods
  getSystemHealth(): SystemHealth {
    return { ...this.health };
  }

  getSystemMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  getRecentEvents(limit: number = 50): SystemEvent[] {
    return this.events
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getEventsByType(type: SystemEvent['type'], limit: number = 20): SystemEvent[] {
    return this.events
      .filter((event: SystemEvent) => event.type === type)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getCriticalEvents(): SystemEvent[] {
    return this.events
      .filter((event: SystemEvent) => event.severity === 'critical')
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  acknowledgeEvent(eventId: any): void {
    const event = this.events.find((e: SystemEvent) => e.id === eventId);
    if (event as any) {
      event.handled = true;
    }
  }

  updateConfig(newConfig: Partial<IntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Restart health monitoring if interval changed
    if (newConfig.healthCheckInterval && this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.startHealthMonitoring();
    }
  }

  getConfig(): IntegrationConfig {
    return { ...this.config };
  }

  // Generate comprehensive system report
  generateSystemReport(): {
    health: SystemHealth;
    metrics: SystemMetrics;
    recentEvents: SystemEvent[];
    summary: string;
    recommendations: string[]
  } {
    const recentEvents = this.getRecentEvents(10);
    const criticalEvents = this.getCriticalEvents();

    let summary = `System Status: ${this.health.overall.toUpperCase()}\n`;
    summary += `Last Health Check: ${new Date(this.health.lastCheck).toLocaleString()}\n`;
    summary += `Critical Events (24h): ${criticalEvents.filter((e) => Date.now() - e.timestamp < 86400000).length}\n`;
    summary += `Overall Performance Score: ${Math.round(this.metrics.performance.score)}\n`;
    summary += `Security Score: ${Math.round(this.metrics.security.score)}\n`;
    summary += `Deployment Success Rate: ${Math.round(this.metrics.deployment.successRate * 100)}%`;

    const recommendations: string[] = [];

    if (this.metrics.performance.score < 70) {
      recommendations.push('Performance optimization needed - consider code splitting and caching improvements');
    }

    if (this.metrics.security.threats > 0) {
      recommendations.push('Active security threats detected - immediate review required');
    }

    if (this.metrics.deployment.successRate < 0.9) {
      recommendations.push('Deployment reliability issues - review CI/CD pipeline and testing coverage');
    }

    if (this.metrics.quality.score < 75) {
      recommendations.push('Code quality below threshold - consider refactoring and technical debt reduction');
    }

    return {
      health: this.health,
      metrics: this.metrics,
      recentEvents,
      summary,
      recommendations };
  }

  // Cleanup method
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.eventHandlers.clear();
    this.events = [];
    this.isInitialized = false;
  }
}

// Create and export singleton instance
export const systemIntegration = new SystemIntegrationHub();

// Auto-initialize in development mode
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  systemIntegration.initialize().catch(console.error);
}

export default systemIntegration;
export type { SystemEvent, SystemHealth, SystemMetrics, IntegrationConfig };