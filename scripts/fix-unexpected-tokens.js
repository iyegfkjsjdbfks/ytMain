#!/usr/bin/env node
/**
 * TS1381/TS1382 Unexpected Token Fixer
 * Fixes unexpected token errors related to malformed type annotations
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

class UnexpectedTokenFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
    this.patterns = [
      // Fix malformed template literals and JSX expressions
      {
        name: 'Fix malformed arrow function bodies',
        pattern: /=> ([a-zA-Z_$][a-zA-Z0-9_$]*): any([^}]*)\}/g,
        replacement: '=> $1$2}'
      },
      // Fix malformed conditional expressions
      {
        name: 'Fix ternary operator with type annotation',
        pattern: /\? ([^:]*): any : ([^:]*)/g,
        replacement: '? $1 : $2'
      },
      // Fix malformed method calls with type annotations
      {
        name: 'Fix method chain with type annotation',
        pattern: /\.([a-zA-Z_$][a-zA-Z0-9_$]*): any\(/g,
        replacement: '.$1('
      },
      // Fix JSX attribute values with type annotations
      {
        name: 'Fix JSX attribute value type annotation',
        pattern: /=\{([^}]*): any\}/g,
        replacement: '={$1}'
      },
      // Fix array destructuring with type annotations
      {
        name: 'Fix array destructuring type annotation',
        pattern: /\[([^\]]*): any\]/g,
        replacement: '[$1]'
      },
      // Fix object property access with type annotations
      {
        name: 'Fix object property access',
        pattern: /\.([a-zA-Z_$][a-zA-Z0-9_$]*): any(?!\s*[=:])/g,
        replacement: '.$1'
      },
      // Fix function call arguments with type annotations
      {
        name: 'Fix function call arguments',
        pattern: /\(([^)]*): any,/g,
        replacement: '($1,'
      },
      // Fix return statement with type annotation
      {
        name: 'Fix return statement type annotation',
        pattern: /return ([^;]*): any;/g,
        replacement: 'return $1;'
      }
    ];
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

  isTypeScriptFile(filePath) {
    return filePath.endsWith('.ts') || filePath.endsWith('.tsx');
  }

  getAllTypeScriptFiles(dir, files = []) {
    const items = readdirSync(dir);
    
    for (const item of items) {
      if (item.startsWith('.') || item === 'node_modules' || item === 'dist' || item === 'coverage') {
        continue;
      }
      
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.getAllTypeScriptFiles(fullPath, files);
      } else if (this.isTypeScriptFile(fullPath)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  fixFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      let fixedContent = content;
      let fileFixes = 0;
      
      for (const { name, pattern, replacement } of this.patterns) {
        const beforeFix = fixedContent;
        fixedContent = fixedContent.replace(pattern, replacement);
        
        const matches = beforeFix.match(pattern);
        if (matches) {
          const fixCount = matches.length;
          fileFixes += fixCount;
          this.log(`  Fixed ${fixCount} instances of "${name}"`, 'info');
        }
      }
      
      if (fixedContent !== content) {
        writeFileSync(filePath, fixedContent, 'utf8');
        this.fixedFiles++;
        this.totalFixes += fileFixes;
        this.log(`Fixed ${fileFixes} unexpected token errors in ${filePath}`, 'success');
        return fileFixes;
      }
      
      return 0;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return 0;
    }
  }

  async run() {
    this.log('🚀 Starting unexpected token error fixing...');
    
    const projectRoot = process.cwd();
    const files = this.getAllTypeScriptFiles(projectRoot);
    
    this.log(`Found ${files.length} TypeScript files to check`);
    
    for (const file of files) {
      this.fixFile(file);
    }
    
    this.log('\n' + '='.repeat(60));
    this.log('📊 UNEXPECTED TOKEN FIX REPORT');
    this.log('='.repeat(60));
    this.log(`📁 Files processed: ${files.length}`);
    this.log(`🔧 Files fixed: ${this.fixedFiles}`);
    this.log(`✨ Total fixes applied: ${this.totalFixes}`);
    
    if (this.totalFixes > 0) {
      this.log(`🎉 Successfully fixed ${this.totalFixes} unexpected token errors!`, 'success');
    } else {
      this.log('No unexpected token errors found', 'info');
    }
  }
}

// Execute if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  const fixer = new UnexpectedTokenFixer();
  fixer.run().catch(err => {
    console.error('UnexpectedTokenFixer failed:', err);
    process.exitCode = 1;
  });
}

export { UnexpectedTokenFixer };