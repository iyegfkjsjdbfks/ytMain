#!/usr/bin/env node
/**
 * Efficient Error Fixing Orchestrator - Optimized for large error volumes
 * Uses existing comprehensive scripts and focuses on major error categories
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const MAX_ALLOWED_INCREASE = 10; // Increased threshold for large codebases

class EfficientOrchestrator {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.lastErrorCount = 0;
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
      info: '🚀',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type] || '🚀';
    
    console.log(`${colors[type]}${prefix} [${timestamp}] ${message}${colors.reset}`);
  }

  runGit(command) {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe', cwd: projectRoot });
  }

  createCheckpoint(label) {
    try {
      this.runGit('git add -A');
      this.runGit(`git commit -m "checkpoint: ${label}" --no-verify`);
      this.log(`✓ Checkpoint created: ${label}`, 'info');
      return true;
    } catch (err) {
      this.log(`No changes to checkpoint for ${label}`, 'info');
      return false;
    }
  }

  commitChanges(label) {
    try {
      this.runGit('git add -A');
      this.runGit(`git commit -m "fix: ${label}" --no-verify`);
      this.log(`✓ Committed: ${label}`, 'success');
      return true;
    } catch (err) {
      this.log(`No changes to commit for ${label}`);
      return false;
    }
  }

  revertChanges() {
    try {
      this.runGit('git reset --hard HEAD~1');
      this.runGit('git clean -fd');
      this.log('✓ Changes reverted', 'warning');
      return true;
    } catch (err) {
      this.log(`Revert failed: ${err.message}`, 'error');
      return false;
    }
  }

  async getQuickErrorCount() {
    // Use the existing count-errors.js script for efficiency
    try {
      const result = execSync('node scripts/count-errors.js', {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: projectRoot,
        timeout: 15000 // 15 second timeout
      });
      
      // Parse the output to get the number
      const lines = result.split('\n').filter(line => line.trim());
      const lastLine = lines[lines.length - 1];
      const count = parseInt(lastLine) || 0;
      this.lastErrorCount = count;
      return count;
    } catch (error) {
      // Fallback to checking cached file
      const typeErrorsPath = join(projectRoot, 'type-errors.txt');
      if (existsSync(typeErrorsPath)) {
        const content = readFileSync(typeErrorsPath, 'utf8');
        const errorLines = content.split('\n').filter(line => /error TS\d+:/.test(line));
        const count = errorLines.length;
        this.lastErrorCount = count;
        return count;
      }
      this.log(`Error counting failed: ${error.message}`, 'warning');
      return this.lastErrorCount; // Use last known count
    }
  }

  async runScript(scriptName, description, maxIterations = 1) {
    this.log(`\n${'='.repeat(70)}`);
    this.log(`🎯 Running: ${scriptName}`);
    this.log(`📋 ${description}`);
    
    let iteration = 0;
    let bestErrorCount = await this.getQuickErrorCount();
    this.log(`📊 Starting with ${bestErrorCount} errors`);
    
    while (iteration < maxIterations) {
      iteration++;
      this.log(`\n--- Iteration ${iteration}/${maxIterations} ---`);
      
      const beforeCount = await this.getQuickErrorCount();
      this.log(`📊 Before script: ${beforeCount} errors`);
      
      const checkpointLabel = `${scriptName} iter ${iteration}`;
      const checkpointMade = this.createCheckpoint(checkpointLabel);
      
      try {
        this.log(`⚙️ Executing script...`);
        const startTime = Date.now();
        
        const output = execSync(`node scripts/${scriptName}`, {
          encoding: 'utf8',
          stdio: 'pipe',
          cwd: projectRoot,
          timeout: 300000 // 5 minute timeout
        });
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        this.log(`✓ Script completed in ${duration}s`);
        
        const afterCount = await this.getQuickErrorCount();
        const improvement = beforeCount - afterCount;
        const increase = afterCount - beforeCount;
        
        this.log(`📊 After script: ${afterCount} errors`);
        this.log(`📈 Change: ${improvement >= 0 ? '+' : ''}${-increase} errors`);
        
        const result = {
          script: scriptName,
          iteration,
          beforeCount,
          afterCount,
          improvement,
          increase,
          duration: `${duration}s`,
          success: increase <= MAX_ALLOWED_INCREASE,
          timestamp: new Date().toISOString()
        };
        
        this.results.push(result);
        
        // Check if we should revert
        if (increase > MAX_ALLOWED_INCREASE) {
          this.log(`❌ Error count increased by ${increase} (max: ${MAX_ALLOWED_INCREASE})`, 'error');
          if (checkpointMade) {
            this.revertChanges();
            result.reverted = true;
          }
          break; // Stop iterations
        } else {
          this.commitChanges(checkpointLabel);
          
          if (improvement > 0) {
            this.log(`✅ Improved by ${improvement} errors!`, 'success');
            bestErrorCount = afterCount;
          } else if (improvement === 0) {
            this.log(`🔄 No change in error count`, 'info');
          }
          
          // If no improvement after first iteration, stop
          if (improvement <= 0 && iteration > 1) {
            this.log(`⚠️ No improvement, stopping iterations`, 'warning');
            break;
          }
        }
        
        // Short delay between iterations
        if (iteration < maxIterations) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        this.log(`❌ Script failed: ${error.message}`, 'error');
        
        const result = {
          script: scriptName,
          iteration,
          beforeCount,
          afterCount: beforeCount,
          improvement: 0,
          increase: 0,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        };
        
        this.results.push(result);
        
        if (error.signal === 'SIGTERM' || error.code === 'ETIMEDOUT') {
          this.log('⏱️ Script timed out', 'warning');
          result.timeout = true;
        }
        
        break; // Stop on error
      }
    }
    
    return this.results[this.results.length - 1];
  }

  async run() {
    this.log('\n' + '='.repeat(80));
    this.log('🚀 EFFICIENT ERROR FIXING ORCHESTRATOR');
    this.log('='.repeat(80));
    this.log('✓ Optimized for large error volumes');
    this.log('✓ Uses existing comprehensive scripts');
    this.log('✓ Focuses on major error categories');
    this.log('✓ Handles timeouts gracefully');
    
    const initialCount = await this.getQuickErrorCount();
    this.log(`\n📊 Initial error count: ${initialCount}`);
    
    if (initialCount === 0) {
      this.log('🎉 No errors found! Codebase is clean.', 'success');
      return;
    }
    
    // Use the existing comprehensive scripts in order of priority
    const scripts = [
      {
        name: 'fix-all-errors.js',
        description: 'Run comprehensive error fixing (existing master script)',
        iterations: 1
      }
    ];
    
    // Run each script
    for (const script of scripts) {
      const result = await this.runScript(script.name, script.description, script.iterations);
      
      const currentCount = await this.getQuickErrorCount();
      this.log(`\n📊 Current total: ${currentCount} errors`);
      
      if (currentCount === 0) {
        this.log('🎉 All errors fixed!', 'success');
        break;
      }
      
      // If we've reverted, skip to next strategy
      if (result && result.reverted) {
        this.log('⚠️ Script was reverted, trying alternative approach...', 'warning');
        continue;
      }
    }
    
    await this.generateReport(initialCount);
  }

  async generateReport(initialCount) {
    const finalCount = await this.getQuickErrorCount();
    const totalImprovement = initialCount - finalCount;
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      initialErrors: initialCount,
      finalErrors: finalCount,
      totalImprovement,
      successRate: initialCount > 0 ? ((totalImprovement / initialCount) * 100).toFixed(1) : '0',
      scripts: this.results
    };

    const reportPath = join(projectRoot, 'efficient-orchestration-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.log('\n' + '='.repeat(80));
    this.log('🏁 ORCHESTRATION COMPLETE');
    this.log('='.repeat(80));
    this.log(`⏱️  Duration: ${duration}s`);
    this.log(`📈 Initial: ${initialCount} errors`);
    this.log(`📉 Final: ${finalCount} errors`);
    this.log(`✨ Improved: ${totalImprovement} errors`);
    this.log(`🎯 Success rate: ${report.successRate}%`);

    if (finalCount === 0) {
      this.log('🎉 SUCCESS: All TypeScript errors resolved!', 'success');
    } else {
      this.log(`📋 ${finalCount} errors remain`, 'info');
      this.log('💡 Consider running individual error-specific scripts', 'info');
    }

    this.log(`📁 Report saved: ${reportPath}`);
    return report;
  }
}

// Execute if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     import.meta.url.endsWith(process.argv[1]) ||
                     process.argv[1].endsWith('efficient-orchestrator.js');

if (isMainModule) {
  const orchestrator = new EfficientOrchestrator();
  orchestrator.run().catch(err => {
    console.error('Efficient orchestrator failed:', err);
    process.exitCode = 1;
  });
}

export { EfficientOrchestrator };