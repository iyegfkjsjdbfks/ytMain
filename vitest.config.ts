import React, {} from 'react';
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: 'jsdom',
    
    // Global test setup
    globals: true,
    setupFiles: ['./src/utils/test-setup.ts'],
    
    // File patterns
    include: [
      'test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      'node_modules',
      'dist',
      'build',
      'coverage'
    ],
    
    // Test timeout (increased for memory-safe execution)
    testTimeout: 30000,
    
    // Project configuration (replaces deprecated workspace)
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/components/**/*.test.{ts,tsx}', 'test/hooks/**/*.test.{ts,tsx}'],
          environment: 'jsdom'
        }
      },
      {
        test: {
          name: 'integration', 
          include: ['test/integration/**/*.test.{ts,tsx}'],
          environment: 'jsdom'
        }
      },
      {
        test: {
          name: 'services',
          include: ['test/services/**/*.test.{ts,tsx}'],
          environment: 'node'
        }
      }
    ],
    hookTimeout: 10000,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/utils/test-setup.ts',
        'src/utils/testing.tsx',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/coverage/**',
        '**/dist/**',
        '**/build/**',
        '**/types.ts',
        'src/main.tsx',
        'src/App.tsx'
      ],
      include: [
        'src/**/*.{js,jsx,ts,tsx}'
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    },
    
    // Reporter configuration
    reporter: [
      'default',
      'json',
      'html'
    ],
    outputFile: {
      json: './coverage/test-results.json',
      html: './coverage/test-results.html'
    },
    
    // Watch mode
    watch: false,
    
    // Memory-safe test execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
        maxThreads: 1,
        minThreads: 1
      }
    },
    
    // Mock configuration
    server: {
      deps: {
        inline: [
        '@testing-library/jest-dom'
      ]
      }
    },
    
    // Environment variables for memory management
    env: {
      NODE_ENV: 'test',
      VITE_APP_ENV: 'test',
      VITE_USE_MOCK_DATA: 'true',
      VITE_TEST_MODE: 'true',
      NODE_OPTIONS: "--max-old-space-size=8192"
    },
    
    // Retry configuration
    retry: 2,
    
    // Bail configuration
    bail: 0,
    
    // Silent mode
    silent: false,
    
    // UI configuration
    ui: true,
    open: false,
    
    // Browser configuration (for browser testing)
    browser: {
      enabled: false,
      name: 'chrome',
      provider: 'playwright',
      headless: true
    },
    
    // Benchmark configuration
    benchmark: {
      include: ['**/*.{bench,benchmark}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
      reporter: ['default']
    },
    
    // Type checking
    typecheck: {
      enabled: false,
      tsconfig: './tsconfig.json',
      include: ['**/*.{test,spec}-d.{ts,js}'],
      exclude: ['**/node_modules/**']
    },
    
    // Workspace configuration
    // workspace: "./vitest.workspace.ts" // Deprecated, using test.projects instead
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/utils'),
      '@services': resolve(__dirname, './src/services'),
      '@store': resolve(__dirname, './src/store'),
      '@contexts': resolve(__dirname, './src/contexts'),
      '@config': resolve(__dirname, './src/config'),
      '@types': resolve(__dirname, './src/types.ts'),
      '@assets': resolve(__dirname, './src/assets'),
      '@styles': resolve(__dirname, './src/styles'),
      '@public': resolve(__dirname, './public')
    }
  },
  
  // Define configuration
  define: {
    __TEST__: true,
    __DEV__: false,
    __PROD__: false
  },
  
  // ESBuild configuration
  esbuild: {
    target: 'node14'
  }
});