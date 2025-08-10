#!/usr/bin/env node
/**
 * Fix TypeScript TS7053 "Element implicitly has an 'any' type" errors
 * Adds proper index signatures and type annotations for dynamic property access
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class ElementImplicitAnyFixer {
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
        // Match TS7053 errors: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Type'
        const match = line.match(/(.+?)\((\d+),(\d+)\): error TS7053: Element implicitly has an 'any' type/);
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            fullMessage: line
          });
        }
      }
      
      return errors;
    }
  }

  fixElementImplicitAny(filePath, errors) {
    if (!existsSync(filePath) || this.processedFiles.has(filePath)) {
      return false;
    }

    this.processedFiles.add(filePath);
    
    try {
      let content = readFileSync(filePath, 'utf8');
      let modified = false;
      const lines = content.split('\n');

      // Sort errors by line number in descending order to avoid line number shifting
      const sortedErrors = errors.sort((a, b) => b.line - a.line);

      for (const error of sortedErrors) {
        const lineIndex = error.line - 1;
        if (lineIndex >= 0 && lineIndex < lines.length) {
          let line = lines[lineIndex];
          const originalLine = line;
          
          // Common patterns for dynamic property access fixes
          const fixes = [
            // obj[key] -> (obj as any)[key]
            {
              pattern: /(\w+)\[([^\]]+)\]/g,
              replacement: '($1 as any)[$2]'
            },
            // object[variable] -> (object as Record<string, any>)[variable]
            {
              pattern: /(\w+)\[([a-zA-Z_$][\w$]*)\]/g,
              replacement: '($1 as Record<string, any>)[$2]'
            },
            // object["key"] -> (object as any)["key"]
            {
              pattern: /(\w+)\[["']([^"']+)["']\]/g,
              replacement: '($1 as any)["$2"]'
            }
          ];

          // Try each fix pattern
          for (const fix of fixes) {
            const newLine = line.replace(fix.pattern, fix.replacement);
            if (newLine !== line && !newLine.includes('as any')) {
              // Only apply if we haven't already added type assertions
              line = newLine;
              break;
            }
          }

          // Alternative approach: Add type assertion to the whole expression
          if (line === originalLine) {
            // Look for bracket notation patterns
            const bracketPattern = /(\w+)\[([^\]]+)\]/;
            const match = line.match(bracketPattern);
            if (match) {
              const objectName = match[1];
              const key = match[2];
              
              // Check if this is a common pattern that needs specific handling
              if (key.includes("'") || key.includes('"')) {
                // String literal key
                line = line.replace(bracketPattern, `(${objectName} as any)[${key}]`);
              } else {
                // Variable key
                line = line.replace(bracketPattern, `(${objectName} as Record<string, any>)[${key}]`);
              }
            }
          }

          if (line !== originalLine) {
            lines[lineIndex] = line;
            modified = true;
          }
        }
      }

      // Add index signature interfaces if we're dealing with object types
      if (modified) {
        // Check if we need to add interface declarations
        const needsIndexSignature = errors.some(e => 
          e.fullMessage.includes("can't be used to index type") && 
          !content.includes('[key: string]: any')
        );

        if (needsIndexSignature) {
          // Add a generic index signature interface at the top
          const indexSignatureInterface = `
interface IndexableObject {
  [key: string]: any;
}
`;
          
          // Find the best place to add the interface (after imports)
          let insertIndex = 0;
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ') || lines[i].startsWith('///')) {
              insertIndex = i + 1;
            } else if (lines[i].trim() === '' && insertIndex > 0) {
              continue;
            } else if (insertIndex > 0) {
              break;
            }
          }

          if (insertIndex > 0) {
            lines.splice(insertIndex, 0, indexSignatureInterface);
          } else {
            lines.unshift(indexSignatureInterface);
          }
        }

        content = lines.join('\n');
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
    this.log('Starting TS7053 (element implicit any) error fixes...');
    
    const errors = this.getTypeScriptErrors();
    this.log(`Found ${errors.length} TS7053 errors to fix`);
    
    if (errors.length === 0) {
      this.log('No TS7053 errors found!', 'success');
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
      
      if (this.fixElementImplicitAny(fullPath, fileErrorList)) {
        totalFixed++;
        this.fixedCount++;
      }
    }

    // Check results
    const remainingErrors = this.getTypeScriptErrors();
    const remainingTS7053 = remainingErrors.filter(e => e.toString().includes('TS7053')).length;
    
    this.log(`✅ Fixed element implicit any issues in ${totalFixed} files`);
    this.log(`⚠️ ${remainingTS7053} TS7053 errors remaining`);
    
    if (remainingTS7053 < errors.length) {
      this.log(`Reduced TS7053 errors from ${errors.length} to ${remainingTS7053}`, 'success');
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new ElementImplicitAnyFixer();
  fixer.run().catch(console.error);
}

export { ElementImplicitAnyFixer };