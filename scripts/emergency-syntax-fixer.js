#!/usr/bin/env node
/**
 * Emergency Syntax Fixer
 * 
 * This script targets the specific syntax errors that are blocking compilation:
 * 1. Malformed import statements
 * 2. Incomplete JSX elements 
 * 3. Malformed comments (// FIXED: patterns)
 * 4. Missing closing tags and brackets
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class EmergencySyntaxFixer {
  constructor() {
    this.fixedFiles = new Set();
    this.log('🚨 Emergency Syntax Fixer initialized');
  }

  log(message, type = 'info') {
    const colors = { info: '\x1b[36m', success: '\x1b[32m', error: '\x1b[31m', reset: '\x1b[0m' };
    const prefix = { info: '🔧', success: '✅', error: '❌' }[type] || '🔧';
    console.log(`${colors[type]}${prefix} ${message}${colors.reset}`);
  }

  getCurrentErrors() {
    try {
      execSync('npm run type-check 2>&1', {
        encoding: 'utf8', stdio: 'pipe', cwd: projectRoot, timeout: 30000
      });
      return [];
    } catch (error) {
      const output = `${error.stdout || ''}${error.stderr || ''}`;
      return this.parseErrors(output);
    }
  }

  parseErrors(output) {
    const errors = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);
      if (match) {
        const [, file, lineNum, column, code, message] = match;
        errors.push({
          file: file.trim(),
          line: parseInt(lineNum),
          column: parseInt(column),
          code, message: message.trim()
        });
      }
    }
    return errors;
  }

  fixFile(filePath) {
    if (!existsSync(filePath)) return false;

    try {
      let content = readFileSync(filePath, 'utf8');
      const originalContent = content;

      // Fix 1: Malformed import statements (like the AdvancedVideoPlayer issue)
      content = content.replace(
        /import.*?\{\s*([^}]*?)\s*Cog6\s*ToothIcon/g,
        'import { $1 Cog6ToothIcon'
      );

      // Fix 2: Remove malformed // FIXED: comment patterns and restore proper syntax
      content = content.replace(/\/\/\s*FIXED:\s*(.*?)$/gm, '$1');
      
      // Fix 3: Fix incomplete JSX elements with missing closing syntax
      // Pattern: <element /> followed by incorrect structure
      content = content.replace(/<(\w+)\s*\/>\s*\/\/[^}]*?\}$/gm, '<$1>');
      
      // Fix 4: Fix malformed string interpolations in className
      content = content.replace(/className=\{\s*`[^`]*?\$\{\s*\/>/g, (match) => {
        // This is a malformed template literal, let's fix it
        return match.replace(/\$\{\s*\/>/, '');
      });

      // Fix 5: Fix unterminated regular expressions
      content = content.replace(/\/\/\s*([^\/\n]*?)$/gm, '/$1/');

      // Fix 6: Fix missing closing brackets in JSX
      content = content.replace(/\{\s*([^}]*?)$\n/gm, '{$1}\n');

      // Fix 7: Fix malformed JSX attributes
      content = content.replace(/(\w+)=\{\s*\/>/g, '$1=""');

      // Fix 8: Fix incomplete JSX elements that should be self-closing
      content = content.replace(/<(\w+)\s*\/>\s*$/gm, '<$1 />');

      // Fix 9: Fix specific patterns found in the errors
      
      // Fix the BaseForm.tsx issue - restore proper JSX structure
      content = content.replace(
        /\{\s*showResetButton\s*&&\s*\(\s*<button[^>]*>\s*.*?{resetLabel}\s*\)\s*\}\s*\)\s*;\s*\}/g,
        `{showResetButton && (
          <button
            type="button"
            onClick={() => {
              reset();
              setTouched({});
            }}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {resetLabel}
          </button>
        )}
      </div>
    </form>
  );
};`
      );

      // Fix 10: Fix CommentsSection.tsx specific issues
      content = content.replace(
        /className=\{\s*`text-xs \$\{\s*\/>/g,
        'className={`text-xs ${'
      );

      // Fix 11: Add missing closing tags for incomplete JSX
      const openTags = content.match(/<(\w+)[^>]*>/g) || [];
      const closeTags = content.match(/<\/(\w+)>/g) || [];
      
      // Basic JSX structure repair
      content = content.replace(/(<(\w+)[^>]*>)[^<]*?\/\/\s*FIXED:[^<]*?<\/\2>/g, '$1</$2>');

      // Fix 12: Repair broken template literals and expressions
      content = content.replace(/\$\{\s*\/>/g, '}');
      content = content.replace(/`\s*\/>/g, '`');

      if (content !== originalContent) {
        writeFileSync(filePath, content);
        this.fixedFiles.add(filePath);
        this.log(`Fixed syntax issues in ${filePath.replace(projectRoot, '.')}`);
        return true;
      }

      return false;
    } catch (error) {
      this.log(`Error fixing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    this.log('🚨 Starting Emergency Syntax Fixing...');
    
    const initialErrors = this.getCurrentErrors();
    this.log(`Found ${initialErrors.length} TypeScript errors`);

    if (initialErrors.length === 0) {
      this.log('No errors found!', 'success');
      return;
    }

    // Get unique files with errors
    const errorFiles = [...new Set(initialErrors.map(e => e.file))];
    this.log(`Processing ${errorFiles.length} files with errors...`);

    let totalFixed = 0;
    for (const filePath of errorFiles) {
      if (this.fixFile(filePath)) {
        totalFixed++;
      }
    }

    this.log(`Processed ${totalFixed} files`);

    // Check final error count
    const finalErrors = this.getCurrentErrors();
    const improvement = initialErrors.length - finalErrors.length;

    this.log(`\n📊 EMERGENCY FIX RESULTS:`);
    this.log(`Initial errors: ${initialErrors.length}`);
    this.log(`Final errors: ${finalErrors.length}`);
    this.log(`Errors fixed: ${improvement}`);
    this.log(`Files modified: ${this.fixedFiles.size}`);

    if (finalErrors.length === 0) {
      this.log('🎉 ALL SYNTAX ERRORS FIXED!', 'success');
    } else if (improvement > 0) {
      this.log(`✅ Progress made! ${improvement} errors fixed`, 'success');
    } else {
      this.log('⚠️ No improvement detected - may need manual intervention');
    }

    // If there are still errors, show a sample for analysis
    if (finalErrors.length > 0) {
      this.log('\n🔍 REMAINING ERRORS (sample):');
      finalErrors.slice(0, 5).forEach(error => {
        this.log(`  ${error.file}(${error.line}): ${error.code} - ${error.message}`);
      });
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new EmergencySyntaxFixer();
  fixer.run().catch(err => {
    console.error('❌ Emergency fix failed:', err.message);
    process.exitCode = 1;
  });
}

export { EmergencySyntaxFixer };