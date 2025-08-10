#!/usr/bin/env node
/**
 * Enhanced TypeScript Error Orchestrator
 * Runs error fixes iteratively until total error count is below 10
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

class ErrorOrchestrator {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.iteration = 0;
    this.maxIterations = 10;
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

  async getCurrentErrorCount() {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        const timeout = 30000 + (retryCount * 15000); // 30s, 45s, 60s
        const result = execSync('npm run type-check', {
          encoding: 'utf8',
          stdio: 'pipe',
          cwd: process.cwd(),
          timeout
        });
        // No errors
        return 0;
      } catch (error) {
        retryCount++;
        
        // Handle timeout specifically
        if (error.signal === 'SIGTERM' || error.code === 'ETIMEDOUT') {
          this.log(`Type check attempt ${retryCount} timed out after ${30 + (retryCount-1) * 15}s`, 'warning');
          
          if (retryCount >= maxRetries) {
            this.log('All type check attempts timed out, using fallback count', 'warning');
            return 500; // Conservative fallback
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }
        
        // Parse error output
        const out = `${error.stdout || ''}${error.stderr || ''}`;
        if (!out) {
          if (retryCount >= maxRetries) return 0;
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        const errorLines = out.split('\n').filter(line => /error TS\d+:/.test(line));
        const count = errorLines.length;
        return count;
      }
    }
    
    return 500; // Fallback count
  }

  async runCriticalSyntaxFixer() {
    try {
      this.log('Running critical syntax fixer...');
      const output = execSync('node scripts/fix-critical-syntax-errors.js', {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: process.cwd(),
        timeout: 60000
      });
      
      // Extract the fix count from output
      const fixMatch = output.match(/Total fixes applied: (\d+)/);
      const fixCount = fixMatch ? parseInt(fixMatch[1]) : 0;
      
      if (fixCount > 0) {
        this.log(`Critical syntax fixer applied ${fixCount} fixes`, 'success');
        return fixCount;
      } else {
        this.log('No critical syntax errors found', 'info');
        return 0;
      }
    } catch (error) {
      this.log(`Critical syntax fixer failed: ${error.message}`, 'error');
      return 0;
    }
  }

  async runSpecificFixer(errorType, scriptName, maxErrors = 5) {
    try {
      this.log(`Running specific fixer for ${errorType}...`);
      
      const beforeCount = await this.getCurrentErrorCount();
      
      const output = execSync(`node scripts/${scriptName}`, {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: process.cwd(),
        timeout: 120000 // 2 minutes per fixer
      });
      
      const afterCount = await this.getCurrentErrorCount();
      const improvement = beforeCount - afterCount;
      
      if (improvement > 0) {
        this.log(`${errorType} fixer improved errors by ${improvement} (${beforeCount} → ${afterCount})`, 'success');
        return improvement;
      } else if (improvement < -100) {
        this.log(`${errorType} fixer made things worse by ${Math.abs(improvement)}`, 'error');
        return 0;
      } else {
        this.log(`${errorType} fixer made no significant improvement`, 'warning');
        return 0;
      }
    } catch (error) {
      this.log(`${errorType} fixer failed: ${error.message}`, 'error');
      return 0;
    }
  }

  async runIterativeFixes() {
    this.log('🚀 Starting enhanced TypeScript error orchestration...');
    
    const initialCount = await this.getCurrentErrorCount();
    this.log(`Initial error count: ${initialCount}`);
    
    if (initialCount < 10) {
      this.log('🎉 Already below target! (< 10 errors)', 'success');
      return;
    }

    while (this.iteration < this.maxIterations) {
      this.iteration++;
      this.log(`\n📍 ITERATION ${this.iteration}/${this.maxIterations}`);
      
      const iterationStart = await this.getCurrentErrorCount();
      this.log(`Starting iteration with ${iterationStart} errors`);
      
      let totalImprovement = 0;
      
      // Phase 1: Critical syntax fixes (always run first)
      const syntaxFixes = await this.runCriticalSyntaxFixer();
      totalImprovement += syntaxFixes;
      
      // Phase 2: Run specific fixers in order of impact
      const fixers = [
        { name: 'Missing Imports', script: 'fix-ts2304-cannot-find-name.js' },
        { name: 'Unused Variables', script: 'fix-ts6133-declared-not-used.js' },
        { name: 'Type Assignment', script: 'fix-ts2322-type-not-assignable.js' },
        { name: 'Undefined Access', script: 'fix-ts18048-possibly-undefined.js' },
        { name: 'Property Errors', script: 'fix-ts2339-property-errors.js' }
      ];
      
      for (const fixer of fixers) {
        const improvement = await this.runSpecificFixer(fixer.name, fixer.script);
        totalImprovement += improvement;
        
        // Check if we've reached our target
        const currentCount = await this.getCurrentErrorCount();
        if (currentCount < 10) {
          this.log(`🎯 Target reached! Current errors: ${currentCount}`, 'success');
          return;
        }
        
        // Small delay between fixers
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      const iterationEnd = await this.getCurrentErrorCount();
      const iterationImprovement = iterationStart - iterationEnd;
      
      this.log(`Iteration ${this.iteration} complete: ${iterationStart} → ${iterationEnd} (${iterationImprovement > 0 ? '+' : ''}${iterationImprovement})`);
      
      this.results.push({
        iteration: this.iteration,
        startErrors: iterationStart,
        endErrors: iterationEnd,
        improvement: iterationImprovement,
        totalImprovement: initialCount - iterationEnd
      });
      
      // If no improvement for 2 iterations, break
      if (this.iteration >= 2) {
        const lastTwo = this.results.slice(-2);
        if (lastTwo.every(r => r.improvement <= 0)) {
          this.log('No improvement in last 2 iterations, stopping', 'warning');
          break;
        }
      }
      
      // If we're close to target, continue
      if (iterationEnd < 50) {
        this.log('Getting close to target, continuing...', 'info');
        continue;
      }
      
      // If no improvement this iteration, stop
      if (iterationImprovement <= 0) {
        this.log('No improvement this iteration, stopping', 'warning');
        break;
      }
    }
    
    const finalCount = await this.getCurrentErrorCount();
    await this.generateReport(initialCount, finalCount);
  }

  async generateReport(initialCount, finalCount) {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const totalImprovement = initialCount - finalCount;
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      iterations: this.iteration,
      initialErrors: initialCount,
      finalErrors: finalCount,
      totalImprovement,
      targetAchieved: finalCount < 10,
      results: this.results
    };
    
    writeFileSync('orchestration-report.json', JSON.stringify(report, null, 2));
    
    this.log('\n' + '='.repeat(80));
    this.log('📊 ORCHESTRATION REPORT');
    this.log('='.repeat(80));
    this.log(`⏱️  Duration: ${duration} seconds`);
    this.log(`🔄 Iterations: ${this.iteration}`);
    this.log(`📈 Initial errors: ${initialCount}`);
    this.log(`📉 Final errors: ${finalCount}`);
    this.log(`✨ Total improvement: ${totalImprovement}`);
    
    if (finalCount < 10) {
      this.log(`🎉 TARGET ACHIEVED! Final count: ${finalCount} < 10`, 'success');
    } else {
      this.log(`⚠️  Target not reached. Final count: ${finalCount} >= 10`, 'warning');
    }
    
    this.log('\n📋 ITERATION BREAKDOWN:');
    for (const result of this.results) {
      const status = result.improvement > 0 ? '✅' : '⚠️';
      this.log(`${status} Iteration ${result.iteration}: ${result.startErrors} → ${result.endErrors} (${result.improvement > 0 ? '+' : ''}${result.improvement})`);
    }
    
    this.log(`\n📁 Detailed report saved to: orchestration-report.json`);
  }
}

// Execute if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     import.meta.url.endsWith(process.argv[1]) ||
                     process.argv[1].endsWith('orchestrate-fixes.js');

if (isMainModule) {
  const orchestrator = new ErrorOrchestrator();
  orchestrator.runIterativeFixes().catch(err => {
    console.error('ErrorOrchestrator failed:', err);
    process.exitCode = 1;
  });
}

export { ErrorOrchestrator };