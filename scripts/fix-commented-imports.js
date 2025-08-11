import { createBrowserRouter, RouterProvider, BrowserRouter, Routes, Route, Link, NavLink, useNavigate, useLocation, useParams } from 'react-router-dom';
#!/usr/bin/env node
/**
 * Fix Commented Out Imports
 * Specifically targets imports that have been commented out with "TODO: Fix import"
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

class CommentedImportsFixer {
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

  fixCommentedImports(content) {
    let fixedContent = content;
    let fixes = 0;

    // Pattern 1: import statement
    const pattern1 = /\/\/\s*TODO:\s*Fix\s+import\s*-\s*(import\s+.+)/gi;
    fixedContent = fixedContent.replace(pattern1, (match, importStatement) => {
      fixes++;
      return importStatement;
    });

    // Pattern 2: // import statement (commented out imports)
    const pattern2 = /^\/\/\s+(import\s+.+from\s+['"][^'"]+['"];?\s*)$/gm;
    fixedContent = fixedContent.replace(pattern2, (match, importStatement) => {
      // Only uncomment if it looks like a valid import and doesn't have TODO
      if (!match.includes('TODO') && importStatement.includes('from')) {
        fixes++;
        return importStatement;
      }
      return match;
    });

    // Pattern 3: /* TODO: Fix import */ comment blocks around imports
    const pattern3 = /\/\*\s*TODO:\s*Fix\s+import\s*\*\/\s*(import\s+.+)/gi;
    fixedContent = fixedContent.replace(pattern3, (match, importStatement) => {
      fixes++;
      return importStatement;
    });

    return { content: fixedContent, fixes };
  }

  addMissingReactImport(content, filePath) {
    let fixedContent = content;
    let fixes = 0;

    // Check if this is a tsx/jsx file that needs React import
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) {
      return { content: fixedContent, fixes };
    }

    // Check if React is used but not imported
    const hasJSX = /<[A-Z]/.test(content) || /<\//.test(content) || /React\./.test(content);
    const hasReactImport = /import\s+.*React.*from\s+['"]react['"]/.test(content) || 
                          /import\s+React/.test(content);
    
    if (hasJSX && !hasReactImport) {
      // Add React import at the top after any reference types
      const lines = fixedContent.split('\n');
      let insertIndex = 0;
      
      // Skip over reference types and find the right place to insert
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('/// <reference') || lines[i].trim() === '') {
          insertIndex = i + 1;
        } else {
          break;
        }
      }
      
      lines.splice(insertIndex, 0, "import React from 'react';");
      fixedContent = lines.join('\n');
      fixes++;
    }

    return { content: fixedContent, fixes };
  }

  addMissingRouterImports(content, filePath) {
    let fixedContent = content;
    let fixes = 0;

    // Check for React Router usage without imports
    const routerPatterns = [
      'createBrowserRouter',
      'RouterProvider',
      'BrowserRouter',
      'Routes',
      'Route',
      'Link',
      'NavLink',
      'useNavigate',
      'useLocation',
      'useParams'
    ];

    const missingImports = [];
    for (const pattern of routerPatterns) {
      if (fixedContent.includes(pattern) && !fixedContent.includes(`import.*${pattern}`)) {
        missingImports.push(pattern);
      }
    }

    if (missingImports.length > 0) {
      // Add router imports
      const lines = fixedContent.split('\n');
      let insertIndex = 0;
      
      // Find where to insert (after existing imports)
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ') || lines[i].startsWith('/// <reference')) {
          insertIndex = i + 1;
        } else if (lines[i].trim() === '') {
          continue;
        } else {
          break;
        }
      }
      
      const importStatement = `import { ${missingImports.join(', ')} } from 'react-router-dom';`;
      lines.splice(insertIndex, 0, importStatement);
      fixedContent = lines.join('\n');
      fixes++;
    }

    return { content: fixedContent, fixes };
  }

  async processFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      let result = { content, fixes: 0 };
      
      // Apply all fixes
      const commentFix = this.fixCommentedImports(result.content);
      result.content = commentFix.content;
      result.fixes += commentFix.fixes;
      
      const reactFix = this.addMissingReactImport(result.content, filePath);
      result.content = reactFix.content;
      result.fixes += reactFix.fixes;
      
      const routerFix = this.addMissingRouterImports(result.content, filePath);
      result.content = routerFix.content;
      result.fixes += routerFix.fixes;
      
      if (result.fixes > 0) {
        writeFileSync(filePath, result.content);
        this.fixedFiles++;
        this.totalFixes += result.fixes;
        this.log(`Fixed ${result.fixes} import issues in ${filePath}`);
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
      } else if (stats.isFile() && (entry.endsWith('.tsx') || entry.endsWith('.ts') || entry.endsWith('.jsx') || entry.endsWith('.js'))) {
        await this.processFile(fullPath);
      }
    }
  }

  async run() {
    this.log('🚀 Starting commented imports fix...');
    
    const startTime = Date.now();
    await this.findAndProcessFiles(process.cwd());
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    this.log('\n' + '='.repeat(60));
    this.log('📊 COMMENTED IMPORTS FIXING REPORT');
    this.log('='.repeat(60));
    this.log(`⏱️  Duration: ${duration} seconds`);
    this.log(`📁 Files processed: ${this.processedFiles}`);
    this.log(`🔧 Files fixed: ${this.fixedFiles}`);
    this.log(`✨ Total fixes applied: ${this.totalFixes}`);
    
    if (this.totalFixes > 0) {
      this.log(`🎉 Successfully fixed ${this.totalFixes} import issues!`, 'success');
    } else {
      this.log('ℹ️  No commented import issues found.', 'info');
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new CommentedImportsFixer();
  fixer.run().catch(err => {
    console.error('CommentedImportsFixer failed:', err);
    process.exitCode = 1;
  });
}

export { CommentedImportsFixer };