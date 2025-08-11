#!/usr/bin/env node
/**
 * Enhanced script to fix remaining TS1005 comma-expected errors
 * Targets specific patterns that weren't caught by the previous fixer
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

class RemainingTS1005Fixer {
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

  fixRemainingTS1005Patterns(content) {
    let fixed = content;
    let fixes = 0;

    // Pattern 1: Fix malformed filter/map with type annotations in wrong place
    // Example: .filter((tag) => tag: string !== tagToRemove)
    // Should be: .filter((tag: string) => tag !== tagToRemove)
    const pattern1 = /\(([^)]+)\)\s*=>\s*([^:]+):\s*(string|number|boolean|any)\s*([^,)]+)/g;
    fixed = fixed.replace(pattern1, (match, param, expr, type, rest) => {
      fixes++;
      return `(${param.trim()}: ${type}) => ${expr.trim()}${rest}`;
    });

    // Pattern 2: Fix malformed payload assignment in dispatch
    // Example: payload: index: number
    // Should be: payload: index
    const pattern2 = /payload:\s*([^:,}]+):\s*(string|number|boolean|any)([,}])/g;
    fixed = fixed.replace(pattern2, (match, varName, type, ending) => {
      fixes++;
      return `payload: ${varName.trim()}${ending}`;
    });

    // Pattern 3: Fix malformed type guards
    // Example: .filter((id): id: string is string => id: string !== null)
    // Should be: .filter((id): id is string => id !== null)
    const pattern3 = /\(([^)]+)\):\s*([^:]+):\s*(string|number|boolean|any)\s+is\s+(string|number|boolean|any)\s*=>\s*([^:]+):\s*(string|number|boolean|any)\s*([^,)]+)/g;
    fixed = fixed.replace(pattern3, (match, param, expr, type1, type2, expr2, type3, rest) => {
      fixes++;
      return `(${param.trim()}): ${expr.trim()} is ${type2} => ${expr2.trim()}${rest}`;
    });

    // Pattern 4: Fix duplicate type annotations in arrow function parameters
    // Example: (a: any, b: any) => a: any + b: any
    // Should be: (a: any, b: any) => a + b
    const pattern4 = /=>\s*([^:,}()\[\]]+):\s*(string|number|boolean|any)\s*\+\s*([^:,}()\[\]]+):\s*(string|number|boolean|any)/g;
    fixed = fixed.replace(pattern4, (match, var1, type1, var2, type2) => {
      fixes++;
      return `=> ${var1.trim()} + ${var2.trim()}`;
    });

    // Pattern 5: Fix malformed object property with type annotation
    // Example: name: `Channel ${id: string}`
    // Should be: name: `Channel ${id}`
    const pattern5 = /`([^`]*)\$\{([^:}]+):\s*(string|number|boolean|any)\s*\}([^`]*)`/g;
    fixed = fixed.replace(pattern5, (match, before, expr, type, after) => {
      fixes++;
      return `\`${before}\${${expr.trim()}}${after}\``;
    });

    // Pattern 6: Fix malformed callback with type annotation
    // Example: callback: (value: any) => formatCurrency(value: any)
    // Should be: callback: (value: any) => formatCurrency(value)
    const pattern6 = /(\w+)\(\s*([^:,)]+):\s*(string|number|boolean|any)\s*\)/g;
    fixed = fixed.replace(pattern6, (match, funcName, param, type) => {
      // Only fix if this looks like a function call (not a parameter declaration)
      if (match.includes('=>') || match.includes('callback:')) {
        fixes++;
        return `${funcName}(${param.trim()})`;
      }
      return match;
    });

    return { content: fixed, fixes };
  }

  processFile(filePath) {
    this.processedFiles++;
    
    try {
      const content = readFileSync(filePath, 'utf8');
      const { content: fixedContent, fixes } = this.fixRemainingTS1005Patterns(content);
      
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
    this.log('🚀 Starting remaining TS1005 error fixes...');
    
    const files = this.getAllFiles(process.cwd());
    
    for (const file of files) {
      this.processFile(file);
    }
    
    this.log(`📁 Files processed: ${this.processedFiles}`);
    this.log(`🔧 Files fixed: ${this.fixedFiles}`);
    this.log(`✨ Total fixes applied: ${this.totalFixes}`);
    
    if (this.totalFixes > 0) {
      this.log(`🎉 Successfully fixed ${this.totalFixes} remaining TS1005 syntax errors!`, 'success');
    } else {
      this.log('No remaining TS1005 syntax errors found');
    }
  }
}

const fixer = new RemainingTS1005Fixer();
fixer.run().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});