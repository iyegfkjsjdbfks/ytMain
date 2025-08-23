#!/usr/bin/env ts-node

/**
 * Basic usage example for TypeScript Error Resolution system
 * 
 * This example demonstrates how to use the system programmatically
 * to analyze and fix TypeScript errors in a project.
 */

import { resolveTypeScriptErrors, WorkflowCoordinator, ErrorAnalyzer } from '../src/error-resolution';
import * as path from 'path';

async function basicUsageExample() {
  console.log('🚀 TypeScript Error Resolution - Basic Usage Example\n');

  const projectRoot = path.join(__dirname, '../test-project');
  
  try {
    // Example 1: Simple error resolution
    console.log('📋 Example 1: Simple Error Resolution');
    console.log('=====================================');
    
    const result = await resolveTypeScriptErrors(projectRoot, {
      dryRun: true, // Preview changes without applying them
      backupEnabled: true,
      validationEnabled: true,
      generateReports: true
    });

    console.log(`✅ Analysis complete!`);
    console.log(`   Initial errors: ${result.initialErrorCount}`);
    console.log(`   Errors fixed: ${result.errorsFixed}`);
    console.log(`   Success rate: ${((result.errorsFixed / result.initialErrorCount) * 100).toFixed(1)}%`);
    console.log(`   Execution time: ${(result.executionTime / 1000).toFixed(1)}s\n`);

    // Example 2: Advanced workflow with custom configuration
    console.log('📋 Example 2: Advanced Workflow Configuration');
    console.log('=============================================');
    
    const coordinator = new WorkflowCoordinator();
    
    const advancedResult = await coordinator.executeWorkflow([], {
      projectRoot,
      dryRun: false, // Actually apply fixes
      backupEnabled: true,
      validationEnabled: true,
      timeoutSeconds: 600, // 10 minutes
      maxRetries: 3,
      rollbackOnFailure: true,
      continueOnValidationFailure: false,
      generateReports: true,
      reportFormats: ['html', 'json', 'markdown']
    });

    console.log(`✅ Advanced workflow complete!`);
    console.log(`   Phases completed: ${advancedResult.phasesCompleted.join(', ')}`);
    console.log(`   Rollback performed: ${advancedResult.rollbackPerformed ? 'Yes' : 'No'}`);
    
    if (advancedResult.report) {
      console.log(`   Report generated: ${advancedResult.report.id}`);
    }

    // Example 3: Error analysis only
    console.log('\n📋 Example 3: Error Analysis Only');
    console.log('=================================');
    
    const analyzer = new ErrorAnalyzer();
    const errors = await analyzer.analyzeProject(projectRoot);
    const categorized = analyzer.categorizeErrors(errors);
    
    console.log(`📊 Error Analysis Results:`);
    console.log(`   Total errors: ${errors.length}`);
    console.log(`   Categories:`);
    
    for (const [category, count] of Object.entries(categorized)) {
      console.log(`     - ${category}: ${count}`);
    }

    // Example 4: Monitoring workflow progress
    console.log('\n📋 Example 4: Progress Monitoring');
    console.log('=================================');
    
    const monitoringCoordinator = new WorkflowCoordinator();
    
    // Set up progress monitoring
    monitoringCoordinator.on('phaseStarted', (phase) => {
      console.log(`🔄 Phase started: ${phase.name}`);
    });
    
    monitoringCoordinator.on('phaseCompleted', (phase) => {
      console.log(`✅ Phase completed: ${phase.name}`);
    });
    
    monitoringCoordinator.on('workflowCompleted', (result) => {
      console.log(`🎉 Workflow completed! Success: ${result.success}`);
    });

    // Execute with monitoring
    await monitoringCoordinator.executeWorkflow([], {
      projectRoot,
      dryRun: true,
      backupEnabled: false,
      validationEnabled: false,
      generateReports: false,
      reportFormats: []
    });

  } catch (error) {
    console.error('❌ Error during execution:', error);
    process.exit(1);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  basicUsageExample()
    .then(() => {
      console.log('\n🎊 All examples completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Example failed:', error);
      process.exit(1);
    });
}

export { basicUsageExample };