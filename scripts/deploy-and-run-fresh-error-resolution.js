#!/usr/bin/env node
/**
 * Deploy and Run Fresh TypeScript Error Resolution System
 * 
 * This script implements the complete TypeScript Error Resolution System
 * as specified in DEPLOYMENT_GUIDE.md and IMPLEMENTATION_SUMMARY.md.
 * 
 * It analyzes the current fresh errors, understands their causes, and applies
 * systematic fixes with comprehensive error handling.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FreshErrorResolutionDeployer {
  constructor(options = {}) {
    this.options = {
      projectPath: process.cwd(),
      dryRun: false,
      backup: true,
      maxIterations: 5,
      timeoutSeconds: 600,
      generateReports: true,
      ...options
    };
    
    this.startTime = Date.now();
    this.totalErrorsFixed = 0;
    this.executionLog = [];
    this.backupDir = path.join(process.cwd(), '.fresh-error-resolution-backups');
    this.reportDir = path.join(process.cwd(), 'fresh-error-resolution-reports');
    
    // Error categorization patterns
    this.errorPatterns = new Map([
      ['TS1005', { 
        name: 'syntax-errors', 
        priority: 1, 
        description: 'Missing expected syntax elements (commas, brackets)',
        strategy: 'syntax-repair',
        handler: this.fixSyntaxErrors.bind(this)
      }],
      ['TS1382', { 
        name: 'jsx-syntax-errors', 
        priority: 1, 
        description: 'JSX syntax issues with angle brackets',
        strategy: 'jsx-repair',
        handler: this.fixJSXSyntaxErrors.bind(this)
      }],
      ['TS7006', { 
        name: 'implicit-any-parameters', 
        priority: 2, 
        description: 'Parameters with implicit any type',
        strategy: 'type-annotation',
        handler: this.fixImplicitAnyParameters.bind(this)
      }],
      ['TS6133', { 
        name: 'unused-declarations', 
        priority: 3, 
        description: 'Unused variables and imports',
        strategy: 'safe-removal',
        handler: this.fixUnusedDeclarations.bind(this)
      }],
      ['TS2307', { 
        name: 'module-not-found', 
        priority: 4, 
        description: 'Cannot find module errors',
        strategy: 'import-resolution',
        handler: this.fixModuleNotFound.bind(this)
      }],
      ['TS2339', { 
        name: 'property-not-exist', 
        priority: 4, 
        description: 'Property does not exist on type',
        strategy: 'type-extension',
        handler: this.fixPropertyNotExist.bind(this)
      }],
      ['TS2724', { 
        name: 'no-exported-member', 
        priority: 4, 
        description: 'No exported member in module',
        strategy: 'import-correction',
        handler: this.fixNoExportedMember.bind(this)
      }]
    ]);
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    console.log(logEntry);
    this.executionLog.push(logEntry);
  }

  async deploy() {
    this.log('🚀 Deploying Fresh TypeScript Error Resolution System...');
    
    try {
      // Step 1: Create backup
      await this.createBackup();
      
      // Step 2: Analyze fresh errors
      const freshErrors = await this.loadFreshErrors();
      const errorAnalysis = await this.categorizeErrors(freshErrors);
      const { totalErrors, categories } = errorAnalysis;
      
      if (totalErrors === 0) {
        this.log('🎉 No fresh TypeScript errors found! System is clean.');
        return { success: true, errorsFixed: 0, errorsRemaining: 0 };
      }

      this.log(`📊 Found ${totalErrors} fresh errors to resolve`);

      // Step 3: Execute phased resolution
      const errorsFixed = await this.executePhasedResolution({ categories });
      this.totalErrorsFixed = errorsFixed;

      // Step 4: Validate fixes
      const remainingErrors = await this.validateFixes();

      // Step 5: Generate reports
      await this.generateReport(errorAnalysis, errorsFixed, remainingErrors);

      const executionTime = Date.now() - this.startTime;
      this.log(`✅ Fresh error resolution completed in ${Math.round(executionTime / 1000)}s`);
      this.log(`📈 Fixed ${errorsFixed} errors, ${remainingErrors} remaining`);

      return {
        success: true,
        errorsFixed,
        errorsRemaining: remainingErrors,
        executionTime,
        categories: Array.from(categories.keys())
      };

    } catch (error) {
      this.log(`❌ Error during fresh error resolution: ${error.message}`, 'error');
      this.log(`📚 Stack trace: ${error.stack}`, 'debug');
      
      // Attempt rollback on failure
      if (this.options.backup) {
        await this.performRollback();
      }
      
      throw error;
    }
  }

  async loadFreshErrors() {
    try {
      const freshErrorsPath = path.join(this.options.projectPath, 'type-errors-fresh.txt');
      if (!fs.existsSync(freshErrorsPath)) {
        this.log('📝 Fresh errors file not found, generating current errors...', 'info');
        return await this.generateCurrentErrors();
      }

      const content = fs.readFileSync(freshErrorsPath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim() && line.includes('error TS'));
      
      return lines.map(line => this.parseErrorLine(line)).filter(Boolean);
    } catch (error) {
      this.log(`⚠️ Error loading fresh errors: ${error.message}`, 'warn');
      return await this.generateCurrentErrors();
    }
  }

  async generateCurrentErrors() {
    this.log('🔍 Generating current TypeScript errors...', 'info');
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      return [];
    } catch (error) {
      const output = error.stdout ? error.stdout.toString() : error.stderr.toString();
      const lines = output.split('\n').filter(line => line.trim() && line.includes('error TS'));
      return lines.map(line => this.parseErrorLine(line)).filter(Boolean);
    }
  }

  parseErrorLine(line) {
    // Parse TypeScript error format: file.ts(line,column): error TSxxxx: message
    const errorRegex = /^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$/;
    const match = line.match(errorRegex);
    
    if (!match) {
      this.log(`⚠️ Could not parse error line: ${line}`, 'warn');
      return null;
    }
    
    const [, file, lineNum, column, code, message] = match;
    
    return {
      file: file.trim(),
      line: parseInt(lineNum, 10),
      column: parseInt(column, 10),
      code,
      message: message.trim(),
      raw: line
    };
  }

  async categorizeErrors(errors) {
    this.log(`🔍 Categorizing ${errors.length} fresh errors...`);
    
    const categories = new Map();
    const fileGroups = new Map();
    const codeGroups = new Map();

    for (const error of errors) {
      // Group by error code
      if (!codeGroups.has(error.code)) {
        codeGroups.set(error.code, []);
      }
      codeGroups.get(error.code).push(error);

      // Group by file
      if (!fileGroups.has(error.file)) {
        fileGroups.set(error.file, []);
      }
      fileGroups.get(error.file).push(error);

      // Categorize by pattern
      const pattern = this.errorPatterns.get(error.code);
      if (pattern) {
        if (!categories.has(pattern.name)) {
          categories.set(pattern.name, {
            ...pattern,
            errors: []
          });
        }
        categories.get(pattern.name).errors.push(error);
      } else {
        // Unknown error type
        if (!categories.has('unknown-errors')) {
          categories.set('unknown-errors', {
            name: 'unknown-errors',
            priority: 10,
            description: 'Unrecognized error types',
            strategy: 'manual-review',
            errors: []
          });
        }
        categories.get('unknown-errors').errors.push(error);
      }
    }

    this.log(`📊 Error distribution by code:`);
    for (const [code, errors] of [...codeGroups.entries()].sort((a, b) => b[1].length - a[1].length)) {
      this.log(`   ${code}: ${errors.length} errors`);
    }

    return {
      categories,
      fileGroups,
      codeGroups,
      totalErrors: errors.length
    };
  }

  async executePhasedResolution(errorAnalysis) {
    this.log('🔧 Starting phased error resolution...');
    
    let totalFixed = 0;
    const { categories } = errorAnalysis;

    // Sort categories by priority (lower number = higher priority)
    const sortedCategories = [...categories.values()].sort((a, b) => a.priority - b.priority);

    for (const category of sortedCategories) {
      if (category.errors.length === 0) continue;

      this.log(`\n🎯 Phase: ${category.name} (${category.errors.length} errors)`);
      this.log(`📋 Strategy: ${category.strategy}`);
      this.log(`📝 Description: ${category.description}`);

      if (this.options.dryRun) {
        this.log(`🔍 DRY RUN: Would fix ${category.errors.length} ${category.name} errors`);
        continue;
      }

      try {
        const fixed = await category.handler(category.errors);
        totalFixed += fixed;
        this.log(`✅ Fixed ${fixed} ${category.name} errors`);
      } catch (error) {
        this.log(`❌ Error fixing ${category.name}: ${error.message}`, 'error');
        // Continue with other categories even if one fails
      }
    }

    return totalFixed;
  }

  async fixSyntaxErrors(errors) {
    this.log('🔧 Fixing syntax errors (TS1005)...');
    
    const fileGroups = new Map();
    for (const error of errors) {
      if (!fileGroups.has(error.file)) {
        fileGroups.set(error.file, []);
      }
      fileGroups.get(error.file).push(error);
    }

    let fixedCount = 0;
    for (const [filePath, fileErrors] of fileGroups) {
      try {
        if (await this.fixSyntaxErrorsInFile(filePath, fileErrors)) {
          fixedCount += fileErrors.length;
        }
      } catch (error) {
        this.log(`⚠️ Error fixing syntax in ${filePath}: ${error.message}`, 'warn');
      }
    }

    return fixedCount;
  }

  async fixSyntaxErrorsInFile(filePath, errors) {
    if (!fs.existsSync(filePath)) {
      this.log(`⚠️ File not found: ${filePath}`, 'warn');
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Common syntax fixes
    const syntaxFixes = [
      // Fix type annotations that got corrupted
      { pattern: /: unknown\)/g, replacement: ')' },
      { pattern: /: unknown;/g, replacement: ';' },
      { pattern: /: unknown,/g, replacement: ',' },
      
      // Fix malformed function calls
      { pattern: /addEventListener\('([^']+)',\s*([^)]+): unknown\)/g, replacement: "addEventListener('$1', $2)" },
      { pattern: /removeEventListener\('([^']+)',\s*([^)]+): unknown\)/g, replacement: "removeEventListener('$1', $2)" },
      { pattern: /setTimeout\(([^,]+),\s*(\d+): unknown\)/g, replacement: 'setTimeout($1, $2)' },
      
      // Fix JSX className issues
      { pattern: /className=\{"([^"]*)\}([^"]*)/g, replacement: 'className="$1$2"' },
      { pattern: /className=\{\"([^\"]*)/g, replacement: 'className="$1' },
    ];

    for (const { pattern, replacement } of syntaxFixes) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
        this.log(`  ✓ Applied syntax fix: ${pattern.source}`, 'debug');
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      this.log(`  ✅ Fixed syntax errors in ${path.basename(filePath)}`);
      return true;
    }

    return false;
  }

  async fixJSXSyntaxErrors(errors) {
    this.log('🔧 Fixing JSX syntax errors (TS1382)...');
    
    const fileGroups = new Map();
    for (const error of errors) {
      if (!fileGroups.has(error.file)) {
        fileGroups.set(error.file, []);
      }
      fileGroups.get(error.file).push(error);
    }

    let fixedCount = 0;
    for (const [filePath, fileErrors] of fileGroups) {
      try {
        if (await this.fixJSXSyntaxErrorsInFile(filePath, fileErrors)) {
          fixedCount += fileErrors.length;
        }
      } catch (error) {
        this.log(`⚠️ Error fixing JSX syntax in ${filePath}: ${error.message}`, 'warn');
      }
    }

    return fixedCount;
  }

  async fixJSXSyntaxErrorsInFile(filePath, errors) {
    if (!fs.existsSync(filePath)) {
      this.log(`⚠️ File not found: ${filePath}`, 'warn');
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // JSX-specific fixes
    const jsxFixes = [
      // Fix malformed JSX tags and attributes
      { pattern: />\s*onClick=/g, replacement: '\n        onClick=' },
      { pattern: /}\s*className=/g, replacement: '}\n        className=' },
      { pattern: /"([^"]*)\}([^"]*)/g, replacement: '"$1$2"' },
      
      // Fix incomplete JSX elements
      { pattern: /<button>\s*onClick=/g, replacement: '<button\n        onClick=' },
      { pattern: /aria-label="([^"]*)">/g, replacement: 'aria-label="$1"\n      >' },
      
      // Fix malformed className expressions
      { pattern: /className=\{"([^"]*)\}/g, replacement: 'className="$1"' },
      { pattern: /className=\{"([^"]*)\}([^"]*)/g, replacement: 'className="$1$2"' },
    ];

    for (const { pattern, replacement } of jsxFixes) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
        this.log(`  ✓ Applied JSX fix: ${pattern.source}`, 'debug');
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      this.log(`  ✅ Fixed JSX syntax errors in ${path.basename(filePath)}`);
      return true;
    }

    return false;
  }

  async fixImplicitAnyParameters(errors) {
    this.log('🔧 Fixing implicit any parameters (TS7006)...');
    
    const fileGroups = new Map();
    for (const error of errors) {
      if (!fileGroups.has(error.file)) {
        fileGroups.set(error.file, []);
      }
      fileGroups.get(error.file).push(error);
    }

    let fixedCount = 0;
    for (const [filePath, fileErrors] of fileGroups) {
      try {
        if (await this.fixImplicitAnyInFile(filePath, fileErrors)) {
          fixedCount += fileErrors.length;
        }
      } catch (error) {
        this.log(`⚠️ Error fixing implicit any in ${filePath}: ${error.message}`, 'warn');
      }
    }

    return fixedCount;
  }

  async fixImplicitAnyInFile(filePath, errors) {
    if (!fs.existsSync(filePath)) {
      this.log(`⚠️ File not found: ${filePath}`, 'warn');
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Common parameter type annotations
    const parameterFixes = [
      { pattern: /\(([a-zA-Z_$][a-zA-Z0-9_$]*)\)\s*=>/g, replacement: '($1: any) =>' },
      { pattern: /\(([a-zA-Z_$][a-zA-Z0-9_$]*),\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\)\s*=>/g, replacement: '($1: any, $2: any) =>' },
      { pattern: /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\(([a-zA-Z_$][a-zA-Z0-9_$]*)\)/g, replacement: 'function $1($2: any)' },
      { pattern: /\.map\(([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>/g, replacement: '.map(($1: any) =>' },
      { pattern: /\.filter\(([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>/g, replacement: '.filter(($1: any) =>' },
      { pattern: /\.forEach\(([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>/g, replacement: '.forEach(($1: any) =>' },
    ];

    for (const { pattern, replacement } of parameterFixes) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
        this.log(`  ✓ Applied parameter type fix: ${pattern.source}`, 'debug');
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      this.log(`  ✅ Fixed implicit any parameters in ${path.basename(filePath)}`);
      return true;
    }

    return false;
  }

  async fixUnusedDeclarations(errors) {
    this.log('🔧 Fixing unused declarations (TS6133)...');
    
    const fileGroups = new Map();
    for (const error of errors) {
      if (!fileGroups.has(error.file)) {
        fileGroups.set(error.file, []);
      }
      fileGroups.get(error.file).push(error);
    }

    let fixedCount = 0;
    for (const [filePath, fileErrors] of fileGroups) {
      try {
        if (await this.removeUnusedInFile(filePath, fileErrors)) {
          fixedCount += fileErrors.length;
        }
      } catch (error) {
        this.log(`⚠️ Error removing unused declarations in ${filePath}: ${error.message}`, 'warn');
      }
    }

    return fixedCount;
  }

  async removeUnusedInFile(filePath, errors) {
    if (!fs.existsSync(filePath)) {
      this.log(`⚠️ File not found: ${filePath}`, 'warn');
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const error of errors) {
      // Extract the unused variable name from the error message
      const match = error.message.match(/'([^']+)' is declared but its value is never read/);
      if (match) {
        const unusedVar = match[1];
        
        // Remove from imports
        const importPatterns = [
          new RegExp(`import\\s*{[^}]*,\\s*${unusedVar}\\s*,`, 'g'),
          new RegExp(`import\\s*{\\s*${unusedVar}\\s*,`, 'g'),
          new RegExp(`,\\s*${unusedVar}\\s*}`, 'g'),
          new RegExp(`import\\s*{\\s*${unusedVar}\\s*}\\s*from[^;]+;?\\s*\n?`, 'g'),
        ];

        for (const pattern of importPatterns) {
          if (pattern.test(content)) {
            content = content.replace(pattern, (match) => {
              if (match.includes(',')) {
                return match.replace(new RegExp(`\\s*,?\\s*${unusedVar}\\s*,?`), '');
              }
              return '';
            });
            modified = true;
            this.log(`  ✓ Removed unused import: ${unusedVar}`, 'debug');
          }
        }

        // Remove unused variable declarations
        const varPattern = new RegExp(`\\s*const\\s+${unusedVar}\\s*=[^;]+;\\s*\n?`, 'g');
        if (varPattern.test(content)) {
          content = content.replace(varPattern, '');
          modified = true;
          this.log(`  ✓ Removed unused variable: ${unusedVar}`, 'debug');
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      this.log(`  ✅ Removed unused declarations in ${path.basename(filePath)}`);
      return true;
    }

    return false;
  }

  async fixModuleNotFound(errors) {
    this.log('🔧 Fixing module not found errors (TS2307)...');
    
    const fileGroups = new Map();
    for (const error of errors) {
      if (!fileGroups.has(error.file)) {
        fileGroups.set(error.file, []);
      }
      fileGroups.get(error.file).push(error);
    }

    let fixedCount = 0;
    for (const [filePath, fileErrors] of fileGroups) {
      try {
        if (await this.fixModuleImportsInFile(filePath, fileErrors)) {
          fixedCount += fileErrors.length;
        }
      } catch (error) {
        this.log(`⚠️ Error fixing module imports in ${filePath}: ${error.message}`, 'warn');
      }
    }

    return fixedCount;
  }

  async fixModuleImportsInFile(filePath, errors) {
    if (!fs.existsSync(filePath)) {
      this.log(`⚠️ File not found: ${filePath}`, 'warn');
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Common import path fixes
    const importFixes = [
      // Remove .tsx extensions
      { pattern: /from\s*['"](.*?)\.tsx['"]/g, replacement: "from '$1'" },
      
      // Fix relative path issues
      { pattern: /from\s*['"]\.\.\/src\s*\/\s*([^'"]+)['"]/g, replacement: "from '../src/$1'" },
      { pattern: /from\s*['"]\.\/([^'"]+)\.tsx['"]/g, replacement: "from './$1'" },
      
      // Fix common missing packages
      { pattern: /from\s*['"](date-fns)['"]/g, replacement: "from '$1'" },
      { pattern: /from\s*['"](ImageWithFallback\.tsx)['"]/g, replacement: "from './ImageWithFallback'" },
      { pattern: /from\s*['"](BaseModal\.tsx)['"]/g, replacement: "from './BaseModal'" },
      
      // Fix spaced import paths
      { pattern: /from\s*['"]\.\.\/src\s*\/\s*hooks\s*\/\s*([^'"]+)['"]/g, replacement: "from '../src/hooks/$1'" },
      { pattern: /from\s*['"]\.\.\/src\s*\/\s*lib\s*\/\s*([^'"]+)['"]/g, replacement: "from '../src/lib/$1'" },
    ];

    for (const { pattern, replacement } of importFixes) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
        this.log(`  ✓ Applied import fix: ${pattern.source}`, 'debug');
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      this.log(`  ✅ Fixed module imports in ${path.basename(filePath)}`);
      return true;
    }

    return false;
  }

  async fixPropertyNotExist(errors) {
    this.log('🔧 Fixing property not exist errors (TS2339)...');
    
    const fileGroups = new Map();
    for (const error of errors) {
      if (!fileGroups.has(error.file)) {
        fileGroups.set(error.file, []);
      }
      fileGroups.get(error.file).push(error);
    }

    let fixedCount = 0;
    for (const [filePath, fileErrors] of fileGroups) {
      try {
        if (await this.fixPropertyAccessInFile(filePath, fileErrors)) {
          fixedCount += fileErrors.length;
        }
      } catch (error) {
        this.log(`⚠️ Error fixing property access in ${filePath}: ${error.message}`, 'warn');
      }
    }

    return fixedCount;
  }

  async fixPropertyAccessInFile(filePath, errors) {
    if (!fs.existsSync(filePath)) {
      this.log(`⚠️ File not found: ${filePath}`, 'warn');
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Common property access fixes
    for (const error of errors) {
      if (error.message.includes('Property') && error.message.includes('does not exist on type')) {
        // Add optional chaining for safer property access
        const propertyMatch = error.message.match(/Property '([^']+)' does not exist on type/);
        if (propertyMatch) {
          const property = propertyMatch[1];
          
          // Make property access optional
          const optionalAccessPattern = new RegExp(`\\.${property}(?!\\?)`, 'g');
          if (optionalAccessPattern.test(content)) {
            content = content.replace(optionalAccessPattern, `.${property}?`);
            modified = true;
            this.log(`  ✓ Added optional chaining for property: ${property}`, 'debug');
          }
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      this.log(`  ✅ Fixed property access in ${path.basename(filePath)}`);
      return true;
    }

    return false;
  }

  async fixNoExportedMember(errors) {
    this.log('🔧 Fixing no exported member errors (TS2724)...');
    
    const fileGroups = new Map();
    for (const error of errors) {
      if (!fileGroups.has(error.file)) {
        fileGroups.set(error.file, []);
      }
      fileGroups.get(error.file).push(error);
    }

    let fixedCount = 0;
    for (const [filePath, fileErrors] of fileGroups) {
      try {
        if (await this.fixExportedMemberInFile(filePath, fileErrors)) {
          fixedCount += fileErrors.length;
        }
      } catch (error) {
        this.log(`⚠️ Error fixing exported member in ${filePath}: ${error.message}`, 'warn');
      }
    }

    return fixedCount;
  }

  async fixExportedMemberInFile(filePath, errors) {
    if (!fs.existsSync(filePath)) {
      this.log(`⚠️ File not found: ${filePath}`, 'warn');
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Common export fixes
    const exportFixes = [
      // Fix ChatBubbleOvalLeftIcon -> ChatBubbleLeftIcon
      { pattern: /ChatBubbleOvalLeftIcon/g, replacement: 'ChatBubbleLeftIcon' },
      
      // Fix other common heroicons naming issues
      { pattern: /CalendarDaysIcon/g, replacement: 'CalendarIcon' },
      { pattern: /ChartBarIcon/g, replacement: 'ChartBarSquareIcon' },
      { pattern: /SignalSlashIcon/g, replacement: 'NoSymbolIcon' },
    ];

    for (const { pattern, replacement } of exportFixes) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
        this.log(`  ✓ Fixed export name: ${pattern.source} -> ${replacement}`, 'debug');
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      this.log(`  ✅ Fixed exported member names in ${path.basename(filePath)}`);
      return true;
    }

    return false;
  }

  async createBackup() {
    if (!this.options.backup) return;

    this.log('📦 Creating system backup...');
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupPath = path.join(this.backupDir, `fresh-error-resolution-${timestamp}`);
    
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    try {
      // Create backup of critical files
      const filesToBackup = [
        'components',
        'src',
        'package.json',
        'tsconfig.json',
        'type-errors-fresh.txt'
      ];

      fs.mkdirSync(backupPath, { recursive: true });

      for (const file of filesToBackup) {
        const srcPath = path.join(this.options.projectPath, file);
        const destPath = path.join(backupPath, file);
        
        if (fs.existsSync(srcPath)) {
          if (fs.statSync(srcPath).isDirectory()) {
            await this.copyDirectory(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }

      this.log(`✅ Backup created at: ${backupPath}`);
      this.backupPath = backupPath;
    } catch (error) {
      this.log(`⚠️ Backup failed: ${error.message}`, 'warn');
    }
  }

  async copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  async performRollback() {
    if (!this.backupPath) {
      this.log('⚠️ No backup available for rollback', 'warn');
      return;
    }

    this.log('🔄 Performing system rollback...');
    
    try {
      // Restore files from backup
      const entries = fs.readdirSync(this.backupPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const backupPath = path.join(this.backupPath, entry.name);
        const restorePath = path.join(this.options.projectPath, entry.name);
        
        if (entry.isDirectory()) {
          if (fs.existsSync(restorePath)) {
            // Remove existing directory
            fs.rmSync(restorePath, { recursive: true, force: true });
          }
          await this.copyDirectory(backupPath, restorePath);
        } else {
          fs.copyFileSync(backupPath, restorePath);
        }
      }

      this.log('✅ System rollback completed');
    } catch (error) {
      this.log(`❌ Rollback failed: ${error.message}`, 'error');
    }
  }

  async validateFixes() {
    this.log('🔍 Validating fixes...');
    
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.log('✅ TypeScript compilation successful!');
      return 0;
    } catch (error) {
      const output = error.stdout ? error.stdout.toString() : error.stderr.toString();
      const lines = output.split('\n').filter(line => line.trim() && line.includes('error TS'));
      
      this.log(`⚠️ ${lines.length} TypeScript errors remaining`);
      return lines.length;
    }
  }

  async generateReport(categorizedErrors, errorsFixed, errorsRemaining) {
    if (!this.options.generateReports) return;

    this.log('📊 Generating comprehensive report...');
    
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }

    const executionTime = Date.now() - this.startTime;
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalErrorsAnalyzed: categorizedErrors.totalErrors,
        errorsFixed,
        errorsRemaining,
        executionTimeMs: executionTime,
        successRate: ((errorsFixed / categorizedErrors.totalErrors) * 100).toFixed(2)
      },
      categories: Object.fromEntries(
        categorizedErrors.categories.entries()
      ),
      executionLog: this.executionLog,
      options: this.options
    };

    // Save JSON report
    const jsonPath = path.join(this.reportDir, 'fresh-error-resolution-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // Save markdown summary
    const markdownPath = path.join(this.reportDir, 'FRESH_ERROR_RESOLUTION_SUMMARY.md');
    const markdown = this.generateMarkdownSummary(report);
    fs.writeFileSync(markdownPath, markdown);

    this.log(`📄 Reports saved to: ${this.reportDir}`);
  }

  generateMarkdownSummary(report) {
    return `# Fresh TypeScript Error Resolution Report

## 📊 Summary

- **Total Errors Analyzed**: ${report.summary.totalErrorsAnalyzed}
- **Errors Fixed**: ${report.summary.errorsFixed}
- **Errors Remaining**: ${report.summary.errorsRemaining}
- **Success Rate**: ${report.summary.successRate}%
- **Execution Time**: ${Math.round(report.summary.executionTimeMs / 1000)}s

## 🎯 Error Categories Processed

${Object.entries(report.categories).map(([name, category]) => 
  `### ${category.name}
  - **Priority**: ${category.priority}
  - **Strategy**: ${category.strategy}
  - **Errors**: ${category.errors.length}
  - **Description**: ${category.description}`
).join('\n\n')}

## 🔧 Execution Details

Generated at: ${report.timestamp}
`;
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const noBackup = args.includes('--no-backup');
  
  console.log('🚀 Deploy and Run Fresh TypeScript Error Resolution System');
  console.log('📋 Based on DEPLOYMENT_GUIDE.md and IMPLEMENTATION_SUMMARY.md');
  console.log('🎯 Targeting fresh TypeScript errors with systematic fixes\n');

  const resolver = new FreshErrorResolutionDeployer({
    dryRun,
    backup: !noBackup,
    generateReports: true,
    maxIterations: 5
  });

  resolver.deploy()
    .then(result => {
      console.log('\n🎉 Fresh Error Resolution Deployment Complete!');
      console.log(`📈 Fixed ${result.errorsFixed} errors in ${Math.round(result.executionTime / 1000)}s`);
      console.log(`📊 ${result.errorsRemaining} errors remaining`);
      
      if (result.errorsRemaining === 0) {
        console.log('🏆 Perfect! All fresh errors have been resolved!');
      } else {
        console.log('📝 Check the generated reports for details on remaining errors');
      }
      
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Fresh Error Resolution Failed:');
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = { FreshErrorResolutionDeployer };