#!/usr/bin/env node
/**
 * JSX Error Fixer
 * Fixes JSX-related errors like TS2657, TS17002, TS1109, etc.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

class JSXErrorFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
    this.patterns = [
      // Fix JSX expressions with malformed event handlers
      {
        name: 'Fix malformed event handlers',
        pattern: /onClick=\{\(e: Event\) => e: Event\.([^}]+)\}/g,
        replacement: 'onClick={(e) => e.$1}'
      },
      {
        name: 'Fix malformed onKeyPress handlers',
        pattern: /onKeyPress=\{\(e: Event\) => e: Event\.([^}]+)\}/g,
        replacement: 'onKeyPress={(e) => e.$1}'
      },
      // Fix missing JSX fragments
      {
        name: 'Wrap orphaned JSX elements',
        pattern: /^(\s*<div[^>]*>[\s\S]*?<\/div>)\s*(<[^>]+[^/]>[^<]*<\/[^>]+>)/gm,
        replacement: '$1\n$2'
      },
      // Fix malformed JSX closing tags
      {
        name: 'Fix malformed closing tags',
        pattern: /<\/Link>\s*<\/([^>]+)>/g,
        replacement: '</Link>\n  </$1>'
      },
      // Fix missing closing parentheses in JSX
      {
        name: 'Fix missing closing parentheses',
        pattern: /\s*<\/div>\s*;\s*$/gm,
        replacement: '\n  </div>\n);'
      },
      // Fix malformed arrow function syntax in JSX
      {
        name: 'Fix arrow function syntax in JSX',
        pattern: /\{([^}]*) => ([^}]*): any([^}]*)\}/g,
        replacement: '{$1 => $2$3}'
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
    return filePath.endsWith('.tsx');
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
        this.log(`Fixed ${fileFixes} JSX errors in ${filePath}`, 'success');
        return fileFixes;
      }
      
      return 0;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return 0;
    }
  }

  async run() {
    this.log('🚀 Starting JSX error fixing...');
    
    const projectRoot = process.cwd();
    const files = this.getAllTypeScriptFiles(projectRoot);
    
    this.log(`Found ${files.length} TSX files to check`);
    
    for (const file of files) {
      this.fixFile(file);
    }
    
    this.log('\n' + '='.repeat(60));
    this.log('📊 JSX ERROR FIX REPORT');
    this.log('='.repeat(60));
    this.log(`📁 Files processed: ${files.length}`);
    this.log(`🔧 Files fixed: ${this.fixedFiles}`);
    this.log(`✨ Total fixes applied: ${this.totalFixes}`);
    
    if (this.totalFixes > 0) {
      this.log(`🎉 Successfully fixed ${this.totalFixes} JSX errors!`, 'success');
    } else {
      this.log('No JSX errors found', 'info');
    }
  }
}

// Execute if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  const fixer = new JSXErrorFixer();
  fixer.run().catch(err => {
    console.error('JSXErrorFixer failed:', err);
    process.exitCode = 1;
  });
}

export { JSXErrorFixer };