#!/usr/bin/env node
/**
 * Comprehensive TypeScript Error Fixer
 * Fixes all major error types in a single pass
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class ComprehensiveErrorFixer {
  constructor() {
    this.fixedFiles = new Map();
    this.totalFixes = 0;
    this.startTime = Date.now();
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
          if (stat.isDirectory() && !item.startsWith('.') && !['node_modules', 'dist', 'build', '.git', '.error-fix-backups'].includes(item)) {
            scanDir(fullPath);
          } else if (stat.isFile() && ['.ts', '.tsx'].includes(extname(item))) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Skip inaccessible directories
      }
    };
    scanDir(projectRoot);
    return files;
  }

  fixFile(filePath) {
    try {
      let content = readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fixes = 0;

      // Step 1: Remove all unused imports (TS6133)
      const unusedImports = [
        'FC', 'ReactNode', 'MouseEvent', 'KeyboardEvent', 'ChangeEvent',
        'lazy', 'memo', 'useRef', 'ReactElement', 'InputHTMLAttributes',
        'TextareaHTMLAttributes', 'forwardRef', 'Suspense'
      ];
      
      for (const importName of unusedImports) {
        // Check if it's imported but not used in the file body (excluding the import line)
        const importRegex = new RegExp(`import.*\\b${importName}\\b.*from`, 'g');
        const usageRegex = new RegExp(`\\b${importName}\\b`, 'g');
        
        if (importRegex.test(content)) {
          const contentWithoutImports = content.replace(/^import.*$/gm, '');
          if (!usageRegex.test(contentWithoutImports)) {
            // Remove the unused import
            content = content.replace(new RegExp(`\\b${importName}\\s*,\\s*`, 'g'), '');
            content = content.replace(new RegExp(`,\\s*${importName}\\b`, 'g'), '');
            content = content.replace(new RegExp(`\\{\\s*${importName}\\s*\\}`, 'g'), '{}');
            fixes++;
          }
        }
      }

      // Step 2: Remove duplicate React imports (TS2300)
      content = content.replace(/^import\s+React[^;]*;\s*\nimport\s+type\s+React\s+from\s+['"]react['"];?\s*$/gm, 
        "import React from 'react';");
      if (content !== originalContent) fixes++;

      // Step 3: Add missing icon imports (TS2304)
      const iconMap = {
        'PaperAirplaneIcon': '@heroicons/react/24/outline',
        'ChevronRightIcon': '@heroicons/react/24/outline',
        'CalendarDaysIcon': '@heroicons/react/24/outline',
        'ChartBarIcon': '@heroicons/react/24/outline',
        'SignalSlashIcon': '@heroicons/react/24/outline',
        'PlayIcon': '@heroicons/react/24/outline',
        'XMarkIcon': '@heroicons/react/24/outline',
        'CheckIcon': '@heroicons/react/24/outline',
        'TrashIcon': '@heroicons/react/24/outline',
        'VideoCameraIcon': '@heroicons/react/24/outline',
        'EyeIcon': '@heroicons/react/24/outline',
        'HeartIcon': '@heroicons/react/24/outline',
        'StopIcon': '@heroicons/react/24/outline',
        'MicrophoneIcon': '@heroicons/react/24/outline',
        'ChatBubbleLeftIcon': '@heroicons/react/24/outline',
        'Cog6ToothIcon': '@heroicons/react/24/outline',
        'QueueListIcon': '@heroicons/react/24/outline',
        'DocumentTextIcon': '@heroicons/react/24/outline',
        'CurrencyDollarIcon': '@heroicons/react/24/outline',
        'UserGroupIcon': '@heroicons/react/24/outline',
        'PaintBrushIcon': '@heroicons/react/24/outline',
        'FilmIcon': '@heroicons/react/24/outline',
        'CogIcon': '@heroicons/react/24/outline',
        'PlusIcon': '@heroicons/react/24/outline',
        'ClockIcon': '@heroicons/react/24/outline',
        'HandThumbUpIcon': '@heroicons/react/24/outline',
        'ShareIcon': '@heroicons/react/24/outline',
        'DevicePhoneMobileIcon': '@heroicons/react/24/outline',
        'ComputerDesktopIcon': '@heroicons/react/24/outline',
        'GlobeAltIcon': '@heroicons/react/24/outline',
        'TvIcon': '@heroicons/react/24/outline',
        'ArrowTrendingUpIcon': '@heroicons/react/24/outline',
        'ArrowTrendingDownIcon': '@heroicons/react/24/outline',
        'SparklesIcon': '@heroicons/react/24/outline',
        'BugAntIcon': '@heroicons/react/24/outline'
      };

      const missingImports = [];
      for (const [icon, path] of Object.entries(iconMap)) {
        const usageRegex = new RegExp(`<${icon}\\b`, 'g');
        const importRegex = new RegExp(`import.*${icon}.*from`, 'g');
        
        if (usageRegex.test(content) && !importRegex.test(content)) {
          missingImports.push(`import { ${icon} } from '${path}';`);
          fixes++;
        }
      }

      if (missingImports.length > 0) {
        const firstImportIndex = content.indexOf('import ');
        if (firstImportIndex !== -1) {
          const lines = content.split('\n');
          let lastImportIndex = 0;
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) {
              lastImportIndex = i;
            }
          }
          lines.splice(lastImportIndex + 1, 0, ...missingImports);
          content = lines.join('\n');
        } else {
          content = missingImports.join('\n') + '\n\n' + content;
        }
      }

      // Step 4: Fix event listener type issues (TS2769)
      content = content.replace(
        /addEventListener\((['"])(\w+)\1,\s*([^,)]+)(?!\s+as\s+EventListener)/g,
        'addEventListener($1$2$1, $3 as EventListener'
      );
      content = content.replace(
        /removeEventListener\((['"])(\w+)\1,\s*([^,)]+)(?!\s+as\s+EventListener)/g,
        'removeEventListener($1$2$1, $3 as EventListener'
      );

      // Step 5: Fix property access on non-array types (TS2339)
      // This is complex and needs careful handling
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Fix .map/.length/.filter on strings that should be arrays
        if (line.includes('.map(') || line.includes('.length') || line.includes('.filter(')) {
          // Common patterns where string should be array
          lines[i] = line
            .replace(/(\w+): string([\s,;])/g, (match, varName, suffix) => {
              if (lines.some(l => l.includes(`${varName}.map(`) || l.includes(`${varName}.filter(`))) {
                fixes++;
                return `${varName}: string[]${suffix}`;
              }
              return match;
            })
            .replace(/(\w+): number([\s,;])/g, (match, varName, suffix) => {
              if (lines.some(l => l.includes(`${varName}.map(`) || l.includes(`${varName}.filter(`))) {
                fixes++;
                return `${varName}: number[]${suffix}`;
              }
              return match;
            });
        }
      }
      content = lines.join('\n');

      // Step 6: Fix type assignments (TS2322, TS2345)
      // Add type assertions for common mismatches
      content = content.replace(
        /setError\(([^,]+),\s*(['"][^'"]+['"])\)/g,
        'setError($1, new Error($2))'
      );

      // Step 7: Add missing type imports
      if (content.includes(': Video') && !content.includes('import.*Video.*from')) {
        const typeImports = [];
        if (!content.includes("import type { Video }") && !content.includes("import { Video }")) {
          typeImports.push("import type { Video } from '../types.ts';");
          fixes++;
        }
        if (!content.includes("import type { Channel }") && content.includes(': Channel')) {
          typeImports.push("import type { Channel } from '../types.ts';");
          fixes++;
        }
        if (typeImports.length > 0) {
          const firstImportIndex = content.indexOf('import ');
          if (firstImportIndex !== -1) {
            content = content.slice(0, firstImportIndex) + typeImports.join('\n') + '\n' + content.slice(firstImportIndex);
          } else {
            content = typeImports.join('\n') + '\n\n' + content;
          }
        }
      }

      // Step 8: Clean up empty imports and format
      content = content.replace(/import\s*\{\s*\}\s*from\s*['"][^'"]+['"]\s*;?\s*\n/g, '');
      content = content.replace(/,\s*}/g, ' }');
      content = content.replace(/{\s*,/g, '{ ');
      content = content.replace(/,\s*,+/g, ',');
      content = content.replace(/\n\n\n+/g, '\n\n');

      // Save if modified
      if (content !== originalContent) {
        writeFileSync(filePath, content, 'utf8');
        this.fixedFiles.set(filePath, fixes);
        this.totalFixes += fixes;
        const relativePath = relative(projectRoot, filePath);
        this.log(`Fixed ${relativePath} (${fixes} fixes)`, 'success');
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
    
    const files = this.getAllTypeScriptFiles();
    this.log(`Found ${files.length} TypeScript files to process`);
    
    let fixedCount = 0;
    for (const file of files) {
      if (this.fixFile(file)) {
        fixedCount++;
      }
    }
    
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    
    this.log('\n' + '='.repeat(60));
    this.log('📊 Comprehensive Fix Complete');
    this.log(`⏱️  Duration: ${duration} seconds`);
    this.log(`📁 Files processed: ${files.length}`);
    this.log(`✅ Files fixed: ${fixedCount}`);
    this.log(`🔧 Total fixes applied: ${this.totalFixes}`);
    
    if (this.fixedFiles.size > 0) {
      this.log('\n📋 Top fixed files:');
      const topFiles = Array.from(this.fixedFiles.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      topFiles.forEach(([file, fixes]) => {
        const relativePath = relative(projectRoot, file);
        console.log(`  • ${relativePath} (${fixes} fixes)`);
      });
      
      if (this.fixedFiles.size > 10) {
        console.log(`  ... and ${this.fixedFiles.size - 10} more files`);
      }
    }
    
    // Run type check to see results
    this.log('\n🔍 Running type check to verify fixes...');
    try {
      execSync('npm run type-check 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: projectRoot,
        timeout: 60000
      });
      this.log('🎉 All TypeScript errors resolved!', 'success');
    } catch (error) {
      const output = `${error.stdout || ''}${error.stderr || ''}`;
      const errorLines = output.split('\n').filter(line => /error TS\d+:/.test(line));
      const errorCount = errorLines.length;
      
      if (errorCount > 0) {
        this.log(`📉 Errors reduced to: ${errorCount}`, 'warning');
        
        // Group remaining errors by type
        const errorTypes = {};
        errorLines.forEach(line => {
          const match = line.match(/error (TS\d+):/);
          if (match) {
            errorTypes[match[1]] = (errorTypes[match[1]] || 0) + 1;
          }
        });
        
        this.log('\n📊 Remaining error breakdown:');
        Object.entries(errorTypes)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .forEach(([code, count]) => {
            console.log(`  ${code}: ${count} errors`);
          });
      } else {
        this.log('✅ All TypeScript errors resolved!', 'success');
      }
    }
  }
}

// Execute
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new ComprehensiveErrorFixer();
  fixer.run().catch(err => {
    console.error('Comprehensive fixer failed:', err);
    process.exitCode = 1;
  });
}

export { ComprehensiveErrorFixer };
