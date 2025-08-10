#!/usr/bin/env node
/**
 * Final Syntax Error Cleanup
 * Handles the most stubborn remaining syntax errors
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

class FinalSyntaxCleanup {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
    this.patterns = [
      // Fix function call parameters with type annotations
      {
        name: 'Function call parameter types',
        pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*)\(([^)]*): any\)/g,
        replacement: '$1($2)'
      },
      // Fix array index access with type annotations
      {
        name: 'Array index with type annotations',
        pattern: /\[([^:\]]+): [^:\]]+\]/g,
        replacement: '[$1]'
      },
      // Fix variable assignments with type annotations
      {
        name: 'Variable with type annotation',
        pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*): [^,\s]+,/g,
        replacement: '$1,'
      },
      // Fix function parameters in map/forEach calls
      {
        name: 'Map function parameter types',
        pattern: /\.map\(([^)]*): any\)/g,
        replacement: '.map($1)'
      },
      // Fix function parameters in filter calls
      {
        name: 'Filter function parameter types',
        pattern: /\.filter\(([^)]*): any\)/g,
        replacement: '.filter($1)'
      },
      // Fix function parameters in forEach calls
      {
        name: 'ForEach function parameter types',
        pattern: /\.forEach\(([^)]*): any\)/g,
        replacement: '.forEach($1)'
      },
      // Fix function parameters in find calls
      {
        name: 'Find function parameter types',
        pattern: /\.find\(([^)]*): any\)/g,
        replacement: '.find($1)'
      },
      // Fix function parameters in some calls
      {
        name: 'Some function parameter types',
        pattern: /\.some\(([^)]*): any\)/g,
        replacement: '.some($1)'
      },
      // Fix function parameters in every calls
      {
        name: 'Every function parameter types',
        pattern: /\.every\(([^)]*): any\)/g,
        replacement: '.every($1)'
      },
      // Fix function parameters in reduce calls
      {
        name: 'Reduce function parameter types',
        pattern: /\.reduce\(([^)]*): any\)/g,
        replacement: '.reduce($1)'
      },
      // Fix destructured parameters with type annotations
      {
        name: 'Destructured parameter types',
        pattern: /\(\s*\{\s*([^}]*)\s*\}\s*:\s*[^)]+\s*\)/g,
        replacement: '({ $1 })'
      },
      // Fix JSX expression syntax errors
      {
        name: 'JSX expression cleanup',
        pattern: /\{([^}]*): any\}/g,
        replacement: '{$1}'
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
        this.log(`Fixed ${fileFixes} final syntax errors in ${filePath}`, 'success');
        return fileFixes;
      }
      
      return 0;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return 0;
    }
  }

  async run() {
    this.log('🚀 Starting final syntax error cleanup...');
    
    const projectRoot = process.cwd();
    const files = this.getAllTypeScriptFiles(projectRoot);
    
    this.log(`Found ${files.length} TypeScript files to check`);
    
    for (const file of files) {
      this.fixFile(file);
    }
    
    this.log('\n' + '='.repeat(60));
    this.log('📊 FINAL SYNTAX CLEANUP REPORT');
    this.log('='.repeat(60));
    this.log(`📁 Files processed: ${files.length}`);
    this.log(`🔧 Files fixed: ${this.fixedFiles}`);
    this.log(`✨ Total fixes applied: ${this.totalFixes}`);
    
    if (this.totalFixes > 0) {
      this.log(`🎉 Successfully fixed ${this.totalFixes} final syntax errors!`, 'success');
    } else {
      this.log('No additional syntax errors found', 'info');
    }
  }
}

// Execute if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  const fixer = new FinalSyntaxCleanup();
  fixer.run().catch(err => {
    console.error('FinalSyntaxCleanup failed:', err);
    process.exitCode = 1;
  });
}

export { FinalSyntaxCleanup };