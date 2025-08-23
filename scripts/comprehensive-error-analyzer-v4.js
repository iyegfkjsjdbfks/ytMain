#!/usr/bin/env node
/**
 * Comprehensive Error Analyzer v4
 * Analyzes TypeScript errors and categorizes them by type and severity
 * Provides detailed statistics and recommendations for fixing strategy
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

class ComprehensiveErrorAnalyzer {
  constructor() {
    this.errorCategories = new Map();
    this.fileErrorCounts = new Map();
    this.errorTypes = new Map();
    this.totalErrors = 0;
    this.corruptedFiles = new Set();
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async analyzeErrors() {
    this.log('🔍 Starting Comprehensive Error Analysis...');
    
    try {
      // Run TypeScript compiler to get all errors
      const result = execSync('npx tsc --noEmit', {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: process.cwd(),
        timeout: 60000
      });
      this.log('✅ No TypeScript errors found!', 'success');
      return this.generateReport();
    } catch (error) {
      const output = error.stdout + error.stderr;
      this.parseErrors(output);
      return this.generateReport();
    }
  }

  parseErrors(output) {
    const lines = output.split('\n');
    let currentFile = '';
    
    for (const line of lines) {
      // Match error pattern: filename:line:col - error TSxxxx: message
      const errorMatch = line.match(/^(.+?):(\d+):(\d+) - error (TS\d+): (.+)$/);
      
      if (errorMatch) {
        const [, file, lineNum, col, errorCode, message] = errorMatch;
        this.totalErrors++;
        
        // Track file error counts
        if (!this.fileErrorCounts.has(file)) {
          this.fileErrorCounts.set(file, 0);
        }
        this.fileErrorCounts.set(file, this.fileErrorCounts.get(file) + 1);
        
        // Track error types
        if (!this.errorTypes.has(errorCode)) {
          this.errorTypes.set(errorCode, { count: 0, files: new Set(), examples: [] });
        }
        const errorInfo = this.errorTypes.get(errorCode);
        errorInfo.count++;
        errorInfo.files.add(file);
        if (errorInfo.examples.length < 3) {
          errorInfo.examples.push({ file, line: lineNum, message });
        }
        
        // Categorize errors
        this.categorizeError(errorCode, file, message);
        
        // Identify severely corrupted files
        if (this.fileErrorCounts.get(file) > 50) {
          this.corruptedFiles.add(file);
        }
      }
    }
  }

  categorizeError(errorCode, file, message) {
    const syntaxErrors = ['1005', '1128', '1136', '1138', '1131', '1109', '1144', '1068', '1002', '1110', '1160', '1434', '1381'];
    const typeErrors = ['2304', '2339', '2322', '2345', '2739', '2551', '2503', '2305', '2307'];
    const unusedErrors = ['6133', '6196'];
    const implicitAnyErrors = ['7006', '7019', '7026', '7031', '7053'];
    const jsxErrors = ['2875', '17004', '17009'];
    
    let category = 'Other';
    
    if (syntaxErrors.includes(errorCode.replace('TS', ''))) {
      category = 'Syntax Errors';
    } else if (typeErrors.includes(errorCode.replace('TS', ''))) {
      category = 'Type Errors';
    } else if (unusedErrors.includes(errorCode.replace('TS', ''))) {
      category = 'Unused Code';
    } else if (implicitAnyErrors.includes(errorCode.replace('TS', ''))) {
      category = 'Implicit Any';
    } else if (jsxErrors.includes(errorCode.replace('TS', ''))) {
      category = 'JSX Errors';
    }
    
    if (!this.errorCategories.has(category)) {
      this.errorCategories.set(category, { count: 0, types: new Set() });
    }
    this.errorCategories.get(category).count++;
    this.errorCategories.get(category).types.add(errorCode);
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalErrors: this.totalErrors,
        totalFiles: this.fileErrorCounts.size,
        corruptedFiles: Array.from(this.corruptedFiles),
        averageErrorsPerFile: this.totalErrors / this.fileErrorCounts.size
      },
      categories: {},
      errorTypes: {},
      topErrorFiles: [],
      recommendations: []
    };

    // Process categories
    for (const [category, info] of this.errorCategories.entries()) {
      report.categories[category] = {
        count: info.count,
        percentage: ((info.count / this.totalErrors) * 100).toFixed(1),
        types: Array.from(info.types)
      };
    }

    // Process error types
    for (const [errorCode, info] of this.errorTypes.entries()) {
      report.errorTypes[errorCode] = {
        count: info.count,
        percentage: ((info.count / this.totalErrors) * 100).toFixed(1),
        affectedFiles: info.files.size,
        examples: info.examples
      };
    }

    // Top error files
    const sortedFiles = Array.from(this.fileErrorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    
    report.topErrorFiles = sortedFiles.map(([file, count]) => ({ file, count }));

    // Generate recommendations
    this.generateRecommendations(report);

    // Save report
    writeFileSync('comprehensive-error-analysis-v4.json', JSON.stringify(report, null, 2));
    
    // Display summary
    this.displaySummary(report);
    
    return report;
  }

  generateRecommendations(report) {
    const recommendations = [];
    
    // Check for corrupted files
    if (report.summary.corruptedFiles.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'DELETE_CORRUPTED_FILES',
        description: `Delete ${report.summary.corruptedFiles.length} severely corrupted files with >50 errors each`,
        files: report.summary.corruptedFiles
      });
    }
    
    // Syntax errors priority
    if (report.categories['Syntax Errors']) {
      recommendations.push({
        priority: 'HIGH',
        action: 'FIX_SYNTAX_ERRORS',
        description: `Fix ${report.categories['Syntax Errors'].count} syntax errors first`,
        script: 'fix-comprehensive-syntax-v2.js'
      });
    }
    
    // Type errors
    if (report.categories['Type Errors']) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'FIX_TYPE_ERRORS',
        description: `Fix ${report.categories['Type Errors'].count} type errors`,
        script: 'fix-all-type-errors.js'
      });
    }
    
    // Unused code cleanup
    if (report.categories['Unused Code']) {
      recommendations.push({
        priority: 'LOW',
        action: 'CLEANUP_UNUSED',
        description: `Clean up ${report.categories['Unused Code'].count} unused declarations`,
        script: 'fix-ts6133-unused-vars-enhanced.js'
      });
    }
    
    report.recommendations = recommendations;
  }

  displaySummary(report) {
    this.log('\n' + '='.repeat(80));
    this.log('📊 COMPREHENSIVE ERROR ANALYSIS REPORT');
    this.log('='.repeat(80));
    this.log(`📈 Total Errors: ${report.summary.totalErrors}`);
    this.log(`📁 Affected Files: ${report.summary.totalFiles}`);
    this.log(`💥 Corrupted Files: ${report.summary.corruptedFiles.length}`);
    this.log(`📊 Average Errors/File: ${report.summary.averageErrorsPerFile.toFixed(1)}`);
    
    this.log('\n🏷️  ERROR CATEGORIES:');
    for (const [category, info] of Object.entries(report.categories)) {
      this.log(`  ${category}: ${info.count} (${info.percentage}%)`);
    }
    
    this.log('\n🔥 TOP ERROR TYPES:');
    const topTypes = Object.entries(report.errorTypes)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);
    
    for (const [errorCode, info] of topTypes) {
      this.log(`  ${errorCode}: ${info.count} errors in ${info.affectedFiles} files`);
    }
    
    this.log('\n⚠️  MOST PROBLEMATIC FILES:');
    for (const { file, count } of report.topErrorFiles.slice(0, 10)) {
      const status = count > 50 ? '💥 CORRUPTED' : count > 20 ? '⚠️  PROBLEMATIC' : '📝 FIXABLE';
      this.log(`  ${status} ${file}: ${count} errors`);
    }
    
    this.log('\n🎯 RECOMMENDATIONS:');
    for (const rec of report.recommendations) {
      const priority = rec.priority === 'CRITICAL' ? '🚨' : rec.priority === 'HIGH' ? '⚠️' : '📝';
      this.log(`  ${priority} ${rec.priority}: ${rec.description}`);
    }
    
    this.log(`\n📁 Detailed report saved to: comprehensive-error-analysis-v4.json`);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('comprehensive-error-analyzer-v4.js')) {
  const analyzer = new ComprehensiveErrorAnalyzer();
  analyzer.analyzeErrors().catch(err => {
    console.error('Analysis failed:', err);
    process.exitCode = 1;
  });
}

export { ComprehensiveErrorAnalyzer };