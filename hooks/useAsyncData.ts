import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAsyncDataOptions<T> {
  initialData?: T;
  dependencies?: any[];
}

interface UseAsyncDataReturn<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setData: (data: T) => void;
}

/**
 * Custom hook for handling async data fetching with loading and error states
 * @param asyncFunction - The async function to execute
 * @param options - Configuration options
 * @returns Object containing data, loading, error states and utility functions
 */
export function useAsyncData<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataReturn<T> {
  const { initialData, dependencies = [] } = options;
  
  const [data, setData] = useState<T>(initialData as T);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const asyncFunctionRef = useRef(asyncFunction);
  
  // Update ref when asyncFunction changes
  useEffect(() => {
    asyncFunctionRef.current = asyncFunction;
  }, [asyncFunction]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunctionRef.current();
      // Added empty response handling
      if (!result) {
        throw new Error('No data received');
      }
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('useAsyncData error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  const refetch = useCallback(() => fetchData(), [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    setData
  };
}