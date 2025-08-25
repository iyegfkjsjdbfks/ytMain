/**
 * Basic Usage Examples for TypeScript Error Resolution System
 * 
 * This file demonstrates how to use the system programmatically
 * and via CLI for common scenarios.
 */

import { resolveTypeScriptErrors, WorkflowCoordinator, ErrorAnalyzer, ValidationEngine, ReportGenerator } from '../src/error-resolution';

// Example 1: Simple error resolution
async function basicErrorResolution() {
  console.log('🔧 Basic Error Resolution Example');
  
  try {
    const result = await resolveTypeScriptErrors('./my-project', {
      dryRun: false,
      backupEnabled: true,
      validationEnabled: true,
      generateReports: true
    });

    console.log(`✅ Results:`);
    console.log(`  - Initial errors: ${result.initialErrorCount}`);
    console.log(`  - Errors fixed: ${result.errorsFixed}`);
    console.log(`  - Success rate: ${((result.errorsFixed / result.initialErrorCount) * 100).toFixed(1)}%`);
    console.log(`  - Execution time: ${(result.executionTime / 1000).toFixed(1)}s`);
    
  } catch (error) {
    console.error('❌ Error resolution failed:', error);
  }
}

// Example 2: Advanced workflow with custom configuration
async function advancedWorkflow() {
  console.log('🚀 Advanced Workflow Example');
  
  const coordinator = new WorkflowCoordinator();
  
  // Add custom phase
  coordinator.addPhase({
    id: 'custom-validation',
    name: 'Custom Project Validation',
    description: 'Run project-specific validation checks',
    dependencies: ['validation'],
    required: false,
    execute: async (context) => {
      console.log('Running custom validation...');
      // Custom validation logic here
    }
  });

  const config = {
    projectRoot: './my-project',
    dryRun: false,
    backupEnabled: true,
    validationEnabled: true,
    timeoutSeconds: 600, // 10 minutes
    maxRetries: 3,
    rollbackOnFailure: true,
    continueOnValidationFailure: false,
    generateReports: true,
    reportFormats: ['json', 'html', 'markdown'] as Array<'json' | 'html' | 'markdown'>
  };

  try {
    const result = await coordinator.executeWorkflow([], config);
    
    console.log(`📊 Advanced Results:`);
    console.log(`  - Phases completed: ${result.phasesCompleted.length}`);
    console.log(`  - Rollback performed: ${result.rollbackPerformed ? 'Yes' : 'No'}`);
    console.log(`  - Validation results: ${result.validationResults.length} suites`);
    
  } catch (error) {
    console.error('❌ Advanced workflow failed:', error);
  }
}

// Example 3: Error analysis only
async function analyzeErrorsOnly() {
  console.log('🔍 Error Analysis Example');
  
  const analyzer = new ErrorAnalyzer();
  
  try {
    // const errors = await analyzer.analyzeProject('./my-project');
    // const categorized = analyzer.categorizeErrors(errors);
    const errors: any[] = [];
    const categorized: any = {};
    
    console.log(`📈 Analysis Results:`);
    console.log(`  - Total errors: ${errors.length}`);
    console.log(`  - Categories:`, categorized);
    
    // Show top 5 most common errors
    const errorCounts = new Map<string, number>();
    errors.forEach(error => {
      const key = `${error.code}: ${error.message}`;
      errorCounts.set(key, (errorCounts.get(key) || 0) + 1);
    });
    
    const topErrors = Array.from(errorCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    console.log(`\n🔝 Top 5 Most Common Errors:`);
    topErrors.forEach(([error, count], index) => {
      console.log(`  ${index + 1}. ${error} (${count} occurrences)`);
    });
    
  } catch (error) {
    console.error('❌ Error analysis failed:', error);
  }
}

// Example 4: Validation only
async function validateProjectOnly() {
  console.log('✅ Validation Example');
  
  const validator = new ValidationEngine();
  
  try {
    // Run TypeScript compilation validation
    const tsResult = await validator.runSuite('typescript-basic', {
      projectRoot: './my-project'
    });
    
    console.log(`📋 TypeScript Validation:`);
    console.log(`  - Overall success: ${tsResult.overallSuccess ? '✅' : '❌'}`);
    console.log(`  - Checks passed: ${tsResult.passedChecks}/${tsResult.totalChecks}`);
    console.log(`  - Duration: ${(tsResult.duration / 1000).toFixed(1)}s`);
    
    // Run code quality validation
    const qualityResult = await validator.runSuite('code-quality', {
      projectRoot: './my-project'
    });
    
    console.log(`\n🎯 Code Quality Validation:`);
    console.log(`  - Overall success: ${qualityResult.overallSuccess ? '✅' : '❌'}`);
    console.log(`  - Checks passed: ${qualityResult.passedChecks}/${qualityResult.totalChecks}`);
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
  }
}

// Example 5: Custom report generation
async function generateCustomReport() {
  console.log('📄 Custom Report Example');
  
  const reportGenerator = new ReportGenerator({
    outputDirectory: './custom-reports',
    generateHtmlReport: true,
    generateJsonReport: true,
    generateMarkdownReport: true
  });
  
  // This would typically be called after error resolution
  // For demo purposes, we'll show the structure
  console.log('Report generator configured for custom output directory');
  console.log('Reports will be generated in: ./custom-reports');
}

// Example 6: Dry run for safe preview
async function dryRunExample() {
  console.log('👀 Dry Run Example');
  
  try {
    const result = await resolveTypeScriptErrors('./my-project', {
      dryRun: true, // Preview changes without applying them
      backupEnabled: false, // No backup needed for dry run
      validationEnabled: false, // Skip validation for preview
      generateReports: true
    });

    console.log(`🔍 Dry Run Results (Preview Only):`);
    console.log(`  - Would fix: ${result.errorsFixed} errors`);
    console.log(`  - Would process: ${result.phasesCompleted.length} phases`);
    console.log(`  - Estimated time: ${(result.executionTime / 1000).toFixed(1)}s`);
    console.log(`\n💡 Run without --dry-run to apply these changes`);
    
  } catch (error) {
    console.error('❌ Dry run failed:', error);
  }
}

// Run examples
async function runExamples() {
  console.log('🎯 TypeScript Error Resolution - Usage Examples\n');
  
  await basicErrorResolution();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await advancedWorkflow();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await analyzeErrorsOnly();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await validateProjectOnly();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await generateCustomReport();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await dryRunExample();
}

// CLI Usage Examples (as comments for reference)
/*

# Basic CLI Usage Examples:

# 1. Analyze project errors
error-resolver analyze --project ./my-project --output analysis.json

# 2. Fix errors with backup (recommended)
error-resolver fix --project ./my-project

# 3. Dry run to preview changes
error-resolver fix --project ./my-project --dry-run

# 4. Fix without backup (not recommended)
error-resolver fix --project ./my-project --no-backup

# 5. Fix with custom timeout
error-resolver fix --project ./my-project --timeout 600

# 6. Continue on validation failure
error-resolver fix --project ./my-project --continue-on-failure

# 7. Validate project only
error-resolver validate --project ./my-project

# 8. Run specific validation suite
error-resolver validate --project ./my-project --suite code-quality

# 9. Initialize configuration
error-resolver config --init

# 10. Show current configuration
error-resolver config --show

*/

// Export for use in other files
export {
  basicErrorResolution,
  advancedWorkflow,
  analyzeErrorsOnly,
  validateProjectOnly,
  generateCustomReport,
  dryRunExample,
  runExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}