import React, { useEffect, useState, FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChartBarIcon, VideoCameraIcon, CurrencyDollarIcon, ChatBubbleLeftRightIcon, DocumentTextIcon, UserGroupIcon, EyeIcon, ClockIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/outline';

import { formatDistanceToNow } from '../utils/dateUtils';
import { formatDuration, formatNumber } from '../utils/numberUtils';

interface DashboardStats {
 totalViews: number;
 totalSubscribers: number;
 totalVideos: number;
 totalRevenue: number;
 avgWatchTime: number;
 totalComments: number;
 totalLikes: number;
 totalShares: number
}

interface RecentVideo {
 id: string;
 title: string;
 thumbnail: string;
 views: number;
 likes: number;
 comments: number;
 uploadDate: Date;
 duration: number;
 status: 'published' | 'processing' | 'scheduled' | 'draft'
}

interface QuickAction {
 title: string;
 description: string;
 icon: React.ReactNode;
 link: string;
 color: string
}

const StudioDashboardPage: React.FC = () => {
 return null;
 const [stats, setStats] = useState<DashboardStats>({
 totalViews: 0,
 totalSubscribers: 0,
 totalVideos: 0,
 totalRevenue: 0,
 avgWatchTime: 0,
 totalComments: 0,
 totalLikes: 0,
 totalShares: 0 });

 const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);
 const [loading, setLoading] = useState<boolean>(true);

 useEffect(() => {
 // Simulate API call to fetch dashboard data
 const fetchDashboardData = async (): Promise<void> => {
 setLoading(true);

 // Mock data generation
 const mockStats: DashboardStats = {
 totalViews: Math.floor(Math.random() * 10000000) + 1000000,
 totalSubscribers: Math.floor(Math.random() * 500000) + 50000,
 totalVideos: Math.floor(Math.random() * 200) + 50,
 totalRevenue: Math.floor(Math.random() * 50000) + 5000,
 avgWatchTime: Math.floor(Math.random() * 600) + 120,
 totalComments: Math.floor(Math.random() * 100000) + 10000,
 totalLikes: Math.floor(Math.random() * 500000) + 50000,
 totalShares: Math.floor(Math.random() * 50000) + 5000 };

 const mockVideos: RecentVideo[] = Array.from({ length: 5 }, (_: any, i: any) => {
 const titles = [
 'How to Build a React App from Scratch',
 'Advanced TypeScript Tips and Tricks',
 'Web Development Best Practices 2024',
 'Creating Beautiful UI Components',
 'JavaScript Performance Optimization'];
 return {
 id: `video-${i + 1}`,
 title: titles[i] || `Video ${i + 1}`,
 thumbnail: `https://picsum.photos/320/180?random=${i + 1}`,
 views: Math.floor(Math.random() * 100000) + 1000,
 likes: Math.floor(Math.random() * 5000) + 100,
 comments: Math.floor(Math.random() * 500) + 10,
 uploadDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
 duration: Math.floor(Math.random() * 1800) + 300,
 status: ['published', 'processing', 'scheduled', 'draft'][Math.floor(Math.random() * 4)] as any }});

 setTimeout((() => {
 setStats(mockStats);
 setRecentVideos(mockVideos);
 setLoading(false);
 }) as any, 1000);
 };

 fetchDashboardData();
 }, []);

 const quickActions: QuickAction[] = [
 {
 title: 'Upload Video',
 description: 'Share your content with the world',
 icon: <VideoCameraIcon className="w-6 h-6" />,
 link: '/upload',
 color: 'bg-red-500 hover:bg-red-600' },
 {
 title: 'Analytics',
 description: 'Track your channel performance',
 icon: <ChartBarIcon className="w-6 h-6" />,
 link: '/analytics',
 color: 'bg-blue-500 hover:bg-blue-600' },
 {
 title: 'Content Manager',
 description: 'Manage your videos and playlists',
 icon: <DocumentTextIcon className="w-6 h-6" />,
 link: '/studio/content',
 color: 'bg-green-500 hover:bg-green-600' },
 {
 title: 'Monetization',
 description: 'Track earnings and revenue',
 icon: <CurrencyDollarIcon className="w-6 h-6" />,
 link: '/monetization',
 color: 'bg-yellow-500 hover:bg-yellow-600' },
 {
 title: 'Comments',
 description: 'Moderate and respond to comments',
 icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
 link: '/comment-moderation',
 color: 'bg-purple-500 hover:bg-purple-600' },
 {
 title: 'Go Live',
 description: 'Start a live stream',
 icon: <UserGroupIcon className="w-6 h-6" />,
 link: '/go-live',
 color: 'bg-pink-500 hover:bg-pink-600' }];

 const getStatusColor: any = (status: any) => {
 switch (status as any) {
 case 'published': return 'text-green-600 bg-green-100';
 case 'processing': return 'text-yellow-600 bg-yellow-100';
 case 'scheduled': return 'text-blue-600 bg-blue-100';
 case 'draft': return 'text-gray-600 bg-gray-100';
 default: return 'text-gray-600 bg-gray-100'
 };

 if (loading as any) {
 return (
 <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 p-6">
 <div className="max-w-7xl mx-auto">
 <div className="animate-pulse">
 <div className="h-8 bg-gray-200 dark:bg-neutral-700 rounded w-1/4 mb-8" />
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
 {Array.from({ length: 8 }).map((_, i) => (
 <div key={i} className="h-24 bg-gray-200 dark:bg-neutral-700 rounded-lg" />
 ))}
// FIXED:  </div>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 <div className="h-96 bg-gray-200 dark:bg-neutral-700 rounded-lg" />
 <div className="h-96 bg-gray-200 dark:bg-neutral-700 rounded-lg" />
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
 }

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 p-6">
 <div className="max-w-7xl mx-auto">
 {/* Header */}
 <div className="mb-8">
 <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
 Studio Dashboard
// FIXED:  </h1>
 <p className="text-gray-600 dark:text-gray-400">
 Manage your channel and track your performance
// FIXED:  </p>
// FIXED:  </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
 <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
 <p className="text-2xl font-bold text-gray-900 dark:text-white">
 {formatNumber(stats.totalViews)}
// FIXED:  </p>
// FIXED:  </div>
 <EyeIcon className="w-8 h-8 text-blue-500" />
// FIXED:  </div>
// FIXED:  </div>

 <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Subscribers</p>
 <p className="text-2xl font-bold text-gray-900 dark:text-white">
 {formatNumber(stats.totalSubscribers)}
// FIXED:  </p>
// FIXED:  </div>
 <UserGroupIcon className="w-8 h-8 text-red-500" />
// FIXED:  </div>
// FIXED:  </div>

 <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Videos</p>
 <p className="text-2xl font-bold text-gray-900 dark:text-white">
 {stats.totalVideos}
// FIXED:  </p>
// FIXED:  </div>
 <VideoCameraIcon className="w-8 h-8 text-green-500" />
// FIXED:  </div>
// FIXED:  </div>

 <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
 <p className="text-2xl font-bold text-gray-900 dark:text-white">
 ${formatNumber(stats.totalRevenue)}
// FIXED:  </p>
// FIXED:  </div>
 <CurrencyDollarIcon className="w-8 h-8 text-yellow-500" />
// FIXED:  </div>
// FIXED:  </div>

 <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Watch Time</p>
 <p className="text-2xl font-bold text-gray-900 dark:text-white">
 {formatDuration(stats.avgWatchTime)}
// FIXED:  </p>
// FIXED:  </div>
 <ClockIcon className="w-8 h-8 text-purple-500" />
// FIXED:  </div>
// FIXED:  </div>

 <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Likes</p>
 <p className="text-2xl font-bold text-gray-900 dark:text-white">
 {formatNumber(stats.totalLikes)}
// FIXED:  </p>
// FIXED:  </div>
 <HeartIcon className="w-8 h-8 text-pink-500" />
// FIXED:  </div>
// FIXED:  </div>

 <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Comments</p>
 <p className="text-2xl font-bold text-gray-900 dark:text-white">
 {formatNumber(stats.totalComments)}
// FIXED:  </p>
// FIXED:  </div>
 <ChatBubbleLeftRightIcon className="w-8 h-8 text-indigo-500" />
// FIXED:  </div>
// FIXED:  </div>

 <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Shares</p>
 <p className="text-2xl font-bold text-gray-900 dark:text-white">
 {formatNumber(stats.totalShares)}
// FIXED:  </p>
// FIXED:  </div>
 <ShareIcon className="w-8 h-8 text-teal-500" />
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {/* Quick Actions */}
 <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700">
 <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
 Quick Actions
// FIXED:  </h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {quickActions.map((action, index) => (
 <Link
 key={index}
 to={action.link}
// FIXED:  className={`${action.color} text-white p-4 rounded-lg transition-colors duration-200 group`} />
 >
 <div className="flex items-center space-x-3">
 {action.icon}
 <div>
 <h3 className="font-medium">{action.title}</h3>
 <p className="text-sm opacity-90">{action.description}</p>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </Link>
 ))}
// FIXED:  </div>
// FIXED:  </div>

 {/* Recent Videos */}
 <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
 Recent Videos
// FIXED:  </h2>
 <Link
 to="/studio/content"
// FIXED:  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium" />
 >
 View All
// FIXED:  </Link>
// FIXED:  </div>
 <div className="space-y-4">
 {recentVideos.map((video) => (
 <div key={video.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors">
 <img
// FIXED:  src={video.thumbnail}
// FIXED:  alt={video.title}
// FIXED:  className="w-16 h-9 object-cover rounded" />
 />
 <div className="flex-1 min-w-0">
 <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
 {video.title}
// FIXED:  </h3>
 <div className="flex items-center space-x-4 mt-1">
 <span className="text-xs text-gray-500 dark:text-gray-400">
 {formatNumber(video.views)} views
// FIXED:  </span>
 <span className="text-xs text-gray-500 dark:text-gray-400">
 {formatDistanceToNow(video.uploadDate)}
// FIXED:  </span>
 <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(video.status)}`}>
 {video.status}
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </div>
 <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
 <span>{formatNumber(video.likes)} likes</span>
 <span>{formatNumber(video.comments)} comments</span>
// FIXED:  </div>
// FIXED:  </div>
 ))}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default StudioDashboardPage;
