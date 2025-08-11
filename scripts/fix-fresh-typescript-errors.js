#!/usr/bin/env node
/**
 * Fresh TypeScript Error Fixer
 * Specifically targets the current syntax errors found in the codebase
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

class FreshTypeScriptErrorFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
    this.patterns = [
      // Fix malformed type predicates like: value) value is Record<string, a={true}n={true}y>
      {
        name: 'Malformed type predicate with corrupted any type',
        pattern: /(\w+)\)\s+\w+\s+is\s+Record<string,\s*a=\{true\}n=\{true\}y>/g,
        replacement: '$1): $1 is Record<string, any>'
      },
      
      // Fix missing colons in function signatures: value) value is
      {
        name: 'Missing colon in function type predicate',
        pattern: /(\w+)\)\s+(\w+)\s+is\s+\(/g,
        replacement: '$1): $2 is ('
      },
      
      // Fix corrupted generic syntax: <T ext={true}e={true}n={true}d={true}s={true}
      {
        name: 'Corrupted generic syntax',
        pattern: /<T\s+ext=\{true\}e=\{true\}n=\{true\}d=\{true\}s=\{true\}\s+\(\.\.\.args\)\s*=>\s*any>/g,
        replacement: '<T extends (...args: any[]) => any>'
      },
      
      // Fix malformed function declarations ending with semicolon instead of opening brace
      {
        name: 'Function declaration ending with semicolon',
        pattern: /export\s+function\s+(\w+)<([^>]*)>\(\s*([^)]*)\):\s*([^{;]+);/g,
        replacement: 'export function $1<$2>($3): $4 {'
      },
      
      // Fix function parameter lists ending with semicolon instead of opening brace
      {
        name: 'Function ending with semicolon instead of brace',
        pattern: /return\s+function\s+(\w+)\(([^)]*)\):\s*([^{;]+);/g,
        replacement: 'return function $1($2): $3 {'
      },
      
      // Fix missing opening brace after function parameter list
      {
        name: 'Missing opening brace after function params',
        pattern: /return\s+function\s+(\w+)\(([^)]*)\);/g,
        replacement: 'return function $1($2) {'
      },
      
      // Fix statements ending with semicolon that should have opening brace
      {
        name: 'Arrow function in const later with semicolon',
        pattern: /const\s+(\w+)\s*=\s*\(\)\s*=>\s*\{;/g,
        replacement: 'const $1 = () => {'
      },
      
      // Fix common comma expected errors in generic syntax
      {
        name: 'Missing comma in generic parameters',
        pattern: /export\s+function\s+(\w+)<([^,>]+)\s+([^,>]+)\s+([^,>]+)\s+([^>]+)>/g,
        replacement: 'export function $1<$2, $3, $4, $5>'
      },
      
      // Fix missing comma in parameter lists
      {
        name: 'Missing comma in function parameters',
        pattern: /\(([^,)]+)\s+([^,)]+)\s*\)/g,
        replacement: '($1, $2)'
      }
    ];
  }

  fixFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      let modifiedContent = content;
      let fileChanged = false;
      
      for (const pattern of this.patterns) {
        const before = modifiedContent;
        modifiedContent = modifiedContent.replace(pattern.pattern, pattern.replacement);
        
        if (modifiedContent !== before) {
          fileChanged = true;
          const matches = (before.match(pattern.pattern) || []).length;
          this.totalFixes += matches;
          console.log(`  ✓ Applied "${pattern.name}" pattern: ${matches} fixes`);
        }
      }
      
      if (fileChanged) {
        writeFileSync(filePath, modifiedContent);
        this.fixedFiles++;
        console.log(`✅ Fixed: ${filePath}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  processDirectory(dirPath) {
    try {
      const items = readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = join(dirPath, item);
        const stats = statSync(fullPath);
        
        if (stats.isDirectory()) {
          // Skip node_modules and other build directories
          if (!['node_modules', 'dist', 'build', '.git', 'coverage'].includes(item)) {
            this.processDirectory(fullPath);
          }
        } else if (stats.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
          console.log(`🔍 Checking: ${fullPath}`);
          this.fixFile(fullPath);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing directory ${dirPath}:`, error.message);
    }
  }

  run() {
    console.log('🚀 Starting Fresh TypeScript Error Fixer...');
    console.log('');
    
    const startTime = Date.now();
    const rootDir = process.cwd();
    
    this.processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('');
    console.log('📊 FIXING COMPLETE');
    console.log('=====================================');
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📁 Files processed: ${this.fixedFiles}`);
    console.log(`🔧 Total fixes applied: ${this.totalFixes}`);
    console.log('');
    
    if (this.totalFixes > 0) {
      console.log('✅ Run `npm run type-check` to verify the fixes');
    } else {
      console.log('ℹ️  No patterns matched - errors may require manual review');
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new FreshTypeScriptErrorFixer();
  fixer.run();
}

export { FreshTypeScriptErrorFixer };