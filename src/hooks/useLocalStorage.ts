
import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((val: T) => T);

/**
 * Custom hook for managing localStorage with React state
 * @param key - The localStorage key
 * @param initialValue - The initial value if no stored value exists
 * @returns [storedValue, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: SetValue<T>) => void, () => void] {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for managing localStorage with session-based expiration
 * @param key - The localStorage key
 * @param initialValue - The initial value if no stored value exists
 * @param ttl - Time to live in milliseconds
 * @returns [storedValue, setValue, removeValue, isExpired]
 */
export function useLocalStorageWithExpiry<T>(
  key: string,
  initialValue: T,
  ttl: number,
): [T, (value: SetValue<T>) => void, () => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) {
return initialValue;
}

      const parsed = JSON.parse(item);
      const now = new Date().getTime();

      // Check if expired
      if (parsed.expiry && now > parsed.expiry) {
        window.localStorage.removeItem(key);
        return initialValue;
      }

      return parsed.value || initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const [isExpired, setIsExpired] = useState(false);

  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        const now = new Date().getTime();
        const expiry = now + ttl;

        const item = {
          value: valueToStore,
          expiry,
        };

        setStoredValue(valueToStore);
        setIsExpired(false);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(item));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, ttl],
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      setIsExpired(false);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Check expiry on mount and set up interval
  useEffect(() => {
    const checkExpiry = () => {
      if (typeof window === 'undefined') {
return;
}

      try {
        const item = window.localStorage.getItem(key);
        if (!item) {
return;
}

        const parsed = JSON.parse(item);
        const now = new Date().getTime();

        if (parsed.expiry && now > parsed.expiry) {
          setIsExpired(true);
          removeValue();
        }
      } catch (error) {
        console.warn(`Error checking expiry for localStorage key "${key}":`, error);
      }
    };

    // Check immediately
    checkExpiry();

    // Check every minute
    const interval = setInterval(checkExpiry, 60000);

    return () => clearInterval(interval);
  }, [key, removeValue]);

  return [storedValue, setValue, removeValue, isExpired];
}