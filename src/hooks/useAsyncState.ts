
import { useState, useEffect, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAsyncStateOptions {
  initialLoading?: boolean;
  onSuccess?: (data) => void;
  onError?: (error) => void;
}

/**
 * Custom hook for managing async operations with loading, error, and data states
 * Reduces code duplication across components that fetch data
 */
export const useAsyncState = <T>(
  asyncFunction: () => Promise<T>,
  dependencies = [],
  options: UseAsyncStateOptions = {},
) => {
  const { initialLoading = true, onSuccess, onError } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: initialLoading,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFunction();
      setState({ data: result, loading: false, error: null });
      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      onError?.(errorMessage);
      throw err;
    }
  }, [asyncFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  useEffect(() => {
    if (dependencies.length > 0) {
      execute();
    }
  }, dependencies);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
    isIdle: !state.loading && !state.error && !state.data,
  };
};

export default useAsyncState;