#!/usr/bin/env node
/**
 * Comprehensive TypeScript Error Fixer
 * 
 * This script fixes all remaining TypeScript errors in the codebase
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname, relative } from 'path';
import { execSync } from 'child_process';

const projectRoot = process.cwd();

class ComprehensiveTypeScriptFixer {
  constructor() {
    this.fixedFiles = new Map();
    this.totalChanges = 0;
    this.errorPatterns = new Map();
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

  getAllTypeScriptFiles() {
    const files = [];
    
    const scanDir = (dir) => {
      try {
        const items = readdirSync(dir);
        for (const item of items) {
          const fullPath = join(dir, item);
          const stat = statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && !['node_modules', 'dist', 'build', '.git'].includes(item)) {
            scanDir(fullPath);
          } else if (stat.isFile() && ['.ts', '.tsx'].includes(extname(item))) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories that can't be read
      }
    };
    
    scanDir(projectRoot);
    return files;
  }

  getCurrentErrors() {
    try {
      execSync('npm run type-check 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: projectRoot,
        timeout: 60000
      });
      return [];
    } catch (error) {
      const output = `${error.stdout || ''}${error.stderr || ''}`;
      const errors = [];
      const lines = output.split('\n');
      
      for (const line of lines) {
        const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);
        if (match) {
          const [, file, lineNum, column, code, message] = match;
          errors.push({
            file: file.trim(),
            line: parseInt(lineNum),
            column: parseInt(column),
            code,
            message: message.trim()
          });
        }
      }
      
      return errors;
    }
  }

  fixUnusedImports(content, errors) {
    let fixed = content;
    let changes = 0;

    // Get all unused variable names from errors
    const unusedVars = new Set();
    errors.forEach(error => {
      if (error.code === 'TS6133') {
        const match = error.message.match(/'([^']+)'/);
        if (match) {
          unusedVars.add(match[1]);
        }
      }
    });

    // Remove unused imports
    unusedVars.forEach(varName => {
      // Remove from import statements
      const importRegex = new RegExp(`\\b${varName}\\b\\s*,?\\s*`, 'g');
      
      // Check if it's in an import statement
      const importLineRegex = new RegExp(`^import.*\\b${varName}\\b.*from`, 'gm');
      if (importLineRegex.test(fixed)) {
        // Remove the variable from imports
        fixed = fixed.replace(new RegExp(`\\b${varName}\\s*,\\s*`, 'g'), '');
        fixed = fixed.replace(new RegExp(`,\\s*${varName}\\b`, 'g'), '');
        fixed = fixed.replace(new RegExp(`\\{\\s*${varName}\\s*\\}`, 'g'), '{}');
        
        // Clean up empty imports
        fixed = fixed.replace(/import\s*\{\s*\}\s*from\s*['"][^'"]+['"]\s*;?\s*\n/g, '');
        
        changes++;
      }
    });

    // Clean up import formatting
    fixed = fixed.replace(/,\s*}/g, ' }');
    fixed = fixed.replace(/{\s*,/g, '{ ');
    fixed = fixed.replace(/,\s*,/g, ',');

    return { fixed, changes };
  }

  fixMissingImports(content, errors) {
    let fixed = content;
    let changes = 0;
    const addedImports = new Set();

    errors.forEach(error => {
      if (error.code === 'TS2304') {
        const match = error.message.match(/Cannot find name '([^']+)'/);
        if (match) {
          const missingName = match[1];
          
          // Map of common missing imports
          const importMap = {
            'PaperAirplaneIcon': "@heroicons/react/24/outline",
            'ChevronRightIcon': "@heroicons/react/24/outline",
            'CalendarDaysIcon': "@heroicons/react/24/outline",
            'ChartBarIcon': "@heroicons/react/24/outline",
            'SignalSlashIcon': "@heroicons/react/24/outline",
            'PlayIcon': "@heroicons/react/24/outline",
            'XMarkIcon': "@heroicons/react/24/outline",
            'CheckIcon': "@heroicons/react/24/outline",
            'TrashIcon': "@heroicons/react/24/outline",
            'VideoCameraIcon': "@heroicons/react/24/outline",
            'EyeIcon': "@heroicons/react/24/outline",
            'HeartIcon': "@heroicons/react/24/outline",
            'StopIcon': "@heroicons/react/24/outline",
            'MicrophoneIcon': "@heroicons/react/24/outline",
            'ChatBubbleLeftIcon': "@heroicons/react/24/outline",
            'Cog6ToothIcon': "@heroicons/react/24/outline",
            'QueueListIcon': "@heroicons/react/24/outline",
            'DocumentTextIcon': "@heroicons/react/24/outline",
            'CurrencyDollarIcon': "@heroicons/react/24/outline",
            'UserGroupIcon': "@heroicons/react/24/outline",
            'PaintBrushIcon': "@heroicons/react/24/outline",
            'FilmIcon': "@heroicons/react/24/outline",
            'CogIcon': "@heroicons/react/24/outline",
            'PlusIcon': "@heroicons/react/24/outline",
            'ClockIcon': "@heroicons/react/24/outline",
            'HandThumbUpIcon': "@heroicons/react/24/outline",
            'ShareIcon': "@heroicons/react/24/outline",
            'DevicePhoneMobileIcon': "@heroicons/react/24/outline",
            'ComputerDesktopIcon': "@heroicons/react/24/outline",
            'GlobeAltIcon': "@heroicons/react/24/outline",
            'TvIcon': "@heroicons/react/24/outline",
            'ArrowTrendingUpIcon': "@heroicons/react/24/outline",
            'ArrowTrendingDownIcon': "@heroicons/react/24/outline",
            'SparklesIcon': "@heroicons/react/24/outline",
            'BugAntIcon': "@heroicons/react/24/outline",
            'formatTimeAgo': "../utils/formatters",
            'DropdownMenuSeparator': "./ui/DropdownMenu",
            'Grid': "react-window",
            'Video': "../types",
            'PlaylistSummary': "../types",
            'CommunityPost': "../types",
            'Channel': "../types"
          };

          if (importMap[missingName] && !addedImports.has(missingName)) {
            const importPath = importMap[missingName];
            const importStatement = `import { ${missingName} } from '${importPath}';\n`;
            
            // Add import at the top of the file after existing imports
            const firstImportIndex = fixed.indexOf('import ');
            if (firstImportIndex !== -1) {
              const lastImportMatch = fixed.match(/^import[^;]+;[\s]*$/gm);
              if (lastImportMatch && lastImportMatch.length > 0) {
                const lastImport = lastImportMatch[lastImportMatch.length - 1];
                const lastImportIndex = fixed.lastIndexOf(lastImport);
                fixed = fixed.slice(0, lastImportIndex + lastImport.length) + '\n' + importStatement + fixed.slice(lastImportIndex + lastImport.length);
              } else {
                fixed = importStatement + fixed;
              }
            } else {
              fixed = importStatement + fixed;
            }
            
            addedImports.add(missingName);
            changes++;
          }
        }
      }
    });

    return { fixed, changes };
  }

  fixPropertyErrors(content, errors) {
    let fixed = content;
    let changes = 0;

    errors.forEach(error => {
      if (error.code === 'TS2339') {
        // Fix array method calls on non-array types
        if (error.message.includes("Property 'map' does not exist") || 
            error.message.includes("Property 'length' does not exist") ||
            error.message.includes("Property 'filter' does not exist") ||
            error.message.includes("Property 'find' does not exist") ||
            error.message.includes("Property 'sort' does not exist") ||
            error.message.includes("Property 'forEach' does not exist")) {
          
          const lines = fixed.split('\n');
          if (error.line <= lines.length) {
            const line = lines[error.line - 1];
            
            // Extract the variable name that needs to be an array
            const varMatch = line.match(/(\w+)\.(map|length|filter|find|sort|forEach)/);
            if (varMatch) {
              const varName = varMatch[1];
              
              // Look for the variable declaration or usage
              for (let i = Math.max(0, error.line - 20); i < Math.min(lines.length, error.line + 5); i++) {
                const checkLine = lines[i];
                
                // Fix type annotations
                if (checkLine.includes(`${varName}:`) && !checkLine.includes(`${varName}[]`)) {
                  // Check if it should be an array
                  if (checkLine.includes(`: string`) && (line.includes('.map') || line.includes('.filter'))) {
                    lines[i] = checkLine.replace(`: string`, `: string[]`);
                    changes++;
                  } else if (checkLine.includes(`: number`) && (line.includes('.map') || line.includes('.filter'))) {
                    lines[i] = checkLine.replace(`: number`, `: number[]`);
                    changes++;
                  }
                }
                
                // Ensure array initialization
                if (checkLine.includes(`const ${varName} =`) || checkLine.includes(`let ${varName} =`)) {
                  if (!checkLine.includes('[') && !checkLine.includes('Array')) {
                    // Wrap non-array values in Array.isArray check
                    const arrayCheckLine = `Array.isArray(${varName}) ? ${varName} : []`;
                    if (line.includes(`.${varMatch[2]}`)) {
                      lines[error.line - 1] = line.replace(varName, `(${arrayCheckLine})`);
                      changes++;
                    }
                  }
                }
              }
            }
          }
          
          fixed = lines.join('\n');
        }
      }
    });

    return { fixed, changes };
  }

  fixEventHandlerTypes(content, errors) {
    let fixed = content;
    let changes = 0;

    errors.forEach(error => {
      if (error.code === 'TS2769' && (error.message.includes('MouseEvent') || error.message.includes('KeyboardEvent'))) {
        const lines = fixed.split('\n');
        if (error.line <= lines.length) {
          const line = lines[error.line - 1];
          
          // Fix addEventListener type issues
          if (line.includes('addEventListener')) {
            // Cast event handlers to EventListener
            lines[error.line - 1] = line.replace(
              /addEventListener\((['"])(\w+)\1,\s*([^,)]+)/,
              'addEventListener($1$2$1, $3 as EventListener'
            );
            changes++;
          }
          
          // Fix removeEventListener type issues
          if (line.includes('removeEventListener')) {
            lines[error.line - 1] = line.replace(
              /removeEventListener\((['"])(\w+)\1,\s*([^,)]+)/,
              'removeEventListener($1$2$1, $3 as EventListener'
            );
            changes++;
          }
        }
        
        fixed = lines.join('\n');
      }
    });

    return { fixed, changes };
  }

  fixTypeAssignmentErrors(content, errors) {
    let fixed = content;
    let changes = 0;

    errors.forEach(error => {
      if (error.code === 'TS2322' || error.code === 'TS2345') {
        const lines = fixed.split('\n');
        if (error.line <= lines.length) {
          const line = lines[error.line - 1];
          
          // Fix string[] assigned to string
          if (error.message.includes("Type 'string[]' is not assignable to type 'string'") ||
              error.message.includes("Type 'never[]' is not assignable to type 'string'")) {
            // Find the property and change its type
            const propMatch = line.match(/(\w+):\s*(['"`].*?['"`]|\[.*?\]|.*?)[,}]/);
            if (propMatch) {
              const propName = propMatch[1];
              // Look for the interface/type definition
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes(`${propName}: string`) && !lines[i].includes(`${propName}: string[]`)) {
                  lines[i] = lines[i].replace(`${propName}: string`, `${propName}: string[]`);
                  changes++;
                  break;
                }
              }
            }
          }
          
          // Fix number[] assigned to number
          if (error.message.includes("Type 'number[]' is not assignable to type 'number'")) {
            const propMatch = line.match(/(\w+):\s*\[.*?\]/);
            if (propMatch) {
              const propName = propMatch[1];
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes(`${propName}: number`) && !lines[i].includes(`${propName}: number[]`)) {
                  lines[i] = lines[i].replace(`${propName}: number`, `${propName}: number[]`);
                  changes++;
                  break;
                }
              }
            }
          }
        }
        
        fixed = lines.join('\n');
      }
    });

    return { fixed, changes };
  }

  async fixFile(filePath, errors) {
    try {
      if (!existsSync(filePath)) {
        return false;
      }

      const content = readFileSync(filePath, 'utf8');
      let fixed = content;
      let totalChanges = 0;

      // Filter errors for this file
      const fileErrors = errors.filter(e => {
        const normalizedErrorPath = e.file.replace(/\\/g, '/');
        const normalizedFilePath = filePath.replace(/\\/g, '/');
        return normalizedFilePath.endsWith(normalizedErrorPath) || normalizedErrorPath.endsWith(relative(projectRoot, filePath).replace(/\\/g, '/'));
      });

      if (fileErrors.length === 0) {
        return false;
      }

      // Apply fixes in order
      const fixFunctions = [
        this.fixUnusedImports,
        this.fixMissingImports,
        this.fixPropertyErrors,
        this.fixEventHandlerTypes,
        this.fixTypeAssignmentErrors
      ];

      for (const fixFunc of fixFunctions) {
        const result = fixFunc.call(this, fixed, fileErrors);
        if (result.changes > 0) {
          fixed = result.fixed;
          totalChanges += result.changes;
        }
      }

      if (totalChanges > 0) {
        writeFileSync(filePath, fixed, 'utf8');
        this.fixedFiles.set(filePath, totalChanges);
        this.totalChanges += totalChanges;
        
        const relativePath = relative(projectRoot, filePath);
        this.log(`Fixed ${relativePath} (${totalChanges} fixes, ${fileErrors.length} errors)`);
        return true;
      }
      
      return false;
    } catch (error) {
      this.log(`Error fixing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    this.log('🚀 Starting Comprehensive TypeScript Error Fix...');
    
    // Get current errors
    this.log('Analyzing current TypeScript errors...');
    const errors = this.getCurrentErrors();
    this.log(`Found ${errors.length} TypeScript errors to fix`);

    if (errors.length === 0) {
      this.log('✨ No TypeScript errors found!', 'success');
      return;
    }

    // Group errors by type
    const errorsByType = {};
    errors.forEach(error => {
      if (!errorsByType[error.code]) {
        errorsByType[error.code] = [];
      }
      errorsByType[error.code].push(error);
    });

    this.log('\n📊 Error breakdown:');
    Object.entries(errorsByType).forEach(([code, errs]) => {
      this.log(`  ${code}: ${errs.length} errors`);
    });

    // Get all TypeScript files
    const files = this.getAllTypeScriptFiles();
    this.log(`\nProcessing ${files.length} TypeScript files...`);
    
    let fixedCount = 0;
    
    for (const file of files) {
      const wasFixed = await this.fixFile(file, errors);
      if (wasFixed) fixedCount++;
    }
    
    // Run verification
    this.log('\n🔍 Running TypeScript verification...');
    const verificationErrors = this.getCurrentErrors();
    
    // Report results
    this.log('\n' + '='.repeat(60));
    this.log(`📊 Comprehensive TypeScript Fix Complete`);
    this.log(`✅ Files processed: ${files.length}`);
    this.log(`🔧 Files fixed: ${fixedCount}`);
    this.log(`🎯 Total changes made: ${this.totalChanges}`);
    this.log(`📉 Errors reduced: ${errors.length} → ${verificationErrors.length}`);
    
    if (verificationErrors.length === 0) {
      this.log('🎉 All TypeScript errors resolved!', 'success');
    } else {
      this.log(`⚠️ ${verificationErrors.length} errors remain (may need manual review)`, 'warning');
      
      // Show remaining error types
      const remainingByType = {};
      verificationErrors.forEach(error => {
        if (!remainingByType[error.code]) {
          remainingByType[error.code] = 0;
        }
        remainingByType[error.code]++;
      });
      
      this.log('\n📋 Remaining error types:');
      Object.entries(remainingByType).forEach(([code, count]) => {
        this.log(`  ${code}: ${count} errors`);
      });
    }
    
    if (this.fixedFiles.size > 0) {
      this.log('\n📋 Top fixed files:');
      const topFiles = Array.from(this.fixedFiles.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
        
      topFiles.forEach(([file, changes]) => {
        const relativePath = relative(projectRoot, file);
        console.log(`  • ${relativePath} (${changes} fixes)`);
      });
    }
    
    return {
      filesProcessed: files.length,
      filesFixed: fixedCount,
      totalChanges: this.totalChanges,
      initialErrors: errors.length,
      remainingErrors: verificationErrors.length
    };
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new ComprehensiveTypeScriptFixer();
  fixer.run().catch(err => {
    console.error('Comprehensive TypeScript fixer failed:', err);
    process.exitCode = 1;
  });
}

export { ComprehensiveTypeScriptFixer };
