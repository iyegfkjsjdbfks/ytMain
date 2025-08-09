#!/usr/bin/env node
/**
 * Error Counting and Analysis Script
 * Analyzes TypeScript errors by type and provides detailed reports
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

class ErrorAnalyzer {
  constructor() {
    this.errorTypes = new Map();
    this.totalErrors = 0;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📊',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type] || '📊';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async countErrors() {
    this.log('Analyzing TypeScript errors...');
    
    try {
      // Run type-check and capture output
      const result = execSync('npm run type-check', { 
        encoding: 'utf8', 
        stdio: 'pipe',
        cwd: process.cwd()
      });
    } catch (error) {
      // TypeScript errors are expected - we want the stderr output
      const output = error.stdout + error.stderr;
      this.analyzeErrorOutput(output);
    }

    return this.generateReport();
  }

  analyzeErrorOutput(output) {
    const lines = output.split('\n');
    let currentFile = '';
    
    for (const line of lines) {
      // Track current file
      if (line.includes('.ts(') || line.includes('.tsx(')) {
        const match = line.match(/([^\\\/]+\.tsx?)\(/);
        if (match) {
          currentFile = match[1];
        }
      }

      // Analyze error patterns
      if (line.includes('error TS')) {
        this.totalErrors++;
        this.categorizeError(line, currentFile);
      }
    }
  }

  categorizeError(errorLine, file) {
    const errorCode = errorLine.match(/TS(\d+):/)?.[1];
    const errorMessage = errorLine.replace(/.*error TS\d+:\s*/, '');

    // Define error categories
    const categories = {
      'TS2304': 'Cannot find name',
      'TS2339': 'Property does not exist',
      'TS2322': 'Type not assignable',
      'TS2300': 'Duplicate identifier',
      'TS6133': 'Declared but never used',
      'TS18048': 'Possibly undefined',
      'TS7019': 'Implicitly has any type',
      'TS2551': 'Property does not exist on type',
      'TS1128': 'Declaration or statement expected',
      'TS1005': 'Expected token',
      'TS2779': 'Assignment to optional property'
    };

    const category = categories[`TS${errorCode}`] || `TS${errorCode}`;
    
    if (!this.errorTypes.has(category)) {
      this.errorTypes.set(category, {
        code: errorCode,
        count: 0,
        files: new Set(),
        examples: []
      });
    }

    const errorData = this.errorTypes.get(category);
    errorData.count++;
    errorData.files.add(file);
    
    if (errorData.examples.length < 3) {
      errorData.examples.push({
        file,
        message: errorMessage.substring(0, 100)
      });
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalErrors: this.totalErrors,
      errorsByType: {},
      summary: []
    };

    // Sort error types by count
    const sortedErrors = [...this.errorTypes.entries()]
      .sort((a, b) => b[1].count - a[1].count);

    for (const [category, data] of sortedErrors) {
      report.errorsByType[category] = {
        count: data.count,
        percentage: ((data.count / this.totalErrors) * 100).toFixed(1),
        affectedFiles: data.files.size,
        examples: data.examples
      };

      report.summary.push(`${category}: ${data.count} errors (${data.files.size} files)`);
    }

    // Save detailed report
    writeFileSync('error-analysis-report.json', JSON.stringify(report, null, 2));
    
    // Display summary
    this.log(`Total errors found: ${this.totalErrors}`, 'info');
    this.log('Error breakdown by type:', 'info');
    
    for (const summary of report.summary) {
      console.log(`  • ${summary}`);
    }

    this.log('Detailed report saved to error-analysis-report.json', 'success');
    
    return report;
  }

  async getErrorCountForType(errorCode) {
    try {
      const result = execSync(`npm run type-check 2>&1 | findstr "TS${errorCode}:" | wc -l`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(result.trim()) || 0;
    } catch {
      return 0;
    }
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new ErrorAnalyzer();
  analyzer.countErrors().catch(console.error);
}

export { ErrorAnalyzer };