#!/usr/bin/env node
/**
 * Fix final TS1005 comma errors specifically identified during orchestration
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

class FinalTS1005Fixer {
  constructor() {
    this.fixedCount = 0;
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    const prefix = {
      info: '🔧',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type] || '🔧';
    
    console.log(`${colors[type]}${prefix} ${message}${colors.reset}`);
  }

  fixFile(filePath, fixes) {
    try {
      let content = readFileSync(filePath, 'utf8');
      let modified = false;

      for (const fix of fixes) {
        if (content.includes(fix.search)) {
          content = content.replace(fix.search, fix.replace);
          modified = true;
          this.log(`Fixed: ${fix.description} in ${filePath}`);
          this.fixedCount++;
        }
      }

      if (modified) {
        writeFileSync(filePath, content);
        this.log(`Updated ${filePath}`, 'success');
      }
    } catch (error) {
      this.log(`Error fixing ${filePath}: ${error.message}`, 'error');
    }
  }

  async run() {
    this.log('🚀 Starting Final TS1005 Error Fixes...');

    // Fix src/lib/utils.ts
    this.fixFile('src/lib/utils.ts', [
      {
        search: 'return function executedFunction(_...args: Parameters<T>) {',
        replace: 'return function executedFunction(...args: Parameters<T>) {',
        description: 'Remove invalid underscore prefix from spread parameter'
      }
    ]);

    // Fix utils/accessibilityUtils.tsx
    this.fixFile('utils/accessibilityUtils.tsx', [
      {
        search: 'export function AccessibilityProvider(_{ children }: {children: React.ReactNode}) {',
        replace: 'export function AccessibilityProvider({ children }: {children: React.ReactNode}) {',
        description: 'Remove invalid underscore prefix from destructured parameter'
      },
      {
        search: 'export function SkipLink(_{ href, _children }: { href: string, _children: React.ReactNode }) {',
        replace: 'export function SkipLink({ href, children }: { href: string, children: React.ReactNode }) {',
        description: 'Remove invalid underscore prefixes from destructured parameters'
      }
    ]);

    // Fix utils/testUtils.tsx
    this.fixFile('utils/testUtils.tsx', [
      {
        search: 'function AllTheProviders(_{ children, queryClient, _initialEntries = [\'/\'], _mockUser }: any) {',
        replace: 'function AllTheProviders({ children, queryClient, initialEntries = [\'/\'], mockUser }: any) {',
        description: 'Remove invalid underscore prefixes from destructured parameters'
      }
    ]);

    this.log(`✨ Fixed ${this.fixedCount} TS1005 errors`, 'success');

    // Verify fixes worked
    try {
      execSync('npm run type-check', { encoding: 'utf8', stdio: 'pipe' });
      this.log('🎉 All TypeScript errors fixed!', 'success');
      return true;
    } catch (error) {
      const output = error.stdout + error.stderr;
      const errorLines = output.split('\n').filter(line => /error TS\d+:/.test(line));
      this.log(`Remaining errors: ${errorLines.length}`, 'warning');
      return errorLines.length === 0;
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new FinalTS1005Fixer();
  fixer.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { FinalTS1005Fixer };