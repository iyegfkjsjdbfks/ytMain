#!/usr/bin/env node
/**
 * Priority-Focused Orchestrator
 * Runs only the highest priority fixers to make meaningful progress
 */

import { EnhancedOrchestrator } from './enhanced-orchestrator-v2.js';

class PriorityOrchestrator extends EnhancedOrchestrator {
  async run() {
    this.log('🚀 Starting Priority-Focused TypeScript Error Fixing...');
    
    const initialTotal = await this.getTotalErrorCount();
    this.log(`Initial total errors: ${initialTotal}`);
    
    if (initialTotal === 0) {
      this.log('🎉 No TypeScript errors found! Codebase is clean.', 'success');
      await this.generateFinalReport(initialTotal, initialTotal);
      return;
    }

    // Focus on just the most impactful fixers
    const priorityFixers = [
      // Start with namespace issues
      { script: 'fix-ts2503-cannot-find-namespace.js', errorCode: '2503', iterations: 2, description: 'Cannot find namespace errors' },
      // Then tackle name resolution
      { script: 'fix-ts2304-cannot-find-name.js', errorCode: '2304', iterations: 2, description: 'Cannot find name errors' },
      // Clean up unused declarations
      { script: 'fix-ts6133-declared-not-used.js', errorCode: '6133', iterations: 1, description: 'Unused declarations' },
    ];

    // Run each priority fixer
    for (const config of priorityFixers) {
      this.log(`\n--- Processing ${config.description} ---`);
      
      const beforeCount = await this.getErrorCountByType(config.errorCode);
      if (beforeCount === 0) {
        this.log(`No TS${config.errorCode} errors found, skipping`, 'info');
        continue;
      }
      
      const result = await this.runFixerScript(config.script, config.errorCode, config.iterations);
      
      const currentTotal = await this.getTotalErrorCount();
      this.log(`Current total errors after ${config.script}: ${currentTotal}`);
      
      // If we've made significant progress or reached zero errors, report
      if (currentTotal === 0) {
        this.log('🎉 All TypeScript errors resolved!', 'success');
        break;
      } else if (result && result.totalImprovement > 0) {
        this.log(`Progress: ${result.totalImprovement} total errors fixed`, 'success');
      }
      
      // Small delay between fixers
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate final report
    const finalTotal = await this.getTotalErrorCount();
    await this.generateFinalReport(initialTotal, finalTotal);
    
    return {
      initialTotal,
      finalTotal,
      improvement: initialTotal - finalTotal,
      results: this.results
    };
  }
}

const priorityOrchestrator = new PriorityOrchestrator();
priorityOrchestrator.run().catch(err => {
  console.error('PriorityOrchestrator failed:', err);
  process.exitCode = 1;
});