import React from 'react';
// useSubscription - Simple Hook
import { useState } from 'react';

// Define a generic subscription type
interface Subscription {
  channelId: string;
  channelName: string;
  subscriberCount: number;
  isSubscribed: boolean;
}

export function useSubscription() {
  const [data, setData] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    data,
    loading,
    error,
    setData
  };
}

export default useSubscription;