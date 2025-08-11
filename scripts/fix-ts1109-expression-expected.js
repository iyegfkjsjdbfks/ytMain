#!/usr/bin/env node
/**
 * Fix TS1109: Expression expected errors
 * Handles malformed expressions, particularly Math.random() issues
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

class TS1109Fixer {
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

  async getTS1109Errors() {
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
        // Updated pattern to match: filename(line,col): error TS1109: message
        if (line.includes('error TS1109:')) {
          const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+TS1109:\s+(.+)$/);
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

  fixMathRandomExpressions(content) {
    let fixed = false;
    
    // Fix Math.random() * > pattern
    content = content.replace(/Math\.random\(\)\s*\*\s*>\s*/g, (match) => {
      fixed = true;
      this.log(`Fixed Math.random() * > pattern`, 'success');
      return 'Math.random() > ';
    });
    
    // Fix Math.random() * * pattern  
    content = content.replace(/Math\.random\(\)\s*\*\s*\*\s*/g, (match) => {
      fixed = true;
      this.log(`Fixed Math.random() * * pattern`, 'success');
      return 'Math.random() * ';
    });
    
    // Fix Math.floor(Math.random() * * number) pattern
    content = content.replace(/Math\.floor\(Math\.random\(\)\s*\*\s*\*\s*(\d+)\)/g, (match, number) => {
      fixed = true;
      this.log(`Fixed Math.floor(Math.random() * * ${number}) pattern`, 'success');
      return `Math.floor(Math.random() * ${number})`;
    });
    
    // Fix other malformed expressions like "random() * > value"
    content = content.replace(/(\w+)\(\)\s*\*\s*>\s*([0-9.]+)/g, (match, func, value) => {
      fixed = true;
      this.log(`Fixed ${func}() * > ${value} pattern`, 'success');
      return `${func}() > ${value}`;
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

      // Apply various fixes for TS1109 errors
      const mathFix = this.fixMathRandomExpressions(content);
      content = mathFix.content;
      fileFixed = fileFixed || mathFix.fixed;

      if (fileFixed && content !== originalContent) {
        writeFileSync(filePath, content, 'utf8');
        this.processedFiles.add(filePath);
        this.fixedCount++;
        this.log(`Fixed TS1109 errors in ${filePath}`, 'success');
        return true;
      }

      return false;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    this.log('🚀 Starting TS1109 Expression Expected error fixes...');
    
    const initialErrors = await this.getTS1109Errors();
    this.log(`Found ${initialErrors.length} TS1109 errors`);
    
    if (initialErrors.length === 0) {
      this.log('No TS1109 errors found!', 'success');
      return;
    }

    // Get unique files with TS1109 errors
    const filesToFix = [...new Set(initialErrors.map(e => e.file))];
    this.log(`Files to fix: ${filesToFix.join(', ')}`);

    let totalFixed = 0;
    for (const file of filesToFix) {
      const fixed = await this.fixFile(file);
      if (fixed) totalFixed++;
    }

    const finalErrors = await this.getTS1109Errors();
    const improvement = initialErrors.length - finalErrors.length;

    this.log('\n' + '='.repeat(60));
    this.log('📊 TS1109 Expression Expected Fix Summary');
    this.log('='.repeat(60));
    this.log(`Files processed: ${totalFixed}`);
    this.log(`Initial TS1109 errors: ${initialErrors.length}`);
    this.log(`Final TS1109 errors: ${finalErrors.length}`);
    this.log(`Errors fixed: ${improvement}`);
    
    if (improvement > 0) {
      this.log(`✅ Successfully fixed ${improvement} TS1109 errors!`, 'success');
    } else if (finalErrors.length === 0) {
      this.log('🎉 All TS1109 errors resolved!', 'success');
    } else {
      this.log('⚠️ Some TS1109 errors may require manual review', 'warning');
    }
  }
}

// Execute if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     import.meta.url.endsWith(process.argv[1]) ||
                     process.argv[1].endsWith('fix-ts1109-expression-expected.js');

if (isMainModule) {
  const fixer = new TS1109Fixer();
  fixer.run().catch(err => {
    console.error('TS1109 fixer failed:', err);
    process.exitCode = 1;
  });
}

export { TS1109Fixer };