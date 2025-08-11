#!/usr/bin/env node
/**
 * Fix TS1002: Unterminated string literal errors
 * Handles missing quotes and malformed string literals
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

class TS1002Fixer {
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

  async getTS1002Errors() {
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
        // Updated pattern to match: filename(line,col): error TS1002: message
        if (line.includes('error TS1002:')) {
          const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+TS1002:\s+(.+)$/);
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

  fixUnterminatedStrings(content) {
    let fixed = false;
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Pattern 1: Missing closing quote at end of line
      // Example: 'file: 'utils/apiUtils.ts,
      const match1 = line.match(/^(\s*\w+:\s*['"])([^'"]*),?\s*$/);
      if (match1) {
        const [, prefix, content] = match1;
        const quote = prefix.slice(-1);
        lines[i] = `${prefix}${content}${quote},`;
        fixed = true;
        this.log(`Fixed unterminated string: ${line.trim()} -> ${lines[i].trim()}`, 'success');
        continue;
      }
      
      // Pattern 2: Missing closing quote with comma
      // Example: 'utils/apiUtils.ts, 'components/SearchBar.tsx
      const match2 = line.match(/^(\s*)(['"])([^'"]*),\s*(['"])([^'"]*)\]?/);
      if (match2) {
        const [, indent, quote1, content1, quote2, content2] = match2;
        lines[i] = `${indent}${quote1}${content1}${quote1}, ${quote2}${content2}${quote2}]`;
        fixed = true;
        this.log(`Fixed unterminated string array: ${line.trim()} -> ${lines[i].trim()}`, 'success');
        continue;
      }
      
      // Pattern 3: Simple missing quote at end
      // Example: 'innerHTML = DOMPurify.sanitize(userInput),
      const match3 = line.match(/^(\s*)(['"])([^'"]*),?\s*$/);
      if (match3 && !match3[3].includes(match3[2])) {
        const [, indent, quote, content] = match3;
        lines[i] = `${indent}${quote}${content}${quote},`;
        fixed = true;
        this.log(`Fixed simple unterminated string: ${line.trim()} -> ${lines[i].trim()}`, 'success');
        continue;
      }
      
      // Pattern 4: Missing quote in file path arrays
      // Example: files: ['components/VideoCard.tsx, 'components/PlaylistCard.tsx],
      const match4 = line.match(/^(\s*\w+:\s*\[['"])([^'"]*),\s*(['"])([^'"]*)\],?/);
      if (match4) {
        const [, prefix, content1, quote2, content2] = match4;
        const quote1 = prefix.slice(-1);
        lines[i] = `${prefix}${content1}${quote1}, ${quote2}${content2}${quote2}],`;
        fixed = true;
        this.log(`Fixed unterminated string in array: ${line.trim()} -> ${lines[i].trim()}`, 'success');
        continue;
      }
      
      // Pattern 5: Malformed string concatenation like "error.messageFailed to login')"
      const match5 = line.match(/^(\s*)(.+?)([a-zA-Z])([A-Z][^'")]*['"])\);\s*$/);
      if (match5) {
        const [, indent, before, lastChar, afterPart] = match5;
        lines[i] = `${indent}${before}${lastChar} || '${afterPart});`;
        fixed = true;
        this.log(`Fixed malformed string concat: ${line.trim()} -> ${lines[i].trim()}`, 'success');
        continue;
      }
      
      // Pattern 6: String with missing quote and semicolon like "'Unknown e;"
      const match6 = line.match(/^(\s*)(['"]\w*\s*\w*)\s*;\s*$/);
      if (match6) {
        const [, indent, partial] = match6;
        const quote = partial[0];
        lines[i] = `${indent}${partial}rror${quote};`;
        fixed = true;
        this.log(`Fixed incomplete string: ${line.trim()} -> ${lines[i].trim()}`, 'success');
        continue;
      }
      
      // Pattern 7: Conditional string missing quote "? 'File reading failed';"
      const match7 = line.match(/^(\s*)([^'"]*\?\s*['"])([^'"]*)\s*[;:]\s*$/);
      if (match7) {
        const [, indent, before, content] = match7;
        const quote = before.slice(-1);
        lines[i] = `${indent}${before}${content}${quote}`;
        fixed = true;
        this.log(`Fixed conditional string: ${line.trim()} -> ${lines[i].trim()}`, 'success');
        continue;
      }
    }
    
    return { content: lines.join('\n'), fixed };
  }

  async fixFile(filePath) {
    if (!existsSync(filePath) || this.processedFiles.has(filePath)) {
      return false;
    }

    try {
      const originalContent = readFileSync(filePath, 'utf8');
      let content = originalContent;
      let fileFixed = false;

      // Apply various fixes for TS1002 errors
      const stringFix = this.fixUnterminatedStrings(content);
      content = stringFix.content;
      fileFixed = fileFixed || stringFix.fixed;

      if (fileFixed && content !== originalContent) {
        writeFileSync(filePath, content, 'utf8');
        this.processedFiles.add(filePath);
        this.fixedCount++;
        this.log(`Fixed TS1002 errors in ${filePath}`, 'success');
        return true;
      }

      return false;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    this.log('🚀 Starting TS1002 Unterminated string literal error fixes...');
    
    const initialErrors = await this.getTS1002Errors();
    this.log(`Found ${initialErrors.length} TS1002 errors`);
    
    if (initialErrors.length === 0) {
      this.log('No TS1002 errors found!', 'success');
      return;
    }

    // Get unique files with TS1002 errors
    const filesToFix = [...new Set(initialErrors.map(e => e.file))];
    this.log(`Files to fix: ${filesToFix.join(', ')}`);

    let totalFixed = 0;
    for (const file of filesToFix) {
      const fixed = await this.fixFile(file);
      if (fixed) totalFixed++;
    }

    const finalErrors = await this.getTS1002Errors();
    const improvement = initialErrors.length - finalErrors.length;

    this.log('\n' + '='.repeat(60));
    this.log('📊 TS1002 Unterminated String Literal Fix Summary');
    this.log('='.repeat(60));
    this.log(`Files processed: ${totalFixed}`);
    this.log(`Initial TS1002 errors: ${initialErrors.length}`);
    this.log(`Final TS1002 errors: ${finalErrors.length}`);
    this.log(`Errors fixed: ${improvement}`);
    
    if (improvement > 0) {
      this.log(`✅ Successfully fixed ${improvement} TS1002 errors!`, 'success');
    } else if (finalErrors.length === 0) {
      this.log('🎉 All TS1002 errors resolved!', 'success');
    } else {
      this.log('⚠️ Some TS1002 errors may require manual review', 'warning');
    }
  }
}

// Execute if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     import.meta.url.endsWith(process.argv[1]) ||
                     process.argv[1].endsWith('fix-ts1002-unterminated-string.js');

if (isMainModule) {
  const fixer = new TS1002Fixer();
  fixer.run().catch(err => {
    console.error('TS1002 fixer failed:', err);
    process.exitCode = 1;
  });
}

export { TS1002Fixer };