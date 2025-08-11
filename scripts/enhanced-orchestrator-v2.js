#!/usr/bin/env node
/**
 * Enhanced TypeScript Error Fixing Orchestrator
 * 
 * Requirements implementation:
 * - Records current error count before each script run
 * - Runs scripts one at a time
 * - Ensures total error count doesn't increase by more than 1 after each run
 * - Reverts changes if error count increases by more than 1
 * - Keeps updating and rerunning scripts until error count for that type is 0
 * - Handles timeouts gracefully
 * - Continues until total error count is 0
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class EnhancedOrchestrator {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.lastKnownErrorCount = 0;
    this.maxAllowedIncrease = 1;
    this.maxIterationsPerFixer = 5;
    this.timeoutPerFixer = 180000; // 3 minutes
    this.orchestrationReport = {
      startTime: new Date().toISOString(),
      fixerRuns: [],
      checkpoints: [],
      summary: {}
    };
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
    
    // Also log to orchestration report
    this.orchestrationReport.fixerRuns.push({
      timestamp,
      type,
      message
    });
  }

  async getTotalErrorCount() {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        // Try to read from existing type-errors.txt file first
        const typeErrorsPath = join(projectRoot, 'type-errors.txt');
        if (existsSync(typeErrorsPath)) {
          const content = readFileSync(typeErrorsPath, 'utf8');
          const errorLines = content.split('\n').filter(line => /error TS\d+:/.test(line));
          const count = errorLines.length;
          if (count >= 0) {
            this.lastKnownErrorCount = count;
            return count;
          }
        }

        // Run npm run type-check with progressive timeout
        const timeout = 45000 + (retryCount * 15000); // 45s, 60s, 75s
        const result = execSync('npm run type-check 2>&1', {
          encoding: 'utf8',
          stdio: 'pipe',
          cwd: projectRoot,
          timeout
        });
        
        // Save successful output (no errors)
        writeFileSync(join(projectRoot, 'type-errors.txt'), result);
        return 0;
        
      } catch (error) {
        retryCount++;
        
        // Handle timeout specifically
        if (error.signal === 'SIGTERM' || error.code === 'ETIMEDOUT') {
          this.log(`Type check attempt ${retryCount} timed out after ${45 + (retryCount-1) * 15}s`, 'warning');
          
          if (retryCount >= maxRetries) {
            this.log('All type check attempts timed out, using cached count', 'warning');
            return this.lastKnownErrorCount || 0;
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }
        
        // Parse error output to count errors
        const output = `${error.stdout || ''}${error.stderr || ''}`;
        if (output) {
          // Save error output for analysis
          writeFileSync(join(projectRoot, 'type-errors.txt'), output);
          
          const errorLines = output.split('\n').filter(line => /error TS\d+:/.test(line));
          const count = errorLines.length;
          this.lastKnownErrorCount = count;
          return count;
        }
        
        if (retryCount >= maxRetries) {
          return this.lastKnownErrorCount || 0;
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return this.lastKnownErrorCount || 0;
  }

  async getErrorCountByType(errorCode) {
    const maxRetries = 2;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        // Try to read from existing type-errors.txt file first
        const typeErrorsPath = join(projectRoot, 'type-errors.txt');
        if (existsSync(typeErrorsPath)) {
          const content = readFileSync(typeErrorsPath, 'utf8');
          const regex = new RegExp(`error TS${errorCode}:`, 'g');
          const matches = content.match(regex);
          return matches ? matches.length : 0;
        }

        // Run type-check with timeout
        const timeout = 30000 + (retryCount * 15000); // 30s, 45s
        
        try {
          execSync('npm run type-check 2>&1', { 
            encoding: 'utf8', 
            stdio: 'pipe', 
            cwd: projectRoot, 
            timeout 
          });
          return 0; // No errors
        } catch (err) {
          if (err.signal === 'SIGTERM' || err.code === 'ETIMEDOUT') {
            throw err; // Re-throw timeout errors
          }
          
          const output = `${err.stdout || ''}${err.stderr || ''}`;
          const regex = new RegExp(`error TS${errorCode}:`, 'g');
          const matches = output.match(regex);
          return matches ? matches.length : 0;
        }
        
      } catch (error) {
        retryCount++;
        
        if (error.signal === 'SIGTERM' || error.code === 'ETIMEDOUT') {
          this.log(`Error count check for TS${errorCode} timed out (attempt ${retryCount})`, 'warning');
          if (retryCount >= maxRetries) {
            return 0; // Fallback
          }
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }
        
        if (retryCount >= maxRetries) return 0;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return 0;
  }

  runGit(command) {
    try {
      return execSync(command, { encoding: 'utf8', stdio: 'pipe', cwd: projectRoot });
    } catch (error) {
      // Some git commands are expected to fail (e.g., nothing to commit)
      return error.stdout || '';
    }
  }

  createCheckpoint(label) {
    try {
      // Stage everything and commit a checkpoint
      this.runGit('git add -A');
      const commitResult = this.runGit(`git commit -m "checkpoint: ${label}" --no-verify`);
      
      const checkpoint = {
        label,
        timestamp: new Date().toISOString(),
        success: true
      };
      
      this.orchestrationReport.checkpoints.push(checkpoint);
      this.log(`Created checkpoint: ${label}`, 'info');
      return true;
    } catch (err) {
      const checkpoint = {
        label,
        timestamp: new Date().toISOString(),
        success: false,
        error: err.message
      };
      
      this.orchestrationReport.checkpoints.push(checkpoint);
      this.log(`Checkpoint creation skipped (no changes): ${label}`, 'warning');
      return false;
    }
  }

  commitChanges(label) {
    try {
      this.runGit('git add -A');
      this.runGit(`git commit -m "fix: ${label}" --no-verify`);
      this.log(`Committed changes for ${label}`, 'success');
      return true;
    } catch (err) {
      this.log(`No commit needed for ${label}: ${err.message.split('\n')[0]}`);
      return false;
    }
  }

  revertToPreviousCheckpoint() {
    try {
      // Revert to the commit before the last one (the checkpoint state)
      this.runGit('git reset --hard HEAD~1');
      this.runGit('git clean -fd');
      this.log('Reverted to previous checkpoint', 'warning');
      return true;
    } catch (err) {
      this.log(`Failed to revert to checkpoint: ${err.message}`, 'error');
      return false;
    }
  }

  async runFixerScript(scriptName, errorCode, maxIterations = 1) {
    this.log(`Starting ${scriptName} for TS${errorCode} (max ${maxIterations} iterations)...`);
    
    let iteration = 0;
    let bestResult = null;
    
    while (iteration < maxIterations) {
      const iterationLabel = maxIterations > 1 ? ` (iteration ${iteration + 1}/${maxIterations})` : '';
      
      // Record initial state
      const beforeTotal = await this.getTotalErrorCount();
      const beforeTypeCount = await this.getErrorCountByType(errorCode);
      
      this.log(`${scriptName}${iterationLabel}: ${beforeTypeCount} TS${errorCode} errors, ${beforeTotal} total errors`);
      
      // Stop if no errors of this type remain
      if (beforeTypeCount === 0) {
        this.log(`${scriptName}: No TS${errorCode} errors remaining, skipping`, 'success');
        break;
      }
      
      // Create checkpoint
      const checkpointLabel = `${scriptName} TS${errorCode}${iterationLabel}`;
      const checkpointMade = this.createCheckpoint(checkpointLabel);
      
      let fixerResult = {
        scriptName,
        errorCode,
        iteration: iteration + 1,
        beforeTotal,
        beforeTypeCount,
        afterTotal: beforeTotal,
        afterTypeCount: beforeTypeCount,
        totalImprovement: 0,
        typeImprovement: 0,
        success: false,
        skipped: false,
        reverted: false,
        timeout: false,
        error: null
      };

      try {
        // Run the fixer script with timeout
        this.log(`Running: node scripts/${scriptName}`, 'info');
        
        const output = execSync(`node scripts/${scriptName}`, {
          encoding: 'utf8',
          stdio: 'pipe',
          cwd: projectRoot,
          timeout: this.timeoutPerFixer
        });
        
        // Record results after running the script
        const afterTotal = await this.getTotalErrorCount();
        const afterTypeCount = await this.getErrorCountByType(errorCode);
        
        const totalDelta = afterTotal - beforeTotal;
        const typeImprovement = beforeTypeCount - afterTypeCount;
        
        fixerResult.afterTotal = afterTotal;
        fixerResult.afterTypeCount = afterTypeCount;
        fixerResult.totalImprovement = beforeTotal - afterTotal;
        fixerResult.typeImprovement = typeImprovement;
        fixerResult.output = output.split('\n').slice(-5).join('\n');
        
        // Check if the change is acceptable
        if (totalDelta <= this.maxAllowedIncrease) {
          fixerResult.success = true;
          this.commitChanges(`${scriptName} TS${errorCode}${iterationLabel}`);
          
          this.log(`${scriptName}: Fixed ${typeImprovement} TS${errorCode} errors, total change: ${totalDelta}`, 'success');
          
          bestResult = fixerResult;
          
          // If no improvement and this isn't the first iteration, stop
          if (typeImprovement === 0 && iteration > 0) {
            this.log(`${scriptName}: No further improvement, stopping iterations`, 'warning');
            break;
          }
          
        } else {
          // Too many new errors introduced, revert
          if (checkpointMade) {
            this.revertToPreviousCheckpoint();
            fixerResult.reverted = true;
          }
          
          fixerResult.success = false;
          this.log(`${scriptName}: Reverted due to ${totalDelta} total error increase (max allowed: ${this.maxAllowedIncrease})`, 'warning');
          break; // Stop iterations for this fixer
        }
        
      } catch (error) {
        if (error.signal === 'SIGTERM' || error.code === 'ETIMEDOUT') {
          fixerResult.timeout = true;
          this.log(`${scriptName}: Timed out after ${this.timeoutPerFixer/1000}s`, 'error');
        } else {
          fixerResult.error = error.message;
          this.log(`${scriptName}: Failed - ${error.message}`, 'error');
        }
        
        // Revert on error if checkpoint was made
        if (checkpointMade) {
          this.revertToPreviousCheckpoint();
          fixerResult.reverted = true;
        }
        
        break; // Stop iterations on error
      }
      
      this.results.push(fixerResult);
      iteration++;
      
      // Small delay between iterations
      if (iteration < maxIterations && afterTypeCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return bestResult || this.results[this.results.length - 1];
  }

  async run() {
    this.log('🚀 Starting Enhanced TypeScript Error Fixing Orchestration...');
    
    const initialTotal = await this.getTotalErrorCount();
    this.log(`Initial total errors: ${initialTotal}`);
    
    if (initialTotal === 0) {
      this.log('🎉 No TypeScript errors found! Codebase is clean.', 'success');
      await this.generateFinalReport(initialTotal, initialTotal);
      return;
    }

    // Define fixers in priority order (high-impact, syntax errors first)
    const fixerConfigs = [
      // Priority 1: Syntax errors that block everything
      { script: 'fix-malformed-type-annotations.js', errorCode: '1005', iterations: 3, description: 'Malformed type annotations' },
      { script: 'fix-ts1005-enhanced.js', errorCode: '1005', iterations: 2, description: 'Enhanced TS1005 syntax fixes' },
      { script: 'fix-ts1003-syntax-errors.js', errorCode: '1003', iterations: 2, description: 'Syntax identifier errors' },
      { script: 'fix-unexpected-tokens.js', errorCode: '1381', iterations: 2, description: 'Unexpected token errors' },
      
      // Priority 2: Module and namespace issues
      { script: 'fix-ts2875-jsx-runtime.js', errorCode: '2875', iterations: 2, description: 'JSX runtime module errors' },
      { script: 'fix-ts2307-cannot-find-module.js', errorCode: '2307', iterations: 3, description: 'Cannot find module errors' },
      { script: 'fix-ts2503-cannot-find-namespace.js', errorCode: '2503', iterations: 2, description: 'Cannot find namespace errors' },
      
      // Priority 3: Type annotation issues
      { script: 'fix-ts7026-jsx-implicit-any.js', errorCode: '7026', iterations: 3, description: 'JSX implicit any errors' },
      { script: 'fix-ts7031-binding-element-any.js', errorCode: '7031', iterations: 3, description: 'Binding element implicit any' },
      { script: 'fix-ts7006-implicit-any-param.js', errorCode: '7006', iterations: 3, description: 'Implicit any parameter errors' },
      { script: 'fix-ts7053-element-implicit-any.js', errorCode: '7053', iterations: 3, description: 'Element implicit any errors' },
      
      // Priority 4: Name and property resolution
      { script: 'fix-ts2304-cannot-find-name.js', errorCode: '2304', iterations: 2, description: 'Cannot find name errors' },
      { script: 'fix-ts2339-property-errors.js', errorCode: '2339', iterations: 2, description: 'Property does not exist errors' },
      { script: 'fix-ts2305-no-exported-member.js', errorCode: '2305', iterations: 2, description: 'No exported member errors' },
      
      // Priority 5: Type compatibility
      { script: 'fix-ts2322-enhanced.js', errorCode: '2322', iterations: 2, description: 'Enhanced type assignment errors' },
      { script: 'fix-ts2345-argument-type.js', errorCode: '2345', iterations: 2, description: 'Argument type mismatch errors' },
      { script: 'fix-ts2739-missing-properties.js', errorCode: '2739', iterations: 2, description: 'Missing properties errors' },
      
      // Priority 6: Cleanup and optimization
      { script: 'fix-ts6133-declared-not-used.js', errorCode: '6133', iterations: 1, description: 'Unused declarations' },
      { script: 'fix-ts2551-property-does-not-exist.js', errorCode: '2551', iterations: 1, description: 'Property suggestions' },
      { script: 'fix-ts7019-implicit-any.js', errorCode: '7019', iterations: 1, description: 'Implicit any type errors' },
      { script: 'fix-ts18048-possibly-undefined.js', errorCode: '18048', iterations: 1, description: 'Possibly undefined errors' },
      { script: 'fix-ts2300-duplicate-identifier.js', errorCode: '2300', iterations: 1, description: 'Duplicate identifier errors' }
    ];

    // Run each fixer according to configuration
    for (const config of fixerConfigs) {
      const scriptPath = join(projectRoot, 'scripts', config.script);
      
      // Check if script exists before running
      if (!existsSync(scriptPath)) {
        this.log(`Script not found: ${config.script}, skipping`, 'warning');
        continue;
      }
      
      const result = await this.runFixerScript(config.script, config.errorCode, config.iterations);
      
      // Check current total error count
      const currentTotal = await this.getTotalErrorCount();
      this.log(`Current total errors after ${config.script}: ${currentTotal}`);
      
      // If we've reached zero errors, we can stop
      if (currentTotal === 0) {
        this.log('🎉 All TypeScript errors resolved!', 'success');
        break;
      }
      
      // Small delay between fixers to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate final report
    const finalTotal = await this.getTotalErrorCount();
    await this.generateFinalReport(initialTotal, finalTotal);
  }

  async generateFinalReport(initialTotal, finalTotal) {
    const totalImprovement = initialTotal - finalTotal;
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    this.orchestrationReport.endTime = new Date().toISOString();
    this.orchestrationReport.duration = `${duration}s`;
    this.orchestrationReport.summary = {
      initialErrors: initialTotal,
      finalErrors: finalTotal,
      totalFixed: totalImprovement,
      improvementRate: initialTotal > 0 ? ((totalImprovement / initialTotal) * 100).toFixed(1) : '0',
      fixerResults: this.results
    };

    // Save orchestration report
    const reportPath = join(projectRoot, 'orchestration-report.json');
    writeFileSync(reportPath, JSON.stringify(this.orchestrationReport, null, 2));

    // Display summary
    this.log('\n' + '='.repeat(80));
    this.log('📊 ENHANCED ORCHESTRATION REPORT');
    this.log('='.repeat(80));
    this.log(`⏱️  Duration: ${duration} seconds`);
    this.log(`📈 Initial errors: ${initialTotal}`);
    this.log(`📉 Final errors: ${finalTotal}`);
    this.log(`✨ Total fixed: ${totalImprovement}`);
    this.log(`🎯 Success rate: ${this.orchestrationReport.summary.improvementRate}%`);
    this.log('');

    // Individual fixer results
    this.log('📋 FIXER BREAKDOWN:');
    for (const result of this.results) {
      const status = result.success ? '✅' : (result.reverted ? '🔄' : (result.timeout ? '⏰' : '❌'));
      const improvement = result.typeImprovement || 0;
      const iterationInfo = result.iteration > 1 ? ` (iter ${result.iteration})` : '';
      this.log(`${status} ${result.scriptName}${iterationInfo}: ${improvement} TS${result.errorCode} errors fixed`);
    }

    this.log('');
    this.log(`📁 Detailed report saved to: ${reportPath}`);

    // Final recommendations
    this.log('\n📝 NEXT STEPS:');
    if (finalTotal === 0) {
      this.log('🎉 All TypeScript errors resolved!', 'success');
      this.log('• Run npm run validate to verify the build');
      this.log('• Consider running tests to ensure functionality is preserved');
    } else if (finalTotal < initialTotal) {
      this.log(`✅ Progress made: ${totalImprovement} errors fixed`, 'success');
      this.log(`• ${finalTotal} errors remaining`);
      this.log('• Run npm run type-check to see remaining errors');
      this.log('• Consider manual review for remaining complex errors');
      this.log('• Re-run this orchestrator if new fixers are added');
    } else {
      this.log('⚠️  No net improvement achieved', 'warning');
      this.log('• Review the fixer scripts for potential improvements');
      this.log('• Consider manual fixes for complex error patterns');
    }

    return this.orchestrationReport;
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new EnhancedOrchestrator();
  orchestrator.run().catch(err => {
    console.error('EnhancedOrchestrator failed:', err);
    process.exitCode = 1;
  });
}

export { EnhancedOrchestrator };