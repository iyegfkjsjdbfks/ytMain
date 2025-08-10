#!/usr/bin/env node
/**
 * Syntax Error Fixer - Fixes common syntax issues introduced by automated fixes
 * Handles TS1003, TS1382, TS1136, and other syntax errors
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class SyntaxErrorFixer {
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
      return output.split('\n').filter(l => /error TS1\d+:/.test(l)).length;
    } catch { return 0; }
  }

  getSyntaxErrors() {
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
      
      return output.split('\n').filter(l => /error TS1\d+:/.test(l)).map(line => {
        // Try Windows format first
        let match = line.match(/([^(]+)\((\d+),(\d+)\): error (TS1\d+): (.+)/);
        if (!match) {
          // Try Unix format
          match = line.match(/([^:]+):(\d+):(\d+): error (TS1\d+): (.+)/);
        }
        if (match) {
          return {
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            errorCode: match[4],
            message: match[5],
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
          const fixedLine = this.fixSyntaxError(originalLine, error);
          
          if (fixedLine !== originalLine) {
            lines[lineIndex] = fixedLine;
            modified = true;
            this.fixCount++;
            this.log(`Fixed ${error.errorCode} in ${filePath}:${error.line}`);
          }
        }
      }

      if (modified) {
        try {
          writeFileSync(fullPath, lines.join('\n'));
          this.fixedFiles.add(filePath);
          this.log(`Fixed ${errors.length} syntax errors in ${filePath}`, 'success');
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

  fixSyntaxError(line, error) {
    const { errorCode, message } = error;
    
    // Fix TS1003: Identifier expected
    if (errorCode === 'TS1003') {
      // Fix malformed JSX comparison operators
      if (line.includes('&gt;') || line.includes('&lt;')) {
        return line.replace(/&gt;/g, '>').replace(/&lt;/g, '<');
      }
      
      // Fix missing identifiers in destructuring
      if (line.includes('{ ,') || line.includes(', }')) {
        return line.replace(/{\s*,/g, '{').replace(/,\s*}/g, '}');
      }
      
      // Fix malformed object properties
      if (line.includes('{ :') || line.includes(': }')) {
        return line.replace(/{\s*:/g, '{').replace(/:\s*}/g, '}');
      }
    }

    // Fix TS1382: Unexpected token (JSX issues)
    if (errorCode === 'TS1382') {
      if (message.includes('Did you mean') && message.includes('&gt;')) {
        // Fix JSX comparison in expressions
        return line.replace(/>/g, '{">"}').replace(/</g, '{"<"}');
      }
    }

    // Fix TS1136: Property assignment expected
    if (errorCode === 'TS1136') {
      // Fix malformed object literals
      if (line.includes('{ }') || line.includes('{}')) {
        return line.replace(/{\s*}/g, '{}');
      }
      
      // Fix missing property values
      if (line.match(/{\s*\w+\s*}/)) {
        return line.replace(/{\s*(\w+)\s*}/, '{ $1: $1 }');
      }
    }

    // Fix TS1005: Expected token
    if (errorCode === 'TS1005') {
      // Fix missing semicolons
      if (!line.trim().endsWith(';') && !line.trim().endsWith('}') && !line.trim().endsWith('{')) {
        return line + ';';
      }
    }

    // Fix TS1109: Expression expected
    if (errorCode === 'TS1109') {
      // Fix empty expressions
      if (line.includes('()')) {
        return line.replace(/\(\)/g, '');
      }
    }

    return line; // No fix applied
  }

  run() {
    const initialCount = this.getErrorCount();
    this.log(`Found ${initialCount} syntax errors`);

    if (initialCount === 0) {
      this.log('No syntax errors found!', 'success');
      return;
    }

    const errors = this.getSyntaxErrors();
    
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

    this.log(`\n=== Syntax Error Fix Results ===`);
    this.log(`Initial errors: ${initialCount}`);
    this.log(`Final errors: ${finalCount}`);
    this.log(`Errors fixed: ${improvement}`);
    this.log(`Files modified: ${this.fixedFiles.size}`);
    this.log(`Fix rate: ${((improvement / initialCount) * 100).toFixed(1)}%`);

    if (improvement > 0) {
      this.log('Syntax errors successfully reduced!', 'success');
    } else if (finalCount <= initialCount) {
      this.log('Error count maintained (no increase)', 'success');
    } else {
      this.log('Warning: Error count increased', 'warning');
    }
  }
}

const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     import.meta.url.endsWith(process.argv[1]) ||
                     process.argv[1].endsWith('fix-syntax-errors.js');

if (isMainModule) {
  const fixer = new SyntaxErrorFixer();
  fixer.run();
}

export { SyntaxErrorFixer };
