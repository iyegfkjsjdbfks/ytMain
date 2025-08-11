#!/usr/bin/env node
/**
 * TS1128 Fixer - Targets declaration or statement expected errors
 * Focuses on malformed declarations and statements
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

class TS1128Fixer {
  constructor() {
    this.fixedCount = 0;
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
    console.log(`${colors[type]}[TS1128] ${message}${colors.reset}`);
  }

  getTS1128Errors() {
    try {
      const result = execSync('npm run type-check', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return [];
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      const lines = output.split('\n');
      const ts1128Errors = [];
      
      for (const line of lines) {
        const match = line.match(/^(.+?)\((\d+),(\d+)\):\s*error TS1128:/);
        if (match) {
          ts1128Errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            fullLine: line
          });
        }
      }
      
      return ts1128Errors;
    }
  }

  fixFile(filePath) {
    try {
      let content = readFileSync(filePath, 'utf8');
      const originalContent = content;
      let modified = false;
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        const originalLine = line;

        // Fix incomplete import statements
        if (line.match(/^\s*import\s+[^;]*$/) && !line.includes('from')) {
          line = line.replace(/^(\s*import\s+.+)$/, '$1;');
          if (line !== originalLine) {
            this.log(`Fixed incomplete import: ${originalLine.trim()} -> ${line.trim()}`);
            modified = true;
          }
        }

        // Fix incomplete export statements
        if (line.match(/^\s*export\s+[^;]*$/) && !line.includes('{') && !line.includes('default')) {
          line = line.replace(/^(\s*export\s+.+)$/, '$1;');
          if (line !== originalLine) {
            this.log(`Fixed incomplete export: ${originalLine.trim()} -> ${line.trim()}`);
            modified = true;
          }
        }

        // Fix incomplete variable declarations
        if (line.match(/^\s*(const|let|var)\s+\w+\s*=\s*[^;]*$/) && !line.endsWith(';')) {
          line = line.replace(/^(\s*(const|let|var)\s+\w+\s*=\s*[^;]*)$/, '$1;');
          if (line !== originalLine) {
            this.log(`Fixed incomplete declaration: ${originalLine.trim()} -> ${line.trim()}`);
            modified = true;
          }
        }

        // Fix incomplete function calls
        if (line.match(/^\s*\w+\([^)]*\)\s*$/) && !line.endsWith(';')) {
          line = line.replace(/^(\s*\w+\([^)]*\))\s*$/, '$1;');
          if (line !== originalLine) {
            this.log(`Fixed incomplete function call: ${originalLine.trim()} -> ${line.trim()}`);
            modified = true;
          }
        }

        // Fix incomplete assignments
        if (line.match(/^\s*\w+\s*=\s*[^;]*$/) && !line.endsWith(';')) {
          line = line.replace(/^(\s*\w+\s*=\s*[^;]*)$/, '$1;');
          if (line !== originalLine) {
            this.log(`Fixed incomplete assignment: ${originalLine.trim()} -> ${line.trim()}`);
            modified = true;
          }
        }

        // Fix malformed object property declarations
        if (line.match(/^\s*\w+:\s*[^,;{}]*$/) && i < lines.length - 1 && !lines[i + 1].trim().startsWith('}')) {
          line = line.replace(/^(\s*\w+:\s*[^,;{}]*)$/, '$1,');
          if (line !== originalLine) {
            this.log(`Fixed object property: ${originalLine.trim()} -> ${line.trim()}`);
            modified = true;
          }
        }

        // Fix incomplete type declarations
        if (line.match(/^\s*type\s+\w+\s*=\s*[^;]*$/) && !line.endsWith(';')) {
          line = line.replace(/^(\s*type\s+\w+\s*=\s*[^;]*)$/, '$1;');
          if (line !== originalLine) {
            this.log(`Fixed type declaration: ${originalLine.trim()} -> ${line.trim()}`);
            modified = true;
          }
        }

        // Fix incomplete interface declarations
        if (line.match(/^\s*interface\s+\w+\s*$/) && i < lines.length - 1 && !lines[i + 1].trim().startsWith('{')) {
          line = line.replace(/^(\s*interface\s+\w+)\s*$/, '$1 {');
          if (line !== originalLine) {
            this.log(`Fixed interface declaration: ${originalLine.trim()} -> ${line.trim()}`);
            modified = true;
          }
        }

        // Fix incomplete return statements
        if (line.match(/^\s*return\s+[^;]*$/) && !line.endsWith(';')) {
          line = line.replace(/^(\s*return\s+[^;]*)$/, '$1;');
          if (line !== originalLine) {
            this.log(`Fixed return statement: ${originalLine.trim()} -> ${line.trim()}`);
            modified = true;
          }
        }

        lines[i] = line;
      }

      if (modified) {
        const newContent = lines.join('\n');
        writeFileSync(filePath, newContent, 'utf8');
        this.fixedCount++;
        this.log(`Fixed file: ${filePath}`, 'success');
        return true;
      }

      return false;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    this.log('Starting TS1128 targeted fixing...');
    
    const initialErrors = this.getTS1128Errors();
    this.log(`Found ${initialErrors.length} TS1128 errors`);
    
    if (initialErrors.length === 0) {
      this.log('No TS1128 errors found!', 'success');
      return;
    }

    // Get unique files with TS1128 errors
    const errorFiles = [...new Set(initialErrors.map(err => err.file))];
    this.log(`Processing ${errorFiles.length} files with TS1128 errors`);

    for (const file of errorFiles) {
      this.processedFiles++;
      this.fixFile(file);
    }

    const finalErrors = this.getTS1128Errors();
    const fixed = initialErrors.length - finalErrors.length;
    
    this.log(`\n=== TS1128 FIXING COMPLETE ===`);
    this.log(`Files processed: ${this.processedFiles}`);
    this.log(`Errors before: ${initialErrors.length}`);
    this.log(`Errors after: ${finalErrors.length}`);
    this.log(`Errors fixed: ${fixed}`);
    
    if (fixed > 0) {
      this.log(`Successfully fixed ${fixed} TS1128 errors!`, 'success');
    } else {
      this.log('No errors were fixed. Manual intervention may be needed.', 'warning');
    }
  }
}

const fixer = new TS1128Fixer();
fixer.run().catch(console.error);