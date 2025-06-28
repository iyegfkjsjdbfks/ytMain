import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';

import { server } from './mocks/server';

// Global type declarations
declare global {
  let testUtils: {
    mockConsole: () => () => void;
  };
}

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Close server after all tests
afterAll(() => {
  server.close();
});

// Reset handlers after each test `important for test isolation`
afterEach(() => {
  server.resetHandlers();
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

Object.defineProperty(global, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock scrollIntoView
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  writable: true,
  value: vi.fn(),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: sessionStorageMock,
});

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'mocked-object-url'),
});

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: vi.fn(),
});

// Mock fetch if not already mocked by MSW
if (!global.fetch) {
  global.fetch = vi.fn();
}

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = vi.fn((...args) => {
    // Only show React warnings and errors that are not expected
    const message = args[0];
    if (
      typeof message === 'string' &&
      (
        message.includes('Warning: ReactDOM.render is no longer supported') ||
        message.includes('Warning: validateDOMNesting') ||
        message.includes('Warning: Each child in a list should have a unique "key" prop') ||
        message.includes('act()')
      )
    ) {
      return;
    }
    originalConsoleError(...args);
  });

  console.warn = vi.fn((...args) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (
        message.includes('componentWillReceiveProps') ||
        message.includes('componentWillUpdate') ||
        message.includes('componentWillMount')
      )
    ) {
      return;
    }
    originalConsoleWarn(...args);
  });
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Mock HTMLMediaElement
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: vi.fn().mockImplementation(() => Promise.resolve()),
});

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  writable: true,
  value: vi.fn(),
});

// Mock HTMLVideoElement properties
Object.defineProperty(HTMLVideoElement.prototype, 'currentTime', {
  writable: true,
  value: 0,
});

Object.defineProperty(HTMLVideoElement.prototype, 'duration', {
  writable: true,
  value: 100,
});

Object.defineProperty(HTMLVideoElement.prototype, 'paused', {
  writable: true,
  value: true,
});

Object.defineProperty(HTMLVideoElement.prototype, 'ended', {
  writable: true,
  value: false,
});

Object.defineProperty(HTMLVideoElement.prototype, 'volume', {
  writable: true,
  value: 1,
});

Object.defineProperty(HTMLVideoElement.prototype, 'muted', {
  writable: true,
  value: false,
});

// Mock requestAnimationFrame
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: vi.fn((cb: FrameRequestCallback) => setTimeout(cb, 16)),
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: vi.fn(id => clearTimeout(id)),
});

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    getPropertyValue: vi.fn().mockReturnValue(''),
    width: '1024px',
    height: '768px',
  })),
});

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  width: 1024,
  height: 768,
  top: 0,
  left: 0,
  bottom: 768,
  right: 1024,
  x: 0,
  y: 0,
  toJSON: vi.fn(),
}));

// Mock Range for text selection
Object.defineProperty(document, 'createRange', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    setStart: vi.fn(),
    setEnd: vi.fn(),
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document,
    },
    createContextualFragment: vi.fn().mockImplementation(html => {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div;
    }),
  })),
});

// Mock Selection API
Object.defineProperty(window, 'getSelection', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    removeAllRanges: vi.fn(),
    addRange: vi.fn(),
    toString: vi.fn().mockReturnValue(''),
  })),
});

// Mock Clipboard API
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: vi.fn().mockImplementation(() => Promise.resolve()),
    readText: vi.fn().mockImplementation(() => Promise.resolve('')),
  },
});

// Mock File API
Object.defineProperty(window, 'File', {
  writable: true,
  value: class MockFile {
    constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
      this.name = name;
      this.size = bits.reduce((acc, bit) => {
        if (typeof bit === 'string') {
          return acc + bit.length;
        } else if (bit instanceof ArrayBuffer) {
          return acc + bit.byteLength;
        } else if (bit && typeof bit === 'object' && 'size' in bit) {
          return acc + (bit as any).size;
        }
        return acc;
      }, 0);
      this.type = options?.type || '';
      this.lastModified = options?.lastModified || Date.now();
    }
    name: string;
    size: number;
    type: string;
    lastModified: number;
  },
});

// Mock FileReader
Object.defineProperty(window, 'FileReader', {
  writable: true,
  value: class MockFileReader {
    static readonly EMPTY = 0;
    static readonly LOADING = 1;
    static readonly DONE = 2;

    readonly EMPTY = 0;
    readonly LOADING = 1;
    readonly DONE = 2;

    result: string | ArrayBuffer | null = null;
    error: DOMException | null = null;
    readyState: number = 0;
    onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onabort: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onloadstart: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onprogress: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

    readAsText = vi.fn().mockImplementation(() => {
      this.result = 'mock file content';
      this.readyState = 2;
      if (this.onload) {
        this.onload.call(this as any, {} as ProgressEvent<FileReader>);
      }
    });

    readAsDataURL = vi.fn().mockImplementation(() => {
      this.result = 'data:text/plain;base64,bW9jayBmaWxlIGNvbnRlbnQ=';
      this.readyState = 2;
      if (this.onload) {
        this.onload.call(this as any, {} as ProgressEvent<FileReader>);
      }
    });

    readAsArrayBuffer = vi.fn();
    readAsBinaryString = vi.fn();
    abort = vi.fn();
    addEventListener = vi.fn();
    removeEventListener = vi.fn();
    dispatchEvent = vi.fn();
  },
});

// Set up environment variables for tests
process.env.NODE_ENV = 'test';
process.env.VITE_APP_ENV = 'test';
process.env.VITE_USE_MOCK_DATA = 'true';
process.env.VITE_TEST_MODE = 'true';

// Global test utilities
global.testUtils = {
  // Add any global test utilities here
  mockConsole: () => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = vi.fn();
    console.error = vi.fn();
    console.warn = vi.fn();

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  },
};

// Extend expect with custom matchers
expect.extend({
  toBeInViewport(received: Element) {
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

  toHaveAccessibleName(received: Element, expectedName: string) {
    const accessibleName = received.getAttribute('aria-label') ||
                          received.getAttribute('aria-labelledby') ||
                          received.textContent;

    const hasExpectedName = accessibleName === expectedName;

    return {
      message: () => `expected element to have accessible name "${expectedName}" but got "${accessibleName}"`,
      pass: hasExpectedName,
    };
  },
});

// Declare global types for TypeScript
declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      toBeInViewport(): T;
      toHaveAccessibleName(expectedName: string): T;
    }
  }

}