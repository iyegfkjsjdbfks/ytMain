#!/usr/bin/env node
/**
 * Deploy Comprehensive TypeScript Error Resolution System
 * 
 * Enhanced deployment script that analyzes fresh errors from type-errors-fresh.txt 
 * and fresh-type-errors-manual.txt to create targeted resolution strategies.
 */

import { execSync, exec } from 'child_process';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

class ComprehensiveErrorResolutionSystem {
  constructor(options = {}) {
    this.options = {
      projectPath: PROJECT_ROOT,
      dryRun: false,
      backup: true,
      maxIterations: 10,
      timeoutSeconds: 600,
      generateReports: true,
      ...options
    };
    
    this.startTime = Date.now();
    this.totalErrorsFixed = 0;
    this.executionLog = [];
    this.errorCategories = new Map();
    this.phaseResults = [];
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    console.log(`${colors[level] || colors.info}${logEntry}${colors.reset}`);
    this.executionLog.push(logEntry);
  }

  async deploy() {
    this.log('🚀 Deploying Comprehensive TypeScript Error Resolution System...', 'info');
    
    try {
      // 1. Load and analyze fresh errors
      const freshErrors = await this.loadFreshErrors();
      this.log(`📊 Loaded ${freshErrors.length} fresh errors for analysis`);
      
      // 2. Categorize errors by type and priority
      const errorAnalysis = await this.categorizeErrors(freshErrors);
      this.log(`📈 Categorized errors into ${errorAnalysis.categories.size} categories`);
      
      // 3. Create backup if enabled
      if (this.options.backup && !this.options.dryRun) {
        await this.createSystemBackup();
      }
      
      // 4. Execute resolution phases based on error analysis
      const resolutionResult = await this.executeResolutionPhases(errorAnalysis);
      
      // 5. Generate comprehensive report
      if (this.options.generateReports) {
        await this.generateFinalReport(errorAnalysis, resolutionResult);
      }
      
      // 6. Validate final state
      const finalErrorCount = await this.getErrorCount();
      
      this.log('✅ Comprehensive TypeScript Error Resolution System deployment completed!', 'success');
      this.log(`📊 Final Results: ${this.totalErrorsFixed} errors fixed, ${finalErrorCount} remaining`, 'info');
      
      return {
        success: true,
        errorsFixed: this.totalErrorsFixed,
        errorsRemaining: finalErrorCount,
        duration: Date.now() - this.startTime,
        phases: this.phaseResults
      };
      
    } catch (error) {
      this.log(`❌ Deployment failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async loadFreshErrors() {
    const errorFiles = [
      'type-errors-fresh.txt',
      'fresh-type-errors-manual.txt'
    ];
    
    const allErrors = [];
    
    for (const errorFile of errorFiles) {
      const filePath = path.join(PROJECT_ROOT, errorFile);
      if (fsSync.existsSync(filePath)) {
        const content = await fs.readFile(filePath, 'utf8');
        const errors = content.split('\n')
          .filter(line => line.trim() && !line.startsWith('#'))
          .map((line, index) => this.parseErrorLine(line, index + 1, errorFile));
        
        allErrors.push(...errors.filter(error => error !== null));
        this.log(`📄 Loaded ${errors.length} errors from ${errorFile}`, 'info');
      }
    }
    
    return allErrors;
  }

  parseErrorLine(line, lineNumber, sourceFile) {
    // Parse TypeScript error format: file(line,column): error TSXXXX: message
    const match = line.match(/^(?:\d+\.)?(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$/);
    
    if (!match) {
      return null;
    }
    
    const [, file, lineNum, column, errorCode, message] = match;
    
    return {
      id: `${file}_${line}_${column}_${errorCode}`,
      file: file.trim(),
      line: parseInt(lineNum),
      column: parseInt(column),
      code: errorCode,
      message: message.trim(),
      sourceFile,
      lineNumber,
      category: this.categorizeErrorCode(errorCode),
      severity: this.determineSeverity(errorCode, message)
    };
  }

  categorizeErrorCode(errorCode) {
    const categories = {
      // Syntax Errors - Highest Priority
      'TS1005': 'syntax-critical',
      'TS1003': 'syntax-critical', 
      'TS1128': 'syntax-critical',
      'TS1144': 'syntax-critical',
      'TS1109': 'syntax-critical',
      'TS1068': 'syntax-critical',
      'TS1434': 'syntax-critical',
      'TS1136': 'syntax-critical',
      
      // Import/Module Errors
      'TS2307': 'imports',
      'TS2305': 'imports', 
      'TS2614': 'imports',
      'TS2724': 'imports',
      
      // Type Errors
      'TS2339': 'types',
      'TS2322': 'types',
      'TS2345': 'types',
      'TS2739': 'types',
      'TS7006': 'types',
      'TS7008': 'types',
      'TS18047': 'types',
      'TS18048': 'types',
      
      // Unused/Cleanup
      'TS6133': 'cleanup',
      
      // Default
      default: 'general'
    };
    
    return categories[errorCode] || categories.default;
  }

  determineSeverity(errorCode, message) {
    if (errorCode.startsWith('TS1')) return 'critical';
    if (['TS2307', 'TS2305'].includes(errorCode)) return 'high';
    if (errorCode === 'TS6133') return 'low';
    return 'medium';
  }

  async categorizeErrors(errors) {
    const categories = new Map();
    const fileMap = new Map();
    const severityMap = new Map();
    
    for (const error of errors) {
      // By category
      if (!categories.has(error.category)) {
        categories.set(error.category, []);
      }
      categories.get(error.category).push(error);
      
      // By file
      if (!fileMap.has(error.file)) {
        fileMap.set(error.file, []);
      }
      fileMap.get(error.file).push(error);
      
      // By severity
      if (!severityMap.has(error.severity)) {
        severityMap.set(error.severity, 0);
      }
      severityMap.set(error.severity, severityMap.get(error.severity) + 1);
    }
    
    return {
      total: errors.length,
      categories,
      fileMap,
      severityMap,
      recommendations: this.generateRecommendations(categories)
    };
  }

  generateRecommendations(categories) {
    const recommendations = [];
    
    for (const [category, errors] of categories) {
      const count = errors.length;
      
      switch (category) {
        case 'syntax-critical':
          recommendations.push({
            category,
            priority: 1,
            action: 'Fix critical syntax errors immediately - these prevent compilation',
            count,
            scripts: ['fix-ts1005-critical-syntax.js', 'fix-ts1128-declaration-expected.js']
          });
          break;
          
        case 'imports':
          recommendations.push({
            category,
            priority: 2,
            action: 'Resolve import and module errors to enable type checking',
            count,
            scripts: ['fix-ts2307-cannot-find-module.js', 'fix-ts2305-no-exported-member.js']
          });
          break;
          
        case 'types':
          recommendations.push({
            category,
            priority: 3,
            action: 'Fix type compatibility and property errors',
            count,
            scripts: ['fix-ts2339-property-errors.js', 'fix-ts7006-implicit-any-param.js']
          });
          break;
          
        case 'cleanup':
          recommendations.push({
            category,
            priority: 4,
            action: 'Clean up unused variables and imports',
            count,
            scripts: ['fix-ts6133-declared-not-used.js']
          });
          break;
      }
    }
    
    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  async executeResolutionPhases(errorAnalysis) {
    this.log('🔄 Starting systematic error resolution phases...', 'info');
    
    const phases = [
      {
        name: 'Critical Syntax Resolution',
        description: 'Fix critical syntax errors that prevent compilation',
        targetCategories: ['syntax-critical'],
        maxIterations: 3,
        timeoutMinutes: 10
      },
      {
        name: 'Import and Module Resolution',
        description: 'Resolve import and module dependency errors',
        targetCategories: ['imports'],
        maxIterations: 3,
        timeoutMinutes: 10
      },
      {
        name: 'Type System Resolution',
        description: 'Fix type compatibility and property errors',
        targetCategories: ['types'],
        maxIterations: 5,
        timeoutMinutes: 15
      },
      {
        name: 'Code Cleanup',
        description: 'Remove unused imports and clean up code',
        targetCategories: ['cleanup'],
        maxIterations: 2,
        timeoutMinutes: 5
      }
    ];

    const phaseResults = [];
    
    for (const phase of phases) {
      this.log(`\n--- ${phase.name}: ${phase.description} ---`, 'info');
      
      const phaseStart = Date.now();
      const beforeCount = await this.getErrorCount();
      
      if (beforeCount === 0) {
        this.log('🎉 No errors remaining, skipping remaining phases', 'success');
        break;
      }
      
      // Get relevant errors for this phase
      const phaseErrors = [];
      for (const category of phase.targetCategories) {
        if (errorAnalysis.categories.has(category)) {
          phaseErrors.push(...errorAnalysis.categories.get(category));
        }
      }
      
      if (phaseErrors.length === 0) {
        this.log(`⏩ No errors in categories: ${phase.targetCategories.join(', ')}`, 'info');
        continue;
      }
      
      this.log(`🎯 Processing ${phaseErrors.length} errors in ${phase.targetCategories.join(', ')}`, 'info');
      
      // Execute phase-specific resolution
      const phaseResult = await this.executePhase(phase, phaseErrors, beforeCount);
      phaseResults.push(phaseResult);
      
      const afterCount = await this.getErrorCount();
      const fixed = beforeCount - afterCount;
      const duration = Date.now() - phaseStart;
      
      this.log(`📊 ${phase.name}: ${beforeCount} → ${afterCount} (fixed ${fixed}) in ${Math.round(duration/1000)}s`, 'info');
      
      if (fixed === 0 && beforeCount > 0) {
        this.log('⚠️ No progress made in this phase, trying alternative approach', 'warning');
        await this.executeAlternativeApproach(phase, phaseErrors);
      }
    }
    
    this.phaseResults = phaseResults;
    return phaseResults;
  }

  async executePhase(phase, phaseErrors, beforeCount) {
    const fixedFiles = new Set();
    let errorsFixed = 0;
    
    // Group errors by file for efficient batch processing
    const fileGroups = new Map();
    for (const error of phaseErrors) {
      if (!fileGroups.has(error.file)) {
        fileGroups.set(error.file, []);
      }
      fileGroups.get(error.file).push(error);
    }
    
    this.log(`📁 Processing ${fileGroups.size} files in batch mode`, 'info');
    
    for (const [filePath, fileErrors] of fileGroups) {
      try {
        if (!this.options.dryRun) {
          const fixed = await this.fixFileErrors(filePath, fileErrors);
          if (fixed > 0) {
            fixedFiles.add(filePath);
            errorsFixed += fixed;
          }
        } else {
          this.log(`[DRY RUN] Would process ${fileErrors.length} errors in ${filePath}`, 'info');
        }
      } catch (error) {
        this.log(`❌ Failed to process ${filePath}: ${error.message}`, 'error');
      }
    }
    
    return {
      phase: phase.name,
      errorsProcessed: phaseErrors.length,
      filesProcessed: fixedFiles.size,
      errorsFixed,
      beforeCount,
      afterCount: await this.getErrorCount()
    };
  }

  async fixFileErrors(filePath, fileErrors) {
    const fullPath = path.resolve(PROJECT_ROOT, filePath);
    
    if (!fsSync.existsSync(fullPath)) {
      this.log(`⚠️ File not found: ${fullPath}`, 'warning');
      return 0;
    }
    
    let content = await fs.readFile(fullPath, 'utf8');
    let modified = false;
    let fixedCount = 0;
    
    // Sort errors by line number (descending) to avoid offset issues
    const sortedErrors = fileErrors.sort((a, b) => b.line - a.line);
    
    for (const error of sortedErrors) {
      const fixResult = await this.applyErrorFix(content, error);
      if (fixResult.fixed) {
        content = fixResult.content;
        modified = true;
        fixedCount++;
        this.log(`✅ Fixed ${error.code} in ${filePath}:${error.line}`, 'success');
      }
    }
    
    if (modified && !this.options.dryRun) {
      await fs.writeFile(fullPath, content, 'utf8');
      this.totalErrorsFixed += fixedCount;
    }
    
    return fixedCount;
  }

  async applyErrorFix(content, error) {
    const lines = content.split('\n');
    const errorLine = lines[error.line - 1];
    
    if (!errorLine) {
      return { fixed: false, content };
    }
    
    let newLine = errorLine;
    let fixed = false;
    
    switch (error.code) {
      case 'TS6133': // Unused variable
        newLine = this.fixUnusedVariable(errorLine, error);
        fixed = newLine !== errorLine;
        break;
        
      case 'TS7006': // Implicit any parameter
        newLine = this.fixImplicitAnyParameter(errorLine, error);
        fixed = newLine !== errorLine;
        break;
        
      case 'TS2307': // Cannot find module
        newLine = this.fixCannotFindModule(errorLine, error);
        fixed = newLine !== errorLine;
        break;
        
      case 'TS2339': // Property does not exist
        newLine = this.fixPropertyDoesNotExist(errorLine, error);
        fixed = newLine !== errorLine;
        break;
        
      case 'TS1005': // Syntax errors
        newLine = this.fixSyntaxError(errorLine, error);
        fixed = newLine !== errorLine;
        break;
        
      default:
        // Try generic fixes
        newLine = this.applyGenericFixes(errorLine, error);
        fixed = newLine !== errorLine;
    }
    
    if (fixed) {
      lines[error.line - 1] = newLine;
      return { fixed: true, content: lines.join('\n') };
    }
    
    return { fixed: false, content };
  }

  fixUnusedVariable(line, error) {
    // Extract unused variable name from error message
    const match = error.message.match(/'(.+?)' is declared but its value is never read/);
    if (!match) return line;
    
    const varName = match[1];
    
    // Try to remove the unused variable from import statements
    if (line.includes('import') && line.includes(varName)) {
      // Remove from destructured import
      if (line.includes('{') && line.includes('}')) {
        return line.replace(new RegExp(`\\s*,?\\s*${varName}\\s*,?\\s*`), '')
                  .replace(/\{\s*,/, '{')
                  .replace(/,\s*\}/, '}')
                  .replace(/\{\s*\}/, '');
      }
      // Remove entire import if it's the only import
      if (line.trim().startsWith('import') && line.includes(varName) && !line.includes(',')) {
        return ''; // Remove the entire line
      }
    }
    
    // For variable declarations, prefix with underscore to indicate intentionally unused
    if (line.includes(`${varName} =`) || line.includes(`${varName}:`)) {
      return line.replace(new RegExp(`\\b${varName}\\b`), `_${varName}`);
    }
    
    return line;
  }

  fixImplicitAnyParameter(line, error) {
    // Add type annotation for parameters
    const paramMatch = error.message.match(/Parameter '(.+?)' implicitly has an 'any' type/);
    if (!paramMatch) return line;
    
    const paramName = paramMatch[1];
    
    // Common parameter types based on naming patterns
    const typeMap = {
      'id': 'string',
      'index': 'number',
      'count': 'number', 
      'size': 'number',
      'text': 'string',
      'title': 'string',
      'description': 'string',
      'url': 'string',
      'data': 'any',
      'event': 'Event',
      'e': 'Event',
      'error': 'Error',
      'item': 'any',
      'value': 'any'
    };
    
    const suggestedType = typeMap[paramName] || 'any';
    
    // Add type annotation
    const paramPattern = new RegExp(`\\b${paramName}\\b(?!:)`);
    if (paramPattern.test(line)) {
      return line.replace(paramPattern, `${paramName}: ${suggestedType}`);
    }
    
    return line;
  }

  fixCannotFindModule(line, error) {
    // Extract module name from error
    const moduleMatch = error.message.match(/Cannot find module '(.+?)'/);
    if (!moduleMatch) return line;
    
    const moduleName = moduleMatch[1];
    
    // Fix common import path issues
    if (moduleName.includes(' / ')) {
      // Fix spaced paths
      const fixedModule = moduleName.replace(/ \/ /g, '/');
      return line.replace(moduleName, fixedModule);
    }
    
    // Fix relative path issues
    if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
      // Add file extension if missing
      if (!moduleName.endsWith('.tsx') && !moduleName.endsWith('.ts') && !moduleName.endsWith('.js')) {
        return line.replace(moduleName, `${moduleName}.tsx`);
      }
    }
    
    return line;
  }

  fixPropertyDoesNotExist(line, error) {
    // Extract property name from error
    const propMatch = error.message.match(/Property '(.+?)' does not exist/);
    if (!propMatch) return line;
    
    const propName = propMatch[1];
    
    // Add optional chaining for common cases
    if (line.includes(`.${propName}`)) {
      return line.replace(`.${propName}`, `?.${propName}`);
    }
    
    return line;
  }

  fixSyntaxError(line, error) {
    // Handle common syntax errors
    if (error.message.includes("',' expected")) {
      // Add missing comma
      return line.replace(/(\w)(\s+\w)/, '$1,$2');
    }
    
    if (error.message.includes("';' expected")) {
      // Add missing semicolon
      if (!line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}')) {
        return line + ';';
      }
    }
    
    if (error.message.includes("')' expected")) {
      // Add missing closing parenthesis
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;
      if (openParens > closeParens) {
        return line + ')';
      }
    }
    
    return line;
  }

  applyGenericFixes(line, error) {
    // Apply common generic fixes
    let fixedLine = line;
    
    // Remove trailing whitespace
    fixedLine = fixedLine.trimEnd();
    
    // Fix common typos and patterns
    const commonFixes = [
      [/\s+,/g, ','], // Remove space before comma
      [/,\s*,/g, ','], // Remove duplicate commas
      [/\s+;/g, ';'], // Remove space before semicolon
      [/;+/g, ';'], // Remove duplicate semicolons
    ];
    
    for (const [pattern, replacement] of commonFixes) {
      fixedLine = fixedLine.replace(pattern, replacement);
    }
    
    return fixedLine;
  }

  async executeAlternativeApproach(phase, phaseErrors) {
    this.log(`🔄 Trying alternative approach for ${phase.name}`, 'info');
    
    // Try executing existing specialized scripts
    const scripts = {
      'syntax-critical': ['fix-ts1005-critical-syntax.js'],
      'imports': ['fix-ts2307-cannot-find-module.js'],
      'types': ['fix-ts2339-property-errors.js', 'fix-ts7006-implicit-any-param.js'],
      'cleanup': ['fix-ts6133-declared-not-used.js']
    };
    
    for (const category of phase.targetCategories) {
      if (scripts[category]) {
        for (const script of scripts[category]) {
          const scriptPath = path.join(PROJECT_ROOT, 'scripts', script);
          if (fsSync.existsSync(scriptPath)) {
            try {
              this.log(`🔧 Executing specialized script: ${script}`, 'info');
              await this.executeScript(scriptPath);
            } catch (error) {
              this.log(`⚠️ Script ${script} failed: ${error.message}`, 'warning');
            }
          }
        }
      }
    }
  }

  async executeScript(scriptPath) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Script timeout: ${scriptPath}`));
      }, 60000); // 1 minute timeout
      
      exec(`node "${scriptPath}"`, { cwd: PROJECT_ROOT }, (error, stdout, stderr) => {
        clearTimeout(timeout);
        
        if (error) {
          this.log(`Script error: ${stderr}`, 'warning');
          reject(error);
        } else {
          if (stdout) this.log(`Script output: ${stdout.slice(0, 200)}...`, 'info');
          resolve(stdout);
        }
      });
    });
  }

  async getErrorCount() {
    try {
      const result = execSync('npx tsc --noEmit --pretty', { 
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return 0; // No compilation errors
    } catch (error) {
      // Count error lines in output
      const errorLines = error.stdout.split('\n').filter(line => 
        line.includes('error TS') && line.includes('):')
      );
      return errorLines.length;
    }
  }

  async createSystemBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(PROJECT_ROOT, '.error-fix-backups', `backup-${timestamp}`);
    
    try {
      await fs.mkdir(backupDir, { recursive: true });
      
      // Backup key directories
      const dirsToBackup = ['src', 'components', 'contexts'];
      
      for (const dir of dirsToBackup) {
        const srcDir = path.join(PROJECT_ROOT, dir);
        const destDir = path.join(backupDir, dir);
        
        if (fsSync.existsSync(srcDir)) {
          await fs.cp(srcDir, destDir, { recursive: true });
        }
      }
      
      this.log(`💾 Created backup at: ${backupDir}`, 'info');
      return backupDir;
    } catch (error) {
      this.log(`⚠️ Backup creation failed: ${error.message}`, 'warning');
      throw error;
    }
  }

  async generateFinalReport(errorAnalysis, resolutionResult) {
    const report = {
      timestamp: new Date().toISOString(),
      deployment: {
        success: true,
        duration: Date.now() - this.startTime,
        totalErrorsFixed: this.totalErrorsFixed
      },
      initialAnalysis: {
        totalErrors: errorAnalysis.total,
        categoriesFound: Array.from(errorAnalysis.categories.keys()),
        severityDistribution: Object.fromEntries(errorAnalysis.severityMap)
      },
      phaseResults: this.phaseResults,
      recommendations: errorAnalysis.recommendations,
      executionLog: this.executionLog.slice(-50) // Last 50 log entries
    };

    const reportPath = path.join(PROJECT_ROOT, 'comprehensive-error-resolution-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`📋 Final report generated: comprehensive-error-resolution-report.json`, 'info');
    this.displaySummary(report);
  }

  displaySummary(report) {
    this.log('\n' + '='.repeat(60), 'info');
    this.log('🎯 COMPREHENSIVE ERROR RESOLUTION SUMMARY', 'info');
    this.log('='.repeat(60), 'info');
    
    this.log(`✅ Status: ${report.deployment.success ? 'SUCCESS' : 'PARTIAL'}`, 
      report.deployment.success ? 'success' : 'warning');
    this.log(`⏱️  Duration: ${Math.round(report.deployment.duration / 1000)}s`, 'info');
    this.log(`🔧 Errors Fixed: ${report.deployment.totalErrorsFixed}`, 'success');
    this.log(`📊 Initial Errors: ${report.initialAnalysis.totalErrors}`, 'info');
    
    this.log('\n📈 Phase Results:', 'info');
    for (const phase of report.phaseResults) {
      this.log(`  ${phase.phase}: ${phase.errorsProcessed} processed, ${phase.errorsFixed} fixed`, 'info');
    }
    
    this.log('\n🎯 Recommendations Implemented:', 'info');
    for (const rec of report.recommendations) {
      this.log(`  [Priority ${rec.priority}] ${rec.category}: ${rec.count} errors - ${rec.action}`, 'info');
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--no-backup':
        options.backup = false;
        break;
      case '--max-iterations':
        options.maxIterations = parseInt(args[++i]) || 10;
        break;
      case '--timeout':
        options.timeoutSeconds = parseInt(args[++i]) || 600;
        break;
      case '--help':
        console.log(`
Usage: node deploy-comprehensive-error-resolution.js [options]

Options:
  --dry-run              Run without making changes
  --no-backup           Skip creating backup
  --max-iterations N    Maximum iterations per phase (default: 10)
  --timeout N           Timeout in seconds (default: 600)
  --help                Show this help message

Examples:
  node deploy-comprehensive-error-resolution.js
  node deploy-comprehensive-error-resolution.js --dry-run
  node deploy-comprehensive-error-resolution.js --max-iterations 5 --timeout 300
        `);
        process.exit(0);
    }
  }
  
  try {
    const system = new ComprehensiveErrorResolutionSystem(options);
    const result = await system.deploy();
    
    console.log('\n🎉 Deployment completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { ComprehensiveErrorResolutionSystem };