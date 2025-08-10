#!/usr/bin/env node
/**
 * Import Syntax Fixer - Fixes malformed import statements
 * Specifically targets the issue where 'import React from 'react';' is embedded inside other imports
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class ImportSyntaxFixer {
  constructor() {
    this.fixedFiles = [];
    this.errors = [];
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

  findTsxFiles(directory) {
    const files = [];
    
    const scan = (dir) => {
      try {
        const items = readdirSync(dir);
        for (const item of items) {
          const fullPath = join(dir, item);
          const stat = statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            scan(fullPath);
          } else if (stat.isFile() && item.endsWith('.tsx')) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        this.log(`Error scanning directory ${dir}: ${error.message}`, 'warning');
      }
    };
    
    scan(directory);
    return files;
  }

  fixImportSyntax(content, filePath) {
    const lines = content.split('\n');
    let modified = false;
    let inImportBlock = false;
    let importBlockStart = -1;
    let fixedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Detect start of import block
      if (trimmedLine.startsWith('import {') && !trimmedLine.includes('}')) {
        inImportBlock = true;
        importBlockStart = i;
      }

      // Check for embedded React import within import block
      if (inImportBlock && trimmedLine === "import React from 'react';") {
        this.log(`Found embedded React import in ${filePath} at line ${i + 1}`, 'info');
        
        // Skip this line (remove the embedded import)
        modified = true;
        continue;
      }

      // Detect end of import block
      if (inImportBlock && trimmedLine.includes('} from')) {
        inImportBlock = false;
        
        // If we had an embedded React import, add the proper React import before this import block
        if (modified && importBlockStart >= 0) {
          // Find a good place to insert the React import (before the import block)
          let insertIndex = importBlockStart;
          
          // Look backwards to find a good insertion point (after any existing imports or comments)
          while (insertIndex > 0) {
            const prevLine = lines[insertIndex - 1].trim();
            if (prevLine === '' || prevLine.startsWith('//') || prevLine.startsWith('import')) {
              insertIndex--;
            } else {
              break;
            }
          }
          
          // Add React import if not already present
          const reactImportExists = fixedLines.some(l => 
            l.trim().startsWith("import React from 'react'") || 
            l.trim().startsWith('import React,')
          );
          
          if (!reactImportExists) {
            fixedLines.splice(insertIndex, 0, "import React from 'react';");
            this.log(`Added React import to ${filePath}`, 'success');
          }
        }
      }

      fixedLines.push(line);
    }

    return { content: fixedLines.join('\n'), modified };
  }

  async fixFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const { content: fixedContent, modified } = this.fixImportSyntax(content, filePath);

      if (modified) {
        writeFileSync(filePath, fixedContent, 'utf8');
        this.fixedFiles.push(filePath);
        this.log(`Fixed import syntax in: ${filePath}`, 'success');
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
    this.log('🚀 Starting import syntax fixing...');

    // Find all TypeScript React files
    const tsxFiles = this.findTsxFiles(projectRoot);
    this.log(`Found ${tsxFiles.length} TSX files to check`);

    let fixedCount = 0;

    for (const file of tsxFiles) {
      const wasFixed = await this.fixFile(file);
      if (wasFixed) {
        fixedCount++;
      }
    }

    // Summary
    this.log('\n' + '='.repeat(60));
    this.log('📊 IMPORT SYNTAX FIXING SUMMARY');
    this.log('='.repeat(60));
    this.log(`📁 Files checked: ${tsxFiles.length}`);
    this.log(`✨ Files fixed: ${fixedCount}`);
    this.log(`❌ Errors encountered: ${this.errors.length}`);

    if (this.fixedFiles.length > 0) {
      this.log('\n📝 Fixed files:');
      for (const file of this.fixedFiles) {
        this.log(`  • ${file.replace(projectRoot, '.')}`);
      }
    }

    if (this.errors.length > 0) {
      this.log('\n⚠️ Errors:');
      for (const error of this.errors) {
        this.log(`  • ${error.file}: ${error.error}`, 'error');
      }
    }

    this.log(`\n🎉 Import syntax fixing completed! Fixed ${fixedCount} files.`, 'success');
    return fixedCount;
  }
}

// Execute if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     import.meta.url.endsWith(process.argv[1]) ||
                     process.argv[1].endsWith('fix-import-syntax.js');

if (isMainModule) {
  const fixer = new ImportSyntaxFixer();
  fixer.run().catch(err => {
    console.error('ImportSyntaxFixer failed:', err);
    process.exitCode = 1;
  });
}

export { ImportSyntaxFixer };