import React, { useState, useEffect } from 'react';

import {
  BellIcon,
  UserMinusIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';

import { formatDistanceToNow } from '../utils/dateUtils';

export interface SubscriptionData {
  id: string;
  channelId: string;
  channelName: string;
  channelAvatar: string;
  channelVerified: boolean;
  subscriberCount: number;
  videoCount: number;
  subscribedAt: string;
  notificationsEnabled: boolean;
  lastVideoUpload?: string;
  category: string;
  description: string;
  isLive?: boolean;
  recentVideos: Array<{
    id: string;
    title: string;
    thumbnail: string;
    views: number;
    uploadedAt: string;
    duration: string;
  }>;
}

interface SubscriptionsPageProps {
  className?: string;
}

const SubscriptionsPage: React.FC<SubscriptionsPageProps> = ({ className = '' }) => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'alphabetical' | 'recent' | 'most_videos' | 'subscribers'>('alphabetical');
  const [filterBy, setFilterBy] = useState<'all' | 'notifications_on' | 'notifications_off' | 'live' | 'recent_uploads'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState<string | null>(null);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<Set<string>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = () => {
    try {
      const stored = localStorage.getItem('youtubeCloneSubscriptions_v1');
      if (stored) {
        const subscriptionsData = JSON.parse(stored);
        const subscriptionsList: SubscriptionData[] = Object.entries(subscriptionsData).map(([channelId, data]: [string, any]) => ({
          id: channelId,
          channelId,
          channelName: data.channelName,
          channelAvatar: data.channelAvatarUrl,
          channelVerified: Math.random() > 0.7,
          subscriberCount: parseInt(data.subscriberCount?.replace(/[^\d]/g, '') || '0', 10) || Math.floor(Math.random() * 1000000),
