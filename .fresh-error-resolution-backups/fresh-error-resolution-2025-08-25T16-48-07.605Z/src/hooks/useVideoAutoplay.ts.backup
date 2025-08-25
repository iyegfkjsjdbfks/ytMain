import React from 'react';
// useVideoAutoplay - Simple Hook
import { useState } from 'react';

export function useVideoAutoplay() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return {
    data,
    loading,
    error
  };
}

export default useVideoAutoplay;