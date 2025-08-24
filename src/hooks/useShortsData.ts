// useShortsData - Simple Hook
import { useState } from 'react';

export function useShortsData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return {
    data,
    loading,
    error
  };
}

// Additional shorts-related hook
export function useShortsVideos() {
  const [shortsVideos, setShortsVideos] = useState([]);
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