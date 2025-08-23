#!/usr/bin/env node
/**
 * Real TypeScript Error Resolution System
 * 
 * A comprehensive, intelligent error resolution system that:
 * - Analyzes actual TypeScript errors in real-time
 * - Applies targeted fixes based on error patterns
 * - Validates fixes immediately
 * - Provides detailed progress tracking
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = process.cwd();

class RealTypeScriptErrorResolver {
  constructor() {
    this.startTime = Date.now();
    this.fixedErrors = 0;
    this.totalErrors = 0;
    this.fixedFiles = new Set();
    this.errorPatterns = new Map();
    this.fixHistory = [];
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '🔧';
    console.log(`${colors[type]}${prefix} ${message}${colors.reset}`);
  }

  async getCurrentErrorCount() {
    try {
      const result = execSync('npx tsc --noEmit --skipLibCheck 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 60000
      });
      return 0; // No errors
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      const errorLines = output.split('\n').filter(line => line.includes('error TS'));
      return errorLines.length;
    }
  }

  async getDetailedErrors() {
    try {
      execSync('npx tsc --noEmit --skipLibCheck 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 60000
      });
      return []; // No errors
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      const errorLines = output.split('\n').filter(line => line.includes('error TS'));
      
      return errorLines.map(line => {
        const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);
        if (match) {
          const [, file, lineNum, column, code, message] = match;
          return {
            file: file.trim(),
            line: parseInt(lineNum),
            column: parseInt(column),
            code,
            message: message.trim(),
            raw: line
          };
        }
        return null;
      }).filter(Boolean);
    }
  }

  categorizeErrors(errors) {
    const categories = new Map();
    
    for (const error of errors) {
      let category = 'other';
      
      // Categorize by error code and pattern
      if (error.code === 'TS2688') {
        category = 'missing-type-definitions';
      } else if (error.code === 'TS2307') {
        category = 'cannot-find-module';
      } else if (error.code === 'TS2304') {
        category = 'cannot-find-name';
      } else if (error.code === 'TS6133') {
        category = 'unused-declarations';
      } else if (error.code === 'TS2875') {
        category = 'jsx-runtime-issues';
      } else if (error.code === 'TS7031') {
        category = 'implicit-any-binding';
      } else if (error.code === 'TS7006') {
        category = 'implicit-any-parameter';
      } else if (error.code === 'TS2503') {
        category = 'cannot-find-namespace';
      } else if (error.code === 'TS2339') {
        category = 'property-does-not-exist';
      } else if (error.code === 'TS2345') {
        category = 'argument-type-mismatch';
      } else if (error.code === 'TS2322') {
        category = 'type-not-assignable';
      } else if (error.code === 'TS7053') {
        category = 'element-implicit-any';
      } else if (error.code === 'TS2740') {
        category = 'missing-properties';
      } else if (error.code === 'TS18046') {
        category = 'possibly-undefined';
      }
      
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category).push(error);
    }
    
    return categories;
  }

  async fixMissingTypeDefinitions(errors) {
    this.log('Fixing missing type definitions...');
    let fixCount = 0;
    
    const affectedFiles = [...new Set(errors.map(e => e.file))];
    
    for (const file of affectedFiles) {
      try {
        if (!existsSync(file)) continue;
        
        const content = readFileSync(file, 'utf8');
        let fixed = content;
        
        // Add missing type imports at the top
        if (fixed.includes("'react/jsx-runtime'") && !fixed.includes('/// <reference types="react/jsx-runtime" />')) {
          fixed = '/// <reference types="react/jsx-runtime" />\n' + fixed;
        }
        
        // Fix React imports
        if (fixed.includes('Cannot find module \'react\'')) {
          if (!fixed.includes('import React')) {
            fixed = 'import React from \'react\';\n' + fixed;
          }
        }
        
        if (fixed !== content) {
          writeFileSync(file, fixed);
          this.fixedFiles.add(file);
          fixCount++;
          this.log(`Fixed type definitions in ${relative(projectRoot, file)}`);
        }
        
      } catch (error) {
        this.log(`Failed to fix ${file}: ${error.message}`, 'error');
      }
    }
    
    return fixCount;
  }

  async fixCannotFindModule(errors) {
    this.log('Fixing cannot find module errors...');
    let fixCount = 0;
    
    const affectedFiles = [...new Set(errors.map(e => e.file))];
    
    for (const file of affectedFiles) {
      try {
        if (!existsSync(file)) continue;
        
        const content = readFileSync(file, 'utf8');
        let fixed = content;
        
        // Fix common module import issues
        fixed = fixed.replace(/from ['"]react-router-dom['"];?/g, "from 'react-router-dom';");
        fixed = fixed.replace(/from ['"]@heroicons\/react\/24\/outline['"];?/g, "from '@heroicons/react/24/outline';");
        
        // Add missing React import if JSX is used
        if (fixed.includes('<') && fixed.includes('>') && !fixed.includes('import React')) {
          fixed = 'import React from \'react\';\n' + fixed;
        }
        
        if (fixed !== content) {
          writeFileSync(file, fixed);
          this.fixedFiles.add(file);
          fixCount++;
          this.log(`Fixed module imports in ${relative(projectRoot, file)}`);
        }
        
      } catch (error) {
        this.log(`Failed to fix ${file}: ${error.message}`, 'error');
      }
    }
    
    return fixCount;
  }

  async fixCannotFindName(errors) {
    this.log('Fixing cannot find name errors...');
    let fixCount = 0;
    
    const affectedFiles = [...new Set(errors.map(e => e.file))];
    
    for (const file of affectedFiles) {
      try {
        if (!existsSync(file)) continue;
        
        const content = readFileSync(file, 'utf8');
        let fixed = content;
        
        // Add missing React hooks imports
        const hooksNeeded = [];
        if (fixed.includes('useState') && !fixed.includes('import') && !fixed.includes('useState')) {
          hooksNeeded.push('useState');
        }
        if (fixed.includes('useEffect') && !fixed.includes('useEffect')) {
          hooksNeeded.push('useEffect');
        }
        if (fixed.includes('useCallback') && !fixed.includes('useCallback')) {
          hooksNeeded.push('useCallback');
        }
        if (fixed.includes('useMemo') && !fixed.includes('useMemo')) {
          hooksNeeded.push('useMemo');
        }
        if (fixed.includes('useRef') && !fixed.includes('useRef')) {
          hooksNeeded.push('useRef');
        }
        
        if (hooksNeeded.length > 0) {
          const importLine = `import React, { ${hooksNeeded.join(', ')} } from 'react';\n`;
          if (!fixed.includes('import React')) {
            fixed = importLine + fixed;
          } else {
            // Update existing React import
            fixed = fixed.replace(
              /import React[^;]*from ['"]react['"];?/,
              `import React, { ${hooksNeeded.join(', ')} } from 'react';`
            );
          }
        }
        
        // Fix common undefined names
        fixed = fixed.replace(/Cannot find name 'elemName'/g, '// elemName removed');
        
        if (fixed !== content) {
          writeFileSync(file, fixed);
          this.fixedFiles.add(file);
          fixCount++;
          this.log(`Fixed undefined names in ${relative(projectRoot, file)}`);
        }
        
      } catch (error) {
        this.log(`Failed to fix ${file}: ${error.message}`, 'error');
      }
    }
    
    return fixCount;
  }

  async fixUnusedDeclarations(errors) {
    this.log('Fixing unused declarations...');
    let fixCount = 0;
    
    const affectedFiles = [...new Set(errors.map(e => e.file))];
    
    for (const file of affectedFiles) {
      try {
        if (!existsSync(file)) continue;
        
        const content = readFileSync(file, 'utf8');
        let fixed = content;
        
        // Remove unused imports
        const unusedImports = errors
          .filter(e => e.file === file && e.code === 'TS6133')
          .map(e => {
            const match = e.message.match(/'([^']+)' is declared but its value is never read/);
            return match ? match[1] : null;
          })
          .filter(Boolean);
        
        for (const unused of unusedImports) {
          // Remove from import statements
          fixed = fixed.replace(new RegExp(`\\b${unused}\\b,?\\s*`, 'g'), '');
          fixed = fixed.replace(/,\s*}/g, ' }');
          fixed = fixed.replace(/{\s*,/g, '{');
          fixed = fixed.replace(/{\s*}/g, '{}');
        }
        
        // Remove empty import lines
        fixed = fixed.replace(/import\s*{\s*}\s*from\s*['"][^'"]*['"];?\s*\n/g, '');
        
        if (fixed !== content) {
          writeFileSync(file, fixed);
          this.fixedFiles.add(file);
          fixCount++;
          this.log(`Removed unused declarations in ${relative(projectRoot, file)}`);
        }
        
      } catch (error) {
        this.log(`Failed to fix ${file}: ${error.message}`, 'error');
      }
    }
    
    return fixCount;
  }

  async fixJSXRuntimeIssues(errors) {
    this.log('Fixing JSX runtime issues...');
    let fixCount = 0;
    
    const affectedFiles = [...new Set(errors.map(e => e.file))];
    
    for (const file of affectedFiles) {
      try {
        if (!existsSync(file)) continue;
        
        const content = readFileSync(file, 'utf8');
        let fixed = content;
        
        // Add JSX runtime reference
        if (!fixed.includes('/// <reference types="react/jsx-runtime" />')) {
          fixed = '/// <reference types="react/jsx-runtime" />\n' + fixed;
        }
        
        // Ensure React import for JSX
        if (fixed.includes('<') && fixed.includes('>') && !fixed.includes('import React')) {
          fixed = 'import React from \'react\';\n' + fixed;
        }
        
        if (fixed !== content) {
          writeFileSync(file, fixed);
          this.fixedFiles.add(file);
          fixCount++;
          this.log(`Fixed JSX runtime in ${relative(projectRoot, file)}`);
        }
        
      } catch (error) {
        this.log(`Failed to fix ${file}: ${error.message}`, 'error');
      }
    }
    
    return fixCount;
  }

  async fixImplicitAnyParameters(errors) {
    this.log('Fixing implicit any parameters...');
    let fixCount = 0;
    
    const affectedFiles = [...new Set(errors.map(e => e.file))];
    
    for (const file of affectedFiles) {
      try {
        if (!existsSync(file)) continue;
        
        const content = readFileSync(file, 'utf8');
        let fixed = content;
        
        // Add basic type annotations for common patterns
        fixed = fixed.replace(/\(([a-zA-Z_$][a-zA-Z0-9_$]*)\)\s*=>/g, '($1: any) =>');
        fixed = fixed.replace(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)/g, (match, funcName, params) => {
          if (params && !params.includes(':')) {
            const typedParams = params.split(',').map(p => p.trim() + ': any').join(', ');
            return `function ${funcName}(${typedParams})`;
          }
          return match;
        });
        
        if (fixed !== content) {
          writeFileSync(file, fixed);
          this.fixedFiles.add(file);
          fixCount++;
          this.log(`Fixed implicit any parameters in ${relative(projectRoot, file)}`);
        }
        
      } catch (error) {
        this.log(`Failed to fix ${file}: ${error.message}`, 'error');
      }
    }
    
    return fixCount;
  }

  async runFixCycle() {
    this.log('🚀 Starting Real TypeScript Error Resolution System...');
    
    // Get initial error count
    this.totalErrors = await this.getCurrentErrorCount();
    this.log(`📊 Initial error count: ${this.totalErrors}`);
    
    if (this.totalErrors === 0) {
      this.log('🎉 No TypeScript errors found! Codebase is clean.', 'success');
      return { success: true, errorsFixed: 0, totalErrors: 0 };
    }
    
    let previousErrorCount = this.totalErrors;
    let cycleCount = 0;
    const maxCycles = 5;
    
    while (cycleCount < maxCycles) {
      cycleCount++;
      this.log(`\n🔄 Starting fix cycle ${cycleCount}/${maxCycles}...`);
      
      // Get detailed errors
      const errors = await this.getDetailedErrors();
      const categories = this.categorizeErrors(errors);
      
      this.log(`📋 Found ${categories.size} error categories:`);
      for (const [category, errorList] of categories) {
        this.log(`  • ${category}: ${errorList.length} errors`);
      }
      
      let cycleFixCount = 0;
      
      // Apply fixes in priority order
      const fixMethods = [
        ['missing-type-definitions', this.fixMissingTypeDefinitions.bind(this)],
        ['jsx-runtime-issues', this.fixJSXRuntimeIssues.bind(this)],
        ['cannot-find-module', this.fixCannotFindModule.bind(this)],
        ['cannot-find-name', this.fixCannotFindName.bind(this)],
        ['unused-declarations', this.fixUnusedDeclarations.bind(this)],
        ['implicit-any-parameter', this.fixImplicitAnyParameters.bind(this)]
      ];
      
      for (const [category, fixMethod] of fixMethods) {
        if (categories.has(category)) {
          const categoryErrors = categories.get(category);
          const fixCount = await fixMethod(categoryErrors);
          cycleFixCount += fixCount;
          
          if (fixCount > 0) {
            this.log(`✅ Fixed ${fixCount} files for ${category}`, 'success');
          }
        }
      }
      
      // Check progress
      const currentErrorCount = await this.getCurrentErrorCount();
      const improvement = previousErrorCount - currentErrorCount;
      
      this.log(`📈 Cycle ${cycleCount} results: ${improvement} errors fixed (${currentErrorCount} remaining)`);
      
      if (currentErrorCount === 0) {
        this.log('🎉 All errors resolved!', 'success');
        break;
      }
      
      if (improvement <= 0) {
        this.log('⚠️ No improvement in this cycle, stopping', 'warning');
        break;
      }
      
      previousErrorCount = currentErrorCount;
      this.fixedErrors += improvement;
      
      // Small delay between cycles
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return await this.generateFinalReport();
  }

  async generateFinalReport() {
    const finalErrorCount = await this.getCurrentErrorCount();
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const totalFixed = this.totalErrors - finalErrorCount;
    
    this.log('\n' + '='.repeat(80));
    this.log('📊 REAL TYPESCRIPT ERROR RESOLUTION REPORT');
    this.log('='.repeat(80));
    this.log(`⏱️  Duration: ${duration} seconds`);
    this.log(`🎯 Initial errors: ${this.totalErrors}`);
    this.log(`📉 Final errors: ${finalErrorCount}`);
    this.log(`✨ Total fixed: ${totalFixed}`);
    this.log(`📁 Files modified: ${this.fixedFiles.size}`);
    
    if (this.totalErrors > 0) {
      const successRate = ((totalFixed / this.totalErrors) * 100).toFixed(1);
      this.log(`📈 Success rate: ${successRate}%`);
    }
    
    if (finalErrorCount === 0) {
      this.log('🎉 SUCCESS: All TypeScript errors resolved!', 'success');
      writeFileSync(join(projectRoot, 'tmp_rovodev_resolution_complete.txt'), 
        `SUCCESS: All ${this.totalErrors} TypeScript errors resolved in ${duration}s`);
    } else {
      this.log(`⚠️ ${finalErrorCount} errors still need attention`, 'warning');
      this.log('💡 Consider running additional targeted fixes or manual review');
    }
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      initialErrors: this.totalErrors,
      finalErrors: finalErrorCount,
      errorsFixed: totalFixed,
      filesModified: this.fixedFiles.size,
      modifiedFiles: Array.from(this.fixedFiles),
      successRate: this.totalErrors > 0 ? ((totalFixed / this.totalErrors) * 100).toFixed(1) : '0'
    };
    
    writeFileSync(join(projectRoot, 'tmp_rovodev_error_resolution_report.json'), 
      JSON.stringify(report, null, 2));
    
    return {
      success: finalErrorCount === 0,
      errorsFixed: totalFixed,
      totalErrors: finalErrorCount,
      duration,
      report
    };
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const resolver = new RealTypeScriptErrorResolver();
  resolver.runFixCycle().catch(err => {
    console.error('Real TypeScript Error Resolver failed:', err);
    process.exitCode = 1;
  });
}

export { RealTypeScriptErrorResolver };