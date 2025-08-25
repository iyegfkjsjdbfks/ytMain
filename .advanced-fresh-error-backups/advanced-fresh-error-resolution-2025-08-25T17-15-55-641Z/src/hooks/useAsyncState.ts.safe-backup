import React from 'react';
// useAsyncState - Simple Hook
import { useState } from 'react';

export function useAsyncState() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return {
    data,
    loading,
    error
  };
}

export default useAsyncState;