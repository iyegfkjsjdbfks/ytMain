#!/usr/bin/env node
/**
 * Targeted script to fix the specific remaining TS1005 errors
 * More conservative approach based on actual error patterns
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

class TargetedTS1005Fixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
    this.processedFiles = 0;
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
    
    console.log(`${colors[type]}${prefix} [${new Date().toISOString()}] ${message}${colors.reset}`);
  }

  getAllFiles(dir, extensions = ['.ts', '.tsx']) {
    const files = [];
    
    try {
      const items = readdirSync(dir);
      
      for (const item of items) {
        const fullPath = join(dir, item);
        
        try {
          const stat = statSync(fullPath);
          
          if (stat.isDirectory()) {
            if (!item.startsWith('.') && 
                !['node_modules', 'dist', 'build', 'coverage'].includes(item)) {
              files.push(...this.getAllFiles(fullPath, extensions));
            }
          } else if (extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        } catch (err) {
          // Skip files that can't be accessed
        }
      }
    } catch (err) {
      // Skip directories that can't be read
    }
    
    return files;
  }

  fixTargetedTS1005Patterns(content) {
    let fixed = content;
    let fixes = 0;

    // Revert some bad fixes by restoring correct patterns
    // Pattern 1: Restore useCallback and useEffect calls that were broken
    // Fix: useCallback((: string) => { back to useCallback(() => {
    fixed = fixed.replace(/useCallback\(\(:\s*\w+\s*\)\s*=>/g, (match) => {
      fixes++;
      return 'useCallback(() =>';
    });

    fixed = fixed.replace(/useEffect\(\(:\s*\w+\s*\)\s*=>/g, (match) => {
      fixes++;
      return 'useEffect(() =>';
    });

    // Pattern 2: Fix malformed function parameter type annotations in interface definitions
    // Example: (query, filters: SearchFilters: string) => void;
    // Should be: (query, filters: SearchFilters) => void;
    fixed = fixed.replace(/(\w+:\s*\w+):\s*string(\s*\)\s*=>\s*void)/g, (match, paramPart, rest) => {
      fixes++;
      return paramPart + rest;
    });

    // Pattern 3: Fix malformed union type annotations
    // Example: 'newest' | 'oldest' | 'popular': string
    // Should be: 'newest' | 'oldest' | 'popular'
    fixed = fixed.replace(/(\'[^']+\'\s*\|\s*\'[^']+\'\s*\|\s*\'[^']+\'):\s*string/g, (match, unionType) => {
      fixes++;
      return unionType;
    });

    // Pattern 4: Fix malformed event handler parameters
    // Example: (e: React.MouseEvent<HTMLDivElement>: string) =>
    // Should be: (e: React.MouseEvent<HTMLDivElement>) =>
    fixed = fixed.replace(/(\w+:\s*React\.\w+<[^>]+>):\s*string(\s*\)\s*=>)/g, (match, paramType, rest) => {
      fixes++;
      return paramType + rest;
    });

    // Pattern 5: Fix malformed callback parameters with complex types
    // Example: (error: Error, errorInfo: ErrorInfo: number)
    // Should be: (error: Error, errorInfo: ErrorInfo)
    fixed = fixed.replace(/(\w+:\s*\w+):\s*(string|number|boolean)(\s*[,)])/g, (match, paramType, wrongType, rest) => {
      fixes++;
      return paramType + rest;
    });

    // Pattern 6: Fix malformed generic function calls
    // Example: vi.fn(implementation || ((: number) => {}))
    // Should be: vi.fn(implementation || (() => {}))
    fixed = fixed.replace(/\(\(:\s*\w+\s*\)\s*=>\s*\{\}\)/g, (match) => {
      fixes++;
      return '(() => {})';
    });

    // Pattern 7: Fix malformed function parameter types
    // Example: (testFn: (: number) => void, 
    // Should be: (testFn: () => void,
    fixed = fixed.replace(/(\w+:\s*)\(:\s*\w+\s*\)(\s*=>\s*void)/g, (match, prefix, suffix) => {
      fixes++;
      return prefix + '()' + suffix;
    });

    // Pattern 8: Fix broken template literals
    fixed = fixed.replace(/className=\{\`([^`]*)\`\s*:\s*string/g, (match, content) => {
      fixes++;
      return `className={\`${content}\``;
    });

    return { content: fixed, fixes };
  }

  processFile(filePath) {
    this.processedFiles++;
    
    try {
      const content = readFileSync(filePath, 'utf8');
      const { content: fixedContent, fixes } = this.fixTargetedTS1005Patterns(content);
      
      if (fixes > 0) {
        writeFileSync(filePath, fixedContent, 'utf8');
        this.fixedFiles++;
        this.totalFixes += fixes;
        this.log(`Fixed ${fixes} patterns in ${filePath.replace(process.cwd(), '.')}`, 'info');
      }
      
    } catch (err) {
      this.log(`Error processing ${filePath}: ${err.message}`, 'error');
    }
  }

  async run() {
    this.log('🚀 Starting targeted TS1005 error fixes...');
    
    const files = this.getAllFiles(process.cwd());
    
    for (const file of files) {
      this.processFile(file);
    }
    
    this.log(`📁 Files processed: ${this.processedFiles}`);
    this.log(`🔧 Files fixed: ${this.fixedFiles}`);
    this.log(`✨ Total fixes applied: ${this.totalFixes}`);
    
    if (this.totalFixes > 0) {
      this.log(`🎉 Successfully fixed ${this.totalFixes} targeted TS1005 syntax errors!`, 'success');
    } else {
      this.log('No targeted TS1005 syntax errors found');
    }
  }
}

const fixer = new TargetedTS1005Fixer();
fixer.run().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});