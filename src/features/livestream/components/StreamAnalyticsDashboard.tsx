import type React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';

import {
  ChartBarIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ClockIcon,
  SignalIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
} from '@heroicons/react/24/outline';

import type { LiveStreamStats } from '../../../types/livestream';

interface StreamAnalyticsDashboardProps {
  streamId?: string;
  className?: string;
}

interface HistoricalDataPoint {
  time: string;
  count?: number;
  rate?: number;
  amount?: number;
}

interface AnalyticsData {
  realTimeStats: LiveStreamStats;
  historicalData: {
    viewers: Array<{ time: string; count: number }>;
    engagement: Array<{ time: string; rate: number }>;
    revenue: Array<{ time: string; amount: number }>;
  };
  demographics: {
    countries: Array<{ name: string; percentage: number }>;
    devices: Array<{ type: string; percentage: number }>;
    ageGroups: Array<{ range: string; percentage: number }>;
  };
  topMoments: Array<{
    timestamp: number;
    type: 'peak_viewers' | 'super_chat' | 'viral_moment';
    description: string;
    value: number;
  }>;
}

type TimeRange = 'live' | '1h' | '24h' | '7d';
type MetricType = 'viewers' | 'engagement' | 'revenue';
type StreamHealth = 'excellent' | 'good' | 'fair' | 'poor';

// Utility functions for better modularity
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const getHealthColor = (health: StreamHealth): string => {
  const healthColors: Record<StreamHealth, string> = {
    excellent: 'text-green-600',
    good: 'text-blue-600',
    fair: 'text-yellow-600',
    poor: 'text-red-600',
  };
  return healthColors[health] ?? 'text-gray-600';
};

const getMetricValue = (point: HistoricalDataPoint, metric: MetricType): number => {
  switch (metric) {
    case 'viewers':
      return point.count ?? 0;
    case 'engagement':
      return point.rate ?? 0;
    case 'revenue':
      return point.amount ?? 0;
    default:
      return 0;
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
    streamHealth: 'excellent' as StreamHealth,
    bitrate: 4500,
    frameDrops: 0,
    latency: 1800,
  },
  historicalData: {
    viewers: Array.from({ length: 60 }, (_, i) => ({
      time: new Date(Date.now() - (59 - i) * 60000).toISOString(),
      count: Math.floor(Math.random() * 500) + 800,
    })),
    engagement: Array.from({ length: 60 }, (_, i) => ({
      time: new Date(Date.now() - (59 - i) * 60000).toISOString(),
      rate: Math.random() * 20 + 10,
    })),
    revenue: Array.from({ length: 60 }, (_, i) => ({
      time: new Date(Date.now() - (59 - i) * 60000).toISOString(),
      amount: Math.random() * 50,
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
      description: 'Peak viewership reached',
      value: 2156,
    },
    {
      timestamp: 2400,
      type: 'super_chat',
      description: 'Largest Super Chat donation',
      value: 50,
    },
    {
      timestamp: 3000,
      type: 'viral_moment',
      description: 'Viral clip shared',
      value: 1000,
    },
  ],
});

// Sub-components for better modularity
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, subtitle, trend }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {typeof value === 'number' ? formatNumber(value) : value}
        </p>
      </div>
      {icon}
    </div>
    {(subtitle || trend) && (
      <div className="mt-2 flex items-center text-sm">
        {trend}
        {subtitle && <span className="text-gray-600">{subtitle}</span>}
      </div>
    )}
  </div>
);

interface TopMomentsProps {
  moments: AnalyticsData['topMoments'];
}

const TopMoments: React.FC<TopMomentsProps> = ({ moments }) => {
  const getIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'peak_viewers': 
        return <EyeIcon className="h-5 w-5 text-blue-500" />;
      case 'super_chat': 
        return <CurrencyDollarIcon className="h-5 w-5 text-yellow-500" />;
      case 'viral_moment': 
        return <TrendingUpIcon className="h-5 w-5 text-green-500" />;
      default: 
        return <ChartBarIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Moments</h3>
      <div className="space-y-3">
        {moments.map((moment, index) => (
          <div key={`moment-${moment.timestamp}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="flex items-center space-x-3">
              {getIcon(moment.type)}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{moment.description}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {formatDuration(moment.timestamp)}
                </p>
              </div>
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {moment.type === 'super_chat' ? `$${moment.value}` : formatNumber(moment.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface DemographicsProps {
  demographics: AnalyticsData['demographics'];
}

const Demographics: React.FC<DemographicsProps> = ({ demographics }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Audience Demographics</h3>
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top Countries</h4>
        <div className="space-y-2">
          {demographics.countries.slice(0, 3).map((country, index) => (
            <div key={`country-${country.name}-${index}`} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{country.name}</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${country.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{country.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Devices</h4>
        <div className="grid grid-cols-2 gap-2">
          {demographics.devices.map((device, index) => (
            <div key={`device-${device.type}-${index}`} className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="text-sm font-medium">{device.percentage}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{device.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const StreamAnalyticsDashboard: React.FC<StreamAnalyticsDashboardProps> = ({
  streamId,
  className = '',
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('live');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('viewers');

  const fetchAnalytics = useCallback(async () => {
    if (!streamId) {
      return;
    }

    setLoading(true);
    try {
      // Mock analytics data - in production, this would come from the API
      const mockAnalytics = generateMockAnalytics();
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [streamId]);

  useEffect(() => {
    void fetchAnalytics();

    // Update analytics every 30 seconds for live streams
    const interval = setInterval(() => {
      void fetchAnalytics();
    }, 30000);
    return () => {
      clearInterval(interval);
    };
  }, [fetchAnalytics, timeRange]);

  const chartData = useMemo(() => {
    if (!analytics) {
      return [];
    }

    const rawData = analytics.historicalData[selectedMetric].slice(-20);
    const maxValue = Math.max(...rawData.map(p => getMetricValue(p, selectedMetric)));

    return rawData.map((point, index) => {
      const value = getMetricValue(point, selectedMetric);
      const height = maxValue > 0 ? (value / maxValue) * 100 : 0;

      return { 
        index, 
        height, 
        value, 
        time: point.time,
        id: `chart-${selectedMetric}-${index}`,
      };
    });
  }, [analytics, selectedMetric]);

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`loading-card-${i}`} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <ChartBarIcon className="h-12 w-12 mx-auto mb-4" />
          <p>No analytics data available</p>
        </div>
      </div>
    );
  }

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
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <SignalIcon className={`h-4 w-4 mr-1 ${getHealthColor(analytics.realTimeStats.streamHealth as StreamHealth)}`} />
              <span className={getHealthColor(analytics.realTimeStats.streamHealth as StreamHealth)}>
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Viewer Trends</h3>
            <select
              value={selectedMetric}
              onChange={(e) => {
                setSelectedMetric(e.target.value as MetricType);
              }}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="viewers">Viewers</option>
              <option value="engagement">Engagement</option>
              <option value="revenue">Revenue</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between space-x-1">
            {chartData.map((point) => (
              <div
                key={point.id}
                className="bg-blue-500 rounded-t"
                style={{ height: `${point.height}%`, width: '4%' }}
                title={`${point.value} at ${new Date(point.time).toLocaleTimeString()}`}
              />
            ))}
          </div>
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