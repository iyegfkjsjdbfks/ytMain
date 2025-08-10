#!/usr/bin/env node
/**
 * Fix TS2304: Cannot find name errors
 * Fixes undefined variables and missing imports
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class TS2304Fixer {
  constructor() {
    this.fixedFiles = new Set();
    this.fixCount = 0;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🔧',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type] || '🔧';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async getErrorCount() {
    try {
      // Run type-check and count TS2304 lines in JS for cross-platform compatibility
      const run = () => {
        try {
          execSync('npm run type-check', { encoding: 'utf8', stdio: 'pipe', cwd: projectRoot });
          return '';
        } catch (err) {
          return `${err.stdout || ''}${err.stderr || ''}`;
        }
      };
      const output = run();
      if (!output) return 0;
      return output.split('\n').filter(line => /error TS2304:/.test(line)).length;
    } catch {
      return 0;
    }
  }

  async getTS2304Errors() {
    try {
      // Capture the full tsc output and parse in JS
      const run = () => {
        try {
          execSync('npm run type-check', { encoding: 'utf8', stdio: 'pipe', cwd: projectRoot });
          return '';
        } catch (err) {
          return `${err.stdout || ''}${err.stderr || ''}`;
        }
      };
      const output = run();
      if (!output) return [];
      return output.split('\n').filter(line => /error TS2304:/.test(line)).map(line => {
        const match = line.match(/([^:]+):(\d+):(\d+):\s*error TS2304: Cannot find name '([^']+)'/);
        if (match) {
          return {
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            variable: match[4]
          };
        }
        return null;
      }).filter(Boolean);
    } catch {
      return [];
    }
  }

  fixFile(filePath, errors) {
    const fullPath = join(projectRoot, filePath);

    try {
      // Check if file exists and is readable
      if (!require('fs').existsSync(fullPath)) {
        this.log(`File not found: ${filePath}`, 'warning');
        return false;
      }

      let content = readFileSync(fullPath, 'utf8');
      let modified = false;
      
      // Group errors by variable name
      const errorsByVariable = {};
      for (const error of errors) {
        if (!errorsByVariable[error.variable]) {
          errorsByVariable[error.variable] = [];
        }
        errorsByVariable[error.variable].push(error);
      }

      // Fix common patterns
      for (const [varName, varErrors] of Object.entries(errorsByVariable)) {
        const fixed = this.fixVariable(content, varName, varErrors, filePath);
        if (fixed.modified) {
          content = fixed.content;
          modified = true;
          this.fixCount += varErrors.length;
        }
      }

      if (modified) {
        try {
          writeFileSync(fullPath, content);
          this.fixedFiles.add(filePath);
          this.log(`Fixed ${errors.length} TS2304 errors in ${filePath}`, 'success');
        } catch (writeError) {
          this.log(`Failed to write file ${filePath}: ${writeError.message}`, 'error');
          return false;
        }
      }

      return modified;
    } catch (error) {
      this.log(`Error fixing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  fixVariable(content, varName, errors, filePath) {
    let modified = false;
    let newContent = content;

    // Pattern 1: Fix parameter underscore issues (e.g., _context vs context)
    if (varName.startsWith('_') || content.includes(`_${varName}`)) {
      const underscoredVar = varName.startsWith('_') ? varName : `_${varName}`;
      const normalVar = varName.startsWith('_') ? varName.substring(1) : varName;
      
      // Check if the underscored version exists in function parameters
      const funcParamRegex = new RegExp(`\\(([^)]*${underscoredVar}[^)]*)\\)`, 'g');
      if (funcParamRegex.test(content)) {
        // Replace usage with underscored version
        newContent = newContent.replace(new RegExp(`\\b${normalVar}\\b`, 'g'), underscoredVar);
        modified = true;
      }
    }

    // Pattern 2: Fix common missing variable declarations
    const commonFixes = {
      'React': "import React from 'react';",
      'version': "const version = process.env.npm_package_version || '1.0.0';",
      'config': "const config = this.config;",
      'strategy': "const strategy = this.strategy;",
      'batchSize': "const batchSize = config.batchSize || 5;",
      'threshold': "const threshold = this.threshold;",
      'context': "const context = this._context;",
      'flag': "const flag = this.flag;"
    };

    if (commonFixes[varName]) {
      // Check if it's not already imported/declared
      if (!content.includes(commonFixes[varName]) && !content.includes(`const ${varName}`)) {
        if (varName === 'React') {
          // Add React import at the top
          newContent = commonFixes[varName] + '\n' + newContent;
        } else {
          // Add variable declaration at the start of the function/method
          const lines = newContent.split('\n');
          for (const error of errors) {
            const lineIndex = error.line - 1;
            if (lineIndex < lines.length) {
              // Find the function/method start
              let insertIndex = lineIndex;
              for (let i = lineIndex; i >= 0; i--) {
                if (lines[i].includes('{') && (lines[i].includes('function') || lines[i].includes('=>') || lines[i].includes('{'))) {
                  insertIndex = i + 1;
                  break;
                }
              }
              
              // Insert the declaration
              const indent = lines[insertIndex]?.match(/^\s*/)?.[0] || '    ';
              lines.splice(insertIndex, 0, `${indent}${commonFixes[varName]}`);
              modified = true;
              break;
            }
          }
          newContent = lines.join('\n');
        }
      }
    }

    // Pattern 3: Fix missing type imports
    if (filePath.includes('.ts') || filePath.includes('.tsx')) {
      const typeImports = {
        'Video': "import { Video } from '../types';",
        'User': "import { User } from '../types';",
        'Channel': "import { Channel } from '../types';"
      };

      if (typeImports[varName] && !content.includes(`import.*${varName}`)) {
        newContent = typeImports[varName] + '\n' + newContent;
        modified = true;
      }
    }

    return { content: newContent, modified };
  }

  async run() {
    this.log('Starting TS2304 (Cannot find name) error fixes...');
    
    const initialCount = await this.getErrorCount();
    this.log(`Found ${initialCount} TS2304 errors to fix`);

    if (initialCount === 0) {
      this.log('No TS2304 errors found!', 'success');
      return;
    }

    const errors = await this.getTS2304Errors();
    
    // Group errors by file
    const errorsByFile = {};
    for (const error of errors) {
      if (!errorsByFile[error.file]) {
        errorsByFile[error.file] = [];
      }
      errorsByFile[error.file].push(error);
    }

    // Fix each file
    for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
      this.fixFile(filePath, fileErrors);
    }

    // Check final count
    const finalCount = await this.getErrorCount();
    const improvement = initialCount - finalCount;

    this.log(`\n=== TS2304 Fix Results ===`);
    this.log(`Initial errors: ${initialCount}`);
    this.log(`Final errors: ${finalCount}`);
    this.log(`Errors fixed: ${improvement}`);
    this.log(`Files modified: ${this.fixedFiles.size}`);
    this.log(`Fix rate: ${((improvement / initialCount) * 100).toFixed(1)}%`);

    if (improvement > 0) {
      this.log('TS2304 errors successfully reduced!', 'success');
    } else if (finalCount <= initialCount) {
      this.log('Error count maintained (no increase)', 'success');
    } else {
      this.log('Warning: Error count increased', 'warning');
    }
  }
}

// Run the fixer
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new TS2304Fixer();
  fixer.run().catch(console.error);
}

export { TS2304Fixer };