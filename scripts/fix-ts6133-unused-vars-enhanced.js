#!/usr/bin/env node
/**
 * Enhanced TS6133 Unused Variables Fixer
 * Removes unused variable declarations (47 occurrences)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

class TS6133Fixer {
  constructor() {
    this.fixedCount = 0;
    this.processedFiles = new Set();
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    const prefix = { info: '🔧', success: '✅', error: '❌', warning: '⚠️' }[type] || '🔧';
    console.log(`${colors[type]}${prefix} ${message}${colors.reset}`);
  }

  getTS6133Errors() {
    try {
      execSync('npm run type-check 2>&1', { encoding: 'utf8', stdio: 'pipe' });
      return [];
    } catch (error) {
      const output = error.stdout + error.stderr;
      const errorLines = output.split('\n').filter(line => line.includes('error TS6133:'));
      
      return errorLines.map(line => {
        const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS6133: '([^']+)' is declared but its value is never read\./);
        if (match) {
          return {
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            variable: match[4],
            fullLine: line
          };
        }
        return null;
      }).filter(Boolean);
    }
  }

  fixUnusedVariable(filePath, line, column, variable) {
    if (!existsSync(filePath)) return false;

    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    if (line > lines.length) return false;

    const targetLine = lines[line - 1];
    let modified = false;
    let newLine = targetLine;

    // Strategy 1: Remove unused imports
    if (targetLine.includes('import') && targetLine.includes(variable)) {
      // Single import: import { unused } from 'module'
      if (targetLine.match(new RegExp(`import\\s*{\\s*${variable}\\s*}\\s*from`))) {
        newLine = '';
        modified = true;
      }
      // Multiple imports: import { used, unused, other } from 'module'
      else if (targetLine.match(new RegExp(`{[^}]*\\b${variable}\\b[^}]*}`))) {
        // Remove just the unused variable from the import list
        newLine = targetLine.replace(new RegExp(`,?\\s*\\b${variable}\\b\\s*,?`), '');
        // Clean up extra commas
        newLine = newLine.replace(/{\s*,/, '{').replace(/,\s*}/, '}').replace(/,\s*,/, ',');
        modified = true;
      }
      // Default import
      else if (targetLine.match(new RegExp(`import\\s+${variable}\\s+from`))) {
        newLine = '';
        modified = true;
      }
    }

    // Strategy 2: Remove unused variable declarations
    else if (targetLine.includes('const') || targetLine.includes('let') || targetLine.includes('var')) {
      // Single variable declaration: const unused = value;
      if (targetLine.match(new RegExp(`(const|let|var)\\s+${variable}\\s*=`))) {
        newLine = '';
        modified = true;
      }
      // Destructured assignment: const { used, unused } = object;
      else if (targetLine.match(new RegExp(`{[^}]*\\b${variable}\\b[^}]*}`))) {
        newLine = targetLine.replace(new RegExp(`,?\\s*\\b${variable}\\b\\s*,?`), '');
        // Clean up destructuring
        newLine = newLine.replace(/{\s*,/, '{').replace(/,\s*}/, '}').replace(/,\s*,/, ',');
        // If destructuring becomes empty, remove the entire line
        if (newLine.match(/{\s*}/)) {
          newLine = '';
        }
        modified = true;
      }
    }

    // Strategy 3: Comment out unused function parameters (be conservative)
    else if (targetLine.includes('function') || targetLine.includes('=>')) {
      // Don't automatically remove function parameters as they might be part of an interface
      // Instead, prefix with underscore to indicate intentional non-use
      const paramPattern = new RegExp(`\\b${variable}\\b(?=\\s*[,)])`);
      if (paramPattern.test(targetLine)) {
        newLine = targetLine.replace(paramPattern, `_${variable}`);
        modified = true;
      }
    }

    if (modified) {
      // If the line becomes empty or just whitespace, remove it entirely
      if (newLine.trim() === '') {
        lines.splice(line - 1, 1);
      } else {
        lines[line - 1] = newLine;
      }
      
      const newContent = lines.join('\n');
      
      try {
        writeFileSync(filePath, newContent, 'utf8');
        this.log(`Fixed unused variable '${variable}' in ${filePath}:${line}`, 'success');
        this.fixedCount++;
        return true;
      } catch (error) {
        this.log(`Failed to write ${filePath}: ${error.message}`, 'error');
        return false;
      }
    }

    return false;
  }

  async run() {
    this.log('🚀 Starting TS6133 Unused Variables Fixer...');
    
    const errors = this.getTS6133Errors();
    this.log(`Found ${errors.length} TS6133 errors to fix`);

    if (errors.length === 0) {
      this.log('No TS6133 errors found!', 'success');
      return;
    }

    // Group errors by file for efficiency
    const errorsByFile = new Map();
    for (const error of errors) {
      if (!errorsByFile.has(error.file)) {
        errorsByFile.set(error.file, []);
      }
      errorsByFile.get(error.file).push(error);
    }

    // Process each file
    for (const [filePath, fileErrors] of errorsByFile.entries()) {
      this.log(`Processing ${filePath} (${fileErrors.length} errors)...`);
      
      // Sort errors by line number (descending) to avoid line number shifts when removing lines
      fileErrors.sort((a, b) => b.line - a.line);
      
      for (const error of fileErrors) {
        this.fixUnusedVariable(error.file, error.line, error.column, error.variable);
      }
      
      this.processedFiles.add(filePath);
    }

    this.log(`✨ Fixed ${this.fixedCount} TS6133 unused variable errors`, 'success');
    this.log(`📁 Processed ${this.processedFiles.size} files`, 'info');
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new TS6133Fixer();
  fixer.run().catch(err => {
    console.error('TS6133Fixer failed:', err);
    process.exitCode = 1;
  });
}

export default TS6133Fixer;