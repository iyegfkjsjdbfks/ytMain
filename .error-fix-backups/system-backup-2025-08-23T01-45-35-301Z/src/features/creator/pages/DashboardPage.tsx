import React, { useEffect, useState, FC } from 'react';
import type { Video } from '../types';
import { ChartBarIcon, EyeIcon, ClockIcon, UserGroupIcon, HeartIcon, ChatBubbleLeftIcon, ArrowTrendingUpIcon, CalendarDaysIcon, CurrencyDollarIcon, GlobeAltIcon, DevicePhoneMobileIcon, ComputerDesktopIcon, TvIcon } from '@heroicons / react / 24 / outline';
// Mock chart components since recharts is not available
const ResponsiveContainer = ({ children: any, width: string | number, height }: any) => (
 <div style={{ width, height }}>{children}</div>
);
const PieChart = ({ children }: any) => (
 <div className='flex items - center justify - center h - full'>{children}</div>
);
const Pie = ({ data }: any) => (
 <div className='text - center'>Chart Data: {data?.length || 0} items</div>
);
const Cell = (_props: any) => null;
const Tooltip = (_props: any) => null;
const Legend = (_props: any) => null;
import { dateUtils, numberUtils } from '../../../utils / unifiedUtils';

// Temporary utility functions

interface DashboardStats {}
 totalViews;
 totalSubscribers: number;
 totalVideos;
 totalWatchTime: number;
 revenue;
 avgViewDuration: number;
 engagement;
 clickThroughRate: number
}

interface VideoPerformance {}
 id;
 title: string;
 views;
 likes: number;
 comments;
 duration: string;
 publishedAt;
 thumbnail: string;
 revenue;
 watchTime: number
}

interface AudienceData {}
 country;
 percentage: number;,
 views: number
}

interface DeviceData {}
 device;
 percentage: number;,
 color: string
}

const DashboardPage: React.FC = () => {}
 return null;
 const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>(
 '30d'
 );
 const [loading, setLoading] = useState < boolean>(true);
 const [stats, setStats] = useState < DashboardStats>({}
 totalViews: 0,
 totalSubscribers: 0,
 totalVideos: 0,
 totalWatchTime: 0,
 revenue: 0,
 avgViewDuration: 0,
 engagement: 0,
 clickThroughRate: 0 });

 const [topVideos, setTopVideos] = useState < VideoPerformance[]>([]);

 const [audienceData, setAudienceData] = useState < AudienceData[]>([]);
 const [deviceData, setDeviceData] = useState < DeviceData[]>([]);

 useEffect(() => {}
 // Simulate API call
 const fetchDashboardData = async (): Promise<any> < void> => {}
 setLoading(true);

 // Mock data based on time range
 const mockStats: DashboardStats = {,}
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
 clickThroughRate: 12.3 };

 const mockTopVideos: VideoPerformance[] = [;
 {}
 id: '1',
 title: 'How to Build a React App from Scratch',
 views: 125000,
 likes: 8500,
 comments: 420,
 duration: '15:32',
 publishedAt: '2024 - 01 - 15',
 thumbnail: 'https://picsum.photos / 320 / 180?random = 1',
 revenue: 1250,
 watchTime: 95000 },
 {}
 id: '2',
 title: 'Advanced TypeScript Tips and Tricks',
 views: 89000,
 likes: 6200,
 comments: 310,
 duration: '22:45',
 publishedAt: '2024 - 01 - 10',
 thumbnail: 'https://picsum.photos / 320 / 180?random = 2',
 revenue: 890,
 watchTime: 78000 },
 {}
 id: '3',
 title: 'CSS Grid vs Flexbox: Complete Guide',
 views: 67000,
 likes: 4800,
 comments: 250,
 duration: '18:20',
 publishedAt: '2024 - 01 - 05',
 thumbnail: 'https://picsum.photos / 320 / 180?random = 3',
 revenue: 670,
 watchTime: 58000 },
 {}
 id: '4',
 title: 'Node.js Performance Optimization',
 views: 54000,
 likes: 3900,
 comments: 180,
 duration: '25:10',
 publishedAt: '2023 - 12 - 28',
 thumbnail: 'https://picsum.photos / 320 / 180?random = 4',
 revenue: 540,
 watchTime: 45000 },
 {}
 id: '5',
 title: 'Database Design Best Practices',
 views: 42000,
 likes: 3100,
 comments: 150,
 duration: '20:15',
 publishedAt: '2023 - 12 - 20',
 thumbnail: 'https://picsum.photos / 320 / 180?random = 5',
 revenue: 420,
 watchTime: 35000 }];

 const mockAudienceData: AudienceData[] = [;
 { country: 'United States',}
 percentage: 35, views: 157500 },
 { country: 'United Kingdom',}
 percentage: 18, views: 81000 },
 { country: 'Canada',}
 percentage: 12, views: 54000 },
 { country: 'Australia',}
 percentage: 8, views: 36000 },
 { country: 'Germany',}
 percentage: 7, views: 31500 },
 { country: 'India',}
 percentage: 6, views: 27000 },
 { country: 'France',}
 percentage: 5, views: 22500 },
 { country: 'Others',}
 percentage: 9, views: 40500 }];

 const mockDeviceData: DeviceData[] = [;
 { device: 'Mobile',}
 percentage: 65, color: '#3B82F6' },
 { device: 'Desktop',}
 percentage: 28, color: '#10B981' },
 { device: 'Tablet',}
 percentage: 5, color: '#F59E0B' },
 { device: 'TV',}
 percentage: 2, color: '#EF4444' }];

 // Simulate loading delay
 await new Promise<any>(resolve => setTimeout((resolve) as any, 1000));

 setStats(mockStats);
 setTopVideos(mockTopVideos);

 setAudienceData(mockAudienceData);
 setDeviceData(mockDeviceData);
 setLoading(false);
 };

 fetchDashboardData();
 }, [timeRange]);

 const formatNumber = (num): (string) => {}
 if (num >= 1000000) {}
 return `${(num / 1000000).toFixed(1)}M`;
 }
 if (num >= 1000) {}
 return `${(num / 1000).toFixed(1)}K`;
 }
 return num.toString();
 };
 const formatDuration = (minutes): (string) => {}
 const hours = Math.floor(minutes / 60);
 const mins = minutes % 60;
 return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
 };

 const formatCurrency = (amount): (string) => {}
 return new Intl.NumberFormat('en - US', {}
 style: 'currency',
 currency: 'USD' }).format(amount);
 };

 if (loading as any) {}
 return (
 <div className='min - h-screen bg - gray - 50 p - 6'>
 <div className='max - w-7xl mx - auto'>
 <div className='animate - pulse'>
 <div className='h - 8 bg - gray - 200 rounded w - 64 mb - 6' />
 <div className='grid grid - cols - 1 md:grid - cols - 2 lg:grid - cols - 4 gap - 6 mb - 8'>
 {Array<any>.from({ length: 4 }).map((_, i) => (
 <div key={i} className='bg - white p - 6 rounded - lg shadow'>
 <div className='h - 4 bg - gray - 200 rounded w - 24 mb - 2' />
 <div className='h - 8 bg - gray - 200 rounded w - 32 mb - 2' />
 <div className='h - 3 bg - gray - 200 rounded w - 16' />
// FIXED:  </div>
 ))}
// FIXED:  </div>
 <div className='grid grid - cols - 1 lg:grid - cols - 2 gap - 6'>
 <div className='bg - white p - 6 rounded - lg shadow'>
 <div className='h - 6 bg - gray - 200 rounded w - 32 mb - 4' />
 <div className='h - 64 bg - gray - 200 rounded' />
// FIXED:  </div>
 <div className='bg - white p - 6 rounded - lg shadow'>
 <div className='h - 6 bg - gray - 200 rounded w - 32 mb - 4' />
 <div className='h - 64 bg - gray - 200 rounded' />
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
 }

 return (
 <div className='min - h-screen bg - gray - 50 p - 6'>
 <div className='max - w-7xl mx - auto'>
 {/* Header */}
 <div className='flex flex - col sm:flex - row justify - between items - start sm:items - center mb - 8'>
 <div>
 <h1 className='text - 3xl font - bold text - gray - 900 mb - 2'>
 Creator Dashboard
// FIXED:  </h1>
 <p className='text - gray - 600'>
 Track your channel's performance and growth
// FIXED:  </p>
// FIXED:  </div>

 {/* Time Range Selector */}
 <div className='flex bg - white rounded - lg shadow - sm border mt - 4 sm:mt - 0'>
 {(['7d', '30d', '90d', '1y'] as const).map((range) => (}
 <button
 key={range} />
// FIXED:  onClick={() => setTimeRange(range: React.MouseEvent)}
// FIXED:  className={`px - 4 py - 2 text - sm font - medium transition - colors ${}
 timeRange === range
 ? 'bg - red - 600 text - white'
 : 'text - gray - 700 hover:text - red - 600 hover:bg - gray - 50'
 } ${}
 range === '7d'
 ? 'rounded - l-lg'
 : range === '1y'
 ? 'rounded - r-lg'
 : ''
 }`}
 >
 {range === '7d'}
 ? 'Last 7 days'
 : range === '30d'
 ? 'Last 30 days'
 : range === '90d'
 ? 'Last 90 days'
 : 'Last year'}
// FIXED:  </button>
 ))}
// FIXED:  </div>
// FIXED:  </div>

 {/* Key Metrics */}
 <div className='grid grid - cols - 1 md:grid - cols - 2 lg:grid - cols - 4 gap - 6 mb - 8'>
 <div className='bg - white p - 6 rounded - lg shadow - sm border'>
 <div className='flex items - center justify - between'>
 <div>
 <p className='text - sm font - medium text - gray - 600'>Total Views</p>
 <p className='text - 2xl font - bold text - gray - 900'>
 {formatNumber(stats.totalViews)}
// FIXED:  </p>
 <p className='text - sm text - green - 600 flex items - center mt - 1'>
 <ArrowTrendingUpIcon className='w - 4 h - 4 mr - 1' />
 +12.5% from last period
// FIXED:  </p>
// FIXED:  </div>
 <div className='p - 3 bg - blue - 100 rounded - full'>
 <EyeIcon className='w - 6 h - 6 text - blue - 600' />
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 <div className='bg - white p - 6 rounded - lg shadow - sm border'>
 <div className='flex items - center justify - between'>
 <div>
 <p className='text - sm font - medium text - gray - 600'>Subscribers</p>
 <p className='text - 2xl font - bold text - gray - 900'>
 {formatNumber(stats.totalSubscribers)}
// FIXED:  </p>
 <p className='text - sm text - green - 600 flex items - center mt - 1'>
 <ArrowTrendingUpIcon className='w - 4 h - 4 mr - 1' />
 +8.3% from last period
// FIXED:  </p>
// FIXED:  </div>
 <div className='p - 3 bg - green - 100 rounded - full'>
 <UserGroupIcon className='w - 6 h - 6 text - green - 600' />
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 <div className='bg - white p - 6 rounded - lg shadow - sm border'>
 <div className='flex items - center justify - between'>
 <div>
 <p className='text - sm font - medium text - gray - 600'>Watch Time</p>
 <p className='text - 2xl font - bold text - gray - 900'>
 {formatDuration(stats.totalWatchTime)}
// FIXED:  </p>
 <p className='text - sm text - green - 600 flex items - center mt - 1'>
 <ArrowTrendingUpIcon className='w - 4 h - 4 mr - 1' />
 +15.2% from last period
// FIXED:  </p>
// FIXED:  </div>
 <div className='p - 3 bg - purple - 100 rounded - full'>
 <ClockIcon className='w - 6 h - 6 text - purple - 600' />
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 <div className='bg - white p - 6 rounded - lg shadow - sm border'>
 <div className='flex items - center justify - between'>
 <div>
 <p className='text - sm font - medium text - gray - 600'>Revenue</p>
 <p className='text - 2xl font - bold text - gray - 900'>
 {formatCurrency(stats.revenue)}
// FIXED:  </p>
 <p className='text - sm text - green - 600 flex items - center mt - 1'>
 <ArrowTrendingUpIcon className='w - 4 h - 4 mr - 1' />
 +22.1% from last period
// FIXED:  </p>
// FIXED:  </div>
 <div className='p - 3 bg - yellow - 100 rounded - full'>
 <CurrencyDollarIcon className='w - 6 h - 6 text - yellow - 600' />
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 {/* Charts Section */}
 <div className='grid grid - cols - 1 lg:grid - cols - 2 gap - 6 mb - 8'>
 {/* Views Over Time */}
 <div className='bg - white p - 6 rounded - lg shadow - sm border'>
 <h3 className='text - lg font - semibold text - gray - 900 mb - 4'>
 Views Over Time
// FIXED:  </h3>
 <div className='w - full h-[300px] bg - gray - 100 rounded - lg flex items - center justify - center'>
 <p className='text - gray - 500'>Views Chart Placeholder</p>
// FIXED:  </div>
// FIXED:  </div>

 {/* Revenue Over Time */}
 <div className='bg - white p - 6 rounded - lg shadow - sm border'>
 <h3 className='text - lg font - semibold text - gray - 900 mb - 4'>
 Revenue Over Time
// FIXED:  </h3>
 <div className='w - full h-[300px] bg - gray - 100 rounded - lg flex items - center justify - center'>
 <p className='text - gray - 500'>Revenue Chart Placeholder</p>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 {/* Audience Analytics */}
 <div className='grid grid - cols - 1 lg:grid - cols - 2 gap - 6 mb - 8'>
 {/* Top Countries */}
 <div className='bg - white p - 6 rounded - lg shadow - sm border'>
 <h3 className='text - lg font - semibold text - gray - 900 mb - 4'>
 Top Countries
// FIXED:  </h3>
 <div className='space - y-4'>
 {audienceData.map((country, index) => (}
 <div
 key={country.country}
// FIXED:  className='flex items - center justify - between' />
 >
 <div className='flex items - center'>
 <span className='text - sm font - medium text - gray - 900 w - 4'>
 {index + 1}
// FIXED:  </span>
 <GlobeAltIcon className='w - 4 h - 4 text - gray - 400 mx - 2' />
 <span className='text - sm text - gray - 700'>
 {country.country}
// FIXED:  </span>
// FIXED:  </div>
 <div className='flex items - center'>
 <div className='w - 24 bg - gray - 200 rounded - full h - 2 mr - 3'>
 <div
// FIXED:  className='bg - blue - 600 h - 2 rounded - full'
// FIXED:  style={{ width: `${country.percentage}%` } />
 />
// FIXED:  </div>
<span className='text - sm font - medium text - gray - 900 w - 8'>
 {country.percentage}%
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </div>
 ))}
// FIXED:  </div>
// FIXED:  </div>

 {/* Device Breakdown */}
 <div className='bg - white p - 6 rounded - lg shadow - sm border'>
 <h3 className='text - lg font - semibold text - gray - 900 mb - 4'>
 Device Breakdown
// FIXED:  </h3>
 <ResponsiveContainer width='100%' height={250}>
 <PieChart>
 <Pie
 data={deviceData}
 cx='50%'
 cy='50%'
 innerRadius={60}
 outerRadius={100}
 paddingAngle={5}
 dataKey='percentage' />
 >
 {deviceData.map((entry, index) => (}
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
// FIXED:  </Pie>
 <Tooltip />
 formatter={(value: string | number) => [`${value}%`, 'Usage']}
 />
 <Legend />
// FIXED:  </PieChart>
// FIXED:  </ResponsiveContainer>
 <div className='grid grid - cols - 2 gap - 4 mt - 4'>
 {deviceData.map((device) => {}
 const Icon =;
 device.device === 'Mobile'
 ? DevicePhoneMobileIcon
 : device.device === 'Desktop'
 ? ComputerDesktopIcon
 : device.device === 'TV'
 ? TvIcon
 : DevicePhoneMobileIcon;
 return (
 <div key={device.device} className='flex items - center'>
 <Icon
// FIXED:  className='w - 4 h - 4 mr - 2'
// FIXED:  style={{ color: device.color } />
 />
 <span className='text - sm text - gray - 700'>
 {device.device}: {device.percentage}%
// FIXED:  </span>
// FIXED:  </div>
 );
 })}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 {/* Top Performing Videos */}
 <div className='bg - white rounded - lg shadow - sm border'>
 <div className='p - 6 border - b border - gray - 200'>
 <h3 className='text - lg font - semibold text - gray - 900'>
 Top Performing Videos
// FIXED:  </h3>
 <p className='text - sm text - gray - 600 mt - 1'>
 Your best videos from the selected time period
// FIXED:  </p>
// FIXED:  </div>
 <div className='overflow - x-auto'>
 <table className='min - w-full divide - y divide - gray - 200'>
 <thead className='bg - gray - 50'>
 <tr>
 <th className='px - 6 py - 3 text - left text - xs font - medium text - gray - 500 uppercase tracking - wider'>
 Video
// FIXED:  </th>
 <th className='px - 6 py - 3 text - left text - xs font - medium text - gray - 500 uppercase tracking - wider'>
 Views
// FIXED:  </th>
 <th className='px - 6 py - 3 text - left text - xs font - medium text - gray - 500 uppercase tracking - wider'>
 Engagement
// FIXED:  </th>
 <th className='px - 6 py - 3 text - left text - xs font - medium text - gray - 500 uppercase tracking - wider'>
 Watch Time
// FIXED:  </th>
 <th className='px - 6 py - 3 text - left text - xs font - medium text - gray - 500 uppercase tracking - wider'>
 Revenue
// FIXED:  </th>
 <th className='px - 6 py - 3 text - left text - xs font - medium text - gray - 500 uppercase tracking - wider'>
 Published
// FIXED:  </th>
// FIXED:  </tr>
// FIXED:  </thead>
 <tbody className='bg - white divide - y divide - gray - 200'>
 {topVideos.map((video) => (}
 <tr key={video.id} className='hover:bg - gray - 50'>
 <td className='px - 6 py - 4 whitespace - nowrap'>
 <div className='flex items - center'>
 <div className='flex - shrink - 0 h - 16 w - 24'>
 <img
// FIXED:  className='h - 16 w - 24 rounded object - cover'
// FIXED:  src={video.thumbnail}
// FIXED:  alt={video.title} />
 />
// FIXED:  </div>
 <div className='ml - 4'>
 <div className='text - sm font - medium text - gray - 900 max - w-xs truncate'>
 {video.title}
// FIXED:  </div>
<div className='text - sm text - gray - 500'>
 {video.duration}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </td>
 <td className='px - 6 py - 4 whitespace - nowrap'>
 <div className='flex items - center'>
 <EyeIcon className='w - 4 h - 4 text - gray - 400 mr - 1' />
 <span className='text - sm text - gray - 900'>
 {formatNumber(video.views)}
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </td>
 <td className='px - 6 py - 4 whitespace - nowrap'>
 <div className='flex items - center space - x-3'>
 <div className='flex items - center'>
 <HeartIcon className='w - 4 h - 4 text - red - 400 mr - 1' />
 <span className='text - sm text - gray - 900'>
 {formatNumber(video.likes)}
// FIXED:  </span>
// FIXED:  </div>
 <div className='flex items - center'>
 <ChatBubbleLeftIcon className='w - 4 h - 4 text - blue - 400 mr - 1' />
 <span className='text - sm text - gray - 900'>
 {formatNumber(video.comments)}
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </td>
 <td className='px - 6 py - 4 whitespace - nowrap'>
 <div className='flex items - center'>
 <ClockIcon className='w - 4 h - 4 text - gray - 400 mr - 1' />
 <span className='text - sm text - gray - 900'>
 {formatDuration(video.watchTime)}
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </td>
 <td className='px - 6 py - 4 whitespace - nowrap'>
 <div className='flex items - center'>
 <CurrencyDollarIcon className='w - 4 h - 4 text - green - 400 mr - 1' />
 <span className='text - sm text - gray - 900'>
 {formatCurrency(video.revenue)}
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </td>
 <td className='px - 6 py - 4 whitespace - nowrap'>
 <div className='flex items - center'>
 <CalendarDaysIcon className='w - 4 h - 4 text - gray - 400 mr - 1' />
 <span className='text - sm text - gray - 900'>
 {new Date(video.publishedAt).toLocaleDateString()}
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </td>
// FIXED:  </tr>
 ))}
// FIXED:  </tbody>
// FIXED:  </table>
// FIXED:  </div>
// FIXED:  </div>

 {/* Additional Metrics */}
 <div className='grid grid - cols - 1 md:grid - cols - 3 gap - 6 mt - 8'>
 <div className='bg - white p - 6 rounded - lg shadow - sm border'>
 <div className='flex items - center justify - between'>
 <div>
 <p className='text - sm font - medium text - gray - 600'>
 Avg. View Duration
// FIXED:  </p>
 <p className='text - 2xl font - bold text - gray - 900'>
 {stats.avgViewDuration} min
// FIXED:  </p>
// FIXED:  </div>
 <div className='p - 3 bg - indigo - 100 rounded - full'>
 <ClockIcon className='w - 6 h - 6 text - indigo - 600' />
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 <div className='bg - white p - 6 rounded - lg shadow - sm border'>
 <div className='flex items - center justify - between'>
 <div>
 <p className='text - sm font - medium text - gray - 600'>
 Engagement Rate
// FIXED:  </p>
 <p className='text - 2xl font - bold text - gray - 900'>
 {stats.engagement}%
// FIXED:  </p>
// FIXED:  </div>
 <div className='p - 3 bg - pink - 100 rounded - full'>
 <HeartIcon className='w - 6 h - 6 text - pink - 600' />
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 <div className='bg - white p - 6 rounded - lg shadow - sm border'>
 <div className='flex items - center justify - between'>
 <div>
 <p className='text - sm font - medium text - gray - 600'>
 Click - through Rate
// FIXED:  </p>
 <p className='text - 2xl font - bold text - gray - 900'>
 {stats.clickThroughRate}%
// FIXED:  </p>
// FIXED:  </div>
 <div className='p - 3 bg - orange - 100 rounded - full'>
 <ChartBarIcon className='w - 6 h - 6 text - orange - 600' />
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default DashboardPage;
