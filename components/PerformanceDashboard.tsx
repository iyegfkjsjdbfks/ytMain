import { useState, useEffect, memo } from 'react';

import { performanceMonitor } from '../utils/performance';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'render' | 'api' | 'user-interaction' | 'navigation';
}

interface PerformanceDashboardProps {
  isVisible?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = memo(({
  isVisible = false,
  position = 'top-right',
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const interval = setInterval(() => {
      const allMetrics = performanceMonitor.getMetrics();
      const formattedMetrics: PerformanceMetric[] = Object.entries(allMetrics).map(([name, value]) => ({
        name,
        value: typeof value === 'number' ? value : 0,
        timestamp: Date.now(),
        type: name.includes('render') ? 'render' :
              name.includes('api') ? 'api' :
              name.includes('click') || name.includes('hover') ? 'user-interaction' : 'navigation',
      }));

      setMetrics(formattedMetrics.slice(-20)); // Keep last 20 metrics
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'render':
        return 'text-blue-600';
      case 'api':
        return 'text-green-600';
      case 'user-interaction':
        return 'text-purple-600';
      case 'navigation':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const averageRenderTime = metrics
    .filter((m: any) => m.type === 'render')
    .reduce((sum, m) => sum + m.value, 0) / Math.max(metrics.filter((m: any) => m.type === 'render').length, 1);

  const apiCallsCount = metrics.filter((m: any) => m.type === 'api').length;

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50 font-mono text-xs`}>
      <div className="bg-black bg-opacity-90 text-white rounded-lg p-3 min-w-64 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Performance Monitor</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-300 hover:text-white"
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="bg-blue-900 bg-opacity-50 p-2 rounded">
            <div className="text-blue-300">Avg Render</div>
            <div className="font-bold">{averageRenderTime.toFixed(1)}ms</div>
          </div>
          <div className="bg-green-900 bg-opacity-50 p-2 rounded">
            <div className="text-green-300">API Calls</div>
            <div className="font-bold">{apiCallsCount}</div>
          </div>
        </div>

        {/* Detailed Metrics */}
        {isExpanded && (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            <div className="font-semibold mb-2 text-gray-300">Recent Metrics:</div>
            {metrics.length === 0 ? (
              <div className="text-gray-400">No metrics available</div>
            ) : (
              metrics.slice().reverse().map((metric, index) => (
                <div key={index} className="flex justify-between items-center py-1 border-b border-gray-700">
                  <span className={`${getTypeColor(metric.type)} truncate max-w-32`}>
                    {metric.name}
                  </span>
                  <span className="text-white font-mono">
                    {metric.value.toFixed(1)}ms
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Performance Tips */}
        {isExpanded && averageRenderTime > 100 && (
          <div className="mt-3 p-2 bg-yellow-900 bg-opacity-50 rounded">
            <div className="text-yellow-300 font-semibold">⚠️ Performance Warning</div>
            <div className="text-yellow-200 text-xs">
              Average render time is high. Consider:
              <ul className="list-disc list-inside mt-1">
                <li>Adding React.memo to components</li>
                <li>Using useCallback for event handlers</li>
                <li>Implementing virtual scrolling</li>
              </ul>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-between mt-3 pt-2 border-t border-gray-700">
          <button
            onClick={() => performanceMonitor.clearMetrics()}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Clear
          </button>
          <button
            onClick={() => {
              const metrics = performanceMonitor.getMetrics();
              console.table(metrics);
            }}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Log Report
          </button>
        </div>
      </div>
    </div>
  );
});

PerformanceDashboard.displayName = 'PerformanceDashboard';

export default PerformanceDashboard;
