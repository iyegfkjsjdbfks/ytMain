/**
 * Comprehensive testing setup and configuration
 */

import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { testUtils } from '../utils/testUtils';
import { performanceMonitor } from '../utils/performanceMonitor';
import { securityUtils } from '../utils/securityUtils';

// Global test configuration
const TEST_CONFIG = {
  timeout: 10000,
  retries: 2,
  mockApiDelay: 100,
  enablePerformanceTracking: true,
  enableSecurityAudits: false,
  mockLocalStorage: true,
  mockSessionStorage: true,
  mockIntersectionObserver: true,
  mockResizeObserver: true,
  mockMatchMedia: true,
  mockFetch: true
};

// Mock implementations
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  };
})();

const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  };
})();

const mockIntersectionObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: vi.fn(() => [])
}));

const mockResizeObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
}));

const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn()
};

const mockNotification = {
  requestPermission: vi.fn(() => Promise.resolve('granted')),
  permission: 'granted'
};

// Fetch mock with realistic responses
const createMockFetch = () => {
  return vi.fn().mockImplementation(async (url: string, options?: RequestInit) => {
    // Simulate network delay
    await testUtils.simulateNetworkDelay(TEST_CONFIG.mockApiDelay);
    
    // Default successful response
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      json: async () => ({
        success: true,
        data: testUtils.generateMockVideo(),
        timestamp: Date.now()
      }),
      text: async () => 'Mock response text',
      blob: async () => new Blob(['mock blob']),
      arrayBuffer: async () => new ArrayBuffer(8),
      clone: vi.fn()
    };
    
    // Handle specific endpoints
    if (url.includes('/api/videos')) {
      mockResponse.json = async () => ({
        success: true,
        data: Array.from({ length: 10 }, () => testUtils.generateMockVideo()),
        pagination: {
          page: 1,
          pageSize: 10,
          total: 100,
          hasMore: true
        }
      });
    }
    
    if (url.includes('/api/channels')) {
      mockResponse.json = async () => ({
        success: true,
        data: testUtils.generateMockChannel()
      });
    }
    
    if (url.includes('/api/users')) {
      mockResponse.json = async () => ({
        success: true,
        data: testUtils.generateMockUser()
      });
    }
    
    // Simulate errors for specific patterns
    if (url.includes('/error')) {
      return {
        ...mockResponse,
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({
          success: false,
          error: 'Mock server error'
        })
      };
    }
    
    if (url.includes('/unauthorized')) {
      return {
        ...mockResponse,
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({
          success: false,
          error: 'Unauthorized access'
        })
      };
    }
    
    return mockResponse;
  });
};

// Performance tracking for tests
class TestPerformanceTracker {
  private static testMetrics = new Map<string, {
    renderTime: number;
    memoryUsage: number;
    testDuration: number;
  }>();
  
  static startTest(testName: string): () => void {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    return () => {
      const endTime = performance.now();
      const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      this.testMetrics.set(testName, {
        renderTime: 0, // Will be set by render tracking
        memoryUsage: endMemory - startMemory,
        testDuration: endTime - startTime
      });
    };
  }
  
  static trackRender(testName: string, renderTime: number): void {
    const metrics = this.testMetrics.get(testName);
    if (metrics) {
      metrics.renderTime = renderTime;
    }
  }
  
  static getMetrics(testName?: string) {
    return testName 
      ? this.testMetrics.get(testName)
      : Object.fromEntries(this.testMetrics.entries());
  }
  
  static generateReport(): string {
    const report = ['Test Performance Report', '='.repeat(30)];
    
    for (const [testName, metrics] of this.testMetrics.entries()) {
      report.push(
        `\n${testName}:`,
        `  Test Duration: ${metrics.testDuration.toFixed(2)}ms`,
        `  Render Time: ${metrics.renderTime.toFixed(2)}ms`,
        `  Memory Usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`
      );
    }
    
    return report.join('\n');
  }
  
  static reset(): void {
    this.testMetrics.clear();
  }
}

// Test environment setup
beforeAll(() => {
  // Setup global mocks
  if (TEST_CONFIG.mockLocalStorage) {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
  }
  
  if (TEST_CONFIG.mockSessionStorage) {
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true
    });
  }
  
  if (TEST_CONFIG.mockIntersectionObserver) {
    Object.defineProperty(window, 'IntersectionObserver', {
      value: mockIntersectionObserver,
      writable: true
    });
  }
  
  if (TEST_CONFIG.mockResizeObserver) {
    Object.defineProperty(window, 'ResizeObserver', {
      value: mockResizeObserver,
      writable: true
    });
  }
  
  if (TEST_CONFIG.mockMatchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      value: mockMatchMedia,
      writable: true
    });
  }
  
  if (TEST_CONFIG.mockFetch) {
    global.fetch = createMockFetch();
  }
  
  // Mock other browser APIs
  Object.defineProperty(navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true
  });
  
  Object.defineProperty(window, 'Notification', {
    value: mockNotification,
    writable: true
  });
  
  // Mock crypto for security utils
  Object.defineProperty(window, 'crypto', {
    value: {
      getRandomValues: vi.fn((arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      }),
      subtle: {
        generateKey: vi.fn(() => Promise.resolve({})),
        encrypt: vi.fn(() => Promise.resolve(new ArrayBuffer(16))),
        decrypt: vi.fn(() => Promise.resolve(new ArrayBuffer(16))),
        digest: vi.fn(() => Promise.resolve(new ArrayBuffer(32)))
      }
    },
    writable: true
  });
  
  // Setup console spies for testing
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  
  // Initialize performance monitoring for tests
  if (TEST_CONFIG.enablePerformanceTracking) {
    performanceMonitor.init();
  }
  
  console.log('Test environment initialized');
});

// Cleanup after all tests
afterAll(() => {
  // Generate performance report
  if (TEST_CONFIG.enablePerformanceTracking) {
    console.log('\n' + TestPerformanceTracker.generateReport());
    console.log('\n' + performanceMonitor.getReport());
  }
  
  // Cleanup mocks
  vi.restoreAllMocks();
  
  console.log('Test environment cleaned up');
});

// Setup before each test
beforeEach(() => {
  // Clear all mocks
  vi.clearAllMocks();
  
  // Reset storage
  mockLocalStorage.clear();
  mockSessionStorage.clear();
  
  // Reset performance tracking
  if (TEST_CONFIG.enablePerformanceTracking) {
    performanceMonitor.reset();
  }
  
  // Reset security utils
  securityUtils.SecureStorage.clear();
  
  // Setup default test data
  testUtils.setupDefaultMocks();
});

// Cleanup after each test
afterEach(() => {
  // Cleanup React Testing Library
  cleanup();
  
  // Clear timers
  vi.clearAllTimers();
  
  // Reset DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  
  // Clear any pending promises
  return new Promise(resolve => setTimeout(resolve, 0));
});

// Custom test utilities
export const testHelpers = {
  // Performance tracking
  trackTestPerformance: TestPerformanceTracker.startTest,
  getTestMetrics: TestPerformanceTracker.getMetrics,
  
  // Mock management
  resetMocks: () => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    mockSessionStorage.clear();
  },
  
  // API mocking
  mockApiSuccess: (data: any) => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data })
    });
  },
  
  mockApiError: (status: number = 500, message: string = 'Server Error') => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status,
      json: async () => ({ success: false, error: message })
    });
  },
  
  // Storage helpers
  setLocalStorageItem: (key: string, value: string) => {
    mockLocalStorage.setItem(key, value);
  },
  
  getLocalStorageItem: (key: string) => {
    return mockLocalStorage.getItem(key);
  },
  
  // Async helpers
  waitForNextTick: () => new Promise(resolve => setTimeout(resolve, 0)),
  
  waitForTime: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Error boundary testing
  triggerError: (component: any) => {
    const error = new Error('Test error');
    component.componentDidCatch?.(error, { componentStack: 'test stack' });
    throw error;
  },
  
  // Accessibility testing
  checkAccessibility: async (container: HTMLElement) => {
    const { runAccessibilityAudit } = await import('../utils/accessibilityUtils');
    return runAccessibilityAudit(container);
  },
  
  // Security testing
  auditSecurity: () => {
    if (TEST_CONFIG.enableSecurityAudits) {
      const storageAudit = securityUtils.SecurityAudit.auditLocalStorage();
      const cookieAudit = securityUtils.SecurityAudit.auditCookies();
      
      return {
        storage: storageAudit,
        cookies: cookieAudit
      };
    }
    return null;
  },
  
  // Component testing helpers
  simulateUserInteraction: {
    click: (element: HTMLElement) => {
      element.click();
      return testHelpers.waitForNextTick();
    },
    
    type: async (element: HTMLInputElement, text: string) => {
      element.focus();
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      return testHelpers.waitForNextTick();
    },
    
    keyPress: (element: HTMLElement, key: string) => {
      element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      return testHelpers.waitForNextTick();
    },
    
    scroll: (element: HTMLElement, scrollTop: number) => {
      element.scrollTop = scrollTop;
      element.dispatchEvent(new Event('scroll', { bubbles: true }));
      return testHelpers.waitForNextTick();
    }
  }
};

// Export test configuration
export { TEST_CONFIG, TestPerformanceTracker };

// Export mock implementations for direct use
export {
  mockLocalStorage,
  mockSessionStorage,
  mockIntersectionObserver,
  mockResizeObserver,
  mockMatchMedia,
  mockGeolocation,
  mockNotification
};

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

console.log('Test setup completed successfully');