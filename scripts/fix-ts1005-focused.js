#!/usr/bin/env node
/**
 * Focused TS1005 fixer for common syntax issues
 * Targets the most frequent patterns: comma expected, semicolon expected, parenthesis expected
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

class FocusedTS1005Fixer {
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

  async getTS1005Errors() {
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
        if (line.includes('error TS1005:')) {
          const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+TS1005:\s+(.+)$/);
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

  fixCommonPatterns(content) {
    let fixed = false;
    
    // Pattern 1: Missing colon in function signatures
    // "function() ReturnType {" → "function(): ReturnType {"
    content = content.replace(/(\w+\([^)]*\))\s+([A-Z]\w*(?:<[^>]*>)?(?:\s*\|\s*\w+)*)\s*\{/g, (match, funcSig, returnType) => {
      fixed = true;
      this.log(`Fixed function signature: ${match.trim()} → ${funcSig}: ${returnType} {`, 'success');
      return `${funcSig}: ${returnType} {`;
    });
    
    // Pattern 2: Missing comma in object literals  
    // "prop: value\n  otherProp:" → "prop: value,\n  otherProp:"
    content = content.replace(/^(\s*\w+:\s*[^,\n}]+)\n(\s*\w+:)/gm, (match, prop, nextProp) => {
      if (!prop.trim().endsWith(',')) {
        fixed = true;
        this.log(`Added missing comma: ${prop.trim()}`, 'success');
        return `${prop},\n${nextProp}`;
      }
      return match;
    });
    
    // Pattern 3: Missing semicolon at end of statements
    // "statement\n  nextStatement" where first needs semicolon
    content = content.replace(/^(\s*(?:const|let|var|return|throw)\s+[^;{}\n]+)\n(\s*[a-zA-Z])/gm, (match, statement, nextLine) => {
      if (!statement.trim().endsWith(';') && !statement.includes('{')) {
        fixed = true;
        this.log(`Added missing semicolon: ${statement.trim()}`, 'success');
        return `${statement};\n${nextLine}`;
      }
      return match;
    });
    
    // Pattern 4: Missing parenthesis in function calls
    // "function (" → "function("
    content = content.replace(/(\w+)\s+\(/g, (match, funcName) => {
      // Skip keywords that should have space
      if (!['if', 'for', 'while', 'switch', 'catch'].includes(funcName)) {
        fixed = true;
        this.log(`Fixed function call spacing: ${match} → ${funcName}(`, 'success');
        return `${funcName}(`;
      }
      return match;
    });
    
    // Pattern 5: Missing closing bracket/paren
    // Look for unmatched opening brackets
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for lines ending with opening bracket but missing closing
      if (line.match(/\{\s*$/) && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (nextLine.trim() && !nextLine.includes('}') && !nextLine.trim().startsWith('}')) {
          // Look ahead for proper closing
          let found = false;
          for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
            if (lines[j].includes('}')) {
              found = true;
              break;
            }
          }
          if (!found && !line.includes('function') && !line.includes('class')) {
            lines[i + 1] = lines[i + 1] + '\n  }';
            fixed = true;
            this.log(`Added missing closing brace after line ${i + 1}`, 'success');
          }
        }
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

      const patternFix = this.fixCommonPatterns(content);
      content = patternFix.content;
      fileFixed = fileFixed || patternFix.fixed;

      if (fileFixed && content !== originalContent) {
        writeFileSync(filePath, content, 'utf8');
        this.processedFiles.add(filePath);
        this.fixedCount++;
        this.log(`Fixed TS1005 errors in ${filePath}`, 'success');
        return true;
      }

      return false;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    this.log('🚀 Starting Focused TS1005 error fixes...');
    
    const initialErrors = await this.getTS1005Errors();
    this.log(`Found ${initialErrors.length} TS1005 errors`);
    
    if (initialErrors.length === 0) {
      this.log('No TS1005 errors found!', 'success');
      return;
    }

    // Get unique files with TS1005 errors
    const filesToFix = [...new Set(initialErrors.map(e => e.file))];
    this.log(`Files to fix: ${filesToFix.join(', ')}`);

    let totalFixed = 0;
    for (const file of filesToFix) {
      const fixed = await this.fixFile(file);
      if (fixed) totalFixed++;
    }

    const finalErrors = await this.getTS1005Errors();
    const improvement = initialErrors.length - finalErrors.length;

    this.log('\n' + '='.repeat(60));
    this.log('📊 Focused TS1005 Fix Summary');
    this.log('='.repeat(60));
    this.log(`Files processed: ${totalFixed}`);
    this.log(`Initial TS1005 errors: ${initialErrors.length}`);
    this.log(`Final TS1005 errors: ${finalErrors.length}`);
    this.log(`Errors fixed: ${improvement}`);
    
    if (improvement > 0) {
      this.log(`✅ Successfully fixed ${improvement} TS1005 errors!`, 'success');
    } else if (finalErrors.length === 0) {
      this.log('🎉 All TS1005 errors resolved!', 'success');
    } else {
      this.log('⚠️ Some TS1005 errors may require manual review', 'warning');
    }
  }
}

// Execute if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     import.meta.url.endsWith(process.argv[1]) ||
                     process.argv[1].endsWith('fix-ts1005-focused.js');

if (isMainModule) {
  const fixer = new FocusedTS1005Fixer();
  fixer.run().catch(err => {
    console.error('Focused TS1005 fixer failed:', err);
    process.exitCode = 1;
  });
}

export { FocusedTS1005Fixer };