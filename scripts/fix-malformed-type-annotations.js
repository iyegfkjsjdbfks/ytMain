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

    // Pattern 1: Fix malformed type annotations in function parameters
    // ({ param1, param2, param3 }: {param3: any}: {param2: any}: {param1: any}) =>
    const pattern1 = /\(\s*\{\s*([^}]+)\s*\}\s*:\s*\{[^}]+\}(?:\s*:\s*\{[^}]+\})*\s*\)\s*=>/g;
    fixedContent = fixedContent.replace(pattern1, (match, params) => {
      fixes++;
      // Clean up the parameters by removing any type annotations within them
      const cleanParams = params
        .split(',')
        .map(param => param.trim().split(':')[0].trim())
        .join(', ');
      return `({ ${cleanParams} }) =>`;
    });

    // Pattern 2: Fix malformed type annotations in React.FC component definitions
    // React.FC<Props> = ({ param1, param2 }: {param2: any}: {param1: any}) =>
    const pattern2 = /(React\.FC<[^>]*>\s*=\s*)\(\s*\{\s*([^}]+)\s*\}\s*:\s*\{[^}]+\}(?:\s*:\s*\{[^}]+\})*\s*\)\s*=>/g;
    fixedContent = fixedContent.replace(pattern2, (match, prefix, params) => {
      fixes++;
      // Clean up the parameters by removing any type annotations within them
      const cleanParams = params
        .split(',')
        .map(param => param.trim().split(':')[0].trim())
        .join(', ');
      return `${prefix}({ ${cleanParams} }) =>`;
    });

    // Pattern 3: Fix malformed type annotations in arrow function definitions
    // const Component = ({ param1, param2 }: {param2: any}: {param1: any}) =>
    const pattern3 = /(const\s+\w+\s*=\s*)\(\s*\{\s*([^}]+)\s*\}\s*:\s*\{[^}]+\}(?:\s*:\s*\{[^}]+\})*\s*\)\s*=>/g;
    fixedContent = fixedContent.replace(pattern3, (match, prefix, params) => {
      fixes++;
      // Clean up the parameters by removing any type annotations within them
      const cleanParams = params
        .split(',')
        .map(param => param.trim().split(':')[0].trim())
        .join(', ');
      return `${prefix}({ ${cleanParams} }) =>`;
    });

    // Pattern 4: Fix malformed type annotations in function declarations
    // function Component({ param1, param2 }: {param2: any}: {param1: any})
    const pattern4 = /(function\s+\w+\s*)\(\s*\{\s*([^}]+)\s*\}\s*:\s*\{[^}]+\}(?:\s*:\s*\{[^}]+\})*\s*\)/g;
    fixedContent = fixedContent.replace(pattern4, (match, prefix, params) => {
      fixes++;
      // Clean up the parameters by removing any type annotations within them
      const cleanParams = params
        .split(',')
        .map(param => param.trim().split(':')[0].trim())
        .join(', ');
      return `${prefix}({ ${cleanParams} })`;
    });

    // Pattern 5: Fix remaining malformed `: any}:` patterns
    const pattern5 = /:\s*any\}\s*:\s*\{/g;
    fixedContent = fixedContent.replace(pattern5, (match) => {
      fixes++;
      return ', ';
    });

    // Pattern 6: Clean up remaining orphaned type annotations
    const pattern6 = /\}\s*:\s*\{[^}]*any[^}]*\}/g;
    fixedContent = fixedContent.replace(pattern6, (match) => {
      fixes++;
      return '}';
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