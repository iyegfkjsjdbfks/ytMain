#!/usr/bin/env node
/**
 * Fix TS1068: Unexpected token errors
 * Handles malformed syntax and unexpected tokens
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

class TS1068Fixer {
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

  async getTS1068Errors() {
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
        // Updated pattern to match: filename(line,col): error TS1068: message
        if (line.includes('error TS1068:')) {
          const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+TS1068:\s+(.+)$/);
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

  fixUnexpectedTokensInFunctionSignatures(content) {
    let fixed = false;
    
    // Fix function signature with unexpected tokens: "private getTokens() AuthTokens | null {"
    content = content.replace(/((?:private|public|protected|static)\s+)(\w+)\(\)\s+(\w+(?:\s*\|\s*\w+)*)\s*\{/g, (match, modifier, funcName, returnType) => {
      fixed = true;
      this.log(`Fixed function signature with unexpected token: ${match.trim()}`, 'success');
      return `${modifier}${funcName}(): ${returnType} {`;
    });
    
    // Fix method declarations with unexpected tokens
    content = content.replace(/(\w+)\(\)\s+(\w+(?:\s*\|\s*\w+)*)\s*\{/g, (match, funcName, returnType) => {
      fixed = true;
      this.log(`Fixed method signature with unexpected token: ${match.trim()}`, 'success');
      return `${funcName}(): ${returnType} {`;
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

      // Apply various fixes for TS1068 errors
      const signatureFix = this.fixUnexpectedTokensInFunctionSignatures(content);
      content = signatureFix.content;
      fileFixed = fileFixed || signatureFix.fixed;

      if (fileFixed && content !== originalContent) {
        writeFileSync(filePath, content, 'utf8');
        this.processedFiles.add(filePath);
        this.fixedCount++;
        this.log(`Fixed TS1068 errors in ${filePath}`, 'success');
        return true;
      }

      return false;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    this.log('🚀 Starting TS1068 Unexpected token error fixes...');
    
    const initialErrors = await this.getTS1068Errors();
    this.log(`Found ${initialErrors.length} TS1068 errors`);
    
    if (initialErrors.length === 0) {
      this.log('No TS1068 errors found!', 'success');
      return;
    }

    // Get unique files with TS1068 errors
    const filesToFix = [...new Set(initialErrors.map(e => e.file))];
    this.log(`Files to fix: ${filesToFix.join(', ')}`);

    let totalFixed = 0;
    for (const file of filesToFix) {
      const fixed = await this.fixFile(file);
      if (fixed) totalFixed++;
    }

    const finalErrors = await this.getTS1068Errors();
    const improvement = initialErrors.length - finalErrors.length;

    this.log('\n' + '='.repeat(60));
    this.log('📊 TS1068 Unexpected Token Fix Summary');
    this.log('='.repeat(60));
    this.log(`Files processed: ${totalFixed}`);
    this.log(`Initial TS1068 errors: ${initialErrors.length}`);
    this.log(`Final TS1068 errors: ${finalErrors.length}`);
    this.log(`Errors fixed: ${improvement}`);
    
    if (improvement > 0) {
      this.log(`✅ Successfully fixed ${improvement} TS1068 errors!`, 'success');
    } else if (finalErrors.length === 0) {
      this.log('🎉 All TS1068 errors resolved!', 'success');
    } else {
      this.log('⚠️ Some TS1068 errors may require manual review', 'warning');
    }
  }
}

// Execute if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     import.meta.url.endsWith(process.argv[1]) ||
                     process.argv[1].endsWith('fix-ts1068-unexpected-token.js');

if (isMainModule) {
  const fixer = new TS1068Fixer();
  fixer.run().catch(err => {
    console.error('TS1068 fixer failed:', err);
    process.exitCode = 1;
  });
}

export { TS1068Fixer };