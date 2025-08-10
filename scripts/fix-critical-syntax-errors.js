#!/usr/bin/env node
/**
 * Critical Syntax Error Fixer
 * Fixes the most critical syntax errors preventing TypeScript compilation
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

class CriticalSyntaxFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
    this.patterns = [
      // Fix incorrect type annotation syntax in arrow functions
      {
        name: 'Arrow function parameter type',
        pattern: /\(([^:)]+): any\s*=>/g,
        replacement: '($1 =>'
      },
      // Fix incorrect property access with type annotation
      {
        name: 'Event target value access',
        pattern: /e: Event\.target\.value/g,
        replacement: 'e.target.value'
      },
      // Fix incorrect spread syntax with type annotation
      {
        name: 'Spread operator type annotation',
        pattern: /\.\.\.([^:)]+): any/g,
        replacement: '...$1'
      },
      // Fix malformed onChange handlers
      {
        name: 'OnChange handler types',
        pattern: /onChange=\{\(e: Event\) => ([^}]+)\}/g,
        replacement: (match, body) => {
          // Fix the body by removing incorrect type annotations
          const fixedBody = body
            .replace(/e: Event\.target\.value/g, 'e.target.value')
            .replace(/prev: any\s*=>/g, 'prev =>')
            .replace(/\.\.\.prev: any/g, '...prev');
          return `onChange={(e) => ${fixedBody}}`;
        }
      },
      // Fix setters with incorrect type annotations
      {
        name: 'Setter function calls',
        pattern: /set([A-Z][^(]*)\(([^()]*prev: any[^)]*)\)/g,
        replacement: (match, setterName, params) => {
          const fixedParams = params.replace(/prev: any\s*=>/g, 'prev =>');
          return `set${setterName}(${fixedParams})`;
        }
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
        
        if (typeof replacement === 'function') {
          fixedContent = fixedContent.replace(pattern, replacement);
        } else {
          fixedContent = fixedContent.replace(pattern, replacement);
        }
        
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
        this.log(`Fixed ${fileFixes} syntax errors in ${filePath}`, 'success');
        return fileFixes;
      }
      
      return 0;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return 0;
    }
  }

  async run() {
    this.log('🚀 Starting critical syntax error fixing...');
    
    const projectRoot = process.cwd();
    const files = this.getAllTypeScriptFiles(projectRoot);
    
    this.log(`Found ${files.length} TypeScript files to check`);
    
    for (const file of files) {
      this.fixFile(file);
    }
    
    this.log('\n' + '='.repeat(60));
    this.log('📊 CRITICAL SYNTAX FIX REPORT');
    this.log('='.repeat(60));
    this.log(`📁 Files processed: ${files.length}`);
    this.log(`🔧 Files fixed: ${this.fixedFiles}`);
    this.log(`✨ Total fixes applied: ${this.totalFixes}`);
    
    if (this.totalFixes > 0) {
      this.log(`🎉 Successfully fixed ${this.totalFixes} critical syntax errors!`, 'success');
    } else {
      this.log('No critical syntax errors found', 'info');
    }
  }
}

// Execute if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  const fixer = new CriticalSyntaxFixer();
  fixer.run().catch(err => {
    console.error('CriticalSyntaxFixer failed:', err);
    process.exitCode = 1;
  });
}

export { CriticalSyntaxFixer };