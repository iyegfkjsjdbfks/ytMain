#!/usr/bin/env node
/**
 * Malformed Type Annotations Fixer
 * Specifically targets the malformed type annotation patterns like:
 * ({ param1, param2 }: {param2: any}: {param1: any}) => 
 * and converts them to proper destructuring:
 * ({ param1, param2 }) =>
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

class MalformedTypeAnnotationFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
    this.processedFiles = 0;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
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
    
    console.log(`${colors[type]}${prefix} [${timestamp}] ${message}${colors.reset}`);
  }

  fixMalformedTypeAnnotations(content) {
    let fixedContent = content;
    let fixes = 0;

    // Pattern 1: Fix malformed parameter type annotations like (ex:, any) => (ex: any)
    const pattern1 = /\(([^:)]+):,\s*([^)]+)\)/g;
    fixedContent = fixedContent.replace(pattern1, (match, param, type) => {
      fixes++;
      return `(${param.trim()}: ${type.trim()})`;
    });

    // Pattern 2: Fix malformed function calls like func(param:, type) => func(param: type)
    const pattern2 = /(\w+)\(([^:)]+):,\s*([^)]+)\)/g;
    fixedContent = fixedContent.replace(pattern2, (match, funcName, param, type) => {
      fixes++;
      return `${funcName}(${param.trim()}: ${type.trim()})`;
    });

    // Pattern 3: Fix malformed variable declarations like const, varName => const varName
    const pattern3 = /const,\s+(\w+)/g;
    fixedContent = fixedContent.replace(pattern3, (match, varName) => {
      fixes++;
      return `const ${varName}`;
    });

    // Pattern 4: Fix malformed else if statements like } else, if => } else if
    const pattern4 = /\}\s*else,\s*if/g;
    fixedContent = fixedContent.replace(pattern4, (match) => {
      fixes++;
      return '} else if';
    });

    // Pattern 5: Fix malformed object spread like { ...prev: any, => { ...prev,
    const pattern5 = /\{\s*\.\.\.([^:]+):\s*any,/g;
    fixedContent = fixedContent.replace(pattern5, (match, varName) => {
      fixes++;
      return `{ ...${varName.trim()},`;
    });

    // Pattern 6: Fix malformed new constructor calls like new, Promise => new Promise
    const pattern6 = /new,\s+(\w+)/g;
    fixedContent = fixedContent.replace(pattern6, (match, className) => {
      fixes++;
      return `new ${className}`;
    });

    // Pattern 7: Fix malformed arrow function expressions like result =>, result => result =>
    const pattern7 = /(\w+)\s*=>,\s*(\w+)/g;
    fixedContent = fixedContent.replace(pattern7, (match, param, result) => {
      fixes++;
      return `${param} => ${result}`;
    });

    // Pattern 8: Fix malformed exponentiation like 2 **, attemptIndex => 2 ** attemptIndex
    const pattern8 = /(\d+)\s*\*\*,\s*(\w+)/g;
    fixedContent = fixedContent.replace(pattern8, (match, base, exponent) => {
      fixes++;
      return `${base} ** ${exponent}`;
    });

    // Pattern 9: Fix malformed function parameter calls like setValue(newValue: any) => setValue(newValue)
    const pattern9 = /(\w+)\(([^)]+):\s*any\)/g;
    fixedContent = fixedContent.replace(pattern9, (match, funcName, param) => {
      fixes++;
      return `${funcName}(${param.trim()})`;
    });

    // Pattern 10: Fix malformed export statements like export, const => export const
    const pattern10 = /export,\s+const/g;
    fixedContent = fixedContent.replace(pattern10, (match) => {
      fixes++;
      return 'export const';
    });

    // Pattern 11: Fix specific malformed patterns like .some((ex:, any) =>
    const pattern11 = /\.some\(\(([^:)]+):,\s*([^)]+)\)\s*=>/g;
    fixedContent = fixedContent.replace(pattern11, (match, param, type) => {
      fixes++;
      return `.some((${param.trim()}: ${type.trim()}) =>`;
    });

    // Pattern 12: Fix specific malformed patterns like .includes(ex:, any)
    const pattern12 = /\.includes\(([^:)]+):,\s*([^)]+)\)/g;
    fixedContent = fixedContent.replace(pattern12, (match, param, type) => {
      fixes++;
      return `.includes(${param.trim()})`;
    });

    // Pattern 13: Fix specific malformed patterns like .endsWith(ext:, any)
    const pattern13 = /\.endsWith\(([^:)]+):,\s*([^)]+)\)/g;
    fixedContent = fixedContent.replace(pattern13, (match, param, type) => {
      fixes++;
      return `.endsWith(${param.trim()})`;
    });

    // Pattern 14: Fix return statements like return, this => return this
    const pattern14 = /return,\s+(\w+)/g;
    fixedContent = fixedContent.replace(pattern14, (match, varName) => {
      fixes++;
      return `return ${varName}`;
    });

    return { content: fixedContent, fixes };
  }

  async processFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const result = this.fixMalformedTypeAnnotations(content);
      
      if (result.fixes > 0) {
        writeFileSync(filePath, result.content);
        this.fixedFiles++;
        this.totalFixes += result.fixes;
        this.log(`Fixed ${result.fixes} malformed type annotations in ${filePath}`);
      }
      
      this.processedFiles++;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
    }
  }

  async findAndProcessFiles(dir) {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stats = statSync(fullPath);
      
      if (stats.isDirectory()) {
        // Skip certain directories
        if (['node_modules', '.git', 'dist', 'build', 'coverage'].includes(entry)) {
          continue;
        }
        await this.findAndProcessFiles(fullPath);
      } else if (stats.isFile() && (entry.endsWith('.tsx') || entry.endsWith('.ts'))) {
        await this.processFile(fullPath);
      }
    }
  }

  async run() {
    this.log('🚀 Starting malformed type annotation fixes...');
    this.log(`Working directory: ${process.cwd()}`);

    const startTime = Date.now();
    await this.findAndProcessFiles(process.cwd());
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    this.log('\n' + '='.repeat(60));
    this.log('📊 MALFORMED TYPE ANNOTATION FIXING REPORT');
    this.log('='.repeat(60));
    this.log(`⏱️  Duration: ${duration} seconds`);
    this.log(`📁 Files processed: ${this.processedFiles}`);
    this.log(`🔧 Files fixed: ${this.fixedFiles}`);
    this.log(`✨ Total fixes applied: ${this.totalFixes}`);
    
    if (this.totalFixes > 0) {
      this.log(`🎉 Successfully fixed ${this.totalFixes} malformed type annotations!`, 'success');
    } else {
      this.log('ℹ️  No malformed type annotations found.', 'info');
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new MalformedTypeAnnotationFixer();
  fixer.run().catch(err => {
    console.error('MalformedTypeAnnotationFixer failed:', err);
    process.exitCode = 1;
  });
}

export { MalformedTypeAnnotationFixer };