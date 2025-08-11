#!/usr/bin/env node
/**
 * TS1381 Fixer - Targets unexpected token errors
 * Focuses on malformed syntax and token issues
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

class TS1381Fixer {
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
    console.log(`${colors[type]}[TS1381] ${message}${colors.reset}`);
  }

  getTS1381Errors() {
    try {
      const result = execSync('npm run type-check', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return [];
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      const lines = output.split('\n');
      const ts1381Errors = [];
      
      for (const line of lines) {
        const match = line.match(/^(.+?)\((\d+),(\d+)\):\s*error TS1381:/);
        if (match) {
          ts1381Errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            fullLine: line
          });
        }
      }
      
      return ts1381Errors;
    }
  }

  fixFile(filePath) {
    try {
      let content = readFileSync(filePath, 'utf8');
      const originalContent = content;
      let modified = false;

      // Fix unexpected tokens in object literals
      content = content.replace(/({[^}]*?)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*([^:,}\s][^,}]*?)([,}])/g, (match, before, key, value, after) => {
        if (!value.startsWith(':')) {
          this.log(`Fixed object property: ${match} -> ${before}${key}: ${value.trim()}${after}`);
          modified = true;
          return `${before}${key}: ${value.trim()}${after}`;
        }
        return match;
      });

      // Fix unexpected tokens in array literals
      content = content.replace(/\[([^\]]*?)([^,\s\]]+)\s+([^,\]]+)([^\]]*?)\]/g, (match, before, item1, item2, after) => {
        if (!item2.startsWith(',')) {
          this.log(`Fixed array items: ${match} -> [${before}${item1}, ${item2}${after}]`);
          modified = true;
          return `[${before}${item1}, ${item2}${after}]`;
        }
        return match;
      });

      // Fix unexpected tokens in function parameters
      content = content.replace(/(function\s+\w+\s*\(|\(\s*)([^)]*?)([a-zA-Z_$][a-zA-Z0-9_$]*)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)([^)]*?\))/g, (match, funcStart, beforeParams, param1, param2, afterParams) => {
        if (!param2.startsWith(',') && !param2.startsWith(':')) {
          this.log(`Fixed function params: ${match} -> ${funcStart}${beforeParams}${param1}, ${param2}${afterParams}`);
          modified = true;
          return `${funcStart}${beforeParams}${param1}, ${param2}${afterParams}`;
        }
        return match;
      });

      // Fix unexpected tokens in JSX attributes
      content = content.replace(/(<\w+[^>]*?)\s+([a-zA-Z][a-zA-Z0-9]*)\s+([a-zA-Z][a-zA-Z0-9]*)(\s*[^=][^>]*?>)/g, (match, openTag, attr1, attr2, rest) => {
        if (!rest.startsWith('=')) {
          this.log(`Fixed JSX attributes: ${match} -> ${openTag} ${attr1} ${attr2}={true}${rest}`);
          modified = true;
          return `${openTag} ${attr1} ${attr2}={true}${rest}`;
        }
        return match;
      });

      // Fix unexpected tokens in template literals
      content = content.replace(/`([^`]*?)\$([^{][^`]*?)`/g, (match, before, after) => {
        this.log(`Fixed template literal: ${match} -> \`${before}\${${after}}\``);
        modified = true;
        return `\`${before}\${${after}}\``;
      });

      // Fix unexpected tokens in conditional expressions
      content = content.replace(/(\w+)\s*\?\s*([^:]+?)\s+([^:]+?)\s*:/g, (match, condition, truePart, unexpectedToken) => {
        this.log(`Fixed conditional: ${match} -> ${condition} ? ${truePart} :`);
        modified = true;
        return `${condition} ? ${truePart} :`;
      });

      // Fix unexpected tokens in destructuring
      content = content.replace(/({\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*[,}])/g, (match, openBrace, prop1, prop2, closePart) => {
        if (!closePart.startsWith(',') && !closePart.startsWith('}')) {
          this.log(`Fixed destructuring: ${match} -> ${openBrace}${prop1}, ${prop2}${closePart}`);
          modified = true;
          return `${openBrace}${prop1}, ${prop2}${closePart}`;
        }
        return match;
      });

      // Fix unexpected tokens in type annotations
      content = content.replace(/(:\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g, (match, colon, type1, type2) => {
        this.log(`Fixed type annotation: ${match} -> ${colon}${type1} | ${type2}`);
        modified = true;
        return `${colon}${type1} | ${type2}`;
      });

      // Fix unexpected tokens in import statements
      content = content.replace(/(import\s+{[^}]*?)([a-zA-Z_$][a-zA-Z0-9_$]*)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)([^}]*?})/g, (match, importStart, import1, import2, importEnd) => {
        this.log(`Fixed import: ${match} -> ${importStart}${import1}, ${import2}${importEnd}`);
        modified = true;
        return `${importStart}${import1}, ${import2}${importEnd}`;
      });

      // Fix unexpected tokens in export statements
      content = content.replace(/(export\s+{[^}]*?)([a-zA-Z_$][a-zA-Z0-9_$]*)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)([^}]*?})/g, (match, exportStart, export1, export2, exportEnd) => {
        this.log(`Fixed export: ${match} -> ${exportStart}${export1}, ${export2}${exportEnd}`);
        modified = true;
        return `${exportStart}${export1}, ${export2}${exportEnd}`;
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
    this.log('Starting TS1381 targeted fixing...');
    
    const initialErrors = this.getTS1381Errors();
    this.log(`Found ${initialErrors.length} TS1381 errors`);
    
    if (initialErrors.length === 0) {
      this.log('No TS1381 errors found!', 'success');
      return;
    }

    // Get unique files with TS1381 errors
    const errorFiles = [...new Set(initialErrors.map(err => err.file))];
    this.log(`Processing ${errorFiles.length} files with TS1381 errors`);

    for (const file of errorFiles) {
      this.processedFiles++;
      this.fixFile(file);
    }

    const finalErrors = this.getTS1381Errors();
    const fixed = initialErrors.length - finalErrors.length;
    
    this.log(`\n=== TS1381 FIXING COMPLETE ===`);
    this.log(`Files processed: ${this.processedFiles}`);
    this.log(`Errors before: ${initialErrors.length}`);
    this.log(`Errors after: ${finalErrors.length}`);
    this.log(`Errors fixed: ${fixed}`);
    
    if (fixed > 0) {
      this.log(`Successfully fixed ${fixed} TS1381 errors!`, 'success');
    } else {
      this.log('No errors were fixed. Manual intervention may be needed.', 'warning');
    }
  }
}

const fixer = new TS1381Fixer();
fixer.run().catch(console.error);