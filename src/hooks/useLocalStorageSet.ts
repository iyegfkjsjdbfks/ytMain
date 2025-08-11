
import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for storing and managing Sets in localStorage
 * Since localStorage can only store strings, this hook handles the conversion
 * between Set objects and arrays for proper serialization.
 *
 * @param key - The localStorage key
 * @param initialValue - Initial Set value (defaults to empty Set)
 * @returns [set, addItem, removeItem, toggleItem, clearSet, hasItem]
 */
export function useLocalStorageSet<T>(
  key: string,
  initialValue: Set<T> = new Set(),
): [
  Set<T>,
  (item: T) => void,
  (item: T) => void,
  (item: T) => void,
  () => void,
  (item: T) => boolean
] {
  // Initialize state from localStorage
  const [items, setItems] = useState<T[]>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        const parsed = JSON.parse(storedValue);
        return Array.isArray(parsed) ? parsed : Array.from(initialValue);
      }
      return Array.from(initialValue);
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return Array.from(initialValue);
    }
  });

  // Convert array to Set for easier manipulation
  const set = useMemo(() => new Set(items), [items]);

  // Update localStorage whenever items change
  const updateLocalStorage = useCallback((newItems: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(newItems));
      setItems(newItems);
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  // Add item to set
  const addItem = useCallback((item: T) => {
    setItems(prev => {
      if (!prev.includes(item)) {
        const newItems = [...prev, item];
        updateLocalStorage(newItems);
        return newItems;
      }
      return prev;
    });
  }, [updateLocalStorage]);

  // Remove item from set
  const removeItem = useCallback((item: T) => {
    setItems(prev => {
      const newItems = prev.filter((i) => i !== item);
      if (newItems.length !== prev.length) {
        updateLocalStorage(newItems);
        return newItems;
      }
      return prev;
    });
  }, [updateLocalStorage]);

  // Toggle item in set
  const toggleItem = useCallback((item: T) => {
    setItems(prev => {
      const newItems = prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item];
      updateLocalStorage(newItems);
      return newItems;
    });
  }, [updateLocalStorage]);

  // Clear all items
  const clearSet = useCallback(() => {
    updateLocalStorage([]);
  }, [updateLocalStorage]);

  // Check if item exists in set
  const hasItem = useCallback((item: T) => {
    return set.has(item);
  }, [set]);

  return [set, addItem, removeItem, toggleItem, clearSet, hasItem];
}

/**
 * Simplified version that just returns the Set and a setter function
 * Similar to useState but for Sets stored in localStorage
 */
export function useLocalStorageSetState<T>(
  key: string,
  initialValue: Set<T> = new Set(),
): [Set<T>, (updater: (prev: Set<T>) => Set<T>) => void] {
  const [items, setItems] = useState<T[]>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        const parsed = JSON.parse(storedValue);
        return Array.isArray(parsed) ? parsed : Array.from(initialValue);
      }
      return Array.from(initialValue);
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return Array.from(initialValue);
    }
  });

  const set = useMemo(() => new Set(items), [items]);

  const setSet = useCallback((updater: (prev: Set<T>) => Set<T>) => {
    setItems(prev => {
      const prevSet = new Set(prev);
      const newSet = updater(prevSet);
      const newItems = Array.from(newSet);

      try {
        localStorage.setItem(key, JSON.stringify(newItems));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }

      return newItems;
    });
  }, [key]);

  return [set, setSet];
}

export default useLocalStorageSet;
