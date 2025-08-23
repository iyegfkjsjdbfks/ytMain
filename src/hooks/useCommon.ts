// useCommon - Enhanced Hook
import { useState, useEffect, useCallback } from 'react';

export function useCommon() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate data fetching
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setData({ message: 'Hook data loaded', timestamp: Date.now() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useCommon;