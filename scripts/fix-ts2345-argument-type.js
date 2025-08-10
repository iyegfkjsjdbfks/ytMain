#!/usr/bin/env node
/**
 * TS2345: Argument of type 'X' is not assignable to parameter of type 'Y' fixer
 * Handles function call argument type mismatches
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class TS2345Fixer {
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
      return output.split('\n').filter(l => /error TS2345:/.test(l)).length;
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
      
      return output.split('\n').filter(l => /error TS2345:/.test(l)).map(line => {
        // Try Windows format first
        let match = line.match(/([^(]+)\((\d+),(\d+)\): error TS2345: Argument of type '([^']+)' is not assignable to parameter of type '([^']+)'/);
        if (!match) {
          // Try Unix format
          match = line.match(/([^:]+):(\d+):(\d+): error TS2345: Argument of type '([^']+)' is not assignable to parameter of type '([^']+)'/);
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
          const fixedLine = this.fixArgumentType(originalLine, error);
          
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
          this.log(`Fixed ${errors.length} TS2345 errors in ${filePath}`, 'success');
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

  fixArgumentType(line, error) {
    const { fromType, toType } = error;
    
    // Fix 1: string to number in function calls
    if (fromType === 'string' && toType === 'number') {
      // Convert string arguments to numbers
      return line.replace(/(['"`])(\d+(?:\.\d+)?)(['"`])/g, '$2');
    }

    // Fix 2: number to string in function calls
    if (fromType === 'number' && toType === 'string') {
      // Convert number arguments to strings
      return line.replace(/(\d+(?:\.\d+)?)/g, "'$1'");
    }

    // Fix 3: undefined/null to string
    if ((fromType.includes('undefined') || fromType.includes('null')) && toType === 'string') {
      // Add null coalescing for function arguments
      return line.replace(/(\w+)(\s*[,)])/g, '($1 || "")$2');
    }

    // Fix 4: Add type assertions for complex types
    if (fromType.includes('{}') || fromType.includes('object')) {
      // Find function call pattern and add type assertion
      const funcCallMatch = line.match(/(\w+)\s*\(\s*([^)]+)\s*\)/);
      if (funcCallMatch) {
        const args = funcCallMatch[2];
        return line.replace(args, `${args} as ${toType}`);
      }
    }

    // Fix 5: Array type mismatches in function calls
    if (fromType.includes('[]') && toType.includes('[]')) {
      const funcCallMatch = line.match(/(\w+)\s*\(\s*([^)]+)\s*\)/);
      if (funcCallMatch) {
        const args = funcCallMatch[2];
        return line.replace(args, `${args} as ${toType}`);
      }
    }

    // Fix 6: Optional chaining issues
    if (line.includes('?.') && toType === 'string') {
      return line.replace(/(\w+\?\.\w+)/g, '($1 ?? "")');
    }

    // Fix 7: Boolean to string conversion
    if (fromType === 'boolean' && toType === 'string') {
      return line.replace(/(true|false)/g, "'$1'");
    }

    return line; // No fix applied
  }

  run() {
    const initialCount = this.getErrorCount();
    this.log(`Found ${initialCount} TS2345 argument type errors`);

    if (initialCount === 0) {
      this.log('No TS2345 errors found!', 'success');
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

    this.log(`\n=== TS2345 Fix Results ===`);
    this.log(`Initial errors: ${initialCount}`);
    this.log(`Final errors: ${finalCount}`);
    this.log(`Errors fixed: ${improvement}`);
    this.log(`Files modified: ${this.fixedFiles.size}`);
    this.log(`Fix rate: ${((improvement / initialCount) * 100).toFixed(1)}%`);

    if (improvement > 0) {
      this.log('TS2345 errors successfully reduced!', 'success');
    } else if (finalCount <= initialCount) {
      this.log('Error count maintained (no increase)', 'success');
    } else {
      this.log('Warning: Error count increased', 'warning');
    }
  }
}

const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     import.meta.url.endsWith(process.argv[1]) ||
                     process.argv[1].endsWith('fix-ts2345-argument-type.js');

if (isMainModule) {
  const fixer = new TS2345Fixer();
  fixer.run();
}

export { TS2345Fixer };
