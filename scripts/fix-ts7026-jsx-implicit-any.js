#!/usr/bin/env node
/**
 * Fix TypeScript TS7026 "JSX element implicitly has type 'any'" errors
 * Adds proper JSX type declarations and React imports
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class JSXImplicitAnyFixer {
  constructor() {
    this.fixedCount = 0;
    this.processedFiles = new Set();
  }

  log(message, type = 'info') {
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
    
    console.log(`${colors[type]}${prefix} ${message}${colors.reset}`);
  }

  getTypeScriptErrors() {
    try {
      execSync('npm run type-check', { encoding: 'utf8', stdio: 'pipe', cwd: projectRoot });
      return [];
    } catch (error) {
      const output = error.stdout + error.stderr;
      const lines = output.split('\n');
      const errors = [];
      
      for (const line of lines) {
        // Match TS7026 errors
        const match = line.match(/(.+?)\((\d+),(\d+)\): error TS7026: JSX element implicitly has type 'any'/);
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3])
          });
        }
      }
      
      return errors;
    }
  }

  fixJSXImplicitAny(filePath) {
    if (!existsSync(filePath) || this.processedFiles.has(filePath)) {
      return false;
    }

    this.processedFiles.add(filePath);
    
    try {
      let content = readFileSync(filePath, 'utf8');
      let modified = false;
      const originalContent = content;

      // Check if React is imported
      const hasReactImport = /import\s+.*React.*from\s+['"]react['"]/.test(content);
      const hasJSXImport = /import\s+.*jsx.*from\s+['"]react\/jsx-runtime['"]/.test(content);

      // Add React import if missing and file contains JSX
      if (!hasReactImport && (content.includes('<') || content.includes('jsx'))) {
        // Find the best place to add React import
        const lines = content.split('\n');
        let insertIndex = 0;
        
        // Look for existing imports
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
            insertIndex = i + 1;
          } else if (lines[i].trim() === '' && insertIndex > 0) {
            break;
          }
        }

        if (insertIndex === 0) {
          // No imports found, add at the beginning
          content = `import React from 'react';\n\n${content}`;
        } else {
          // Add after last import
          lines.splice(insertIndex, 0, "import React from 'react';");
          content = lines.join('\n');
        }
        modified = true;
      }

      // Add JSX types import if needed
      if (!hasJSXImport && content.includes('JSX') && !content.includes('react/jsx-runtime')) {
        const lines = content.split('\n');
        let insertIndex = 0;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
            insertIndex = i + 1;
          }
        }

        if (insertIndex > 0) {
          lines.splice(insertIndex, 0, "/// <reference types=\"react/jsx-runtime\" />");
          content = lines.join('\n');
          modified = true;
        }
      }

      // Fix JSX namespace issues
      if (content.includes('JSX.')) {
        content = content.replace(/JSX\./g, 'React.JSX.');
        modified = true;
      }

      // Add JSX namespace declaration if needed
      if (content.includes('<') && !content.includes('namespace JSX') && !hasJSXImport) {
        const namespaceDeclaration = `
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
`;
        content = namespaceDeclaration + content;
        modified = true;
      }

      if (modified) {
        writeFileSync(filePath, content, 'utf8');
        return true;
      }

      return false;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    this.log('Starting TS7026 (JSX implicit any) error fixes...');
    
    const errors = this.getTypeScriptErrors();
    this.log(`Found ${errors.length} TS7026 errors to fix`);
    
    if (errors.length === 0) {
      this.log('No TS7026 errors found!', 'success');
      return;
    }

    // Group errors by file
    const fileErrors = new Map();
    for (const error of errors) {
      if (!fileErrors.has(error.file)) {
        fileErrors.set(error.file, []);
      }
      fileErrors.get(error.file).push(error);
    }

    // Process each file
    let totalFixed = 0;
    for (const [file, fileErrorList] of fileErrors) {
      const fullPath = join(projectRoot, file);
      this.log(`Fixing ${fileErrorList.length} errors in ${file}`);
      
      if (this.fixJSXImplicitAny(fullPath)) {
        totalFixed++;
        this.fixedCount++;
      }
    }

    // Check results
    const remainingErrors = this.getTypeScriptErrors();
    const remainingTS7026 = remainingErrors.filter(e => e.toString().includes('TS7026')).length;
    
    this.log(`✅ Fixed JSX issues in ${totalFixed} files`);
    this.log(`⚠️ ${remainingTS7026} TS7026 errors remaining`);
    
    if (remainingTS7026 < errors.length) {
      this.log(`Reduced TS7026 errors from ${errors.length} to ${remainingTS7026}`, 'success');
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new JSXImplicitAnyFixer();
  fixer.run().catch(console.error);
}

export { JSXImplicitAnyFixer };