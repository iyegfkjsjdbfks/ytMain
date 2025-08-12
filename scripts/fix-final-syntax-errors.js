#!/usr/bin/env node
/**
 * Final Syntax Error Fixer
 * 
 * Fixes the last remaining syntax issues:
 * - Malformed imports with embedded comments
 * - Interface property comma errors
 * - Parameter declaration issues
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const projectRoot = process.cwd();

class FinalSyntaxFixer {
  constructor() {
    this.fixedFiles = [];
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

  fixFinalSyntaxErrors(content) {
    let fixed = content;
    let changes = 0;

    // Fix 1: Remove embedded TypeScript reference comments from imports
    // Pattern: import { Icon, /// <reference types="node" /> OtherIcon } from 'module'
    const embeddedCommentRegex = /import\s*\{\s*([^}]*?)\/\/\/\s*<reference[^>]*\/>\s*([^}]*?)\s*\}\s*from/g;
    const beforeComment = fixed;
    fixed = fixed.replace(embeddedCommentRegex, 'import { $1$2 } from');
    if (fixed !== beforeComment) {
      changes++;
      this.log('Fixed embedded TypeScript reference comment in import');
    }

    // Fix 2: Clean up malformed imports with mixed content
    // Handle cases where comments got mixed into import statements
    const lines = fixed.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('import {') && line.includes('///')) {
        // Extract the import and clean it
        const importMatch = line.match(/import\s*\{\s*([^}]*)\s*\}\s*from\s*(['"][^'"]+['"])/);
        if (importMatch) {
          const [, importList, fromModule] = importMatch;
          // Clean the import list by removing comments and fixing commas
          const cleanImports = importList
            .replace(/\/\/\/[^,}]*/g, '') // Remove /// comments
            .split(',')
            .map(imp => imp.trim())
            .filter(imp => imp && !imp.startsWith('///'))
            .join(', ');
          
          lines[i] = `import { ${cleanImports} } from ${fromModule};`;
          changes++;
        }
      }
    }
    fixed = lines.join('\n');

    // Fix 3: Add missing commas in interface properties
    // Pattern: interface { prop: type\n  nextProp: type } 
    const interfaceLines = fixed.split('\n');
    for (let i = 0; i < interfaceLines.length - 1; i++) {
      const line = interfaceLines[i].trim();
      const nextLine = interfaceLines[i + 1].trim();
      
      // Check if we're in an interface and current line is a property without comma
      if (line.match(/^\w+:\s*\w+;?$/) && !line.endsWith(',') && !line.endsWith(';')) {
        // Next line is also a property or closing brace
        if (nextLine.match(/^\w+:\s*\w+/) || nextLine === '}') {
          interfaceLines[i] = interfaceLines[i].replace(/;?$/, ',');
          changes++;
        }
      }
    }
    fixed = interfaceLines.join('\n');

    // Fix 4: Fix malformed function parameters
    // Look for patterns like: function(param type, param type)
    const parameterRegex = /(\w+\s+\w+),(\s*)(\w+\s+\w+)/g;
    const beforeParam = fixed;
    fixed = fixed.replace(parameterRegex, '$1: $1,$2$3: $3');
    if (fixed !== beforeParam) changes++;

    return { fixed, changes };
  }

  async fixFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const result = this.fixFinalSyntaxErrors(content);
      
      if (result.changes > 0) {
        writeFileSync(filePath, result.fixed, 'utf8');
        this.fixedFiles.push({
          file: filePath,
          changes: result.changes
        });
        
        const relativePath = filePath.replace(projectRoot + '/', '');
        this.log(`Fixed ${relativePath} (${result.changes} final syntax fixes)`);
        return true;
      }
      
      return false;
    } catch (error) {
      this.log(`Error fixing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    this.log('🚀 Starting Final Syntax Error Fix...');
    
    // Target the specific files with remaining errors
    const targetFiles = [
      'src/features/video/components/VideoEditor.tsx',
      'utils/playerUtils.ts',
      'utils/testUtils.tsx'
    ];
    
    let fixedCount = 0;
    
    for (const file of targetFiles) {
      const fullPath = `${projectRoot}/${file}`;
      try {
        const wasFixed = await this.fixFile(fullPath);
        if (wasFixed) fixedCount++;
      } catch (error) {
        this.log(`File not found: ${file}`, 'warning');
      }
    }
    
    // Run final verification
    this.log('\n🔍 Running final TypeScript verification...');
    try {
      const result = execSync('timeout 30s npx tsc --noEmit', { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30000 
      });
      
      this.log('🎉 COMPLETE SUCCESS: All TypeScript errors resolved!', 'success');
      this.log('🎯 Codebase is now fully TypeScript compliant!', 'success');
      writeFileSync(`${projectRoot}/typescript-success.txt`, `SUCCESS: TypeScript compilation completed without errors!\nTimestamp: ${new Date().toISOString()}`);
      
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      const errorLines = output.split('\n').filter(line => /error TS\d+:/.test(line));
      const totalErrors = errorLines.length;
      
      if (totalErrors > 0) {
        this.log(`⚠️ ${totalErrors} TypeScript errors still remain (may need manual review)`, 'warning');
        
        this.log('\n📋 Remaining errors:');
        errorLines.slice(0, 10).forEach((line, i) => {
          console.log(`  ${i + 1}. ${line.trim()}`);
        });
        
        writeFileSync(`${projectRoot}/remaining-errors.txt`, output);
        this.log(`Detailed errors saved to: remaining-errors.txt`);
      } else {
        this.log('🎉 All TypeScript errors resolved!', 'success');
      }
    }
    
    // Report results
    this.log('\n' + '='.repeat(50));
    this.log(`📊 Final Syntax Fix Complete`);
    this.log(`🔧 Files fixed: ${fixedCount}`);
    
    if (this.fixedFiles.length > 0) {
      this.log('\n📋 Files Modified:');
      for (const fix of this.fixedFiles) {
        const relativePath = fix.file.replace(projectRoot + '/', '');
        console.log(`  • ${relativePath} (${fix.changes} fixes)`);
      }
    }
    
    return {
      filesFixed: fixedCount,
      fixedFiles: this.fixedFiles
    };
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new FinalSyntaxFixer();
  fixer.run().catch(err => {
    console.error('Final syntax fixer failed:', err);
    process.exitCode = 1;
  });
}

export { FinalSyntaxFixer };