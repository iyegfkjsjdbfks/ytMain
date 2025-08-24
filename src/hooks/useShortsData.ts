// useShortsData - Simple Hook
import { useState } from 'react';

// Define a generic short video type
interface ShortVideo {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  views: number;
  createdAt: Date;
}

export function useShortsData() {
  const [data, setData] = useState<ShortVideo[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return {
    data,
    loading,
    error,
    setData
  };
}

// Additional shorts-related hook
export function useShortsVideos() {
  const [shortsVideos, setShortsVideos] = useState<ShortVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return {
    shortsVideos,
    loading,
    error,
    setShortsVideos
  };
}

export default useShortsData;