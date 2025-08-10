#!/usr/bin/env node
/**
 * Remaining Syntax Error Fixer
 * Fixes specific remaining syntax errors after the initial fixes
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

class RemainingSyntaxFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
    this.patterns = [
      // Fix malformed array parameter declarations: items[] => items
      {
        name: 'Malformed array parameter declarations',
        pattern: /\(([a-zA-Z_$][a-zA-Z0-9_$]*)\[\]\)/g,
        replacement: '($1)'
      },
      // Fix function parameter with array type: items[], query => items, query
      {
        name: 'Function parameters with malformed array types',
        pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*)\[\],/g,
        replacement: '$1,'
      },
      // Fix malformed arrow functions with event typing: (e: Event) => (e) =>
      {
        name: 'Arrow function event parameter',
        pattern: /\(e: Event\)\s*=>/g,
        replacement: '(e) =>'
      },
      // Fix malformed string parameter types: id: string => id
      {
        name: 'String parameter type annotations',
        pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*): string(?=\s*[=>,)])/g,
        replacement: '$1'
      },
      // Fix array access without parameter: const issues[] = const issues
      {
        name: 'Variable declaration with empty brackets',
        pattern: /const ([a-zA-Z_$][a-zA-Z0-9_$]*)\[\]/g,
        replacement: 'const $1'
      },
      // Fix method calls with malformed parameters: deps[] => deps
      {
        name: 'Method parameter with empty brackets',
        pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*)\[\](?=\s*[,);])/g,
        replacement: '$1'
      },
      // Fix event property access: e: Event => e
      {
        name: 'Event parameter in event handlers',
        pattern: /\(([^)]*): Event\)/g,
        replacement: '($1)'
      },
      // Fix tag parameter in map: tag: string => tag  
      {
        name: 'Map function parameter types',
        pattern: /\.map\(([a-zA-Z_$][a-zA-Z0-9_$]*): string\s*=>/g,
        replacement: '.map($1 =>'
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
        this.log(`Fixed ${fileFixes} remaining syntax errors in ${filePath}`, 'success');
        return fileFixes;
      }
      
      return 0;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return 0;
    }
  }

  async run() {
    this.log('🚀 Starting remaining syntax error fixing...');
    
    const projectRoot = process.cwd();
    const files = this.getAllTypeScriptFiles(projectRoot);
    
    this.log(`Found ${files.length} TypeScript files to check`);
    
    for (const file of files) {
      this.fixFile(file);
    }
    
    this.log('\n' + '='.repeat(60));
    this.log('📊 REMAINING SYNTAX FIX REPORT');
    this.log('='.repeat(60));
    this.log(`📁 Files processed: ${files.length}`);
    this.log(`🔧 Files fixed: ${this.fixedFiles}`);
    this.log(`✨ Total fixes applied: ${this.totalFixes}`);
    
    if (this.totalFixes > 0) {
      this.log(`🎉 Successfully fixed ${this.totalFixes} remaining syntax errors!`, 'success');
    } else {
      this.log('No remaining syntax errors found', 'info');
    }
  }
}

// Execute if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  const fixer = new RemainingSyntaxFixer();
  fixer.run().catch(err => {
    console.error('RemainingSyntaxFixer failed:', err);
    process.exitCode = 1;
  });
}

export { RemainingSyntaxFixer };