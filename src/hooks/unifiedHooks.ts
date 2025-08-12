import React, { useEffect, useCallback, useRef, useState } from 'react';
/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
  interface Process {
    env: ProcessEnv;
  }
}

// Unified state management hook
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastFetch: number | null;
}

export function useAsyncState<T>(initialData: T | null = null): [
  AsyncState<T>
  {
    setData: (data: T | null) => void;
    setLoading: (loading: any) => void;
    setError: (error: Error | null) => void;
    reset: () => void;
  },
] {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
    lastFetch: null });

  const setData = useCallback((data: T | null) => {
    setState(prev => ({
      ...prev,
      data,
      error: null,
      lastFetch: Date.now() }));
  }, []);

  const setLoading = useCallback((loading: any) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState(prev => ({
      ...prev,
      error,
      loading: false }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
      lastFetch: null });
  }, [initialData]);

  return [state, { setData, setLoading, setError, reset }];
}

// Unified API data fetching hook
export interface UseApiOptions {
  immediate?: boolean;
  refreshInterval?: number;
  retryOnError?: boolean;
  retryDelay?: number;
  maxRetries?: number;
  dependencies?: any;
}

export function useApi<T>(
  apiCall: () => Promise<T>
  options: UseApiOptions = {}
): AsyncState<T> & {
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
} {
  const {
    immediate = true,
    refreshInterval,
    retryOnError = false,
    retryDelay = 1000,
    maxRetries = 3,
    dependencies = [] } = options;

  const [state, { setData, setLoading, setError }] = useAsyncState<T>();
  const retryCountRef = useRef(0);
  const refreshIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      if (mountedRef.current) {
        setData(result);
        retryCountRef.current = 0;
      }
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }

      const apiError = error as Error;

      if (retryOnError && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        setTimeout(
          () => {
            if (mountedRef.current) {
              fetchData();
            }
          },
          retryDelay * Math.pow(2, retryCountRef.current - 1)
        );
      } else {
        setError(apiError);
        retryCountRef.current = 0;
      }
    }
  }, [
    apiCall,
    setData,
    setLoading,
    setError,
    retryOnError,
    maxRetries,
    retryDelay,
  ]);

  const refetch = useCallback(async () => {
    retryCountRef.current = 0;
    await fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Initial fetch
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, ...dependencies]);

  // Refresh interval
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(fetchData, refreshInterval);
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
    return undefined;
  }, [refreshInterval, fetchData]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    refetch,
    refresh };
}

// Unified form state management
export interface FormField<T> {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

export interface FormState<T extends Record<string, any>> {
  fields: { [K in keyof T]: FormField<T[K]> };
  isValid: boolean;
  isSubmitting: boolean;
  submitError: string | null;
}

export interface FormActions<T extends Record<string, any>> {
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setError: <K extends keyof T>(field: K, error: string | null) => void;
  setTouched: <K extends keyof T>(field: K, touched?: boolean) => void;
  setSubmitting: (submitting: any) => void;
  setSubmitError: (error: string | null) => void;
  reset: () => void;
  validate: () => boolean;
  handleSubmit: (
    onSubmit: (values: T) => Promise<void> | void
  ) => (e?: React.FormEvent) => Promise<void>;
}

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validators?: { [K in keyof T]?: (value: T[K]) => string | null }
): [FormState<T> FormActions<T>] {
  const [state, setState] = useState<FormState<T>>(() => {
    const fields = {} as { [K in keyof T]: FormField<T[K]> };
    for (const key in initialValues) {
      fields[key] = {
        value: initialValues[key],
        error: null,
        touched: false,
        dirty: false };
    }
    return {
      fields,
      isValid: true,
      isSubmitting: false,
      submitError: null };
  });

  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setState(prev => {
        const newFields = { ...prev.fields };
        newFields[field] = {
          ...newFields[field],
          value,
          dirty: value !== initialValues[field],
          error: validators?.[field] ? validators[field](value) : null };

        const isValid = Object.values(newFields).every(f => !f.error);

        return {
          ...prev,
          fields: newFields,
          isValid };
      });
    },
    [initialValues, validators]
  );

  const setError = useCallback(
    <K extends keyof T>(field: K, error: string | null) => {
      setState(prev => {
        const newFields = { ...prev.fields };
        newFields[field] = { ...newFields[field], error };
        const isValid = Object.values(newFields).every(f => !f.error);

        return {
          ...prev,
          fields: newFields,
          isValid };
      });
    },
    []
  );

  const setTouched = useCallback(
    <K extends keyof T>(field: K, touched = true) => {
      setState(prev => {
        const newFields = { ...prev.fields };
        newFields[field] = { ...newFields[field], touched };

        return {
          ...prev,
          fields: newFields };
      });
    },
    []
  );

  const setSubmitting = useCallback((submitting: any) => {
    setState(prev => ({ ...prev, isSubmitting: submitting }));
  }, []);

  const setSubmitError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, submitError: error }));
  }, []);

  const reset = useCallback(() => {
    setState(prev => {
      const fields = {} as { [K in keyof T]: FormField<T[K]> };
      for (const key in initialValues) {
        fields[key] = {
          value: initialValues[key],
          error: null,
          touched: false,
          dirty: false };
      }
      return {
        ...prev,
        fields,
        isValid: true,
        isSubmitting: false,
        submitError: null };
    });
  }, [initialValues]);

  const validate = useCallback(() => {
    if (!validators) {
      return true;
    }

    let isValid = true;
    setState(prev => {
      const newFields = { ...prev.fields };

      for (const key in validators) {
        const validator = validators[key];
        if (validator) {
          const error = validator(newFields[key].value);
          newFields[key] = { ...newFields[key], error };
          if (error) {
            isValid = false;
          }
        }
      }

      return {
        ...prev,
        fields: newFields,
        isValid };
    });

    return isValid;
  }, [validators]);

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => Promise<void> | void) => {
      return async (e?: React.FormEvent) => {
        if (e) {
          e.preventDefault();
        }

        if (!validate()) {
          return;
        }

        setSubmitting(true);
        setSubmitError(null);

        try {
          const values = {} as T;
          for (const key in state.fields) {
            values[key] = state.fields[key].value;
          }

          await onSubmit(values);
        } catch (error) {
          setSubmitError(
            error instanceof Error ? error.message : 'An error occurred'
          );
        } finally {
          setSubmitting(false);
        }
      };
    },
    [state.fields, validate, setSubmitting, setSubmitError]
  );

  return [
    state,
    {
      setValue,
      setError,
      setTouched,
      setSubmitting,
      setSubmitError,
      reset,
      validate,
      handleSubmit },
  ];
}

// Unified toggle hook
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, (value: string | number) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  const setToggle = useCallback((newValue: any) => {
    setValue(newValue);
  }, []);

  return [value, toggle, setToggle];
}

// Unified debounce hook
export function useDebounce<T>(value: T, delay: any): T {
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

// Unified local storage hook
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// Unified intersection observer hook
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLElement> boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry) {
        setIsIntersecting(entry.isIntersecting);
      }
    }, options);

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [options]);

  return [targetRef, isIntersecting];
}

// Performance monitoring hook
export function usePerformanceMonitor(name: any) {
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();

    return () => {
      // const __duration = Date.now() - startTimeRef.current;
      if (import.meta.env.MODE === 'development') {
      }
    };
  }, [name]);

  const mark = useCallback((__label: any) => {
      // const __duration = Date.now() - startTimeRef.current;
      if (import.meta.env.MODE === 'development') {
      }
    },
    [name]
  );

  return { mark };
}
