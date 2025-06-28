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

 

  
