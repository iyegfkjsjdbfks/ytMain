#!/usr/bin/env node
/**
 * Deploy and Run Real TypeScript Error Resolution System
 * 
 * This script implements the comprehensive TypeScript error resolution system
 * as described in DEPLOYMENT_GUIDE.md and IMPLEMENTATION_SUMMARY.md
 */

import { execSync, exec, spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

class TypeScriptErrorResolutionSystem {
  constructor(options = {}) {
    this.options = {
      projectPath: PROJECT_ROOT,
      dryRun: false,
      backup: true,
      maxIterations: 5,
      timeoutSeconds: 300,
      generateReports: true,
      ...options
    };
    
    this.startTime = Date.now();
    this.totalErrorsFixed = 0;
    this.executionLog = [];
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    console.log(logEntry);
    this.executionLog.push(logEntry);
  }

  async deploy() {
    this.log('🚀 Deploying TypeScript Error Resolution System...', 'info');
    
    try {
      // 1. Analyze current error state
      const initialAnalysis = await this.analyzeErrors();
      this.log(`📊 Initial analysis: ${initialAnalysis.totalErrors} errors found`);
      
      // 2. Create backup if enabled
      if (this.options.backup && !this.options.dryRun) {
        await this.createSystemBackup();
      }
      
      // 3. Deploy and run resolution phases
      const resolutionResult = await this.runResolutionPhases(initialAnalysis);
      
      // 4. Generate comprehensive report
      if (this.options.generateReports) {
        await this.generateFinalReport(initialAnalysis, resolutionResult);
      }
      
      // 5. Validate final state
      const finalAnalysis = await this.analyzeErrors();
      
      this.log('✅ TypeScript Error Resolution System deployment completed!', 'success');
      this.log(`📈 Results: ${initialAnalysis.totalErrors} → ${finalAnalysis.totalErrors} errors`);
      this.log(`🔧 Total errors fixed: ${initialAnalysis.totalErrors - finalAnalysis.totalErrors}`);
      
      return {
        success: true,
        initialErrors: initialAnalysis.totalErrors,
        finalErrors: finalAnalysis.totalErrors,
        errorsFixed: initialAnalysis.totalErrors - finalAnalysis.totalErrors,
        duration: Date.now() - this.startTime,
        phases: resolutionResult
      };
      
    } catch (error) {
      this.log(`❌ Deployment failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async analyzeErrors() {
    this.log('🔍 Analyzing TypeScript errors...', 'info');
    
    try {
      // Run TypeScript compiler to capture errors
      const { stdout, stderr } = await this.executeCommand('npx tsc --noEmit --skipLibCheck', true);
      const output = stdout || stderr || '';
      
      if (!output || output.trim() === '') {
        return {
          totalErrors: 0,
          errorsByCategory: {},
          errorsByFile: {},
          criticalFiles: [],
          recommendations: ['🎉 No TypeScript errors found!']
        };
      }
      
      // Parse errors
      const errors = this.parseTypeScriptErrors(output);
      const analysis = this.categorizeErrors(errors);
      
      this.log(`📋 Error breakdown: ${JSON.stringify(analysis.errorsByCategory)}`, 'info');
      
      return analysis;
      
    } catch (error) {
      // Errors are expected during analysis
      const output = error.stdout || error.stderr || '';
      const errors = this.parseTypeScriptErrors(output);
      return this.categorizeErrors(errors);
    }
  }

  parseTypeScriptErrors(output) {
    const errors = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('error TS')) {
        const match = line.match(/^(.+):(\d+):(\d+)\s*-\s*error\s+(TS\d+):\s*(.+)$/);
        if (match) {
          const [, file, lineNum, column, code, message] = match;
          errors.push({
            file: file.trim(),
            line: parseInt(lineNum),
            column: parseInt(column),
            code,
            message: message.trim(),
            fullLine: line
          });
        }
      }
    }
    
    return errors;
  }

  categorizeErrors(errors) {
    const categories = {
      syntax: { pattern: /TS1\d{3}/, priority: 1, description: 'Syntax errors' },
      imports: { pattern: /TS(2307|2305|2688)/, priority: 2, description: 'Import/module errors' },
      types: { pattern: /TS(2322|2339|2304|2503)/, priority: 3, description: 'Type errors' },
      unused: { pattern: /TS6133/, priority: 4, description: 'Unused declarations' },
      implicit: { pattern: /TS7\d{3}/, priority: 5, description: 'Implicit any errors' },
      other: { pattern: /.*/, priority: 6, description: 'Other errors' }
    };

    const errorsByCategory = {};
    const errorsByFile = {};
    
    for (const error of errors) {
      // Categorize by error code
      let category = 'other';
      for (const [cat, info] of Object.entries(categories)) {
        if (info.pattern.test(error.code)) {
          category = cat;
          break;
        }
      }
      
      if (!errorsByCategory[category]) {
        errorsByCategory[category] = [];
      }
      errorsByCategory[category].push(error);
      
      // Group by file
      if (!errorsByFile[error.file]) {
        errorsByFile[error.file] = [];
      }
      errorsByFile[error.file].push(error);
    }

    // Find critical files (files with syntax errors)
    const criticalFiles = Object.keys(errorsByFile).filter(file => 
      errorsByFile[file].some(error => categories.syntax.pattern.test(error.code))
    );

    return {
      totalErrors: errors.length,
      errorsByCategory,
      errorsByFile,
      criticalFiles,
      recommendations: this.generateRecommendations(errorsByCategory, criticalFiles)
    };
  }

  generateRecommendations(errorsByCategory, criticalFiles) {
    const recommendations = [];
    
    if (criticalFiles.length > 0) {
      recommendations.push(`🚨 ${criticalFiles.length} files have critical syntax errors - fix these first`);
    }
    
    for (const [category, errors] of Object.entries(errorsByCategory)) {
      if (errors.length > 10) {
        recommendations.push(`📦 ${category}: ${errors.length} errors - consider bulk fixing`);
      }
    }
    
    return recommendations;
  }

  async runResolutionPhases(analysis) {
    this.log('🔄 Starting resolution phases...', 'info');
    
    const phases = [
      {
        name: 'Critical Syntax',
        description: 'Fix critical syntax errors that prevent compilation',
        targetCategories: ['syntax'],
        scripts: ['fix-ts1005-critical-syntax.js', 'fix-ts1128-declaration-expected.js'],
        maxIterations: 2
      },
      {
        name: 'Import Resolution', 
        description: 'Resolve import and module errors',
        targetCategories: ['imports'],
        scripts: ['fix-ts2307-cannot-find-module.js', 'fix-ts2305-no-exported-member.js'],
        maxIterations: 2
      },
      {
        name: 'Type Resolution',
        description: 'Fix type compatibility and property errors', 
        targetCategories: ['types'],
        scripts: ['fix-ts2339-property-errors.js', 'fix-ts2322-type-not-assignable.js'],
        maxIterations: 3
      },
      {
        name: 'Cleanup',
        description: 'Remove unused imports and fix implicit any',
        targetCategories: ['unused', 'implicit'],
        scripts: ['fix-ts6133-declared-not-used.js', 'fix-ts7006-implicit-any-param.js'],
        maxIterations: 1
      }
    ];

    const phaseResults = [];
    
    for (const phase of phases) {
      this.log(`\n--- ${phase.description} ---`, 'info');
      
      const phaseStart = Date.now();
      const beforeCount = await this.getErrorCount();
      
      if (beforeCount === 0) {
        this.log('🎉 No errors remaining, skipping phase', 'info');
        break;
      }
      
      // Execute phase-specific scripts
      const phaseResult = await this.executePhase(phase, beforeCount);
      phaseResults.push(phaseResult);
      
      const afterCount = await this.getErrorCount();
      const fixed = beforeCount - afterCount;
      const duration = Date.now() - phaseStart;
      
      this.log(`📊 ${phase.name}: ${beforeCount} → ${afterCount} (fixed ${fixed}) in ${duration}ms`, 'info');
      
      if (fixed === 0) {
        this.log('⚠️ No progress made in this phase', 'warn');
      }
    }
    
    return phaseResults;
  }

  async executePhase(phase, beforeCount) {
    const phaseResult = {
      name: phase.name,
      description: phase.description,
      scriptsExecuted: [],
      errorsFixed: 0,
      success: false
    };

    for (const scriptName of phase.scripts) {
      const scriptPath = path.join(__dirname, scriptName);
      
      try {
        // Check if script exists
        await fs.access(scriptPath);
        
        this.log(`🔧 Running ${scriptName}...`, 'info');
        
        if (this.options.dryRun) {
          this.log(`🔍 DRY RUN: Would execute ${scriptName}`, 'info');
          phaseResult.scriptsExecuted.push(`${scriptName} (dry run)`);
          continue;
        }
        
        // Execute the script
        const scriptResult = await this.executeScript(scriptPath);
        phaseResult.scriptsExecuted.push(scriptName);
        
        // Check for progress
        const currentCount = await this.getErrorCount();
        const progress = beforeCount - currentCount;
        
        if (progress > 0) {
          this.log(`✅ ${scriptName} fixed ${progress} errors`, 'info');
          phaseResult.errorsFixed += progress;
          beforeCount = currentCount; // Update for next iteration
        }
        
      } catch (error) {
        this.log(`⚠️ Script ${scriptName} not found or failed: ${error.message}`, 'warn');
        
        // Try to run a basic fix for this error category
        await this.executeBasicFix(phase.targetCategories[0]);
      }
    }
    
    phaseResult.success = phaseResult.errorsFixed > 0;
    return phaseResult;
  }

  async executeBasicFix(category) {
    this.log(`🔧 Applying basic ${category} fixes...`, 'info');
    
    const basicFixes = {
      syntax: 'npx eslint src --fix --quiet',
      imports: 'echo "Basic import fix would run here"',
      types: 'echo "Basic type fix would run here"',
      unused: 'npx eslint src --fix --rule "no-unused-vars: error" --quiet',
      implicit: 'echo "Basic implicit any fix would run here"'
    };
    
    const command = basicFixes[category] || 'echo "No basic fix available"';
    
    try {
      if (!this.options.dryRun) {
        await this.executeCommand(command);
      }
    } catch (error) {
      this.log(`⚠️ Basic fix failed: ${error.message}`, 'warn');
    }
  }

  async executeScript(scriptPath) {
    return new Promise((resolve, reject) => {
      const child = spawn('node', [scriptPath], {
        cwd: this.options.projectPath,
        stdio: 'pipe'
      });
      
      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        output += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Script failed with code ${code}: ${output}`));
        }
      });
      
      // Timeout handling
      setTimeout(() => {
        child.kill();
        reject(new Error('Script timeout'));
      }, this.options.timeoutSeconds * 1000);
    });
  }

  async getErrorCount() {
    try {
      await this.executeCommand('npx tsc --noEmit --skipLibCheck');
      return 0;
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      const lines = output.split('\n');
      return lines.filter(line => line.includes('error TS')).length;
    }
  }

  async executeCommand(command, allowFailure = false) {
    return new Promise((resolve, reject) => {
      exec(command, { cwd: this.options.projectPath }, (error, stdout, stderr) => {
        if (error && !allowFailure) {
          error.stdout = stdout;
          error.stderr = stderr;
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  async createSystemBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.options.projectPath, '.error-resolution-backups', `system-backup-${timestamp}`);
    
    this.log(`💾 Creating system backup in ${backupDir}...`, 'info');
    
    try {
      await fs.mkdir(backupDir, { recursive: true });
      
      // Backup critical directories
      const dirsToBackup = ['src', 'scripts', 'types'];
      for (const dir of dirsToBackup) {
        const srcPath = path.join(this.options.projectPath, dir);
        const destPath = path.join(backupDir, dir);
        
        try {
          await this.executeCommand(`cp -r "${srcPath}" "${destPath}"`);
          this.log(`✅ Backed up ${dir}`, 'info');
        } catch (error) {
          this.log(`⚠️ Could not backup ${dir}: ${error.message}`, 'warn');
        }
      }
      
      this.log(`✅ System backup completed in ${backupDir}`, 'info');
      
    } catch (error) {
      this.log(`❌ Backup failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async generateFinalReport(initialAnalysis, resolutionResult) {
    const reportPath = path.join(this.options.projectPath, 'error-resolution-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      deployment: {
        projectPath: this.options.projectPath,
        options: this.options,
        duration: Date.now() - this.startTime
      },
      initialState: initialAnalysis,
      resolutionPhases: resolutionResult,
      finalState: await this.analyzeErrors(),
      executionLog: this.executionLog,
      summary: {
        totalErrorsInitial: initialAnalysis.totalErrors,
        totalErrorsFixed: this.totalErrorsFixed,
        totalErrorsRemaining: 0, // Will be updated
        success: true,
        recommendations: []
      }
    };
    
    // Update final counts
    const finalAnalysis = await this.analyzeErrors();
    report.summary.totalErrorsRemaining = finalAnalysis.totalErrors;
    report.summary.totalErrorsFixed = initialAnalysis.totalErrors - finalAnalysis.totalErrors;
    report.summary.success = finalAnalysis.totalErrors < initialAnalysis.totalErrors;
    
    // Save report
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    this.log(`📄 Final report saved to: ${reportPath}`, 'info');
    
    // Generate human-readable summary
    const summaryPath = path.join(this.options.projectPath, 'ERROR_RESOLUTION_SUMMARY.md');
    const summaryContent = this.generateMarkdownSummary(report);
    await fs.writeFile(summaryPath, summaryContent);
    this.log(`📝 Summary report saved to: ${summaryPath}`, 'info');
    
    return report;
  }

  generateMarkdownSummary(report) {
    return `# TypeScript Error Resolution System - Deployment Report

## Summary
- **Initial Errors:** ${report.summary.totalErrorsInitial}
- **Errors Fixed:** ${report.summary.totalErrorsFixed}
- **Errors Remaining:** ${report.summary.totalErrorsRemaining}
- **Success Rate:** ${((report.summary.totalErrorsFixed / report.summary.totalErrorsInitial) * 100).toFixed(1)}%
- **Duration:** ${(report.deployment.duration / 1000).toFixed(1)} seconds

## Resolution Phases
${report.resolutionPhases.map(phase => `
### ${phase.name}
- **Description:** ${phase.description}
- **Scripts Executed:** ${phase.scriptsExecuted.join(', ')}
- **Errors Fixed:** ${phase.errorsFixed}
- **Success:** ${phase.success ? '✅' : '❌'}
`).join('')}

## Recommendations
${report.finalState.recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Steps
${report.summary.totalErrorsRemaining === 0 
  ? '🎉 All TypeScript errors have been resolved! The codebase is now clean.'
  : `⚠️ ${report.summary.totalErrorsRemaining} errors remain. Consider running additional resolution cycles or manual review.`}

---
*Generated by TypeScript Error Resolution System at ${report.timestamp}*
`;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--no-backup':
        options.backup = false;
        break;
      case '--project':
        options.projectPath = args[++i];
        break;
      case '--timeout':
        options.timeoutSeconds = parseInt(args[++i]);
        break;
      case '--help':
        console.log(`
TypeScript Error Resolution System

Usage: node deploy-and-run-error-resolution.js [options]

Options:
  --dry-run           Show what would be done without making changes
  --no-backup         Skip creating backups
  --project <path>    Project path (default: current directory)
  --timeout <seconds> Script timeout in seconds (default: 300)
  --help              Show this help message

Examples:
  node deploy-and-run-error-resolution.js
  node deploy-and-run-error-resolution.js --dry-run
  node deploy-and-run-error-resolution.js --project ./my-project --no-backup
`);
        process.exit(0);
    }
  }
  
  console.log('🚀 TypeScript Error Resolution System - Starting Deployment...\n');
  
  try {
    const system = new TypeScriptErrorResolutionSystem(options);
    const result = await system.deploy();
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log(`📊 Results: Fixed ${result.errorsFixed} out of ${result.initialErrors} errors`);
    console.log(`⏱️  Total duration: ${(result.duration / 1000).toFixed(1)} seconds`);
    
    if (result.finalErrors === 0) {
      console.log('✨ All TypeScript errors have been resolved!');
      process.exit(0);
    } else {
      console.log(`⚠️  ${result.finalErrors} errors remain - consider additional passes`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { TypeScriptErrorResolutionSystem };