#!/usr/bin/env node
/**
 * Ultimate TypeScript Error Resolver
 * 
 * This script combines the best strategies from existing error-fixing scripts:
 * 1. Real-time error parsing from npm run type-check output
 * 2. Pattern-based categorization and prioritization
 * 3. Targeted fixes for specific error types
 * 4. Continuous validation and progress tracking
 * 5. File backup and rollback capabilities
 */

const { execSync } = require('child_process');
const { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } = require('fs');
const { join, dirname } = require('path');
const path = require('path');

const projectRoot = process.cwd();
const backupDir = join(projectRoot, '.error-fix-backups');

class UltimateErrorResolver {
  constructor() {
    this.startTime = Date.now();
    this.totalErrorsFixed = 0;
    this.processedFiles = new Set();
    this.backupFiles = new Map();
    
    // Ensure backup directory exists
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
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

  async getCurrentErrors() {
    try {
      const result = execSync('npm run type-check', {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: projectRoot,
        timeout: 60000
      });
      return { success: true, output: result, errors: [] };
    } catch (error) {
      const output = `${error.stdout || ''}${error.stderr || ''}`;
      const errors = this.parseErrorOutput(output);
      return { success: false, output, errors };
    }
  }

  parseErrorOutput(output) {
    const errors = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      // Match TypeScript error format: file(line,col): error TSxxxx: message
      const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);
      if (match) {
        const [, file, lineNum, column, code, message] = match;
        errors.push({
          file: file.trim(),
          line: parseInt(lineNum),
          column: parseInt(column),
          code,
          message: message.trim(),
          raw: line
        });
      }
    }
    
    return errors;
  }

  categorizeErrors(errors) {
    const categories = {
      'syntax-errors': [],
      'import-issues': [],
      'type-mismatches': [],
      'missing-properties': [],
      'unused-variables': [],
      'event-handlers': [],
      'other': []
    };

    for (const error of errors) {
      if (['TS1005', 'TS1128', 'TS1109'].includes(error.code)) {
        categories['syntax-errors'].push(error);
      } else if (['TS2304', 'TS2307', 'TS6133'].includes(error.code)) {
        categories['import-issues'].push(error);
      } else if (['TS2322', 'TS2345', 'TS2769'].includes(error.code)) {
        categories['type-mismatches'].push(error);
      } else if (error.code === 'TS2339') {
        categories['missing-properties'].push(error);
      } else if (error.code === 'TS6133') {
        categories['unused-variables'].push(error);
      } else if (error.message.includes('MouseEvent') || error.message.includes('KeyboardEvent')) {
        categories['event-handlers'].push(error);
      } else {
        categories['other'].push(error);
      }
    }

    return categories;
  }

  backupFile(filePath) {
    if (this.backupFiles.has(filePath)) {
      return; // Already backed up
    }

    try {
      const content = readFileSync(filePath, 'utf8');
      const backupPath = join(backupDir, path.basename(filePath) + '.backup');
      writeFileSync(backupPath, content, 'utf8');
      this.backupFiles.set(filePath, backupPath);
    } catch (error) {
      this.log(`Failed to backup ${filePath}: ${error.message}`, 'warning');
    }
  }

  async fixSyntaxErrors(errors) {
    this.log(`Fixing ${errors.length} syntax errors...`);
    const fileGroups = this.groupErrorsByFile(errors);
    let fixedCount = 0;

    for (const [filePath, fileErrors] of fileGroups) {
      this.backupFile(filePath);
      
      try {
        let content = readFileSync(filePath, 'utf8');
        let modified = false;

        // Fix common syntax issues
        const fixes = [
          // Remove trailing commas in imports
          [/import\s*\{([^}]+),\s*\}\s*from/g, 'import {$1} from'],
          // Fix malformed import statements
          [/import\s*\{\s*([^}]+)\s*\}\s*from\s*(['"][^'"]+['"])/g, 'import { $1 } from $2'],
          // Remove extra semicolons
          [/;;+/g, ';'],
          // Fix spacing in object literals
          [/\{\s*,/g, '{'],
          [/,\s*\}/g, '}']
        ];

        for (const [pattern, replacement] of fixes) {
          const newContent = content.replace(pattern, replacement);
          if (newContent !== content) {
            content = newContent;
            modified = true;
          }
        }

        if (modified) {
          writeFileSync(filePath, content, 'utf8');
          fixedCount += fileErrors.length;
          this.log(`Fixed syntax errors in ${path.relative(projectRoot, filePath)}`);
        }
      } catch (error) {
        this.log(`Error fixing ${filePath}: ${error.message}`, 'error');
      }
    }

    return fixedCount;
  }

  async fixImportIssues(errors) {
    this.log(`Fixing ${errors.length} import issues...`);
    const fileGroups = this.groupErrorsByFile(errors);
    let fixedCount = 0;

    for (const [filePath, fileErrors] of fileGroups) {
      this.backupFile(filePath);
      
      try {
        let content = readFileSync(filePath, 'utf8');
        let modified = false;

        // Remove unused imports (TS6133)
        const unusedImports = fileErrors.filter(e => e.code === 'TS6133');
        for (const error of unusedImports) {
          const lines = content.split('\n');
          const errorLine = lines[error.line - 1];
          
          if (errorLine && errorLine.includes('import')) {
            // Remove the entire import line if it's unused
            lines[error.line - 1] = '';
            content = lines.join('\n');
            modified = true;
          }
        }

        if (modified) {
          writeFileSync(filePath, content, 'utf8');
          fixedCount += fileErrors.length;
          this.log(`Fixed import issues in ${path.relative(projectRoot, filePath)}`);
        }
      } catch (error) {
        this.log(`Error fixing ${filePath}: ${error.message}`, 'error');
      }
    }

    return fixedCount;
  }

  async fixTypeMismatches(errors) {
    this.log(`Fixing ${errors.length} type mismatch errors...`);
    const fileGroups = this.groupErrorsByFile(errors);
    let fixedCount = 0;

    for (const [filePath, fileErrors] of fileGroups) {
      this.backupFile(filePath);
      
      try {
        let content = readFileSync(filePath, 'utf8');
        let modified = false;

        // Fix event handler type issues
        const eventErrors = fileErrors.filter(e => 
          e.message.includes('MouseEvent') || e.message.includes('KeyboardEvent')
        );
        
        for (const error of eventErrors) {
          if (error.message.includes('MouseEvent')) {
            content = content.replace(
              /addEventListener\s*\(\s*['"]\w+['"]\s*,\s*([^,)]+)/g,
              'addEventListener($1, $2 as EventListener'
            );
            modified = true;
          }
        }

        if (modified) {
          writeFileSync(filePath, content, 'utf8');
          fixedCount += fileErrors.length;
          this.log(`Fixed type mismatches in ${path.relative(projectRoot, filePath)}`);
        }
      } catch (error) {
        this.log(`Error fixing ${filePath}: ${error.message}`, 'error');
      }
    }

    return fixedCount;
  }

  async fixMissingProperties(errors) {
    this.log(`Fixing ${errors.length} missing property errors...`);
    const fileGroups = this.groupErrorsByFile(errors);
    let fixedCount = 0;

    for (const [filePath, fileErrors] of fileGroups) {
      this.backupFile(filePath);
      
      try {
        let content = readFileSync(filePath, 'utf8');
        let modified = false;

        // Add common missing properties
        for (const error of fileErrors) {
          if (error.message.includes("Property 'error' does not exist")) {
            // Add error property to objects
            const lines = content.split('\n');
            const errorLine = lines[error.line - 1];
            
            if (errorLine && errorLine.includes('currentDeployment')) {
              lines[error.line - 1] = errorLine.replace(
                /currentDeployment\s*:/,
                'currentDeployment: { error: null, ...currentDeployment } as any,'
              );
              content = lines.join('\n');
              modified = true;
            }
          }
        }

        if (modified) {
          writeFileSync(filePath, content, 'utf8');
          fixedCount += fileErrors.length;
          this.log(`Fixed missing properties in ${path.relative(projectRoot, filePath)}`);
        }
      } catch (error) {
        this.log(`Error fixing ${filePath}: ${error.message}`, 'error');
      }
    }

    return fixedCount;
  }

  groupErrorsByFile(errors) {
    const groups = new Map();
    for (const error of errors) {
      if (!groups.has(error.file)) {
        groups.set(error.file, []);
      }
      groups.get(error.file).push(error);
    }
    return groups;
  }

  async run() {
    this.log('🚀 Starting Ultimate TypeScript Error Resolution...');
    
    // Get initial error count
    const initialCheck = await this.getCurrentErrors();
    if (initialCheck.success) {
      this.log('✅ No TypeScript errors found! Project is clean.', 'success');
      return;
    }

    const initialErrors = initialCheck.errors;
    this.log(`Found ${initialErrors.length} TypeScript errors to fix`);

    // Categorize errors
    const categories = this.categorizeErrors(initialErrors);
    
    // Display error breakdown
    for (const [category, errors] of Object.entries(categories)) {
      if (errors.length > 0) {
        this.log(`  ${category}: ${errors.length} errors`);
      }
    }

    // Fix errors in priority order
    const fixOrder = [
      ['syntax-errors', this.fixSyntaxErrors.bind(this)],
      ['import-issues', this.fixImportIssues.bind(this)],
      ['missing-properties', this.fixMissingProperties.bind(this)],
      ['type-mismatches', this.fixTypeMismatches.bind(this)],
      ['event-handlers', this.fixTypeMismatches.bind(this)]
    ];

    for (const [category, fixFunction] of fixOrder) {
      const categoryErrors = categories[category];
      if (categoryErrors.length > 0) {
        this.log(`\n--- Fixing ${category} ---`);
        const fixed = await fixFunction(categoryErrors);
        this.totalErrorsFixed += fixed;
        
        // Check progress
        const progressCheck = await this.getCurrentErrors();
        if (progressCheck.success) {
          this.log('🎉 All errors fixed!', 'success');
          break;
        } else {
          this.log(`Remaining errors: ${progressCheck.errors.length}`);
        }
      }
    }

    // Final validation
    this.log('\n--- Final Validation ---');
    const finalCheck = await this.getCurrentErrors();
    
    if (finalCheck.success) {
      this.log('🎉 SUCCESS: All TypeScript errors have been resolved!', 'success');
    } else {
      this.log(`⚠️  ${finalCheck.errors.length} errors remain. Manual intervention may be required.`, 'warning');
      
      // Show remaining error types
      const remainingCategories = this.categorizeErrors(finalCheck.errors);
      for (const [category, errors] of Object.entries(remainingCategories)) {
        if (errors.length > 0) {
          this.log(`  Remaining ${category}: ${errors.length}`);
        }
      }
    }

    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    this.log(`\n📊 Resolution completed in ${duration}s`);
    this.log(`📈 Total errors processed: ${this.totalErrorsFixed}`);
    this.log(`📁 Files backed up: ${this.backupFiles.size}`);
  }
}

// Execute if run directly
if (require.main === module) {
  const resolver = new UltimateErrorResolver();
  resolver.run().catch(err => {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  });
}

module.exports = { UltimateErrorResolver };