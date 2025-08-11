import React, { useEffect,  useState } from 'react';

import {
  ChartBarIcon,
  EyeIcon,
  ClockIcon,
  UserGroupIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  TvIcon,
} from '@heroicons/react/24/outline';
// Mock chart components since recharts is not available
const ResponsiveContainer = ({ children, width, height }) => (
  <div style={{ width, height }}>{children}</div>
);
const PieChart = ({ children }) => (
  <div className='flex items-center justify-center h-full'>{children}</div>
);
const Pie = ({ data }) => (
  <div className='text-center'>Chart Data: {data?.length || 0} items</div>
);
const Cell = (_props: any) => null;
const Tooltip = (_props: any) => null;
const Legend = (_props: any) => null;
import { dateUtils, numberUtils } from '../../../utils/unifiedUtils';

// Temporary utility functions

interface DashboardStats {
  totalViews;
  totalSubscribers: number;
  totalVideos;
  totalWatchTime: number;
  revenue;
  avgViewDuration: number;
  engagement;
  clickThroughRate: number;
}

interface VideoPerformance {
  id;
  title: string;
  views;
  likes: number;
  comments;
  duration: string;
  publishedAt;
  thumbnail: string;
  revenue;
  watchTime: number;
}

interface AudienceData {
  country;
  percentage: number;
  views: number;
}

interface DeviceData {
  device;
  percentage: number;
  color: string;
}

const DashboardPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>(
    '30d'
  );
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalViews: 0,
    totalSubscribers: 0,
    totalVideos: 0,
    totalWatchTime: 0,
    revenue: 0,
    avgViewDuration: 0,
    engagement: 0,
    clickThroughRate: 0,
  });

  const [topVideos, setTopVideos] = useState<VideoPerformance[]>([]);

  const [audienceData, setAudienceData] = useState<AudienceData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);

  useEffect(() => {
    // Simulate API call
    const fetchDashboardData = async () => {
      setLoading(true);

      // Mock data based on time range
      const mockStats: DashboardStats = {
        totalViews:
          timeRange === '7d'
            ? 125000
            : timeRange === '30d'
              ? 450000
              : timeRange === '90d'
                ? 1200000
                : 5800000,
        totalSubscribers:
          timeRange === '7d'
            ? 1200
            : timeRange === '30d'
              ? 4500
              : timeRange === '90d'
                ? 12000
                : 58000,
        totalVideos: 24,
        totalWatchTime:
          timeRange === '7d'
            ? 8500
            : timeRange === '30d'
              ? 32000
              : timeRange === '90d'
                ? 95000
                : 420000,
        revenue:
          timeRange === '7d'
            ? 850
            : timeRange === '30d'
              ? 3200
              : timeRange === '90d'
                ? 9500
                : 42000,
        avgViewDuration: 4.2,
        engagement: 8.5,
        clickThroughRate: 12.3,
      };

      const mockTopVideos: VideoPerformance[] = [
        {
          id: '1',
          title: 'How to Build a React App from Scratch',
          views: 125000,
          likes: 8500,
          comments: 420,
          duration: '15:32',
          publishedAt: '2024-01-15',
          thumbnail: 'https://picsum.photos/320/180?random=1',
          revenue: 1250,
          watchTime: 95000,
        },
        {
          id: '2',
          title: 'Advanced TypeScript Tips and Tricks',
          views: 89000,
          likes: 6200,
          comments: 310,
          duration: '22:45',
          publishedAt: '2024-01-10',
          thumbnail: 'https://picsum.photos/320/180?random=2',
          revenue: 890,
          watchTime: 78000,
        },
        {
          id: '3',
          title: 'CSS Grid vs Flexbox: Complete Guide',
          views: 67000,
          likes: 4800,
          comments: 250,
          duration: '18:20',
          publishedAt: '2024-01-05',
          thumbnail: 'https://picsum.photos/320/180?random=3',
          revenue: 670,
          watchTime: 58000,
        },
        {
          id: '4',
          title: 'Node.js Performance Optimization',
          views: 54000,
          likes: 3900,
          comments: 180,
          duration: '25:10',
          publishedAt: '2023-12-28',
          thumbnail: 'https://picsum.photos/320/180?random=4',
          revenue: 540,
          watchTime: 45000,
        },
        {
          id: '5',
          title: 'Database Design Best Practices',
          views: 42000,
          likes: 3100,
          comments: 150,
          duration: '20:15',
          publishedAt: '2023-12-20',
          thumbnail: 'https://picsum.photos/320/180?random=5',
          revenue: 420,
          watchTime: 35000,
        },
      ];

      const mockAudienceData: AudienceData[] = [
        { country: 'United States', percentage: 35, views: 157500 },
        { country: 'United Kingdom', percentage: 18, views: 81000 },
        { country: 'Canada', percentage: 12, views: 54000 },
        { country: 'Australia', percentage: 8, views: 36000 },
        { country: 'Germany', percentage: 7, views: 31500 },
        { country: 'India', percentage: 6, views: 27000 },
        { country: 'France', percentage: 5, views: 22500 },
        { country: 'Others', percentage: 9, views: 40500 },
      ];

      const mockDeviceData: DeviceData[] = [
        { device: 'Mobile', percentage: 65, color: '#3B82F6' },
        { device: 'Desktop', percentage: 28, color: '#10B981' },
        { device: 'Tablet', percentage: 5, color: '#F59E0B' },
        { device: 'TV', percentage: 2, color: '#EF4444' },
      ];

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats(mockStats);
      setTopVideos(mockTopVideos);

      setAudienceData(mockAudienceData);
      setDeviceData(mockDeviceData);
      setLoading(false);
    };

    fetchDashboardData();
  }, [timeRange]);

  const formatNumber = (num: any): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };
  const formatDuration = (minutes: any): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatCurrency = (amount: any): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-64 mb-6' />
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='bg-white p-6 rounded-lg shadow'>
                  <div className='h-4 bg-gray-200 rounded w-24 mb-2' />
                  <div className='h-8 bg-gray-200 rounded w-32 mb-2' />
                  <div className='h-3 bg-gray-200 rounded w-16' />
                </div>
              ))}
            </div>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <div className='bg-white p-6 rounded-lg shadow'>
                <div className='h-6 bg-gray-200 rounded w-32 mb-4' />
                <div className='h-64 bg-gray-200 rounded' />
              </div>
              <div className='bg-white p-6 rounded-lg shadow'>
                <div className='h-6 bg-gray-200 rounded w-32 mb-4' />
                <div className='h-64 bg-gray-200 rounded' />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Creator Dashboard
            </h1>
            <p className='text-gray-600'>
              Track your channel's performance and growth
            </p>
          </div>

          {/* Time Range Selector */}
          <div className='flex bg-white rounded-lg shadow-sm border mt-4 sm:mt-0'>
            {(['7d', '30d', '90d', '1y'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                } ${
                  range === '7d'
                    ? 'rounded-l-lg'
                    : range === '1y'
                      ? 'rounded-r-lg'
                      : ''
                }`}
              >
                {range === '7d'
                  ? 'Last 7 days'
                  : range === '30d'
                    ? 'Last 30 days'
                    : range === '90d'
                      ? 'Last 90 days'
                      : 'Last year'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white p-6 rounded-lg shadow-sm border'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Total Views</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {formatNumber(stats.totalViews)}
                </p>
                <p className='text-sm text-green-600 flex items-center mt-1'>
                  <ArrowTrendingUpIcon className='w-4 h-4 mr-1' />
                  +12.5% from last period
                </p>
              </div>
              <div className='p-3 bg-blue-100 rounded-full'>
                <EyeIcon className='w-6 h-6 text-blue-600' />
              </div>
            </div>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-sm border'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Subscribers</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {formatNumber(stats.totalSubscribers)}
                </p>
                <p className='text-sm text-green-600 flex items-center mt-1'>
                  <ArrowTrendingUpIcon className='w-4 h-4 mr-1' />
                  +8.3% from last period
                </p>
              </div>
              <div className='p-3 bg-green-100 rounded-full'>
                <UserGroupIcon className='w-6 h-6 text-green-600' />
              </div>
            </div>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-sm border'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Watch Time</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {formatDuration(stats.totalWatchTime)}
                </p>
                <p className='text-sm text-green-600 flex items-center mt-1'>
                  <ArrowTrendingUpIcon className='w-4 h-4 mr-1' />
                  +15.2% from last period
                </p>
              </div>
              <div className='p-3 bg-purple-100 rounded-full'>
                <ClockIcon className='w-6 h-6 text-purple-600' />
              </div>
            </div>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-sm border'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Revenue</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {formatCurrency(stats.revenue)}
                </p>
                <p className='text-sm text-green-600 flex items-center mt-1'>
                  <ArrowTrendingUpIcon className='w-4 h-4 mr-1' />
                  +22.1% from last period
                </p>
              </div>
              <div className='p-3 bg-yellow-100 rounded-full'>
                <CurrencyDollarIcon className='w-6 h-6 text-yellow-600' />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          {/* Views Over Time */}
          <div className='bg-white p-6 rounded-lg shadow-sm border'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Views Over Time
            </h3>
            <div className='w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center'>
              <p className='text-gray-500'>Views Chart Placeholder</p>
            </div>
          </div>

          {/* Revenue Over Time */}
          <div className='bg-white p-6 rounded-lg shadow-sm border'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Revenue Over Time
            </h3>
            <div className='w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center'>
              <p className='text-gray-500'>Revenue Chart Placeholder</p>
            </div>
          </div>
        </div>

        {/* Audience Analytics */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          {/* Top Countries */}
          <div className='bg-white p-6 rounded-lg shadow-sm border'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Top Countries
            </h3>
            <div className='space-y-4'>
              {audienceData.map((country, index) => (
                <div
                  key={country.country}
                  className='flex items-center justify-between'
                >
                  <div className='flex items-center'>
                    <span className='text-sm font-medium text-gray-900 w-4'>
                      {index + 1}
                    </span>
                    <GlobeAltIcon className='w-4 h-4 text-gray-400 mx-2' />
                    <span className='text-sm text-gray-700'>
                      {country.country}
                    </span>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-24 bg-gray-200 rounded-full h-2 mr-3'>
                      <div
                        className='bg-blue-600 h-2 rounded-full'
                        style={{ width: `${country.percentage}%` }}
                      />
                    </div>
                    <span className='text-sm font-medium text-gray-900 w-8'>
                      {country.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device Breakdown */}
          <div className='bg-white p-6 rounded-lg shadow-sm border'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Device Breakdown
            </h3>
            <ResponsiveContainer width='100%' height={250}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx='50%'
                  cy='50%'
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey='percentage'
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: string | number) => [`${value}%`, 'Usage']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className='grid grid-cols-2 gap-4 mt-4'>
              {deviceData.map(device => {
                const Icon =
                  device.device === 'Mobile'
                    ? DevicePhoneMobileIcon
                    : device.device === 'Desktop'
                      ? ComputerDesktopIcon
                      : device.device === 'TV'
                        ? TvIcon
                        : DevicePhoneMobileIcon;
                return (
                  <div key={device.device} className='flex items-center'>
                    <Icon
                      className='w-4 h-4 mr-2'
                      style={{ color: device.color }}
                    />
                    <span className='text-sm text-gray-700'>
                      {device.device}: {device.percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Performing Videos */}
        <div className='bg-white rounded-lg shadow-sm border'>
          <div className='p-6 border-b border-gray-200'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Top Performing Videos
            </h3>
            <p className='text-sm text-gray-600 mt-1'>
              Your best videos from the selected time period
            </p>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Video
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Views
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Engagement
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Watch Time
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Revenue
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Published
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {topVideos.map(video => (
                  <tr key={video.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-16 w-24'>
                          <img
                            className='h-16 w-24 rounded object-cover'
                            src={video.thumbnail}
                            alt={video.title}
                          />
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900 max-w-xs truncate'>
                            {video.title}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {video.duration}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <EyeIcon className='w-4 h-4 text-gray-400 mr-1' />
                        <span className='text-sm text-gray-900'>
                          {formatNumber(video.views)}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center space-x-3'>
                        <div className='flex items-center'>
                          <HeartIcon className='w-4 h-4 text-red-400 mr-1' />
                          <span className='text-sm text-gray-900'>
                            {formatNumber(video.likes)}
                          </span>
                        </div>
                        <div className='flex items-center'>
                          <ChatBubbleLeftIcon className='w-4 h-4 text-blue-400 mr-1' />
                          <span className='text-sm text-gray-900'>
                            {formatNumber(video.comments)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <ClockIcon className='w-4 h-4 text-gray-400 mr-1' />
                        <span className='text-sm text-gray-900'>
                          {formatDuration(video.watchTime)}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <CurrencyDollarIcon className='w-4 h-4 text-green-400 mr-1' />
                        <span className='text-sm text-gray-900'>
                          {formatCurrency(video.revenue)}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <CalendarDaysIcon className='w-4 h-4 text-gray-400 mr-1' />
                        <span className='text-sm text-gray-900'>
                          {new Date(video.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
          <div className='bg-white p-6 rounded-lg shadow-sm border'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Avg. View Duration
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.avgViewDuration} min
                </p>
              </div>
              <div className='p-3 bg-indigo-100 rounded-full'>
                <ClockIcon className='w-6 h-6 text-indigo-600' />
              </div>
            </div>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-sm border'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Engagement Rate
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.engagement}%
                </p>
              </div>
              <div className='p-3 bg-pink-100 rounded-full'>
                <HeartIcon className='w-6 h-6 text-pink-600' />
              </div>
            </div>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-sm border'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Click-through Rate
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.clickThroughRate}%
                </p>
              </div>
              <div className='p-3 bg-orange-100 rounded-full'>
                <ChartBarIcon className='w-6 h-6 text-orange-600' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;


