#!/usr/bin/env node
/**
 * Fix TypeScript TS7006 "Parameter implicitly has an 'any' type" errors
 * Adds explicit type annotations to function parameters
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class ImplicitAnyParamFixer {
  constructor() {
    this.fixedCount = 0;
    this.typeInferences = {
      // Common parameter name patterns and their likely types
      'id': 'string',
      'index': 'number',
      'item': 'any',
      'element': 'any',
      'event': 'Event',
      'e': 'Event',
      'error': 'Error',
      'err': 'Error',
      'data': 'any',
      'result': 'any',
      'response': 'any',
      'value': 'any',
      'key': 'string',
      'callback': 'Function',
      'fn': 'Function',
      'handler': 'Function',
      'resolve': 'Function',
      'reject': 'Function',
      'prev': 'any',
      'next': 'any',
      'current': 'any',
      'video': 'any',
      'channel': 'any',
      'comment': 'any',
      'user': 'any',
      'playlist': 'any',
      'tag': 'string',
      'option': 'any',
      'config': 'any',
      'props': 'any',
      'state': 'any',
      'context': 'any'
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
        // Match pattern: file(line,col): error TS7006: Parameter 'paramName' implicitly has an 'any' type
        const match = line.match(/(.+?)\((\d+),(\d+)\): error TS7006: Parameter '(.+?)' implicitly has an 'any' type/);
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            parameter: match[4]
          });
        }
      }
      
      return errors;
    }
  }

  inferType(paramName, context) {
    // Check if we have a predefined type for this parameter name
    if (this.typeInferences[paramName]) {
      return this.typeInferences[paramName];
    }

    // Context-based inference
    if (context.includes('.map(') || context.includes('.filter(') || context.includes('.forEach(')) {
      return 'any'; // Array callback parameters
    }

    if (context.includes('.catch(') || context.includes('.then(')) {
      return paramName === 'error' ? 'Error' : 'any';
    }

    if (context.includes('useState') || context.includes('setState')) {
      return 'any';
    }

    if (context.includes('onClick') || context.includes('onChange') || context.includes('onSubmit')) {
      return 'React.MouseEvent | React.ChangeEvent | React.FormEvent';
    }

    // Default to 'any' for unknown cases
    return 'any';
  }

  fixImplicitAnyParameter(filePath, error) {
    const fullPath = join(projectRoot, filePath);
    if (!existsSync(fullPath)) {
      this.log(`File not found: ${fullPath}`, 'warning');
      return false;
    }

    const content = readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    
    if (error.line > lines.length) {
      return false;
    }

    const line = lines[error.line - 1];
    const { parameter } = error;

    // Find the parameter and add type annotation
    const parameterPattern = new RegExp(`\\b${parameter}\\b(?!:)`, 'g');
    
    // Infer type based on context
    const inferredType = this.inferType(parameter, line);
    
    // Replace parameter with typed version
    const newLine = line.replace(parameterPattern, `${parameter}: ${inferredType}`);

    if (newLine !== line) {
      lines[error.line - 1] = newLine;
      writeFileSync(fullPath, lines.join('\n'), 'utf8');
      this.fixedCount++;
      this.log(`Fixed: ${filePath}:${error.line} - ${parameter}: ${inferredType}`, 'success');
      return true;
    }

    return false;
  }

  async run() {
    this.log('🔍 Analyzing TS7006 implicit any parameter errors...');
    
    const errors = this.getTypeScriptErrors();
    this.log(`Found ${errors.length} implicit any parameter errors`);
    
    if (errors.length === 0) {
      this.log('No TS7006 errors to fix');
      return;
    }

    // Group errors by file
    const errorsByFile = {};
    for (const error of errors) {
      if (!errorsByFile[error.file]) {
        errorsByFile[error.file] = [];
      }
      errorsByFile[error.file].push(error);
    }
    
    // Fix errors file by file
    for (const [file, fileErrors] of Object.entries(errorsByFile)) {
      this.log(`Fixing ${fileErrors.length} errors in ${file}`);
      
      // Sort errors by line number in reverse to avoid line number shifts
      fileErrors.sort((a, b) => b.line - a.line);
      
      for (const error of fileErrors) {
        this.fixImplicitAnyParameter(file, error);
      }
    }
    
    this.log(`✅ Fixed ${this.fixedCount} implicit any parameter errors`);
    
    // Verify results
    const finalErrors = this.getTypeScriptErrors();
    this.log(`Remaining TS7006 errors: ${finalErrors.length}`);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('fix-ts7006-implicit-any-param.js')) {
  const fixer = new ImplicitAnyParamFixer();
  fixer.run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}

export { ImplicitAnyParamFixer };