#!/usr/bin/env node
/**
 * TS1434 Fixer - Targets unexpected token errors
 * Focuses on malformed JSX and syntax issues
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

class TS1434Fixer {
  constructor() {
    this.fixedCount = 0;
    this.processedFiles = 0;
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[TS1434] ${message}${colors.reset}`);
  }

  getTS1434Errors() {
    try {
      const result = execSync('npm run type-check', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return [];
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      const lines = output.split('\n');
      const ts1434Errors = [];
      
      for (const line of lines) {
        const match = line.match(/^(.+?)\((\d+),(\d+)\):\s*error TS1434:/);
        if (match) {
          ts1434Errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            fullLine: line
          });
        }
      }
      
      return ts1434Errors;
    }
  }

  fixFile(filePath) {
    try {
      let content = readFileSync(filePath, 'utf8');
      const originalContent = content;
      let modified = false;

      // Fix malformed JSX closing tags
      content = content.replace(/(<\/)([a-zA-Z][a-zA-Z0-9]*)(\s*[^>]*)(>)/g, (match, openTag, tagName, attributes, closeTag) => {
        if (attributes.trim()) {
          this.log(`Fixed JSX closing tag: ${match} -> ${openTag}${tagName}${closeTag}`);
          modified = true;
          return `${openTag}${tagName}${closeTag}`;
        }
        return match;
      });

      // Fix malformed template literals
      content = content.replace(/`([^`]*?)\$\{([^}]*?)\}([^`]*?)`([^\s;,)}\]]*)/g, (match, before, expr, after, trailing) => {
        if (trailing && !trailing.match(/^[.\[\(]/)) {
          this.log(`Fixed template literal: ${match} -> \`${before}\${${expr}}${after}\``);
          modified = true;
          return `\`${before}\${${expr}}${after}\``;
        }
        return match;
      });

      // Fix malformed object property access
      content = content.replace(/(\w+)\.(\w+)\s*([^\s\w\[\(\.])/g, (match, obj, prop, trailing) => {
        if (trailing && !trailing.match(/[=;,)}\]]/)) {
          this.log(`Fixed property access: ${match} -> ${obj}.${prop}`);
          modified = true;
          return `${obj}.${prop}`;
        }
        return match;
      });

      // Fix malformed array access
      content = content.replace(/(\w+)\[([^\]]+)\]\s*([^\s\w\[\(\.])/g, (match, arr, index, trailing) => {
        if (trailing && !trailing.match(/[=;,)}\]]/)) {
          this.log(`Fixed array access: ${match} -> ${arr}[${index}]`);
          modified = true;
          return `${arr}[${index}]`;
        }
        return match;
      });

      // Fix malformed function calls
      content = content.replace(/(\w+)\(([^)]*)\)\s*([^\s\w\[\(\.])/g, (match, func, params, trailing) => {
        if (trailing && !trailing.match(/[=;,)}\]]/)) {
          this.log(`Fixed function call: ${match} -> ${func}(${params})`);
          modified = true;
          return `${func}(${params})`;
        }
        return match;
      });

      // Fix unexpected tokens in JSX attributes
      content = content.replace(/(<\w+[^>]*?)\s+([a-zA-Z][a-zA-Z0-9]*)(\s*[^=\s>][^>]*?>)/g, (match, openTag, attr, rest) => {
        if (!rest.startsWith('=')) {
          this.log(`Fixed JSX attribute: ${match} -> ${openTag} ${attr}={true}${rest}`);
          modified = true;
          return `${openTag} ${attr}={true}${rest}`;
        }
        return match;
      });

      // Fix malformed conditional expressions
      content = content.replace(/(\w+)\s*\?\s*([^:]+)\s*:\s*([^;,)}\]]+)\s*([^\s;,)}\]]+)/g, (match, condition, truePart, falsePart, trailing) => {
        if (trailing && !trailing.match(/[;,)}\]]/)) {
          this.log(`Fixed conditional: ${match} -> ${condition} ? ${truePart} : ${falsePart}`);
          modified = true;
          return `${condition} ? ${truePart} : ${falsePart}`;
        }
        return match;
      });

      if (modified) {
        writeFileSync(filePath, content, 'utf8');
        this.fixedCount++;
        this.log(`Fixed file: ${filePath}`, 'success');
        return true;
      }

      return false;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    this.log('Starting TS1434 targeted fixing...');
    
    const initialErrors = this.getTS1434Errors();
    this.log(`Found ${initialErrors.length} TS1434 errors`);
    
    if (initialErrors.length === 0) {
      this.log('No TS1434 errors found!', 'success');
      return;
    }

    // Get unique files with TS1434 errors
    const errorFiles = [...new Set(initialErrors.map(err => err.file))];
    this.log(`Processing ${errorFiles.length} files with TS1434 errors`);

    for (const file of errorFiles) {
      this.processedFiles++;
      this.fixFile(file);
    }

    const finalErrors = this.getTS1434Errors();
    const fixed = initialErrors.length - finalErrors.length;
    
    this.log(`\n=== TS1434 FIXING COMPLETE ===`);
    this.log(`Files processed: ${this.processedFiles}`);
    this.log(`Errors before: ${initialErrors.length}`);
    this.log(`Errors after: ${finalErrors.length}`);
    this.log(`Errors fixed: ${fixed}`);
    
    if (fixed > 0) {
      this.log(`Successfully fixed ${fixed} TS1434 errors!`, 'success');
    } else {
      this.log('No errors were fixed. Manual intervention may be needed.', 'warning');
    }
  }
}

const fixer = new TS1434Fixer();
fixer.run().catch(console.error);