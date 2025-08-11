#!/usr/bin/env node
/**
 * Improved TypeScript Error Orchestrator
 * Focuses on systematically fixing the remaining 86 errors by category
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

class ImprovedErrorOrchestrator {
  constructor() {
    this.startTime = Date.now();
    this.results = [];
    this.initialErrors = 0;
    this.maxIterationsPerFixer = 3;
  }

  log(message, type = 'info') {
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
    
    console.log(`${colors[type]}${prefix} ${message}${colors.reset}`);
  }

  async getTotalErrorCount() {
    try {
      execSync('npm run type-check', { stdio: 'pipe' });
      return 0;
    } catch (error) {
      const output = `${error.stdout || ''}${error.stderr || ''}`;
      const errorLines = output.split('\n').filter(line => /error TS\d+:/.test(line));
      return errorLines.length;
    }
  }

  async getErrorsByType() {
    try {
      execSync('npm run type-check', { stdio: 'pipe' });
      return {};
    } catch (error) {
      const output = `${error.stdout || ''}${error.stderr || ''}`;
      const errorLines = output.split('\n').filter(line => /error TS\d+:/.test(line));
      const errorsByType = {};
      
      errorLines.forEach(line => {
        const match = line.match(/error TS(\d+):/);
        if (match) {
          const errorCode = match[1];
          errorsByType[errorCode] = (errorsByType[errorCode] || 0) + 1;
        }
      });
      
      return errorsByType;
    }
  }

  async runScript(scriptName, description = '') {
    const beforeCount = await this.getTotalErrorCount();
    this.log(`Running ${scriptName}... (${beforeCount} errors before)`);
    
    try {
      const scriptPath = join(process.cwd(), 'scripts', scriptName);
      if (!existsSync(scriptPath)) {
        this.log(`Script not found: ${scriptName}`, 'warning');
        return { success: false, reason: 'Script not found' };
      }
      
      const output = execSync(`node scripts/${scriptName}`, { 
        encoding: 'utf8', 
        stdio: 'pipe',
        timeout: 120000 
      });
      
      const afterCount = await this.getTotalErrorCount();
      const improvement = beforeCount - afterCount;
      
      const result = {
        script: scriptName,
        description,
        beforeCount,
        afterCount,
        improvement,
        success: improvement >= 0, // Don't allow regressions
        output: output.split('\n').slice(-3).join('\n')
      };
      
      this.results.push(result);
      
      if (improvement > 0) {
        this.log(`${scriptName}: Fixed ${improvement} errors (${afterCount} remaining)`, 'success');
      } else if (improvement === 0) {
        this.log(`${scriptName}: No improvement`, 'warning');
      } else {
        this.log(`${scriptName}: Introduced ${Math.abs(improvement)} new errors`, 'error');
      }
      
      return result;
      
    } catch (error) {
      this.log(`${scriptName} failed: ${error.message}`, 'error');
      const result = {
        script: scriptName,
        description,
        beforeCount,
        afterCount: beforeCount,
        improvement: 0,
        success: false,
        error: error.message
      };
      this.results.push(result);
      return result;
    }
  }

  async run() {
    this.log('🚀 Starting Improved TypeScript Error Orchestrator...');
    this.initialErrors = await this.getTotalErrorCount();
    this.log(`Initial error count: ${this.initialErrors}`);
    
    const errorsByType = await this.getErrorsByType();
    this.log(`Error breakdown: ${JSON.stringify(errorsByType)}`);
    
    // Define targeted fixing sequence based on current error patterns
    const fixingSequence = [
      { script: 'fix-utils-systematic.js', description: 'Final utils.ts fixes' },
      { script: 'fix-ts1005-enhanced.js', description: 'TS1005 syntax errors' },
      { script: 'fix-ts1128-declaration-expected.js', description: 'TS1128 declaration errors' },
      { script: 'fix-ts1109-expression-expected.js', description: 'TS1109 expression errors' },
      { script: 'fix-ts1144-curly-or-semicolon.js', description: 'TS1144 curly brace errors' }
    ];
    
    // Run each fixer
    for (const config of fixingSequence) {
      const result = await this.runScript(config.script, config.description);
      
      // If we've reduced errors to single digits, we can stop
      const currentTotal = await this.getTotalErrorCount();
      if (currentTotal < 10) {
        this.log(`🎉 Reached target: ${currentTotal} errors remaining!`, 'success');
        break;
      }
      
      // Small delay between scripts
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Generate final report
    await this.generateReport();
  }

  async generateReport() {
    const finalErrors = await this.getTotalErrorCount();
    const totalImprovement = this.initialErrors - finalErrors;
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      initialErrors: this.initialErrors,
      finalErrors,
      totalImprovement,
      improvementRate: this.initialErrors > 0 ? ((totalImprovement / this.initialErrors) * 100).toFixed(1) : '0',
      results: this.results
    };
    
    // Save report
    writeFileSync('improved-orchestration-report.json', JSON.stringify(report, null, 2));
    
    // Display summary
    this.log('\n' + '='.repeat(60));
    this.log('📊 IMPROVED ORCHESTRATION SUMMARY');
    this.log('='.repeat(60));
    this.log(`⏱️  Duration: ${duration} seconds`);
    this.log(`📈 Initial errors: ${this.initialErrors}`);
    this.log(`📉 Final errors: ${finalErrors}`);
    this.log(`✨ Total improvement: ${totalImprovement}`);
    this.log(`🎯 Success rate: ${report.improvementRate}%`);
    this.log('');
    
    // Individual results
    this.log('📋 SCRIPT RESULTS:');
    for (const result of this.results) {
      const status = result.success ? '✅' : '❌';
      this.log(`${status} ${result.script}: ${result.improvement} errors fixed`);
    }
    
    this.log('');
    if (finalErrors === 0) {
      this.log('🎉 All TypeScript errors resolved!', 'success');
    } else if (finalErrors < 20) {
      this.log(`🎯 Great progress! ${finalErrors} errors remaining`, 'success');
    } else {
      this.log(`🔄 More work needed: ${finalErrors} errors remaining`, 'warning');
    }
    
    this.log(`📁 Detailed report saved to: improved-orchestration-report.json`);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new ImprovedErrorOrchestrator();
  orchestrator.run().catch(err => {
    console.error('Orchestrator failed:', err);
    process.exitCode = 1;
  });
}

export { ImprovedErrorOrchestrator };