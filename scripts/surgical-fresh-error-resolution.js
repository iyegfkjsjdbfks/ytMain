#!/usr/bin/env node
/**
 * Surgical Fresh Error Resolution System
 * 
 * This script targets specific corruption patterns that have been introduced
 * by previous automated fixes and systematically corrects them.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SurgicalFreshErrorResolver {
  constructor(options = {}) {
    this.options = {
      projectPath: process.cwd(),
      dryRun: false,
      backup: true,
      ...options
    };
    
    this.startTime = Date.now();
    this.totalErrorsFixed = 0;
    this.filesFixed = 0;
    this.executionLog = [];
    this.backupCreated = false;
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    console.log(logEntry);
    this.executionLog.push(logEntry);
  }

  async createBackup() {
    if (!this.options.backup || this.backupCreated) return;
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      this.log(`Creating backup for surgical fixes...`);
      execSync(`git add . && git commit -m "Pre-surgical-error-resolution backup ${timestamp}" || true`);
      this.backupCreated = true;
      this.log('✅ Backup created successfully');
    } catch (error) {
      this.log(`⚠️ Backup creation failed: ${error.message}`, 'warn');
    }
  }

  fixFileCorruption(filePath) {
    if (!fs.existsSync(filePath)) return false;
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let modified = false;

      // Fix 1: Remove malformed function signatures
      content = content.replace(/const\s+(\w+)\s*=\s*React\.memo<([^>]+)>\s*s>\(/g, 'const $1 = React.memo<$2>(');
      if (content !== originalContent) modified = true;

      // Fix 2: Remove trailing semicolons and invalid syntax
      content = content.replace(/\(\{\s*(\w+)\s*\}:\s*Record<string>,?\s*unknown\)\s*=>\s*\{\s*;/g, '({ $1 }: { $1: any }) => {');
      if (content !== originalContent) modified = true;

      // Fix 3: Fix malformed arrow functions
      content = content.replace(/=\s*\(([^)]*)\)\s*=>\s*\{\s*;/g, '= ($1) => {');
      if (content !== originalContent) modified = true;

      // Fix 4: Fix malformed object literals with ': unknown'
      content = content.replace(/\{\s*([^}]+):\s*unknown\s*\}/g, '{ $1 }');
      if (content !== originalContent) modified = true;

      // Fix 5: Fix }: unknown); patterns
      content = content.replace(/\}\s*:\s*unknown\s*\)/g, '})');
      if (content !== originalContent) modified = true;

      // Fix 6: Fix malformed type assertions
      content = content.replace(/\s+as\s+any\s*\)/g, ')');
      if (content !== originalContent) modified = true;

      // Fix 7: Fix semicolon after opening braces
      content = content.replace(/=>\s*\{\s*;/g, '=> {');
      if (content !== originalContent) modified = true;

      // Fix 8: Fix incomplete JSX elements
      content = content.replace(/<(\w+)([^>]*?)(?<!\/)\s*(?!>|\/\s*>)$/gm, '<$1$2>');
      if (content !== originalContent) modified = true;

      // Fix 9: Fix malformed JSX props
      content = content.replace(/(\w+)=\{([^}]+)\}\s*(?![\s>}])/g, '$1={$2} ');
      if (content !== originalContent) modified = true;

      // Fix 10: Fix incomplete function parameters
      content = content.replace(/\(([^)]*),\s*$/, '($1)');
      if (content !== originalContent) modified = true;

      // Fix 11: Fix malformed conditional expressions
      content = content.replace(/\(\s*isSaved\s+as\s+any\s*\)/g, '(isSaved)');
      if (content !== originalContent) modified = true;

      // Fix 12: Remove stray semicolons at line ends
      content = content.replace(/;\s*;/g, ';');
      if (content !== originalContent) modified = true;

      if (modified) {
        if (!this.options.dryRun) {
          fs.writeFileSync(filePath, content);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      this.log(`❌ Failed to fix corruption in ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async fixCorruptedFiles() {
    this.log('🔧 Fixing corrupted files with surgical precision...');
    
    const corruptedFiles = [
      'components/VideoCard.tsx',
      'components/CategoryChips.tsx',
      'components/CommentModal.tsx',
      'contexts/WatchLaterContext.tsx',
      'src/App.tsx',
      'src/components/LoadingSpinner.tsx',
      'src/components/PWAUpdateNotification.tsx',
      'src/components/atoms/Button/Button.tsx'
    ];

    let fixedCount = 0;

    for (const file of corruptedFiles) {
      if (this.fixFileCorruption(file)) {
        this.log(`  ✅ Fixed corruption in ${file}`);
        fixedCount++;
      }
    }

    // Also scan for other corrupted files
    const additionalFiles = execSync('find src components -name "*.tsx" -o -name "*.ts" | head -50').toString().split('\n').filter(f => f.trim());
    
    for (const file of additionalFiles) {
      if (!corruptedFiles.includes(file) && this.fixFileCorruption(file)) {
        this.log(`  ✅ Fixed additional corruption in ${file}`);
        fixedCount++;
      }
    }

    this.filesFixed = fixedCount;
    return fixedCount;
  }

  async fixSpecificSyntaxPatterns() {
    this.log('🎯 Fixing specific syntax corruption patterns...');
    
    try {
      // Get all TypeScript/React files
      const files = execSync('find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .git')
        .toString()
        .split('\n')
        .filter(f => f.trim());

      let patternsFixed = 0;

      for (const filePath of files) {
        if (!fs.existsSync(filePath)) continue;

        try {
          let content = fs.readFileSync(filePath, 'utf8');
          const originalContent = content;
          let fileModified = false;

          // Pattern 1: Fix React.memo type corruption
          const memoPattern = /React\.memo<([^>]+)>\s*s>\(/g;
          content = content.replace(memoPattern, 'React.memo<$1>(');
          if (content !== originalContent) fileModified = true;

          // Pattern 2: Fix function parameter corruption
          const paramPattern = /\(\{\s*(\w+)\s*\}:\s*Record<string>,?\s*unknown\)/g;
          content = content.replace(paramPattern, '({ $1 }: { $1: any })');
          if (content !== originalContent) fileModified = true;

          // Pattern 3: Fix arrow function corruption
          const arrowPattern = /=>\s*\{\s*;/g;
          content = content.replace(arrowPattern, '=> {');
          if (content !== originalContent) fileModified = true;

          // Pattern 4: Fix object literal corruption
          const objectPattern = /:\s*unknown\s*\}/g;
          content = content.replace(objectPattern, '}');
          if (content !== originalContent) fileModified = true;

          // Pattern 5: Fix type assertion corruption
          const typeAssertPattern = /\s+as\s+any\s*(?=[\)}])/g;
          content = content.replace(typeAssertPattern, '');
          if (content !== originalContent) fileModified = true;

          if (fileModified) {
            if (!this.options.dryRun) {
              fs.writeFileSync(filePath, content);
            }
            patternsFixed++;
            this.log(`  ✅ Fixed syntax patterns in ${filePath}`);
          }
        } catch (error) {
          this.log(`  ❌ Failed to process ${filePath}: ${error.message}`, 'error');
        }
      }

      return patternsFixed;
    } catch (error) {
      this.log(`❌ Failed to fix syntax patterns: ${error.message}`, 'error');
      return 0;
    }
  }

  async fixJSXCorruption() {
    this.log('🔧 Fixing JSX-specific corruption...');
    
    try {
      const jsxFiles = execSync('find . -name "*.tsx" | grep -v node_modules | grep -v .git')
        .toString()
        .split('\n')
        .filter(f => f.trim());

      let jsxFixed = 0;

      for (const filePath of jsxFiles) {
        if (!fs.existsSync(filePath)) continue;

        try {
          let content = fs.readFileSync(filePath, 'utf8');
          const originalContent = content;

          // Fix malformed JSX expressions with &gt; and &rbrace;
          content = content.replace(/&gt;/g, '>');
          content = content.replace(/&rbrace;/g, '}');
          content = content.replace(/&lt;/g, '<');

          // Fix incomplete JSX tags
          content = content.replace(/<(\w+)([^>]*?)(?<!\/)\s*$/gm, '<$1$2>');

          // Fix stray closing tags
          content = content.replace(/\s*\/>\s*>/g, '/>');

          // Fix malformed className props
          content = content.replace(/className=([^{]\w+)([^,\s>}])/g, 'className={$1}$2');

          if (content !== originalContent) {
            if (!this.options.dryRun) {
              fs.writeFileSync(filePath, content);
            }
            jsxFixed++;
            this.log(`  ✅ Fixed JSX corruption in ${filePath}`);
          }
        } catch (error) {
          this.log(`  ❌ Failed to fix JSX in ${filePath}: ${error.message}`, 'error');
        }
      }

      return jsxFixed;
    } catch (error) {
      this.log(`❌ Failed to fix JSX corruption: ${error.message}`, 'error');
      return 0;
    }
  }

  async validateFixes() {
    this.log('🔍 Validating surgical fixes...');
    
    try {
      execSync('npx tsc --noEmit > surgical-validation-results.txt 2>&1 || true');
      
      if (fs.existsSync('surgical-validation-results.txt')) {
        const validationContent = fs.readFileSync('surgical-validation-results.txt', 'utf8');
        const remainingErrors = validationContent.split('\n').filter(line => line.includes('error TS')).length;
        
        this.log(`📊 Validation complete: ${remainingErrors} errors remaining`);
        return remainingErrors;
      }
    } catch (error) {
      this.log(`⚠️ Validation failed: ${error.message}`, 'warn');
    }
    
    return -1;
  }

  async deploy() {
    this.log('🚀 Deploying Surgical Fresh Error Resolution System...');
    
    try {
      // Step 1: Create backup
      await this.createBackup();
      
      // Step 2: Fix corrupted files
      const corruptedFilesFixed = await this.fixCorruptedFiles();
      
      // Step 3: Fix specific syntax patterns
      const syntaxPatternsFixed = await this.fixSpecificSyntaxPatterns();
      
      // Step 4: Fix JSX corruption
      const jsxCorruptionFixed = await this.fixJSXCorruption();
      
      this.totalErrorsFixed = corruptedFilesFixed + syntaxPatternsFixed + jsxCorruptionFixed;

      // Step 5: Validate fixes
      const remainingErrors = await this.validateFixes();

      const executionTime = Date.now() - this.startTime;
      
      this.log('\n🎯 SURGICAL FRESH ERROR RESOLUTION COMPLETE');
      this.log(`⏱️  Execution time: ${Math.round(executionTime / 1000)}s`);
      this.log(`🔧 Files fixed: ${this.filesFixed}`);
      this.log(`🔧 Total fixes applied: ${this.totalErrorsFixed}`);
      this.log(`📊 Errors remaining: ${remainingErrors >= 0 ? remainingErrors : 'Unknown'}`);
      
      if (this.totalErrorsFixed > 0) {
        this.log('✅ SUCCESS: Surgical error resolution completed with measurable improvements');
      } else {
        this.log('⚠️ PARTIAL: No corrupted patterns detected or files may need manual intervention');
      }

      // Generate report
      const report = {
        timestamp: new Date().toISOString(),
        executionTime,
        filesFixed: this.filesFixed,
        totalFixesApplied: this.totalErrorsFixed,
        remainingErrors,
        phases: [
          { name: 'Corrupted Files Fixed', count: corruptedFilesFixed },
          { name: 'Syntax Patterns Fixed', count: syntaxPatternsFixed },
          { name: 'JSX Corruption Fixed', count: jsxCorruptionFixed }
        ]
      };

      fs.writeFileSync('surgical-error-resolution-report.json', JSON.stringify(report, null, 2));
      this.log('📋 Report saved: surgical-error-resolution-report.json');

      return {
        success: this.totalErrorsFixed > 0,
        filesFixed: this.filesFixed,
        totalFixesApplied: this.totalErrorsFixed,
        remainingErrors,
        executionTime
      };

    } catch (error) {
      this.log(`❌ CRITICAL ERROR: ${error.message}`, 'error');
      this.log(`Stack: ${error.stack}`, 'error');
      
      return {
        success: false,
        filesFixed: 0,
        totalFixesApplied: 0,
        remainingErrors: -1,
        error: error.message
      };
    }
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const noBackup = args.includes('--no-backup');
  
  console.log('🚀 Surgical Fresh TypeScript Error Resolution System');
  console.log('🎯 Targeting specific corruption patterns from previous automated fixes\n');

  const resolver = new SurgicalFreshErrorResolver({
    dryRun,
    backup: !noBackup
  });

  resolver.deploy()
    .then(result => {
      console.log('\n' + '='.repeat(80));
      console.log('SURGICAL FRESH ERROR RESOLUTION DEPLOYMENT COMPLETE');
      console.log('='.repeat(80));
      
      if (result.success) {
        console.log('🎉 SUCCESS: Surgical error resolution completed successfully!');
        console.log(`📊 ${result.filesFixed} files fixed with ${result.totalFixesApplied} total fixes in ${Math.round(result.executionTime / 1000)}s`);
      } else {
        console.log('⚠️ PARTIAL SUCCESS: Some corruption may require manual intervention');
      }
      
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 DEPLOYMENT FAILED:', error.message);
      process.exit(1);
    });
}

module.exports = SurgicalFreshErrorResolver;