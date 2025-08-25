#!/usr/bin/env node
/**
 * Conservative Fresh TypeScript Error Fix Script
 * 
 * This script implements conservative, highly targeted fixes for specific
 * TypeScript error patterns based on the Real TypeScript Error Resolution System analysis.
 * 
 * Focus: Only the safest, most reliable fixes to avoid introducing new errors.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ConservativeFreshErrorFixer {
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
    
    // Conservative fix patterns - only the safest ones
    this.conservativePatterns = {
      // TS1128 - Remove semicolons after case/default (very safe)
      caseSemicolon: {
        pattern: /^(\s*case\s+['"'][^'"]*['"]\s*):\s*;/gm,
        replacement: '$1:',
        description: 'Remove semicolon after case statement'
      },
      defaultSemicolon: {
        pattern: /^(\s*default\s*):\s*;/gm,
        replacement: '$1:',
        description: 'Remove semicolon after default statement'
      },
      
      // TS1109 - Fix triple ampersand (very safe)
      tripleAmpersand: {
        pattern: /\&\&\&/g,
        replacement: '&&',
        description: 'Fix triple ampersand to double ampersand'
      },
      
      // TS1382 - Fix JSX self-closing tags (conservative)
      malformedSelfClosing: {
        pattern: /\s+\/\s+\/>/g,
        replacement: ' />',
        description: 'Fix malformed JSX self-closing tags'
      },
      
      // TS1005 - Add missing semicolons to simple const declarations (conservative)
      constSemicolon: {
        pattern: /^(\s*const\s+\w+\s*=\s*[^;{}\n]+)(?<![;}])$/gm,
        replacement: '$1;',
        description: 'Add semicolon to simple const declarations'
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
    this.log('🛡️ Starting Conservative Fresh TypeScript Error Fix...', 'info');
    this.log('🎯 Using only the safest, most reliable fix patterns', 'info');
    
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

      // Find and fix specific problematic files
      const targetFiles = await this.findHighPriorityFiles();
      this.log(`📁 Found ${targetFiles.length} high-priority files to process`, 'info');

      for (const file of targetFiles) {
        await this.applyConservativeFixes(file);
      }

      // Get final error count
      const finalErrors = await this.getErrorCount();
      const errorsFixed = Math.max(0, initialErrors - finalErrors);
      this.totalFixed = errorsFixed;

      this.log(`✅ Conservative fix completed!`, 'success');
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
      this.log(`❌ Conservative fix failed: ${error.message}`, 'error');
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

  async findHighPriorityFiles() {
    // Target files with specific error patterns first
    const highPriorityFiles = [
      'components/ChannelTabContent.tsx', // Has case/default semicolon errors
      'components/ChannelHeader.tsx',     // Has triple ampersand error
      'components/BaseForm.tsx'           // Multiple error types
    ];

    const existingFiles = [];
    for (const file of highPriorityFiles) {
      const fullPath = path.join(this.options.projectPath, file);
      if (fs.existsSync(fullPath)) {
        existingFiles.push(fullPath);
      }
    }

    // Also scan for other files with switch statements
    const additionalFiles = await this.findFilesWithSwitchStatements();
    
    return [...existingFiles, ...additionalFiles];
  }

  async findFilesWithSwitchStatements() {
    const files = [];
    const extensions = ['.ts', '.tsx'];
    
    // Look in components directory for switch statements
    const componentDir = path.join(this.options.projectPath, 'components');
    if (fs.existsSync(componentDir)) {
      this.findFilesWithPatternRecursive(componentDir, extensions, /switch\s*\(/i, files);
    }

    return files.slice(0, 10); // Limit to first 10 files for safety
  }

  findFilesWithPatternRecursive(dir, extensions, pattern, files) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          this.findFilesWithPatternRecursive(fullPath, extensions, pattern, files);
        } else if (extensions.some(ext => item.endsWith(ext))) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (pattern.test(content)) {
              files.push(fullPath);
            }
          } catch (error) {
            // Skip files we can't read
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  async applyConservativeFixes(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let fixedContent = content;
      let fixesApplied = 0;

      // Apply each conservative fix pattern
      for (const [patternName, pattern] of Object.entries(this.conservativePatterns)) {
        const matches = (fixedContent.match(pattern.pattern) || []).length;
        
        if (matches > 0) {
          // Apply the fix
          const newContent = fixedContent.replace(pattern.pattern, pattern.replacement);
          
          // Only apply if the fix actually made changes
          if (newContent !== fixedContent) {
            fixedContent = newContent;
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
    const backupDir = path.join(this.options.projectPath, '.error-fix-backups', `conservative-fix-${timestamp}`);
    
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
      conservative: true,
      targetedPatterns: Object.keys(this.conservativePatterns)
    };

    const reportsDir = path.join(this.options.projectPath, 'conservative-fresh-error-fix-reports');
    
    try {
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // JSON report
      fs.writeFileSync(
        path.join(reportsDir, 'conservative-fresh-error-fix-report.json'),
        JSON.stringify(report, null, 2)
      );

      // Markdown summary
      const markdown = this.generateMarkdownReport(report);
      fs.writeFileSync(
        path.join(reportsDir, 'CONSERVATIVE_FRESH_ERROR_FIX_SUMMARY.md'),
        markdown
      );

      this.log(`📊 Reports generated in ${reportsDir}`, 'info');
      
    } catch (error) {
      this.log(`❌ Report generation failed: ${error.message}`, 'error');
    }
  }

  generateMarkdownReport(data) {
    return `# Conservative Fresh TypeScript Error Fix Report

## 🛡️ Conservative Fix Summary

**Approach**: Conservative, safe-only fixes
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

## 🎯 Conservative Fix Patterns Applied

This script used only the safest, most reliable fix patterns:

${data.targetedPatterns.map(pattern => `- **${pattern}**: ${this.conservativePatterns[pattern].description}`).join('\n')}

## 🔧 Fixes Applied by Type

${Object.entries(data.fixedByType).length > 0 
  ? Object.entries(data.fixedByType)
      .map(([type, count]) => `- **${type}**: ${count} fixes`)
      .join('\n')
  : '- No fixes were applied'
}

## 🛡️ Safety Approach

This conservative approach:
- Uses only proven, safe regex patterns
- Targets specific files with known error patterns
- Avoids complex transformations that could introduce new errors
- Creates backups before making any changes
- Provides detailed logging for verification

## 🎉 Completion

The conservative fresh TypeScript error fix has been completed using only the safest possible transformations.

${data.errorsFixed > 0 
  ? `### ✅ Success: Fixed ${data.errorsFixed} errors safely!`
  : `### ℹ️ No conservative fixes were applicable to the current error set`
}

---
*Generated by Conservative Fresh TypeScript Error Fixer*
*Part of the Real TypeScript Error Resolution System*
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

  console.log('🛡️ Conservative Fresh TypeScript Error Fix');
  console.log('📋 Safe-only fixes from Real TypeScript Error Resolution System');
  console.log('🎯 Targeting: Case/default semicolons, triple ampersands, malformed JSX\n');

  const fixer = new ConservativeFreshErrorFixer(options);
  fixer.run()
    .then(result => {
      console.log('\n🎉 Conservative Fresh Error Fix Complete!');
      console.log(`✅ Fixed ${result.errorsFixed} errors in ${Math.round(result.duration/1000)}s`);
      console.log(`📊 ${result.errorsRemaining} errors remaining`);
      console.log(`🛡️ Safety: ${result.success ? 'SUCCESSFUL' : 'NO FIXES APPLIED'}`);
      
      if (Object.keys(result.fixedByType).length > 0) {
        console.log('\n🔧 Safe fixes applied:');
        for (const [type, count] of Object.entries(result.fixedByType)) {
          console.log(`   - ${type}: ${count} fixes`);
        }
      }
      
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Conservative fix failed:', error.message);
      process.exit(1);
    });
}

module.exports = ConservativeFreshErrorFixer;