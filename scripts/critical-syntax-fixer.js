#!/usr/bin/env node
/**
 * Critical Syntax Error Fixer
 * 
 * Fixes the most critical syntax errors that prevent compilation
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PROJECT_ROOT = process.cwd();

class CriticalSyntaxFixer {
  constructor() {
    this.fixedFiles = new Set();
    this.totalFixed = 0;
  }

  log(message, level = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m', 
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[level]}[${level.toUpperCase()}] ${message}${colors.reset}`);
  }

  async run() {
    this.log('🔧 Starting Critical Syntax Error Resolution...', 'info');
    
    try {
      // Get current errors
      const errors = await this.getCurrentErrors();
      this.log(`📊 Found ${errors.length} TypeScript errors`, 'info');
      
      // Group errors by file
      const errorsByFile = new Map();
      for (const error of errors) {
        if (!errorsByFile.has(error.file)) {
          errorsByFile.set(error.file, []);
        }
        errorsByFile.get(error.file).push(error);
      }
      
      this.log(`📁 Processing ${errorsByFile.size} files with errors`, 'info');
      
      // Process each file
      for (const [file, fileErrors] of errorsByFile) {
        await this.fixFileErrors(file, fileErrors);
      }
      
      const finalErrors = await this.getErrorCount();
      this.log(`✅ Resolution complete! Fixed issues in ${this.fixedFiles.size} files`, 'success');
      this.log(`📊 Remaining errors: ${finalErrors}`, 'info');
      
    } catch (error) {
      this.log(`❌ Resolution failed: ${error.message}`, 'error');
    }
  }

  async getCurrentErrors() {
    try {
      execSync('npx tsc --noEmit', { 
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return [];
    } catch (error) {
      const errors = [];
      const lines = error.stdout.split('\n');
      
      for (const line of lines) {
        const match = line.match(/^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$/);
        if (match) {
          const [, file, lineNum, column, code, message] = match;
          errors.push({ 
            file, 
            line: parseInt(lineNum), 
            column: parseInt(column), 
            code, 
            message,
            fullLine: line
          });
        }
      }
      
      return errors;
    }
  }

  async fixFileErrors(filePath, fileErrors) {
    const fullPath = path.resolve(PROJECT_ROOT, filePath);
    
    if (!fsSync.existsSync(fullPath)) {
      this.log(`⚠️ File not found: ${fullPath}`, 'warning');
      return;
    }
    
    try {
      let content = await fs.readFile(fullPath, 'utf8');
      let lines = content.split('\n');
      let modified = false;
      let fixedCount = 0;
      
      // Sort errors by line number (descending) to avoid offset issues
      const sortedErrors = fileErrors.sort((a, b) => b.line - a.line);
      
      for (const error of sortedErrors) {
        const result = await this.fixSingleError(lines, error);
        if (result.fixed) {
          lines = result.lines;
          modified = true;
          fixedCount++;
          this.log(`✅ Fixed ${error.code} in ${filePath}:${error.line} - ${error.message.slice(0, 50)}...`, 'success');
        }
      }
      
      if (modified) {
        await fs.writeFile(fullPath, lines.join('\n'), 'utf8');
        this.fixedFiles.add(filePath);
        this.totalFixed += fixedCount;
        this.log(`📝 Updated ${filePath} with ${fixedCount} fixes`, 'info');
      }
      
    } catch (err) {
      this.log(`❌ Failed to process ${filePath}: ${err.message}`, 'error');
    }
  }

  async fixSingleError(lines, error) {
    const lineIndex = error.line - 1;
    if (lineIndex < 0 || lineIndex >= lines.length) {
      return { fixed: false, lines };
    }
    
    const currentLine = lines[lineIndex];
    let fixedLine = currentLine;
    let fixed = false;
    
    // Apply specific fixes based on error code and message
    switch (error.code) {
      case 'TS1005':
        fixedLine = this.fixTS1005(currentLine, error);
        break;
        
      case 'TS1003':
        fixedLine = this.fixTS1003(currentLine, error);
        break;
        
      case 'TS1382':
        fixedLine = this.fixTS1382(currentLine, error);
        break;
        
      case 'TS1381':
        fixedLine = this.fixTS1381(currentLine, error);
        break;
        
      case 'TS1128':
        fixedLine = this.fixTS1128(currentLine, error);
        break;
        
      case 'TS1109':
        fixedLine = this.fixTS1109(currentLine, error);
        break;
        
      case 'TS17002':
        fixedLine = this.fixTS17002(currentLine, error);
        break;
        
      case 'TS1136':
        fixedLine = this.fixTS1136(currentLine, error);
        break;
        
      default:
        // Try generic fixes
        fixedLine = this.applyGenericFixes(currentLine, error);
    }
    
    if (fixedLine !== currentLine) {
      lines[lineIndex] = fixedLine;
      fixed = true;
    }
    
    return { fixed, lines };
  }

  fixTS1005(line, error) {
    // ',' expected, ';' expected, ')' expected, etc.
    if (error.message.includes("',' expected")) {
      // Add missing comma in object literals or function parameters
      return line.replace(/(\w)(\s+\w+)/g, '$1, $2');
    }
    
    if (error.message.includes("';' expected")) {
      // Add missing semicolon
      if (!line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}')) {
        return line + ';';
      }
    }
    
    if (error.message.includes("')' expected")) {
      // Add missing closing parenthesis
      const openCount = (line.match(/\(/g) || []).length;
      const closeCount = (line.match(/\)/g) || []).length;
      if (openCount > closeCount) {
        return line + ')';
      }
    }
    
    return line;
  }

  fixTS1003(line, error) {
    // Identifier expected
    if (line.includes('=')) {
      // Fix malformed JSX or object properties
      return line.replace(/=([^=>\s]+)/g, '="$1"');
    }
    
    // Remove invalid characters before identifiers
    return line.replace(/[^\w\s\.\{\}<>="\'\(\)\[\],:;\/\-]+/g, '');
  }

  fixTS1382(line, error) {
    // Unexpected token. Did you mean `{'>'}` or `&gt;`?
    if (error.message.includes('Did you mean')) {
      // Fix JSX syntax issues
      return line.replace(/>/g, '{">"}').replace(/<(?!\w)/g, '{"<"}');
    }
    
    return line;
  }

  fixTS1381(line, error) {
    // Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
    if (error.message.includes('Did you mean')) {
      // Fix JSX brace issues
      return line.replace(/\}/g, '{"}"');
    }
    
    return line;
  }

  fixTS1128(line, error) {
    // Declaration or statement expected
    if (line.trim().startsWith('<') && !line.includes('=')) {
      // Likely a stray JSX element, wrap it properly
      return `  <div>${line.trim()}</div>`;
    }
    
    // Remove invalid syntax
    return line.replace(/[^\w\s\.\{\}<>="\'\(\)\[\],:;\/\-]+/g, '');
  }

  fixTS1109(line, error) {
    // Expression expected
    if (line.includes('=') && !line.includes('=>')) {
      // Fix assignment issues
      return line.replace(/=\s*$/, '= null');
    }
    
    return line;
  }

  fixTS17002(line, error) {
    // Expected corresponding JSX closing tag
    const match = error.message.match(/Expected corresponding JSX closing tag for '(\w+)'/);
    if (match) {
      const tagName = match[1];
      // Add the missing closing tag
      return line + `</${tagName}>`;
    }
    
    return line;
  }

  fixTS1136(line, error) {
    // Property assignment expected
    if (line.includes(':') && !line.includes('=')) {
      // Fix object property syntax
      return line.replace(/:\s*([^\s,}]+)/g, ': "$1"');
    }
    
    return line;
  }

  applyGenericFixes(line, error) {
    let fixedLine = line;
    
    // Remove trailing whitespace
    fixedLine = fixedLine.trimEnd();
    
    // Fix common syntax issues
    const fixes = [
      // Remove duplicate commas
      [/,+/g, ','],
      // Remove duplicate semicolons
      [/;+/g, ';'],
      // Fix spacing around operators
      [/\s*=\s*/g, ' = '],
      // Fix spacing around colons
      [/\s*:\s*/g, ': '],
      // Remove invalid characters
      [/[^\x00-\x7F]/g, ''],
    ];
    
    for (const [pattern, replacement] of fixes) {
      fixedLine = fixedLine.replace(pattern, replacement);
    }
    
    return fixedLine;
  }

  async getErrorCount() {
    try {
      execSync('npx tsc --noEmit', { 
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return 0;
    } catch (error) {
      const errorLines = error.stdout.split('\n').filter(line => 
        line.includes('error TS') && line.includes(')')
      );
      return errorLines.length;
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new CriticalSyntaxFixer();
  fixer.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { CriticalSyntaxFixer };