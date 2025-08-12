#!/usr/bin/env node
/**
 * Comprehensive Syntax Fixer
 * 
 * This script addresses remaining syntax issues that the initial fix missed:
 * - Malformed import destructuring across multiple lines
 * - Trailing spaces in imports
 * - Inconsistent import formatting
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { execSync } from 'child_process';

const projectRoot = process.cwd();

class ComprehensiveSyntaxFixer {
  constructor() {
    this.fixedFiles = [];
    this.errors = [];
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

  fixComprehensiveSyntax(content) {
    let fixed = content;
    let changes = 0;

    // Fix 1: Normalize multiline imports
    // Handle cases like:
    // import { UserGroupIcon,
    //   ChartBarIcon,
    //   ... } from '@heroicons/react/24/outline';
    
    const multilineImportRegex = /import\s*\{\s*([^}]+)\s*\}\s*from\s*(['"][^'"]+['"])/gs;
    
    fixed = fixed.replace(multilineImportRegex, (match, imports, from) => {
      // Clean up the imports list
      const cleanImports = imports
        .split(',')
        .map(imp => imp.trim())
        .filter(imp => imp.length > 0)
        .join(', ');
      
      if (cleanImports !== imports.trim()) {
        changes++;
        return `import { ${cleanImports} } from ${from}`;
      }
      return match;
    });

    // Fix 2: Remove trailing spaces from import lines
    const importLines = fixed.split('\n');
    for (let i = 0; i < importLines.length; i++) {
      const line = importLines[i];
      if (line.startsWith('import ') && line.endsWith(' ')) {
        importLines[i] = line.trimEnd();
        changes++;
      }
    }
    fixed = importLines.join('\n');

    // Fix 3: Fix malformed destructuring imports that span lines incorrectly
    // Match patterns like: import { A,\n  B,\n  C } from 'module'
    const brokenMultilineRegex = /import\s*\{\s*([^}]*\n[^}]*)\s*\}\s*from\s*(['"][^'"]+['"])/gs;
    
    fixed = fixed.replace(brokenMultilineRegex, (match, imports, from) => {
      // Flatten multiline imports into single line
      const flatImports = imports
        .replace(/\n\s*/g, ' ')
        .split(',')
        .map(imp => imp.trim())
        .filter(imp => imp.length > 0)
        .join(', ');
      
      changes++;
      return `import { ${flatImports} } from ${from}`;
    });

    // Fix 4: Clean up extra whitespace in import statements
    fixed = fixed.replace(/import\s+\{\s*([^}]+)\s*\}\s+from/g, (match, imports) => {
      const cleanImports = imports.replace(/\s*,\s*/g, ', ').trim();
      return `import { ${cleanImports} } from`;
    });

    // Fix 5: Fix trailing commas in imports
    fixed = fixed.replace(/import\s*\{\s*([^}]+),\s*\}\s*from/g, 'import { $1 } from');

    // Fix 6: Remove duplicate whitespace
    fixed = fixed.replace(/import\s+/g, 'import ');

    return { fixed, changes };
  }

  async fixFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      
      // Apply comprehensive syntax fixes
      const result = this.fixComprehensiveSyntax(content);
      
      if (result.changes > 0) {
        writeFileSync(filePath, result.fixed, 'utf8');
        this.fixedFiles.push({
          file: filePath,
          changes: result.changes
        });
        
        const relativePath = filePath.replace(projectRoot, '');
        this.log(`Fixed ${relativePath} (${result.changes} syntax changes)`);
        return true;
      }
      
      return false;
    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      this.log(`Error fixing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async runFreshTypeCheck() {
    try {
      // Run type check and capture output to a new file
      const result = execSync('npx tsc --noEmit', { 
        encoding: 'utf8', 
        stdio: 'pipe',
        timeout: 45000 
      });
      
      // No errors if we reach here
      writeFileSync(join(projectRoot, 'type-errors-fresh.txt'), 'No TypeScript errors found!');
      return { success: true, errorCount: 0 };
      
    } catch (error) {
      const output = `${error.stdout || ''}${error.stderr || ''}`;
      writeFileSync(join(projectRoot, 'type-errors-fresh.txt'), output);
      
      // Count actual errors
      const errorLines = output.split('\n').filter(line => /error TS\d+:/.test(line));
      return { success: false, errorCount: errorLines.length, output };
    }
  }

  async run() {
    this.log('🚀 Starting Comprehensive Syntax Fix...');
    
    // Get all TypeScript files
    const files = this.getAllTypeScriptFiles();
    this.log(`Found ${files.length} TypeScript files to process`);
    
    // Process files
    let fixedCount = 0;
    for (const file of files) {
      const wasFixed = await this.fixFile(file);
      if (wasFixed) fixedCount++;
    }
    
    // Run fresh type check
    this.log('\n🔍 Running fresh type check...');
    const typeCheckResult = await this.runFreshTypeCheck();
    
    // Report results
    this.log('\n' + '='.repeat(60));
    this.log(`📊 Comprehensive Syntax Fix Complete`);
    this.log(`✅ Files processed: ${files.length}`);
    this.log(`🔧 Files fixed: ${fixedCount}`);
    this.log(`❌ Errors encountered: ${this.errors.length}`);
    
    if (typeCheckResult.success) {
      this.log(`🎉 TypeScript compilation successful! Zero errors.`, 'success');
    } else {
      this.log(`⚠️ ${typeCheckResult.errorCount} TypeScript errors remain`, 'warning');
      this.log(`Fresh error report saved to: type-errors-fresh.txt`);
      
      // Show first few errors
      if (typeCheckResult.output) {
        const errorLines = typeCheckResult.output.split('\n').filter(line => /error TS\d+:/.test(line));
        this.log('\n📋 Remaining errors (first 5):');
        errorLines.slice(0, 5).forEach((line, i) => {
          console.log(`  ${i + 1}. ${line.trim()}`);
        });
      }
    }
    
    if (this.fixedFiles.length > 0) {
      this.log('\n📋 Files Modified:');
      for (const fix of this.fixedFiles.slice(0, 10)) { // Show first 10
        const relativePath = fix.file.replace(projectRoot, '');
        console.log(`  • ${relativePath} (${fix.changes} changes)`);
      }
      if (this.fixedFiles.length > 10) {
        console.log(`  ... and ${this.fixedFiles.length - 10} more files`);
      }
    }
    
    return {
      filesProcessed: files.length,
      filesFixed: fixedCount,
      errors: this.errors.length,
      typeCheckSuccess: typeCheckResult.success,
      remainingErrors: typeCheckResult.errorCount
    };
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new ComprehensiveSyntaxFixer();
  fixer.run().catch(err => {
    console.error('Comprehensive syntax fixer failed:', err);
    process.exitCode = 1;
  });
}

export { ComprehensiveSyntaxFixer };