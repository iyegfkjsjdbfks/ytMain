import React from "react";
import { useState, useEffect, useCallback } from 'react';

import { getSubscribedChannels,
  updateSubscriptionNotifications,
  unsubscribeFromChannel,
} // from '../services/realVideoService' // Service not found;

export interface SubscribedChannel {
  id: string;
  name: string;
  avatar: string;
  subscribers: string;
  notificationsEnabled: boolean;
  subscribedAt: string;
}

export function useSubscriptions() {
  const [channels, setChannels] = useState<SubscribedChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChannels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const subscribedChannels = await getSubscribedChannels();
      setChannels(subscribedChannels);
    } catch (err) {
      console.error('Error loading subscribed channels:', err);
      setError('Failed to load subscribed channels');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleNotifications = useCallback(async (channelId: string) => {
    try {
      const channel = channels.find(c => c.id === channelId);
      if (!channel) {
return;
}

      const newNotificationState = !channel.notificationsEnabled;
      await updateSubscriptionNotifications(channelId, newNotificationState);

      setChannels(prev =>
        prev.map(c =>
          c.id === channelId
            ? { ...c, notificationsEnabled: newNotificationState }
            : c,
        ),
      );
    } catch (err) {
      console.error('Error updating notification settings:', err);
      setError('Failed to update notification settings');
    }
  }, [channels]);

  const unsubscribe = useCallback(async (channelId: string) => {
    try {
      await unsubscribeFromChannel(channelId);
      setChannels(prev => prev.filter((c: any) => c.id !== channelId));
    } catch (err) {
      console.error('Error unsubscribing from channel:', err);
      setError('Failed to unsubscribe from channel');
    }
  }, []);

  const isSubscribed = useCallback((channelId: string) => {
    return channels.some(c => c.id === channelId);
  }, [channels]);

  const getChannelNotificationState = useCallback((channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    return channel?.notificationsEnabled || false;
  }, [channels]);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  return {
    channels,
    loading,
    error,
    loadChannels,
    toggleNotifications,
    unsubscribe,
    isSubscribed,
    getChannelNotificationState,
    totalSubscriptions: channels.length,
  };
}

export default useSubscriptions;
