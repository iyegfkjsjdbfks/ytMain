import type React from 'react';
import { useState, useEffect } from 'react';

import { ChartBarIcon, EyeIcon, HandThumbUpIcon, ChatBubbleLeftIcon, ShareIcon, ClockIcon, GlobeAltIcon, DevicePhoneMobileIcon, ComputerDesktopIcon, TvIcon } from '@heroicons/react/24/outline';

import { formatDistanceToNow } from '../utils/dateUtils';

interface AnalyticsData {
  videoId: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  views: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  watchTime: number;
  averageViewDuration: number;
  clickThroughRate: number;
  retention: number[];
  demographics: {
    ageGroups: { [key: string]: number };
    genders: { [key: string]: number };
    countries: { [key: string]: number };
  };
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
    tv: number;
  };
  trafficSources: {
    search: number;
    suggested: number;
    external: number;
    direct: number;
    playlist: number;
  };
  revenueData: {
    estimatedRevenue: number;
    rpm: number;
    cpm: number;
    adViews: number;
  };
  engagement: {
    likeRate: number;
    dislikeRate: number;
    commentRate: number;
    shareRate: number;
    subscribeRate: number;
  };
}

interface VideoAnalyticsProps {
  videoId: string;
  className?: string;
}

const VideoAnalytics: React.FC<VideoAnalyticsProps> = ({ videoId, className = '' }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '28d' | '90d' | '365d'>('28d');
  const [activeTab, setActiveTab] = useState<'overview' | 'audience' | 'revenue' | 'engagement'>('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [videoId, timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData = generateMockAnalyticsData(videoId);
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockAnalyticsData = (videoId: string): AnalyticsData => {
    const baseViews = Math.floor(Math.random() * 1000000) + 10000;
    const likes = Math.floor(baseViews * (0.02 + Math.random() * 0.08));
    const dislikes = Math.floor(likes * (0.05 + Math.random() * 0.15));
    const comments = Math.floor(baseViews * (0.001 + Math.random() * 0.01));
    const shares = Math.floor(baseViews * (0.005 + Math.random() * 0.02));
    const watchTime = Math.floor(baseViews * (120 + Math.random() * 300)); // seconds
    const averageViewDuration = 120 + Math.random() * 180;

    return {
      videoId,
      title: `Video Analytics for ${videoId}`,
      thumbnail: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=320&h=180&fit=crop`,
      publishedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      views: baseViews,
      likes,
      dislikes,
      comments,
      shares,
      watchTime,
      averageViewDuration,
      clickThroughRate: 2 + Math.random() * 8,
      retention: generateRetentionData(),
      demographics: {
        ageGroups: {
          '13-17': Math.floor(Math.random() * 15),
          '18-24': Math.floor(Math.random() * 25) + 15,
          '25-34': Math.floor(Math.random() * 30) + 20,
          '35-44': Math.floor(Math.random() * 20) + 15,
          '45-54': Math.floor(Math.random() * 15) + 10,
          '55-64': Math.floor(Math.random() * 10) + 5,
          '65+': Math.floor(Math.random() * 5),
        },
        genders: {
          'Male': 45 + Math.random() * 20,
          'Female': 35 + Math.random() * 20,
          'Other': Math.random() * 5,
        },
        countries: {
          'United States': 25 + Math.random() * 20,
          'India': 15 + Math.random() * 15,
          'United Kingdom': 8 + Math.random() * 10,
          'Canada': 5 + Math.random() * 8,
          'Australia': 3 + Math.random() * 5,
          'Germany': 3 + Math.random() * 5,
          'Other': 20 + Math.random() * 15,
        },
      },
      devices: {
        mobile: 60 + Math.random() * 20,
        desktop: 25 + Math.random() * 15,
        tablet: 8 + Math.random() * 7,
        tv: 2 + Math.random() * 5,
      },
      trafficSources: {
        search: 30 + Math.random() * 20,
        suggested: 25 + Math.random() * 15,
        external: 15 + Math.random() * 10,
        direct: 10 + Math.random() * 10,
        playlist: 5 + Math.random() * 10,
      },
      revenueData: {
        estimatedRevenue: Math.floor(baseViews * (0.001 + Math.random() * 0.005)),
        rpm: 1 + Math.random() * 4,
        cpm: 2 + Math.random() * 8,
        adViews: Math.floor(baseViews * (0.7 + Math.random() * 0.2)),
      },
      engagement: {
        likeRate: (likes / baseViews) * 100,
        dislikeRate: (dislikes / baseViews) * 100,
        commentRate: (comments / baseViews) * 100,
        shareRate: (shares / baseViews) * 100,
        subscribeRate: Math.random() * 2,
      },
    };
  };

  const generateRetentionData = (): number[] => {
    const data = [];
    let retention = 100;
    for (let i = 0; i < 100; i += 5) {
      retention *= (0.85 + Math.random() * 0.1);
      data.push(Math.max(retention, 5));
    }
    return data;
  };

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
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
            ))}
          </div>
          <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <p className="text-neutral-500 dark:text-neutral-400">No analytics data available</p>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Views</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {formatNumber(analyticsData.views)}
              </p>
            </div>
            <EyeIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Watch Time</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {formatDuration(analyticsData.watchTime)}
              </p>
            </div>
            <ClockIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Engagement</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {analyticsData.engagement.likeRate.toFixed(1)}%
              </p>
            </div>
            <HandThumbUpIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">CTR</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {analyticsData.clickThroughRate.toFixed(1)}%
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Retention Graph */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Audience Retention</h3>
        <div className="h-64 flex items-end space-x-1">
          {analyticsData.retention.map((value, index) => (
            <div
              key={index}
              className="bg-blue-500 rounded-t flex-1 transition-all hover:bg-blue-600"
              style={{ height: `${(value / 100) * 100}%` }}
              title={`${(index * 5)}% - ${value.toFixed(1)}% retention`}
             />
          ))}
        </div>
        <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Traffic Sources</h3>
        <div className="space-y-3">
          {Object.entries(analyticsData.trafficSources).map(([source, percentage]) => (
            <div key={source} className="flex items-center justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400 capitalize">{source}</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                   />
                </div>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 w-12">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAudienceTab = () => (
    <div className="space-y-6">
      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Age Groups</h3>
          <div className="space-y-3">
            {Object.entries(analyticsData.demographics.ageGroups).map(([age, percentage]) => (
              <div key={age} className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{age}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                     />
                  </div>
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 w-10">
                    {percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Top Countries</h3>
          <div className="space-y-3">
            {Object.entries(analyticsData.demographics.countries).map(([country, percentage]) => (
              <div key={country} className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{country}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                     />
                  </div>
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 w-10">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Devices */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Device Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <DevicePhoneMobileIcon className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Mobile</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {analyticsData.devices.mobile.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <ComputerDesktopIcon className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Desktop</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {analyticsData.devices.desktop.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <GlobeAltIcon className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Tablet</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {analyticsData.devices.tablet.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <TvIcon className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">TV</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {analyticsData.devices.tv.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRevenueTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Estimated Revenue</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(analyticsData.revenueData.estimatedRevenue)}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">RPM</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatCurrency(analyticsData.revenueData.rpm)}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">CPM</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatCurrency(analyticsData.revenueData.cpm)}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Ad Views</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatNumber(analyticsData.revenueData.adViews)}
          </p>
        </div>
      </div>
    </div>
  );

  const renderEngagementTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Likes</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {formatNumber(analyticsData.likes)}
              </p>
              <p className="text-sm text-green-600">
                {analyticsData.engagement.likeRate.toFixed(2)}% rate
              </p>
            </div>
            <HandThumbUpIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Comments</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {formatNumber(analyticsData.comments)}
              </p>
              <p className="text-sm text-blue-600">
                {analyticsData.engagement.commentRate.toFixed(2)}% rate
              </p>
            </div>
            <ChatBubbleLeftIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Shares</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {formatNumber(analyticsData.shares)}
              </p>
              <p className="text-sm text-purple-600">
                {analyticsData.engagement.shareRate.toFixed(2)}% rate
              </p>
            </div>
            <ShareIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-neutral-50 dark:bg-neutral-900 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Video Analytics</h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Published {formatDistanceToNow(new Date(analyticsData.publishedAt))} ago
            </p>
          </div>

          <div className="flex space-x-2">
            {(['7d', '28d', '90d', '365d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  timeRange === range
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                {range === '7d' ? 'Last 7 days' :
                 range === '28d' ? 'Last 28 days' :
                 range === '90d' ? 'Last 90 days' : 'Last year'}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
          {(['overview', 'audience', 'revenue', 'engagement'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'audience' && renderAudienceTab()}
        {activeTab === 'revenue' && renderRevenueTab()}
        {activeTab === 'engagement' && renderEngagementTab()}
      </div>
    </div>
  );
};

export default VideoAnalytics;