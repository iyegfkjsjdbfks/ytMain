import React, { useState, useEffect } from 'react';

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

interface AnalyticsData {
  realTimeStats: LiveStreamStats;
  historicalData: {
    viewers: { time: string; count: number }[];
    engagement: { time: string; rate: number }[];
    revenue: { time: string; amount: number }[];
  };
  demographics: {
    countries: { name: string; percentage: number }[];
    devices: { type: string; percentage: number }[];
    ageGroups: { range: string; percentage: number }[];
  };
  topMoments: {
    timestamp: number;
    type: 'peak_viewers' | 'super_chat' | 'viral_moment';
    description: string;
    value: number;
  }[];
}

const StreamAnalyticsDashboard: React.FC<StreamAnalyticsDashboardProps> = ({
  streamId,
  className = '',
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'live' | '1h' | '24h' | '7d'>('live');
  const [selectedMetric, setSelectedMetric] = useState<'viewers' | 'engagement' | 'revenue'>('viewers');

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!streamId) return;
      
      setLoading(true);
      try {
        // Mock analytics data - in production, this would come from the API
        const mockAnalytics: AnalyticsData = {
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
        };
        
        setAnalytics(mockAnalytics);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    
    // Update analytics every 30 seconds for live streams
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [streamId, timeRange]);

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

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
            onChange={(e) => setTimeRange(e.target.value as any)}
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
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Viewers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(analytics.realTimeStats.viewers)}
              </p>
            </div>
            <EyeIcon className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">Peak: {formatNumber(analytics.realTimeStats.peakViewers)}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Stream Duration</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatDuration(analytics.realTimeStats.duration)}
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <SignalIcon className={`h-4 w-4 mr-1 ${getHealthColor(analytics.realTimeStats.streamHealth)}`} />
            <span className={getHealthColor(analytics.realTimeStats.streamHealth)}>
              {analytics.realTimeStats.streamHealth}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Chat Messages</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(analytics.realTimeStats.chatMessages)}
              </p>
            </div>
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <HeartIcon className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-gray-600">{formatNumber(analytics.realTimeStats.likes)} likes</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Super Chat Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${analytics.realTimeStats.superChatAmount.toFixed(2)}
              </p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-gray-600">{analytics.realTimeStats.superChatCount} donations</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Viewer Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Viewer Trends</h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="viewers">Viewers</option>
              <option value="engagement">Engagement</option>
              <option value="revenue">Revenue</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between space-x-1">
            {analytics.historicalData[selectedMetric].slice(-20).map((point, index) => {
              const maxValue = Math.max(...analytics.historicalData[selectedMetric].map(p => 
                selectedMetric === 'viewers' ? (p as any).count : 
                selectedMetric === 'engagement' ? (p as any).rate : (p as any).amount
              ));
              const value = selectedMetric === 'viewers' ? (point as any).count : 
                          selectedMetric === 'engagement' ? (point as any).rate : (point as any).amount;
              const height = (value / maxValue) * 100;
              
              return (
                <div
                  key={index}
                  className="bg-blue-500 rounded-t"
                  style={{ height: `${height}%`, width: '4%' }}
                  title={`${value} at ${new Date(point.time).toLocaleTimeString()}`}
                />
              );
            })}
          </div>
        </div>

        {/* Demographics */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Audience Demographics</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top Countries</h4>
              <div className="space-y-2">
                {analytics.demographics.countries.slice(0, 3).map((country, index) => (
                  <div key={index} className="flex items-center justify-between">
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
                {analytics.demographics.devices.map((device, index) => (
                  <div key={index} className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="text-sm font-medium">{device.percentage}%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{device.type}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Moments */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Moments</h3>
        <div className="space-y-3">
          {analytics.topMoments.map((moment, index) => {
            const getIcon = () => {
              switch (moment.type) {
                case 'peak_viewers': return <EyeIcon className="h-5 w-5 text-blue-500" />;
                case 'super_chat': return <CurrencyDollarIcon className="h-5 w-5 text-yellow-500" />;
                case 'viral_moment': return <TrendingUpIcon className="h-5 w-5 text-green-500" />;
                default: return <ChartBarIcon className="h-5 w-5 text-gray-500" />;
              }
            };
            
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex items-center space-x-3">
                  {getIcon()}
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
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StreamAnalyticsDashboard;