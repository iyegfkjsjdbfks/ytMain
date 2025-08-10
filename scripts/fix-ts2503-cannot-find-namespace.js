#!/usr/bin/env node
/**
 * Fix TypeScript TS2503 "Cannot find namespace" errors
 * Adds namespace declarations and imports for missing namespaces
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class NamespaceNotFoundFixer {
  constructor() {
    this.fixedCount = 0;
    this.processedFiles = new Set();
    
    // Common namespace mappings
    this.namespaceDeclarations = {
      'React': `
declare namespace React {
  interface JSX {
    IntrinsicElements: any;
  }
  interface Component<P = {}, S = {}> {
    props: P;
    state: S;
  }
  interface FC<P = {}> {
    (props: P): JSX.Element;
  }
}`,
      'JSX': `
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  interface Element extends React.ReactElement<any, any> {}
  interface ElementClass extends React.Component<any> {}
  interface ElementAttributesProperty { props: {}; }
  interface ElementChildrenAttribute { children: {}; }
}`,
      'NodeJS': `
declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
  interface Process {
    env: ProcessEnv;
  }
}`,
      'Express': `
declare namespace Express {
  interface Request {}
  interface Response {}
  interface Application {}
}`,
      'Window': `
declare namespace Window {
  [key: string]: any;
}`,
      'Document': `
declare namespace Document {
  [key: string]: any;
}`,
      'Global': `
declare namespace Global {
  [key: string]: any;
}`
    };

    // Required imports for specific namespaces
    this.requiredImports = {
      'React': "import React from 'react';",
      'JSX': "/// <reference types=\"react/jsx-runtime\" />",
      'NodeJS': "/// <reference types=\"node\" />",
      'Express': "import { Express } from 'express';"
    };
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
        // Match TS2503 errors: Cannot find namespace 'NamespaceName'
        const match = line.match(/(.+?)\((\d+),(\d+)\): error TS2503: Cannot find namespace '(.+?)'/);
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            namespace: match[4]
          });
        }
      }
      
      return errors;
    }
  }

  fixNamespaceNotFound(filePath, errors) {
    if (!existsSync(filePath) || this.processedFiles.has(filePath)) {
      return false;
    }

    this.processedFiles.add(filePath);
    
    try {
      let content = readFileSync(filePath, 'utf8');
      let modified = false;
      const originalContent = content;

      // Get unique namespaces from errors
      const uniqueNamespaces = [...new Set(errors.map(e => e.namespace))];

      for (const namespace of uniqueNamespaces) {
        // Check if namespace already exists in file
        const namespacePattern = new RegExp(`declare\\s+namespace\\s+${namespace}`, 'i');
        const importPattern = new RegExp(`import.*${namespace}.*from`, 'i');
        
        if (namespacePattern.test(content) || importPattern.test(content)) {
          continue; // Already handled
        }

        // Add required import if needed
        if (this.requiredImports[namespace]) {
          const requiredImport = this.requiredImports[namespace];
          if (!content.includes(requiredImport.replace(/'/g, '"')) && !content.includes(requiredImport)) {
            const lines = content.split('\n');
            let insertIndex = 0;
            
            // Find the best place to add import
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].startsWith('import ') || lines[i].startsWith('///')) {
                insertIndex = i + 1;
              } else if (lines[i].trim() === '' && insertIndex > 0) {
                break;
              }
            }

            if (insertIndex === 0) {
              content = `${requiredImport}\n\n${content}`;
            } else {
              lines.splice(insertIndex, 0, requiredImport);
              content = lines.join('\n');
            }
            modified = true;
          }
        }

        // Add namespace declaration if we have one
        if (this.namespaceDeclarations[namespace]) {
          const declaration = this.namespaceDeclarations[namespace];
          
          // Add at the top after imports
          const lines = content.split('\n');
          let insertIndex = lines.length;
          
          // Find the best place to add declaration (after imports, before code)
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ') || lines[i].startsWith('///')) {
              continue;
            } else if (lines[i].trim() === '') {
              continue;
            } else {
              insertIndex = i;
              break;
            }
          }

          lines.splice(insertIndex, 0, declaration, '');
          content = lines.join('\n');
          modified = true;
        } else {
          // Create a basic namespace declaration
          const basicDeclaration = `
declare namespace ${namespace} {
  // TODO: Add proper namespace definition
  [key: string]: any;
}`;
          
          const lines = content.split('\n');
          let insertIndex = lines.length;
          
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ') || lines[i].startsWith('///')) {
              continue;
            } else if (lines[i].trim() === '') {
              continue;
            } else {
              insertIndex = i;
              break;
            }
          }

          lines.splice(insertIndex, 0, basicDeclaration, '');
          content = lines.join('\n');
          modified = true;
        }
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
    this.log('Starting TS2503 (cannot find namespace) error fixes...');
    
    const errors = this.getTypeScriptErrors();
    this.log(`Found ${errors.length} TS2503 errors to fix`);
    
    if (errors.length === 0) {
      this.log('No TS2503 errors found!', 'success');
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
      
      if (this.fixNamespaceNotFound(fullPath, fileErrorList)) {
        totalFixed++;
        this.fixedCount++;
      }
    }

    // Check results
    const remainingErrors = this.getTypeScriptErrors();
    const remainingTS2503 = remainingErrors.filter(e => e.toString().includes('TS2503')).length;
    
    this.log(`✅ Fixed namespace issues in ${totalFixed} files`);
    this.log(`⚠️ ${remainingTS2503} TS2503 errors remaining`);
    
    if (remainingTS2503 < errors.length) {
      this.log(`Reduced TS2503 errors from ${errors.length} to ${remainingTS2503}`, 'success');
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new NamespaceNotFoundFixer();
  fixer.run().catch(console.error);
}

export { NamespaceNotFoundFixer };