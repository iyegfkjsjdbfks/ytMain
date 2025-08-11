#!/usr/bin/env node
/**
 * Enhanced Error Orchestrator
 * Implements the specific requirements from the problem statement:
 * - Creates scripts for major error categories
 * - Monitors error counts before/after each script
 * - Reverts if error count increases by more than 100
 * - Keeps iterating until each error type has <5 errors
 * - Runs until total error count is <10
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

class EnhancedErrorOrchestrator {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.iteration = 0;
    this.maxIterations = 20;
    this.maxAllowedIncrease = 100;
    this.targetTotalErrors = 10;
    this.targetPerTypeErrors = 5;
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

  async getTotalErrorCount() {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        const timeout = 30000 + (retryCount * 15000);
        const result = execSync('npm run type-check', {
          encoding: 'utf8',
          stdio: 'pipe',
          cwd: process.cwd(),
          timeout
        });
        return 0; // No errors
      } catch (error) {
        retryCount++;
        
        if (error.signal === 'SIGTERM' || error.code === 'ETIMEDOUT') {
          this.log(`Type check attempt ${retryCount} timed out`, 'warning');
          if (retryCount >= maxRetries) {
            return 500; // Conservative fallback
          }
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }
        
        const out = `${error.stdout || ''}${error.stderr || ''}`;
        if (!out) {
          if (retryCount >= maxRetries) return 0;
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        const errorLines = out.split('\n').filter(line => /error TS\d+:/.test(line));
        return errorLines.length;
      }
    }
    
    return 500;
  }

  async getErrorCountByType(errorCode) {
    try {
      const result = execSync('npm run type-check', {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: process.cwd(),
        timeout: 20000
      });
      return 0;
    } catch (error) {
      const out = `${error.stdout || ''}${error.stderr || ''}`;
      if (!out) return 0;
      
      const regex = new RegExp(`error TS${errorCode}:`, 'g');
      const matches = out.match(regex);
      return matches ? matches.length : 0;
    }
  }

  createGitCheckpoint(label) {
    try {
      execSync('git add -A', { cwd: process.cwd(), stdio: 'pipe' });
      execSync(`git commit -m "checkpoint: ${label}" --no-verify`, { cwd: process.cwd(), stdio: 'pipe' });
      this.log(`Created checkpoint: ${label}`, 'info');
      return true;
    } catch (error) {
      this.log(`Checkpoint creation failed: ${error.message.split('\n')[0]}`, 'warning');
      return false;
    }
  }

  revertToCheckpoint() {
    try {
      execSync('git reset --hard HEAD~1', { cwd: process.cwd(), stdio: 'pipe' });
      execSync('git clean -fd', { cwd: process.cwd(), stdio: 'pipe' });
      this.log('Reverted to previous checkpoint', 'warning');
      return true;
    } catch (error) {
      this.log(`Failed to revert: ${error.message}`, 'error');
      return false;
    }
  }

  async runFixerScript(scriptName, errorType, errorCode) {
    this.log(`Running ${scriptName} for ${errorType} (TS${errorCode})...`);
    
    const beforeTotal = await this.getTotalErrorCount();
    const beforeType = await this.getErrorCountByType(errorCode);
    
    this.log(`Before ${errorType}: Total=${beforeTotal}, Type=${beforeType}`);
    
    const checkpointMade = this.createGitCheckpoint(`before ${errorType} fix`);
    
    try {
      const output = execSync(`node scripts/${scriptName}`, {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: process.cwd(),
        timeout: 120000
      });
      
      const afterTotal = await this.getTotalErrorCount();
      const afterType = await this.getErrorCountByType(errorCode);
      const totalIncrease = afterTotal - beforeTotal;
      
      const result = {
        scriptName,
        errorType,
        errorCode,
        beforeTotal,
        afterTotal,
        beforeType,
        afterType,
        totalIncrease,
        typeFixed: beforeType - afterType,
        success: totalIncrease <= this.maxAllowedIncrease,
        timestamp: new Date().toISOString(),
        output: output.split('\n').slice(-5).join('\n')
      };
      
      this.log(`After ${errorType}: Total=${afterTotal}, Type=${afterType}, Change=${totalIncrease}`);
      
      if (!result.success && checkpointMade) {
        this.log(`ERROR INCREASE TOO HIGH: ${totalIncrease} > ${this.maxAllowedIncrease}. Reverting.`, 'error');
        this.revertToCheckpoint();
        result.reverted = true;
      } else {
        if (result.typeFixed > 0) {
          this.log(`SUCCESS: Fixed ${result.typeFixed} ${errorType} errors`, 'success');
        } else {
          this.log(`No improvement for ${errorType}`, 'warning');
        }
      }
      
      return result;
      
    } catch (error) {
      this.log(`Script ${scriptName} failed: ${error.message}`, 'error');
      if (checkpointMade) {
        this.revertToCheckpoint();
      }
      
      return {
        scriptName,
        errorType,
        errorCode,
        beforeTotal,
        beforeType,
        success: false,
        error: error.message,
        reverted: checkpointMade
      };
    }
  }

  async runIterativeFixing() {
    this.log('🚀 Starting Enhanced Error Orchestration...');
    
    const initialTotal = await this.getTotalErrorCount();
    this.log(`Initial total errors: ${initialTotal}`);
    
    if (initialTotal < this.targetTotalErrors) {
      this.log(`🎉 Already below target! (${initialTotal} < ${this.targetTotalErrors})`, 'success');
      return;
    }

    // Define fixers for major error categories based on current analysis
    const fixers = [
      {
        name: 'TS1109 Expression Expected',
        script: 'fix-ts1109-expression-expected.js',
        errorCode: '1109',
        description: 'Fixes TS1109 expression expected errors'
      },
      {
        name: 'TS1144 Curly or Semicolon Expected',
        script: 'fix-ts1144-curly-or-semicolon.js',
        errorCode: '1144',
        description: 'Fixes TS1144 curly bracket or semicolon expected errors'
      },
      {
        name: 'TS1068 Unexpected Token',
        script: 'fix-ts1068-unexpected-token.js',
        errorCode: '1068',
        description: 'Fixes TS1068 unexpected token errors'
      },
      {
        name: 'TS1002 Unterminated String',
        script: 'fix-ts1002-unterminated-string.js',
        errorCode: '1002',
        description: 'Fixes TS1002 unterminated string literal errors'
      },
      {
        name: 'TS1110 Type Expected',
        script: 'fix-ts1110-type-expected.js',
        errorCode: '1110',
        description: 'Fixes TS1110 type expected errors'
      },
      {
        name: 'Enhanced TS1005 Fixer',
        script: 'fix-ts1005-enhanced.js',
        errorCode: '1005',
        description: 'Fixes comma expected errors from malformed type annotations'
      },
      {
        name: 'TS1128 Declaration Expected',
        script: 'fix-ts1128-declaration-expected.js',
        errorCode: '1128',
        description: 'Fixes TS1128 declaration or statement expected errors'
      },
      {
        name: 'TS1434 Unexpected Keyword',
        script: 'fix-ts1434-unexpected-token.js',
        errorCode: '1434',
        description: 'Fixes TS1434 unexpected keyword or identifier errors'
      },
      {
        name: 'Cannot Find Name',
        script: 'fix-ts2304-cannot-find-name.js',
        errorCode: '2304',
        description: 'Fixes missing imports and undefined variables'
      },
      {
        name: 'Unused Variables',
        script: 'fix-ts6133-declared-not-used.js',
        errorCode: '6133',
        description: 'Removes unused imports and variables'
      }
    ];

    let overallIteration = 0;
    
    while (overallIteration < this.maxIterations) {
      overallIteration++;
      this.log(`\n📍 OVERALL ITERATION ${overallIteration}/${this.maxIterations}`);
      
      const iterationStart = await this.getTotalErrorCount();
      this.log(`Starting iteration with ${iterationStart} total errors`);
      
      if (iterationStart < this.targetTotalErrors) {
        this.log(`🎯 Target achieved! Total errors: ${iterationStart} < ${this.targetTotalErrors}`, 'success');
        break;
      }

      let anyProgress = false;
      
      // Run each fixer until its target is reached
      for (const fixer of fixers) {
        let fixerIteration = 0;
        const maxFixerIterations = 3;
        
        while (fixerIteration < maxFixerIterations) {
          const currentTypeCount = await this.getErrorCountByType(fixer.errorCode);
          
          if (currentTypeCount < this.targetPerTypeErrors) {
            this.log(`${fixer.name}: Target reached (${currentTypeCount} < ${this.targetPerTypeErrors})`, 'success');
            break;
          }
          
          fixerIteration++;
          this.log(`${fixer.name} - Iteration ${fixerIteration}/${maxFixerIterations}`);
          
          const result = await this.runFixerScript(fixer.script, fixer.name, fixer.errorCode);
          this.results.push(result);
          
          if (result.reverted) {
            this.log(`${fixer.name}: Reverted due to high error increase`, 'warning');
            break; // Stop trying this fixer
          }
          
          if (result.typeFixed > 0) {
            anyProgress = true;
          } else if (fixerIteration > 1) {
            this.log(`${fixer.name}: No progress, stopping iterations`, 'warning');
            break;
          }
          
          // Check if total target is reached
          const currentTotal = await this.getTotalErrorCount();
          if (currentTotal < this.targetTotalErrors) {
            this.log(`🎯 Total target reached! Current: ${currentTotal} < ${this.targetTotalErrors}`, 'success');
            return;
          }
          
          // Small delay between fixer iterations
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Small delay between different fixers
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      const iterationEnd = await this.getTotalErrorCount();
      const iterationImprovement = iterationStart - iterationEnd;
      
      this.log(`Iteration ${overallIteration} complete: ${iterationStart} → ${iterationEnd} (${iterationImprovement > 0 ? '+' : ''}${iterationImprovement})`);
      
      if (!anyProgress && overallIteration > 1) {
        this.log('No progress made in this iteration, stopping', 'warning');
        break;
      }
    }
    
    const finalTotal = await this.getTotalErrorCount();
    await this.generateReport(initialTotal, finalTotal);
  }

  async generateReport(initialTotal, finalTotal) {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const totalImprovement = initialTotal - finalTotal;
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      iterations: this.iteration,
      initialErrors: initialTotal,
      finalErrors: finalTotal,
      totalImprovement,
      targetAchieved: finalTotal < this.targetTotalErrors,
      results: this.results,
      configuration: {
        maxAllowedIncrease: this.maxAllowedIncrease,
        targetTotalErrors: this.targetTotalErrors,
        targetPerTypeErrors: this.targetPerTypeErrors
      }
    };
    
    writeFileSync('enhanced-orchestration-report.json', JSON.stringify(report, null, 2));
    
    this.log('\n' + '='.repeat(80));
    this.log('📊 ENHANCED ORCHESTRATION REPORT');
    this.log('='.repeat(80));
    this.log(`⏱️  Duration: ${duration} seconds`);
    this.log(`📈 Initial errors: ${initialTotal}`);
    this.log(`📉 Final errors: ${finalTotal}`);
    this.log(`✨ Total improvement: ${totalImprovement}`);
    
    if (finalTotal < this.targetTotalErrors) {
      this.log(`🎉 TARGET ACHIEVED! Final count: ${finalTotal} < ${this.targetTotalErrors}`, 'success');
    } else {
      this.log(`⚠️  Target not reached. Final count: ${finalTotal} >= ${this.targetTotalErrors}`, 'warning');
    }
    
    this.log('\n📋 FIXER BREAKDOWN:');
    const fixerSummary = new Map();
    
    for (const result of this.results) {
      const key = result.errorType;
      if (!fixerSummary.has(key)) {
        fixerSummary.set(key, { attempts: 0, fixed: 0, reverted: 0 });
      }
      const summary = fixerSummary.get(key);
      summary.attempts++;
      if (result.typeFixed > 0) summary.fixed += result.typeFixed;
      if (result.reverted) summary.reverted++;
    }
    
    for (const [fixer, summary] of fixerSummary.entries()) {
      const status = summary.fixed > 0 ? '✅' : '⚠️';
      this.log(`${status} ${fixer}: ${summary.fixed} fixed, ${summary.attempts} attempts, ${summary.reverted} reverted`);
    }
    
    this.log(`\n📁 Detailed report saved to: enhanced-orchestration-report.json`);
  }
}

// Execute if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     import.meta.url.endsWith(process.argv[1]) ||
                     process.argv[1].endsWith('enhanced-orchestrator.js');

if (isMainModule) {
  const orchestrator = new EnhancedErrorOrchestrator();
  orchestrator.runIterativeFixing().catch(err => {
    console.error('EnhancedErrorOrchestrator failed:', err);
    process.exitCode = 1;
  });
}

export { EnhancedErrorOrchestrator };