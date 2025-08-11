#!/usr/bin/env node
/**
 * Fix critical TS1005 syntax errors that are blocking compilation
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class CriticalTS1005Fixer {
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
      return 0; // No errors
    } catch (err) {
      const output = `${err.stdout || ''}${err.stderr || ''}`;
      return output.split('\n').filter(line => /error TS1005:/.test(line)).length;
    }
  }

  getTS1005Errors() {
    try {
      const result = execSync('npm run type-check 2>&1', { 
        encoding: 'utf8', 
        stdio: 'pipe', 
        cwd: projectRoot 
      });
      return []; // No errors
    } catch (err) {
      const output = `${err.stdout || ''}${err.stderr || ''}`;
      const errors = [];
      
      output.split('\n').forEach(line => {
        const match = line.match(/([^(]+)\((\d+),(\d+)\):\s*error TS1005: (.+)/);
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

        // Fix common TS1005 syntax errors
        if (error.message.includes("':' expected") || error.message.includes("'(' expected")) {
          // Fix missing colon in function return types: ") Promise<" -> "): Promise<"
          newLine = newLine.replace(/\)\s+Promise</g, '): Promise<');
          newLine = newLine.replace(/\)\s+([A-Z][a-zA-Z]*)</, '): $1<');
          newLine = newLine.replace(/\)\s+([a-z]+)(<|;|\s*{)/, '): $1$2');
          newLine = newLine.replace(/\)\s+string\s*{/, '): string {');
          newLine = newLine.replace(/\)\s+number\s*{/, '): number {');
          newLine = newLine.replace(/\)\s+boolean\s*{/, '): boolean {');
          newLine = newLine.replace(/\)\s+void\s*{/, '): void {');
          // Handle async functions specifically
          newLine = newLine.replace(/async\s+(\w+)\([^)]*\)\s+Promise</g, 'async $1($&): Promise<'.replace('$&', ''));
        }
        
        if (error.message.includes("';' expected")) {
          // Remove extra semicolons in object literals and fix improper syntax
          newLine = newLine.replace(/,\s*{;\s*/g, ', {');
          newLine = newLine.replace(/{\s*;/g, '{');
          newLine = newLine.replace(/method:\s*'[^']*',?\s*;/g, (match) => match.replace(';', ''));
          // Fix cases like "fetch(`url`, {;" -> "fetch(`url`, {"
          newLine = newLine.replace(/,\s*{\s*;/g, ', {');
          newLine = newLine.replace(/\(\s*`[^`]*`,\s*{\s*;/g, (match) => match.replace(';', ''));
          // More general case: remove semicolon after opening brace
          newLine = newLine.replace(/{\s*;/g, '{');
        }
        
        if (error.message.includes("',' expected")) {
          // Fix missing commas in object literals and type definitions
          newLine = newLine.replace(/'\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, "', $1:");
          newLine = newLine.replace(/}\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, "}, $1:");
          // Fix cases where method params continue on next line
          newLine = newLine.replace(/\)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '), $1:');
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
    this.log(`Found ${initialCount} TS1005 syntax errors`);

    if (initialCount === 0) {
      this.log('No TS1005 errors found!', 'success');
      return;
    }

    const errors = this.getTS1005Errors();
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

    this.log(`\n=== Critical TS1005 Fix Results ===`);
    this.log(`Initial errors: ${initialCount}`);
    this.log(`Final errors: ${finalCount}`);
    this.log(`Errors fixed: ${improvement}`);
    this.log(`Files modified: ${this.fixedFiles.size}`);
    this.log(`Individual fixes applied: ${this.fixesApplied}`);
    this.log(`Fix rate: ${initialCount > 0 ? ((improvement / initialCount) * 100).toFixed(1) : '0'}%`);

    if (improvement > 0) {
      this.log('Critical TS1005 errors successfully reduced!', 'success');
    } else if (finalCount <= initialCount) {
      this.log('Error count maintained (no increase)', 'success');
    } else {
      this.log('Warning: Error count increased', 'warning');
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new CriticalTS1005Fixer();
  fixer.run();
}

export { CriticalTS1005Fixer };