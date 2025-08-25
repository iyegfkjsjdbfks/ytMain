import React from 'react';
// usePWA - Simple Hook
import { useState } from 'react';

export function usePWA() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return {
    data,
    loading,
    error
  };
}

export default usePWA;