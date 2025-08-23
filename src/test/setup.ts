// Jest setup file for TypeScript Error Resolution tests

import { Logger } from '../error-resolution/utils/Logger';

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };

beforeAll(() => {
  // Suppress console output during tests unless explicitly needed
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  // Restore console methods
  Object.assign(console, originalConsole);
});

// Global test utilities
global.createMockLogger = () => {
  return {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
    progress: jest.fn(),
    errorResolution: jest.fn(),
    performance: jest.fn(),
    system: jest.fn(),
    createChild: jest.fn(() => global.createMockLogger()),
    flush: jest.fn(),
    stop: jest.fn(),
    getRecentLogs: jest.fn(() => []),
    searchLogs: jest.fn(() => Promise.resolve([])),
  } as jest.Mocked<Logger>;
};

// Mock file system operations for tests
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    readdir: jest.fn(),
    stat: jest.fn(),
    access: jest.fn(),
    copyFile: jest.fn(),
    rename: jest.fn(),
    rm: jest.fn(),
    unlink: jest.fn(),
  },
  createReadStream: jest.fn(),
  createWriteStream: jest.fn(),
}));

// Mock child_process for tests
jest.mock('child_process', () => ({
  spawn: jest.fn(),
  exec: jest.fn(),
  execSync: jest.fn(),
}));

// Test timeout configuration
jest.setTimeout(30000);