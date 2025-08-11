#!/usr/bin/env node
/**
 * Enhanced Comprehensive Error Orchestrator
 * Systematically fixes all TypeScript errors by category until 0 errors remain
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

class ComprehensiveErrorOrchestrator {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.iteration = 0;
    this.maxIterations = 50;
    this.maxAllowedIncrease = 50;
    this.targetTotalErrors = 0; // Goal: 0 errors
    this.targetPerTypeErrors = 0; // Goal: 0 errors per type
    this.timeout = 180000; // 3 minutes per script
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
        const output = execSync('npm run type-check', {
          encoding: 'utf8',
          stdio: 'pipe',
          cwd: process.cwd(),
          timeout: 120000
        });
        return 0; // No errors if type-check succeeds
      } catch (error) {
        const output = error.stdout || error.stderr || '';
        const foundMatch = output.match(/Found (\d+) error/);
        if (foundMatch) {
          return parseInt(foundMatch[1], 10);
        }
        
        retryCount++;
        if (retryCount < maxRetries) {
          this.log(`Type check attempt ${retryCount} failed, retrying...`, 'warning');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    this.log('Unable to get error count after retries', 'error');
    return -1;
  }

  async getErrorCountByType(errorCode) {
    try {
      const output = execSync('npm run type-check', {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: process.cwd(),
        timeout: 120000
      });
      return 0; // No errors of this type if type-check succeeds
    } catch (error) {
      const out = error.stdout || error.stderr || '';
      const regex = new RegExp(`error TS${errorCode}:`, 'g');
      const matches = out.match(regex);
      return matches ? matches.length : 0;
    }
  }

  createGitCheckpoint(label) {
    try {
      execSync('git add -A', { cwd: process.cwd(), stdio: 'pipe' });
      execSync(`git commit -m "checkpoint: ${label}" --no-verify || true`, { cwd: process.cwd(), stdio: 'pipe' });
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
        timeout: this.timeout
      });
      
      // Wait a bit for file system to settle
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
        output: output.split('\n').slice(-10).join('\n')
      };
      
      this.log(`After ${errorType}: Total=${afterTotal}, Type=${afterType}, Change=${totalIncrease}`);
      
      if (!result.success && checkpointMade) {
        this.log(`ERROR INCREASE TOO HIGH: ${totalIncrease} > ${this.maxAllowedIncrease}. Reverting.`, 'error');
        this.revertToCheckpoint();
        result.reverted = true;
      } else {
        if (result.typeFixed > 0 || totalIncrease < 0) {
          this.log(`SUCCESS: Fixed ${result.typeFixed} ${errorType} errors (total change: ${totalIncrease})`, 'success');
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

  async runFixingIteration() {
    const currentTotal = await this.getTotalErrorCount();
    this.log(`Starting iteration with ${currentTotal} total errors`);
    
    if (currentTotal <= this.targetTotalErrors) {
      this.log(`🎯 TARGET ACHIEVED! Total errors: ${currentTotal} <= ${this.targetTotalErrors}`, 'success');
      return { targetAchieved: true, totalErrors: currentTotal };
    }

    const iterationResults = [];
    
    // Define error fixing strategies in order of priority
    const errorFixers = [
      // High priority: Module resolution and basic setup
      { script: 'fix-ts2307-cannot-find-module.js', type: 'Module Resolution', code: '2307' },
      { script: 'fix-ts2875-jsx-runtime.js', type: 'JSX Runtime', code: '2875' },
      { script: 'fix-ts2688-type-definitions.js', type: 'Type Definitions', code: '2688' },
      
      // Medium priority: Implicit any types  
      { script: 'fix-ts7006-implicit-any-param.js', type: 'Implicit Any Parameters', code: '7006' },
      { script: 'fix-ts7031-binding-element-any.js', type: 'Binding Element Any', code: '7031' },
      { script: 'fix-ts7008-member-implicit-any.js', type: 'Member Implicit Any', code: '7008' },
      { script: 'fix-ts2304-cannot-find-name.js', type: 'Cannot Find Name', code: '2304' },
      
      // Lower priority: Property and type issues
      { script: 'fix-ts2339-property-errors.js', type: 'Property Does Not Exist', code: '2339' },
      { script: 'fix-ts2322-type-not-assignable.js', type: 'Type Not Assignable', code: '2322' },
      { script: 'fix-ts2345-argument-type.js', type: 'Argument Type', code: '2345' },
      { script: 'fix-ts2739-missing-properties.js', type: 'Missing Properties', code: '2739' },
      
      // Cleanup: Unused variables and duplicates  
      { script: 'fix-ts6133-declared-not-used.js', type: 'Unused Variables', code: '6133' },
      { script: 'fix-ts2300-duplicate-identifier.js', type: 'Duplicate Identifiers', code: '2300' },
    ];

    let iterationProgress = false;
    
    for (const fixer of errorFixers) {
      const typeCount = await this.getErrorCountByType(fixer.code);
      
      if (typeCount <= this.targetPerTypeErrors) {
        this.log(`✅ ${fixer.type}: Target reached (${typeCount} <= ${this.targetPerTypeErrors})`);
        continue;
      }
      
      this.log(`🎯 ${fixer.type}: ${typeCount} errors to fix`);
      
      // Run the fixer up to 3 times for this error type
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && (await this.getErrorCountByType(fixer.code)) > this.targetPerTypeErrors) {
        attempts++;
        this.log(`${fixer.type} - Iteration ${attempts}/${maxAttempts}`);
        
        const result = await this.runFixerScript(fixer.script, fixer.type, fixer.code);
        iterationResults.push(result);
        
        if (result.typeFixed > 0 || result.totalIncrease < 0) {
          iterationProgress = true;
        }
        
        // If no progress, break early
        if (result.typeFixed === 0 && result.totalIncrease >= 0) {
          this.log(`⚠️ ${fixer.type}: No progress, stopping iterations`);
          break;
        }
      }
    }
    
    const finalTotal = await this.getTotalErrorCount();
    const totalChange = finalTotal - currentTotal;
    
    this.log(`Iteration ${this.iteration} complete: ${currentTotal} → ${finalTotal} (${totalChange >= 0 ? '+' : ''}${totalChange})`);
    
    return {
      totalErrors: finalTotal,
      iterationResults,
      progress: iterationProgress,
      change: totalChange
    };
  }

  async run() {
    this.log('🚀 Starting Comprehensive Error Orchestration...');
    
    const initialErrors = await this.getTotalErrorCount();
    this.log(`Initial total errors: ${initialErrors}`);
    
    if (initialErrors <= this.targetTotalErrors) {
      this.log(`🎯 Already at target! Total errors: ${initialErrors}`, 'success');
      return;
    }
    
    while (this.iteration < this.maxIterations) {
      this.iteration++;
      this.log(`\n📍 OVERALL ITERATION ${this.iteration}/${this.maxIterations}`);
      
      const iterationResult = await this.runFixingIteration();
      
      if (iterationResult.targetAchieved) {
        this.log(`🎯 TARGET ACHIEVED IN ${this.iteration} ITERATIONS!`, 'success');
        break;
      }
      
      if (!iterationResult.progress) {
        this.log('⚠️ No progress made in this iteration, stopping', 'warning');
        break;
      }
      
      // Add results to global results
      if (iterationResult.iterationResults) {
        this.results.push(...iterationResult.iterationResults);
      }
      
      // Check if we reached the target
      if (iterationResult.totalErrors <= this.targetTotalErrors) {
        this.log(`🎯 TARGET ACHIEVED! Final errors: ${iterationResult.totalErrors}`, 'success');
        break;
      }
    }
    
    await this.generateReport();
  }

  async generateReport() {
    const finalErrors = await this.getTotalErrorCount();
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    
    this.log('\n' + '='.repeat(80));
    this.log('📊 COMPREHENSIVE ORCHESTRATION REPORT');
    this.log('='.repeat(80));
    this.log(`⏱️  Duration: ${duration} seconds`);
    this.log(`📈 Initial errors: ${this.results.length > 0 ? this.results[0].beforeTotal : 'unknown'}`);
    this.log(`📉 Final errors: ${finalErrors}`);
    
    if (finalErrors <= this.targetTotalErrors) {
      this.log(`🎯 TARGET ACHIEVED! All errors fixed!`, 'success');
    } else {
      this.log(`⚠️  Target not reached. Final count: ${finalErrors} > ${this.targetTotalErrors}`, 'warning');
    }
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      iterations: this.iteration,
      finalErrors,
      targetAchieved: finalErrors <= this.targetTotalErrors,
      results: this.results,
      configuration: {
        maxAllowedIncrease: this.maxAllowedIncrease,
        targetTotalErrors: this.targetTotalErrors,
        targetPerTypeErrors: this.targetPerTypeErrors
      }
    };
    
    writeFileSync('comprehensive-orchestration-report.json', JSON.stringify(report, null, 2));
    this.log('📁 Detailed report saved to: comprehensive-orchestration-report.json');
  }
}

const orchestrator = new ComprehensiveErrorOrchestrator();
orchestrator.run().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});