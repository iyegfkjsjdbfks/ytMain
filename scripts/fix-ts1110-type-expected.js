#!/usr/bin/env node
/**
 * Fix TS1110: Type expected errors
 * Handles missing or malformed type annotations
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

class TS1110Fixer {
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

  async getTS1110Errors() {
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
        // Updated pattern to match: filename(line,col): error TS1110: message
        if (line.includes('error TS1110:')) {
          const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+TS1110:\s+(.+)$/);
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

  fixMalformedGenerics(content) {
    let fixed = false;
    
    // Fix Record<strin, an={true}y> -> Record<string, any>
    content = content.replace(/Record<str\w*,\s*\w*=\{[^}]*\}\w*>/g, (match) => {
      fixed = true;
      this.log(`Fixed malformed Record generic: ${match} -> Record<string, any>`, 'success');
      return 'Record<string, any>';
    });
    
    // Fix other malformed generic types
    content = content.replace(/<[^>]*=\{[^}]*\}[^>]*>/g, (match) => {
      // Extract what looks like a type name before the malformed part
      const typeMatch = match.match(/^<(\w+)/);
      if (typeMatch) {
        fixed = true;
        this.log(`Fixed malformed generic: ${match} -> <${typeMatch[1]}>`, 'success');
        return `<${typeMatch[1]}>`;
      }
      return match;
    });
    
    return { content, fixed };
  }

  fixMalformedAngleBrackets(content) {
    let fixed = false;
    
    // Fix unclosed angle brackets in type annotations
    content = content.replace(/<(\w+)(?:\s*,\s*\w*)*(?![>])/g, (match, typeName) => {
      if (!match.includes('>')) {
        fixed = true;
        this.log(`Fixed unclosed angle bracket: ${match} -> <${typeName}>`, 'success');
        return `<${typeName}>`;
      }
      return match;
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

      // Apply various fixes for TS1110 errors
      const genericFix = this.fixMalformedGenerics(content);
      content = genericFix.content;
      fileFixed = fileFixed || genericFix.fixed;

      const bracketFix = this.fixMalformedAngleBrackets(content);
      content = bracketFix.content;
      fileFixed = fileFixed || bracketFix.fixed;

      if (fileFixed && content !== originalContent) {
        writeFileSync(filePath, content, 'utf8');
        this.processedFiles.add(filePath);
        this.fixedCount++;
        this.log(`Fixed TS1110 errors in ${filePath}`, 'success');
        return true;
      }

      return false;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    this.log('🚀 Starting TS1110 Type expected error fixes...');
    
    const initialErrors = await this.getTS1110Errors();
    this.log(`Found ${initialErrors.length} TS1110 errors`);
    
    if (initialErrors.length === 0) {
      this.log('No TS1110 errors found!', 'success');
      return;
    }

    // Get unique files with TS1110 errors
    const filesToFix = [...new Set(initialErrors.map(e => e.file))];
    this.log(`Files to fix: ${filesToFix.join(', ')}`);

    let totalFixed = 0;
    for (const file of filesToFix) {
      const fixed = await this.fixFile(file);
      if (fixed) totalFixed++;
    }

    const finalErrors = await this.getTS1110Errors();
    const improvement = initialErrors.length - finalErrors.length;

    this.log('\n' + '='.repeat(60));
    this.log('📊 TS1110 Type Expected Fix Summary');
    this.log('='.repeat(60));
    this.log(`Files processed: ${totalFixed}`);
    this.log(`Initial TS1110 errors: ${initialErrors.length}`);
    this.log(`Final TS1110 errors: ${finalErrors.length}`);
    this.log(`Errors fixed: ${improvement}`);
    
    if (improvement > 0) {
      this.log(`✅ Successfully fixed ${improvement} TS1110 errors!`, 'success');
    } else if (finalErrors.length === 0) {
      this.log('🎉 All TS1110 errors resolved!', 'success');
    } else {
      this.log('⚠️ Some TS1110 errors may require manual review', 'warning');
    }
  }
}

// Execute if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     import.meta.url.endsWith(process.argv[1]) ||
                     process.argv[1].endsWith('fix-ts1110-type-expected.js');

if (isMainModule) {
  const fixer = new TS1110Fixer();
  fixer.run().catch(err => {
    console.error('TS1110 fixer failed:', err);
    process.exitCode = 1;
  });
}

export { TS1110Fixer };