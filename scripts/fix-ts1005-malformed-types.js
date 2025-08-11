#!/usr/bin/env node
/**
 * Fix TS1005 Malformed Type Annotations
 * Fixes malformed object type annotations in function parameters where colons should be semicolons
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
// Removed glob dependency

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class TS1005Fixer {
  constructor() {
    this.fixedFiles = new Set();
    this.fixedCount = 0;
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '🔧';
    console.log(`${colors[type]}${prefix} ${message}${colors.reset}`);
  }

  getTypeErrors() {
    try {
      const result = execSync('npm run type-check', {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: projectRoot
      });
      return [];
    } catch (error) {
      const output = error.stdout + error.stderr;
      const errors = [];
      const lines = output.split('\n');
      
      for (const line of lines) {
        const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS1005: (.+)$/);
        if (match) {
          const [, filePath, lineNum, colNum, message] = match;
          if (message.includes("',' expected") || message.includes("'}' expected")) {
            errors.push({
              file: filePath,
              line: parseInt(lineNum),
              column: parseInt(colNum),
              message
            });
          }
        }
      }
      
      return errors;
    }
  }

  fixMalformedTypeAnnotations(content, filePath) {
    let fixed = false;
    let newContent = content;

    // Fix object literal syntax errors (semicolons where commas should be)
    const objectLiteralFixes = [
      // Fix semicolons in object literals where commas are expected
      {
        regex: /(\w+\s*:\s*[^,;{}]+);\s*(\w+\s*:\s*)/g,
        replacement: '$1, $2'
      },
      // Fix trailing semicolon before closing brace in objects
      {
        regex: /(\w+\s*:\s*[^,;{}]+);\s*\}/g,
        replacement: '$1 }'
      }
    ];

    for (const fix of objectLiteralFixes) {
      const before = newContent;
      newContent = newContent.replace(fix.regex, fix.replacement);
      if (newContent !== before) {
        fixed = true;
      }
    }

    // Pattern to match malformed type annotations in function parameters
    // Look for patterns like }: {prop: type}: {prop2: type2} and fix to }: {prop: type; prop2: type2}
    const patterns = [
      // Pattern 1: }: {prop: type}: {prop2: type} -> }: {prop: type; prop2: type}
      {
        regex: /(\}\s*:\s*\{[^}]+)\}(\s*:\s*\{[^}]+\})+/g,
        fix: (match) => {
          // Extract all the type objects and merge them
          const typeObjects = match.match(/\{[^}]+\}/g);
          if (!typeObjects) return match;
          
          // Extract properties from each type object
          const allProps = [];
          for (const obj of typeObjects) {
            const props = obj.slice(1, -1).split(/[;,]/).map(p => p.trim()).filter(p => p);
            allProps.push(...props);
          }
          
          // Combine into single type object
          return `}: {${allProps.join('; ')}}`;
        }
      },
      
      // Pattern 2: Fix trailing commas in type annotations that should be semicolons
      {
        regex: /(\{[^}]*?)([,;])\s*(\w+\s*:\s*[^,;}]+)([,;])(\s*\})/g,
        fix: (match, prefix, sep1, prop, sep2, suffix) => {
          return `${prefix}; ${prop}${suffix}`;
        }
      }
    ];

    for (const pattern of patterns) {
      if (pattern.regex.test(newContent)) {
        newContent = newContent.replace(pattern.regex, pattern.fix);
        fixed = true;
      }
    }

    // More specific fixes for common malformed patterns
    const specificFixes = [
      // Fix }: {prop: type}: {prop2: type} patterns
      {
        from: /(\}\s*:\s*\{[^}]*)\}(\s*:\s*\{[^}]*\})+/g,
        to: (match) => {
          // Split on }: { and merge all the type properties
          const parts = match.split(/\}\s*:\s*\{/);
          if (parts.length < 2) return match;
          
          // First part should end with }
          let result = parts[0];
          if (!result.endsWith('}')) result += '}';
          
          // Extract properties from remaining parts
          const props = [];
          for (let i = 1; i < parts.length; i++) {
            let part = parts[i];
            // Remove trailing }
            if (part.endsWith('}')) part = part.slice(0, -1);
            
            const propMatches = part.match(/(\w+\s*:\s*[^,;}]+)/g);
            if (propMatches) {
              props.push(...propMatches);
            }
          }
          
          if (props.length > 0) {
            // Replace the } with ; and add the new properties
            result = result.slice(0, -1) + '; ' + props.join('; ') + '}';
          }
          
          return result;
        }
      }
    ];

    for (const fix of specificFixes) {
      if (fix.from.test(newContent)) {
        newContent = newContent.replace(fix.from, fix.to);
        fixed = true;
      }
    }

    return { content: newContent, fixed };
  }

  async fixFile(error) {
    const filePath = join(projectRoot, error.file);
    
    if (!existsSync(filePath)) {
      this.log(`File not found: ${error.file}`, 'warning');
      return false;
    }

    try {
      const content = readFileSync(filePath, 'utf8');
      const result = this.fixMalformedTypeAnnotations(content, error.file);
      
      if (result.fixed) {
        writeFileSync(filePath, result.content);
        this.fixedFiles.add(error.file);
        this.fixedCount++;
        this.log(`Fixed malformed type annotations in ${error.file}`);
        return true;
      }
      
      return false;
    } catch (err) {
      this.log(`Error fixing ${error.file}: ${err.message}`, 'error');
      return false;
    }
  }

  async run() {
    this.log('🚀 Starting TS1005 malformed type annotations fix...');
    
    const errors = this.getTypeErrors();
    const ts1005Errors = errors.filter(e => e.message.includes("',' expected") || e.message.includes("'}' expected"));
    
    if (ts1005Errors.length === 0) {
      this.log('✨ No TS1005 malformed type annotation errors found!', 'success');
      return;
    }

    this.log(`Found ${ts1005Errors.length} TS1005 errors to fix`);

    // Group errors by file to avoid processing the same file multiple times
    const errorsByFile = new Map();
    for (const error of ts1005Errors) {
      if (!errorsByFile.has(error.file)) {
        errorsByFile.set(error.file, []);
      }
      errorsByFile.get(error.file).push(error);
    }

    let totalFixed = 0;
    for (const [file, fileErrors] of errorsByFile) {
      this.log(`Processing ${file} (${fileErrors.length} errors)...`);
      
      // Fix all errors in this file at once
      const fixed = await this.fixFile(fileErrors[0]);
      if (fixed) {
        totalFixed++;
      }
    }

    this.log(`\n📊 Summary:`);
    this.log(`• Fixed ${totalFixed} files`);
    this.log(`• Total fixes applied: ${this.fixedCount}`);
    
    if (this.fixedFiles.size > 0) {
      this.log(`• Fixed files: ${Array.from(this.fixedFiles).join(', ')}`);
    }

    // Verify the fixes
    const remainingErrors = this.getTypeErrors().filter(e => e.message.includes("',' expected") || e.message.includes("'}' expected"));
    if (remainingErrors.length === 0) {
      this.log('🎉 All TS1005 malformed type annotation errors have been fixed!', 'success');
    } else {
      this.log(`⚠️ ${remainingErrors.length} TS1005 errors still remain`, 'warning');
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('fix-ts1005-malformed-types.js')) {
  const fixer = new TS1005Fixer();
  fixer.run().catch(console.error);
}

export { TS1005Fixer };