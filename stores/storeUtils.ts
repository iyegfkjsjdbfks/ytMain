/**
 * Advanced state management utilities and patterns for Zustand
 */

import { create, type StateCreator } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { performanceMonitor } from '../utils/performanceMonitor';
import { securityUtils } from '../utils/securityUtils';

// Types
export interface StoreConfig {
  name: string;
  persist?: {
    enabled: boolean;
    storage?: 'localStorage' | 'sessionStorage' | 'secure';
    partialize?: (state: any) => any;
    version?: number;
    migrate?: (persistedState: any, version: any) => any;
  };
  devtools?: boolean;
  immer?: boolean;
  subscriptions?: boolean;
  performance?: boolean;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

export interface PaginatedState<T> {
  items: T;
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
}

export interface OptimisticUpdate<T> {
  id: string;
  data: T;
  timestamp: number;
  rollback: () => void;
}

// Storage implementations
class SecureStorage {
  static getItem(key: string): string | null {
    return securityUtils.SecureStorage.getItem(key, true);
  }

  static setItem(key: string, value: string | number): void {
    securityUtils.SecureStorage.setItem(key, value, true);
  }

  static removeItem(key: string): void {
    securityUtils.SecureStorage.removeItem(key);
  }
}

// Performance monitoring middleware
const performanceMiddleware = <T>(
  config: StateCreator<T, [], [], T>
  storeName: any): StateCreator<T, [], [], T> => {
  return (set, get, api) => {
    const originalSet = set;

    const wrappedSet = (partial: any, replace?: boolean) => {
      const startTime = performance.now();

      originalSet(partial, replace);

      const duration = performance.now() - startTime;
      performanceMonitor.trackCustomMetric(`store_${storeName}_update`, duration);

      if (import.meta.env.DEV && duration > 5) {
        console.warn(`Slow state update in ${storeName}: ${duration.toFixed(2)}ms`);
      }
    };

    return config(wrappedSet, get, api);
  };
};

// Async state utilities
export function createAsyncState<T>(initialData: T | null = null): AsyncState<T> {
  return {
    data: initialData,
    loading: false,
    error: null,
    lastFetch: null };
}

export function createAsyncActions<T>() {
  return {
    setLoading: (loading: any) => (state: any) => {
      state.loading = loading;
      if (loading) {
        state.error = null;
      }
    },

    setData: (data: T) => (state: any) => {
      state.data = data;
      state.loading = false;
      state.error = null;
      state.lastFetch = Date.now();
    },

    setError: (error: Error) => (state: any) => {
      state.error = error;
      state.loading = false;
    },

    reset: () => (state: any) => {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.lastFetch = null;
    } };
}

// Paginated state utilities
export function createPaginatedState<T>(pageSize: number = 20): PaginatedState<T> {
  return {
    items: [],
    page: 1,
    pageSize,
    total: 0,
    hasMore: true,
    loading: false,
    error: null };
}

export function createPaginatedActions<T>() {
  return {
    setItems: (items: T, total: any, page: any) => (state: any) => {
      if (page === 1) {
        state.items = items;
      } else {
        state.items = [...state.items, ...items];
      }
      state.total = total;
      state.page = page;
      state.hasMore = state.items.length < total;
      state.loading = false;
      state.error = null;
    },

    setLoading: (loading: any) => (state: any) => {
      state.loading = loading;
      if (loading) {
        state.error = null;
      }
    },

    setError: (error: Error) => (state: any) => {
      state.error = error;
      state.loading = false;
    },

    reset: () => (state: any) => {
      state.items = [];
      state.page = 1;
      state.total = 0;
      state.hasMore = true;
      state.loading = false;
      state.error = null;
    },

    removeItem: (predicate: (item: T) => boolean) => (state: any) => {
      const index = state.items.findIndex(predicate);
      if (index !== -1) {
        state.items.splice(index, 1);
        state.total = Math.max(0, state.total - 1);
      }
    },

    updateItem: (predicate: (item: T) => boolean, updates: Partial<T>) => (state: any) => {
      const index = state.items.findIndex(predicate);
      if (index !== -1) {
        Object.assign(state.items[index], updates);
      }
    } };
}

// Optimistic updates manager
export class OptimisticUpdatesManager<T> {
  private updates = new Map<string, OptimisticUpdate<T>>();

  add(id: string, data: T, rollback: () => void): void {
    this.updates.set(id, {
      id,
      data,
      timestamp: Date.now(),
      rollback });
  }

  confirm(id: string): void {
    this.updates.delete(id);
  }

  rollback(id: string): void {
    const update = this.updates.get(id);
    if (update) {
      update.rollback();
      this.updates.delete(id);
    }
  }

  rollbackAll(): void {
    for (const update of this.updates.values()) {
      update.rollback();
    }
    this.updates.clear();
  }

  getPending(): Array<OptimisticUpdate<T>> {
    return Array.from(this.updates.values());
  }

  cleanup(maxAge: number = 30000): void {
    const now = Date.now();
    for (const [id, update] of this.updates.entries()) {
      if (now - update.timestamp > maxAge) {
        update.rollback();
        this.updates.delete(id);
      }
    }
  }
}

// Enhanced store creator
export function createEnhancedStore<T>(
  stateCreator: StateCreator<T, [], [], T>
  config: StoreConfig) {
  let enhancedCreator= stateCreator;

  // Apply immer middleware
  if (config.immer) {
    enhancedCreator = immer(enhancedCreator);
  }

  // Apply performance monitoring
  if (config.performance) {
    enhancedCreator = performanceMiddleware(enhancedCreator, config.name);
  }

  // Apply subscriptions middleware
  if (config.subscriptions) {
    enhancedCreator = subscribeWithSelector(enhancedCreator);
  }

  // Apply persistence middleware
  if (config.persist?.enabled) {
    const storage = config.persist.storage === 'secure'
      ? SecureStorage
      : config.persist.storage === 'sessionStorage'
      ? sessionStorage
      : localStorage;

    const persistOptions= {
      name: config.name,
      storage: storage as any, // Type assertion for storage compatibility
      version: config.persist.version || 1 };

    if (config.persist.partialize) {
      persistOptions.partialize = config.persist.partialize;
    }

    if (config.persist.migrate) {
      persistOptions.migrate = config.persist.migrate;
    }

    enhancedCreator = persist(enhancedCreator, persistOptions);
  }

  // Apply devtools middleware
  if (config.devtools && import.meta.env.DEV) {
    enhancedCreator = devtools(enhancedCreator, { name: config.name });
  }

  return create(enhancedCreator);
}

// Store composition utilities
export function combineStores<T extends Record<string, any>>(
  stores: T): () => { [K in keyof T]: ReturnType<T[K]> } {
  return () => {
    const combined = {} as { [K in keyof T]: ReturnType<T[K]> };

    for (const [key, store] of Object.entries(stores)) {
      combined[key as keyof T] = store();
    }

    return combined;
  };
}

// Computed values utility
export function createComputed<T, R>(
  selector: (state: T) => R,
  dependencies?: (state: T) => any,
) {
  let cachedValue: R;
  let cachedDeps;

  return (state: T): R => {
    if (dependencies) {
      const currentDeps = dependencies(state);

      if (!cachedDeps || !shallowEqual(cachedDeps, currentDeps)) {
        cachedValue = selector(state);
        cachedDeps = currentDeps;
      }

      return cachedValue;
    }

    return selector(state);
  };
}

// Shallow equality check
function shallowEqual(a: any, b: any): boolean {
  if (a.length !== b.length) {
return false;
}

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
return false;
}
  }

  return true;
}

// Store debugging utilities
export class StoreDebugger {
  private static logs: Array<{
    store: string;
    action: string;
    timestamp: number;
    state;
    prevState;
  }> = [];

  static log(store: any, action: any, state: any, prevState: any): void {
    if (!import.meta.env.DEV) {
return;
}

    this.logs.push({
      store,
      action,
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(state)),
      prevState: JSON.parse(JSON.stringify(prevState)) });

    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }

  static getLogs(store?: string): typeof StoreDebugger.logs {
    return store
      ? this.logs.filter(log => log.store === store)
      : this.logs;
  }

  static clearLogs(): void {
    this.logs = [];
  }

  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Store validation utilities
export function createValidator<T extends object>(schema: {
  [K in keyof T]?: (value: T[K]) => boolean | string;
}) {
  return (state: T): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    for (const [key, validator] of Object.entries(schema)) {
      if (validator && key in state) {
        const result = (validator as (value: string | number) => boolean | string)(state[key as keyof T]);

        if (typeof result === 'string') {
          errors[key] = result;
        } else if (result === false) {
          errors[key] = `Invalid value for ${key}`;
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors };
  };
}

// Store synchronization utilities
export class StoreSynchronizer {
  private static instances = new Map<string, any>();

  static register(name: any, store: any): void {
    this.instances.set(name, store);
  }

  static sync(fromStore: any, toStore: any, mapper: (state: any) => any): void {
    const from = this.instances.get(fromStore);
    const to = this.instances.get(toStore);

    if (!from || !to) {
      console.warn(`Store synchronization failed: ${fromStore} or ${toStore} not found`);
      return;
    }

    // Subscribe to changes in the source store
    from.subscribe((state: any) => {
      const mappedState = mapper(state);
      to.setState(mappedState);
    });
  }

  static broadcast(event: Event, data: any): void {
    for (const store of this.instances.values()) {
      if (typeof store.handleBroadcast === 'function') {
        store.handleBroadcast(event, data);
      }
    }
  }
}

// Store performance analyzer
export class StorePerformanceAnalyzer {
  private static metrics = new Map<string, {
    updateCount: number;
    totalTime: number;
    averageTime: number;
    maxTime: number;
    minTime: number;
  }>();

  static trackUpdate(storeName: any, duration: any): void {
    const current = this.metrics.get(storeName) || {
      updateCount: 0,
      totalTime: 0,
      averageTime: 0,
      maxTime: 0,
      minTime: Infinity };

    current.updateCount++;
    current.totalTime += duration;
    current.averageTime = current.totalTime / current.updateCount;
    current.maxTime = Math.max(current.maxTime, duration);
    current.minTime = Math.min(current.minTime, duration);

    this.metrics.set(storeName, current);
  }

  static getMetrics(storeName?: string) {
    return storeName
      ? this.metrics.get(storeName)
      : Object.fromEntries(this.metrics.entries());
  }

  static reset(): void {
    this.metrics.clear();
  }

  static getReport(): string {
    const report = ['Store Performance Report', '='.repeat(30)];

    for (const [name, metrics] of this.metrics.entries()) {
      report.push(
        `\n${name}:`,
        `  Updates: ${metrics.updateCount}`,
        `  Average: ${metrics.averageTime.toFixed(2)}ms`,
        `  Max: ${metrics.maxTime.toFixed(2)}ms`,
        `  Min: ${metrics.minTime.toFixed(2)}ms`,
        `  Total: ${metrics.totalTime.toFixed(2)}ms`,
      );
    }

    return report.join('\n');
  }
}

// Export utilities
export const storeUtils = {
  createEnhancedStore,
  createAsyncState,
  createAsyncActions,
  createPaginatedState,
  createPaginatedActions,
  OptimisticUpdatesManager,
  combineStores,
  createComputed,
  StoreDebugger,
  createValidator,
  StoreSynchronizer,
  StorePerformanceAnalyzer };

export default storeUtils;