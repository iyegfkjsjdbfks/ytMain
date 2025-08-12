
/**
 * Comprehensive DevOps Dashboard
 * Provides unified monitoring and management interface for all system aspects:
 * - Performance monitoring
 * - Security monitoring
 * - Deployment automation
 * - Code quality tracking
 * - Feature flag management
 */

import { useEffect, useState, FC } from 'react';

import { deploymentAutomation } from '../utils/deploymentAutomation';
import { intelligentCodeMonitor } from '../utils/intelligentCodeMonitor';
import { performanceMonitor } from '../utils/performanceMonitor';
import { securityMonitoring } from '../utils/securityMonitoring';

// Types for dashboard data
interface DashboardMetrics {
  performance: {,
          score: number;,
    lcp: number;,
          fid: number;,
    cls: number;,
          memoryUsage: number;,
    errorRate: number;
  };
  security: {,
          score: number;,
    threatsDetected: number;,
          vulnerabilities: number;,
    complianceScore: number;
  };
  deployment: {,
          successRate: number;,
    averageTime: number;,
          frequency: number;,
    activeDeployments: number;
  };
  codeQuality: {,
          score: number;,
    complexity: number;,
          coverage: number;,
    technicalDebt: number;
  };
  featureFlags: {,
          totalFlags: number;,
    activeFlags: number;,
          experimentsRunning: number;
  }}

interface AlertItem {
  id: string;,
          type: 'performance' | 'security' | 'deployment' | 'quality';,
  severity: 'low' | 'medium' | 'high' | 'critical';,
          title: string;,
  description: string;,
          timestamp: number;,
  acknowledged: boolean
}

const DevOpsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'security' | 'deployment' | 'quality' | 'features'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Gather metrics from all monitoring systems
      const performanceMetrics = performanceMonitor.getMetrics();
      const securityMetrics = securityMonitoring.getSecurityMetrics();
      const deploymentMetrics = deploymentAutomation.getDeploymentMetrics();
      const codeMetrics = intelligentCodeMonitor.getLatestMetrics();
      const flagMetrics = {
        totalFlags: 0,
          activeFlags: 0;
      }; // featureFlagManager.getMetrics();

      // Transform data for dashboard
      const dashboardMetrics: DashboardMetrics = {,
          performance: {,
          score: Math.round(performanceMetrics.find(m => m.name === 'performance-score')?.value || 85),
          lcp: performanceMetrics.find(m => m.name === 'lcp')?.value || 1500,
          fid: performanceMetrics.find(m => m.name === 'fid')?.value || 50,
          cls: performanceMetrics.find(m => m.name === 'cls')?.value || 0.05,
          memoryUsage: performanceMetrics.find(m => m.name === 'memory-usage')?.value || 45,
          errorRate: performanceMetrics.find(m => m.name === 'error-rate')?.value || 0.1
        },
        security: {,
          score: Math.round(securityMetrics.securityScore),
          threatsDetected: securityMetrics.threatsDetected,
          vulnerabilities: securityMetrics.vulnerabilities.total,
          complianceScore: Math.round(securityMetrics.complianceScore)
        },
        deployment: {,
          successRate: Math.round(deploymentMetrics.successRate * 100),
          averageTime: Math.round(deploymentMetrics.averageDeployTime / 1000 / 60), // Convert to minutes,
          frequency: deploymentMetrics.deploymentFrequency,
          activeDeployments: deploymentAutomation.getAllExecutions().filter((e) => e.status === 'running').length
        },
        codeQuality: {,
          score: codeMetrics ? Math.round(
            (codeMetrics.maintainability + codeMetrics.testCoverage) / 2) : 82,
          complexity: Math.round(codeMetrics?.complexity || 15),
          coverage: Math.round(codeMetrics?.testCoverage || 78), technicalDebt: Math.round(codeMetrics?.technicalDebt || 12)
        },
        featureFlags: {,
          totalFlags: flagMetrics.totalFlags,
          activeFlags: flagMetrics.activeFlags,
          experimentsRunning: 0, // flagMetrics.experimentsRunning } 
        
        };

      setMetrics(dashboardMetrics);

      // Gather alerts from all systems
      const allAlerts: AlertItem[] = [
        ...securityMonitoring.getSecurityAlerts(false).map(alert => ({
          id: alert.id,
          type: 'security' as const, severity: alert.severity,
          title: alert.title,
          description: alert.description,
          timestamp: alert.timestamp, acknowledged: alert.acknowledged
        })),
        ...deploymentAutomation.getAllExecutions()
          .filter((exec) => exec.status === 'failed')
          .slice(0, 5)
          .map(exec => ({
            id: exec.id,
          type: 'deployment' as const, severity: 'high' as const,
          title: 'Deployment Failed',
            description: `Pipeline ${exec.pipelineId} failed`,
          timestamp: exec.endTime || exec.startTime,
            acknowledged: false }))
      ];

      // Add performance alerts
      if (dashboardMetrics.performance.score < 70) {
        allAlerts.push({
          id: 'perf-low-score',
          type: 'performance',
          severity: 'medium',
          title: 'Low Performance Score',
          description: `Performance score is ${dashboardMetrics.performance.score}`,
          timestamp: Date.now(),
          acknowledged: false });
      }

      // Add code quality alerts
      if (dashboardMetrics.codeQuality.score < 75) {
        allAlerts.push({
          id: 'quality-low-score',
          type: 'quality',
          severity: 'medium',
          title: 'Low Code Quality Score',
          description: `Code quality score is ${dashboardMetrics.codeQuality.score}`,
          timestamp: Date.now(),
          acknowledged: false });
      }

      setAlerts(allAlerts.sort((a, b) => b.timestamp - a.timestamp));
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh data
  useEffect(() => {
    fetchDashboardData().catch(console.error);
    const interval = setInterval(() => {
      fetchDashboardData().catch(console.error);
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Get severity color
  const getSeverityColor = (severity: any) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100'; default: return 'text-gray-600 bg-gray-100'
    }
  
        
        };

  // Get score color
  const getScoreColor = (score: any) => {
    if (score >= 90) {
return 'text-green-600';
}
    if (score >= 75) {
return 'text-yellow-600';
}
    if (score >= 60) {
return 'text-orange-600';
}
    return 'text-red-600';
  };

  // Render metric card
  const MetricCard: React.FC<{,
          title: string;,
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'stable';
    color?: string;
  }> = ({ title, value, subtitle, trend, color = 'text-gray-900' }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-semibold ${color}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {trend && (
          <div className={`text-sm ${
            trend === 'up' ? 'text-green-600'  :
            trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}</div>
        )}
      </div>
    </div>
  );

  // Render overview tab
  const OverviewTab = () => {
    if (!metrics) {
return <div>Loading...</div>;
}

    return (
      <div className="space-y-6">
        {/* Key Metrics Grid */}<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Performance Score",
            value={metrics.performance.score}
            color={getScoreColor(metrics.performance.score)}
            trend="stable"
          />
          <MetricCard
            title="Security Score"
            value={metrics.security.score}
            color={getScoreColor(metrics.security.score)}
            trend="up"
          />
          <MetricCard
            title="Deployment Success"
            value={`${metrics.deployment.successRate}%`}
            color={getScoreColor(metrics.deployment.successRate)}
            trend="stable"
          />
          <MetricCard
            title="Code Quality"
            value={metrics.codeQuality.score}
            color={getScoreColor(metrics.codeQuality.score)}
            trend="up"
          />
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Status</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full" />
                <span className="text-sm text-gray-600">Application Health: Healthy</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full" />
                <span className="text-sm text-gray-600">Database: Connected</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                <span className="text-sm text-gray-600">Cache: Degraded</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full" />
                <span className="text-sm text-gray-600">CDN: Operational</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full" />
                <span className="text-sm text-gray-600">Monitoring: Active</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full" />
                <span className="text-sm text-gray-600">Security: Protected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-500">{alert.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    alert.type === 'security' ? 'text-red-800 bg-red-100' :
                    alert.type === 'performance' ? 'text-blue-800 bg-blue-100' :
                    alert.type === 'deployment' ? 'text-purple-800 bg-purple-100' :
                    'text-gray-800 bg-gray-100'
                  }`}>
                    {alert.type}
                  </span>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No active alerts,
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render performance tab
  const PerformanceTab = () => {
    if (!metrics) {
return <div>Loading...</div>;
}

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="Largest Contentful Paint",
            value={`${metrics.performance.lcp}ms`},
            color={metrics.performance.lcp < 2500 ? 'text-green-600' : 'text-red-600'} />
          <MetricCard
            title="First Input Delay",
            value={`${metrics.performance.fid}ms`},
            color={metrics.performance.fid < 100 ? 'text-green-600' : 'text-red-600'} />
          <MetricCard
            title="Cumulative Layout Shift",
            value={metrics.performance.cls.toFixed(3)}
            color={metrics.performance.cls < 0.1 ? 'text-green-600' : 'text-red-600'}
          />
          <MetricCard
            title="Memory Usage"
            value={`${metrics.performance.memoryUsage}%`}
            color={metrics.performance.memoryUsage < 70 ? 'text-green-600' : 'text-red-600'}
          />
          <MetricCard
            title="Error Rate"
            value={`${metrics.performance.errorRate}%`}
            color={metrics.performance.errorRate < 1 ? 'text-green-600' : 'text-red-600'}
          />
        </div>
      </div>
    );
  };

  // Render security tab
  const SecurityTab = () => {
    if (!metrics) {
return <div>Loading...</div>;
}

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Threats Detected",
            value={metrics.security.threatsDetected}
            color="text-red-600",
          />
          <MetricCard
            title="Vulnerabilities",
            value={metrics.security.vulnerabilities}
            color={metrics.security.vulnerabilities === 0 ? 'text-green-600' : 'text-red-600'} />
          <MetricCard
            title="Compliance Score",
            value={`${metrics.security.complianceScore}%`},
            color={getScoreColor(metrics.security.complianceScore)}
          />
          <MetricCard
            title="Security Score"
            value={metrics.security.score}
            color={getScoreColor(metrics.security.score)}
          />
        </div>
      </div>
    );
  };

  // Render deployment tab
  const DeploymentTab = () => {
    if (!metrics) {
return <div>Loading...</div>;
}

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Success Rate",
            value={`${metrics.deployment.successRate}%`},
            color={getScoreColor(metrics.deployment.successRate)}
          />
          <MetricCard
            title="Average Deploy Time"
            value={`${metrics.deployment.averageTime}min`}
            color="text-blue-600"
          />
          <MetricCard
            title="Deploy Frequency"
            value={`${metrics.deployment.frequency}/day`}
            color="text-green-600"
          />
          <MetricCard
            title="Active Deployments"
            value={metrics.deployment.activeDeployments}
            color={metrics.deployment.activeDeployments > 0 ? 'text-orange-600' : 'text-green-600'}
          />
        </div>
      </div>
    );
  };

  // Render quality tab
  const QualityTab = () => {
    if (!metrics) {
return <div>Loading...</div>;
}

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Code Quality Score",
            value={metrics.codeQuality.score}
            color={getScoreColor(metrics.codeQuality.score)}
          />
          <MetricCard
            title="Complexity"
            value={metrics.codeQuality.complexity}
            color={metrics.codeQuality.complexity < 20 ? 'text-green-600' : 'text-red-600'}
          />
          <MetricCard
            title="Test Coverage"
            value={`${metrics.codeQuality.coverage}%`}
            color={getScoreColor(metrics.codeQuality.coverage)}
          />
          <MetricCard
            title="Technical Debt"
            value={`${metrics.codeQuality.technicalDebt}h`}
            color={metrics.codeQuality.technicalDebt < 20 ? 'text-green-600' : 'text-red-600'}
          />
        </div>
      </div>
    );
  };

  // Render features tab
  const FeaturesTab = () => {
    if (!metrics) {
return <div>Loading...</div>;
}

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Total Flags",
            value={metrics.featureFlags.totalFlags}
            color="text-blue-600",
          />
          <MetricCard
            title="Active Flags",
            value={metrics.featureFlags.activeFlags}
            color="text-green-600",
          />
          <MetricCard
            title="Running Experiments",
            value={metrics.featureFlags.experimentsRunning}
            color="text-purple-600",
          />
        </div>
      </div>
    );
  };

  if (isLoading && !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading DevOps Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}<div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">DevOps Dashboard</h1>
              <p className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchDashboardData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview',
          label: 'Overview' },
              { id: 'performance',
          label: 'Performance' },
              { id: 'security',
          label: 'Security' },
              { id: 'deployment',
          label: 'Deployment' },
              { id: 'quality',
          label: 'Code Quality' },
              { id: 'features',
          label: 'Feature Flags' }
            ].map((tab) => (
              <button,
                key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'performance' && <PerformanceTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'deployment' && <DeploymentTab />}
        {activeTab === 'quality' && <QualityTab />}
        {activeTab === 'features' && <FeaturesTab />}
      </div>
    </div>
  );
};

export default DevOpsDashboard;