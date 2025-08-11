#!/usr/bin/env node
/**
 * Duplicate Import Fixer
 * Fixes duplicate import statements that cause TS2300 errors
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

class DuplicateImportFixer {
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

  fixDuplicateImports(content) {
    let fixedContent = content;
    let fixes = 0;

    // Split content into lines for easier processing
    const lines = fixedContent.split('\n');
    const importMap = new Map();
    const processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this is an import statement
      const importMatch = line.match(/^import\s+(.+?)\s+from\s+['"](.+?)['"];?\s*$/);
      
      if (importMatch) {
        const [, importPart, modulePath] = importMatch;
        const key = `${importPart.trim()}-${modulePath}`;
        
        if (importMap.has(key)) {
          // This is a duplicate import, skip it
          fixes++;
          this.log(`Removing duplicate import: ${line.trim()}`, 'info');
          continue;
        } else {
          importMap.set(key, true);
        }
      }
      
      processedLines.push(line);
    }
    
    fixedContent = processedLines.join('\n');

    // Additional specific fixes for common duplicate patterns
    
    // Fix duplicate React imports
    const reactTypeImportPattern = /import\s+type\s+React\s+from\s+['"]react['"];?\s*\n/g;
    const reactDefaultImportPattern = /import\s+React\s+from\s+['"]react['"];?\s*\n/g;
    
    const reactTypeMatches = [...fixedContent.matchAll(reactTypeImportPattern)];
    const reactDefaultMatches = [...fixedContent.matchAll(reactDefaultImportPattern)];
    
    if (reactTypeMatches.length > 1) {
      // Keep only the first type import
      for (let i = 1; i < reactTypeMatches.length; i++) {
        fixedContent = fixedContent.replace(reactTypeMatches[i][0], '');
        fixes++;
      }
    }
    
    if (reactDefaultMatches.length > 1) {
      // Keep only the first default import
      for (let i = 1; i < reactDefaultMatches.length; i++) {
        fixedContent = fixedContent.replace(reactDefaultMatches[i][0], '');
        fixes++;
      }
    }

    // Fix duplicate BrowserRouter imports
    const browserRouterPattern = /import\s+\{\s*BrowserRouter\s*\}\s+from\s+['"]react-router-dom['"];?\s*\n/g;
    const browserRouterMatches = [...fixedContent.matchAll(browserRouterPattern)];
    
    if (browserRouterMatches.length > 1) {
      for (let i = 1; i < browserRouterMatches.length; i++) {
        fixedContent = fixedContent.replace(browserRouterMatches[i][0], '');
        fixes++;
      }
    }

    // Clean up multiple consecutive empty lines that might result from removals
    fixedContent = fixedContent.replace(/\n\n\n+/g, '\n\n');

    return { content: fixedContent, fixes };
  }

  async processFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const result = this.fixDuplicateImports(content);
      
      if (result.fixes > 0) {
        writeFileSync(filePath, result.content);
        this.fixedFiles++;
        this.totalFixes += result.fixes;
        this.log(`Fixed ${result.fixes} duplicate imports in ${filePath}`);
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
    this.log('🚀 Starting duplicate import fixes...');
    
    const startTime = Date.now();
    await this.findAndProcessFiles(process.cwd());
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    this.log('\n' + '='.repeat(60));
    this.log('📊 DUPLICATE IMPORT FIXING REPORT');
    this.log('='.repeat(60));
    this.log(`⏱️  Duration: ${duration} seconds`);
    this.log(`📁 Files processed: ${this.processedFiles}`);
    this.log(`🔧 Files fixed: ${this.fixedFiles}`);
    this.log(`✨ Total fixes applied: ${this.totalFixes}`);
    
    if (this.totalFixes > 0) {
      this.log(`🎉 Successfully fixed ${this.totalFixes} duplicate imports!`, 'success');
    } else {
      this.log('ℹ️  No duplicate imports found.', 'info');
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new DuplicateImportFixer();
  fixer.run().catch(err => {
    console.error('DuplicateImportFixer failed:', err);
    process.exitCode = 1;
  });
}

export { DuplicateImportFixer };
