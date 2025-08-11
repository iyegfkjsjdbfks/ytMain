#!/usr/bin/env node
/**
 * Fix TS1144: '{' or ';' expected errors
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class TS1144Fixer {
  constructor() {
    this.fixedFiles = new Set();
    this.fixesApplied = 0;
  }

  log(message, type = 'info') {
    const prefix = { info: '🔧', success: '✅', error: '❌', warning: '⚠️' }[type] || '🔧';
    console.log(`${prefix} ${message}`);
  }

  getErrorCount() {
    try {
      const result = execSync('npm run type-check 2>&1', { 
        encoding: 'utf8', 
        stdio: 'pipe', 
        cwd: projectRoot 
      });
      return 0;
    } catch (err) {
      const output = `${err.stdout || ''}${err.stderr || ''}`;
      return output.split('\n').filter(line => /error TS1144:/.test(line)).length;
    }
  }

  getTS1144Errors() {
    try {
      const result = execSync('npm run type-check 2>&1', { 
        encoding: 'utf8', 
        stdio: 'pipe', 
        cwd: projectRoot 
      });
      return [];
    } catch (err) {
      const output = `${err.stdout || ''}${err.stderr || ''}`;
      const errors = [];
      
      output.split('\n').forEach(line => {
        const match = line.match(/([^(]+)\((\d+),(\d+)\):\s*error TS1144: (.+)/);
        if (match) {
          errors.push({
            file: match[1].trim(),
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            message: match[4].trim()
          });
        }
      });
      
      return errors;
    }
  }

  fixFile(filePath, errors) {
    const fullPath = join(projectRoot, filePath);
    if (!existsSync(fullPath)) {
      this.log(`File not found: ${filePath}`, 'warning');
      return;
    }

    let content = readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    let modified = false;

    // Sort errors by line number in descending order to avoid line shift issues
    const sortedErrors = errors.sort((a, b) => b.line - a.line);

    for (const error of sortedErrors) {
      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        let newLine = line;

        // Fix TS1144 errors - '{' or ';' expected
        if (error.message.includes("'{' or ';' expected")) {
          // Case 1: Missing semicolon at end of statement
          if (!newLine.trim().endsWith(';') && !newLine.trim().endsWith('{') && 
              !newLine.trim().endsWith('}') && !newLine.trim().endsWith(',')) {
            // Add semicolon if it looks like a statement
            if (newLine.includes('return ') || newLine.includes('throw ') || 
                newLine.includes('const ') || newLine.includes('let ') || 
                newLine.includes('var ') || newLine.match(/\w+\s*=\s*/)) {
              newLine = newLine.trimEnd() + ';';
            }
          }
          
          // Case 2: Missing opening brace for function/class/interface
          if (newLine.includes('function ') && !newLine.includes('{') && !newLine.endsWith(';')) {
            newLine = newLine.trimEnd() + ' {';
          }
          
          if (newLine.includes('class ') && !newLine.includes('{') && !newLine.endsWith(';')) {
            newLine = newLine.trimEnd() + ' {';
          }
          
          if (newLine.includes('interface ') && !newLine.includes('{') && !newLine.endsWith(';')) {
            newLine = newLine.trimEnd() + ' {';
          }
          
          // Case 3: Malformed object or array syntax
          if (newLine.includes(':') && !newLine.includes('{') && !newLine.includes(';')) {
            // Property definition that might need a semicolon
            if (newLine.match(/^\s*\w+\s*:\s*\w+/)) {
              newLine = newLine.trimEnd() + ';';
            }
          }
        }

        if (newLine !== line) {
          lines[lineIndex] = newLine;
          modified = true;
          this.fixesApplied++;
          this.log(`Fixed line ${error.line} in ${filePath}: ${error.message}`);
        }
      }
    }

    if (modified) {
      writeFileSync(fullPath, lines.join('\n'));
      this.fixedFiles.add(filePath);
      this.log(`Fixed ${filePath}`, 'success');
    }
  }

  run() {
    const initialCount = this.getErrorCount();
    this.log(`Found ${initialCount} TS1144 syntax errors`);

    if (initialCount === 0) {
      this.log('No TS1144 errors found!', 'success');
      return;
    }

    const errors = this.getTS1144Errors();
    this.log(`Processing ${errors.length} specific error locations`);
    
    // Group errors by file
    const errorsByFile = {};
    for (const error of errors) {
      if (!errorsByFile[error.file]) {
        errorsByFile[error.file] = [];
      }
      errorsByFile[error.file].push(error);
    }

    this.log(`Files to fix: ${Object.keys(errorsByFile).length}`);

    // Fix each file
    for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
      this.fixFile(filePath, fileErrors);
    }

    const finalCount = this.getErrorCount();
    const improvement = initialCount - finalCount;

    this.log(`\n=== TS1144 Fix Results ===`);
    this.log(`Initial errors: ${initialCount}`);
    this.log(`Final errors: ${finalCount}`);
    this.log(`Errors fixed: ${improvement}`);
    this.log(`Files modified: ${this.fixedFiles.size}`);
    this.log(`Individual fixes applied: ${this.fixesApplied}`);
    this.log(`Fix rate: ${initialCount > 0 ? ((improvement / initialCount) * 100).toFixed(1) : '0'}%`);

    if (improvement > 0) {
      this.log('TS1144 errors successfully reduced!', 'success');
    } else if (finalCount <= initialCount) {
      this.log('Error count maintained (no increase)', 'success');
    } else {
      this.log('Warning: Error count increased', 'warning');
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new TS1144Fixer();
  fixer.run();
}

export { TS1144Fixer };