import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '../services/subscriptionService';

// This file is currently empty but kept for future subscription hook implementations


export interface SubscriptionData {
  channelId: string;
  channelName: string;
  channelAvatar: string;
  subscribedAt: string;
  notificationLevel: 'all' | 'personalized' | 'none';
  isSubscribed: boolean;
}

export function useSubscription(channelId: string) {
  const queryClient = useQueryClient();

  const { data: subscription, isLoading: isQueryLoading } = useQuery({
    queryKey: ['subscription', channelId],
    queryFn: () => subscriptionService.getSubscriptionStatus(channelId),
    enabled: !!channelId,
  });

  const subscribeMutation = useMutation({
    mutationFn: () => subscriptionService.subscribe(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', channelId] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: () => subscriptionService.unsubscribe(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', channelId] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });

  const updateNotificationMutation = useMutation({
    mutationFn: (level: 'all' | 'personalized' | 'none') =>
      subscriptionService.updateNotificationLevel(channelId, level),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', channelId] });
    },
  });

  return {
    isSubscribed: subscription?.isSubscribed || false,
    notificationLevel: subscription?.notificationLevel || 'personalized',
    isLoading: isQueryLoading || subscribeMutation.isPending || unsubscribeMutation.isPending,
    subscribe: subscribeMutation.mutateAsync,
    unsubscribe: unsubscribeMutation.mutateAsync,
    updateNotificationLevel: updateNotificationMutation.mutateAsync,
    subscription,
  };
}

export function useSubscriptions() {
  const { data: subscriptions, isLoading, error } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionService.getSubscriptions(),
  });

  return {
    subscriptions: subscriptions || [],
    isLoading,
    error,
  };
}

export function useSubscriptionFeed() {
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['subscription-feed'],
    queryFn: () => subscriptionService.getSubscriptionFeed(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  return {
    videos: videos || [],
    isLoading,
    error,
  };
}
