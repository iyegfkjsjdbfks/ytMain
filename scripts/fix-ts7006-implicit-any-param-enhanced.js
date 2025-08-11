#!/usr/bin/env node
/**
 * Enhanced TS7006 Fixer - Parameter implicitly has 'any' type
 * Targets the highest frequency error (1730 occurrences)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

class TS7006Fixer {
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
    const prefix = { info: '🔧', success: '✅', error: '❌', warning: '⚠️' }[type] || '🔧';
    console.log(`${colors[type]}${prefix} ${message}${colors.reset}`);
  }

  getTS7006Errors() {
    try {
      const result = execSync('npm run type-check 2>&1', { encoding: 'utf8', stdio: 'pipe' });
      return [];
    } catch (error) {
      const output = error.stdout + error.stderr;
      const errorLines = output.split('\n').filter(line => line.includes('error TS7006:'));
      
      return errorLines.map(line => {
        const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS7006: Parameter '([^']+)' implicitly has an 'any' type\./);
        if (match) {
          return {
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            parameter: match[4],
            fullLine: line
          };
        }
        return null;
      }).filter(Boolean);
    }
  }

  inferParameterType(parameter, fileContent, context) {
    const commonPatterns = {
      // React event handlers
      'e': 'React.FormEvent | Event',
      'event': 'React.FormEvent | Event', 
      'evt': 'React.FormEvent | Event',
      
      // Common DOM elements
      'element': 'HTMLElement',
      'el': 'HTMLElement',
      'node': 'HTMLElement',
      
      // Common data types
      'id': 'string',
      'index': 'number',
      'count': 'number',
      'value': 'string | number',
      'text': 'string',
      'name': 'string',
      'key': 'string',
      'data': 'any',
      'item': 'any',
      'obj': 'any',
      'config': 'any',
      'options': 'any',
      'props': 'any',
      'params': 'any',
      
      // Boolean flags
      'enabled': 'boolean',
      'disabled': 'boolean',
      'visible': 'boolean',
      'active': 'boolean',
      'checked': 'boolean',
      
      // Callback types
      'callback': '() => void',
      'cb': '() => void',
      'handler': '() => void',
      'fn': '() => void',
      
      // Array types
      'items': 'any[]',
      'list': 'any[]',
      'array': 'any[]'
    };

    // Check if parameter name suggests a type
    if (commonPatterns[parameter.toLowerCase()]) {
      return commonPatterns[parameter.toLowerCase()];
    }

    // Context-based inference
    if (context.includes('onClick') || context.includes('onSubmit') || context.includes('onChange')) {
      if (parameter === 'e' || parameter === 'event') {
        return 'React.FormEvent';
      }
    }

    if (context.includes('map(') || context.includes('forEach(') || context.includes('filter(')) {
      if (parameter === 'item' || parameter === 'elem') {
        return 'any';
      }
    }

    // Default fallback
    return 'any';
  }

  fixParameterType(filePath, line, column, parameter) {
    if (!existsSync(filePath)) return false;

    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    if (line > lines.length) return false;

    const targetLine = lines[line - 1];
    
    // Find the parameter in the line and add type annotation
    const patterns = [
      // Function parameters: (param, param2) =>
      new RegExp(`\\b${parameter}\\b(?!:)(?=\\s*[,)])`, 'g'),
      // Function declarations: function name(param)
      new RegExp(`\\b${parameter}\\b(?!:)(?=\\s*[,)])`, 'g')
    ];

    let modified = false;
    let newLine = targetLine;

    for (const pattern of patterns) {
      if (pattern.test(targetLine)) {
        const inferredType = this.inferParameterType(parameter, content, targetLine);
        newLine = newLine.replace(pattern, `${parameter}: ${inferredType}`);
        modified = true;
        break;
      }
    }

    if (modified) {
      lines[line - 1] = newLine;
      const newContent = lines.join('\n');
      
      try {
        writeFileSync(filePath, newContent, 'utf8');
        this.log(`Fixed parameter '${parameter}' in ${filePath}:${line}`, 'success');
        this.fixedCount++;
        return true;
      } catch (error) {
        this.log(`Failed to write ${filePath}: ${error.message}`, 'error');
        return false;
      }
    }

    return false;
  }

  async run() {
    this.log('🚀 Starting TS7006 Parameter Type Fixer...');
    
    const errors = this.getTS7006Errors();
    this.log(`Found ${errors.length} TS7006 errors to fix`);

    if (errors.length === 0) {
      this.log('No TS7006 errors found!', 'success');
      return;
    }

    // Group errors by file for efficiency
    const errorsByFile = new Map();
    for (const error of errors) {
      if (!errorsByFile.has(error.file)) {
        errorsByFile.set(error.file, []);
      }
      errorsByFile.get(error.file).push(error);
    }

    // Process each file
    for (const [filePath, fileErrors] of errorsByFile.entries()) {
      this.log(`Processing ${filePath} (${fileErrors.length} errors)...`);
      
      // Sort errors by line number (descending) to avoid line number shifts
      fileErrors.sort((a, b) => b.line - a.line);
      
      for (const error of fileErrors) {
        this.fixParameterType(error.file, error.line, error.column, error.parameter);
      }
      
      this.processedFiles.add(filePath);
    }

    this.log(`✨ Fixed ${this.fixedCount} TS7006 parameter type errors`, 'success');
    this.log(`📁 Processed ${this.processedFiles.size} files`, 'info');
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new TS7006Fixer();
  fixer.run().catch(err => {
    console.error('TS7006Fixer failed:', err);
    process.exitCode = 1;
  });
}

export default TS7006Fixer;