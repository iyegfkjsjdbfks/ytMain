#!/usr/bin/env node
/**
 * Enhanced Error Counter and Analyzer
 * Provides detailed analysis of TypeScript errors by category
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

class EnhancedErrorAnalyzer {
  constructor() {
    this.errorsByType = new Map();
    this.errorsByFile = new Map();
    this.totalErrors = 0;
    this.projectRoot = process.cwd();
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

  async getTypeCheckOutput() {
    try {
      // Try to read from existing type-errors.txt file first
      const typeErrorsPath = join(this.projectRoot, 'type-errors.txt');
      if (existsSync(typeErrorsPath)) {
        const content = readFileSync(typeErrorsPath, 'utf8');
        if (content.trim().length > 0) {
          return content;
        }
      }

      // Run type-check and capture output
      const result = execSync('npm run type-check', { 
        encoding: 'utf8', 
        stdio: 'pipe',
        cwd: this.projectRoot,
        timeout: 60000
      });
      return result;
    } catch (error) {
      // TypeScript errors are expected - we want the stderr output
      const output = `${error.stdout || ''}${error.stderr || ''}`;
      
      // Save output to file for future reference
      const typeErrorsPath = join(this.projectRoot, 'type-errors.txt');
      writeFileSync(typeErrorsPath, output);
      
      return output;
    }
  }

  analyzeErrorOutput(output) {
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('error TS')) {
        this.totalErrors++;
        this.categorizeError(line);
        this.recordFileError(line);
      }
    }
  }

  categorizeError(errorLine) {
    const errorMatch = errorLine.match(/error TS(\d+):\s*(.+)/);
    if (!errorMatch) return;

    const errorCode = errorMatch[1];
    const errorMessage = errorMatch[2];

    // Enhanced error categorization
    const categories = {
      '1003': 'Syntax Errors - Expected identifier',
      '1005': 'Syntax Errors - Expected comma/token',
      '1381': 'Syntax Errors - Unexpected token',
      '2300': 'Duplicate Identifiers',
      '2304': 'Cannot Find Name/Variable',
      '2305': 'No Exported Member',
      '2307': 'Cannot Find Module',
      '2322': 'Type Not Assignable',
      '2339': 'Property Does Not Exist',
      '2345': 'Argument Type Mismatch',
      '2503': 'Cannot Find Namespace',
      '2551': 'Property Suggestion',
      '2739': 'Missing Properties',
      '2875': 'JSX Runtime Module',
      '6133': 'Declared But Not Used',
      '7006': 'Implicit Any Parameter',
      '7019': 'Implicit Any Type',
      '7026': 'JSX Element Implicit Any',
      '7031': 'Binding Element Implicit Any',
      '7053': 'Element Implicit Any',
      '18048': 'Possibly Undefined'
    };

    const category = categories[errorCode] || `TS${errorCode}`;
    
    if (!this.errorsByType.has(category)) {
      this.errorsByType.set(category, {
        code: errorCode,
        count: 0,
        examples: [],
        priority: this.getErrorPriority(errorCode)
      });
    }

    const errorData = this.errorsByType.get(category);
    errorData.count++;
    
    if (errorData.examples.length < 5) {
      errorData.examples.push({
        message: errorMessage.substring(0, 150),
        line: errorLine
      });
    }
  }

  recordFileError(errorLine) {
    // Extract file path from error line
    const fileMatch = errorLine.match(/^([^(]+)\(/);
    if (!fileMatch) return;

    const filePath = fileMatch[1];
    if (!this.errorsByFile.has(filePath)) {
      this.errorsByFile.set(filePath, {
        count: 0,
        errors: []
      });
    }

    const fileData = this.errorsByFile.get(filePath);
    fileData.count++;
    
    if (fileData.errors.length < 10) {
      fileData.errors.push(errorLine);
    }
  }

  getErrorPriority(errorCode) {
    // Priority levels: 1 = highest, 5 = lowest
    const priorities = {
      '1005': 1, // Syntax errors block everything
      '1003': 1,
      '1381': 1,
      '2875': 2, // Module/JSX issues
      '2307': 2,
      '2503': 2,
      '7026': 3, // Type annotation issues
      '7031': 3,
      '7006': 3,
      '7053': 3,
      '2304': 3, // Missing names/variables
      '2339': 3,
      '2305': 3,
      '6133': 4, // Unused variables
      '2322': 4, // Type mismatches
      '2345': 4,
      '2739': 4,
      '2551': 4,
      '7019': 4,
      '18048': 5, // Possibly undefined
      '2300': 5  // Duplicates
    };
    
    return priorities[errorCode] || 5;
  }

  async countErrorsByType(errorCode) {
    const output = await this.getTypeCheckOutput();
    const regex = new RegExp(`error TS${errorCode}:`, 'g');
    const matches = output.match(regex);
    return matches ? matches.length : 0;
  }

  async getTotalErrorCount() {
    const output = await this.getTypeCheckOutput();
    const errorLines = output.split('\n').filter(line => /error TS\d+:/.test(line));
    return errorLines.length;
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalErrors: this.totalErrors,
      errorsByType: {},
      errorsByFile: {},
      topFiles: [],
      recommendations: []
    };

    // Sort error types by priority and count
    const sortedErrorTypes = [...this.errorsByType.entries()]
      .sort((a, b) => {
        // First by priority (lower number = higher priority)
        if (a[1].priority !== b[1].priority) {
          return a[1].priority - b[1].priority;
        }
        // Then by count (higher count first)
        return b[1].count - a[1].count;
      });

    for (const [category, data] of sortedErrorTypes) {
      report.errorsByType[category] = {
        code: data.code,
        count: data.count,
        percentage: ((data.count / this.totalErrors) * 100).toFixed(1),
        priority: data.priority,
        examples: data.examples,
        fixScript: this.getFixScript(data.code)
      };
    }

    // Sort files by error count
    const sortedFiles = [...this.errorsByFile.entries()]
      .sort((a, b) => b[1].count - a[1].count);

    for (const [filePath, data] of sortedFiles.slice(0, 20)) {
      report.errorsByFile[filePath] = data;
      
      if (report.topFiles.length < 10) {
        report.topFiles.push({
          file: filePath,
          errorCount: data.count
        });
      }
    }

    // Generate recommendations
    this.generateRecommendations(report, sortedErrorTypes);

    return report;
  }

  getFixScript(errorCode) {
    const scripts = {
      '1005': 'fix-malformed-type-annotations.js',
      '1003': 'fix-ts1003-syntax-errors.js',
      '1381': 'fix-unexpected-tokens.js',
      '2875': 'fix-ts2875-jsx-runtime.js',
      '2307': 'fix-ts2307-cannot-find-module.js',
      '2503': 'fix-ts2503-cannot-find-namespace.js',
      '7026': 'fix-ts7026-jsx-implicit-any.js',
      '7031': 'fix-ts7031-binding-element-any.js',
      '7006': 'fix-ts7006-implicit-any-param.js',
      '7053': 'fix-ts7053-element-implicit-any.js',
      '2304': 'fix-ts2304-cannot-find-name.js',
      '2339': 'fix-ts2339-property-errors.js',
      '2305': 'fix-ts2305-no-exported-member.js',
      '6133': 'fix-ts6133-declared-not-used.js',
      '2322': 'fix-ts2322-enhanced.js',
      '2345': 'fix-ts2345-argument-type.js',
      '2739': 'fix-ts2739-missing-properties.js',
      '2551': 'fix-ts2551-property-does-not-exist.js',
      '7019': 'fix-ts7019-implicit-any.js',
      '18048': 'fix-ts18048-possibly-undefined.js',
      '2300': 'fix-ts2300-duplicate-identifier.js'
    };
    
    return scripts[errorCode] || null;
  }

  generateRecommendations(report, sortedErrorTypes) {
    if (this.totalErrors === 0) {
      report.recommendations.push('🎉 No TypeScript errors found! The codebase is clean.');
      return;
    }

    report.recommendations.push('🔧 Run fixes in this priority order:');
    
    for (const [category, data] of sortedErrorTypes.slice(0, 5)) {
      if (data.count > 0) {
        const script = this.getFixScript(data.code);
        if (script) {
          report.recommendations.push(
            `${data.priority}. Fix ${category} (${data.count} errors) - npm run node scripts/${script}`
          );
        }
      }
    }

    // File-specific recommendations
    if (report.topFiles.length > 0) {
      report.recommendations.push('\n📁 Files with most errors:');
      for (const file of report.topFiles.slice(0, 3)) {
        report.recommendations.push(`   • ${file.file}: ${file.errorCount} errors`);
      }
    }

    // Overall strategy
    if (this.totalErrors > 100) {
      report.recommendations.push('\n⚡ Strategy: Start with syntax errors (TS1005, TS1003) before type errors');
    } else if (this.totalErrors > 20) {
      report.recommendations.push('\n⚡ Strategy: Focus on high-priority errors first');
    } else {
      report.recommendations.push('\n⚡ Strategy: These remaining errors can be fixed manually or with targeted scripts');
    }
  }

  async run() {
    this.log('🚀 Starting enhanced error analysis...');
    
    const output = await this.getTypeCheckOutput();
    this.analyzeErrorOutput(output);
    
    const report = this.generateReport();
    
    // Save detailed report
    const reportPath = join(this.projectRoot, 'enhanced-error-analysis.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Display summary
    this.log('\n' + '='.repeat(80));
    this.log('📊 ENHANCED TYPESCRIPT ERROR ANALYSIS');
    this.log('='.repeat(80));
    this.log(`📈 Total errors: ${this.totalErrors}`);
    this.log(`📁 Files affected: ${this.errorsByFile.size}`);
    this.log('');

    // Error type breakdown
    this.log('🔍 ERROR BREAKDOWN BY TYPE (Priority Order):');
    const sortedTypes = [...this.errorsByType.entries()]
      .sort((a, b) => {
        if (a[1].priority !== b[1].priority) {
          return a[1].priority - b[1].priority;
        }
        return b[1].count - a[1].count;
      });

    for (const [category, data] of sortedTypes.slice(0, 10)) {
      const script = this.getFixScript(data.code);
      const scriptInfo = script ? ` (${script})` : '';
      this.log(`  Priority ${data.priority}: ${category}: ${data.count} errors${scriptInfo}`);
    }

    this.log('');
    this.log('📋 RECOMMENDATIONS:');
    for (const rec of report.recommendations) {
      console.log(`  ${rec}`);
    }

    this.log('');
    this.log(`📁 Detailed report saved to: ${reportPath}`, 'success');
    
    return report;
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new EnhancedErrorAnalyzer();
  analyzer.run().catch(err => {
    console.error('EnhancedErrorAnalyzer failed:', err);
    process.exitCode = 1;
  });
}

export { EnhancedErrorAnalyzer };