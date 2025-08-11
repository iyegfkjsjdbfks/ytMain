#!/usr/bin/env node

/**
 * Focused TS1005 Fixer for Remaining Syntax Errors
 * 
 * Targets the specific pattern of malformed type annotations:
 * - variable: any = value: any; (should be variable: any = value;)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class FocusedTS1005Fixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
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
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  fixMalformedTypeAnnotations(content) {
    let fixed = content;
    let fixCount = 0;

    // Fix pattern: variable: any = value: any;
    // Should be: variable: any = value;
    const malformedAssignmentRegex = /([\\w._]+)\\s*:\\s*any\\s*=\\s*([^:;]+)\\s*:\\s*any\\s*;/g;
    fixed = fixed.replace(malformedAssignmentRegex, (match, variable, value) => {
      fixCount++;
      return `${variable}: any = ${value.trim()};`;
    });

    // Fix pattern: condition.value: any;  
    // Should be: condition.value;
    const malformedComparisonRegex = /([\\w._]+\\.value)\\s*:\\s*any\\s*;/g;
    fixed = fixed.replace(malformedComparisonRegex, (match, property) => {
      fixCount++;
      return `${property};`;
    });

    // Fix pattern: _threshold.value: any;
    // Should be: _threshold.value;
    const malformedPropertyAccessRegex = /([\\w._]+)\\s*:\\s*any\\s*;/g;
    fixed = fixed.replace(malformedPropertyAccessRegex, (match, property) => {
      // Only fix if this looks like a property access (contains a dot)
      if (property.includes('.')) {
        fixCount++;
        return `${property};`;
      }
      return match;
    });

    return { content: fixed, fixes: fixCount };
  }

  fixSingleFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const result = this.fixMalformedTypeAnnotations(content);

      // Only write if changes were made
      if (result.fixes > 0) {
        writeFileSync(filePath, result.content, 'utf8');
        this.log(`Fixed ${result.fixes} malformed type annotations in ${filePath}`, 'success');
        this.fixedFiles++;
        this.totalFixes += result.fixes;
      }

      return result.fixes;
    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      this.log(`Error fixing ${filePath}: ${error.message}`, 'error');
      return 0;
    }
  }

  async run() {
    this.log('🎯 Starting Focused TS1005 Fixer for remaining syntax errors...');
    
    // Target the specific file we know has issues
    const targetFile = join(projectRoot, 'utils/featureFlagSystem.ts');
    
    this.log(`🔧 Fixing malformed type annotations in: ${targetFile}`);
    
    const fixes = this.fixSingleFile(targetFile);
    
    // Summary
    this.log('\\n' + '='.repeat(60));
    this.log('📋 FOCUSED TS1005 FIXER SUMMARY');
    this.log('='.repeat(60));
    this.log(`📄 Files processed: 1`);
    this.log(`✅ Files modified: ${this.fixedFiles}`);
    this.log(`🔧 Total fixes applied: ${this.totalFixes}`);
    this.log(`❌ Errors encountered: ${this.errors.length}`);

    if (this.errors.length > 0) {
      this.log('\\n🚨 Errors:');
      this.errors.forEach(({ file, error }) => {
        this.log(`  - ${file}: ${error}`, 'error');
      });
    }

    if (this.totalFixes > 0) {
      this.log(`\\n✨ Successfully fixed ${this.totalFixes} malformed type annotations!`, 'success');
    } else {
      this.log(`\\n⚠️  No malformed type annotations found to fix.`, 'warning');
    }
    
    return {
      filesProcessed: 1,
      filesModified: this.fixedFiles,
      totalFixes: this.totalFixes,
      errors: this.errors.length
    };
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new FocusedTS1005Fixer();
  fixer.run().catch(err => {
    console.error('FocusedTS1005Fixer failed:', err);
    process.exitCode = 1;
  });
}

export { FocusedTS1005Fixer };
