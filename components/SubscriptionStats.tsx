import React, { FC, type React } from 'react';
import type { Video } from '../types';
import { Link } from 'react-router-dom';

import { UserGroupIcon, VideoCameraIcon, ClockIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
const BellIconSolid = BellSolidIcon;

interface SubscriptionStatsProps {
 totalChannels: number;
 notificationsEnabled: number;
 totalVideos: number;
 newVideosToday: number;
 className?: string;
}

const SubscriptionStats: React.FC<SubscriptionStatsProps> = ({
 totalChannels,
 notificationsEnabled,
 totalVideos,
 newVideosToday,
 className = '' }) => {
 const stats = [
 {
 label: 'Subscribed Channels',
 value: totalChannels,
 icon: UserGroupIcon,
 color: 'text-blue-600 dark:text-blue-400',
 bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
 {
 label: 'With Notifications',
 value: notificationsEnabled,
 icon: BellIconSolid,
 color: 'text-yellow-600 dark:text-yellow-400',
 bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
 {
 label: 'Total Videos',
 value: totalVideos,
 icon: VideoCameraIcon,
 color: 'text-green-600 dark:text-green-400',
 bgColor: 'bg-green-50 dark:bg-green-900/20' },
 {
 label: 'New Today',
 value: newVideosToday,
 icon: ClockIcon,
 color: 'text-red-600 dark:text-red-400',
 bgColor: 'bg-red-50 dark:bg-red-900/20' }];

 if (totalChannels === 0) {
 return (
 <div className={`p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg border border-red-200 dark:border-red-800 ${className}`}>
 <div className="text-center">
 <UserGroupIcon className="w-12 h-12 text-red-400 dark:text-red-500 mx-auto mb-3" />
 <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
 Start Building Your Subscription Feed
// FIXED:  </h3>
 <p className="text-red-600 dark:text-red-300 mb-4">
 Subscribe to channels to see their latest videos and build your personalized feed.
// FIXED:  </p>
 <Link
 to="/trending"
// FIXED:  className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors" />
 >
 <VideoCameraIcon className="w-4 h-4 mr-2" />
 Discover Channels
// FIXED:  </Link>
// FIXED:  </div>
// FIXED:  </div>
 );
 }

 return (
 <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
 {stats.map((stat, index) => {
 const IconComponent = stat.icon;
 return (
 <div
 key={index}
// FIXED:  className={`p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 ${stat.bgColor} transition-transform hover:scale-105`} />
 >
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
 {stat.label}
// FIXED:  </p>
 <p className={`text-2xl font-bold ${stat.color}`}>
 {stat.value}
// FIXED:  </p>
// FIXED:  </div>
 <div className={`p-2 rounded-lg ${stat.bgColor}`}>
 <IconComponent className={`w-6 h-6 ${stat.color}`} />
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
 })}
// FIXED:  </div>
 );
};

export default SubscriptionStats;
