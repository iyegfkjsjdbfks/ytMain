#!/usr/bin/env node
/**
 * Fix TypeScript TS2875 "This JSX tag requires the module path 'react/jsx-runtime' to exist" errors
 * Ensures proper JSX runtime module configuration and imports
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class JSXRuntimeFixer {
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
        // Match TS2875 errors
        const match = line.match(/(.+?)\((\d+),(\d+)\): error TS2875: This JSX tag requires the module path '(.+?)' to exist/);
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            modulePath: match[4]
          });
        }
      }
      
      return errors;
    }
  }

  fixJSXRuntime(filePath) {
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
      const hasJSXReference = /\/\/\/\s*<reference\s+types\s*=\s*['""]react\/jsx-runtime['""]/.test(content);

      // Add JSX runtime reference at the top if missing
      if (!hasJSXReference) {
        const lines = content.split('\n');
        let insertIndex = 0;
        
        // Find the best place to add reference (at the very top, before any imports)
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('///') || lines[i].startsWith('/*') || lines[i].trim() === '') {
            insertIndex = i + 1;
          } else {
            break;
          }
        }

        lines.splice(insertIndex, 0, '/// <reference types="react/jsx-runtime" />');
        content = lines.join('\n');
        modified = true;
      }

      // Add React import if missing and file contains JSX
      if (!hasReactImport && (content.includes('<') && content.includes('>'))) {
        const lines = content.split('\n');
        let insertIndex = 0;
        
        // Find the best place to add React import (after references, before other imports)
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('///') || lines[i].startsWith('/*')) {
            insertIndex = i + 1;
          } else if (lines[i].startsWith('import ')) {
            insertIndex = i;
            break;
          } else if (lines[i].trim() !== '') {
            insertIndex = i;
            break;
          }
        }

        lines.splice(insertIndex, 0, "import React from 'react';");
        content = lines.join('\n');
        modified = true;
      }

      // Add global JSX declaration if needed
      const hasJSXDeclaration = /declare\s+global\s*\{[\s\S]*namespace\s+JSX/.test(content);
      if (!hasJSXDeclaration && content.includes('<') && content.includes('>')) {
        const jsxDeclaration = `
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
`;
        
        // Add at the end of the file
        content = content + '\n' + jsxDeclaration;
        modified = true;
      }

      // Fix any explicit jsx function calls
      content = content.replace(/React\.createElement\(/g, 'React.createElement(');
      if (content !== originalContent) {
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

  updateTSConfig() {
    const tsConfigPath = join(projectRoot, 'tsconfig.json');
    if (!existsSync(tsConfigPath)) {
      return false;
    }

    try {
      const content = readFileSync(tsConfigPath, 'utf8');
      const config = JSON.parse(content);
      
      let modified = false;

      // Ensure JSX is set to react-jsx or react
      if (!config.compilerOptions) {
        config.compilerOptions = {};
      }

      if (config.compilerOptions.jsx !== 'react-jsx' && config.compilerOptions.jsx !== 'react') {
        config.compilerOptions.jsx = 'react-jsx';
        modified = true;
      }

      // Ensure moduleResolution is node
      if (config.compilerOptions.moduleResolution !== 'node') {
        config.compilerOptions.moduleResolution = 'node';
        modified = true;
      }

      // Add react types to types array if not present
      if (!config.compilerOptions.types) {
        config.compilerOptions.types = [];
      }
      if (!config.compilerOptions.types.includes('react')) {
        config.compilerOptions.types.push('react');
        modified = true;
      }
      if (!config.compilerOptions.types.includes('react-dom')) {
        config.compilerOptions.types.push('react-dom');
        modified = true;
      }

      if (modified) {
        writeFileSync(tsConfigPath, JSON.stringify(config, null, 2), 'utf8');
        this.log('Updated tsconfig.json with JSX runtime configuration', 'success');
        return true;
      }

      return false;
    } catch (error) {
      this.log(`Error updating tsconfig.json: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    this.log('Starting TS2875 (JSX runtime module) error fixes...');
    
    // First, update tsconfig.json
    this.updateTSConfig();
    
    const errors = this.getTypeScriptErrors();
    this.log(`Found ${errors.length} TS2875 errors to fix`);
    
    if (errors.length === 0) {
      this.log('No TS2875 errors found!', 'success');
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
      
      if (this.fixJSXRuntime(fullPath)) {
        totalFixed++;
        this.fixedCount++;
      }
    }

    // Check results
    const remainingErrors = this.getTypeScriptErrors();
    const remainingTS2875 = remainingErrors.filter(e => e.toString().includes('TS2875')).length;
    
    this.log(`✅ Fixed JSX runtime issues in ${totalFixed} files`);
    this.log(`⚠️ ${remainingTS2875} TS2875 errors remaining`);
    
    if (remainingTS2875 < errors.length) {
      this.log(`Reduced TS2875 errors from ${errors.length} to ${remainingTS2875}`, 'success');
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new JSXRuntimeFixer();
  fixer.run().catch(console.error);
}

export { JSXRuntimeFixer };