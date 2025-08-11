#!/usr/bin/env node
/**
 * Common Type Error Fixer
 * Fixes the most common TypeScript errors found in the codebase
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

class CommonTypeErrorFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
    this.processedFiles = 0;
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
      info: '🔧',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type] || '🔧';
    
    console.log(`${colors[type]}${prefix} [${timestamp}] ${message}${colors.reset}`);
  }

  fixCommonTypeErrors(content) {
    let fixedContent = content;
    let fixes = 0;

    // Fix 1: Array variables declared as string type
    const arrayAsStringPatterns = [
      /const\s+(\w+):\s*string\s*=\s*\[\]/g,
      /let\s+(\w+):\s*string\s*=\s*\[\]/g,
      /private\s+(\w+):\s*string\s*=\s*\[\]/g,
      /public\s+(\w+):\s*string\s*=\s*\[\]/g,
      /(\w+):\s*string\s*=\s*\[\]/g
    ];

    arrayAsStringPatterns.forEach(pattern => {
      fixedContent = fixedContent.replace(pattern, (match, varName) => {
        fixes++;
        const prefix = match.substring(0, match.indexOf(varName));
        return `${prefix}${varName}: string[] = []`;
      });
    });

    // Fix 2: Array variables declared as other single types
    const arrayAsOtherTypePatterns = [
      /(\w+):\s*HTMLElement\s*=\s*\[\]/g,
      /(\w+):\s*SystemEvent\s*=\s*\[\]/g,
      /(\w+):\s*SecurityAlert\s*=\s*\[\]/g,
      /(\w+):\s*ComplianceCheck\s*=\s*\[\]/g,
      /(\w+):\s*SecurityThreat\s*=\s*\[\]/g,
      /(\w+):\s*VulnerabilityReport\s*=\s*\[\]/g
    ];

    arrayAsOtherTypePatterns.forEach(pattern => {
      fixedContent = fixedContent.replace(pattern, (match, varName) => {
        fixes++;
        const typeName = match.match(/:\s*(\w+)\s*=/)[1];
        const prefix = match.substring(0, match.indexOf(varName));
        return `${prefix}${varName}: ${typeName}[] = []`;
      });
    });

    // Fix 3: Rest parameter types
    const restParamPatterns = [
      /\(\.\.\.(args):\s*unknown\)/g,
      /<T extends \(\.\.\.(args):\s*unknown\) => unknown>/g,
      /Array<\(\.\.\.(args):\s*unknown\) => void>/g
    ];

    restParamPatterns.forEach(pattern => {
      fixedContent = fixedContent.replace(pattern, (match, paramName) => {
        fixes++;
        return match.replace(`: unknown)`, `: unknown[])`);
      });
    });

    // Fix 4: Generic array constraints
    fixedContent = fixedContent.replace(
      /<T>\(array:\s*T,\s*key\?\:\s*keyof\s*T\):\s*T\[\]/g,
      (match) => {
        fixes++;
        return '<T extends any[]>(array: T, key?: keyof T[0]): T';
      }
    );

    // Fix 5: Missing array type annotations in function returns
    fixedContent = fixedContent.replace(
      /(\w+):\s*(SystemEvent|SecurityAlert|ComplianceCheck|SecurityThreat|VulnerabilityReport);/g,
      (match, propName, typeName) => {
        if (propName.includes('events') || propName.includes('alerts') || propName.includes('threats') || 
            propName.includes('vulnerabilities') || propName.includes('compliance') || propName.includes('recommendations')) {
          fixes++;
          return `${propName}: ${typeName}[];`;
        }
        return match;
      }
    );

    // Fix 6: Event type conflicts (DOM Event vs custom Event)
    fixedContent = fixedContent.replace(
      /filter\(\(event:\s*Event\)\s*=>/g,
      (match) => {
        fixes++;
        return 'filter((event: SystemEvent) =>';
      }
    );

    // Fix 7: Missing type annotations for object properties
    fixedContent = fixedContent.replace(
      /\[(\w+):\s*string\];/g,
      (match, paramName) => {
        fixes++;
        return `[${paramName}: string]: any;`;
      }
    );

    // Fix 8: Unused parameter warnings by prefixing with underscore
    const unusedParamMatches = content.match(/'(\w+)' is declared but its value is never read\./g);
    if (unusedParamMatches) {
      unusedParamMatches.forEach(match => {
        const paramName = match.match(/'(\w+)'/)[1];
        const paramPattern = new RegExp(`\\b${paramName}\\b(?=\\s*[,\\)])`, 'g');
        fixedContent = fixedContent.replace(paramPattern, `_${paramName}`);
        fixes++;
      });
    }

    // Fix 9: Missing data property type
    fixedContent = fixedContent.replace(
      /^\s*data;$/gm,
      (match) => {
        fixes++;
        return '  data: any;';
      }
    );

    // Fix 10: Missing key property type
    fixedContent = fixedContent.replace(
      /^\s*\[key\]:\s*unknown;$/gm,
      (match) => {
        fixes++;
        return '  [key: string]: unknown;';
      }
    );

    // Fix 11: Array method calls on string types
    const arrayMethodsOnString = [
      /(\w+)\.push\(/g,
      /(\w+)\.filter\(/g,
      /(\w+)\.map\(/g,
      /(\w+)\.forEach\(/g,
      /(\w+)\.slice\(/g,
      /(\w+)\.join\(/g
    ];

    // This is more complex - we need to check if the variable is declared as string but used as array
    // For now, let's fix the obvious cases where we know the variable should be an array

    // Fix 12: Remove duplicate imports (ReactNode that's unused)
    fixedContent = fixedContent.replace(
      /import\s+type\s+\{\s*ReactElement,\s*ReactNode\s*\}\s+from\s+['"]react['"];/g,
      (match) => {
        if (content.includes("'ReactNode' is declared but never used")) {
          fixes++;
          return "import type { ReactElement } from 'react';";
        }
        return match;
      }
    );

    // Fix 13: Generic type constraints for array operations
    fixedContent = fixedContent.replace(
      /unique:\s*<T>\(array:\s*T,\s*key\?\:\s*keyof\s*T\):\s*T\[\]/g,
      (match) => {
        fixes++;
        return 'unique: <T extends any[]>(array: T, key?: keyof T[0]): T';
      }
    );

    // Fix 14: Function parameter type issues
    fixedContent = fixedContent.replace(
      /\(\{\s*children\s*\}\)\s*=>/g,
      (match) => {
        fixes++;
        return '({ children }: { children: React.ReactNode }) =>';
      }
    );

    return { content: fixedContent, fixes };
  }

  async processFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const result = this.fixCommonTypeErrors(content);
      
      if (result.fixes > 0) {
        writeFileSync(filePath, result.content);
        this.fixedFiles++;
        this.totalFixes += result.fixes;
        this.log(`Fixed ${result.fixes} common type errors in ${filePath}`);
      }
      
      this.processedFiles++;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
    }
  }

  async findAndProcessFiles(dir) {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stats = statSync(fullPath);
      
      if (stats.isDirectory()) {
        // Skip certain directories
        if (['node_modules', '.git', 'dist', 'build', 'coverage'].includes(entry)) {
          continue;
        }
        await this.findAndProcessFiles(fullPath);
      } else if (stats.isFile() && (entry.endsWith('.tsx') || entry.endsWith('.ts'))) {
        await this.processFile(fullPath);
      }
    }
  }

  async run() {
    this.log('🚀 Starting common type error fixes...');
    
    const startTime = Date.now();
    await this.findAndProcessFiles(process.cwd());
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    this.log('\n' + '='.repeat(60));
    this.log('📊 COMMON TYPE ERROR FIXING REPORT');
    this.log('='.repeat(60));
    this.log(`⏱️  Duration: ${duration} seconds`);
    this.log(`📁 Files processed: ${this.processedFiles}`);
    this.log(`🔧 Files fixed: ${this.fixedFiles}`);
    this.log(`✨ Total fixes applied: ${this.totalFixes}`);
    
    if (this.totalFixes > 0) {
      this.log(`🎉 Successfully fixed ${this.totalFixes} common type errors!`, 'success');
    } else {
      this.log('ℹ️  No common type errors found.', 'info');
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new CommonTypeErrorFixer();
  fixer.run().catch(err => {
    console.error('CommonTypeErrorFixer failed:', err);
    process.exitCode = 1;
  });
}

export { CommonTypeErrorFixer };
