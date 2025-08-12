import { useState, useEffect, useCallback } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null
}

interface UseAsyncStateOptions {
  initialLoading?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void
}

/**
 * Custom hook for managing async operations with loading, error, and data states
 * Reduces code duplication across components that fetch data
 */
export const useAsyncState = <T>(,
  asyncFunction: () => Promise<T>
  dependencies = [],
  options: UseAsyncStateOptions = {}
) => {
  const { initialLoading = true, onSuccess, onError } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: initialLoading,
    error: null });

  const execute = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev as any, loading: true, error: null }));

    try {
      const result = await asyncFunction();
      setState({ data: result, loading: false, error: null });
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      onError?.(errorMessage);
      throw err;
    }
  }, [asyncFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev as any, data }));
  }, []);

  const setError = useCallback((error: Error) => {
    setState(prev => ({ ...prev as any, error, loading: false }));
  }, []);

  useEffect(() => {
    if (dependencies.length > 0) {
      execute();
    }
  }, dependencies);

  return {
    ...state as any,
    execute,
    reset,
    setData,
    setError,
    isIdle: !state.loading && !state.error && !state.data };
};

export default useAsyncState;
