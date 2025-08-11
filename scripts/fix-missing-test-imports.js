#!/usr/bin/env node
/**
 * Missing Test Import Fixer
 * Adds missing imports for testing libraries (vitest, @testing-library/react, etc.)
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

class MissingTestImportFixer {
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

  fixMissingTestImports(content, filePath) {
    let fixedContent = content;
    let fixes = 0;

    // Check if this is a test file
    const isTestFile = filePath.includes('.test.') || filePath.includes('.spec.') || 
                      filePath.includes('/test/') || filePath.includes('/tests/') ||
                      filePath.includes('testing') || filePath.includes('testUtils');

    if (!isTestFile) {
      return { content: fixedContent, fixes };
    }

    // Find existing imports section
    const lines = fixedContent.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }

    const importsToAdd = [];

    // Check for missing RenderOptions, RenderResult
    if (content.includes('RenderOptions') && !content.includes('import') && !content.includes('RenderOptions')) {
      importsToAdd.push("import type { RenderOptions, RenderResult } from '@testing-library/react';");
      fixes++;
    }

    // Check for missing RenderHookOptions
    if (content.includes('RenderHookOptions') && !content.includes('RenderHookOptions')) {
      importsToAdd.push("import type { RenderHookOptions } from '@testing-library/react';");
      fixes++;
    }

    // Check for missing MockedFunction
    if (content.includes('MockedFunction') && !content.includes('MockedFunction')) {
      importsToAdd.push("import type { MockedFunction } from 'vitest';");
      fixes++;
    }

    // Check for missing vi (vitest)
    if (content.includes('vi.fn') && !content.includes('import') && !content.includes('vi')) {
      importsToAdd.push("import { vi } from 'vitest';");
      fixes++;
    }

    // Check for missing ReactNode
    if (content.includes('ReactNode') && content.includes('ReactNode') && content.includes('declared but never used')) {
      // Remove unused ReactNode import
      fixedContent = fixedContent.replace(/,\s*ReactNode/g, '');
      fixedContent = fixedContent.replace(/ReactNode,\s*/g, '');
      fixedContent = fixedContent.replace(/import\s+type\s+\{\s*ReactNode\s*\}/g, '');
      fixes++;
    }

    // Add missing imports after the last import
    if (importsToAdd.length > 0 && lastImportIndex >= 0) {
      const beforeImports = lines.slice(0, lastImportIndex + 1);
      const afterImports = lines.slice(lastImportIndex + 1);
      
      const newLines = [
        ...beforeImports,
        ...importsToAdd,
        ...afterImports
      ];
      
      fixedContent = newLines.join('\n');
    }

    // Fix specific patterns

    // Fix rest parameter types
    if (content.includes('Rest parameter') && content.includes('implicitly has an \'any[]\'')) {
      fixedContent = fixedContent.replace(
        /\(\.\.\.(args)\)\s*=>/g,
        '(...$1: any[]) =>'
      );
      fixes++;
    }

    // Fix unused parameter warnings by prefixing with underscore
    const unusedParamPattern = /'(\w+)' is declared but its value is never read\./g;
    const unusedMatches = [...content.matchAll(unusedParamPattern)];
    
    for (const match of unusedMatches) {
      const paramName = match[1];
      // Replace parameter name with underscore prefix
      const paramPattern = new RegExp(`\\b${paramName}\\b(?=\\s*[,\\)])`, 'g');
      fixedContent = fixedContent.replace(paramPattern, `_${paramName}`);
      fixes++;
    }

    return { content: fixedContent, fixes };
  }

  async processFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const result = this.fixMissingTestImports(content, filePath);
      
      if (result.fixes > 0) {
        writeFileSync(filePath, result.content);
        this.fixedFiles++;
        this.totalFixes += result.fixes;
        this.log(`Fixed ${result.fixes} missing test imports in ${filePath}`);
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
    this.log('🚀 Starting missing test import fixes...');
    
    const startTime = Date.now();
    await this.findAndProcessFiles(process.cwd());
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    this.log('\n' + '='.repeat(60));
    this.log('📊 MISSING TEST IMPORT FIXING REPORT');
    this.log('='.repeat(60));
    this.log(`⏱️  Duration: ${duration} seconds`);
    this.log(`📁 Files processed: ${this.processedFiles}`);
    this.log(`🔧 Files fixed: ${this.fixedFiles}`);
    this.log(`✨ Total fixes applied: ${this.totalFixes}`);
    
    if (this.totalFixes > 0) {
      this.log(`🎉 Successfully fixed ${this.totalFixes} missing test imports!`, 'success');
    } else {
      this.log('ℹ️  No missing test imports found.', 'info');
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new MissingTestImportFixer();
  fixer.run().catch(err => {
    console.error('MissingTestImportFixer failed:', err);
    process.exitCode = 1;
  });
}

export { MissingTestImportFixer };
