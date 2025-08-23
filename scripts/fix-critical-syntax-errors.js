#!/usr/bin/env node
/**
 * Critical Syntax Error Fixer
 * 
 * Targets the 72 TS1128/TS1005 errors that are blocking compilation
 * Focuses on import declaration syntax and duplicate imports
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { execSync } from 'child_process';

const projectRoot = process.cwd();

class CriticalSyntaxFixer {
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

  fixImportSyntax(content) {
    let fixed = content;
    let changes = 0;

    // Fix 1: Remove duplicate React imports and consolidate them
    const reactImportRegex = /import\s+(?:React\s*,?\s*)?\{([^}]*)\}\s+from\s+['"]react['"];?\s*/g;
    const reactDefaultRegex = /import\s+React(?:\s*,\s*\{[^}]*\})?\s+from\s+['"]react['"];?\s*/g;
    
    const reactImports = [...fixed.matchAll(reactImportRegex)];
    const reactDefaults = [...fixed.matchAll(reactDefaultRegex)];
    
    if (reactImports.length > 1 || (reactImports.length > 0 && reactDefaults.length > 0)) {
      // Collect all React imports
      const allImports = new Set();
      let hasReactDefault = false;
      
      // Check for React default import
      if (reactDefaults.length > 0 || fixed.includes('import React,') || fixed.includes('import React from')) {
        hasReactDefault = true;
      }
      
      // Collect named imports
      for (const match of reactImports) {
        const imports = match[1].split(',')
          .map(s => s.trim())
          .filter(s => s && s !== 'React');
        imports.forEach(imp => allImports.add(imp));
      }
      
      // Remove all React imports
      fixed = fixed.replace(reactImportRegex, '');
      fixed = fixed.replace(reactDefaultRegex, '');
      
      // Create consolidated import
      const importParts = [];
      if (hasReactDefault) importParts.push('React');
      if (allImports.size > 0) importParts.push(`{ ${Array.from(allImports).join(', ')} }`);
      
      if (importParts.length > 0) {
        const consolidatedImport = `import ${importParts.join(', ')} from 'react';\n`;
        fixed = consolidatedImport + fixed;
        changes++;
      }
    }

    // Fix 2: Clean up malformed import statements
    // Remove extra spaces in import destructuring
    fixed = fixed.replace(/import\s*\{\s*([^}]+)\s*,\s*\s+([^}]+)\s*\}/g, 'import { $1, $2 }');
    
    // Fix trailing commas in imports
    fixed = fixed.replace(/import\s*\{\s*([^}]+),\s*\}\s*from/g, 'import { $1 } from');
    
    // Fix missing semicolons on import statements
    const importLines = fixed.split('\n');
    for (let i = 0; i < importLines.length; i++) {
      const line = importLines[i].trim();
      if (line.startsWith('import ') && !line.endsWith(';') && line.includes(' from ')) {
        importLines[i] = importLines[i] + ';';
        changes++;
      }
    }
    fixed = importLines.join('\n');

    // Fix 3: Remove duplicate type imports
    const duplicateRegex = /import\s*\{\s*([^}]*ReactNode[^}]*)\s*\}\s*from\s*['"]react['"];\s*import\s*\{\s*([^}]*FC[^}]*)\s*\}\s*from\s*['"]react['"];/g;
    if (duplicateRegex.test(fixed)) {
      fixed = fixed.replace(duplicateRegex, (match, group1, group2) => {
        const allTypes = [...new Set([...group1.split(','), ...group2.split(',')].map(s => s.trim()).filter(s => s))];
        return `import { ${allTypes.join(', ')} } from 'react';`;
      });
      changes++;
    }

    // Fix 4: Handle malformed export statements
    fixed = fixed.replace(/export\s*\{\s*([^}]+)\s*,\s*\s+([^}]+)\s*\}/g, 'export { $1, $2 };');

    return { fixed, changes };
  }

  fixFileEncoding(filePath) {
    try {
      // Try to read as UTF-8 first
      let content = readFileSync(filePath, 'utf8');
      
      // Check for UTF-16 BOM or encoding issues
      if (content.includes('\uFEFF') || content.includes('\u0000')) {
        // Try reading as UTF-16
        content = readFileSync(filePath, 'utf16le');
        // Remove BOM
        content = content.replace(/^\uFEFF/, '');
        // Write back as UTF-8
        writeFileSync(filePath, content, 'utf8');
        return { fixed: true, content };
      }
      
      return { fixed: false, content };
    } catch (error) {
      this.log(`Failed to fix encoding for ${filePath}: ${error.message}`, 'error');
      return { fixed: false, content: null };
    }
  }

  async fixFile(filePath) {
    try {
      // First, fix encoding if needed
      const encodingResult = this.fixFileEncoding(filePath);
      if (!encodingResult.content) return false;
      
      let content = encodingResult.content;
      
      // Apply syntax fixes
      const result = this.fixImportSyntax(content);
      
      if (result.changes > 0 || encodingResult.fixed) {
        writeFileSync(filePath, result.fixed, 'utf8');
        this.fixedFiles.push({
          file: filePath,
          changes: result.changes,
          encodingFixed: encodingResult.fixed
        });
        
        const relativePath = filePath.replace(projectRoot, '');
        this.log(`Fixed ${relativePath} (${result.changes} syntax changes${encodingResult.fixed ? ', encoding fixed' : ''})`);
        return true;
      }
      
      return false;
    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      this.log(`Error fixing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    this.log('🚀 Starting Critical Syntax Error Fix...');
    
    // Get all TypeScript files
    const files = this.getAllTypeScriptFiles();
    this.log(`Found ${files.length} TypeScript files to process`);
    
    // Process files
    let fixedCount = 0;
    for (const file of files) {
      const wasFixed = await this.fixFile(file);
      if (wasFixed) fixedCount++;
    }
    
    // Report results
    this.log('\n' + '='.repeat(60));
    this.log(`📊 Critical Syntax Fix Complete`);
    this.log(`✅ Files processed: ${files.length}`);
    this.log(`🔧 Files fixed: ${fixedCount}`);
    this.log(`❌ Errors encountered: ${this.errors.length}`);
    
    if (this.fixedFiles.length > 0) {
      this.log('\n📋 Files Modified:');
      for (const fix of this.fixedFiles) {
        const relativePath = fix.file.replace(projectRoot, '');
        console.log(`  • ${relativePath} (${fix.changes} changes)`);
      }
    }
    
    if (this.errors.length > 0) {
      this.log('\n❌ Errors:');
      for (const error of this.errors) {
        const relativePath = error.file.replace(projectRoot, '');
        console.log(`  • ${relativePath}: ${error.error}`);
      }
    }
    
    // Verify results by running type check
    this.log('\n🔍 Verifying fixes...');
    try {
      execSync('npm run type-check', { stdio: 'pipe', timeout: 30000 });
      this.log('✅ Type check passed! All syntax errors resolved.', 'success');
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      const remainingErrors = (output.match(/error TS1128:|error TS1005:/g) || []).length;
      
      if (remainingErrors > 0) {
        this.log(`⚠️ ${remainingErrors} syntax errors remain. Manual review may be needed.`, 'warning');
      } else {
        this.log('✅ Syntax errors resolved! Other error types may remain.', 'success');
      }
    }
    
    return {
      filesProcessed: files.length,
      filesFixed: fixedCount,
      errors: this.errors.length,
      fixedFiles: this.fixedFiles
    };
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new CriticalSyntaxFixer();
  fixer.run().catch(err => {
    console.error('Critical syntax fixer failed:', err);
    process.exitCode = 1;
  });
}

export { CriticalSyntaxFixer };