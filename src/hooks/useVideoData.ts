// useVideoData - Simple Hook
import { useState } from 'react';

export function useVideoData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return {
    data,
    loading,
    error
  };
}

// Additional video-related hooks
export function useVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return {
    videos,
    loading,
    error,
    setVideos
  };
}

export function useTrendingVideos() {
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return {
    trendingVideos,
    loading,
    error,
    setTrendingVideos
  };
}

export function useSubscriptionsFeed() {
  const [subscriptionsFeed, setSubscriptionsFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return {
    subscriptionsFeed,
    loading,
    error,
    setSubscriptionsFeed
  };
}

export function useChannelVideos() {
  const [channelVideos, setChannelVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return {
    channelVideos,
    loading,
    error,
    setChannelVideos
  };
}

export default useVideoData;