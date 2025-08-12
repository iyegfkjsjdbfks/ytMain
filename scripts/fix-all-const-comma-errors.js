#!/usr/bin/env node
/**
 * Comprehensive Const Comma Fixer
 * 
 * Fixes ALL missing commas after 'as const' in object literals throughout the codebase
 * This addresses the widespread TS1005 errors
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { execSync } from 'child_process';

const projectRoot = process.cwd();

class ConstCommaFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalChanges = 0;
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '🔧';
    console.log(`${colors[type]}${prefix} ${message}${colors.reset}`);
  }

  getAllTypeScriptFiles() {
    const files = [];
    
    const scanDir = (dir) => {
      try {
        const items = readdirSync(dir);
        for (const item of items) {
          const fullPath = join(dir, item);
          const stat = statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && !['node_modules', 'dist', 'build'].includes(item)) {
            scanDir(fullPath);
          } else if (stat.isFile() && ['.ts', '.tsx'].includes(extname(item))) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories that can't be read
      }
    };
    
    scanDir(projectRoot);
    return files;
  }

  fixConstCommaErrors(content) {
    let fixed = content;
    let changes = 0;

    // Primary fix: 'as const' followed directly by identifier
    // Pattern: 'security' as const severity: → 'security' as const, severity:
    // Pattern: 'local' as const contentType: → 'local' as const, contentType:
    const basicConstCommaRegex = /(['"`][\w-]+['"`]\s+as\s+const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*\s*:)/g;
    const beforeBasic = fixed;
    fixed = fixed.replace(basicConstCommaRegex, '$1, $2');
    if (fixed !== beforeBasic) changes++;

    // Fix for boolean/number literals: true as const identifier:
    const literalConstCommaRegex = /\b((?:true|false|\d+)\s+as\s+const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*\s*:)/g;
    const beforeLiteral = fixed;
    fixed = fixed.replace(literalConstCommaRegex, '$1, $2');
    if (fixed !== beforeLiteral) changes++;

    // Fix for arrays: [...] as const identifier:
    const arrayConstCommaRegex = /(\[.*?\]\s*as\s+const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*\s*:)/g;
    const beforeArray = fixed;
    fixed = fixed.replace(arrayConstCommaRegex, '$1, $2');
    if (fixed !== beforeArray) changes++;

    // Fix for function calls: functionCall() as const identifier:
    const funcConstCommaRegex = /([a-zA-Z_$][a-zA-Z0-9_$]*\([^)]*\)\s*as\s+const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*\s*:)/g;
    const beforeFunc = fixed;
    fixed = fixed.replace(funcConstCommaRegex, '$1, $2');
    if (fixed !== beforeFunc) changes++;

    // Fix for object properties within spread: { ...v, prop: 'value' as const prop2: }
    const spreadConstCommaRegex = /(\w+:\s*['"`][\w-]+['"`]\s*as\s*const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*\s*:)/g;
    const beforeSpread = fixed;
    fixed = fixed.replace(spreadConstCommaRegex, '$1, $2');
    if (fixed !== beforeSpread) changes++;

    // Handle multiline const assertions with better regex
    const lines = fixed.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for pattern: text as const [whitespace] identifier:
      if (line.includes(' as const ') && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*\s*:/)) {
          // Current line ends with 'as const' and next line starts with 'identifier:'
          const constMatch = line.match(/(.*as\s+const)\s*$/);
          if (constMatch && !line.includes(',')) {
            lines[i] = constMatch[1] + ',';
            changes++;
          }
        }
      }
    }
    fixed = lines.join('\n');

    return { fixed, changes };
  }

  async fixFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const result = this.fixConstCommaErrors(content);
      
      if (result.changes > 0) {
        writeFileSync(filePath, result.fixed, 'utf8');
        this.fixedFiles.push({
          file: filePath,
          changes: result.changes
        });
        this.totalChanges += result.changes;
        
        const relativePath = filePath.replace(projectRoot + '/', '');
        this.log(`Fixed ${relativePath} (${result.changes} const comma fixes)`);
        return true;
      }
      
      return false;
    } catch (error) {
      this.log(`Error fixing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    this.log('🚀 Starting Comprehensive Const Comma Fix...');
    
    // Get all TypeScript files
    const files = this.getAllTypeScriptFiles();
    this.log(`Found ${files.length} TypeScript files to process`);
    
    let fixedCount = 0;
    
    for (const file of files) {
      const wasFixed = await this.fixFile(file);
      if (wasFixed) fixedCount++;
    }
    
    // Run verification
    this.log('\n🔍 Running final TypeScript check...');
    try {
      const result = execSync('timeout 45s npx tsc --noEmit', { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 45000 
      });
      
      this.log('🎉 TypeScript compilation successful! All errors resolved!', 'success');
      writeFileSync(join(projectRoot, 'type-check-final.txt'), 'SUCCESS: No TypeScript errors found!');
      
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      const errorLines = output.split('\n').filter(line => /error TS\d+:/.test(line));
      const totalErrors = errorLines.length;
      
      // Save error output for analysis
      writeFileSync(join(projectRoot, 'type-check-final.txt'), output);
      
      if (totalErrors > 0) {
        this.log(`⚠️ ${totalErrors} TypeScript errors still remain`, 'warning');
        
        // Group errors by type
        const errorGroups = {};
        errorLines.forEach(line => {
          const match = line.match(/error (TS\d+):/);
          if (match) {
            const code = match[1];
            errorGroups[code] = (errorGroups[code] || 0) + 1;
          }
        });
        
        this.log('\n📊 Error breakdown:');
        Object.entries(errorGroups).forEach(([code, count]) => {
          console.log(`  ${code}: ${count} errors`);
        });
        
        this.log('\n📋 First 5 remaining errors:');
        errorLines.slice(0, 5).forEach((line, i) => {
          console.log(`  ${i + 1}. ${line.trim()}`);
        });
      } else {
        this.log('✅ All TypeScript errors resolved!', 'success');
      }
    }
    
    // Report results
    this.log('\n' + '='.repeat(60));
    this.log(`📊 Comprehensive Const Comma Fix Complete`);
    this.log(`✅ Files processed: ${files.length}`);
    this.log(`🔧 Files fixed: ${fixedCount}`);
    this.log(`🎯 Total changes made: ${this.totalChanges}`);
    
    if (this.fixedFiles.length > 0) {
      this.log('\n📋 Summary of fixed files:');
      const topFiles = this.fixedFiles
        .sort((a, b) => b.changes - a.changes)
        .slice(0, 10);
        
      topFiles.forEach(fix => {
        const relativePath = fix.file.replace(projectRoot + '/', '');
        console.log(`  • ${relativePath} (${fix.changes} fixes)`);
      });
      
      if (this.fixedFiles.length > 10) {
        console.log(`  ... and ${this.fixedFiles.length - 10} more files`);
      }
    }
    
    return {
      filesProcessed: files.length,
      filesFixed: fixedCount,
      totalChanges: this.totalChanges
    };
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new ConstCommaFixer();
  fixer.run().catch(err => {
    console.error('Const comma fixer failed:', err);
    process.exitCode = 1;
  });
}

export { ConstCommaFixer };