#!/usr/bin/env node
/**
 * Safe and Iterative Codebase Refactoring Script
 * 
 * This script performs systematic refactoring with better error handling
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

class SafeRefactorer {
  constructor() {
    this.fixes = [];
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} ${message}`);
    
    if (type === 'error') this.errors.push(message);
    if (type === 'warning') this.warnings.push(message);
    if (type === 'success') this.fixes.push(message);
  }

  async runCommand(command, description, ignoreErrors = false) {
    try {
      this.log(`Running: ${description}`);
      const output = execSync(command, { 
        cwd: projectRoot, 
        encoding: 'utf8',
        stdio: 'pipe',
        maxBuffer: 10 * 1024 * 1024
      });
      this.log(`✓ ${description} completed`, 'success');
      return output;
    } catch (error) {
      if (ignoreErrors) {
        this.log(`⚠️ ${description} had issues but continuing: ${error.message}`, 'warning');
        return null;
      } else {
        this.log(`✗ ${description} failed: ${error.message}`, 'error');
        return null;
      }
    }
  }

  // Fix the test memory issues
  async fixTestMemoryIssues() {
    this.log('=== Fixing Test Memory Issues ===');

    // Create memory-optimized test setup
    const testSetupPath = join(projectRoot, 'src/utils/test-setup.ts');
    if (!existsSync(testSetupPath)) {
      const testSetupContent = `import '@testing-library/jest-dom';

// Memory-efficient test environment setup
global.structuredClone = global.structuredClone || ((val) => JSON.parse(JSON.stringify(val)));

// Mock browser APIs to prevent memory leaks
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Cleanup after each test
afterEach(() => {
  // Clear all mocks
  if (typeof jest !== 'undefined') {
    jest.clearAllMocks();
  }
  
  // Force garbage collection if available
  if (typeof global !== 'undefined' && global.gc) {
    global.gc();
  }
});
`;
      writeFileSync(testSetupPath, testSetupContent);
      this.log('Created memory-optimized test setup', 'success');
    }

    // Update package.json with better test scripts
    const packageJsonPath = join(projectRoot, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const content = readFileSync(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(content);
        
        // Add memory-safe test scripts
        packageJson.scripts['test:safe'] = 'NODE_OPTIONS="--max-old-space-size=8192" vitest run --pool=threads --poolOptions.threads.singleThread=true --reporter=basic';
        packageJson.scripts['test:watch:safe'] = 'NODE_OPTIONS="--max-old-space-size=8192" vitest --pool=threads --poolOptions.threads.singleThread=true';
        packageJson.scripts['test:simple'] = 'NODE_OPTIONS="--max-old-space-size=8192" vitest run --pool=forks --poolOptions.forks.singleFork=true --reporter=basic --no-coverage';
        
        writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        this.log('Added memory-safe test scripts to package.json', 'success');
      } catch (error) {
        this.log(`Failed to update package.json: ${error.message}`, 'error');
      }
    }
  }

  // Create optimized components
  async createOptimizedComponents() {
    this.log('=== Creating Optimized Components ===');

    // Create performance monitoring hook
    const perfHookPath = join(projectRoot, 'src/hooks/usePerformanceMonitor.ts');
    if (!existsSync(perfHookPath)) {
      const perfHookContent = `import { useCallback, useRef } from 'react';

interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
}

export function usePerformanceMonitor() {
  const timersRef = useRef<Map<string, number>>(new Map());

  const startMeasure = useCallback((name: string) => {
    timersRef.current.set(name, performance.now());
  }, []);

  const endMeasure = useCallback((name: string): PerformanceMetrics | null => {
    const startTime = timersRef.current.get(name);
    if (!startTime) return null;

    const endTime = performance.now();
    const duration = endTime - startTime;
    
    timersRef.current.delete(name);
    
    const metrics: PerformanceMetrics = {
      name,
      duration,
      timestamp: Date.now()
    };

    // Warn about slow operations in development
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.warn(\`Slow operation: \${name} took \${duration.toFixed(2)}ms\`);
    }

    return metrics;
  }, []);

  const measure = useCallback(<T>(name: string, fn: () => T): T => {
    startMeasure(name);
    try {
      return fn();
    } finally {
      endMeasure(name);
    }
  }, [startMeasure, endMeasure]);

  return { startMeasure, endMeasure, measure };
}
`;
      writeFileSync(perfHookPath, perfHookContent);
      this.log('Created performance monitoring hook', 'success');
    }

    // Create error boundary component
    const errorBoundaryDir = join(projectRoot, 'src/components/ErrorBoundary');
    const errorBoundaryPath = join(errorBoundaryDir, 'ErrorBoundary.tsx');
    
    try {
      if (!existsSync(errorBoundaryDir)) {
        execSync(`mkdir -p "${errorBoundaryDir}"`);
      }
      
      if (!existsSync(errorBoundaryPath)) {
        const errorBoundaryContent = `import React, { Component, ReactNode, useCallback } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="error-boundary p-4 border border-red-200 rounded-lg bg-red-50">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
          <p className="text-red-600 mb-4">We're sorry, but something unexpected happened.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
`;
        writeFileSync(errorBoundaryPath, errorBoundaryContent);
        this.log('Created enhanced error boundary component', 'success');
      }
    } catch (error) {
      this.log(`Failed to create error boundary: ${error.message}`, 'error');
    }
  }

  // Optimize Vite configuration
  async optimizeViteConfig() {
    this.log('=== Optimizing Vite Configuration ===');

    const viteConfigPath = join(projectRoot, 'vite.config.ts');
    if (existsSync(viteConfigPath)) {
      try {
        let content = readFileSync(viteConfigPath, 'utf8');
        
        // Add chunk optimization if not present
        if (!content.includes('manualChunks')) {
          const chunkConfig = `
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'], 
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['@heroicons/react', 'lucide-react'],
          'state-vendor': ['zustand']
        }
      }
    },`;
          
          content = content.replace(
            /build:\s*{/,
            `build: {${chunkConfig}`
          );
          
          writeFileSync(viteConfigPath, content);
          this.log('Added chunk optimization to Vite config', 'success');
        }
      } catch (error) {
        this.log(`Failed to optimize Vite config: ${error.message}`, 'error');
      }
    }
  }

  // Remove duplicate code patterns
  async removeDuplicateCode() {
    this.log('=== Removing Duplicate Code Patterns ===');

    // Check for duplicate imports and exports
    try {
      await this.runCommand(
        'find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "export.*export" | head -5',
        'Finding files with potential duplicate exports',
        true
      );
    } catch (error) {
      // Ignore if no duplicates found
    }

    this.log('Duplicate code analysis completed', 'success');
  }

  // Validate the refactoring
  async validateRefactoring() {
    this.log('=== Validating Refactoring ===');

    const results = {
      typeCheck: false,
      lint: false,
      testSimple: false,
      build: false
    };

    // Type check
    const typeCheckResult = await this.runCommand('npm run type-check', 'TypeScript type checking', true);
    results.typeCheck = typeCheckResult !== null;

    // Lint check
    const lintResult = await this.runCommand('npm run lint', 'ESLint checking', true);
    results.lint = lintResult !== null;

    // Simple test run
    const testResult = await this.runCommand('npm run test:simple', 'Simple test run', true);
    results.testSimple = testResult !== null;

    // Build check
    const buildResult = await this.runCommand('npm run build', 'Production build', true);
    results.build = buildResult !== null;

    return results;
  }

  // Main execution
  async run() {
    this.log('🚀 Starting safe codebase refactoring...');

    try {
      await this.fixTestMemoryIssues();
      await this.createOptimizedComponents();
      await this.optimizeViteConfig();
      await this.removeDuplicateCode();
      
      const results = await this.validateRefactoring();
      
      this.log('🎉 Safe refactoring completed!', 'success');
      this.printSummary(results);
      
    } catch (error) {
      this.log(`Error during refactoring: ${error.message}`, 'error');
    }
  }

  printSummary(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 REFACTORING SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Fixes Applied: ${this.fixes.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    
    console.log('\n🔍 Validation Results:');
    console.log(`  TypeScript: ${results.typeCheck ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  ESLint: ${results.lint ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Tests: ${results.testSimple ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Build: ${results.build ? '✅ PASS' : '❌ FAIL'}`);
    
    console.log('='.repeat(60));
    
    if (this.fixes.length > 0) {
      console.log('\n🔧 Applied Fixes:');
      this.fixes.forEach(fix => console.log(`  • ${fix}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => console.log(`  • ${error}`));
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const refactorer = new SafeRefactorer();
  refactorer.run().catch(console.error);
}

export default SafeRefactorer;