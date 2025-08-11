#!/usr/bin/env node
/**
 * Enhanced TS1005 Fixer - Targets comma expected errors
 * Focuses on malformed type annotations and spread operators
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

class TS1005Fixer {
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
    console.log(`${colors[type]}[TS1005] ${message}${colors.reset}`);
  }

  getTS1005Errors() {
    try {
      const result = execSync('npm run type-check', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return [];
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      const lines = output.split('\n');
      const ts1005Errors = [];
      
      for (const line of lines) {
        const match = line.match(/^(.+?)\((\d+),(\d+)\):\s*error TS1005:/);
        if (match) {
          ts1005Errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            fullLine: line
          });
        }
      }
      
      return ts1005Errors;
    }
  }

  fixFile(filePath) {
    try {
      let content = readFileSync(filePath, 'utf8');
      const originalContent = content;
      let modified = false;

      // Fix malformed type annotations with : any
      content = content.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*any)\s*([+-])\s*(\d+)/g, (match, varPart, operator, number) => {
        this.log(`Fixed malformed type annotation: ${match} -> ${varPart}`);
        modified = true;
        return varPart;
      });

      // Fix spread operators with type annotations
      content = content.replace(/(\.\.\.\w+)\s*:\s*any/g, (match, spreadPart) => {
        this.log(`Fixed spread operator: ${match} -> ${spreadPart}`);
        modified = true;
        return spreadPart;
      });

      // Fix arrow function parameter type annotations
      content = content.replace(/(\w+)\s*=>\s*!\1\s*:\s*any/g, (match, param) => {
        this.log(`Fixed arrow function: ${match} -> ${param} => !${param}`);
        modified = true;
        return `${param} => !${param}`;
      });

      // Fix malformed object destructuring
      content = content.replace(/({[^}]*})\s*:\s*any/g, (match, destructuring) => {
        this.log(`Fixed destructuring: ${match} -> ${destructuring}`);
        modified = true;
        return destructuring;
      });

      // Fix function calls with malformed syntax
      content = content.replace(/(\w+)\((.*?)\)\s*:\s*any/g, (match, funcName, params) => {
        this.log(`Fixed function call: ${match} -> ${funcName}(${params})`);
        modified = true;
        return `${funcName}(${params})`;
      });

      // Fix array destructuring
      content = content.replace(/(\[[^\]]*\])\s*:\s*any/g, (match, arrayPart) => {
        this.log(`Fixed array destructuring: ${match} -> ${arrayPart}`);
        modified = true;
        return arrayPart;
      });

      // Fix conditional expressions
      content = content.replace(/(\w+)\s*\?\s*(\w+)\s*:\s*(\w+)\s*:\s*any/g, (match, condition, truePart, falsePart) => {
        this.log(`Fixed conditional: ${match} -> ${condition} ? ${truePart} : ${falsePart}`);
        modified = true;
        return `${condition} ? ${truePart} : ${falsePart}`;
      });

      // Fix method calls with malformed syntax
      content = content.replace(/(\w+\.\w+)\((.*?)\)\s*:\s*any/g, (match, methodCall, params) => {
        this.log(`Fixed method call: ${match} -> ${methodCall}(${params})`);
        modified = true;
        return `${methodCall}(${params})`;
      });

      if (modified) {
        writeFileSync(filePath, content, 'utf8');
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
    this.log('Starting TS1005 targeted fixing...');
    
    const initialErrors = this.getTS1005Errors();
    this.log(`Found ${initialErrors.length} TS1005 errors`);
    
    if (initialErrors.length === 0) {
      this.log('No TS1005 errors found!', 'success');
      return;
    }

    // Get unique files with TS1005 errors
    const errorFiles = [...new Set(initialErrors.map(err => err.file))];
    this.log(`Processing ${errorFiles.length} files with TS1005 errors`);

    for (const file of errorFiles) {
      this.processedFiles++;
      this.fixFile(file);
    }

    const finalErrors = this.getTS1005Errors();
    const fixed = initialErrors.length - finalErrors.length;
    
    this.log(`\n=== TS1005 FIXING COMPLETE ===`);
    this.log(`Files processed: ${this.processedFiles}`);
    this.log(`Errors before: ${initialErrors.length}`);
    this.log(`Errors after: ${finalErrors.length}`);
    this.log(`Errors fixed: ${fixed}`);
    
    if (fixed > 0) {
      this.log(`Successfully fixed ${fixed} TS1005 errors!`, 'success');
    } else {
      this.log('No errors were fixed. Manual intervention may be needed.', 'warning');
    }
  }
}

const fixer = new TS1005Fixer();
fixer.run().catch(console.error);