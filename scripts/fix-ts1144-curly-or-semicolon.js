#!/usr/bin/env node
/**
 * Fix TS1144: '{' or ';' expected errors
 * Handles malformed function signatures and type annotations
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

class TS1144Fixer {
  constructor() {
    this.fixedCount = 0;
    this.processedFiles = new Set();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
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
    
    console.log(`${colors[type]}${prefix} [${timestamp}] ${message}${colors.reset}`);
  }

  async getTS1144Errors() {
    try {
      const result = execSync('npm run type-check', {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: process.cwd(),
        timeout: 30000
      });
      return [];
    } catch (error) {
      const output = `${error.stdout || ''}${error.stderr || ''}`;
      const errors = [];
      
      const lines = output.split('\n');
      for (const line of lines) {
        // Updated pattern to match: filename(line,col): error TS1144: message
        if (line.includes('error TS1144:')) {
          const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+TS1144:\s+(.+)$/);
          if (match) {
            const [, file, lineNum, column, message] = match;
            errors.push({
              file: file.trim(),
              line: parseInt(lineNum),
              column: parseInt(column),
              message: message.trim()
            });
          }
        }
      }
      
      return errors;
    }
  }

  fixMalformedFunctionSignatures(content) {
    let fixed = false;
    
    // Fix function signature pattern: "functionName() ReturnType |" -> "functionName(): ReturnType |"
    content = content.replace(/(\w+)\(\)\s+([A-Z]\w*(?:\s*\|\s*\w+)*)\s*\{/g, (match, funcName, returnType) => {
      fixed = true;
      this.log(`Fixed function signature: ${funcName}() ${returnType} -> ${funcName}(): ${returnType}`, 'success');
      return `${funcName}(): ${returnType} {`;
    });
    
    // Fix method signature pattern: "private methodName() ReturnType |" -> "private methodName(): ReturnType |"  
    content = content.replace(/((?:private|public|protected|static)\s+)(\w+)\(\)\s+([A-Z]\w*(?:\s*\|\s*\w+)*)\s*\{/g, (match, modifier, methodName, returnType) => {
      fixed = true;
      this.log(`Fixed method signature: ${modifier}${methodName}() ${returnType} -> ${modifier}${methodName}(): ${returnType}`, 'success');
      return `${modifier}${methodName}(): ${returnType} {`;
    });
    
    return { content, fixed };
  }

  async fixFile(filePath) {
    if (!existsSync(filePath) || this.processedFiles.has(filePath)) {
      return false;
    }

    try {
      const originalContent = readFileSync(filePath, 'utf8');
      let content = originalContent;
      let fileFixed = false;

      // Apply various fixes for TS1144 errors
      const signatureFix = this.fixMalformedFunctionSignatures(content);
      content = signatureFix.content;
      fileFixed = fileFixed || signatureFix.fixed;

      if (fileFixed && content !== originalContent) {
        writeFileSync(filePath, content, 'utf8');
        this.processedFiles.add(filePath);
        this.fixedCount++;
        this.log(`Fixed TS1144 errors in ${filePath}`, 'success');
        return true;
      }

      return false;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    this.log('🚀 Starting TS1144 \'{}\' or \';\' expected error fixes...');
    
    const initialErrors = await this.getTS1144Errors();
    this.log(`Found ${initialErrors.length} TS1144 errors`);
    
    if (initialErrors.length === 0) {
      this.log('No TS1144 errors found!', 'success');
      return;
    }

    // Get unique files with TS1144 errors
    const filesToFix = [...new Set(initialErrors.map(e => e.file))];
    this.log(`Files to fix: ${filesToFix.join(', ')}`);

    let totalFixed = 0;
    for (const file of filesToFix) {
      const fixed = await this.fixFile(file);
      if (fixed) totalFixed++;
    }

    const finalErrors = await this.getTS1144Errors();
    const improvement = initialErrors.length - finalErrors.length;

    this.log('\n' + '='.repeat(60));
    this.log('📊 TS1144 \'{}\' or \';\' Expected Fix Summary');
    this.log('='.repeat(60));
    this.log(`Files processed: ${totalFixed}`);
    this.log(`Initial TS1144 errors: ${initialErrors.length}`);
    this.log(`Final TS1144 errors: ${finalErrors.length}`);
    this.log(`Errors fixed: ${improvement}`);
    
    if (improvement > 0) {
      this.log(`✅ Successfully fixed ${improvement} TS1144 errors!`, 'success');
    } else if (finalErrors.length === 0) {
      this.log('🎉 All TS1144 errors resolved!', 'success');
    } else {
      this.log('⚠️ Some TS1144 errors may require manual review', 'warning');
    }
  }
}

// Execute if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     import.meta.url.endsWith(process.argv[1]) ||
                     process.argv[1].endsWith('fix-ts1144-curly-or-semicolon.js');

if (isMainModule) {
  const fixer = new TS1144Fixer();
  fixer.run().catch(err => {
    console.error('TS1144 fixer failed:', err);
    process.exitCode = 1;
  });
}

export { TS1144Fixer };