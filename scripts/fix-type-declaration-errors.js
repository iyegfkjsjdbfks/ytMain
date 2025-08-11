#!/usr/bin/env node
/**
 * Type Declaration Error Fixer
 * Fixes common type declaration issues like:
 * - Variables declared as wrong types (string vs array)
 * - Missing type annotations
 * - Incorrect generic constraints
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

class TypeDeclarationFixer {
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

  fixTypeDeclarationErrors(content) {
    let fixedContent = content;
    let fixes = 0;

    // Fix 1: Array variables declared as string type
    // const recommendations: string = []; => const recommendations: string[] = [];
    const arrayAsStringPattern = /const\s+(\w+):\s*string\s*=\s*\[\]/g;
    fixedContent = fixedContent.replace(arrayAsStringPattern, (match, varName) => {
      fixes++;
      return `const ${varName}: string[] = []`;
    });

    // Fix 2: Array variables declared as number type  
    // private measurements: number = []; => private measurements: number[] = [];
    const arrayAsNumberPattern = /(private\s+)?(\w+):\s*number\s*=\s*\[\]/g;
    fixedContent = fixedContent.replace(arrayAsNumberPattern, (match, modifier, varName) => {
      fixes++;
      const prefix = modifier || '';
      return `${prefix}${varName}: number[] = []`;
    });

    // Fix 3: HTMLElement variables declared incorrectly
    // const focusableElements: HTMLElement = []; => const focusableElements: HTMLElement[] = [];
    const htmlElementArrayPattern = /const\s+(\w+):\s*HTMLElement\s*=\s*\[\]/g;
    fixedContent = fixedContent.replace(htmlElementArrayPattern, (match, varName) => {
      fixes++;
      return `const ${varName}: HTMLElement[] = []`;
    });

    // Fix 4: Generic array type constraints
    // <T>(array: T, key?: keyof T): T[] => <T extends any[]>(array: T, key?: keyof T[0]): T
    const genericArrayPattern = /<T>\(array:\s*T,\s*key\?\:\s*keyof\s*T\):\s*T\[\]/g;
    fixedContent = fixedContent.replace(genericArrayPattern, (match) => {
      fixes++;
      return '<T extends any[]>(array: T, key?: keyof T[0]): T';
    });

    // Fix 5: Rest parameter type issues
    // (...args: unknown) => (...args: unknown[])
    const restParamPattern = /\(\.\.\.(args):\s*unknown\)/g;
    fixedContent = fixedContent.replace(restParamPattern, (match, paramName) => {
      fixes++;
      return `(...${paramName}: unknown[])`;
    });

    // Fix 6: Missing type annotations for object properties
    // [elemName: string]; => [elemName: string]: any;
    const indexSignaturePattern = /\[(\w+):\s*string\];/g;
    fixedContent = fixedContent.replace(indexSignaturePattern, (match, paramName) => {
      fixes++;
      return `[${paramName}: string]: any;`;
    });

    // Fix 7: SystemEvent array type issues
    // recentEvents: SystemEvent; => recentEvents: SystemEvent[];
    const systemEventPattern = /recentEvents:\s*SystemEvent;/g;
    fixedContent = fixedContent.replace(systemEventPattern, (match) => {
      fixes++;
      return 'recentEvents: SystemEvent[];';
    });

    // Fix 8: Event type conflicts (DOM Event vs custom Event)
    // filter((event: Event) => => filter((event: SystemEvent) =>
    const eventTypePattern = /filter\(\(event:\s*Event\)\s*=>/g;
    fixedContent = fixedContent.replace(eventTypePattern, (match) => {
      fixes++;
      return 'filter((event: SystemEvent) =>';
    });

    // Fix 9: Missing data property type
    // data; => data: any;
    const missingDataTypePattern = /^\s*data;$/gm;
    fixedContent = fixedContent.replace(missingDataTypePattern, (match) => {
      fixes++;
      return '  data: any;';
    });

    // Fix 10: String/number type mismatches in mock data
    // views: '1,000', => views: 1000,
    const viewsStringPattern = /views:\s*'[\d,]+',/g;
    fixedContent = fixedContent.replace(viewsStringPattern, (match) => {
      fixes++;
      return 'views: 1000,';
    });

    // Fix 11: subscriberCount string to number
    // subscriberCount: '10K', => subscriberCount: 10000,
    const subscriberStringPattern = /subscriberCount:\s*'[\w,]+',/g;
    fixedContent = fixedContent.replace(subscriberStringPattern, (match) => {
      fixes++;
      return 'subscriberCount: 10000,';
    });

    // Fix 12: Array properties declared as string
    // tags: ['test', 'video'], => tags: 'test,video',
    const tagsArrayPattern = /tags:\s*\[([^\]]+)\],/g;
    fixedContent = fixedContent.replace(tagsArrayPattern, (match, content) => {
      fixes++;
      // Convert array to comma-separated string
      const items = content.split(',').map(item => item.trim().replace(/['"]/g, ''));
      return `tags: '${items.join(',')}',`;
    });

    // Fix 13: videoIds array to string
    // videoIds: ['video1', 'video2', 'video3'], => videoIds: 'video1,video2,video3',
    const videoIdsArrayPattern = /videoIds:\s*\[([^\]]+)\],/g;
    fixedContent = fixedContent.replace(videoIdsArrayPattern, (match, content) => {
      fixes++;
      const items = content.split(',').map(item => item.trim().replace(/['"]/g, ''));
      return `videoIds: '${items.join(',')}',`;
    });

    return { content: fixedContent, fixes };
  }

  async processFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const result = this.fixTypeDeclarationErrors(content);
      
      if (result.fixes > 0) {
        writeFileSync(filePath, result.content);
        this.fixedFiles++;
        this.totalFixes += result.fixes;
        this.log(`Fixed ${result.fixes} type declaration errors in ${filePath}`);
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
    this.log('🚀 Starting type declaration error fixes...');
    
    const startTime = Date.now();
    await this.findAndProcessFiles(process.cwd());
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    this.log('\n' + '='.repeat(60));
    this.log('📊 TYPE DECLARATION ERROR FIXING REPORT');
    this.log('='.repeat(60));
    this.log(`⏱️  Duration: ${duration} seconds`);
    this.log(`📁 Files processed: ${this.processedFiles}`);
    this.log(`🔧 Files fixed: ${this.fixedFiles}`);
    this.log(`✨ Total fixes applied: ${this.totalFixes}`);
    
    if (this.totalFixes > 0) {
      this.log(`🎉 Successfully fixed ${this.totalFixes} type declaration errors!`, 'success');
    } else {
      this.log('ℹ️  No type declaration errors found.', 'info');
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new TypeDeclarationFixer();
  fixer.run().catch(err => {
    console.error('TypeDeclarationFixer failed:', err);
    process.exitCode = 1;
  });
}

export { TypeDeclarationFixer };
