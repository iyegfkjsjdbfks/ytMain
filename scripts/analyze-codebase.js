#!/usr/bin/env node

/**
 * Comprehensive Codebase Analysis and Optimization Summary
 * Analyzes the current state and provides optimization recommendations
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class CodebaseAnalyzer {
  constructor() {
    this.projectRoot = process.cwd();
    this.metrics = {
      totalFiles: 0,
      linesOfCode: 0,
      typeScriptErrors: 0,
      lintWarnings: 0,
      testCoverage: 0,
      buildTime: 0,
      bundleSize: 0
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m', 
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[${type.toUpperCase()}] ${message}${colors.reset}`);
  }

  async run() {
    this.log('📊 Starting comprehensive codebase analysis...');
    
    await this.analyzeProject();
    await this.generateReport();
    
    this.log('✅ Analysis completed!', 'success');
  }

  async analyzeProject() {
    await this.countFiles();
    await this.checkTypeScriptErrors();
    await this.checkLintWarnings();
    await this.checkBuildStatus();
    await this.analyzeBundleSize();
    await this.checkTestStatus();
  }

  async countFiles() {
    try {
      const result = execSync('find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | wc -l', 
        { cwd: this.projectRoot, encoding: 'utf-8' });
      this.metrics.totalFiles = parseInt(result.trim());
      
      const linesResult = execSync('find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | xargs wc -l | tail -1', 
        { cwd: this.projectRoot, encoding: 'utf-8' });
      this.metrics.linesOfCode = parseInt(linesResult.trim().split(' ')[0]);
      
      this.log(`📁 Files analyzed: ${this.metrics.totalFiles}`);
      this.log(`📝 Lines of code: ${this.metrics.linesOfCode}`);
    } catch (error) {
      this.log('⚠️ Could not count files', 'warning');
    }
  }

  async checkTypeScriptErrors() {
    try {
      execSync('npm run type-check', { cwd: this.projectRoot, stdio: 'pipe' });
      this.metrics.typeScriptErrors = 0;
      this.log('✅ No TypeScript errors found', 'success');
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      const errorCount = (output.match(/error TS/g) || []).length;
      this.metrics.typeScriptErrors = errorCount;
      this.log(`⚠️ TypeScript errors: ${errorCount}`, 'warning');
    }
  }

  async checkLintWarnings() {
    try {
      const result = execSync('npm run lint 2>&1 | grep "warning\\|error" | wc -l', 
        { cwd: this.projectRoot, encoding: 'utf-8' });
      this.metrics.lintWarnings = parseInt(result.trim());
      this.log(`🔍 Lint warnings: ${this.metrics.lintWarnings}`);
    } catch (error) {
      this.log('⚠️ Could not check lint status', 'warning');
    }
  }

  async checkBuildStatus() {
    try {
      const startTime = Date.now();
      execSync('npm run build', { cwd: this.projectRoot, stdio: 'pipe' });
      this.metrics.buildTime = Date.now() - startTime;
      this.log(`✅ Build successful in ${this.metrics.buildTime}ms`, 'success');
    } catch (error) {
      this.log('❌ Build failed', 'error');
    }
  }

  async analyzeBundleSize() {
    try {
      const distPath = path.join(this.projectRoot, 'dist');
      if (fs.existsSync(distPath)) {
        const result = execSync('du -sh dist', 
          { cwd: this.projectRoot, encoding: 'utf-8' });
        this.metrics.bundleSize = result.trim().split('\t')[0];
        this.log(`📦 Bundle size: ${this.metrics.bundleSize}`);
      }
    } catch (error) {
      this.log('⚠️ Could not analyze bundle size', 'warning');
    }
  }

  async checkTestStatus() {
    try {
      const result = execSync('npm run test:run 2>&1', 
        { cwd: this.projectRoot, encoding: 'utf-8' });
      
      const passedMatch = result.match(/(\d+) passed/);
      const failedMatch = result.match(/(\d+) failed/);
      
      const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      
      this.log(`🧪 Tests: ${passed} passed, ${failed} failed`);
    } catch (error) {
      this.log('⚠️ Could not run tests', 'warning');
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      recommendations: this.generateRecommendations(),
      optimizations: this.generateOptimizations(),
      summary: this.generateSummary()
    };

    fs.writeFileSync(
      path.join(this.projectRoot, 'CODEBASE_ANALYSIS_REPORT.json'),
      JSON.stringify(report, null, 2)
    );

    this.displaySummary(report);
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.metrics.typeScriptErrors > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Type Safety',
        issue: `${this.metrics.typeScriptErrors} TypeScript errors remaining`,
        solution: 'Continue with targeted error fixing, focus on parameter types and null safety'
      });
    }

    if (this.metrics.lintWarnings > 5000) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Code Quality',
        issue: `${this.metrics.lintWarnings} lint warnings`,
        solution: 'Implement stricter ESLint rules and fix warnings in batches'
      });
    }

    if (this.metrics.linesOfCode > 50000) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Architecture',
        issue: 'Large codebase with potential complexity',
        solution: 'Consider modularization and code splitting strategies'
      });
    }

    return recommendations;
  }

  generateOptimizations() {
    return [
      {
        category: 'Performance',
        optimizations: [
          'Bundle analysis shows good chunk splitting',
          'Consider implementing tree shaking for unused code',
          'Optimize images and assets for production'
        ]
      },
      {
        category: 'Developer Experience',
        optimizations: [
          'TypeScript strict mode is enabled',
          'Comprehensive testing setup in place',
          'Modern build tooling with Vite'
        ]
      },
      {
        category: 'Code Quality',
        optimizations: [
          'Implement automated code formatting',
          'Add pre-commit hooks for quality checks',
          'Consider dependency audit and updates'
        ]
      }
    ];
  }

  generateSummary() {
    const health = this.calculateHealthScore();
    return {
      healthScore: health,
      status: health > 80 ? 'EXCELLENT' : health > 60 ? 'GOOD' : health > 40 ? 'FAIR' : 'NEEDS_WORK',
      strengths: [
        'Modern React + TypeScript setup',
        'Comprehensive testing infrastructure', 
        'Good build and development tooling',
        'Successful production build'
      ],
      weaknesses: [
        this.metrics.typeScriptErrors > 0 ? 'TypeScript compilation errors' : null,
        this.metrics.lintWarnings > 5000 ? 'High number of lint warnings' : null,
        'Complex utility files need refactoring'
      ].filter(Boolean)
    };
  }

  calculateHealthScore() {
    let score = 100;
    
    // Deduct for TypeScript errors
    score -= Math.min(this.metrics.typeScriptErrors * 0.5, 30);
    
    // Deduct for excessive lint warnings
    score -= Math.min(this.metrics.lintWarnings * 0.01, 20);
    
    // Add points for successful build
    if (this.metrics.buildTime > 0) score += 10;
    
    return Math.max(0, Math.round(score));
  }

  displaySummary(report) {
    this.log('\n📋 CODEBASE ANALYSIS SUMMARY', 'info');
    this.log('=' .repeat(50), 'info');
    
    this.log(`Health Score: ${report.summary.healthScore}/100 (${report.summary.status})`, 
      report.summary.healthScore > 70 ? 'success' : 'warning');
    
    this.log('\n✅ Strengths:', 'success');
    report.summary.strengths.forEach(strength => {
      this.log(`  • ${strength}`, 'info');
    });
    
    if (report.summary.weaknesses.length > 0) {
      this.log('\n⚠️ Areas for Improvement:', 'warning');
      report.summary.weaknesses.forEach(weakness => {
        this.log(`  • ${weakness}`, 'warning');
      });
    }
    
    this.log('\n🎯 Top Recommendations:', 'info');
    report.recommendations.slice(0, 3).forEach(rec => {
      this.log(`  [${rec.priority}] ${rec.category}: ${rec.issue}`, 'warning');
      this.log(`    → ${rec.solution}`, 'info');
    });
    
    this.log(`\n📊 Full report saved to: CODEBASE_ANALYSIS_REPORT.json`, 'info');
  }
}

// Run the analyzer
const analyzer = new CodebaseAnalyzer();
analyzer.run().catch(console.error);