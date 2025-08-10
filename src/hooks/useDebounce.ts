// TODO: Fix import - import React from "react";
// TODO: Fix import - import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook that debounces a value
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that debounces a callback function
 * @param callback - The callback function to debounce
 * @param delay - The delay in milliseconds
 * @param deps - Dependencies array for the callback
 * @returns The debounced callback function
 */
export function useDebouncedCallback<T extends (...args) => any>(
  callback: T,
  delay,
  deps: React.DependencyList = [],
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay, ...deps],
  ) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Hook for debounced search functionality
 * @param searchFunction - The async search function
 * @param delay - The debounce delay in milliseconds
 * @returns Object with search state and functions
 */
export function useDebouncedSearch<T>(
  searchFunction: (query) => Promise<T[]>,
  delay: number = 300,
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, delay);
  const abortControllerRef = useRef<AbortController>();

  const search = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const searchResults = await searchFunction(searchQuery);
      setResults(searchResults);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, [searchFunction]);

  // Trigger search when debounced query changes
  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearSearch,
  };
}