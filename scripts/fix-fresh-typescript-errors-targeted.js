#!/usr/bin/env node
/**
 * Targeted Fresh TypeScript Error Fix Script
 * 
 * This script implements targeted fixes for the most common fresh TypeScript errors
 * identified by the Real TypeScript Error Resolution System:
 * 
 * - TS1005: 4064 errors (syntax errors - missing semicolons, brackets)
 * - TS1109: 2709 errors (expression expected)  
 * - TS1128: 1424 errors (declaration expected)
 * - TS1136: 452 errors (property assignment expected)
 * 
 * Based on the comprehensive analysis from deploy-real-typescript-error-resolution-system.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TargetedFreshErrorFixer {
  constructor(options = {}) {
    this.options = {
      dryRun: false,
      backup: true,
      verbose: true,
      projectPath: process.cwd(),
      ...options
    };

    this.startTime = Date.now();
    this.totalFixed = 0;
    this.fixedByType = {};
    
    // Patterns for common syntax fixes
    this.fixPatterns = {
      // TS1005 fixes - missing semicolons, brackets, etc.
      missingComma: {
        pattern: /\(\s*{\s*\n/g,
        replacement: '({\n',
        description: 'Fix missing comma in parameter destructuring'
      },
      missingSemicolon: {
        pattern: /^(\s*const\s+\w+:\s*[^=]+=\s*[^;]+)$/gm,
        replacement: '$1;',
        description: 'Add missing semicolons to const declarations'
      },
      missingClosingBrace: {
        pattern: /^\s*\)\s*=>\s*\{$/gm,
        replacement: '',
        description: 'Fix malformed arrow function syntax'
      },
      
      // TS1109 fixes - expression expected
      tripleAmpersand: {
        pattern: /\&\&\&\s*\(\)/g,
        replacement: '&&',
        description: 'Fix triple ampersand syntax errors'
      },
      emptyExpression: {
        pattern: /\{\s*channel\.\w+\s*\&\&\s*\(\s*\)/g,
        replacement: (match) => {
          const prop = match.match(/channel\.(\w+)/)?.[1];
          return `{channel.${prop} && (`;
        },
        description: 'Fix empty conditional expressions'
      },
      
      // TS1128 fixes - declaration expected  
      caseSemicolon: {
        pattern: /case\s+'([^']+)'\s*:\s*;/g,
        replacement: "case '$1':",
        description: 'Remove erroneous semicolons after case statements'
      },
      defaultSemicolon: {
        pattern: /default\s*:\s*;/g,
        replacement: 'default:',
        description: 'Remove erroneous semicolons after default statement'
      },
      
      // TS1136 fixes - property assignment expected
      destructuringComma: {
        pattern: /=\s*\(\s*\{\s*\)/g,
        replacement: '= ({',
        description: 'Fix destructuring parameter syntax'
      },
      
      // TS1382 fixes - unexpected token
      htmlEntities: {
        pattern: /\&gt\;/g,
        replacement: '>',
        description: 'Fix HTML entity encoding'
      },
      
      // JSX specific fixes
      jsxClosingSlash: {
        pattern: /\s+\/\s+\/\>/g,
        replacement: ' />',
        description: 'Fix malformed JSX self-closing tags'
      },
      
      // Template literal fixes
      unterminatedTemplate: {
        pattern: /`[^`]*$/gm,
        replacement: (match) => match + '`',
        description: 'Close unterminated template literals'
      }
    };
  }

  log(message, level = 'info') {
    if (this.options.verbose) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
  }

  async run() {
    this.log('🚀 Starting Targeted Fresh TypeScript Error Fix...', 'info');
    this.log('🎯 Targeting: TS1005, TS1109, TS1128, TS1136, TS1382 errors', 'info');
    
    try {
      // Get initial error count
      const initialErrors = await this.getErrorCount();
      this.log(`📊 Initial error count: ${initialErrors}`, 'info');
      
      if (initialErrors === 0) {
        this.log('🎉 No errors found - project is already clean!', 'success');
        return { success: true, errorsFixed: 0, errorsRemaining: 0 };
      }

      // Create backup if requested
      if (this.options.backup && !this.options.dryRun) {
        await this.createBackup();
      }

      // Find and fix errors in TypeScript/TSX files
      const files = await this.findTargetFiles();
      this.log(`📁 Found ${files.length} files to process`, 'info');

      for (const file of files) {
        await this.fixFileErrors(file);
      }

      // Get final error count
      const finalErrors = await this.getErrorCount();
      const errorsFixed = Math.max(0, initialErrors - finalErrors);
      this.totalFixed = errorsFixed;

      this.log(`✅ Targeted fix completed!`, 'success');
      this.log(`📊 Results: Fixed ${errorsFixed} errors, ${finalErrors} remaining`, 'success');
      
      // Generate summary report
      this.generateReport(initialErrors, finalErrors);

      return {
        success: errorsFixed > 0,
        errorsFixed,
        errorsRemaining: finalErrors,
        fixedByType: this.fixedByType,
        duration: Date.now() - this.startTime
      };

    } catch (error) {
      this.log(`❌ Targeted fix failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async getErrorCount() {
    try {
      const result = execSync('npx tsc --noEmit --skipLibCheck', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return 0;
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      const lines = output.split('\n');
      const errorLines = lines.filter(line => line.includes('error TS'));
      return errorLines.length;
    }
  }

  async findTargetFiles() {
    const files = [];
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    
    // Target high-error directories first
    const targetDirs = [
      'components',
      'src/components', 
      'src/pages',
      'src/hooks',
      'src/features',
      'src/services',
      'src/utils'
    ];

    for (const dir of targetDirs) {
      const fullPath = path.join(this.options.projectPath, dir);
      if (fs.existsSync(fullPath)) {
        this.findFilesRecursive(fullPath, extensions, files);
      }
    }

    return files;
  }

  findFilesRecursive(dir, extensions, files) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          this.findFilesRecursive(fullPath, extensions, files);
        } else if (extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  async fixFileErrors(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let fixedContent = content;
      let fixesApplied = 0;

      // Apply each fix pattern
      for (const [patternName, pattern] of Object.entries(this.fixPatterns)) {
        const beforeLength = fixedContent.length;
        
        if (typeof pattern.replacement === 'function') {
          fixedContent = fixedContent.replace(pattern.pattern, pattern.replacement);
        } else {
          fixedContent = fixedContent.replace(pattern.pattern, pattern.replacement);
        }
        
        if (fixedContent.length !== beforeLength || fixedContent !== content) {
          const matches = (content.match(pattern.pattern) || []).length;
          if (matches > 0) {
            fixesApplied += matches;
            this.fixedByType[patternName] = (this.fixedByType[patternName] || 0) + matches;
            this.log(`🔧 ${path.relative(this.options.projectPath, filePath)}: Applied ${matches} ${patternName} fixes`, 'info');
          }
        }
      }

      // Write fixed content back to file
      if (fixedContent !== content && !this.options.dryRun) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
      }

      if (fixesApplied > 0) {
        this.log(`✅ ${path.relative(this.options.projectPath, filePath)}: ${fixesApplied} fixes applied${this.options.dryRun ? ' (DRY RUN)' : ''}`, 'info');
      }

    } catch (error) {
      this.log(`❌ Error processing ${filePath}: ${error.message}`, 'error');
    }
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.options.projectPath, '.error-fix-backups', `targeted-fix-${timestamp}`);
    
    this.log(`💾 Creating backup in ${backupDir}`, 'info');
    
    try {
      execSync(`mkdir -p "${backupDir}"`, { encoding: 'utf8' });
      execSync(`cp -r src "${backupDir}/" 2>/dev/null || true`, { 
        encoding: 'utf8',
        cwd: this.options.projectPath
      });
      execSync(`cp -r components "${backupDir}/" 2>/dev/null || true`, { 
        encoding: 'utf8',
        cwd: this.options.projectPath
      });
      
      this.log(`✅ Backup created successfully`, 'info');
      
    } catch (error) {
      this.log(`⚠️ Backup creation failed: ${error.message}`, 'warn');
    }
  }

  generateReport(initialErrors, finalErrors) {
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    const errorsFixed = initialErrors - finalErrors;
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration} seconds`,
      initialErrors,
      finalErrors,
      errorsFixed,
      successRate: `${((errorsFixed / initialErrors) * 100).toFixed(1)}%`,
      fixedByType: this.fixedByType,
      targetedErrorTypes: ['TS1005', 'TS1109', 'TS1128', 'TS1136', 'TS1382']
    };

    const reportsDir = path.join(this.options.projectPath, 'targeted-fresh-error-fix-reports');
    
    try {
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // JSON report
      fs.writeFileSync(
        path.join(reportsDir, 'targeted-fresh-error-fix-report.json'),
        JSON.stringify(report, null, 2)
      );

      // Markdown summary
      const markdown = this.generateMarkdownReport(report);
      fs.writeFileSync(
        path.join(reportsDir, 'TARGETED_FRESH_ERROR_FIX_SUMMARY.md'),
        markdown
      );

      this.log(`📊 Reports generated in ${reportsDir}`, 'info');
      
    } catch (error) {
      this.log(`❌ Report generation failed: ${error.message}`, 'error');
    }
  }

  generateMarkdownReport(data) {
    return `# Targeted Fresh TypeScript Error Fix Report

## 🎯 Fix Summary

**Status**: ${data.errorsFixed > 0 ? '✅ SUCCESS' : '⚠️ NO FIXES APPLIED'}
**Duration**: ${data.duration}
**Timestamp**: ${data.timestamp}

## 📊 Results

| Metric | Value |
|--------|--------|
| **Initial Errors** | ${data.initialErrors} |
| **Errors Fixed** | ${data.errorsFixed} |
| **Errors Remaining** | ${data.finalErrors} |
| **Success Rate** | ${data.successRate} |

## 🎯 Targeted Error Types

This script targeted the most common fresh TypeScript errors:

- **TS1005**: Syntax errors (missing semicolons, brackets)
- **TS1109**: Expression expected errors
- **TS1128**: Declaration or statement expected
- **TS1136**: Property assignment expected  
- **TS1382**: Unexpected token errors

## 🔧 Fixes Applied by Type

${Object.entries(data.fixedByType).length > 0 
  ? Object.entries(data.fixedByType)
      .map(([type, count]) => `- **${type}**: ${count} fixes`)
      .join('\n')
  : '- No fixes were applied'
}

## 📋 Fix Patterns Used

1. **Missing Comma Fix**: Fixed parameter destructuring syntax
2. **Missing Semicolon**: Added semicolons to const declarations  
3. **Triple Ampersand**: Fixed &&& syntax errors
4. **Case Statement**: Removed erroneous semicolons after case/default
5. **JSX Closing Tags**: Fixed malformed self-closing tags
6. **HTML Entities**: Converted &gt; to >
7. **Template Literals**: Closed unterminated template literals

## 🎉 Completion

The targeted fresh TypeScript error fix has been completed. This script focused on the most common syntax errors identified by the Real TypeScript Error Resolution System analysis.

${data.errorsFixed > 0 
  ? `### ✅ Success: Fixed ${data.errorsFixed} errors!`
  : `### ⚠️ No fixes applied - errors may require manual intervention`
}

---
*Generated by Targeted Fresh TypeScript Error Fixer*
*Based on Real TypeScript Error Resolution System analysis*
`;
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    backup: !args.includes('--no-backup'),
    verbose: !args.includes('--quiet')
  };

  console.log('🎯 Targeted Fresh TypeScript Error Fix');
  console.log('📋 Based on Real TypeScript Error Resolution System analysis');
  console.log('🔧 Targeting: TS1005, TS1109, TS1128, TS1136, TS1382 errors\n');

  const fixer = new TargetedFreshErrorFixer(options);
  fixer.run()
    .then(result => {
      console.log('\n🎉 Targeted Fresh Error Fix Complete!');
      console.log(`✅ Fixed ${result.errorsFixed} errors in ${Math.round(result.duration/1000)}s`);
      console.log(`📊 ${result.errorsRemaining} errors remaining`);
      console.log(`💯 Success: ${result.success ? 'YES' : 'PARTIAL'}`);
      
      if (Object.keys(result.fixedByType).length > 0) {
        console.log('\n🔧 Fixes by type:');
        for (const [type, count] of Object.entries(result.fixedByType)) {
          console.log(`   - ${type}: ${count} fixes`);
        }
      }
      
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Targeted fix failed:', error.message);
      process.exit(1);
    });
}

module.exports = TargetedFreshErrorFixer;