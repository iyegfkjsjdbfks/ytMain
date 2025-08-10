#!/usr/bin/env node
/**
 * Fix TypeScript TS2551 "Property does not exist on type. Did you mean X?" errors
 * Renames properties to suggested alternatives or adds proper type checks
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class PropertySuggestionFixer {
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

  getTypeScriptErrors() {
    try {
      execSync('npm run type-check', { encoding: 'utf8', stdio: 'pipe', cwd: projectRoot });
      return [];
    } catch (error) {
      const output = error.stdout + error.stderr;
      const lines = output.split('\n');
      const errors = [];
      
      for (const line of lines) {
        // Match pattern: file(line,col): error TS2551: Property 'prop' does not exist on type 'Type'. Did you mean 'suggestion'?
        const match = line.match(/(.+?)\((\d+),(\d+)\): error TS2551: Property '(.+?)' does not exist on type '(.+?)'\. Did you mean '(.+?)'\?/);
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            wrongProperty: match[4],
            type: match[5],
            suggestion: match[6]
          });
        }
      }
      
      return errors;
    }
  }

  fixPropertySuggestion(filePath, error) {
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
    const { wrongProperty, suggestion } = error;

    // Replace the wrong property with the suggested one
    const propertyRegex = new RegExp(`\\.${wrongProperty}(?![\\w])`, 'g');
    const newLine = line.replace(propertyRegex, `.${suggestion}`);

    if (newLine !== line) {
      lines[error.line - 1] = newLine;
      writeFileSync(fullPath, lines.join('\n'), 'utf8');
      this.fixedCount++;
      this.log(`Fixed: ${filePath}:${error.line} - ${wrongProperty} → ${suggestion}`, 'success');
      return true;
    }

    return false;
  }

  async run() {
    this.log('🔍 Analyzing TS2551 property suggestion errors...');
    
    const errors = this.getTypeScriptErrors();
    this.log(`Found ${errors.length} property suggestion errors`);
    
    if (errors.length === 0) {
      this.log('No TS2551 errors to fix');
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
        this.fixPropertySuggestion(file, error);
      }
    }
    
    this.log(`✅ Fixed ${this.fixedCount} property suggestion errors`);
    
    // Verify results
    const finalErrors = this.getTypeScriptErrors();
    this.log(`Remaining TS2551 errors: ${finalErrors.length}`);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('fix-ts2551-property-does-not-exist.js')) {
  const fixer = new PropertySuggestionFixer();
  fixer.run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}

export { PropertySuggestionFixer };