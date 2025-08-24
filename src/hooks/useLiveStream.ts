import React from 'react';
// useLiveStream - Simple Hook
import { useState } from 'react';

export function useLiveStream() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return {
    data,
    loading,
    error
  };
}

export default useLiveStream;