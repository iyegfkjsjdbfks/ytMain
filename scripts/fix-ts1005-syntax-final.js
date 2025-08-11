#!/usr/bin/env node
/**
 * TS1005 Syntax Error Fixer - "comma expected"
 * Fixes the remaining 32 TS1005 syntax errors
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

class TS1005SyntaxFixer {
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

  getTS1005Errors() {
    try {
      execSync('npm run type-check 2>&1', { encoding: 'utf8', stdio: 'pipe' });
      return [];
    } catch (error) {
      const output = error.stdout + error.stderr;
      const errorLines = output.split('\n').filter(line => line.includes("error TS1005: ',' expected."));
      
      return errorLines.map(line => {
        const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS1005: ',' expected\./);
        if (match) {
          return {
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            fullLine: line
          };
        }
        return null;
      }).filter(Boolean);
    }
  }

  fixSyntaxError(filePath, line, column) {
    if (!existsSync(filePath)) return false;

    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    if (line > lines.length) return false;

    const targetLine = lines[line - 1];
    let modified = false;
    let newLine = targetLine;

    // Common patterns that need commas
    const patterns = [
      // Function parameters missing commas: func(param1 param2)
      {
        regex: /\b(\w+)\s+(\w+:?\s*[\w\[\]|&<>]+)/g,
        replacement: '$1, $2',
        description: 'function parameters'
      },
      // Object/array elements missing commas: {a: 1 b: 2}
      {
        regex: /(\w+:\s*[^,}\]]+)\s+(\w+:)/g,
        replacement: '$1, $2',
        description: 'object properties'
      },
      // Type parameters missing commas: <T U>
      {
        regex: /<([^<>]*?\w)\s+(\w[^<>]*?)>/g,
        replacement: '<$1, $2>',
        description: 'type parameters'
      },
      // Array/tuple types: [string number]
      {
        regex: /\[([^\[\]]*?\w)\s+(\w[^\[\]]*?)\]/g,
        replacement: '[$1, $2]',
        description: 'array types'
      },
      // Union types: string | number boolean
      {
        regex: /(\w+\s*\|\s*\w+)\s+(\w+)/g,
        replacement: '$1 | $2',
        description: 'union types'
      }
    ];

    for (const pattern of patterns) {
      const originalLine = newLine;
      newLine = newLine.replace(pattern.regex, pattern.replacement);
      
      if (newLine !== originalLine) {
        this.log(`Applied ${pattern.description} fix to line ${line}`, 'info');
        modified = true;
        break; // Apply one fix at a time to avoid conflicts
      }
    }

    // Specific fixes for common syntax issues
    if (!modified) {
      // Fix missing comma before function parameters with types
      const beforeTypeAnnotation = /(\w+):\s*(\w+)\s+(\w+):\s*(\w+)/g;
      if (beforeTypeAnnotation.test(targetLine)) {
        newLine = targetLine.replace(beforeTypeAnnotation, '$1: $2, $3: $4');
        modified = true;
      }
    }

    if (!modified) {
      // Fix function call parameters: func(a b)
      const funcCallPattern = /(\w+)\s*\(\s*([^(),]+)\s+([^(),]+)\s*\)/g;
      if (funcCallPattern.test(targetLine)) {
        newLine = targetLine.replace(funcCallPattern, '$1($2, $3)');
        modified = true;
      }
    }

    if (!modified) {
      // Try to intelligently add comma at the error column position
      const chars = targetLine.split('');
      const beforeColumn = chars.slice(0, column - 1).join('');
      const afterColumn = chars.slice(column - 1).join('');
      
      // Check if adding a comma makes sense
      if (column > 1 && column <= chars.length) {
        const charBefore = chars[column - 2];
        const charAt = chars[column - 1];
        
        // Add comma if it looks like we're between identifiers or after a value
        if (/\w/.test(charBefore) && /\w/.test(charAt)) {
          newLine = beforeColumn + ', ' + afterColumn;
          modified = true;
        }
      }
    }

    if (modified) {
      lines[line - 1] = newLine;
      const newContent = lines.join('\n');
      
      try {
        writeFileSync(filePath, newContent, 'utf8');
        this.log(`Fixed TS1005 syntax error in ${filePath}:${line}`, 'success');
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
    this.log('🚀 Starting TS1005 Syntax Error Fixer...');
    
    const errors = this.getTS1005Errors();
    this.log(`Found ${errors.length} TS1005 syntax errors to fix`);

    if (errors.length === 0) {
      this.log('No TS1005 syntax errors found!', 'success');
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
        this.fixSyntaxError(error.file, error.line, error.column);
      }
      
      this.processedFiles.add(filePath);
    }

    this.log(`✨ Fixed ${this.fixedCount} TS1005 syntax errors`, 'success');
    this.log(`📁 Processed ${this.processedFiles.size} files`, 'info');
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new TS1005SyntaxFixer();
  fixer.run().catch(err => {
    console.error('TS1005SyntaxFixer failed:', err);
    process.exitCode = 1;
  });
}

export default TS1005SyntaxFixer;