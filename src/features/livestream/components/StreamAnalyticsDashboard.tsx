/// <reference types="react/jsx-runtime" />
import React from "react";
import { useState, useEffect, useCallback, useMemo, type FC, type ReactNode } from 'react';
import { conditionalLogger } from '../../../utils/conditionalLogger';
import { createComponentError } from '../../../utils/errorUtils';
import type { LiveStreamStats } from '../../../types/livestream';
import { ChartBarIcon, EyeIcon, HeartIcon, ChatBubbleLeftRightIcon, CurrencyDollarIcon, ClockIcon, SignalIcon, ArrowTrendingUpIcon as TrendingUpIcon } from '@heroicons/react/24/outline';

/**
 * Props for the StreamAnalyticsDashboard component
 */
interface StreamAnalyticsDashboardProps {
  /** Stream ID to fetch analytics for */
  streamId: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Historical data point structure for charts
 */
interface HistoricalDataPoint {
  /** ISO timestamp */
  time: string;
  /** Count value for viewers metric */
  count?: number;
  /** Rate value for engagement metric */
  rate?: number;
  /** Amount value for revenue metric */
  amount?: number;
}

/**
 * Complete analytics data structure
 */
interface AnalyticsData {
  /** Real-time stream statistics */
  realTimeStats: LiveStreamStats;
  /** Historical data for charts */
  historicalData: {
    viewers: Array<{ time: string, count: number }>;
    engagement: Array<{ time: string, rate: number }>;
    revenue: Array<{ time: string, amount: number }>;
  };
  /** Audience demographic information */
  demographics: {
    countries: Array<{ name: string, percentage: number }>;
    devices: Array<{ type: string, percentage: number }>;
    ageGroups: Array<{ range: string, percentage: number }>;
  };
  /** Notable moments during the stream */
  topMoments: Array<{
    timestamp: number, type: 'peak_viewers' | 'super_chat' | 'viral_moment';
    description: string, value: number
  }>;
}

/** Time range options for analytics display */
type TimeRange = 'live' | '1h' | '24h' | '7d';

/** Metric types for chart visualization */
type MetricType = 'viewers' | 'engagement' | 'revenue';

/** Stream health status indicators */
type StreamHealth = 'excellent' | 'good' | 'fair' | 'poor';

// Utility functions for better modularity
const formatNumber = (num: any): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

const formatDuration = (seconds: any): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const getHealthColor = (health: StreamHealth): string => {
  const healthColors: Record<StreamHealth, string> = {
    excellent: 'text-green-600',
    good: 'text-blue-600',
    fair: 'text-yellow-600', poor: 'text-red-600'
  };
  return healthColors[health];
};

const getMetricValue = (point: HistoricalDataPoint, metric: MetricType): number => {
  switch (metric) {
    case 'viewers':
      return point.count ?? 0;
    case 'engagement':
      return point.rate ?? 0;
    case 'revenue':
      return point.amount ?? 0; default:
      return 0
  }
};

// Mock data generation for development
const generateMockAnalytics = (): AnalyticsData => ({
  realTimeStats: {
    viewers: 1247,
    peakViewers: 2156,
    averageViewers: 987,
    duration: 3600,
    likes: 342,
    dislikes: 12,
    chatMessages: 1567,
    superChatAmount: 234.50,
    superChatCount: 23,
    pollVotes: 456,
    qaQuestions: 34,
    streamHealth: 'excellent',
    bitrate: 4500,
    frameDrops: 0, latency: 1800
  },
  historicalData: {
    viewers: Array.from({ length: 60 }, (_, i) => ({
      time: new Date(Date.now() - (59 - i) * 60000).toISOString(), count: Math.floor(Math.random() * 500) + 800
    })),
    engagement: Array.from({ length: 60 }, (_, i) => ({
      time: new Date(Date.now() - (59 - i) * 60000).toISOString(), rate: Math.random() * 20 + 10
    })),
    revenue: Array.from({ length: 60 }, (_, i) => ({
      time: new Date(Date.now() - (59 - i) * 60000).toISOString(), amount: Math.random() * 50
    })),
  },
  demographics: {
    countries: [
      { name: 'United States', percentage: 35 },
      { name: 'United Kingdom', percentage: 18 },
      { name: 'Canada', percentage: 12 },
      { name: 'Australia', percentage: 8 },
      { name: 'Germany', percentage: 7 },
      { name: 'Others', percentage: 20 },
    ],
    devices: [
      { type: 'Desktop', percentage: 45 },
      { type: 'Mobile', percentage: 40 },
      { type: 'Tablet', percentage: 10 },
      { type: 'TV', percentage: 5 },
    ],
    ageGroups: [
      { range: '13-17', percentage: 15 },
      { range: '18-24', percentage: 28 },
      { range: '25-34', percentage: 32 },
      { range: '35-44', percentage: 15 },
      { range: '45+', percentage: 10 },
    ],
  },
  topMoments: [
    {
      timestamp: 1800,
      type: 'peak_viewers',
      description: 'Peak viewership reached', value: 2156
    },
    {
      timestamp: 2400,
      type: 'super_chat',
      description: 'Largest Super Chat donation', value: 50
    },
    {
      timestamp: 3000,
      type: 'viral_moment',
      description: 'Viral clip shared', value: 1000
    },
  ],
});

// Custom hook for analytics data management
const useStreamAnalytics = (streamId?: string, timeRange: TimeRange = 'live') => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (): Promise<void> => {
    if (!streamId) {
      setAnalytics(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Mock analytics data - in production, this would come from the API
      // await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      const mockAnalytics = generateMockAnalytics();
      setAnalytics(mockAnalytics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      const componentError = createComponentError('StreamAnalyticsDashboard', 'Failed to fetch analytics', err);
      conditionalLogger.error('Failed to fetch analytics:', componentError);
      setError(errorMessage);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [streamId]);

  useEffect(() => {
    fetchAnalytics();

    // Update analytics every 30 seconds for live streams
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchAnalytics, timeRange]);

  return { analytics, loading, error, refetch: fetchAnalytics };
};

// Sub-components for better modularity

/**
 * Props for the StatsCard component
 */
interface StatsCardProps {
  /** Card title/label */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Icon component */
  icon: ReactNode;
  /** Optional subtitle text */
  subtitle?: string;
  /** Optional trend indicator */
  trend?: ReactNode;
}

const StatsCard: FC<StatsCardProps> = ({ title, value, icon, subtitle, trend }: {trend: any, subtitle: any; icon: any, value: any; title: string}) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {typeof value === 'number' ? formatNumber(value) : value}
        </p>
      </div>
      <div className="flex-shrink-0 ml-4">
        {icon}
      </div>
    </div>
    {(subtitle || trend) && (
      <div className="mt-3 flex items-center text-sm">
        {trend}
        {subtitle && <span className="text-gray-600 dark:text-gray-400">{subtitle}</span>}
      </div>
    )}
  </div>
);

/**
 * Props for the TopMoments component
 */
interface TopMomentsProps {
  /** Array of notable stream moments */
  moments: AnalyticsData['topMoments'] }

const TopMoments: React.FC<TopMomentsProps> = ({ moments }: {moments: any}) => {
  const getIcon = (type: any): React.ReactNode => {
    switch (type) {
      case 'peak_viewers':
        return <EyeIcon className="h-5 w-5 text-blue-500" />;
      case 'super_chat':
        return <CurrencyDollarIcon className="h-5 w-5 text-yellow-500" />;
      case 'viral_moment':
        return <TrendingUpIcon className="h-5 w-5 text-green-500" />; default:
        return <ChartBarIcon className="h-5 w-5 text-gray-500" />
    }
  };

  const formatMomentValue = (moment: AnalyticsData['topMoments'][0]): string => {
    switch (moment.type) {
      case 'super_chat':
        return `$${moment.value.toFixed(2)}`;
      default:
        return formatNumber(moment.value) }
  };

  if (moments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Moments</h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <ChartBarIcon className="h-8 w-8 mx-auto mb-2" />
          <p>No notable moments yet</p>
        </div>
      </div>
    ) }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Moments</h3>
      <div className="space-y-3">
        {moments.map((moment: any) => (
          <div
            key={`moment-${moment.type}-${moment.timestamp}`}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {getIcon(moment.type)}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {moment.description}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {formatDuration(moment.timestamp)}
                </p>
              </div>
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {formatMomentValue(moment)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Props for the Demographics component
 */
interface DemographicsProps {
  /** Audience demographic data */
  demographics: AnalyticsData['demographics'] }

const Demographics: React.FC<DemographicsProps> = ({ demographics }: {demographics: any}) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Audience Demographics</h3>
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Top Countries</h4>
        <div className="space-y-3">
          {demographics.countries.slice(0, 3).map((country: any) => (
            <div key={`country-${country.name}`} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {country.name}
              </span>
              <div className="flex items-center space-x-3">
                <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${country.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[2rem] text-right">
                  {country.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Devices</h4>
        <div className="grid grid-cols-2 gap-3">
          {demographics.devices.map((device: any) => (
            <div
              key={`device-${device.type}`}
              className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {device.percentage}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {device.type}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * StreamAnalyticsDashboard Component
 *
 * A comprehensive analytics dashboard for live stream data visualization.
 * Features real-time statistics, historical data charts, audience demographics,
 * and top moments tracking.
 *
 * @component
 * @example
 * ```tsx
 * <StreamAnalyticsDashboard
 *   streamId="stream_123"
 *   className="w-full"
 * />
 * ```
 */

const StreamAnalyticsDashboard: FC<StreamAnalyticsDashboardProps> = ({
  streamId,
  className = '',
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('live');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('viewers');

  const { analytics, loading } = useStreamAnalytics(streamId, timeRange);

  const chartData = useMemo(() => {
    if (!analytics) {
      return [];
    }

    try {
      const rawData = analytics.historicalData[selectedMetric]?.slice(-20) || [];
      if (rawData.length === 0) {
        return [];
      }

      const maxValue = Math.max(...rawData.map(p => getMetricValue(p, selectedMetric))) || 1;

      return rawData.map((point, index) => {
        const value = getMetricValue(point, selectedMetric);
        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;

        return {
          index,
          height: Math.max(height, 2), // Minimum height for visibility
          value,
          time: point.time,
          id: `chart-${selectedMetric}-${index}`,
        };
      });
    } catch (error) {
      const componentError = createComponentError('StreamAnalyticsDashboard', 'Error generating chart data', error);
      conditionalLogger.error('Error generating chart data:', componentError);
      return [];
    }
  }, [analytics, selectedMetric]);

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`loading-card-${i}`} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    ) }

  if (!analytics) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <h3 className="text-lg font-medium mb-2">No analytics data available</h3>
          <p className="text-sm">Analytics will appear here once your stream is live.</p>
        </div>
      </div>
    ) }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Stream Analytics
        </h2>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => {
              setTimeRange(e.target.value as TimeRange);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            aria-label="Select time range"
          >
            <option value="live">Live</option>
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Current Viewers"
          value={analytics.realTimeStats.viewers}
          icon={<EyeIcon className="h-8 w-8 text-blue-500" />}
          trend={
            <>
              <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">Peak: {formatNumber(analytics.realTimeStats.peakViewers)}</span>
            </>
          }
        />

        <StatsCard
          title="Stream Duration"
          value={formatDuration(analytics.realTimeStats.duration)}
          icon={<ClockIcon className="h-8 w-8 text-purple-500" />}
          trend={
            <>
              <SignalIcon className={`h-4 w-4 mr-1 ${getHealthColor(analytics.realTimeStats.streamHealth)}`} />
              <span className={getHealthColor(analytics.realTimeStats.streamHealth)}>
                {analytics.realTimeStats.streamHealth}
              </span>
            </>
          }
        />

        <StatsCard
          title="Chat Messages"
          value={analytics.realTimeStats.chatMessages}
          icon={<ChatBubbleLeftRightIcon className="h-8 w-8 text-green-500" />}
          trend={
            <>
              <HeartIcon className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-gray-600">{formatNumber(analytics.realTimeStats.likes)} likes</span>
            </>
          }
        />

        <StatsCard
          title="Super Chat Revenue"
          value={`$${analytics.realTimeStats.superChatAmount.toFixed(2)}`}
          icon={<CurrencyDollarIcon className="h-8 w-8 text-yellow-500" />}
          subtitle={`${analytics.realTimeStats.superChatCount} donations`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Viewer Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Viewer Trends</h3>
            <select
              value={selectedMetric}
              onChange={(e) => {
                setSelectedMetric(e.target.value as MetricType);
              }}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Select metric to display"
            >
              <option value="viewers">Viewers</option>
              <option value="engagement">Engagement</option>
              <option value="revenue">Revenue</option>
            </select>
          </div>
          {chartData.length > 0 ? (
            <div className="h-64 flex items-end justify-between space-x-1" role="img" aria-label={`${selectedMetric} chart`}>
              {chartData.map((point) => (
                <div
                  key={point.id}
                  className="bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                  style={{ height: `${point.height}%`, width: '4%' }}
                  title={`${point.value} at ${new Date(point.time).toLocaleTimeString()}`}
                  role="presentation"
                />
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <ChartBarIcon className="h-8 w-8 mx-auto mb-2" />
                <p>No chart data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Demographics */}
        <Demographics demographics={analytics.demographics} />
      </div>

      {/* Top Moments */}
      <TopMoments moments={analytics.topMoments} />
    </div>
  );
};

export default StreamAnalyticsDashboard;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any }
  }
}
