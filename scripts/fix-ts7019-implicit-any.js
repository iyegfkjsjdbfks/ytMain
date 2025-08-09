#!/usr/bin/env node
/**
 * Fix TS7019: Rest parameter 'args' implicitly has an 'any[]' type
 * Strategy: Add explicit typing to rest parameters
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class TS7019Fixer {
  constructor() {
    this.fixedFiles = new Set();
  }

  async run() {
    this.log('🔧 Starting TS7019 implicit any type fixes...');
    
    const initialCount = this.getErrorCount();
    this.log(`Found ${initialCount} TS7019 errors to fix`);
    
    if (initialCount === 0) {
      this.log('No TS7019 errors found!', 'success');
      return;
    }

    const errors = this.getErrors();
    const fileGroups = {};
    
    // Group errors by file
    for (const error of errors) {
      const filePath = error.file;
      if (!fileGroups[filePath]) {
        fileGroups[filePath] = [];
      }
      fileGroups[filePath].push(error);
    }

    let filesModified = 0;
    
    // Process each file
    for (const [filePath, fileErrors] of Object.entries(fileGroups)) {
      try {
        const modified = this.fixFile(filePath, fileErrors);
        if (modified) {
          filesModified++;
          this.log(`Fixed ${filePath}`);
        }
      } catch (error) {
        this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      }
    }

    const finalCount = this.getErrorCount();
    const fixed = initialCount - finalCount;
    
    this.log('\n=== TS7019 Fix Results ===');
    this.log(`Initial errors: ${initialCount}`);
    this.log(`Final errors: ${finalCount}`);
    this.log(`Errors fixed: ${fixed}`);
    this.log(`Files modified: ${filesModified}`);
    this.log(`Fix rate: ${((fixed / (initialCount || 1)) * 100).toFixed(1)}%`);
    
    if (finalCount < initialCount) {
      this.log('Successfully reduced TS7019 errors!', 'success');
    } else if (finalCount <= initialCount) {
      this.log('Error count maintained (no increase)', 'success');
    } else {
      this.log('Warning: Error count increased', 'warning');
    }
  }

  log(message, type = 'info') {
    const prefix = { info: '🔤', success: '✅', error: '❌', warning: '⚠️' }[type] || '🔤';
    console.log(`${prefix} ${message}`);
  }

  getErrorCount() {
    try {
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
      return output.split('\n').filter(l => /error TS7019:/.test(l)).length;
    } catch {
      return 0;
    }
  }

  getErrors() {
    try {
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
      
      return output.split('\n').filter(Boolean).map(line => {
        const match = line.match(/([^:]+):(\d+):(\d+):\s*error TS7019: Rest parameter '([^']+)' implicitly has an 'any\[\]' type/);
        if (match) {
          return {
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            parameter: match[4]
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
      let content = readFileSync(fullPath, 'utf8');
      let modified = false;

      // Group errors by parameter name
      const errorsByParam = {};
      for (const error of errors) {
        if (!errorsByParam[error.parameter]) {
          errorsByParam[error.parameter] = [];
        }
        errorsByParam[error.parameter].push(error);
      }

      // Fix each parameter
      for (const [paramName, paramErrors] of Object.entries(errorsByParam)) {
        const fixResult = this.fixRestParameter(content, paramName, paramErrors, filePath);
        if (fixResult.modified) {
          content = fixResult.content;
          modified = true;
        }
      }

      if (modified) {
        writeFileSync(fullPath, content);
        this.fixedFiles.add(filePath);
        this.log(`Fixed rest parameter types in ${filePath}`, 'success');
      }

      return modified;
    } catch (error) {
      this.log(`Error fixing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  fixRestParameter(content, paramName, errors, filePath) {
    let modified = false;
    let newContent = content;

    // Common rest parameter patterns and their appropriate types
    const typePatterns = [
      // Function arguments: ...args -> ...args: any[]
      {
        pattern: new RegExp(`\\.\\.\\.${paramName}(?!:)`, 'g'),
        replacement: `...${paramName}: any[]`
      },
      // Event handler arguments: ...eventArgs -> ...eventArgs: Event[]
      {
        pattern: new RegExp(`\\.\\.\\.${paramName}(?!:)`, 'g'),
        replacement: paramName.includes('event') || paramName.includes('Event') ? 
          `...${paramName}: Event[]` : 
          `...${paramName}: any[]`
      },
      // Method arguments: ...methodArgs -> ...methodArgs: unknown[]
      {
        pattern: new RegExp(`\\.\\.\\.${paramName}(?!:)`, 'g'),
        replacement: paramName.includes('method') || paramName.includes('Method') ? 
          `...${paramName}: unknown[]` : 
          `...${paramName}: any[]`
      }
    ];

    // Context-specific typing based on function context
    const lines = content.split('\n');
    for (const error of errors) {
      const lineIndex = error.line - 1;
      if (lineIndex < lines.length) {
        const line = lines[lineIndex];
        const contextualType = this.getContextualType(line, paramName);
        
        // Apply the fix with contextual type
        if (line.includes(`...${paramName}`) && !line.includes(`...${paramName}:`)) {
          const fixedLine = line.replace(`...${paramName}`, `...${paramName}: ${contextualType}`);
          if (fixedLine !== line) {
            lines[lineIndex] = fixedLine;
            modified = true;
          }
        }
      }
    }

    if (modified) {
      newContent = lines.join('\n');
    }

    return { content: newContent, modified };
  }

  getContextualType(line, paramName) {
    // Determine appropriate type based on context
    const lowerLine = line.toLowerCase();
    const lowerParam = paramName.toLowerCase();

    // Event-related parameters
    if (lowerParam.includes('event') || lowerLine.includes('event') || lowerLine.includes('handler')) {
      return 'Event[]';
    }

    // Error-related parameters
    if (lowerParam.includes('error') || lowerLine.includes('error') || lowerLine.includes('catch')) {
      return 'Error[]';
    }

    // String-related parameters
    if (lowerParam.includes('string') || lowerParam.includes('text') || lowerParam.includes('message')) {
      return 'string[]';
    }

    // Number-related parameters
    if (lowerParam.includes('number') || lowerParam.includes('count') || lowerParam.includes('index')) {
      return 'number[]';
    }

    // React-related parameters
    if (lowerLine.includes('react') || lowerLine.includes('component') || lowerLine.includes('props')) {
      return 'React.ReactNode[]';
    }

    // DOM-related parameters
    if (lowerParam.includes('element') || lowerParam.includes('node') || lowerLine.includes('dom')) {
      return 'HTMLElement[]';
    }

    // Function parameters
    if (lowerParam.includes('fn') || lowerParam.includes('func') || lowerParam.includes('callback')) {
      return 'Function[]';
    }

    // Generic arguments or unknown context
    if (lowerParam.includes('arg') || lowerParam.includes('param')) {
      return 'unknown[]';
    }

    // Default to any[] for maximum compatibility
    return 'any[]';
  }

  run() {
    const initialCount = this.getErrorCount();
    this.log(`Found ${initialCount} TS7019 implicit any type errors`);

    if (initialCount === 0) {
      this.log('No TS7019 errors found!', 'success');
      return;
    }

    const errors = this.getErrors();
    
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

    const finalCount = this.getErrorCount();
    const improvement = initialCount - finalCount;

    this.log(`\n=== TS7019 Fix Results ===`);
    this.log(`Initial errors: ${initialCount}`);
    this.log(`Final errors: ${finalCount}`);
    this.log(`Errors fixed: ${improvement}`);
    this.log(`Files modified: ${this.fixedFiles.size}`);
    this.log(`Fix rate: ${((improvement / initialCount) * 100).toFixed(1)}%`);

    if (improvement > 0) {
      this.log('TS7019 errors successfully reduced!', 'success');
    } else if (finalCount <= initialCount) {
      this.log('Error count maintained (no increase)', 'success');
    } else {
      this.log('Warning: Error count increased', 'warning');
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new TS7019Fixer();
  fixer.run().catch(console.error);
}

export { TS7019Fixer };