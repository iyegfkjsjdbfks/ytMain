#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Enhanced TypeScript Error Analyzer v3
 * Categorizes errors by type, root cause, and priority for systematic fixing
 */
class EnhancedErrorAnalyzer {
  constructor() {
    this.errors = [];
    this.errorCategories = {
      syntax: {
        name: 'Syntax Errors',
        priority: 2,
        patterns: ['TS1005', 'TS1109', 'TS1144', 'TS1068', 'TS1002', 'TS1110', 'TS1160'],
        rootCauses: ['missing_semicolon', 'unexpected_token', 'malformed_syntax', 'unterminated_string']
      },
      formatting: {
        name: 'Formatting & Linting',
        priority: 1,
        patterns: ['TS6133', 'TS7006', 'TS2304', 'TS2339'],
        rootCauses: ['unused_variables', 'implicit_any', 'missing_imports', 'property_access']
      },
      logical: {
        name: 'Logical/Structural',
        priority: 3,
        patterns: ['TS2322', 'TS2300', 'TS18048', 'TS7019'],
        rootCauses: ['type_mismatch', 'duplicate_identifier', 'null_undefined', 'module_resolution']
      }
    };
    this.analysisReport = {
      timestamp: new Date().toISOString(),
      totalErrors: 0,
      errorsByCategory: {},
      errorsByRootCause: {},
      errorsByFile: {},
      priorityQueue: [],
      fixingStrategy: []
    };
  }

  /**
   * Run TypeScript compiler and capture all errors
   */
  captureErrors() {
    console.log('🔍 Capturing TypeScript errors...');
    try {
      execSync('npm run type-check', { stdio: 'pipe' });
    } catch (error) {
      const output = error.stdout ? error.stdout.toString() : '';
      const stderr = error.stderr ? error.stderr.toString() : '';
      const fullOutput = output + stderr;
      
      this.parseErrors(fullOutput);
    }
  }

  /**
   * Parse error output and extract structured error information
   */
  parseErrors(output) {
    const lines = output.split('\n');
    const errorPattern = /^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$/;
    
    for (const line of lines) {
      const match = line.match(errorPattern);
      if (match) {
        const [, file, lineNum, colNum, errorCode, message] = match;
        
        this.errors.push({
          file: file.trim(),
          line: parseInt(lineNum),
          column: parseInt(colNum),
          code: errorCode,
          message: message.trim(),
          category: this.categorizeError(errorCode),
          rootCause: this.identifyRootCause(errorCode, message)
        });
      }
    }
    
    this.analysisReport.totalErrors = this.errors.length;
    console.log(`📊 Found ${this.errors.length} TypeScript errors`);
  }

  /**
   * Categorize error by its TypeScript error code
   */
  categorizeError(errorCode) {
    for (const [category, config] of Object.entries(this.errorCategories)) {
      if (config.patterns.some(pattern => errorCode.includes(pattern))) {
        return category;
      }
    }
    return 'other';
  }

  /**
   * Identify root cause based on error code and message
   */
  identifyRootCause(errorCode, message) {
    const rootCauseMap = {
      'TS1005': message.includes("';' expected") ? 'missing_semicolon' : 'unexpected_token',
      'TS1109': 'missing_expression',
      'TS1144': 'missing_curly_or_semicolon',
      'TS1068': 'unexpected_token',
      'TS1002': 'unterminated_string',
      'TS1110': 'type_expected',
      'TS1160': 'template_literal_issue',
      'TS6133': 'unused_variables',
      'TS7006': 'implicit_any',
      'TS2304': 'missing_imports',
      'TS2339': 'property_access',
      'TS2322': 'type_mismatch',
      'TS2300': 'duplicate_identifier',
      'TS18048': 'null_undefined',
      'TS7019': 'module_resolution'
    };
    
    return rootCauseMap[errorCode] || 'unknown';
  }

  /**
   * Analyze errors and generate comprehensive report
   */
  analyzeErrors() {
    console.log('📈 Analyzing error patterns...');
    
    // Group by category
    for (const error of this.errors) {
      const category = error.category;
      if (!this.analysisReport.errorsByCategory[category]) {
        this.analysisReport.errorsByCategory[category] = {
          count: 0,
          errors: [],
          priority: this.errorCategories[category]?.priority || 4
        };
      }
      this.analysisReport.errorsByCategory[category].count++;
      this.analysisReport.errorsByCategory[category].errors.push(error);
    }

    // Group by root cause
    for (const error of this.errors) {
      const rootCause = error.rootCause;
      if (!this.analysisReport.errorsByRootCause[rootCause]) {
        this.analysisReport.errorsByRootCause[rootCause] = {
          count: 0,
          errors: [],
          category: error.category
        };
      }
      this.analysisReport.errorsByRootCause[rootCause].count++;
      this.analysisReport.errorsByRootCause[rootCause].errors.push(error);
    }

    // Group by file
    for (const error of this.errors) {
      const file = error.file;
      if (!this.analysisReport.errorsByFile[file]) {
        this.analysisReport.errorsByFile[file] = {
          count: 0,
          errors: []
        };
      }
      this.analysisReport.errorsByFile[file].count++;
      this.analysisReport.errorsByFile[file].errors.push(error);
    }

    // Create priority queue
    this.createPriorityQueue();
    
    // Generate fixing strategy
    this.generateFixingStrategy();
  }

  /**
   * Create priority queue for systematic error fixing
   */
  createPriorityQueue() {
    const categories = Object.entries(this.analysisReport.errorsByCategory)
      .sort(([,a], [,b]) => a.priority - b.priority);
    
    for (const [category, data] of categories) {
      this.analysisReport.priorityQueue.push({
        category,
        count: data.count,
        priority: data.priority,
        name: this.errorCategories[category]?.name || category
      });
    }
  }

  /**
   * Generate comprehensive fixing strategy
   */
  generateFixingStrategy() {
    const strategy = [];
    
    // Phase 1: Formatting and linting (Priority 1)
    if (this.analysisReport.errorsByCategory.formatting) {
      strategy.push({
        phase: 1,
        name: 'Formatting & Linting Fixes',
        errorCount: this.analysisReport.errorsByCategory.formatting.count,
        scripts: ['fix:ts6133-enhanced', 'fix:ts7006-enhanced', 'fix:ts2304', 'fix:ts2339-enhanced'],
        description: 'Fix unused variables, implicit any, missing imports, property access issues'
      });
    }

    // Phase 2: Syntax errors (Priority 2)
    if (this.analysisReport.errorsByCategory.syntax) {
      strategy.push({
        phase: 2,
        name: 'Syntax Error Fixes',
        errorCount: this.analysisReport.errorsByCategory.syntax.count,
        scripts: ['fix:ts1005-final', 'fix:ts1109', 'fix:ts1144-critical', 'fix:ts1068', 'fix:comprehensive-syntax'],
        description: 'Fix syntax errors, missing tokens, malformed expressions'
      });
    }

    // Phase 3: Logical/structural (Priority 3)
    if (this.analysisReport.errorsByCategory.logical) {
      strategy.push({
        phase: 3,
        name: 'Logical & Structural Fixes',
        errorCount: this.analysisReport.errorsByCategory.logical.count,
        scripts: ['fix:ts2322', 'fix:ts2300', 'fix:ts18048', 'fix:ts7019'],
        description: 'Fix type mismatches, duplicate identifiers, null/undefined issues'
      });
    }

    this.analysisReport.fixingStrategy = strategy;
  }

  /**
   * Generate detailed report
   */
  generateReport() {
    console.log('📋 Generating comprehensive analysis report...');
    
    const reportPath = path.join(process.cwd(), 'error-analysis-comprehensive.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.analysisReport, null, 2));
    
    // Generate human-readable summary
    this.generateSummary();
    
    console.log(`✅ Analysis complete! Report saved to: ${reportPath}`);
    return this.analysisReport;
  }

  /**
   * Generate human-readable summary
   */
  generateSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TYPESCRIPT ERROR ANALYSIS SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Errors: ${this.analysisReport.totalErrors}`);
    console.log(`Analysis Time: ${this.analysisReport.timestamp}`);
    
    console.log('\n🎯 ERROR CATEGORIES (by priority):');
    for (const item of this.analysisReport.priorityQueue) {
      console.log(`  ${item.priority}. ${item.name}: ${item.count} errors`);
    }
    
    console.log('\n🔧 FIXING STRATEGY:');
    for (const phase of this.analysisReport.fixingStrategy) {
      console.log(`  Phase ${phase.phase}: ${phase.name} (${phase.errorCount} errors)`);
      console.log(`    Scripts: ${phase.scripts.join(', ')}`);
      console.log(`    ${phase.description}`);
    }
    
    console.log('\n📁 TOP ERROR FILES:');
    const topFiles = Object.entries(this.analysisReport.errorsByFile)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 10);
    
    for (const [file, data] of topFiles) {
      console.log(`  ${file}: ${data.count} errors`);
    }
    
    console.log('\n🎯 ROOT CAUSES:');
    const topCauses = Object.entries(this.analysisReport.errorsByRootCause)
      .sort(([,a], [,b]) => b.count - a.count);
    
    for (const [cause, data] of topCauses) {
      console.log(`  ${cause}: ${data.count} errors (${data.category} category)`);
    }
    
    console.log('='.repeat(60));
  }

  /**
   * Main execution method
   */
  async run() {
    console.log('🚀 Starting Enhanced TypeScript Error Analysis v3...');
    
    this.captureErrors();
    this.analyzeErrors();
    const report = this.generateReport();
    
    console.log('\n✨ Analysis complete! Use the generated strategy to fix errors systematically.');
    return report;
  }
}

// Execute if run directly
if (require.main === module) {
  const analyzer = new EnhancedErrorAnalyzer();
  analyzer.run().catch(console.error);
}

module.exports = EnhancedErrorAnalyzer;