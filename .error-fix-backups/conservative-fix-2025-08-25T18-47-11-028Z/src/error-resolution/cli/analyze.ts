// @ts-nocheck
#!/usr/bin/env node;

import { ErrorAnalyzer } from '../core/ErrorAnalyzer';
import * as path from 'path';

/**
 * CLI script to analyze TypeScript errors in the current project;
 */
async function main() {
  console.log('🚀 TypeScript Error Analysis Tool');
  console.log('==================================');
  
  try {
    const analyzer = new ErrorAnalyzer();
    
    // Analyze errors;
    const result = await analyzer.analyzeErrors();
    
    // Display summary;
    console.log('\n📊 ANALYSIS SUMMARY');
    console.log('==================');
    console.log(`Total Errors: ${result.totalErrors}`);
    console.log(`Critical Files: ${result.criticalFiles.length}`);
    console.log(`Error Categories: ${result.errorsByCategory.size}`);
    
    // Display error breakdown by category;
    console.log('\n📦 ERRORS BY CATEGORY');
    console.log('====================');
    for (const [category, errors] of result.errorsByCategory.entries()) {
      const rootCause = errors[0]?.category.rootCause || 'Unknown';
      const strategy = errors[0]?.category.fixingStrategy || 'individual';
      console.log(`${category}: ${errors.length} errors (${rootCause}, ${strategy} fix)`);
    
    // Display error breakdown by severity;
    console.log('\n🚨 ERRORS BY SEVERITY');
    console.log('====================');
    for (const [severity, errors] of result.errorsBySeverity.entries()) {
      console.log(`${severity.toUpperCase()}: ${errors.length} errors`);
    
    // Display top problematic files;
    console.log('\n📁 TOP PROBLEMATIC FILES');
    console.log('=======================');
    const fileErrorCounts = Array.from(result.errorsByFile.entries());
      .map(([file, errors]) => ({ file, count: errors.length }));
      .sort((a, b) => b.count - a.count);
      .slice(0, 10);
      
    for (const { file, count } of fileErrorCounts) {
      console.log(`${file}: ${count} errors`);
    
    // Display recommendations;
    console.log('\n💡 RECOMMENDATIONS');
    console.log('==================');
    for (const recommendation of result.recommendations) {
      console.log(`• ${recommendation}`);
    
    // Save detailed analysis;
    const outputPath = path.join(process.cwd(), 'error-analysis-result.json');
    console.log(`Saving analysis to: ${outputPath}`);
    await analyzer.saveAnalysisResult(result, outputPath);
    
    console.log(`\n✅ Analysis complete! Detailed results saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);

// Run the CLI if this file is executed directly;
if (require.main === module) {
  main().catch(console.error);

export { main };