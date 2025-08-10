#!/usr/bin/env node
/**
 * Fast Fix TypeScript TS6133 "declared but never used" errors
 * Works directly with type-errors.txt file for speed
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class FastUnusedDeclarationFixer {
  constructor() {
    this.fixedCount = 0;
    this.removedImports = [];
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

  getTS6133Errors() {
    try {
      const typeErrorsPath = join(projectRoot, 'type-errors.txt');
      if (!existsSync(typeErrorsPath)) {
        this.log('type-errors.txt not found', 'error');
        return [];
      }

      const content = readFileSync(typeErrorsPath, 'utf8');
      const lines = content.split('\n');
      const errors = [];
      
      for (const line of lines) {
        // Match pattern: file(line,col): error TS6133: 'identifier' is declared but its value is never read
        const match = line.match(/(.+?)\((\d+),(\d+)\): error TS6133: '(.+?)' is declared but its value is never read/);
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            identifier: match[4]
          });
        }
      }
      
      return errors;
    } catch (error) {
      this.log(`Error reading type-errors.txt: ${error.message}`, 'error');
      return [];
    }
  }

  fixUnusedDeclaration(filePath, error) {
    const fullPath = join(projectRoot, filePath);
    if (!existsSync(fullPath)) {
      this.log(`File not found: ${fullPath}`, 'warning');
      return false;
    }

    const content = readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    
    if (error.line > lines.length) {
      return false;
    }

    const line = lines[error.line - 1];
    const { identifier } = error;
    let newLine = line;
    let modified = false;

    // Strategy 1: Remove from named imports
    if (line.includes('import') && line.includes('{') && line.includes(identifier)) {
      const importMatch = line.match(/import\s*{([^}]+)}\s*from/);
      if (importMatch) {
        const imports = importMatch[1].split(',').map(i => i.trim()).filter(i => i !== identifier);
        if (imports.length > 0) {
          newLine = line.replace(importMatch[1], imports.join(', '));
          modified = true;
          this.log(`Removed unused import: ${identifier}`, 'success');
        } else {
          // Remove entire import line if no imports left
          newLine = '';
          modified = true;
          this.log(`Removed entire import line for: ${identifier}`, 'success');
        }
      }
    }

    // Strategy 2: Remove default imports that are unused
    else if (line.includes('import') && line.includes(identifier) && !line.includes('{')) {
      const defaultImportMatch = line.match(/import\s+(\w+)\s+from/);
      if (defaultImportMatch && defaultImportMatch[1] === identifier) {
        newLine = '';
        modified = true;
        this.log(`Removed unused default import: ${identifier}`, 'success');
      }
    }

    // Strategy 3: Remove unused variable declarations
    else if (line.includes('const') || line.includes('let') || line.includes('var')) {
      if (line.includes(`const ${identifier}`) || line.includes(`let ${identifier}`) || line.includes(`var ${identifier}`)) {
        newLine = '';
        modified = true;
        this.log(`Removed unused variable: ${identifier}`, 'success');
      }
    }

    // Strategy 4: Remove unused function parameters by adding underscore prefix
    else if (line.includes('function') || line.includes('=>') || line.includes('(')) {
      if (line.includes(identifier) && line.includes('(')) {
        newLine = line.replace(new RegExp(`\\b${identifier}\\b`), `_${identifier}`);
        modified = true;
        this.log(`Prefixed unused parameter with underscore: ${identifier}`, 'success');
      }
    }

    if (modified) {
      lines[error.line - 1] = newLine;
      writeFileSync(fullPath, lines.join('\n'), 'utf8');
      this.fixedCount++;
      return true;
    }

    return false;
  }

  async run() {
    this.log('🔍 Fast-analyzing TS6133 unused declaration errors...');
    
    const errors = this.getTS6133Errors();
    this.log(`Found ${errors.length} unused declaration errors`);
    
    if (errors.length === 0) {
      this.log('No TS6133 errors to fix');
      return;
    }

    // Group errors by file
    const errorsByFile = {};
    for (const error of errors) {
      if (!errorsByFile[error.file]) {
        errorsByFile[error.file] = [];
      }
      errorsByFile[error.file].push(error);
    }
    
    // Fix errors file by file
    for (const [file, fileErrors] of Object.entries(errorsByFile)) {
      this.log(`Fixing ${fileErrors.length} errors in ${file}`);
      
      // Sort errors by line number in reverse to avoid line number shifts
      fileErrors.sort((a, b) => b.line - a.line);
      
      for (const error of fileErrors) {
        this.fixUnusedDeclaration(file, error);
      }
    }
    
    this.log(`✅ Fixed ${this.fixedCount} unused declaration errors`);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('fix-ts6133-declared-not-used-fast.js')) {
  const fixer = new FastUnusedDeclarationFixer();
  fixer.run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}

export { FastUnusedDeclarationFixer };