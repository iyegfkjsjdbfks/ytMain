#!/usr/bin/env node
/**
 * Error Counter - Counts TypeScript errors by type and provides detailed analysis
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class ErrorCounter {
  constructor() {
    this.lastKnownErrorOutput = '';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    const prefix = {
      info: '📊',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type] || '📊';
    
    console.log(`${colors[type]}${prefix} [${timestamp}] ${message}${colors.reset}`);
  }

  async runTypeCheck(timeout = 30000) {
    try {
      const result = execSync('npm run type-check', {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: projectRoot,
        timeout
      });
      // No errors - successful type check
      this.lastKnownErrorOutput = '';
      return '';
    } catch (error) {
      // Type check failed - capture error output
      const output = `${error.stdout || ''}${error.stderr || ''}`;
      this.lastKnownErrorOutput = output;
      
      // Save to file for later reference
      const typeErrorsPath = join(projectRoot, 'type-errors.txt');
      writeFileSync(typeErrorsPath, output, 'utf8');
      
      return output;
    }
  }

  async getTotalErrorCount() {
    const output = await this.runTypeCheck();
    if (!output) return 0;

    const errorLines = output.split('\n').filter(line => /error TS\d+:/.test(line));
    return errorLines.length;
  }

  async getErrorsByType() {
    const output = await this.runTypeCheck();
    if (!output) return {};

    const errors = {};
    const lines = output.split('\n');

    for (const line of lines) {
      const match = line.match(/error TS(\d+):/);
      if (match) {
        const errorCode = match[1];
        if (!errors[errorCode]) {
          errors[errorCode] = {
            count: 0,
            examples: []
          };
        }
        errors[errorCode].count++;
        
        // Store a few examples (up to 3)
        if (errors[errorCode].examples.length < 3) {
          errors[errorCode].examples.push(line.trim());
        }
      }
    }

    return errors;
  }

  async getDetailedReport() {
    this.log('Running detailed error analysis...');
    
    const totalErrors = await this.getTotalErrorCount();
    const errorsByType = await this.getErrorsByType();
    
    const report = {
      timestamp: new Date().toISOString(),
      totalErrors,
      errorTypes: Object.keys(errorsByType).length,
      breakdown: errorsByType,
      summary: []
    };

    // Create summary
    for (const [code, data] of Object.entries(errorsByType)) {
      report.summary.push({
        code: `TS${code}`,
        count: data.count,
        percentage: ((data.count / totalErrors) * 100).toFixed(1),
        examples: data.examples
      });
    }

    // Sort by count descending
    report.summary.sort((a, b) => b.count - a.count);

    return report;
  }

  async displayReport() {
    const report = await this.getDetailedReport();
    
    this.log('\n' + '='.repeat(70));
    this.log('📊 TYPESCRIPT ERROR ANALYSIS REPORT');
    this.log('='.repeat(70));
    this.log(`⏱️  Timestamp: ${report.timestamp}`);
    this.log(`📈 Total errors: ${report.totalErrors}`);
    this.log(`🏷️  Error types: ${report.errorTypes}`);
    this.log('');

    if (report.totalErrors === 0) {
      this.log('🎉 No TypeScript errors found! Codebase is clean.', 'success');
      return report;
    }

    this.log('📋 ERROR BREAKDOWN BY TYPE:');
    this.log('');

    for (const item of report.summary) {
      this.log(`${item.code}: ${item.count} errors (${item.percentage}%)`);
      for (const example of item.examples.slice(0, 1)) {
        this.log(`  └─ ${example}`, 'info');
      }
      this.log('');
    }

    // Save detailed report
    const reportPath = join(projectRoot, 'error-analysis-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`📁 Detailed report saved to: ${reportPath}`);

    return report;
  }

  async saveBaseline() {
    const report = await this.getDetailedReport();
    const baselinePath = join(projectRoot, 'error-baseline.json');
    writeFileSync(baselinePath, JSON.stringify(report, null, 2));
    this.log(`💾 Error baseline saved to: ${baselinePath}`);
    return report;
  }

  async compareToBaseline() {
    const baselinePath = join(projectRoot, 'error-baseline.json');
    if (!existsSync(baselinePath)) {
      this.log('No baseline found. Creating new baseline...', 'warning');
      return await this.saveBaseline();
    }

    const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
    const current = await this.getDetailedReport();

    const comparison = {
      baseline: baseline.totalErrors,
      current: current.totalErrors,
      change: current.totalErrors - baseline.totalErrors,
      improvement: baseline.totalErrors - current.totalErrors,
      percentageChange: baseline.totalErrors > 0 ? 
        (((current.totalErrors - baseline.totalErrors) / baseline.totalErrors) * 100).toFixed(1) : '0'
    };

    this.log('\n' + '='.repeat(70));
    this.log('📊 BASELINE COMPARISON');
    this.log('='.repeat(70));
    this.log(`📊 Baseline errors: ${comparison.baseline}`);
    this.log(`📈 Current errors: ${comparison.current}`);
    this.log(`📉 Change: ${comparison.change >= 0 ? '+' : ''}${comparison.change}`);
    this.log(`✨ Improvement: ${comparison.improvement}`);
    this.log(`📊 Percentage change: ${comparison.percentageChange}%`);

    if (comparison.improvement > 0) {
      this.log(`🎉 Great! Reduced errors by ${comparison.improvement}!`, 'success');
    } else if (comparison.change === 0) {
      this.log('📊 No change in error count', 'info');
    } else {
      this.log(`⚠️ Error count increased by ${Math.abs(comparison.change)}`, 'warning');
    }

    return { current, baseline, comparison };
  }
}

// CLI handling
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     import.meta.url.endsWith(process.argv[1]) ||
                     process.argv[1].endsWith('count-errors.js');

if (isMainModule) {
  const counter = new ErrorCounter();
  const command = process.argv[2];

  switch (command) {
    case 'baseline':
      counter.saveBaseline().catch(err => {
        console.error('Failed to save baseline:', err);
        process.exitCode = 1;
      });
      break;
    case 'compare':
      counter.compareToBaseline().catch(err => {
        console.error('Failed to compare to baseline:', err);
        process.exitCode = 1;
      });
      break;
    case 'total':
      counter.getTotalErrorCount().then(count => {
        console.log(count);
      }).catch(err => {
        console.error('Failed to get total count:', err);
        process.exitCode = 1;
      });
      break;
    default:
      counter.displayReport().catch(err => {
        console.error('Failed to display report:', err);
        process.exitCode = 1;
      });
  }
}

export { ErrorCounter };