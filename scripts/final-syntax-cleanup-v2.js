#!/usr/bin/env node
/**
 * Final Syntax Error Cleanup
 * Manually fixes the remaining syntax errors to reach zero errors
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

class FinalSyntaxCleanup {
  constructor() {
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
    const prefix = { info: '🔧', success: '✅', error: '❌', warning: '⚠️' }[type] || '🔧';
    console.log(`${colors[type]}${prefix} ${message}${colors.reset}`);
  }

  async fixSyntaxErrorsManually() {
    const fixes = [
      {
        file: 'scripts/refactor-codebase.ts',
        line: 489,
        search: /(\w+:\s*[\w|]+)\s+(\w+:\s*[\w|]+)/,
        replace: '$1, $2',
        description: 'Fix missing comma in type definition'
      },
      {
        file: 'scripts/refactor-codebase.ts', 
        line: 491,
        search: /(\w+:\s*[\w|]+)\s+(\w+:\s*[\w|]+)/,
        replace: '$1, $2',
        description: 'Fix missing comma in type definition'
      },
      {
        file: 'services/api.ts',
        line: 602,
        search: /(\w+:\s*[\w|]+)\s+(\w+:\s*[\w|]+)/,
        replace: '$1, $2',
        description: 'Fix missing comma in parameter types'
      },
      {
        file: 'services/youtubeSearchService.ts',
        line: 508,
        search: /(\w+:\s*[\w|]+)\s+(\w+:\s*[\w|]+)/,
        replace: '$1, $2',
        description: 'Fix missing comma in parameter types'
      },
      {
        file: 'services/youtubeSearchService.ts',
        line: 577,
        search: /(\w+:\s*[\w|]+)\s+(\w+:\s*[\w|]+)/,
        replace: '$1, $2',
        description: 'Fix missing comma in parameter types'
      },
      {
        file: 'src/hooks/legacy/root-useLiveStream.ts',
        line: 205,
        search: /(\w+:\s*[\w|]+)\s+(\w+:\s*[\w|]+)/,
        replace: '$1, $2',
        description: 'Fix missing comma in parameter types'
      },
      {
        file: 'src/hooks/legacy/root-useLiveStream.ts',
        line: 225,
        search: /(\w+:\s*[\w|]+)\s+(\w+:\s*[\w|]+)/,
        replace: '$1, $2',
        description: 'Fix missing comma in parameter types'
      },
      {
        file: 'src/hooks/unified/useApi.ts',
        line: 369,
        search: /(\w+:\s*[\w|]+)\s+(\w+:\s*[\w|]+)/,
        replace: '$1, $2',
        description: 'Fix missing comma in parameter types'
      }
    ];

    for (const fix of fixes) {
      await this.applyFix(fix);
    }
  }

  async applyFix(fix) {
    const filePath = fix.file;
    
    if (!existsSync(filePath)) {
      this.log(`File not found: ${filePath}`, 'warning');
      return false;
    }

    try {
      const content = readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      if (fix.line > lines.length) {
        this.log(`Line ${fix.line} not found in ${filePath}`, 'warning');
        return false;
      }

      const targetLine = lines[fix.line - 1];
      let newLine = targetLine;

      // Apply the fix
      if (fix.search && fix.replace) {
        newLine = targetLine.replace(fix.search, fix.replace);
      }

      // Additional generic fixes for common patterns
      if (newLine === targetLine) {
        // Fix patterns like "param1: type param2: type" -> "param1: type, param2: type"
        newLine = newLine.replace(/(\w+:\s*[\w|]+)\s+(\w+:\s*[\w|]+)/g, '$1, $2');
      }

      if (newLine === targetLine) {
        // Fix patterns like "value) value)" -> "value), value)"
        newLine = newLine.replace(/\)\s+(\w+\))/g, '), $1');
      }

      if (newLine === targetLine) {
        // Fix patterns like "a b" in function parameters
        newLine = newLine.replace(/\(([^(),]+)\s+([^(),]+)\)/g, '($1, $2)');
      }

      if (newLine !== targetLine) {
        lines[fix.line - 1] = newLine;
        const newContent = lines.join('\n');
        writeFileSync(filePath, newContent, 'utf8');
        this.log(`${fix.description} in ${filePath}:${fix.line}`, 'success');
        this.fixedCount++;
        return true;
      } else {
        this.log(`No fix applied to ${filePath}:${fix.line}`, 'warning');
        return false;
      }

    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    this.log('🚀 Starting Final Syntax Error Cleanup...');
    
    const beforeCount = await this.getErrorCount();
    this.log(`Errors before cleanup: ${beforeCount}`);

    await this.fixSyntaxErrorsManually();

    const afterCount = await this.getErrorCount();
    this.log(`Errors after cleanup: ${afterCount}`);
    this.log(`Fixed ${this.fixedCount} syntax issues`, 'success');
    
    if (afterCount === 0) {
      this.log('🎉 ALL TYPESCRIPT ERRORS RESOLVED!', 'success');
    } else {
      this.log(`${afterCount} errors remaining`, 'info');
    }
  }

  async getErrorCount() {
    try {
      execSync('npm run type-check 2>&1', { encoding: 'utf8', stdio: 'pipe' });
      return 0;
    } catch (error) {
      const output = error.stdout + error.stderr;
      const errorLines = output.split('\n').filter(line => /error TS\d+:/.test(line));
      return errorLines.length;
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleanup = new FinalSyntaxCleanup();
  cleanup.run().catch(err => {
    console.error('FinalSyntaxCleanup failed:', err);
    process.exitCode = 1;
  });
}

export default FinalSyntaxCleanup;