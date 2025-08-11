#!/usr/bin/env node
/**
 * Comprehensive TypeScript Error Orchestrator
 * Implements the requirements: systematic fixing with error count monitoring
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class ComprehensiveOrchestrator {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.maxAllowedIncrease = 10; // Conservative increase limit
    this.checkpoints = [];
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
      warning: '⚠️',
      error: '❌'
    }[type] || '🔧';
    
    console.log(`${colors[type]}${prefix} [${timestamp}] ${message}${colors.reset}`);
  }

  async getTotalErrorCount() {
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

  async getErrorCountByType(errorCode) {
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
      const regex = new RegExp(`error TS${errorCode}:`, 'g');
      const matches = output.match(regex);
      return matches ? matches.length : 0;
    }
  }

  createCheckpoint(description) {
    try {
      execSync('git add -A', { cwd: projectRoot, stdio: 'pipe' });
      execSync(`git commit -m "checkpoint: ${description}" --no-verify`, { 
        cwd: projectRoot, 
        stdio: 'pipe' 
      });
      this.log(`Created checkpoint: ${description}`, 'info');
      return true;
    } catch (error) {
      this.log(`Checkpoint creation failed: ${error.message.split('\n')[0]}`, 'warning');
      return false;
    }
  }

  revertChanges() {
    try {
      execSync('git reset --hard HEAD~1', { cwd: projectRoot, stdio: 'pipe' });
      execSync('git clean -fd', { cwd: projectRoot, stdio: 'pipe' });
      this.log('Reverted to previous checkpoint', 'warning');
      return true;
    } catch (error) {
      this.log(`Failed to revert: ${error.message}`, 'error');
      return false;
    }
  }

  async runFixerScript(scriptName, errorCode, description) {
    this.log(`\n=== Running ${scriptName} for TS${errorCode} (${description}) ===`);
    
    const beforeTotal = await this.getTotalErrorCount();
    const beforeType = await this.getErrorCountByType(errorCode);
    
    this.log(`BEFORE: Total errors: ${beforeTotal}, TS${errorCode} errors: ${beforeType}`);
    
    if (beforeType === 0) {
      this.log(`No TS${errorCode} errors remaining, skipping`, 'info');
      return { success: true, skipped: true, beforeTotal, afterTotal: beforeTotal };
    }

    const checkpointCreated = this.createCheckpoint(`before ${scriptName}`);
    
    try {
      // Run the fixer script
      const scriptPath = join(projectRoot, 'scripts', scriptName);
      if (!existsSync(scriptPath)) {
        this.log(`Script not found: ${scriptPath}`, 'error');
        return { success: false, error: 'Script not found' };
      }

      const output = execSync(`node scripts/${scriptName}`, {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: projectRoot,
        timeout: 180000 // 3 minutes timeout
      });
      
      // Check error counts after running script
      const afterTotal = await this.getTotalErrorCount();
      const afterType = await this.getErrorCountByType(errorCode);
      const totalChange = afterTotal - beforeTotal;
      const typeFixed = beforeType - afterType;
      
      this.log(`AFTER: Total errors: ${afterTotal}, TS${errorCode} errors: ${afterType}`);
      this.log(`RESULT: Total change: ${totalChange}, TS${errorCode} fixed: ${typeFixed}`);

      const result = {
        scriptName,
        errorCode,
        description,
        beforeTotal,
        afterTotal,
        beforeType,
        afterType,
        totalChange,
        typeFixed,
        success: totalChange <= this.maxAllowedIncrease,
        timestamp: new Date().toISOString()
      };

      // Check if we should revert
      if (totalChange > this.maxAllowedIncrease && checkpointCreated) {
        this.log(`ERROR INCREASE TOO HIGH: ${totalChange} > ${this.maxAllowedIncrease}. Reverting.`, 'error');
        this.revertChanges();
        result.reverted = true;
        result.success = false;
      } else if (typeFixed > 0) {
        this.log(`SUCCESS: Fixed ${typeFixed} TS${errorCode} errors!`, 'success');
      } else {
        this.log(`No improvement for TS${errorCode}`, 'warning');
      }

      return result;

    } catch (error) {
      this.log(`Script ${scriptName} failed: ${error.message}`, 'error');
      if (checkpointCreated) {
        this.revertChanges();
      }

      return {
        scriptName,
        errorCode,
        description,
        beforeTotal,
        beforeType,
        success: false,
        error: error.message,
        reverted: checkpointCreated
      };
    }
  }

  async run() {
    this.log('🚀 Starting Comprehensive TypeScript Error Orchestrator...');
    
    const initialTotal = await this.getTotalErrorCount();
    this.log(`Initial total errors: ${initialTotal}`);

    if (initialTotal === 0) {
      this.log('🎉 No TypeScript errors found!', 'success');
      return;
    }

    // Define fix sequence based on error frequency analysis
    const fixSequence = [
      // High impact fixes first
      {
        script: 'fix-ts7006-implicit-any-param-enhanced.js',
        errorCode: '7006',
        description: 'Parameter implicit any types',
        iterations: 3
      },
      {
        script: 'fix-ts6133-unused-vars-enhanced.js',
        errorCode: '6133',
        description: 'Unused variable declarations',
        iterations: 1
      },
      {
        script: 'fix-ts2339-property-enhanced.js',
        errorCode: '2339',
        description: 'Property does not exist errors',
        iterations: 2
      },
      
      // Use existing scripts for other error types
      {
        script: 'fix-ts2304-cannot-find-name.js',
        errorCode: '2304',
        description: 'Cannot find name errors',
        iterations: 1
      },
      {
        script: 'fix-ts2322-type-not-assignable.js',
        errorCode: '2322',
        description: 'Type not assignable errors',
        iterations: 1
      },
      {
        script: 'fix-ts2300-duplicate-identifier.js',
        errorCode: '2300',
        description: 'Duplicate identifier errors',
        iterations: 1
      }
    ];

    // Execute fix sequence
    for (const config of fixSequence) {
      for (let iteration = 1; iteration <= config.iterations; iteration++) {
        const result = await this.runFixerScript(
          config.script, 
          config.errorCode, 
          `${config.description} (iteration ${iteration}/${config.iterations})`
        );
        
        this.results.push({...result, iteration});

        // If we fixed everything of this type or script was skipped, move to next
        if (result.skipped || (result.afterType !== undefined && result.afterType === 0)) {
          this.log(`All TS${config.errorCode} errors resolved!`, 'success');
          break;
        }

        // If no improvement and not the first iteration, move on
        if (iteration > 1 && result.typeFixed === 0) {
          this.log(`No further improvement for TS${config.errorCode}, moving to next`, 'info');
          break;
        }

        // Check if we've reached zero total errors
        const currentTotal = await this.getTotalErrorCount();
        if (currentTotal === 0) {
          this.log('🎉 All TypeScript errors resolved!', 'success');
          await this.generateFinalReport(initialTotal, currentTotal);
          return;
        }

        // Small delay between iterations
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Generate final report
    const finalTotal = await this.getTotalErrorCount();
    await this.generateFinalReport(initialTotal, finalTotal);
  }

  async generateFinalReport(initialTotal, finalTotal) {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const totalFixed = initialTotal - finalTotal;
    const improvementRate = initialTotal > 0 ? ((totalFixed / initialTotal) * 100).toFixed(1) : '0';

    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      initialErrors: initialTotal,
      finalErrors: finalTotal,
      totalFixed,
      improvementRate: `${improvementRate}%`,
      results: this.results,
      summary: {
        totalRuns: this.results.length,
        successfulRuns: this.results.filter(r => r.success).length,
        revertedRuns: this.results.filter(r => r.reverted).length
      }
    };

    // Save report
    const reportPath = join(projectRoot, 'comprehensive-orchestration-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Display summary
    this.log('\n' + '='.repeat(80));
    this.log('📊 COMPREHENSIVE ORCHESTRATION REPORT');
    this.log('='.repeat(80));
    this.log(`⏱️  Duration: ${duration} seconds`);
    this.log(`📈 Initial errors: ${initialTotal}`);
    this.log(`📉 Final errors: ${finalTotal}`);
    this.log(`✨ Total fixed: ${totalFixed}`);
    this.log(`🎯 Improvement rate: ${improvementRate}%`);
    this.log('');

    // Individual fixer results
    this.log('📋 FIXER BREAKDOWN:');
    for (const result of this.results) {
      const status = result.success ? '✅' : (result.reverted ? '🔄' : '❌');
      const fixed = result.typeFixed || 0;
      const iterationInfo = result.iteration > 1 ? ` (iter ${result.iteration})` : '';
      this.log(`${status} ${result.scriptName}${iterationInfo}: ${fixed} TS${result.errorCode} errors fixed`);
    }

    this.log('');
    this.log(`📁 Detailed report saved to: ${reportPath}`);

    // Next steps
    this.log('\n📝 NEXT STEPS:');
    if (finalTotal === 0) {
      this.log('🎉 All TypeScript errors resolved!', 'success');
      this.log('• Run npm run validate to verify the build');
      this.log('• Run tests to ensure functionality is preserved');
    } else {
      this.log(`• ${finalTotal} errors remaining`);
      this.log('• Run npm run type-check to see remaining errors');
      this.log('• Consider manual review for complex errors');
      if (finalTotal < initialTotal) {
        this.log(`✅ Good progress: ${totalFixed} errors fixed!`, 'success');
      }
    }

    return report;
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new ComprehensiveOrchestrator();
  orchestrator.run().catch(err => {
    console.error('ComprehensiveOrchestrator failed:', err);
    process.exitCode = 1;
  });
}

export default ComprehensiveOrchestrator;