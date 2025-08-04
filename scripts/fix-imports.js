#!/usr/bin/env node
/**
 * Import Statement Fixer
 * 
 * Fixes broken import statements caused by refactoring
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

class ImportFixer {
  constructor() {
    this.fixes = [];
  }

  log(message, type = 'info') {
    const prefix = type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} ${message}`);
    if (type === 'success') this.fixes.push(message);
  }

  findAllTypescriptFiles(dir = 'src') {
    const files = [];
    const fullPath = join(projectRoot, dir);
    
    if (!existsSync(fullPath)) return files;
    
    const entries = readdirSync(fullPath);
    for (const entry of entries) {
      const entryPath = join(fullPath, entry);
      const stat = statSync(entryPath);
      
      if (stat.isDirectory() && !entry.startsWith('.')) {
        files.push(...this.findAllTypescriptFiles(join(dir, entry)));
      } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
        files.push(entryPath);
      }
    }
    
    return files;
  }

  fixImportStatements(filePath) {
    let content = readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix missing 'import' keyword at beginning of lines
    content = content.replace(/^import\s*{\s*\n([^}]*?)(\n\s*}\s*from\s+['""][^'"]*['"'];?)/gm, 
      (match, middle, ending) => {
        const cleanMiddle = middle.trim().replace(/^\s*(.*?)\s*$/, '$1');
        return `import {\n  ${cleanMiddle}${ending}`;
      }
    );
    
    // Fix lines that start with } from without proper import
    content = content.replace(/^(\s*[^}]*?)\s*}\s*from\s+(['""][^'"]*['"']);?$/gm, 
      (match, beforeBrace, fromPart) => {
        if (!beforeBrace.includes('import')) {
          return `import { ${beforeBrace.trim()} } from ${fromPart};`;
        }
        return match;
      }
    );
    
    // Fix spread operator syntax errors
    content = content.replace(/\.\.\.(\w+):\s*any\[\]/g, '...$1');
    
    // Fix optional chaining syntax errors  
    content = content.replace(/(\w+)\?\?\._(\w+)/g, '$1?.$2');
    
    // Fix specific patterns that got broken
    const fixes = [
      // Fix import React missing
      [/^(\s*)import\s*{\s*(\w+)/gm, '$1import React from "react";\nimport { $2'],
      
      // Fix import statements that lost the import keyword
      [/^(\s*){\s*([^}]+)\s*}\s*from\s*(['""][^'"]*['"']);?$/gm, '$1import { $2 } from $3;'],
      
      // Fix type import statements
      [/^(\s*)type\s+(\w+),?$/gm, '$1  type $2,'],
    ];
    
    for (const [pattern, replacement] of fixes) {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    }
    
    if (modified) {
      writeFileSync(filePath, content);
      return true;
    }
    
    return false;
  }

  async run() {
    this.log('🚀 Starting import statement fixes...');
    
    // Fix TypeScript files in src
    const tsFiles = this.findAllTypescriptFiles('src');
    
    for (const filePath of tsFiles) {
      if (this.fixImportStatements(filePath)) {
        this.log(`Fixed imports in ${filePath.replace(projectRoot, '.')}`);
      }
    }
    
    // Fix utils files
    const utilFiles = this.findAllTypescriptFiles('utils');
    for (const filePath of utilFiles) {
      if (this.fixImportStatements(filePath)) {
        this.log(`Fixed imports in ${filePath.replace(projectRoot, '.')}`);
      }
    }
    
    this.log(`🎉 Import fixes completed! Fixed ${this.fixes.length} files`);
  }
}

const fixer = new ImportFixer();
fixer.run().catch(console.error);