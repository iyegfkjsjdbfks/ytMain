#!/usr/bin/env node
/**
 * Comprehensive TypeScript syntax error fixer
 * Handles common patterns across the codebase
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class ComprehensiveSyntaxFixer {
  constructor() {
    this.fixedFiles = new Set();
    this.fixesApplied = 0;
  }

  log(message, type = 'info') {
    const prefix = { info: '🔧', success: '✅', error: '❌', warning: '⚠️' }[type] || '🔧';
    console.log(`${prefix} ${message}`);
  }

  getErrorCount() {
    try {
      const result = execSync('npm run type-check 2>&1', { 
        encoding: 'utf8', 
        stdio: 'pipe', 
        cwd: projectRoot 
      });
      return 0;
    } catch (err) {
      const output = `${err.stdout || ''}${err.stderr || ''}`;
      return output.split('\n').filter(line => /error TS(1005|1144|1128|1109|1434):/.test(line)).length;
    }
  }

  getAllTypeScriptFiles() {
    const files = [];
    
    const scanDir = (dir) => {
      const items = readdirSync(dir);
      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
          scanDir(fullPath);
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      }
    };
    
    scanDir(projectRoot);
    return files;
  }

  fixSyntaxPatterns(content) {
    let modified = false;
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const originalLine = line;
      
      // Pattern 1: Missing colon before return type
      // "async method(params) Promise<Type>" -> "async method(params): Promise<Type>"
      line = line.replace(/(\w+\([^)]*\))\s+Promise</g, '$1: Promise<');
      line = line.replace(/(\w+\([^)]*\))\s+([a-z]+)(<|\s*{)/g, '$1: $2$3');
      line = line.replace(/(\w+\([^)]*\))\s+([A-Z]\w*)(<|\s*{)/g, '$1: $2$3');
      line = line.replace(/(\w+\([^)]*\))\s+(string|number|boolean|void)(\s*{)/g, '$1: $2$3');
      
      // Pattern 2: Malformed return types (corrupted null)
      line = line.replace(/n={true}u={true}l={true}l/g, 'null');
      
      // Pattern 3: Extra semicolon in object literals
      line = line.replace(/,\s*{\s*;/g, ', {');
      line = line.replace(/\(\s*`[^`]*`,\s*{\s*;/g, (match) => match.replace(';', ''));
      
      // Pattern 4: Missing return type colon entirely
      line = line.replace(/(\w+\([^)]*\))\s+(void)\s*{/g, '$1: $2 {');
      
      if (line !== originalLine) {
        lines[i] = line;
        modified = true;
        this.fixesApplied++;
      }
    }
    
    return { content: lines.join('\n'), modified };
  }

  fixFile(filePath) {
    if (!existsSync(filePath)) {
      return false;
    }

    const content = readFileSync(filePath, 'utf8');
    const result = this.fixSyntaxPatterns(content);
    
    if (result.modified) {
      writeFileSync(filePath, result.content);
      this.fixedFiles.add(filePath);
      this.log(`Fixed ${filePath}`, 'success');
      return true;
    }
    
    return false;
  }

  run() {
    const initialCount = this.getErrorCount();
    this.log(`Found ${initialCount} syntax errors (TS1005, TS1144, TS1128, TS1109, TS1434)`);

    if (initialCount === 0) {
      this.log('No syntax errors found!', 'success');
      return;
    }

    // Get all TypeScript files
    const allFiles = this.getAllTypeScriptFiles();
    this.log(`Scanning ${allFiles.length} TypeScript files`);

    let fixedFileCount = 0;
    for (const filePath of allFiles) {
      if (this.fixFile(filePath)) {
        fixedFileCount++;
      }
    }

    const finalCount = this.getErrorCount();
    const improvement = initialCount - finalCount;

    this.log(`\n=== Comprehensive Syntax Fix Results ===`);
    this.log(`Initial errors: ${initialCount}`);
    this.log(`Final errors: ${finalCount}`);
    this.log(`Errors fixed: ${improvement}`);
    this.log(`Files scanned: ${allFiles.length}`);
    this.log(`Files modified: ${this.fixedFiles.size}`);
    this.log(`Individual fixes applied: ${this.fixesApplied}`);
    this.log(`Fix rate: ${initialCount > 0 ? ((improvement / initialCount) * 100).toFixed(1) : '0'}%`);

    if (improvement > 0) {
      this.log('Syntax errors successfully reduced!', 'success');
    } else if (finalCount <= initialCount) {
      this.log('Error count maintained (no increase)', 'success');
    } else {
      this.log('Warning: Error count increased', 'warning');
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new ComprehensiveSyntaxFixer();
  fixer.run();
}

export { ComprehensiveSyntaxFixer };