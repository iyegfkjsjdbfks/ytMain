#!/usr/bin/env node
/**
 * Intelligent Batch Error Processor
 * 
 * This script implements a sophisticated error fixing strategy that:
 * 1. Categorizes errors by severity and type
 * 2. Fixes errors in dependency order
 * 3. Validates each fix before proceeding
 * 4. Provides rollback capabilities
 * 5. Generates detailed progress reports
 */

const { execSync } = require('child_process');
const { readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');

const projectRoot = __dirname + '/..';

class IntelligentBatchProcessor {
  constructor() {
    this.startTime = Date.now();
    this.fixStrategies = new Map();
    this.processedFiles = new Set();
    this.backupFiles = new Map();
    this.fixResults = [];
    this.maxErrorIncrease = 5; // Allow small increases during intermediate fixes
    
    this.initializeFixStrategies();
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

  initializeFixStrategies() {
    // Define fix strategies for different error patterns
    this.fixStrategies.set('TS1005', {
      name: 'Syntax Comma/Semicolon Fixes',
      priority: 10,
      pattern: /error TS1005:/,
      fixer: this.fixSyntaxErrors.bind(this)
    });
    
    this.fixStrategies.set('TS1128', {
      name: 'Declaration Expected Fixes',
      priority: 9,
      pattern: /error TS1128:/,
      fixer: this.fixDeclarationErrors.bind(this)
    });
    
    this.fixStrategies.set('TS2304', {
      name: 'Cannot Find Name Fixes',
      priority: 8,
      pattern: /error TS2304:/,
      fixer: this.fixMissingNames.bind(this)
    });
    
    this.fixStrategies.set('TS2339', {
      name: 'Property Does Not Exist Fixes',
      priority: 7,
      pattern: /error TS2339:/,
      fixer: this.fixMissingProperties.bind(this)
    });
    
    this.fixStrategies.set('TS7008', {
      name: 'Implicit Any Type Fixes',
      priority: 6,
      pattern: /error TS7008:/,
      fixer: this.fixImplicitAnyTypes.bind(this)
    });
    
    this.fixStrategies.set('TS2322', {
      name: 'Type Assignment Fixes',
      priority: 5,
      pattern: /error TS2322:/,
      fixer: this.fixTypeAssignments.bind(this)
    });
    
    this.fixStrategies.set('TS6133', {
      name: 'Unused Variable Cleanup',
      priority: 4,
      pattern: /error TS6133:/,
      fixer: this.fixUnusedVariables.bind(this)
    });
  }

  async getCurrentErrorCount() {
    try {
      execSync('npm run type-check 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: projectRoot,
        timeout: 60000
      });
      return 0;
    } catch (error) {
      const output = `${error.stdout || ''}${error.stderr || ''}`;
      const errorLines = output.split('\n').filter(line => /error TS\d+:/.test(line));
      return errorLines.length;
    }
  }

  async getErrorsByType(errorCode) {
    try {
      execSync('npm run type-check 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: projectRoot,
        timeout: 60000
      });
      return [];
    } catch (error) {
      const output = `${error.stdout || ''}${error.stderr || ''}`;
      const lines = output.split('\n');
      const errors = [];
      
      for (const line of lines) {
        if (line.includes(`error ${errorCode}:`)) {
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
      }
      
      return errors;
    }
  }

  backupFile(filePath) {
    if (existsSync(filePath) && !this.backupFiles.has(filePath)) {
      const content = readFileSync(filePath, 'utf8');
      this.backupFiles.set(filePath, content);
    }
  }

  restoreFile(filePath) {
    if (this.backupFiles.has(filePath)) {
      writeFileSync(filePath, this.backupFiles.get(filePath));
      this.log(`Restored ${filePath} from backup`);
    }
  }

  async fixSyntaxErrors(errors) {
    this.log(`Fixing ${errors.length} syntax errors...`);
    const fixedFiles = new Set();
    
    for (const error of errors) {
      const filePath = join(projectRoot, error.file);
      if (!existsSync(filePath)) continue;
      
      this.backupFile(filePath);
      let content = readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      if (error.line <= lines.length) {
        const line = lines[error.line - 1];
        
        // Fix common syntax issues
        if (error.message.includes("',' expected")) {
          // Fix malformed arrow function parameters
          const fixed = line.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*): any\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g, '$1.$2');
          if (fixed !== line) {
            lines[error.line - 1] = fixed;
            fixedFiles.add(filePath);
          }
        }
        
        if (error.message.includes("';' expected")) {
          // Add missing semicolons
          if (!line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}')) {
            lines[error.line - 1] = line + ';';
            fixedFiles.add(filePath);
          }
        }
      }
      
      if (fixedFiles.has(filePath)) {
        writeFileSync(filePath, lines.join('\n'));
      }
    }
    
    return fixedFiles.size;
  }

  async fixDeclarationErrors(errors) {
    this.log(`Fixing ${errors.length} declaration errors...`);
    const fixedFiles = new Set();
    
    for (const error of errors) {
      const filePath = join(projectRoot, error.file);
      if (!existsSync(filePath)) continue;
      
      this.backupFile(filePath);
      let content = readFileSync(filePath, 'utf8');
      
      // Fix common declaration issues
      if (error.message.includes('Declaration or statement expected')) {
        // Remove invalid syntax patterns
        content = content.replace(/^\s*import React from 'react';\s*$/gm, '');
        content = content.replace(/^\s*import React from 'react';\s*$/gm, '');
        
        writeFileSync(filePath, content);
        fixedFiles.add(filePath);
      }
    }
    
    return fixedFiles.size;
  }

  async fixMissingNames(errors) {
    this.log(`Fixing ${errors.length} missing name errors...`);
    const fixedFiles = new Set();
    
    for (const error of errors) {
      const filePath = join(projectRoot, error.file);
      if (!existsSync(filePath)) continue;
      
      this.backupFile(filePath);
      let content = readFileSync(filePath, 'utf8');
      
      // Fix common missing name issues
      if (error.message.includes('Cannot find name')) {
        const missingName = error.message.match(/'([^']+)'/)?.[1];
        if (missingName) {
          // Add common missing imports
          if (missingName === 'React' && !content.includes("import React")) {
            content = "import React from 'react';\n" + content;
            fixedFiles.add(filePath);
          }
          
          if (missingName.startsWith('_') && error.message.includes('shorthand property')) {
            // Fix shorthand property issues
            content = content.replace(new RegExp(`\\b${missingName},`, 'g'), `${missingName}: ${missingName},`);
            fixedFiles.add(filePath);
          }
        }
      }
      
      if (fixedFiles.has(filePath)) {
        writeFileSync(filePath, content);
      }
    }
    
    return fixedFiles.size;
  }

  async fixMissingProperties(errors) {
    this.log(`Fixing ${errors.length} missing property errors...`);
    const fixedFiles = new Set();
    
    for (const error of errors) {
      const filePath = join(projectRoot, error.file);
      if (!existsSync(filePath)) continue;
      
      this.backupFile(filePath);
      let content = readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      if (error.line <= lines.length) {
        const line = lines[error.line - 1];
        
        // Fix common property access issues
        if (error.message.includes('Property') && error.message.includes('does not exist')) {
          // Add missing properties to interfaces or fix property access
          const propertyMatch = error.message.match(/Property '([^']+)' does not exist/);
          if (propertyMatch) {
            const property = propertyMatch[1];
            
            // Fix common property access patterns
            if (property === 'error' && line.includes('currentDeployment')) {
              // Add error property to deployment interface
              const interfaceMatch = content.match(/(interface.*Deployment.*{[^}]*)/s);
              if (interfaceMatch && !content.includes('error?:')) {
                content = content.replace(
                  /(interface.*Deployment.*{[^}]*)(})/s,
                  '$1  error?: string;\n$2'
                );
                fixedFiles.add(filePath);
              }
            }
          }
        }
      }
      
      if (fixedFiles.has(filePath)) {
        writeFileSync(filePath, content);
      }
    }
    
    return fixedFiles.size;
  }

  async fixImplicitAnyTypes(errors) {
    this.log(`Fixing ${errors.length} implicit any type errors...`);
    const fixedFiles = new Set();
    
    for (const error of errors) {
      const filePath = join(projectRoot, error.file);
      if (!existsSync(filePath)) continue;
      
      this.backupFile(filePath);
      let content = readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      if (error.line <= lines.length) {
        const line = lines[error.line - 1];
        
        // Add explicit type annotations
        if (error.message.includes('implicitly has an \'any\' type')) {
          const memberMatch = error.message.match(/Member '([^']+)' implicitly/);
          if (memberMatch) {
            const member = memberMatch[1];
            
            // Add type annotations for common patterns
            if (member === 'value' || member === 'data') {
              const fixed = line.replace(`${member};`, `${member}: any;`);
              if (fixed !== line) {
                lines[error.line - 1] = fixed;
                fixedFiles.add(filePath);
              }
            }
          }
        }
      }
      
      if (fixedFiles.has(filePath)) {
        writeFileSync(filePath, lines.join('\n'));
      }
    }
    
    return fixedFiles.size;
  }

  async fixTypeAssignments(errors) {
    this.log(`Fixing ${errors.length} type assignment errors...`);
    // For now, log these for manual review
    return 0;
  }

  async fixUnusedVariables(errors) {
    this.log(`Fixing ${errors.length} unused variable errors...`);
    const fixedFiles = new Set();
    
    for (const error of errors) {
      const filePath = join(projectRoot, error.file);
      if (!existsSync(filePath)) continue;
      
      this.backupFile(filePath);
      let content = readFileSync(filePath, 'utf8');
      
      // Remove unused imports and variables
      if (error.message.includes('is declared but its value is never read')) {
        const variableMatch = error.message.match(/'([^']+)' is declared/);
        if (variableMatch) {
          const variable = variableMatch[1];
          
          // Remove unused imports
          content = content.replace(new RegExp(`import\\s+${variable}\\s+from[^;]+;\\s*\\n?`, 'g'), '');
          content = content.replace(new RegExp(`,\\s*${variable}\\s*`, 'g'), '');
          content = content.replace(new RegExp(`\\{\\s*${variable}\\s*\\}`, 'g'), '{}');
          
          fixedFiles.add(filePath);
        }
      }
      
      if (fixedFiles.has(filePath)) {
        writeFileSync(filePath, content);
      }
    }
    
    return fixedFiles.size;
  }

  async processErrorType(errorCode) {
    const strategy = this.fixStrategies.get(errorCode);
    if (!strategy) {
      this.log(`No strategy found for error type ${errorCode}`, 'warning');
      return { fixed: 0, errors: [] };
    }
    
    this.log(`Processing ${strategy.name} (${errorCode})...`);
    
    const initialCount = await this.getCurrentErrorCount();
    const errors = await this.getErrorsByType(errorCode);
    
    if (errors.length === 0) {
      this.log(`No ${errorCode} errors found`, 'success');
      return { fixed: 0, errors: [] };
    }
    
    this.log(`Found ${errors.length} ${errorCode} errors`);
    
    const fixedCount = await strategy.fixer(errors);
    const finalCount = await this.getCurrentErrorCount();
    
    const result = {
      errorCode,
      strategy: strategy.name,
      initialTotal: initialCount,
      finalTotal: finalCount,
      errorsOfType: errors.length,
      fixed: fixedCount,
      timestamp: new Date().toISOString()
    };
    
    this.fixResults.push(result);
    
    if (finalCount > initialCount + this.maxErrorIncrease) {
      this.log(`Error count increased too much (${initialCount} -> ${finalCount}), rolling back...`, 'warning');
      
      // Restore all modified files
      for (const [filePath] of this.backupFiles) {
        this.restoreFile(filePath);
      }
      
      return { fixed: 0, errors, rollback: true };
    }
    
    this.log(`Fixed ${fixedCount} files, total errors: ${initialCount} -> ${finalCount}`);
    return result;
  }

  async run() {
    try {
      this.log('🚀 Starting Intelligent Batch Error Processing...');
      
      const initialErrorCount = await this.getCurrentErrorCount();
      this.log(`Initial error count: ${initialErrorCount}`);
      
      if (initialErrorCount === 0) {
        this.log('✨ No errors found! Project is clean.', 'success');
        return;
      }
      
      // Process errors by priority
      const sortedStrategies = Array.from(this.fixStrategies.entries())
        .sort((a, b) => b[1].priority - a[1].priority);
      
      for (const [errorCode, strategy] of sortedStrategies) {
        this.log(`\n--- Processing ${strategy.name} ---`);
        
        let iterations = 0;
        const maxIterations = 3;
        
        while (iterations < maxIterations) {
          const result = await this.processErrorType(errorCode);
          
          if (result.rollback) {
            this.log(`Rollback occurred for ${errorCode}, skipping...`, 'warning');
            break;
          }
          
          if (result.fixed === 0) {
            break; // No more fixes possible
          }
          
          iterations++;
          
          // Check if we should continue
          const remainingErrors = await this.getErrorsByType(errorCode);
          if (remainingErrors.length === 0) {
            this.log(`All ${errorCode} errors fixed!`, 'success');
            break;
          }
        }
      }
      
      const finalErrorCount = await this.getCurrentErrorCount();
      
      this.log(`\n🎯 Processing complete!`);
      this.log(`Initial errors: ${initialErrorCount}`);
      this.log(`Final errors: ${finalErrorCount}`);
      this.log(`Errors fixed: ${initialErrorCount - finalErrorCount}`);
      
      // Generate report
      const report = {
        startTime: new Date(this.startTime).toISOString(),
        endTime: new Date().toISOString(),
        duration: Date.now() - this.startTime,
        initialErrorCount,
        finalErrorCount,
        errorsFixed: initialErrorCount - finalErrorCount,
        fixResults: this.fixResults
      };
      
      writeFileSync(
        join(projectRoot, 'batch-processing-report.json'),
        JSON.stringify(report, null, 2)
      );
      
      this.log('📊 Report saved to batch-processing-report.json');
      
    } catch (error) {
      this.log(`Processing failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

if (require.main === module) {
  const processor = new IntelligentBatchProcessor();
  processor.run().catch(err => {
    console.error('❌ Processing failed:', err.message);
    process.exit(1);
  });
}

module.exports = { IntelligentBatchProcessor };