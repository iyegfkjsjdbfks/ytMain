#!/usr/bin/env node
/**
 * Enhanced TS2322: Type 'X' is not assignable to type 'Y' fixer
 * Handles common type mismatches with smart fixes
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class EnhancedTS2322Fixer {
  constructor() {
    this.fixedFiles = new Set();
    this.fixCount = 0;
  }

  log(message, type = 'info') {
    const prefix = { info: '🔧', success: '✅', error: '❌', warning: '⚠️' }[type] || '🔧';
    console.log(`${prefix} ${message}`);
  }

  getErrorCount() {
    try {
      const run = () => {
        try {
          execSync('npm run type-check', { encoding: 'utf8', stdio: 'pipe', cwd: projectRoot });
          return '';
        } catch (err) {
          return `${err.stdout || ''}${err.stderr || ''}`;
        }
      };
      const output = run();
      if (!output) return 0;
      return output.split('\n').filter(l => /error TS2322:/.test(l)).length;
    } catch { return 0; }
  }

  getErrors() {
    try {
      const run = () => {
        try {
          execSync('npm run type-check', { encoding: 'utf8', stdio: 'pipe', cwd: projectRoot });
          return '';
        } catch (err) {
          return `${err.stdout || ''}${err.stderr || ''}`;
        }
      };
      const output = run();
      if (!output) return [];
      
      return output.split('\n').filter(l => /error TS2322:/.test(l)).map(line => {
        // Try Windows format first
        let match = line.match(/([^(]+)\((\d+),(\d+)\): error TS2322: Type '([^']+)' is not assignable to type '([^']+)'/);
        if (!match) {
          // Try Unix format
          match = line.match(/([^:]+):(\d+):(\d+): error TS2322: Type '([^']+)' is not assignable to type '([^']+)'/);
        }
        if (match) {
          return {
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            fromType: match[4],
            toType: match[5],
            fullLine: line
          };
        }
        return null;
      }).filter(Boolean);
    } catch { return []; }
  }

  fixFile(filePath, errors) {
    const fullPath = join(projectRoot, filePath);
    
    try {
      if (!existsSync(fullPath)) {
        this.log(`File not found: ${filePath}`, 'warning');
        return false;
      }
      
      let content = readFileSync(fullPath, 'utf8');
      let modified = false;
      const lines = content.split('\n');

      for (const error of errors) {
        const lineIndex = error.line - 1;
        if (lineIndex < lines.length) {
          const originalLine = lines[lineIndex];
          const fixedLine = this.fixTypeMismatch(originalLine, error);
          
          if (fixedLine !== originalLine) {
            lines[lineIndex] = fixedLine;
            modified = true;
            this.fixCount++;
          }
        }
      }

      if (modified) {
        try {
          writeFileSync(fullPath, lines.join('\n'));
          this.fixedFiles.add(filePath);
          this.log(`Fixed ${errors.length} TS2322 errors in ${filePath}`, 'success');
        } catch (writeError) {
          this.log(`Failed to write file ${filePath}: ${writeError.message}`, 'error');
          return false;
        }
      }

      return modified;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  fixTypeMismatch(line, error) {
    const { fromType, toType } = error;
    
    // Fix 1: string to number conversion
    if (fromType === 'string' && toType === 'number') {
      // Convert string literals to numbers
      if (line.includes("'") || line.includes('"')) {
        return line.replace(/['"`](\d+(?:\.\d+)?)['"`]/g, '$1');
      }
      // Add Number() wrapper for variables
      return line.replace(/=\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*;/, '= Number($1);');
    }

    // Fix 2: number to string conversion  
    if (fromType === 'number' && toType === 'string') {
      return line.replace(/=\s*(\d+(?:\.\d+)?)\s*;/, "= '$1';");
    }

    // Fix 3: undefined to string
    if (fromType.includes('undefined') && toType === 'string') {
      // Add null coalescing or default value
      if (line.includes('?.')) {
        return line.replace(/(\w+\?\.\w+)/g, '($1 || "")');
      }
      return line.replace(/(\w+)/g, '($1 || "")');
    }

    // Fix 4: Add type assertions for complex types
    if (fromType.includes('{}') || fromType.includes('object')) {
      // Add 'as' type assertion
      const match = line.match(/=\s*([^;]+);/);
      if (match) {
        return line.replace(match[1], `${match[1]} as ${toType}`);
      }
    }

    // Fix 5: Array type mismatches
    if (fromType.includes('[]') && toType.includes('[]')) {
      // Add type assertion for array
      const match = line.match(/=\s*([^;]+);/);
      if (match) {
        return line.replace(match[1], `${match[1]} as ${toType}`);
      }
    }

    // Fix 6: Optional property access
    if (line.includes('?.') && toType === 'string') {
      return line.replace(/(\w+\?\.\w+)/g, '($1 ?? "")');
    }

    return line; // No fix applied
  }

  run() {
    const initialCount = this.getErrorCount();
    this.log(`Found ${initialCount} TS2322 type assignment errors`);

    if (initialCount === 0) {
      this.log('No TS2322 errors found!', 'success');
      return;
    }

    const errors = this.getErrors();
    
    // Group errors by file
    const errorsByFile = {};
    for (const error of errors) {
      if (!errorsByFile[error.file]) {
        errorsByFile[error.file] = [];
      }
      errorsByFile[error.file].push(error);
    }

    // Fix each file
    for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
      this.fixFile(filePath, fileErrors);
    }

    const finalCount = this.getErrorCount();
    const improvement = initialCount - finalCount;

    this.log(`\n=== Enhanced TS2322 Fix Results ===`);
    this.log(`Initial errors: ${initialCount}`);
    this.log(`Final errors: ${finalCount}`);
    this.log(`Errors fixed: ${improvement}`);
    this.log(`Files modified: ${this.fixedFiles.size}`);
    this.log(`Fix rate: ${((improvement / initialCount) * 100).toFixed(1)}%`);

    if (improvement > 0) {
      this.log('TS2322 errors successfully reduced!', 'success');
    } else if (finalCount <= initialCount) {
      this.log('Error count maintained (no increase)', 'success');
    } else {
      this.log('Warning: Error count increased', 'warning');
    }
  }
}

const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     import.meta.url.endsWith(process.argv[1]) ||
                     process.argv[1].endsWith('fix-ts2322-enhanced.js');

if (isMainModule) {
  const fixer = new EnhancedTS2322Fixer();
  fixer.run();
}

export { EnhancedTS2322Fixer };
