#!/usr/bin/env node
/**
 * Fix TypeScript TS7031 "Binding element implicitly has an 'any' type" errors
 * Adds explicit types to destructuring assignments and object/array bindings
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class BindingElementAnyFixer {
  constructor() {
    this.fixedCount = 0;
    this.processedFiles = new Set();
    
    // Common patterns for type inference
    this.typeInferences = {
      'props': 'any',
      'state': 'any',
      'context': 'any',
      'params': 'any',
      'options': 'any',
      'config': 'any',
      'data': 'any',
      'event': 'Event',
      'e': 'Event',
      'error': 'Error',
      'err': 'Error',
      'result': 'any',
      'response': 'any',
      'request': 'any',
      'req': 'any',
      'res': 'any',
      'id': 'string',
      'name': 'string',
      'title': 'string',
      'description': 'string',
      'url': 'string',
      'type': 'string',
      'status': 'string',
      'message': 'string',
      'content': 'string',
      'value': 'any',
      'key': 'string',
      'index': 'number',
      'count': 'number',
      'length': 'number',
      'size': 'number',
      'width': 'number',
      'height': 'number',
      'x': 'number',
      'y': 'number',
      'visible': 'boolean',
      'enabled': 'boolean',
      'disabled': 'boolean',
      'loading': 'boolean',
      'success': 'boolean',
      'active': 'boolean',
      'open': 'boolean',
      'closed': 'boolean'
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
        // Match TS7031 errors: Binding element 'name' implicitly has an 'any' type
        const match = line.match(/(.+?)\((\d+),(\d+)\): error TS7031: Binding element '(.+?)' implicitly has an 'any' type/);
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            element: match[4]
          });
        }
      }
      
      return errors;
    }
  }

  inferType(elementName, context) {
    // Check predefined type mappings
    if (this.typeInferences[elementName]) {
      return this.typeInferences[elementName];
    }

    // Infer based on naming patterns
    if (elementName.endsWith('Id') || elementName.endsWith('Key')) {
      return 'string';
    }
    if (elementName.endsWith('Count') || elementName.endsWith('Index') || elementName.endsWith('Length')) {
      return 'number';
    }
    if (elementName.startsWith('is') || elementName.startsWith('has') || elementName.startsWith('can')) {
      return 'boolean';
    }
    if (elementName.endsWith('Handler') || elementName.endsWith('Callback') || elementName.startsWith('on')) {
      return 'Function';
    }
    if (elementName.endsWith('Data') || elementName.endsWith('Info') || elementName.endsWith('Details')) {
      return 'any';
    }

    // Default to any for safety
    return 'any';
  }

  fixBindingElementAny(filePath, errors) {
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
          const element = error.element;
          
          // Different patterns for binding element fixes
          const fixes = [
            // Function parameter destructuring: function({name}) -> function({name}: {name: string})
            {
              pattern: new RegExp(`\\{([^}]*\\b${element}\\b[^}]*)\\}`, 'g'),
              replacement: (match, params) => {
                const inferredType = this.inferType(element, line);
                if (!params.includes(':')) {
                  return `{${params}}: {${element}: ${inferredType}}`;
                }
                return match;
              }
            },
            // Array destructuring: const [name] = array -> const [name]: [string] = array
            {
              pattern: new RegExp(`\\[([^\\]]*\\b${element}\\b[^\\]]*)\\](?!\\s*:)`, 'g'),
              replacement: (match, params) => {
                const inferredType = this.inferType(element, line);
                return `[${params}]: [${inferredType}]`;
              }
            },
            // Object destructuring in variable declaration: const {name} = obj -> const {name}: {name: string} = obj
            {
              pattern: new RegExp(`const\\s+\\{([^}]*\\b${element}\\b[^}]*)\\}(?!\\s*:)`, 'g'),
              replacement: (match, params) => {
                const inferredType = this.inferType(element, line);
                return `const {${params}}: {${element}: ${inferredType}}`;
              }
            }
          ];

          for (const fix of fixes) {
            const newLine = line.replace(fix.pattern, fix.replacement);
            if (newLine !== line) {
              lines[lineIndex] = newLine;
              modified = true;
              break;
            }
          }
        }
      }

      if (modified) {
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
    this.log('Starting TS7031 (binding element implicit any) error fixes...');
    
    const errors = this.getTypeScriptErrors();
    this.log(`Found ${errors.length} TS7031 errors to fix`);
    
    if (errors.length === 0) {
      this.log('No TS7031 errors found!', 'success');
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
      
      if (this.fixBindingElementAny(fullPath, fileErrorList)) {
        totalFixed++;
        this.fixedCount++;
      }
    }

    // Check results
    const remainingErrors = this.getTypeScriptErrors();
    const remainingTS7031 = remainingErrors.filter(e => e.toString().includes('TS7031')).length;
    
    this.log(`✅ Fixed binding element issues in ${totalFixed} files`);
    this.log(`⚠️ ${remainingTS7031} TS7031 errors remaining`);
    
    if (remainingTS7031 < errors.length) {
      this.log(`Reduced TS7031 errors from ${errors.length} to ${remainingTS7031}`, 'success');
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new BindingElementAnyFixer();
  fixer.run().catch(console.error);
}

export { BindingElementAnyFixer };