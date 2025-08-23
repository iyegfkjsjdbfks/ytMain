#!/usr/bin/env node
/**
 * Error Capture Analyzer
 * Captures TypeScript errors and analyzes them comprehensively
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

class ErrorCaptureAnalyzer {
  constructor() {
    this.errorCategories = new Map();
    this.fileErrorCounts = new Map();
    this.errorTypes = new Map();
    this.totalErrors = 0;
    this.corruptedFiles = new Set();
    this.rawOutput = '';
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

  async captureErrors() {
    this.log('🔍 Capturing TypeScript errors...');
    
    try {
      // Run TypeScript compiler and capture all output
      execSync('npx tsc --noEmit', {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: process.cwd(),
        timeout: 120000
      });
      this.log('✅ No TypeScript errors found!', 'success');
      return this.generateReport();
    } catch (error) {
      // Capture both stdout and stderr
      this.rawOutput = (error.stdout || '') + (error.stderr || '');
      
      // Save raw output for debugging
      writeFileSync('typescript-errors-raw.txt', this.rawOutput);
      this.log(`📝 Raw errors saved to typescript-errors-raw.txt`);
      
      this.parseErrors(this.rawOutput);
      return this.generateReport();
    }
  }

  parseErrors(output) {
    const lines = output.split('\n');
    
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
        if (errorInfo.examples.length < 5) {
          errorInfo.examples.push({ file, line: lineNum, message: message.substring(0, 100) });
        }
        
        // Categorize errors
        this.categorizeError(errorCode, file, message);
        
        // Identify severely corrupted files (>30 errors)
        if (this.fileErrorCounts.get(file) > 30) {
          this.corruptedFiles.add(file);
        }
      }
    }
    
    this.log(`📊 Parsed ${this.totalErrors} errors from ${this.fileErrorCounts.size} files`);
  }

  categorizeError(errorCode, file, message) {
    const code = errorCode.replace('TS', '');
    
    const categories = {
      'Critical Syntax': ['1005', '1128', '1136', '1138', '1131', '1109', '1144', '1068', '1002', '1110', '1160', '1434', '1381'],
      'Type Errors': ['2304', '2339', '2322', '2345', '2739', '2551', '2503', '2305', '2307', '2875'],
      'Unused Code': ['6133', '6196'],
      'Implicit Any': ['7006', '7019', '7026', '7031', '7053'],
      'JSX Errors': ['2875', '17004', '17009'],
      'Import/Export': ['2307', '2305', '1192', '1259']
    };
    
    let category = 'Other';
    
    for (const [cat, codes] of Object.entries(categories)) {
      if (codes.includes(code)) {
        category = cat;
        break;
      }
    }
    
    if (!this.errorCategories.has(category)) {
      this.errorCategories.set(category, { count: 0, types: new Set(), files: new Set() });
    }
    const catInfo = this.errorCategories.get(category);
    catInfo.count++;
    catInfo.types.add(errorCode);
    catInfo.files.add(file);
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalErrors: this.totalErrors,
        totalFiles: this.fileErrorCounts.size,
        corruptedFiles: Array.from(this.corruptedFiles),
        averageErrorsPerFile: this.totalErrors / Math.max(this.fileErrorCounts.size, 1)
      },
      categories: {},
      errorTypes: {},
      topErrorFiles: [],
      recommendations: [],
      strategy: {}
    };

    // Process categories
    for (const [category, info] of this.errorCategories.entries()) {
      report.categories[category] = {
        count: info.count,
        percentage: ((info.count / this.totalErrors) * 100).toFixed(1),
        types: Array.from(info.types),
        affectedFiles: info.files.size
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
      .slice(0, 30);
    
    report.topErrorFiles = sortedFiles.map(([file, count]) => ({ 
      file, 
      count, 
      status: count > 30 ? 'CORRUPTED' : count > 15 ? 'PROBLEMATIC' : 'FIXABLE'
    }));

    // Generate strategy and recommendations
    this.generateStrategy(report);

    // Save report
    writeFileSync('error-analysis-detailed.json', JSON.stringify(report, null, 2));
    
    // Display summary
    this.displaySummary(report);
    
    return report;
  }

  generateStrategy(report) {
    const recommendations = [];
    const strategy = {
      phase1: 'Delete corrupted files and clean cache',
      phase2: 'Fix critical syntax errors',
      phase3: 'Fix type and import errors',
      phase4: 'Clean up unused code',
      estimatedTime: 'Unknown'
    };
    
    // Critical: Delete corrupted files
    if (report.summary.corruptedFiles.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'DELETE_CORRUPTED_FILES',
        description: `Delete ${report.summary.corruptedFiles.length} severely corrupted files (>30 errors each)`,
        files: report.summary.corruptedFiles,
        script: 'delete-corrupted-files.js'
      });
    }
    
    // High: Fix syntax errors
    if (report.categories['Critical Syntax']) {
      recommendations.push({
        priority: 'HIGH',
        action: 'FIX_SYNTAX_ERRORS',
        description: `Fix ${report.categories['Critical Syntax'].count} critical syntax errors`,
        script: 'fix-comprehensive-syntax-v2.js',
        errorTypes: report.categories['Critical Syntax'].types
      });
    }
    
    // Medium: Fix type errors
    if (report.categories['Type Errors']) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'FIX_TYPE_ERRORS',
        description: `Fix ${report.categories['Type Errors'].count} type-related errors`,
        script: 'fix-type-errors-comprehensive.js',
        errorTypes: report.categories['Type Errors'].types
      });
    }
    
    // Low: Clean unused code
    if (report.categories['Unused Code']) {
      recommendations.push({
        priority: 'LOW',
        action: 'CLEANUP_UNUSED',
        description: `Clean up ${report.categories['Unused Code'].count} unused declarations`,
        script: 'fix-ts6133-unused-vars-enhanced.js'
      });
    }
    
    // Estimate time based on error count
    if (report.summary.totalErrors > 5000) {
      strategy.estimatedTime = '2-4 hours';
    } else if (report.summary.totalErrors > 1000) {
      strategy.estimatedTime = '1-2 hours';
    } else {
      strategy.estimatedTime = '30-60 minutes';
    }
    
    report.recommendations = recommendations;
    report.strategy = strategy;
  }

  displaySummary(report) {
    this.log('\n' + '='.repeat(80));
    this.log('📊 DETAILED ERROR ANALYSIS REPORT');
    this.log('='.repeat(80));
    this.log(`📈 Total Errors: ${report.summary.totalErrors}`);
    this.log(`📁 Affected Files: ${report.summary.totalFiles}`);
    this.log(`💥 Corrupted Files: ${report.summary.corruptedFiles.length}`);
    this.log(`📊 Average Errors/File: ${report.summary.averageErrorsPerFile.toFixed(1)}`);
    this.log(`⏱️  Estimated Fix Time: ${report.strategy.estimatedTime}`);
    
    this.log('\n🏷️  ERROR CATEGORIES:');
    for (const [category, info] of Object.entries(report.categories)) {
      this.log(`  ${category}: ${info.count} errors (${info.percentage}%) in ${info.affectedFiles} files`);
    }
    
    this.log('\n🔥 TOP ERROR TYPES:');
    const topTypes = Object.entries(report.errorTypes)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 15);
    
    for (const [errorCode, info] of topTypes) {
      this.log(`  ${errorCode}: ${info.count} errors (${info.percentage}%) in ${info.affectedFiles} files`);
    }
    
    this.log('\n⚠️  MOST PROBLEMATIC FILES:');
    for (const { file, count, status } of report.topErrorFiles.slice(0, 15)) {
      const emoji = status === 'CORRUPTED' ? '💥' : status === 'PROBLEMATIC' ? '⚠️' : '📝';
      this.log(`  ${emoji} ${status}: ${file} (${count} errors)`);
    }
    
    this.log('\n🎯 RECOMMENDED STRATEGY:');
    for (const rec of report.recommendations) {
      const priority = rec.priority === 'CRITICAL' ? '🚨' : rec.priority === 'HIGH' ? '⚠️' : '📝';
      this.log(`  ${priority} ${rec.priority}: ${rec.description}`);
      if (rec.script) {
        this.log(`     Script: ${rec.script}`);
      }
    }
    
    this.log(`\n📁 Detailed report: error-analysis-detailed.json`);
    this.log(`📁 Raw errors: typescript-errors-raw.txt`);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('error-capture-analyzer.js')) {
  const analyzer = new ErrorCaptureAnalyzer();
  analyzer.captureErrors().catch(err => {
    console.error('Analysis failed:', err);
    process.exitCode = 1;
  });
}

export { ErrorCaptureAnalyzer };