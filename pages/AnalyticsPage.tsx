import * as React from 'react';
import {  useState, useEffect  } from 'react';
import { ChartBarIcon, EyeIcon, ClockIcon, UserGroupIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { Video } from '../types';
import { getVideos } from '../services/mockVideoService';
import { parseViewCount } from '../utils/numberUtils';

interface AnalyticsData {
  totalViews: number;
  totalVideos: number;
  totalWatchTime: number;
  totalLikes: number;
  totalComments: number;
  subscriberGrowth: number;
  topPerformingVideo: Video | null;
  recentPerformance: {
    views: number[];
    watchTime: number[];
    subscribers: number[];
    labels: string[];
  };
  videoPerformance: {
    video: Video;
    views: number;
    likes: number;
    comments: number;
    watchTime: number;
    ctr: number; // Click-through rate
    retention: number; // Average view duration percentage
  }[];
}

const AnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '28d' | '90d' | '365d'>('28d');
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'watchTime' | 'subscribers'>('views');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        const videos = await getVideos();
        
        // Generate mock analytics data
        const mockAnalytics: AnalyticsData = {
          totalViews: videos.reduce((sum, video) => sum + parseViewCount(video.views), 0),
          totalVideos: videos.length,
          totalWatchTime: Math.floor(Math.random() * 10000) + 5000, // Mock hours
          totalLikes: Math.floor(Math.random() * 50000) + 10000,
          totalComments: Math.floor(Math.random() * 5000) + 1000,
          subscriberGrowth: Math.floor(Math.random() * 1000) + 100,
          topPerformingVideo: videos[0] || null,
          recentPerformance: {
            views: Array.from({ length: 30 }, () => Math.floor(Math.random() * 10000) + 1000),
            watchTime: Array.from({ length: 30 }, () => Math.floor(Math.random() * 500) + 100),
            subscribers: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 10),
            labels: Array.from({ length: 30 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (29 - i));
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            })
          },
          videoPerformance: videos.slice(0, 10).map(video => ({
            video,
            views: parseViewCount(video.views),
            likes: Math.floor(Math.random() * 5000) + 100,
            comments: Math.floor(Math.random() * 500) + 10,
            watchTime: Math.floor(Math.random() * 300) + 60,
            ctr: Math.random() * 10 + 2,
            retention: Math.random() * 40 + 40
          }))
        };
        
        setAnalyticsData(mockAnalytics);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (hours: number): string => {
    if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    return `${hours}h`;
  };

  const StatCard: React.FC<{
    title: string;
    value: string;
    change?: number;
    icon: React.ElementType;
    iconColor: string;
  }> = ({ title, value, change, icon: Icon, iconColor }) => (
    <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {change >= 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
              )}
              {Math.abs(change)}% vs last period
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${iconColor}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const SimpleChart: React.FC<{ data: number[]; labels: string[] }> = ({ data, labels }) => {
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;

    return (
      <div className="h-64 flex items-end space-x-1 p-4">
        {data.map((value, index) => {
          const height = ((value - minValue) / range) * 200 + 20;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="bg-blue-500 dark:bg-blue-400 rounded-t transition-all duration-300 hover:bg-blue-600 dark:hover:bg-blue-300 w-full min-w-[8px]"
                style={{ height: `${height}px` }}
                title={`${labels[index]}: ${formatNumber(value)}`}
              />
              {index % 5 === 0 && (
                <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 transform -rotate-45 origin-left">
                  {labels[index]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded-lg"></div>
            ))}
          </div>
          <div className="h-80 bg-neutral-200 dark:bg-neutral-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-6 text-center">
        <ChartBarIcon className="w-16 h-16 text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
          Analytics Unavailable
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400">
          Unable to load analytics data. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-4 sm:mb-0">
          Channel Analytics
        </h1>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="28d">Last 28 days</option>
            <option value="90d">Last 90 days</option>
            <option value="365d">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Views"
          value={formatNumber(analyticsData.totalViews)}
          change={12.5}
          icon={EyeIcon}
          iconColor="bg-blue-500"
        />
        <StatCard
          title="Watch Time"
          value={formatDuration(analyticsData.totalWatchTime)}
          change={8.3}
          icon={ClockIcon}
          iconColor="bg-green-500"
        />
        <StatCard
          title="Subscribers"
          value={formatNumber(analyticsData.subscriberGrowth)}
          change={-2.1}
          icon={UserGroupIcon}
          iconColor="bg-purple-500"
        />
        <StatCard
          title="Total Videos"
          value={analyticsData.totalVideos.toString()}
          icon={ChartBarIcon}
          iconColor="bg-orange-500"
        />
      </div>

      {/* Performance Chart */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            Performance Overview
          </h2>
          <div className="flex space-x-2">
            {(['views', 'watchTime', 'subscribers'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedMetric === metric
                    ? 'bg-blue-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                }`}
              >
                {metric === 'views' ? 'Views' : metric === 'watchTime' ? 'Watch Time' : 'Subscribers'}
              </button>
            ))}
          </div>
        </div>
        <SimpleChart
          data={analyticsData.recentPerformance[selectedMetric]}
          labels={analyticsData.recentPerformance.labels}
        />
      </div>

      {/* Top Performing Videos */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-6">
          Top Performing Videos
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="text-left py-3 px-4 font-medium text-neutral-700 dark:text-neutral-300">Video</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700 dark:text-neutral-300">Views</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700 dark:text-neutral-300">Likes</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700 dark:text-neutral-300">Comments</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700 dark:text-neutral-300">CTR</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700 dark:text-neutral-300">Retention</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.videoPerformance.map((item) => (
                <tr key={item.video.id} className="border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.video.thumbnailUrl}
                        alt={item.video.title}
                        className="w-16 h-9 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50 truncate">
                          {item.video.title}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {item.video.uploadedAt}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-700 dark:text-neutral-300">
                    {formatNumber(item.views)}
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-700 dark:text-neutral-300">
                    {formatNumber(item.likes)}
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-700 dark:text-neutral-300">
                    {formatNumber(item.comments)}
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-700 dark:text-neutral-300">
                    {item.ctr.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-700 dark:text-neutral-300">
                    {item.retention.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;