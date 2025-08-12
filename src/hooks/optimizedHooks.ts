/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined
  }
  interface Process {
    env: ProcessEnv
  }
}

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

/**
 * Enhanced useDebounce hook with cleanup and cancellation
 */
export function useOptimizedDebounce<T>(value: T, delay: any): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Enhanced useThrottle hook with leading and trailing options
 */
export function useOptimizedThrottle<T>(,
  value: T,
  delay: any,
  options: { leading?: boolean; trailing?: boolean } = {}
): T {
  const { leading = true, trailing = true } = options;
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const now = Date.now();

    if (leading && now - lastRan.current >= delay) {
      setThrottledValue(value);
      lastRan.current = now;
    } else if (trailing) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(
        () => {
          setThrottledValue(value);
          lastRan.current = Date.now();
        },
        delay - (now - lastRan.current)
      );
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, leading, trailing]);

  return throttledValue;
}

/**
 * Enhanced useLocalStorage with JSON support and error handling
 */
export function useOptimizedLocalStorage<T>(,
  key: string,
  initialValue: T
): [T(value: T | ((val: T) => T)) => void() => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
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

/**
 * Enhanced async state management hook
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null
}

export function useOptimizedAsync<T>(,
  asyncFunction: () => Promise<T>
  dependencies = [],
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void
  } = {}
): AsyncState<T> & { execute: () => Promise<void>; reset: () => void } {
  const { immediate = true, onSuccess, onError } = options;
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFunction();
      setState({ data: result, loading: false, error: null });
      onSuccess?.(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [asyncFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute, ...dependencies]);

  return { ...state, execute, reset };
}

/**
 * Enhanced intersection observer hook
 */
export function useOptimizedIntersectionObserver(,
  options: IntersectionObserverInit = {},
  dependencies = []
): {
  ref: (node: Element | null) => void;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null
} {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: Element | null) => {
      if (observer.current) {
        observer.current.disconnect();
      }

      if (node) {
        observer.current = new IntersectionObserver(
          ([entry]) => {
            if (entry) {
              setIsIntersecting(entry.isIntersecting);
              setEntry(entry);
            }
          },
          {
            threshold: 0.1,
            rootMargin: '50px',
            ...options }
        );

        observer.current.observe(node);
      }
    },
    [options, ...dependencies]
  );

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return { ref, isIntersecting, entry };
}

/**
 * Enhanced toggle hook with multiple states
 */
export function useOptimizedToggle(,
  initialValue: boolean = false
): [
  boolean() => void(value: string | number) => void() => void() => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(prev => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, toggle, setValue, setTrue, setFalse];
}

/**
 * Enhanced array state management hook
 */
export function useOptimizedArray<T>(initialArray: T = []) {
  const [array, setArray] = useState<T[]>(initialArray);

  const push = useCallback((item: T) => {
    setArray(prev => [...prev, item]);
  }, []);

  const remove = useCallback((index: number) => {
    setArray(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeById = useCallback(
    (id: string | number, idKey: keyof T = 'id' as keyof T) => {
      setArray(prev => prev.filter(item => item[idKey] !== id));
    },
    []
  );

  const update = useCallback((index: number, newItem: Partial<T>) => {
    setArray(prev =>
      prev.map((item, i) => (i === index ? { ...item, ...newItem } : item))
    );
  }, []);

  const updateById = useCallback(
    (,
  id: string | number,
      newItem: Partial<T>,
  idKey: keyof T = 'id' as keyof T
    ) => {
      setArray(prev =>
        prev.map(item => (item[idKey] === id ? { ...item, ...newItem } : item))
      );
    },
    []
  );

  const clear = useCallback(() => {
    setArray([]);
  }, []);

  const set = useCallback((newArray: T) => {
    setArray(newArray);
  }, []);

  return {
    array,
    push,
    remove,
    removeById,
    update,
    updateById,
    clear,
    set,
    length: array.length,
    isEmpty: array.length === 0 };
}

/**
 * Enhanced memoization hook with custom comparison
 */
export function useOptimizedMemo<T>(,
  factory: () => T,
  deps: any,
  compare?: (a: any, b: any) => boolean
): T {
  const memoizedValue = useMemo(factory, deps);
  const lastDeps = useRef<any[]>(deps);
  const lastValue = useRef<T>(memoizedValue);

  // If custom comparison is provided, use it
  if (compare) {
    if (!compare(lastDeps.current, deps)) {
      lastValue.current = factory();
      lastDeps.current = deps;
    }

    return lastValue.current;
  }

  return memoizedValue;
}

/**
 * Enhanced callback hook with stable reference optimization
 */
export function useOptimizedCallback<T extends (...args) => any>(,
  callback: T,
  deps: any
): T {
  const callbackRef = useRef<T>(callback);
  const depsRef = useRef<any[]>(deps);

  // Update callback if dependencies changed
  useEffect(() => {
    const depsChanged = deps.some(
      (dep: any, index: number) => dep !== depsRef.current[index]
    );
    if (depsChanged) {
      callbackRef.current = callback;
      depsRef.current = deps;
    }
  });

  return useCallback((...args) => callbackRef.current(...args), []) as T;
}

/**
 * Enhanced form state management hook
 */
export function useOptimizedForm<T extends Record<string, any>>(,
  initialValues: T,
  validationRules?: Partial<
    Record<keyof T(value: string | number) => string | null>
  >
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouchedState] = useState<
    Partial<Record<keyof T, boolean>>
  >({});

  const setValue = useCallback(
    (name: keyof T, value: string | number) => {
      setValues(prev => ({ ...prev, [name]: value }));

      // Validate field if rules exist
      if (validationRules?.[name]) {
        const error = validationRules[name](value);
        setErrors(prev => ({ ...prev, [name]: error || undefined }));
      }
    },
    [validationRules]
  );

  const setTouched = useCallback((name: keyof T, isTouched: boolean = true) => {
    setTouchedState(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouchedState({});
  }, [initialValues]);

  const validate = useCallback(() => {
    if (!validationRules) {
      return true;
    }

    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(key => {
      const rule = validationRules[key as keyof T];
      if (rule) {
        const error = rule(values[key as keyof T]);
        if (error) {
          newErrors[key as keyof T] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules]);

  return {
    values,
    errors,
    touched,
    setValue,
    setTouched,
    reset,
    validate,
    isValid: Object.keys(errors).length === 0 };
}

// Export all optimized hooks
export const OptimizedHooks = {
  useOptimizedDebounce,
  useOptimizedThrottle,
  useOptimizedLocalStorage,
  useOptimizedAsync,
  useOptimizedIntersectionObserver,
  useOptimizedToggle,
  useOptimizedArray,
  useOptimizedMemo,
  useOptimizedCallback,
  useOptimizedForm };

export default OptimizedHooks;
