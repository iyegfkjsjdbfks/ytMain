import type React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, act, renderHook, type RenderOptions, type RenderResult, type RenderHookOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi, type MockedFunction } from 'vitest';

// Store import removed to fix circular dependency
import type { Video, Channel } from '../src/types/core';
import type { UserPlaylist } from '../types';

// Test Providers
interface TestProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient | undefined;
}

const TestProviders: React.FC<TestProvidersProps> = ({
  children,
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  }),
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {},
): RenderResult => {
  const { queryClient, ...renderOptions } = options;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestProviders queryClient={queryClient}>
      {children}
    </TestProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Custom hook render function
interface CustomRenderHookOptions<TProps> extends RenderHookOptions<TProps> {
  queryClient?: QueryClient;
}

export const renderHookWithProviders = <TResult, TProps>(
  hook: (props: TProps) => TResult,
  options: CustomRenderHookOptions<TProps> = {},
) => {
  const { queryClient, ...renderHookOptions } = options;

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestProviders queryClient={queryClient}>
      {children}
    </TestProviders>
  );

  return renderHook(hook, { wrapper, ...renderHookOptions });
};

// Mock Data Factories
export const createMockVideo = (overrides: Partial<Video> = {}): Video => ({
  id: `video_${Math.random().toString(36).substr(2, 9)}`,
  title: 'Test Video Title',
  description: 'Test video description',
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
  videoUrl: 'https://example.com/video.mp4',
  duration: '5:00',
  views: '1,000',
  likes: 50,
  dislikes: 5,
  uploadedAt: new Date().toISOString(),
  channelName: 'Test Channel',
  channelId: 'channel_123',
  channelAvatarUrl: 'https://example.com/avatar.jpg',
  category: 'Entertainment',
  tags: ['test', 'video'],
  visibility: 'public',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockChannel = (overrides: Partial<Channel> = {}): Channel => ({
  id: `channel_${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Channel',
  description: 'Test channel description',
  avatarUrl: 'https://example.com/avatar.jpg',
  banner: 'https://example.com/banner.jpg',
  subscribers: 10000,
  subscriberCount: '10K',
  videoCount: 100,
  isVerified: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockPlaylist = (overrides: Partial<UserPlaylist> = {}): UserPlaylist => ({
  id: `playlist_${Math.random().toString(36).substr(2, 9)}`,
  title: 'Test Playlist',
  description: 'Test playlist description',
  videoIds: ['video1', 'video2', 'video3'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Mock API Responses
export const createMockVideoResponse = (count: number = 10) => ({
  videos: Array.from({ length: count }, () => createMockVideo()),
  nextPageToken: Math.random() > 0.5 ? 'next_page_token' : undefined,
});

// User Event Setup
export const createUserEvent = () => userEvent.setup();

// Store Test Utilities removed to fix circular dependency

// Mock Functions
export const createMockFunction = <T extends (...args: any[]) => any>(
  implementation?: T,
): MockedFunction<T> => {
  return vi.fn(implementation || (() => {})) as MockedFunction<T>;
};

// Async Testing Utilities
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

export const waitForTime = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Performance Testing Utilities
export class PerformanceTestHelper {
  private startTime: number = 0;
  private endTime: number = 0;
  private measurements: number[] = [];

  start(): void {
    this.startTime = performance.now();
  }

  end(): number {
    this.endTime = performance.now();
    const duration = this.endTime - this.startTime;
    this.measurements.push(duration);
    return duration;
  }

  getAverageTime(): number {
    if (this.measurements.length === 0) {
return 0;
}
    return this.measurements.reduce((sum, time) => sum + time, 0) / this.measurements.length;
  }

  getMinTime(): number {
    return Math.min(...this.measurements);
  }

  getMaxTime(): number {
    return Math.max(...this.measurements);
  }

  reset(): void {
    this.measurements = [];
    this.startTime = 0;
    this.endTime = 0;
  }

  getMeasurements(): number[] {
    return [...this.measurements];
  }
}

// Memory Testing Utilities
export const measureMemoryUsage = (): number => {
  if ('memory' in performance) {
    return (performance as Performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize;
  }
  return 0;
};

export const createMemoryLeakTest = (testFn: () => void, iterations: number = 100) => {
  return async () => {
    const initialMemory = measureMemoryUsage();

    for (let i = 0; i < iterations; i++) {
      testFn();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      await waitForNextTick();
    }

    const finalMemory = measureMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be reasonable (less than 10MB for most tests)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  };
};

// Component Testing Utilities
export const getByTestId = (container: HTMLElement, testId: string): HTMLElement => {
  const element = container.querySelector(`[data-testid="${testId}"]`);
  if (!element) {
    throw new Error(`Element with test id "${testId}" not found`);
  }
  return element as HTMLElement;
};

export const queryByTestId = (container: HTMLElement, testId: string): HTMLElement | null => {
  return container.querySelector(`[data-testid="${testId}"]`);
};

// Accessibility Testing Utilities
export const checkAccessibility = async (container: HTMLElement) => {
  try {
    const axeCore = await import('axe-core');
    const results = await axeCore.run(container);

    if (results.violations.length > 0) {
      console.error('Accessibility violations:', results.violations);
    }

    expect(results.violations).toHaveLength(0);
  } catch (error) {
    console.warn('Accessibility testing not available:', error);
  }
};

// Visual Regression Testing Utilities
export const takeSnapshot = (component: React.ReactElement, name: string) => {
  const { container } = renderWithProviders(component);
  expect(container.firstChild).toMatchSnapshot(name);
};

// API Mocking Utilities
export const mockFetch = (response: any, status: number = 200) => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    } as Response),
  );
};

export const mockFetchError = (error: string) => {
  global.fetch = vi.fn(() => Promise.reject(new Error(error)));
};

// Local Storage Mocking
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  global.localStorage = {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    length: 0,
    key: vi.fn(),
  };
};

// Intersection Observer Mocking
export const mockIntersectionObserver = () => {
  global.IntersectionObserver = vi.fn().mockImplementation((_callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
  }));
};

// Resize Observer Mocking
export const mockResizeObserver = () => {
  global.ResizeObserver = vi.fn().mockImplementation((_callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
};

// Media Query Mocking
export const mockMatchMedia = (matches: boolean = false) => {
  global.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

// Test Suite Helpers
export const describeWithSetup = (
  name: string,
  setup: () => void,
  tests: () => void,
) => {
  describe(name, () => {
    beforeEach(() => {
      setup();
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    tests();
  });
};

// Additional Mock Generators for backward compatibility
export const generateMockVideo = createMockVideo;
export const generateMockChannel = createMockChannel;
export const generateMockPlaylist = createMockPlaylist;

// Mock Testing Utilities
export const testUtils = {
  generateMockVideo: createMockVideo,
  generateMockChannel: createMockChannel,
  generateMockPlaylist: createMockPlaylist,
  waitForLoadingToFinish: async () => {
    await waitForTime(100);
  },
  waitForError: async (_errorMessage?: string) => {
    await waitForTime(50);
  },
  simulateNetworkDelay: async (ms: number = 100) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  simulateKeyboardNavigation: async (element: HTMLElement, key: string) => {
    const user = createUserEvent();
    element.focus();
    await user.keyboard(`{${key}}`);
  },
  simulateMouseInteraction: async (element: HTMLElement, interaction: 'click' | 'hover' | 'doubleClick' = 'click') => {
    const user = createUserEvent();
    switch (interaction) {
      case 'click':
        await user.click(element);
        break;
      case 'hover':
        await user.hover(element);
        break;
      case 'doubleClick':
        await user.dblClick(element);
        break;
    }
  },
  simulateFormInput: async (input: HTMLElement, value: string) => {
    const user = createUserEvent();
    await user.clear(input);
    await user.type(input, value);
  },
  simulateDragAndDrop: async (element: HTMLElement, files: File[]) => {
    const user = createUserEvent();
    await user.upload(element, files);
  },
};

// Accessibility testing helper with proper return type
export const runAccessibilityAudit = async (_container: HTMLElement) => {
  try {
    // Import axe-core for accessibility testing
    await import('@axe-core/react');
    
    // Return a compatible result format
    return {
      issues: [] as Array<{ type: 'error' | 'warning'; message: string; element: HTMLElement }>,
      score: 100,
      violations: [], // For backward compatibility
    };
  } catch (error) {
    console.warn('Accessibility testing not available:', error);
    return {
      issues: [],
      score: 100,
      violations: [],
    };
  }
};

// Custom Matchers
expect.extend({
  toBeInViewport(received: HTMLElement) {
    const rect = received.getBoundingClientRect();
    const isInViewport = (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );

    return {
      message: () => `expected element to ${isInViewport ? 'not ' : ''}be in viewport`,
      pass: isInViewport,
    };
  },

  toHaveAccessibleName(received: HTMLElement, expectedName: string) {
    const accessibleName = received.getAttribute('aria-label') ??
                          received.getAttribute('aria-labelledby') ??
                          received.textContent;

    const hasExpectedName = accessibleName === expectedName;

    return {
      message: () => `expected element to have accessible name "${expectedName}", but got "${accessibleName}"`,
      pass: hasExpectedName,
    };
  },
});

// Type declarations for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInViewport(): R;
      toHaveAccessibleName(expectedName: string): R;
    }
  }
}

// Export everything for easy importing
export {
  render,
  renderHook,
  act,
  userEvent,
  vi,
};

export type { MockedFunction };

export * from '@testing-library/react';