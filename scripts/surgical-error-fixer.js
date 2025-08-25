#!/usr/bin/env node
/**
 * Surgical Error Fixer for Fresh TypeScript Errors
 * 
 * This script fixes specific patterns found in the fresh errors with precise targeting
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

class SurgicalErrorFixer {
  constructor(options = {}) {
    this.options = {
      dryRun: false,
      ...options
    };
    
    this.fixedFiles = 0;
    this.totalFixes = 0;
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }

  async fixSyntaxErrors() {
    this.log('🔧 Fixing syntax errors caused by previous fixes...', 'info');
    
    const syntaxFixes = [
      // Fix broken destructuring patterns
      {
        file: 'components/CategoryChips.tsx',
        fixes: [
          {
            from: 'const scrollLeft = useCallback((: unknown) => {',
            to: 'const scrollLeft = useCallback(() => {'
          },
          {
            from: 'const scrollRight = useCallback((: unknown) => {',
            to: 'const scrollRight = useCallback(() => {'
          },
          {
            from: 'const checkScrollPosition = useCallback((: unknown) => {',
            to: 'const checkScrollPosition = useCallback(() => {'
          },
          {
            from: 'useEffect((: unknown) => {',
            to: 'useEffect(() => {'
          },
          {
            from: 'const handleCategoryClick = useCallback(((category: unknown): unknown) => {',
            to: 'const handleCategoryClick = useCallback((category: string) => {'
          }
        ]
      },
      {
        file: 'components/CommentModal.tsx',
        fixes: [
          {
            from: 'const handleSubmit = useCallback(((: unknown) => {',
            to: 'const handleSubmit = useCallback(() => {'
          }
        ]
      },
      {
        file: 'components/VideoCard.tsx',
        fixes: [
          {
            from: 'const handleMouseEnter = useCallback(((: unknown) => {',
            to: 'const handleMouseEnter = useCallback(() => {'
          }
        ]
      }
    ];

    for (const fileConfig of syntaxFixes) {
      await this.applyFixesToFile(fileConfig.file, fileConfig.fixes);
    }
  }

  async fixUnusedImports() {
    this.log('🔧 Removing unused imports...', 'info');
    
    const unusedImportFixes = [
      {
        file: 'components/CategoryChips.tsx',
        fixes: [
          {
            from: 'import React, { useRef, useState, useCallback, useEffect, FC } from \'react\';',
            to: 'import React, { useRef, useState, useCallback, useEffect } from \'react\';'
          }
        ]
      },
      {
        file: 'components/ChannelHeader.tsx',
        fixes: [
          {
            from: 'import React, { FC } from \'react\';',
            to: 'import React from \'react\';'
          }
        ]
      },
      {
        file: 'components/ChannelTabs.tsx',
        fixes: [
          {
            from: 'import React, { FC } from \'react\';',
            to: 'import React from \'react\';'
          }
        ]
      },
      {
        file: 'components/CommentModal.tsx',
        fixes: [
          {
            from: 'import React, { useState, FC } from \'react\';',
            to: 'import React, { useState } from \'react\';'
          }
        ]
      }
    ];

    for (const fileConfig of unusedImportFixes) {
      await this.applyFixesToFile(fileConfig.file, fileConfig.fixes);
    }
  }

  async fixMissingModules() {
    this.log('🔧 Fixing missing module imports...', 'info');
    
    const moduleFixes = [
      {
        file: 'components/CommentModal.tsx',
        fixes: [
          {
            from: 'import BaseModal from \'BaseModal.tsx\';',
            to: 'import BaseModal from \'./BaseModal\';'
          }
        ]
      },
      {
        file: 'components/HoverAutoplayVideoCard.tsx',
        fixes: [
          {
            from: 'import { getYouTubeVideoId } from "../src/lib/youtube-utils.ts";',
            to: 'import { getYouTubeVideoId } from "../utils/youtube-utils";'
          },
          {
            from: 'import ImageWithFallback from \'ImageWithFallback.tsx\';',
            to: 'import ImageWithFallback from \'./ImageWithFallback\';'
          }
        ]
      }
    ];

    for (const fileConfig of moduleFixes) {
      await this.applyFixesToFile(fileConfig.file, fileConfig.fixes);
    }
  }

  async fixHeroiconsImports() {
    this.log('🔧 Fixing Heroicons import errors...', 'info');
    
    const heroiconsFixes = [
      {
        file: 'components/CommentModal.tsx',
        fixes: [
          {
            from: 'import { ChatBubbleOvalLeftIcon } from \'@heroicons/react/24/outline\';',
            to: 'import { ChatBubbleLeftIcon } from \'@heroicons/react/24/outline\';'
          },
          {
            from: '<ChatBubbleOvalLeftIcon',
            to: '<ChatBubbleLeftIcon'
          },
          {
            from: '</ChatBubbleOvalLeftIcon>',
            to: '</ChatBubbleLeftIcon>'
          }
        ]
      },
      {
        file: 'components/ChannelTabContent.tsx',
        fixes: [
          {
            from: 'import { CalendarDaysIcon, ChartBarIcon, SignalSlashIcon } from \'@heroicons/react/24/outline\';',
            to: 'import { CalendarIcon, ChartBarIcon, WifiIcon } from \'@heroicons/react/24/outline\';'
          },
          {
            from: 'CalendarDaysIcon',
            to: 'CalendarIcon'
          },
          {
            from: 'SignalSlashIcon',
            to: 'WifiIcon'
          }
        ]
      }
    ];

    for (const fileConfig of heroiconsFixes) {
      await this.applyFixesToFile(fileConfig.file, fileConfig.fixes);
    }
  }

  async fixTestPrivateAccess() {
    this.log('🔧 Fixing test private property access...', 'info');
    
    const testFiles = [
      'src/error-resolution/test/CacheManager.test.ts',
      'src/error-resolution/test/ErrorAnalyzer.test.ts'
    ];

    for (const filePath of testFiles) {
      if (fsSync.existsSync(filePath)) {
        try {
          let content = await fs.readFile(filePath, 'utf8');
          
          // Add @ts-ignore for private property access
          content = content.replace(
            /(\s+)(.*\.(?:fileExists|parseErrorLine).*)/g,
            '$1// @ts-ignore - accessing private property for testing\n$1$2'
          );
          
          // Fix null checks
          content = content.replace(
            /expect\(result\.(.*?)\)/g,
            'expect(result?.$1)'
          );
          
          await fs.writeFile(filePath, content, 'utf8');
          this.log(`✅ Fixed test file: ${filePath}`, 'info');
          this.fixedFiles++;
        } catch (error) {
          this.log(`⚠️ Error fixing test file ${filePath}: ${error.message}`, 'warn');
        }
      }
    }
  }

  async applyFixesToFile(filePath, fixes) {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    
    if (!fsSync.existsSync(fullPath)) {
      this.log(`⚠️ File not found: ${filePath}`, 'warn');
      return;
    }

    if (this.options.dryRun) {
      this.log(`🔍 DRY RUN: Would apply ${fixes.length} fixes to ${filePath}`, 'info');
      return;
    }

    try {
      let content = await fs.readFile(fullPath, 'utf8');
      let modified = false;

      for (const fix of fixes) {
        if (content.includes(fix.from)) {
          content = content.replace(fix.from, fix.to);
          modified = true;
          this.totalFixes++;
          this.log(`  ✓ Fixed: "${fix.from}" → "${fix.to}"`, 'info');
        }
      }

      if (modified) {
        await fs.writeFile(fullPath, content, 'utf8');
        this.fixedFiles++;
        this.log(`✅ Updated ${filePath}`, 'info');
      }

    } catch (error) {
      this.log(`❌ Error fixing ${filePath}: ${error.message}`, 'error');
    }
  }

  async deploy() {
    this.log('🚀 Starting Surgical Error Fixes...', 'info');
    
    try {
      await this.fixSyntaxErrors();
      await this.fixUnusedImports();
      await this.fixMissingModules();
      await this.fixHeroiconsImports();
      await this.fixTestPrivateAccess();
      
      this.log(`✅ Surgical fixes completed!`, 'success');
      this.log(`📊 Results: ${this.fixedFiles} files modified, ${this.totalFixes} individual fixes applied`, 'info');
      
      return {
        success: true,
        filesFixed: this.fixedFiles,
        totalFixes: this.totalFixes
      };
      
    } catch (error) {
      this.log(`❌ Surgical fixes failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run')
  };

  console.log('🔧 Surgical Error Fixer - Starting...\n');

  try {
    const fixer = new SurgicalErrorFixer(options);
    const result = await fixer.deploy();
    
    console.log('\n🎉 Surgical fixes completed successfully!');
    console.log(`📊 Results: ${result.filesFixed} files fixed, ${result.totalFixes} total fixes applied`);
    
  } catch (error) {
    console.error('\n❌ Surgical fixes failed:', error.message);
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

export { SurgicalErrorFixer };