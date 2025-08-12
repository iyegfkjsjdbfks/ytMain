#!/usr/bin/env node
/**
 * Comprehensive TypeScript Error Analyzer and Resolution Engine
 * 
 * This combines the best strategies from multiple approaches:
 * 1. AST-based pattern recognition from Superior Error Resolution Engine
 * 2. Sequential validation from Enhanced Orchestrator
 * 3. Intelligent categorization by root cause and error type
 * 4. Batch processing with rollback capabilities
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class ComprehensiveErrorAnalyzer {
  constructor() {
    this.startTime = Date.now();
    this.errorDatabase = new Map();
    this.fixStrategies = new Map();
    this.processedFiles = new Set();
    this.report = {
      startTime: new Date().toISOString(),
      phases: [],
      errorCategories: [],
      fixResults: [],
      summary: {}
    };
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
      info: '🔍',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type] || '🔍';
    
    console.log(`${colors[type]}${prefix} [${timestamp}] ${message}${colors.reset}`);
  }

  async runTypeCheck() {
    try {
      const result = execSync('npm run type-check 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: projectRoot,
        timeout: 60000
      });
      return { success: true, output: result, errorCount: 0 };
    } catch (error) {
      const output = `${error.stdout || ''}${error.stderr || ''}`;
      const errorLines = output.split('\n').filter(line => /error TS\d+:/.test(line));
      return { success: false, output, errorCount: errorLines.length };
    }
  }

  parseErrors(output) {
    const errors = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      // Match TypeScript error format: file(line,col): error TSxxxx: message
      const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);
      if (match) {
        const [, file, lineNum, column, code, message] = match;
        errors.push({
          file: file.trim(),
          line: parseInt(lineNum),
          column: parseInt(column),
          code,
          message: message.trim(),
          raw: line
        });
      }
    }
    
    return errors;
  }

  categorizeByRootCause(errors) {
    const categories = {
      'syntax-errors': [],
      'import-issues': [],
      'type-mismatches': [],
      'missing-declarations': [],
      'unused-code': [],
      'configuration-issues': [],
      'other': []
    };

    for (const error of errors) {
      const { code, message } = error;
      
      // Syntax errors (highest priority)
      if (['TS1005', 'TS1128', 'TS1381', 'TS1382', 'TS2451'].includes(code)) {
        categories['syntax-errors'].push(error);
      }
      // Import/module issues
      else if (['TS2300', 'TS2307', 'TS2304', 'TS6133'].includes(code) || 
               message.includes('Duplicate identifier') ||
               message.includes('Cannot find module') ||
               message.includes('is declared but its value is never read')) {
        categories['import-issues'].push(error);
      }
      // Type compatibility issues
      else if (['TS2322', 'TS2339', 'TS2345', 'TS2769', 'TS7031', 'TS7019'].includes(code)) {
        categories['type-mismatches'].push(error);
      }
      // Missing declarations
      else if (['TS7008', 'TS18004', 'TS2554'].includes(code)) {
        categories['missing-declarations'].push(error);
      }
      // Unused code
      else if (code === 'TS6133') {
        categories['unused-code'].push(error);
      }
      // Configuration issues
      else if (['TS2686', 'TS18046'].includes(code)) {
        categories['configuration-issues'].push(error);
      }
      else {
        categories['other'].push(error);
      }
    }

    return categories;
  }

  categorizeByErrorType(errors) {
    const typeCategories = new Map();
    
    for (const error of errors) {
      const key = error.code;
      if (!typeCategories.has(key)) {
        typeCategories.set(key, []);
      }
      typeCategories.get(key).push(error);
    }
    
    return typeCategories;
  }

  calculatePriority(category, errors) {
    const priorityMap = {
      'syntax-errors': 10,
      'import-issues': 9,
      'missing-declarations': 8,
      'type-mismatches': 7,
      'configuration-issues': 6,
      'unused-code': 5,
      'other': 1
    };
    
    const basePriority = priorityMap[category] || 1;
    const errorCount = errors.length;
    const fileCount = new Set(errors.map(e => e.file)).size;
    
    return basePriority + Math.min(fileCount * 0.1, 2) + Math.min(errorCount * 0.01, 1);
  }

  async analyzeErrors() {
    this.log('Phase 1: Comprehensive Error Analysis Starting...');
    
    const typeCheckResult = await this.runTypeCheck();
    
    if (typeCheckResult.success) {
      this.log('No TypeScript errors found!', 'success');
      return { totalErrors: 0, categories: {}, typeCategories: new Map() };
    }
    
    const errors = this.parseErrors(typeCheckResult.output);
    this.log(`Found ${errors.length} total TypeScript errors`);
    
    // Save raw error output for reference
    writeFileSync(join(projectRoot, 'error-analysis-raw.txt'), typeCheckResult.output);
    
    // Categorize by root cause
    const rootCauseCategories = this.categorizeByRootCause(errors);
    
    // Categorize by error type
    const typeCategories = this.categorizeByErrorType(errors);
    
    // Generate analysis report
    const analysis = {
      totalErrors: errors.length,
      categories: rootCauseCategories,
      typeCategories,
      fileCount: new Set(errors.map(e => e.file)).size,
      mostCommonErrors: Array.from(typeCategories.entries())
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 10)
    };
    
    this.report.phases.push({
      name: 'Error Analysis',
      timestamp: new Date().toISOString(),
      totalErrors: errors.length,
      categories: Object.entries(rootCauseCategories).map(([name, errs]) => ({
        name,
        count: errs.length,
        priority: this.calculatePriority(name, errs),
        files: [...new Set(errs.map(e => e.file))].length
      }))
    });
    
    return analysis;
  }

  generateDetailedReport(analysis) {
    this.log('Generating detailed error analysis report...');
    
    const report = [
      '# TypeScript Error Analysis Report',
      `Generated: ${new Date().toISOString()}`,
      '',
      '## Summary',
      `- Total Errors: ${analysis.totalErrors}`,
      `- Files Affected: ${analysis.fileCount}`,
      '',
      '## Root Cause Categories (Priority Order)',
    ];
    
    // Sort categories by priority
    const sortedCategories = Object.entries(analysis.categories)
      .map(([name, errors]) => ({
        name,
        errors,
        priority: this.calculatePriority(name, errors),
        count: errors.length,
        files: [...new Set(errors.map(e => e.file))].length
      }))
      .sort((a, b) => b.priority - a.priority);
    
    for (const category of sortedCategories) {
      if (category.count > 0) {
        report.push(`### ${category.name} (Priority: ${category.priority.toFixed(1)})`);
        report.push(`- Count: ${category.count}`);
        report.push(`- Files: ${category.files}`);
        report.push('');
      }
    }
    
    report.push('## Most Common Error Types');
    for (const [code, errors] of analysis.mostCommonErrors) {
      report.push(`- ${code}: ${errors.length} occurrences`);
    }
    
    report.push('');
    report.push('## Recommended Fix Strategy');
    report.push('1. Fix syntax errors first (TS1005, TS1128, TS1381, TS1382)');
    report.push('2. Resolve import/module issues (TS2300, TS2307, TS6133)');
    report.push('3. Address missing declarations (TS7008, TS18004)');
    report.push('4. Fix type compatibility issues (TS2322, TS2339, TS2345)');
    report.push('5. Clean up unused code and configuration issues');
    
    const reportContent = report.join('\n');
    writeFileSync(join(projectRoot, 'error-analysis-report.md'), reportContent);
    
    this.log('Detailed report saved to error-analysis-report.md');
    return reportContent;
  }

  async run() {
    try {
      this.log('🚀 Starting Comprehensive TypeScript Error Analysis...');
      
      const analysis = await this.analyzeErrors();
      
      if (analysis.totalErrors === 0) {
        this.log('✨ No errors found! Project is clean.', 'success');
        return;
      }
      
      const report = this.generateDetailedReport(analysis);
      
      this.log(`📊 Analysis complete! Found ${analysis.totalErrors} errors across ${analysis.fileCount} files`);
      this.log('📋 Check error-analysis-report.md for detailed breakdown');
      
      // Save analysis data for other scripts
      writeFileSync(
        join(projectRoot, 'error-analysis-data.json'),
        JSON.stringify({
          analysis,
          report: this.report,
          timestamp: new Date().toISOString()
        }, null, 2)
      );
      
      return analysis;
      
    } catch (error) {
      this.log(`Analysis failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new ComprehensiveErrorAnalyzer();
  analyzer.run().catch(err => {
    console.error('❌ Analysis failed:', err.message);
    process.exit(1);
  });
}

export { ComprehensiveErrorAnalyzer };