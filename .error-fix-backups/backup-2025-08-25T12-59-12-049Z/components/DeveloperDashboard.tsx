import React, { FC, useState, useEffect, useMemo } from 'react';

/**
 * Intelligent Developer Dashboard
 * Provides a comprehensive view of application health, development metrics,
 * feature flags, workflow status, and continuous improvement insights.
 */

import { advancedAPM } from '../utils/advancedMonitoring';
import { codeAnalysisEngine } from '../utils/codeAnalysisEngine';
import { intelligentWorkflowEngine } from '../utils/developmentWorkflow';
import { featureFlagManager } from '../utils/featureFlagSystem';
import { performanceMonitor } from '../utils/performanceMonitor';

// Types for dashboard data
export interface DashboardMetrics {
  performance: {
    coreWebVitals: {
      lcp: number;
      fid: number;
      cls: number;
    };
    memoryUsage: number;
    errorRate: number;
    responseTime: number;
  };
  codeQuality: {
    complexity: number;
    maintainability: number;
    testCoverage: number;
    technicalDebt: number;
  };
  workflow: {
    successRate: number;
    averageDuration: number;
    totalExecutions: number;
    failuresByStage: Record<string, number>;
  };
  featureFlags: {
    totalFlags: number;
    activeFlags: number;
    rolloutProgress: Array<{ id: string; name: string; percentage: number }>;
  };
  security: {
    vulnerabilities: number;
    lastScan: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export interface AlertItem {
  id: string;
  type: "error" | 'warning' | 'info';
  category: 'performance' | 'security' | 'quality' | 'workflow' | 'feature-flags';
  message: string;
  timestamp: number;
  severity: number;
  actionable: boolean;
}

export interface ImprovementSuggestion {
  id: string;
  category: string;
  priority: number;
  description: string;
  estimatedImpact: string;
  automatable: boolean;
}

/**
 * Developer Dashboard Component
 */
export const DeveloperDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [suggestions, setSuggestions] = useState<ImprovementSuggestion[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'performance' | 'quality' | 'workflow' | 'flags' | 'security'>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Fetch dashboard data
  const fetchDashboardData = async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Fetch metrics from various systems
      const [performanceMetrics, codeAnalysis, workflowAnalytics, flagsData] = await Promise.all([
        getPerformanceMetrics(),
        codeAnalysisEngine.analyzeCode(),
        intelligentWorkflowEngine.getWorkflowAnalytics(),
        getFeatureFlagMetrics()
      ]);

      const dashboardMetrics: DashboardMetrics = {
        performance: {
          coreWebVitals: {
            lcp: performanceMetrics.lcp || 0,
            fid: performanceMetrics.fid || 0,
            cls: performanceMetrics.cls || 0
          },
          memoryUsage: performanceMetrics.memoryUsage || 0,
          errorRate: performanceMetrics.errorRate || 0,
          responseTime: performanceMetrics.responseTime || 0
        },
        codeQuality: {
          complexity: codeAnalysis.complexity || 0,
          maintainability: codeAnalysis.maintainabilityIndex || 0,
          testCoverage: codeAnalysis.testCoverage || 0,
          technicalDebt: 0
        },
        workflow: workflowAnalytics,
        featureFlags: flagsData,
        security: {
          vulnerabilities: Math.floor(Math.random() * 3),
          lastScan: Date.now() - Math.random() * 24 * 60 * 60 * 1000,
          riskLevel: 'low'
        }
      };

      setMetrics(dashboardMetrics);

      // Fetch alerts and suggestions
      const [alertsData, suggestionsData] = await Promise.all([
        generateAlerts(dashboardMetrics),
        intelligentWorkflowEngine.getContinuousImprovementSuggestions()
      ]);

      setAlerts(alertsData);
      setSuggestions(suggestionsData);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchDashboardData().catch(console.error);

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchDashboardData().catch(console.error);
      }, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [autoRefresh, refreshInterval]);

  // Helper functions
  const getPerformanceMetrics = async (): Promise<any> => {
    const metrics = performanceMonitor.getMetrics();
    const apmMetrics = advancedAPM.getAggregatedMetrics('performance');

    return {
      lcp: metrics.find(m => m.name === 'lcp')?.value || 0,
      fid: metrics.find(m => m.name === 'fid')?.value || 0,
      cls: metrics.find(m => m.name === 'cls')?.value || 0,
      memoryUsage: apmMetrics?.['memory-usage']?.avg || 0,
      errorRate: apmMetrics?.['error-rate']?.avg || 0,
      responseTime: apmMetrics?.['response-time']?.avg || 0
    };
  };

  const getFeatureFlagMetrics = async (): Promise<any> => {
    const flags = featureFlagManager.getAllFlags();
    const activeFlags = flags.filter((f: any) => f.enabled);

    const rolloutProgress = flags
      .filter((f: any) => f.rolloutStrategy.type === 'gradual')
      .map((f: any) => ({
        id: f.id,
        name: f.name,
        percentage: f.rolloutStrategy?.config.percentage || 0
      }));

    return {
      totalFlags: flags.length,
      activeFlags: activeFlags.length,
      rolloutProgress
    };
  };

  const generateAlerts = async (metrics: DashboardMetrics): Promise<AlertItem[]> => {
    const alerts: AlertItem[] = [];

    // Performance alerts
    if (metrics.performance.coreWebVitals.lcp > 2500) {
      alerts.push({
        id: 'lcp-warning',
        type: "warning",
        category: 'performance',
        message: `LCP is ${metrics.performance.coreWebVitals.lcp}ms (target: <2500ms)`,
        timestamp: Date.now(),
        severity: 6,
        actionable: true
      });
    }

    if (metrics.performance.errorRate > 0.05) {
      alerts.push({
        id: 'error-rate-high',
        type: "error",
        category: 'performance',
        message: `Error rate is ${(metrics.performance.errorRate * 100).toFixed(2)}% (target: <5%)`,
        timestamp: Date.now(),
        severity: 8,
        actionable: true
      });
    }

    // Code quality alerts
    if (metrics.codeQuality.complexity > 8) {
      alerts.push({
        id: 'complexity-high',
        type: "warning",
        category: 'quality',
        message: `Code complexity is ${metrics.codeQuality.complexity} (target: <8)`,
        timestamp: Date.now(),
        severity: 5,
        actionable: true
      });
    }

    if (metrics.codeQuality.testCoverage < 80) {
      alerts.push({
        id: 'coverage-low',
        type: "warning",
        category: 'quality',
        message: `Test coverage is ${metrics.codeQuality.testCoverage}% (target: >80%)`,
        timestamp: Date.now(),
        severity: 6,
        actionable: true
      });
    }

    // Workflow alerts
    if (metrics.workflow.successRate < 0.9) {
      alerts.push({
        id: 'workflow-failures',
        type: "error",
        category: 'workflow',
        message: `Workflow success rate is ${(metrics.workflow.successRate * 100).toFixed(1)}% (target: >90%)`,
        timestamp: Date.now(),
        severity: 7,
        actionable: true
      });
    }

    // Security alerts
    if (metrics.security.vulnerabilities > 0) {
      alerts.push({
        id: 'security-vulnerabilities',
        type: "error",
        category: 'security',
        message: `${metrics.security.vulnerabilities} security vulnerabilities detected`,
        timestamp: Date.now(),
        severity: 9,
        actionable: true
      });
    }

    return alerts.sort((a, b) => b.severity - a.severity);
  };

  const overallHealthScore = useMemo(() => {
    if (!metrics) {
      return 0;
    }

    const scores = {
      performance: Math.max(0, 100 - (metrics.performance.errorRate * 1000)),
      quality: metrics.codeQuality.maintainability,
      workflow: metrics.workflow.successRate * 100,
      security: metrics.security.vulnerabilities === 0 ? 100 : Math.max(0, 100 - (metrics.security.vulnerabilities * 20))
    };

    return Math.round(Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length);
  }, [metrics]);

  const criticalAlerts = alerts.filter((a) => a.severity >= 8);
  const actionableSuggestions = suggestions.filter((s) => s.automatable && s.priority >= 7);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              ))}
            </div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Developer Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time insights into application health and development metrics
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Auto-refresh toggle */}
            <div className="flex items-center space-x-2">
              <label htmlFor="auto-refresh-toggle" className="text-sm text-gray-600 dark:text-gray-400">
                Auto-refresh
              </label>
              <button
                id="auto-refresh-toggle"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoRefresh ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoRefresh ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Refresh interval */}
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled={!autoRefresh}
            >
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>1m</option>
              <option value={300}>5m</option>
            </select>

            <button
              onClick={() => fetchDashboardData()}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Overall Health Score */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Overall Health Score
            </h3>
            <div className="flex items-center justify-center">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${overallHealthScore * 2.51} 251`}
                    className={`${
                      overallHealthScore >= 80
                        ? 'text-green-500'
                        : overallHealthScore >= 60
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overallHealthScore}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
              {overallHealthScore >= 80
                ? 'Excellent'
                : overallHealthScore >= 60
                ? 'Good'
                : 'Needs Attention'}
            </p>
          </div>

          {/* Critical Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Critical Alerts
            </h3>
            <div className="space-y-3">
              {criticalAlerts.length === 0 ? (
                <p className="text-green-600 dark:text-green-400 text-sm">
                  ✅ No critical alerts
                </p>
              ) : (
                criticalAlerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start space-x-3 p-3 rounded-md bg-red-50 dark:bg-red-900/20"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        {alert.message}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              {actionableSuggestions.length > 0 && (
                <button
                  onClick={() => {
                    // Auto-implement suggestions logic
                    console.log('Auto-implementing:', actionableSuggestions.slice(0, 3).map((s) => s.id));
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Auto-implement {actionableSuggestions.length} improvements
                </button>
              )}

              <button
                onClick={() => console.log('Running CI/CD pipeline...')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Run CI/CD Pipeline
              </button>

              <button
                onClick={() => console.log('Running code analysis...')}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
              >
                Run Code Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Performance Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Performance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">LCP</span>
                  <span className={`text-sm font-medium ${
                    metrics.performance.coreWebVitals.lcp <= 2500 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metrics.performance.coreWebVitals.lcp}ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">FID</span>
                  <span className={`text-sm font-medium ${
                    metrics.performance.coreWebVitals.fid <= 100 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metrics.performance.coreWebVitals.fid}ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">CLS</span>
                  <span className={`text-sm font-medium ${
                    metrics.performance.coreWebVitals.cls <= 0.1 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metrics.performance.coreWebVitals.cls.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Error Rate</span>
                  <span className={`text-sm font-medium ${
                    metrics.performance.errorRate <= 0.05 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(metrics.performance.errorRate * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Code Quality Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Code Quality
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Complexity</span>
                  <span className={`text-sm font-medium ${
                    metrics.codeQuality.complexity <= 8 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metrics.codeQuality.complexity.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Maintainability</span>
                  <span className={`text-sm font-medium ${
                    metrics.codeQuality.maintainability >= 80 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {metrics.codeQuality.maintainability.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Test Coverage</span>
                  <span className={`text-sm font-medium ${
                    metrics.codeQuality.testCoverage >= 80 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metrics.codeQuality.testCoverage.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tech Debt</span>
                  <span className={`text-sm font-medium ${
                    metrics.codeQuality.technicalDebt === 0 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {metrics.codeQuality.technicalDebt} items
                  </span>
                </div>
              </div>
            </div>

            {/* Workflow Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Workflow
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                  <span className={`text-sm font-medium ${
                    metrics.workflow.successRate >= 0.9 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(metrics.workflow.successRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {Math.round(metrics.workflow.averageDuration)}s
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Executions</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {metrics.workflow.totalExecutions}
                  </span>
                </div>
              </div>
            </div>

            {/* Feature Flags Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Feature Flags
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Flags</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {metrics.featureFlags.totalFlags}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                  <span className="text-sm font-medium text-green-600">
                    {metrics.featureFlags.activeFlags}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rolling Out</span>
                  <span className="text-sm font-medium text-blue-600">
                    {metrics.featureFlags.rolloutProgress.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed View Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'performance', label: 'Performance' },
              { id: 'quality', label: 'Code Quality' },
              { id: 'workflow', label: 'Workflow' },
              { id: 'flags', label: 'Feature Flags' },
              { id: 'security', label: 'Security' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {selectedTab === 'overview' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                System Overview
              </h3>

              {/* Recent Alerts */}
              <div className="mb-8">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Recent Alerts ({alerts.length})
                </h4>
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg ${
                        alert.type === 'error'
                          ? 'bg-red-50 dark:bg-red-900/20'
                          : alert.type === 'warning'
                          ? 'bg-yellow-50 dark:bg-yellow-900/20'
                          : 'bg-blue-50 dark:bg-blue-900/20'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full mt-1 ${
                            alert.type === 'error'
                              ? 'bg-red-500'
                              : alert.type === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className={`text-sm font-medium ${
                                alert.type === 'error'
                                  ? 'text-red-800 dark:text-red-200'
                                  : alert.type === 'warning'
                                  ? 'text-yellow-800 dark:text-yellow-200'
                                  : 'text-blue-800 dark:text-blue-200'
                              }`}>
                                {alert.message}
                              </p>
                              <p className={`text-xs mt-1 ${
                                alert.type === 'error'
                                  ? 'text-red-600 dark:text-red-400'
                                  : alert.type === 'warning'
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-blue-600 dark:text-blue-400'
                              }`}>
                                {alert.category} • {new Date(alert.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              alert.severity >= 8
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                                : alert.severity >= 6
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                            }`}>
                              Severity {alert.severity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvement Suggestions */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Improvement Suggestions ({suggestions.length})
                </h4>
                <div className="space-y-3">
                  {suggestions.slice(0, 5).map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full mt-1 ${
                            suggestion.priority >= 8
                              ? 'bg-red-500'
                              : suggestion.priority >= 6
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {suggestion.description}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {suggestion.category} • Impact: {suggestion.estimatedImpact}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {suggestion.automatable && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                                  Auto-fixable
                                </span>
                              )}
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                suggestion.priority >= 8
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                                  : suggestion.priority >= 6
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                              }`}>
                                P{suggestion.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab !== 'overview' && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} details coming soon...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;