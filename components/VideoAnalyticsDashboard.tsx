import * as React from 'react';
import {  useState  } from 'react';
import {
  ClockIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export interface VideoAnalytics {
  videoId: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  
  // Core metrics
  views: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  subscribers: number;
  
  // Engagement metrics
  averageViewDuration: number; // in seconds
  totalWatchTime: number; // in seconds
  clickThroughRate: number; // percentage
  engagementRate: number; // percentage
  
  // Time series data
  viewsOverTime: Array<{ date: string; views: number }>;
  watchTimeOverTime: Array<{ date: string; watchTime: number }>;
  
  // Demographics
  ageGroups: Array<{ range: string; percentage: number }>;
  genderDistribution: Array<{ gender: string; percentage: number }>;
  topCountries: Array<{ country: string; views: number; percentage: number }>;
  
  // Device/Platform data
  deviceTypes: Array<{ device: string; percentage: number }>;
  trafficSources: Array<{ source: string; percentage: number }>;
  
  // Revenue (if monetized)
  revenue?: {
    total: number;
    rpm: number; // Revenue per mille
    cpm: number; // Cost per mille
  };
}

interface VideoAnalyticsDashboardProps {
  analytics: VideoAnalytics;
  timeRange: '7d' | '28d' | '90d' | '365d';
  onTimeRangeChange: (range: '7d' | '28d' | '90d' | '365d') => void;
  className?: string;
}

const VideoAnalyticsDashboard: React.FC<VideoAnalyticsDashboardProps> = ({
  analytics,
  timeRange,
  onTimeRangeChange,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'audience' | 'engagement' | 'revenue'>('overview');

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Chart configurations
  const viewsChartData = {
    labels: analytics.viewsOverTime.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Views',
        data: analytics.viewsOverTime.map(d => d.views),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const watchTimeChartData = {
    labels: analytics.watchTimeOverTime.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Watch Time (hours)',
        data: analytics.watchTimeOverTime.map(d => d.watchTime / 3600),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const deviceChartData = {
    labels: analytics.deviceTypes.map(d => d.device),
    datasets: [
      {
        data: analytics.deviceTypes.map(d => d.percentage),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const trafficSourcesChartData = {
    labels: analytics.trafficSources.map(d => d.source),
    datasets: [
      {
        data: analytics.trafficSources.map(d => d.percentage),
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Video Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start space-x-4">
          <img
            src={analytics.thumbnail}
            alt={analytics.title}
            className="w-32 h-18 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {analytics.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Published {new Date(analytics.publishedAt).toLocaleDateString()}
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(analytics.views)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatDuration(analytics.totalWatchTime)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Watch time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.engagementRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(analytics.subscribers)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Subscribers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { value: '7d', label: '7 days' },
            { value: '28d', label: '28 days' },
            { value: '90d', label: '90 days' },
            { value: '365d', label: '1 year' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => onTimeRangeChange(option.value as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === option.value
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { value: 'overview', label: 'Overview' },
            { value: 'audience', label: 'Audience' },
            { value: 'engagement', label: 'Engagement' },
            ...(analytics.revenue ? [{ value: 'revenue', label: 'Revenue' }] : []),
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Views Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Views over time
            </h3>
            <div className="h-64">
              <Line data={viewsChartData} options={chartOptions} />
            </div>
          </div>

          {/* Watch Time Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Watch time over time
            </h3>
            <div className="h-64">
              <Line data={watchTimeChartData} options={chartOptions} />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <HeartIcon className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Likes</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(analytics.likes)}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <ChatBubbleLeftIcon className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Comments</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(analytics.comments)}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <ShareIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Shares</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(analytics.shares)}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <ClockIcon className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Duration</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatDuration(analytics.averageViewDuration)}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audience' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Device Types */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Device types
            </h3>
            <div className="h-64">
              <Doughnut data={deviceChartData} options={doughnutOptions} />
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Traffic sources
            </h3>
            <div className="h-64">
              <Doughnut data={trafficSourcesChartData} options={doughnutOptions} />
            </div>
          </div>

          {/* Top Countries */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top countries
            </h3>
            <div className="space-y-3">
              {analytics.topCountries.slice(0, 5).map((country, index) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      #{index + 1}
                    </span>
                    <span className="text-gray-900 dark:text-white">{country.country}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatNumber(country.views)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {country.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demographics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Age groups
            </h3>
            <div className="space-y-3">
              {analytics.ageGroups.map((group) => (
                <div key={group.range} className="flex items-center justify-between">
                  <span className="text-gray-900 dark:text-white">{group.range}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${group.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                      {group.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'engagement' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Engagement Metrics */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">CTR</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.clickThroughRate.toFixed(2)}%
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Click-through rate
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <ClockIcon className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Retention</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {((analytics.averageViewDuration / 600) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Average view duration
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <HeartIcon className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Like ratio</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {((analytics.likes / (analytics.likes + analytics.dislikes)) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Likes vs dislikes
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && analytics.revenue && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <ChartBarIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(analytics.revenue.total)}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">RPM</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(analytics.revenue.rpm)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Revenue per mille
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <EyeIcon className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">CPM</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(analytics.revenue.cpm)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Cost per mille
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoAnalyticsDashboard;
