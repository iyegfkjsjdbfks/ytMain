#!/usr/bin/env node
/**
 * Enhanced TS1005 Syntax Error Fixer
 * Specifically targets the malformed type annotation patterns causing "comma expected" errors
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

class EnhancedTS1005Fixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
    this.patterns = [
      // Pattern: variable: any => variable
      {
        name: 'Malformed type annotation in variables',
        pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*): any(?!\s*[=:])/g,
        replacement: '$1'
      },
      // Pattern: prev: any => prev (in arrow functions)
      {
        name: 'Malformed type annotation in arrow function params',
        pattern: /\(([^)]*prev): any([^)]*)\)/g,
        replacement: '($1$2)'
      },
      // Pattern: e: Event.property => e.property
      {
        name: 'Malformed Event property access',
        pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*): Event\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
        replacement: '$1.$2'
      },
      // Pattern: sum: any + i => sum + i
      {
        name: 'Malformed arithmetic operations',
        pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*): any\s*([+\-*/])/g,
        replacement: '$1 $2'
      },
      // Pattern: index: any !== => index !==
      {
        name: 'Malformed comparison operations',
        pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*): any\s*([!=<>]+)/g,
        replacement: '$1 $2'
      },
      // Pattern: i: any - 1 => i - 1
      {
        name: 'Malformed subtraction operations',
        pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*): any\s*-\s*(\d+)/g,
        replacement: '$1 - $2'
      },
      // Pattern: value: any) => value)
      {
        name: 'Malformed function call parameters',
        pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*): any\)/g,
        replacement: '$1)'
      },
      // Pattern: prop: any, => prop,
      {
        name: 'Malformed property destructuring',
        pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*): any,/g,
        replacement: '$1,'
      },
      // Pattern: id: string => clearTimeout(id: string) fix
      {
        name: 'Malformed function parameter types',
        pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*): (string|number|boolean)(?=\s*[,)])/g,
        replacement: '$1'
      },
      // Pattern: [...args[]] => ...args
      {
        name: 'Malformed rest parameters',
        pattern: /\.\.\.args\[\]/g,
        replacement: '...args'
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
        this.log(`Fixed ${fileFixes} TS1005 errors in ${filePath}`, 'success');
        return fileFixes;
      }
      
      return 0;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return 0;
    }
  }

  async run() {
    this.log('🚀 Starting enhanced TS1005 syntax error fixing...');
    
    const projectRoot = process.cwd();
    const files = this.getAllTypeScriptFiles(projectRoot);
    
    this.log(`Found ${files.length} TypeScript files to check`);
    
    for (const file of files) {
      this.fixFile(file);
    }
    
    this.log('\n' + '='.repeat(60));
    this.log('📊 ENHANCED TS1005 SYNTAX FIX REPORT');
    this.log('='.repeat(60));
    this.log(`📁 Files processed: ${files.length}`);
    this.log(`🔧 Files fixed: ${this.fixedFiles}`);
    this.log(`✨ Total fixes applied: ${this.totalFixes}`);
    
    if (this.totalFixes > 0) {
      this.log(`🎉 Successfully fixed ${this.totalFixes} enhanced TS1005 syntax errors!`, 'success');
    } else {
      this.log('No enhanced TS1005 syntax errors found', 'info');
    }
  }
}

// Execute if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  const fixer = new EnhancedTS1005Fixer();
  fixer.run().catch(err => {
    console.error('EnhancedTS1005Fixer failed:', err);
    process.exitCode = 1;
  });
}

export { EnhancedTS1005Fixer };