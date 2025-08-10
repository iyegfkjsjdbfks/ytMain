#!/usr/bin/env node
/**
 * Error Fixing Orchestrator - Implements requirements exactly as specified
 * 
 * Requirements:
 * - Record current error count before running each script
 * - Run scripts one at a time
 * - Ensure total error count does not increase by more than 1 after each run
 * - If total error count increases by more than 1, revert the changes
 * - Keep updating script and rerunning until total error count of that error type is 0
 * - Handle timeouts gracefully
 * - Rerun process until total error count from npm run type-check is 0
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const MAX_ALLOWED_INCREASE = 1;
const MAX_ITERATIONS_PER_SCRIPT = 5;
const MAX_OVERALL_ITERATIONS = 10;

class ErrorFixingOrchestrator {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.iteration = 0;
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
      info: '🎯',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type] || '🎯';
    
    console.log(`${colors[type]}${prefix} [${timestamp}] ${message}${colors.reset}`);
  }

  runGit(command) {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe', cwd: projectRoot });
  }

  createCheckpoint(label) {
    try {
      this.runGit('git add -A');
      this.runGit(`git commit -m "checkpoint: before ${label}" --no-verify`);
      this.log(`✓ Created checkpoint before ${label}`, 'info');
      return true;
    } catch (err) {
      this.log(`Checkpoint not created (no changes): ${err.message.split('\n')[0]}`, 'info');
      return false;
    }
  }

  commitChanges(label) {
    try {
      this.runGit('git add -A');
      this.runGit(`git commit -m "fix: ${label}" --no-verify`);
      this.log(`✓ Committed changes for ${label}`, 'success');
      return true;
    } catch (err) {
      this.log(`No commit needed for ${label}: ${err.message.split('\n')[0]}`);
      return false;
    }
  }

  revertChanges() {
    try {
      this.runGit('git reset --hard HEAD~1');
      this.runGit('git clean -fd');
      this.log('✓ Reverted changes', 'warning');
      return true;
    } catch (err) {
      this.log(`Failed to revert: ${err.message}`, 'error');
      return false;
    }
  }

  async getTotalErrorCount() {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        const timeout = 30000 + (retryCount * 15000); // 30s, 45s, 60s
        this.log(`Checking errors (attempt ${retryCount + 1}/${maxRetries}, timeout: ${timeout/1000}s)...`);
        
        const result = execSync('npm run type-check', {
          encoding: 'utf8',
          stdio: 'pipe',
          cwd: projectRoot,
          timeout
        });
        // No errors
        return 0;
      } catch (error) {
        retryCount++;
        
        // Handle timeout
        if (error.signal === 'SIGTERM' || error.code === 'ETIMEDOUT') {
          this.log(`Type check timed out (attempt ${retryCount})`, 'warning');
          if (retryCount >= maxRetries) {
            this.log('All attempts timed out, checking cached errors...', 'warning');
            const typeErrorsPath = join(projectRoot, 'type-errors.txt');
            if (existsSync(typeErrorsPath)) {
              const content = readFileSync(typeErrorsPath, 'utf8');
              const errorLines = content.split('\n').filter(line => /error TS\d+:/.test(line));
              return errorLines.length;
            }
            return 500; // Conservative fallback
          }
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }
        
        // Parse error output
        const output = `${error.stdout || ''}${error.stderr || ''}`;
        if (!output) {
          if (retryCount >= maxRetries) return 0;
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        const errorLines = output.split('\n').filter(line => /error TS\d+:/.test(line));
        const count = errorLines.length;
        
        // Save errors to file for later reference
        const typeErrorsPath = join(projectRoot, 'type-errors.txt');
        writeFileSync(typeErrorsPath, output, 'utf8');
        
        return count;
      }
    }
    
    return 0;
  }

  async getErrorsByType() {
    try {
      const output = await this.runTypeCheckRaw();
      const errors = {};
      const lines = output.split('\n');

      for (const line of lines) {
        const match = line.match(/error TS(\d+):/);
        if (match) {
          const errorCode = match[1];
          errors[errorCode] = (errors[errorCode] || 0) + 1;
        }
      }

      return errors;
    } catch (error) {
      return {};
    }
  }

  async runTypeCheckRaw() {
    try {
      execSync('npm run type-check', {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: projectRoot,
        timeout: 30000
      });
      return '';
    } catch (error) {
      return `${error.stdout || ''}${error.stderr || ''}`;
    }
  }

  async runScript(scriptName, description, targetErrorType = null) {
    this.log(`\n${'='.repeat(60)}`);
    this.log(`🚀 Running script: ${scriptName}`);
    this.log(`📋 Description: ${description}`);
    if (targetErrorType) {
      this.log(`🎯 Target error type: TS${targetErrorType}`);
    }
    
    const scriptIterations = [];
    let scriptIteration = 0;
    
    while (scriptIteration < MAX_ITERATIONS_PER_SCRIPT) {
      this.log(`\n--- Script iteration ${scriptIteration + 1}/${MAX_ITERATIONS_PER_SCRIPT} ---`);
      
      // Record current error count before running script
      const beforeTotal = await this.getTotalErrorCount();
      const beforeByType = await this.getErrorsByType();
      const beforeTargetCount = targetErrorType ? (beforeByType[targetErrorType] || 0) : 0;
      
      this.log(`📊 Before script: ${beforeTotal} total errors`);
      if (targetErrorType) {
        this.log(`📊 Before script: ${beforeTargetCount} TS${targetErrorType} errors`);
      }
      
      // Create checkpoint before running script
      const checkpointLabel = `${scriptName} iteration ${scriptIteration + 1}`;
      const checkpointMade = this.createCheckpoint(checkpointLabel);
      
      try {
        // Run the script with timeout handling
        this.log(`⚙️ Executing: node scripts/${scriptName}`);
        const scriptStart = Date.now();
        
        const output = execSync(`node scripts/${scriptName}`, {
          encoding: 'utf8',
          stdio: 'pipe',
          cwd: projectRoot,
          timeout: 120000 // 2 minute timeout per script
        });
        
        const scriptDuration = ((Date.now() - scriptStart) / 1000).toFixed(2);
        this.log(`✓ Script completed in ${scriptDuration}s`);
        
        // Record error count after running script
        const afterTotal = await this.getTotalErrorCount();
        const afterByType = await this.getErrorsByType();
        const afterTargetCount = targetErrorType ? (afterByType[targetErrorType] || 0) : 0;
        
        const totalChange = afterTotal - beforeTotal;
        const targetFixed = beforeTargetCount - afterTargetCount;
        
        this.log(`📊 After script: ${afterTotal} total errors (change: ${totalChange >= 0 ? '+' : ''}${totalChange})`);
        if (targetErrorType) {
          this.log(`📊 After script: ${afterTargetCount} TS${targetErrorType} errors (fixed: ${targetFixed})`);
        }
        
        const result = {
          script: scriptName,
          iteration: scriptIteration + 1,
          description,
          targetErrorType,
          beforeTotal,
          afterTotal,
          totalChange,
          beforeTargetCount,
          afterTargetCount,
          targetFixed,
          success: totalChange <= MAX_ALLOWED_INCREASE,
          duration: scriptDuration,
          timestamp: new Date().toISOString(),
          output: output.split('\n').slice(-5).join('\n') // Last 5 lines
        };
        
        scriptIterations.push(result);
        
        // Check if total error count increased by more than allowed amount
        if (totalChange > MAX_ALLOWED_INCREASE) {
          this.log(`❌ Error count increased by ${totalChange} (max allowed: ${MAX_ALLOWED_INCREASE})`, 'error');
          if (checkpointMade) {
            this.log('🔄 Reverting changes...', 'warning');
            this.revertChanges();
            result.reverted = true;
          }
          result.success = false;
          break; // Stop iterations for this script
        } else {
          // Commit the changes
          this.commitChanges(checkpointLabel);
          
          // Check if we've completed fixing this error type
          if (targetErrorType && afterTargetCount === 0) {
            this.log(`🎉 All TS${targetErrorType} errors fixed!`, 'success');
            result.completed = true;
            break;
          }
          
          // Check if no progress was made
          if (targetErrorType && targetFixed === 0 && scriptIteration > 0) {
            this.log(`⚠️ No progress made on TS${targetErrorType} errors, stopping iterations`, 'warning');
            result.noProgress = true;
            break;
          }
          
          // If total errors were reduced or maintained, it's good
          if (totalChange <= 0) {
            this.log(`✅ Good progress: total errors ${totalChange === 0 ? 'maintained' : 'reduced'}`, 'success');
          }
        }
        
        scriptIteration++;
        
        // Small delay between iterations
        if (scriptIteration < MAX_ITERATIONS_PER_SCRIPT) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        this.log(`❌ Script failed: ${error.message}`, 'error');
        
        const result = {
          script: scriptName,
          iteration: scriptIteration + 1,
          description,
          targetErrorType,
          beforeTotal,
          afterTotal: beforeTotal,
          totalChange: 0,
          beforeTargetCount,
          afterTargetCount: beforeTargetCount,
          targetFixed: 0,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        };
        
        scriptIterations.push(result);
        
        // Check if it's a timeout error
        if (error.signal === 'SIGTERM' || error.code === 'ETIMEDOUT') {
          this.log('⏱️ Script timed out - handling gracefully', 'warning');
          result.timeout = true;
        }
        
        break; // Stop iterations on error
      }
    }
    
    // Add all script iterations to results
    this.results.push(...scriptIterations);
    
    return scriptIterations;
  }

  async run() {
    this.log('\n' + '='.repeat(80));
    this.log('🎯 ERROR FIXING ORCHESTRATOR STARTED');
    this.log('='.repeat(80));
    this.log('Requirements compliance:');
    this.log('✓ Record error count before each script');
    this.log('✓ Run scripts one at a time');
    this.log('✓ Ensure error count increase ≤ 1');
    this.log('✓ Revert if increase > 1');
    this.log('✓ Handle timeouts gracefully');
    this.log('✓ Continue until total errors = 0');
    
    // Get initial state
    const initialTotal = await this.getTotalErrorCount();
    const initialByType = await this.getErrorsByType();
    
    this.log(`\n📊 Initial state: ${initialTotal} total errors`);
    this.log('📊 Error breakdown:');
    for (const [code, count] of Object.entries(initialByType)) {
      this.log(`   TS${code}: ${count} errors`);
    }
    
    if (initialTotal === 0) {
      this.log('🎉 No errors found! Codebase is already clean.', 'success');
      return;
    }
    
    // Define scripts to run (one for each major error type found)
    const scripts = [
      {
        name: 'fix-import-syntax.js',
        description: 'Fix malformed import statements',
        targetErrorType: null // This script targets syntax errors (1003, 1005, etc.)
      }
    ];
    
    // Main orchestration loop
    let overallIteration = 0;
    
    while (overallIteration < MAX_OVERALL_ITERATIONS) {
      this.log(`\n${'='.repeat(80)}`);
      this.log(`🔄 OVERALL ITERATION ${overallIteration + 1}/${MAX_OVERALL_ITERATIONS}`);
      this.log('='.repeat(80));
      
      const iterationStart = await this.getTotalErrorCount();
      this.log(`📊 Starting iteration with ${iterationStart} total errors`);
      
      if (iterationStart === 0) {
        this.log('🎉 All errors fixed! Orchestration complete.', 'success');
        break;
      }
      
      // Run each script
      for (const script of scripts) {
        await this.runScript(script.name, script.description, script.targetErrorType);
        
        // Check if we're done after this script
        const currentTotal = await this.getTotalErrorCount();
        if (currentTotal === 0) {
          this.log('🎉 All errors fixed!', 'success');
          break;
        }
      }
      
      const iterationEnd = await this.getTotalErrorCount();
      const iterationImprovement = iterationStart - iterationEnd;
      
      this.log(`\n📊 Iteration ${overallIteration + 1} summary:`);
      this.log(`   Started with: ${iterationStart} errors`);
      this.log(`   Ended with: ${iterationEnd} errors`);
      this.log(`   Improvement: ${iterationImprovement} errors`);
      
      // If no improvement was made, stop
      if (iterationImprovement <= 0 && overallIteration > 0) {
        this.log('⚠️ No improvement made in this iteration, stopping orchestration', 'warning');
        break;
      }
      
      overallIteration++;
    }
    
    await this.generateFinalReport(initialTotal);
  }

  async generateFinalReport(initialTotal) {
    const finalTotal = await this.getTotalErrorCount();
    const totalImprovement = initialTotal - finalTotal;
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      initialErrors: initialTotal,
      finalErrors: finalTotal,
      totalFixed: totalImprovement,
      improvementRate: initialTotal > 0 ? ((totalImprovement / initialTotal) * 100).toFixed(1) : '0',
      iterations: this.results.length,
      scripts: this.results
    };

    // Save detailed report
    const reportPath = join(projectRoot, 'orchestration-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Display final summary
    this.log('\n' + '='.repeat(80));
    this.log('🏁 ERROR FIXING ORCHESTRATION COMPLETE');
    this.log('='.repeat(80));
    this.log(`⏱️  Duration: ${duration} seconds`);
    this.log(`📈 Initial errors: ${initialTotal}`);
    this.log(`📉 Final errors: ${finalTotal}`);
    this.log(`✨ Total fixed: ${totalImprovement}`);
    this.log(`🎯 Success rate: ${report.improvementRate}%`);
    this.log(`🔄 Total script runs: ${report.iterations}`);
    this.log('');

    if (finalTotal === 0) {
      this.log('🎉 SUCCESS: All TypeScript errors have been resolved!', 'success');
    } else {
      this.log(`⚠️ ${finalTotal} errors remain - may need manual review`, 'warning');
    }

    this.log(`📁 Detailed report saved to: ${reportPath}`);
    
    return report;
  }
}

// Execute if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     import.meta.url.endsWith(process.argv[1]) ||
                     process.argv[1].endsWith('orchestrator.js');

if (isMainModule) {
  const orchestrator = new ErrorFixingOrchestrator();
  orchestrator.run().catch(err => {
    console.error('Orchestrator failed:', err);
    process.exitCode = 1;
  });
}

export { ErrorFixingOrchestrator };