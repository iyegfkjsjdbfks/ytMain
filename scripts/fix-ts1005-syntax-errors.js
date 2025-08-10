#!/usr/bin/env node
/**
 * Comprehensive TS1005 Syntax Error Fixer
 * Targets the specific TS1005 "comma expected" errors
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

class TS1005SyntaxFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
    this.patterns = [
      // Fix arrow function parameter destructuring with type annotations
      {
        name: 'Arrow function destructuring parameter',
        pattern: /\(\{([^}]+)\}: any\)\s*=>/g,
        replacement: '({$1}) =>'
      },
      // Fix function call parameter with type annotation
      {
        name: 'Function call parameter type',
        pattern: /\(([^)]+): any\)\s*=>/g,
        replacement: '($1) =>'
      },
      // Fix spread with type annotation in various contexts
      {
        name: 'Spread with type annotation general',
        pattern: /\.\.\.([a-zA-Z_$][a-zA-Z0-9_$]*): any/g,
        replacement: '...$1'
      },
      // Fix array destructuring with type annotations
      {
        name: 'Array destructuring with types',
        pattern: /\[([^\]]+): any\]/g,
        replacement: '[$1]'
      },
      // Fix object destructuring in function parameters
      {
        name: 'Object destructuring in parameters',
        pattern: /\(\s*\{\s*([^}]+)\s*\}\s*:\s*any\s*\)/g,
        replacement: '({ $1 })'
      },
      // Fix callback function parameters
      {
        name: 'Callback function parameters',
        pattern: /\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*any\s*\)\s*=>/g,
        replacement: '($1) =>'
      },
      // Fix type annotations in template literals
      {
        name: 'Template literal type annotations',
        pattern: /\$\{([^}]*): any\}/g,
        replacement: '${$1}'
      },
      // Fix property access with type annotation
      {
        name: 'Property access with type annotation',
        pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*): any\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
        replacement: '$1.$2'
      },
      // Fix JSX prop types
      {
        name: 'JSX prop types',
        pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*): any\s*=/g,
        replacement: '$1='
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
    this.log('🚀 Starting TS1005 syntax error fixing...');
    
    const projectRoot = process.cwd();
    const files = this.getAllTypeScriptFiles(projectRoot);
    
    this.log(`Found ${files.length} TypeScript files to check`);
    
    for (const file of files) {
      this.fixFile(file);
    }
    
    this.log('\n' + '='.repeat(60));
    this.log('📊 TS1005 SYNTAX FIX REPORT');
    this.log('='.repeat(60));
    this.log(`📁 Files processed: ${files.length}`);
    this.log(`🔧 Files fixed: ${this.fixedFiles}`);
    this.log(`✨ Total fixes applied: ${this.totalFixes}`);
    
    if (this.totalFixes > 0) {
      this.log(`🎉 Successfully fixed ${this.totalFixes} TS1005 syntax errors!`, 'success');
    } else {
      this.log('No TS1005 syntax errors found', 'info');
    }
  }
}

// Execute if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  const fixer = new TS1005SyntaxFixer();
  fixer.run().catch(err => {
    console.error('TS1005SyntaxFixer failed:', err);
    process.exitCode = 1;
  });
}

export { TS1005SyntaxFixer };