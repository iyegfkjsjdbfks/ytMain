// TODO: Fix import - import React from "react";
// TODO: Fix import - import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import { throttle, safeLocalStorage } from '../utils/componentUtils';

// Common hook patterns

// Enhanced local storage hook with error handling
export const useLocalStorage = <T>(
  key,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void, () => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = safeLocalStorage.getJSON<T>(key);
    return item ?? initialValue;
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        safeLocalStorage.setJSON(key, valueToStore);
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      safeLocalStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

// Debounced value hook
export const useDebounce = <T>(value: T, delay): T => {
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
};

// Throttled callback hook
export const useThrottle = <T extends (...args: unknown) => unknown>(
  callback: T,
  delay,
): T => {
  const throttledCallback = useMemo(
    () => throttle(callback, delay),
    [callback, delay],
  );

  return throttledCallback as T;
};

// Previous value hook
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

// Toggle hook
export const useToggle = (
  initialValue: boolean = false,
): [boolean, () => void, (value) => void] => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const setToggle = useCallback((newValue) => setValue(newValue), []);

  return [value, toggle, setToggle];
};

// Counter hook
export const useCounter = (
  initialValue: number = 0,
): {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  set: (value) => void;
} => {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  const set = useCallback((value) => setCount(value), []);

  return { count, increment, decrement, reset, set };
};

// Array state hook
export const useArray = <T>(
  initialArray: T = [],
): {
  array: T;
  set: (array: T) => void;
  push: (element: T) => void;
  filter: (callback: (item: T, index) => boolean) => void;
  update: (index, newElement: T) => void;
  remove: (index) => void;
  clear: () => void;
} => {
  const [array, setArray] = useState<T[]>(initialArray);

  const push = useCallback((element: T) => {
    setArray(arr => [...arr, element]);
  }, []);

  const filter = useCallback((callback: (item: T, index) => boolean) => {
    setArray(arr => arr.filter(callback));
  }, []);

  const update = useCallback((index, newElement: T) => {
    setArray(arr => {
      const newArray = [...arr];
      newArray[index] = newElement;
      return newArray;
    });
  }, []);

  const remove = useCallback((index) => {
    setArray(arr => arr.filter((_, i) => i !== index));
  }, []);

  const clear = useCallback(() => setArray([]), []);

  return {
    array,
    set: setArray,
    push,
    filter,
    update,
    remove,
    clear,
  };
};

// Async state hook
export const useAsync = <T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true,
): {
  execute: () => Promise<void>;
  loading: boolean;
  data: T | null;
  error: E | null;
} => {
  const [loading, setLoading] = useState<boolean>(immediate);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err as E);
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute().catch(console.error);
    }
  }, [execute, immediate]);

  return { execute, loading, data, error };
};

// Click outside hook
export const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void,
): void => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

// Keyboard shortcut hook
export const useKeyPress = (
  targetKey,
  handler: () => void,
  options: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  } = {},
): void => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const { ctrl = false, shift = false, alt = false, meta = false } = options;

      if (
        event.key === targetKey &&
        event.ctrlKey === ctrl &&
        event.shiftKey === shift &&
        event.altKey === alt &&
        event.metaKey === meta
      ) {
        event.preventDefault();
        handler();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [targetKey, handler, options]);
};

// Window size hook
export const useWindowSize = (): { width: number; height: number } => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Media query hook
export const useMediaQuery = (query): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};

// Intersection observer hook
export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {},
): IntersectionObserverEntry | null => {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setEntry(entry ?? null),
      options,
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef, options]);

  return entry;
};

// Scroll position hook
export const useScrollPosition = (): { x: number; y: number } => {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = throttle(() => {
      setScrollPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    }, 100);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollPosition;
};

// Form validation hook
export const useFormValidation = <T extends Record<string, unknown>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, (value: unknown) => string | null>>,
): {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isValid: boolean;
  handleChange: (name: keyof T, value: unknown) => void;
  handleSubmit: (onSubmit: (values: T) => void) => (e: React.FormEvent) => void;
  reset: () => void;
} => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validateField = useCallback(
    (name: keyof T, value: unknown): string | null => {
      const rule = validationRules[name];
      return rule ? rule(value) : null;
    },
    [validationRules],
  );

  const handleChange = useCallback(
    (name: keyof T, value: unknown) => {
      setValues(prev => ({ ...prev, [name]: value }));

      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error,
      }));
    },
    [validateField],
  );

  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isFormValid = true;

    Object.keys(values).forEach(key => {
      const error = validateField(key as keyof T, values[key as keyof T]);
      if (error) {
        newErrors[key as keyof T] = error;
        isFormValid = false;
      }
    });

    setErrors(newErrors);
    return isFormValid;
  }, [values, validateField]);

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void) => (e: React.FormEvent) => {
      e.preventDefault();
      if (validateAll()) {
        onSubmit(values);
      }
    },
    [values, validateAll],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const isValid = useMemo(() => {
    return Object.values(errors).every(error => !error);
  }, [errors]);

  return {
    values,
    errors,
    isValid,
    handleChange,
    handleSubmit,
    reset,
  };
};

export default {
  useLocalStorage,
  useDebounce,
  useThrottle,
  usePrevious,
  useToggle,
  useCounter,
  useArray,
  useAsync,
  useClickOutside,
  useKeyPress,
  useWindowSize,
  useMediaQuery,
  useIntersectionObserver,
  useScrollPosition,
  useFormValidation,
};