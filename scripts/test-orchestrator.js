#!/usr/bin/env node
/**
 * Quick Test of Enhanced Orchestrator on Single Fixer
 */

import { EnhancedOrchestrator } from './enhanced-orchestrator-v2.js';

class QuickTestOrchestrator extends EnhancedOrchestrator {
  async run() {
    this.log('🚀 Starting Quick Test Orchestration...');
    
    const initialTotal = await this.getTotalErrorCount();
    this.log(`Initial total errors: ${initialTotal}`);
    
    if (initialTotal === 0) {
      this.log('🎉 No TypeScript errors found! Codebase is clean.', 'success');
      return;
    }

    // Test with just one high-priority fixer
    const testFixer = { script: 'fix-ts2875-jsx-runtime.js', errorCode: '2875', iterations: 2, description: 'JSX runtime module errors' };
    
    const result = await this.runFixerScript(testFixer.script, testFixer.errorCode, testFixer.iterations);
    
    // Check final state
    const finalTotal = await this.getTotalErrorCount();
    this.log(`Final total errors: ${finalTotal}`);
    
    if (result) {
      this.log(`Test result: ${result.success ? 'SUCCESS' : 'FAILED'}`, result.success ? 'success' : 'error');
      this.log(`Type improvement: ${result.typeImprovement || 0}`);
      this.log(`Total improvement: ${result.totalImprovement || 0}`);
    }
    
    return result;
  }
}

const testOrchestrator = new QuickTestOrchestrator();
testOrchestrator.run().catch(err => {
  console.error('QuickTestOrchestrator failed:', err);
  process.exitCode = 1;
});