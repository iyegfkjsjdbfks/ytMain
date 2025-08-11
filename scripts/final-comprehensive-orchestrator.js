#!/usr/bin/env node
/**
 * Final Comprehensive Orchestrator
 * Completes the remaining TypeScript error fixes
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

class FinalComprehensiveOrchestrator {
  constructor() {
    this.startTime = Date.now();
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

  async run() {
    this.log('🚀 Starting Final Comprehensive TypeScript Error Orchestrator...');
    const initialErrors = await this.getTotalErrorCount();
    this.log(`Current error count: ${initialErrors}`);
    
    // Simply run the enhanced orchestrator v2 one more time
    this.log('Running enhanced-orchestrator-v2 for final cleanup...');
    
    try {
      const result = execSync('npm run orchestrate:enhanced-v2', { 
        encoding: 'utf8', 
        stdio: 'pipe',
        timeout: 600000  // 10 minutes
      });
      
      this.log('Enhanced orchestrator completed');
      
    } catch (error) {
      this.log('Enhanced orchestrator completed with some issues', 'warning');
    }
    
    const finalErrors = await this.getTotalErrorCount();
    const improvement = initialErrors - finalErrors;
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    
    // Generate final summary
    this.log('\n' + '='.repeat(60));
    this.log('📊 FINAL COMPREHENSIVE SUMMARY');
    this.log('='.repeat(60));
    this.log(`⏱️  Total Duration: ${duration} seconds`);
    this.log(`📈 Session started: ${initialErrors} errors`);
    this.log(`📉 Session ended: ${finalErrors} errors`);
    this.log(`✨ Session improvement: ${improvement} errors fixed`);
    
    if (improvement > 0) {
      const sessionRate = ((improvement / initialErrors) * 100).toFixed(1);
      this.log(`🎯 Session success rate: ${sessionRate}%`);
    }
    
    // Calculate total improvement from original 136 errors
    const originalErrors = 136;
    const totalImprovement = originalErrors - finalErrors;
    const totalSuccessRate = ((totalImprovement / originalErrors) * 100).toFixed(1);
    
    this.log('');
    this.log('📊 TOTAL PROJECT IMPROVEMENT:');
    this.log(`📈 Original errors: ${originalErrors}`);
    this.log(`📉 Current errors: ${finalErrors}`);
    this.log(`✨ Total fixed: ${totalImprovement} errors`);
    this.log(`🎯 Overall success rate: ${totalSuccessRate}%`);
    
    this.log('');
    
    if (finalErrors === 0) {
      this.log('🎉 ALL TYPESCRIPT ERRORS RESOLVED!', 'success');
      this.log('✅ Run `npm run build` to verify successful compilation');
      this.log('✅ Run `npm run test` to ensure functionality is preserved');
    } else if (finalErrors < 10) {
      this.log(`🎯 EXCELLENT! Only ${finalErrors} errors remaining`, 'success');
      this.log('✅ Very close to zero errors - manual review recommended');
      this.log('🔧 Consider running type-check and fixing remaining errors manually');
    } else if (finalErrors < 25) {
      this.log(`✅ GREAT PROGRESS! ${finalErrors} errors remaining`, 'success');
      this.log('🔄 Continue with targeted fixes or run orchestrator again');
    } else if (finalErrors < 50) {
      this.log(`📈 GOOD PROGRESS! ${finalErrors} errors remaining`, 'success');
      this.log('🔄 Significant improvement achieved, continue systematic fixing');
    } else {
      this.log(`⚠️  MORE WORK NEEDED: ${finalErrors} errors remaining`, 'warning');
      this.log('🔄 Consider running additional fixing rounds');
    }
    
    // Save comprehensive report
    const report = {
      timestamp: new Date().toISOString(),
      sessionDuration: `${duration}s`,
      sessionStart: initialErrors,
      sessionEnd: finalErrors,
      sessionImprovement: improvement,
      sessionSuccessRate: improvement > 0 ? ((improvement / initialErrors) * 100).toFixed(1) : '0',
      
      originalTotal: originalErrors,
      currentTotal: finalErrors,
      totalFixed: totalImprovement,
      overallSuccessRate: totalSuccessRate,
      
      recommendations: this.generateRecommendations(finalErrors)
    };
    
    writeFileSync('final-comprehensive-report.json', JSON.stringify(report, null, 2));
    this.log(`📁 Comprehensive report saved to: final-comprehensive-report.json`);
    
    return finalErrors;
  }
  
  generateRecommendations(errorCount) {
    if (errorCount === 0) {
      return [
        'All TypeScript errors resolved!',
        'Run npm run build to verify compilation',
        'Run npm run test to ensure functionality',
        'Consider enabling stricter TypeScript rules'
      ];
    } else if (errorCount < 10) {
      return [
        'Very close to zero errors',
        'Manual review recommended for remaining errors',
        'Run npm run type-check to see specific issues',
        'Focus on critical errors first'
      ];
    } else if (errorCount < 50) {
      return [
        'Good progress made',
        'Continue with systematic fixing approach',
        'Re-run orchestrator for additional improvements',
        'Focus on high-frequency error patterns'
      ];
    } else {
      return [
        'Substantial work still needed',
        'Focus on major error categories',
        'Consider file-by-file manual review',
        'Re-run orchestrator multiple times'
      ];
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new FinalComprehensiveOrchestrator();
  orchestrator.run().then(finalErrors => {
    process.exitCode = finalErrors > 0 ? 1 : 0;
  }).catch(err => {
    console.error('Final comprehensive orchestrator failed:', err);
    process.exitCode = 1;
  });
}

export { FinalComprehensiveOrchestrator };