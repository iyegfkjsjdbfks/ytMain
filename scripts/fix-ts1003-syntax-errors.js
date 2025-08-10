#!/usr/bin/env node
/**
 * Fix TypeScript TS1003 "Identifier expected" errors
 * Fixes incorrect type assertion syntax
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class SyntaxErrorFixer {
  constructor() {
    this.fixedCount = 0;
  }

  getTypeScriptErrors() {
    try {
      execSync('npm run type-check', { encoding: 'utf8', stdio: 'pipe', cwd: projectRoot });
      return [];
    } catch (error) {
      const output = error.stdout + error.stderr;
      const lines = output.split('\n');
      const errors = [];
      
      for (const line of lines) {
        const match = line.match(/(.+?)\((\d+),(\d+)\): error TS1003: Identifier expected/);
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3])
          });
        }
      }
      
      return errors;
    }
  }

  fixSyntaxError(filePath, error) {
    const fullPath = join(projectRoot, filePath);
    if (!existsSync(fullPath)) {
      console.log(`File not found: ${fullPath}`);
      return false;
    }

    const content = readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    
    if (error.line > lines.length) {
      return false;
    }

    const line = lines[error.line - 1];
    let newLine = line;
    
    // Fix incorrect type assertion syntax patterns
    // Pattern 1: object.(property as type) -> (object.property as type)
    newLine = newLine.replace(/(\w+)\.(\([\w\s]+\s+as\s+[\w]+\))/g, '($1.$2)');
    
    // Pattern 2: Specific fix for the common pattern
    // channel.(subscriberCount as string) -> (channel.subscriberCount as string)
    newLine = newLine.replace(/(\w+)\.\((\w+)\s+as\s+(\w+)\)/g, '($1.$2 as $3)');
    
    // Pattern 3: Fix nested property access with type assertion
    // video.(views as string).includes -> (video.views as string).includes
    newLine = newLine.replace(/(\w+)\.\((\w+)\s+as\s+(\w+)\)\.(\w+)/g, '($1.$2 as $3).$4');
    
    if (newLine !== line) {
      lines[error.line - 1] = newLine;
      writeFileSync(fullPath, lines.join('\n'), 'utf8');
      this.fixedCount++;
      console.log(`Fixed: ${filePath}:${error.line}`);
      return true;
    }

    return false;
  }

  async run() {
    console.log('🔍 Analyzing TS1003 syntax errors...');
    
    // Get all syntax errors
    const errors = this.getTypeScriptErrors();
    console.log(`Found ${errors.length} syntax errors`);
    
    // Group errors by file
    const errorsByFile = {};
    for (const error of errors) {
      if (!errorsByFile[error.file]) {
        errorsByFile[error.file] = [];
      }
      errorsByFile[error.file].push(error);
    }
    
    // Fix errors file by file
    for (const [file, fileErrors] of Object.entries(errorsByFile)) {
      console.log(`Fixing ${fileErrors.length} errors in ${file}`);
      
      // Sort errors by line number in reverse to avoid line number shifts
      fileErrors.sort((a, b) => b.line - a.line);
      
      for (const error of fileErrors) {
        this.fixSyntaxError(file, error);
      }
    }
    
    console.log(`✅ Fixed ${this.fixedCount} syntax errors`);
    
    // Run type check again to verify
    try {
      execSync('npm run type-check', { encoding: 'utf8', stdio: 'pipe', cwd: projectRoot });
      console.log('✅ No more TS1003 errors!');
    } catch (error) {
      const output = error.stdout + error.stderr;
      const remainingErrors = (output.match(/error TS1003:/g) || []).length;
      if (remainingErrors > 0) {
        console.log(`⚠️ ${remainingErrors} TS1003 errors remaining`);
        
        // Try a more aggressive fix
        console.log('Attempting more aggressive fixes...');
        this.aggressiveFix();
      }
    }
  }

  aggressiveFix() {
    // List of files with known syntax errors
    const filesToFix = [
      'components/VideoDescription.tsx',
      'components/VideoPlaybackDetails.tsx',
      'pages/SubscriptionsPage.tsx',
      'pages/WatchPage.tsx'
    ];

    for (const file of filesToFix) {
      const fullPath = join(projectRoot, file);
      if (!existsSync(fullPath)) continue;

      let content = readFileSync(fullPath, 'utf8');
      
      // Fix all occurrences of incorrect type assertion patterns
      // Fix pattern: something.(property as type) -> (something.property as type)
      content = content.replace(/(\w+)\.\((\w+)\s+as\s+string\)/g, '($1.$2 as string)');
      content = content.replace(/(\w+)\.\((\w+)\s+as\s+number\)/g, '($1.$2 as number)');
      content = content.replace(/(\w+)\.\((\w+)\s+as\s+any\)/g, '($1.$2 as any)');
      
      // Fix pattern with method calls after type assertion
      content = content.replace(/(\w+)\.\((\w+)\s+as\s+string\)\.(\w+)/g, '($1.$2 as string).$3');
      content = content.replace(/(\w+)\.\((\w+)\s+as\s+number\)\.(\w+)/g, '($1.$2 as number).$3');
      
      writeFileSync(fullPath, content, 'utf8');
      console.log(`Aggressively fixed: ${file}`);
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('fix-ts1003-syntax-errors.js')) {
  const fixer = new SyntaxErrorFixer();
  fixer.run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}

export { SyntaxErrorFixer };
