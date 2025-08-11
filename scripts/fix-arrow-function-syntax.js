#!/usr/bin/env node
/**
 * Fix malformed arrow function parameter syntax created by TS7006 fixer
 * Fixes patterns like: .map(param: any => to .map((param: any) =>
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class ArrowFunctionSyntaxFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
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

  getAllTsxFiles(dir = projectRoot) {
    const files = [];
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        if (!['node_modules', 'dist', 'build', '.git', 'coverage'].includes(entry)) {
          files.push(...this.getAllTsxFiles(fullPath));
        }
      } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  fixArrowFunctionSyntax(content) {
    let fixed = content;
    let changesMade = 0;

    // Pattern 1: .method(param: type => to .method((param: type) =>
    // For array methods like map, filter, forEach, find, etc.
    const arrayMethodPattern = /\.(map|filter|forEach|find|some|every|reduce|sort)\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([a-zA-Z_$|&<>\[\]{}]+)\s*=>/g;
    fixed = fixed.replace(arrayMethodPattern, (match, method, param, type) => {
      changesMade++;
      return `.${method}((${param}: ${type}) =>`;
    });

    // Pattern 2: More complex cases with multiple parameters
    const multiParamPattern = /\.(map|filter|forEach|find|some|every|reduce|sort)\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([a-zA-Z_$|&<>\[\]{}]+)\s*,\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([a-zA-Z_$|&<>\[\]{}]+)\s*=>/g;
    fixed = fixed.replace(multiParamPattern, (match, method, param1, type1, param2, type2) => {
      changesMade++;
      return `.${method}((${param1}: ${type1}, ${param2}: ${type2}) =>`;
    });

    // Pattern 3: Callback functions in general
    const callbackPattern = /(\w+)\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([a-zA-Z_$|&<>\[\]{}]+)\s*=>/g;
    fixed = fixed.replace(callbackPattern, (match, funcName, param, type) => {
      // Only fix if it's not already fixed
      if (!match.includes('((')) {
        changesMade++;
        return `${funcName}((${param}: ${type}) =>`;
      }
      return match;
    });

    // Pattern 4: Fix malformed function calls (func(param: type) -> func(param))
    const funcCallPattern = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*any\s*,/g;
    fixed = fixed.replace(funcCallPattern, (match, funcName, param) => {
      changesMade++;
      return `${funcName}(${param},`;
    });

    // Pattern 5: Fix malformed object property access (param: any.property)
    const propertyPattern = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*any\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    fixed = fixed.replace(propertyPattern, (match, param, property) => {
      changesMade++;
      return `${param}.${property}`;
    });

    // Pattern 6: Fix function calls with type annotations in wrong place
    const wrongTypePattern = /(\w+)\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*any\s*([,)])/g;
    fixed = fixed.replace(wrongTypePattern, (match, funcName, param, ending) => {
      changesMade++;
      return `${funcName}(${param}${ending}`;
    });
  }

  fixFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const result = this.fixArrowFunctionSyntax(content);
      
      if (result.changes > 0) {
        writeFileSync(filePath, result.content);
        this.fixedFiles++;
        this.totalFixes += result.changes;
        this.log(`Fixed ${result.changes} syntax issues in ${filePath.replace(projectRoot + '/', '')}`, 'success');
      }
      
      return result.changes > 0;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    this.log('Starting arrow function syntax fixes...');
    
    const files = this.getAllTsxFiles();
    this.log(`Scanning ${files.length} TypeScript files...`);

    for (const file of files) {
      this.fixFile(file);
    }

    this.log('\n' + '='.repeat(60));
    this.log('📊 ARROW FUNCTION SYNTAX FIX RESULTS');
    this.log('='.repeat(60));
    this.log(`Files processed: ${files.length}`);
    this.log(`Files fixed: ${this.fixedFiles}`);
    this.log(`Total fixes: ${this.totalFixes}`);
    this.log(`Success rate: ${((this.fixedFiles / files.length) * 100).toFixed(1)}%`);

    return {
      processed: files.length,
      fixed: this.fixedFiles,
      totalFixes: this.totalFixes
    };
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new ArrowFunctionSyntaxFixer();
  fixer.run().catch(console.error);
}

export { ArrowFunctionSyntaxFixer };