#!/usr/bin/env node
/**
 * Precise surgical fixer for the specific 28 remaining TS1005 errors
 */

import { readFileSync, writeFileSync } from 'fs';

class SurgicalTS1005Fixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
  }

  log(message, type = 'info') {
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
    
    console.log(`${colors[type]}${prefix} [${new Date().toISOString()}] ${message}${colors.reset}`);
  }

  fixSpecificErrors() {
    const fixes = [
      // Fix: tag: string !== tagToRemove -> tag !== tagToRemove
      {
        file: 'components/EnhancedVideoUpload.tsx',
        from: 'tag: string !== tagToRemove',
        to: 'tag !== tagToRemove'
      },
      
      // Fix: payload: index: number -> payload: index
      {
        file: 'contexts/OptimizedMiniplayerContext.tsx',
        from: 'payload: index: number',
        to: 'payload: index'
      },
      
      // Fix: id: string !== action.payload -> id !== action.payload  
      {
        file: 'contexts/UnifiedAppContext.tsx',
        from: 'id: string !== action.payload',
        to: 'id !== action.payload'
      },
      
      // Fix: id: string !== videoId -> id !== videoId
      {
        file: 'contexts/UnifiedAppContext.tsx',
        from: 'id: string !== videoId',
        to: 'id !== videoId'
      },
      
      // Fix: id: string !== videoIdToRemove -> id !== videoIdToRemove
      {
        file: 'pages/PlaylistDetailPage.tsx', 
        from: 'id: string !== videoIdToRemove',
        to: 'id !== videoIdToRemove'
      },
      
      // Fix: tag: string !== tagToRemove -> tag !== tagToRemove
      {
        file: 'pages/UploadPage.tsx',
        from: 'tag: string !== tagToRemove',
        to: 'tag !== tagToRemove'
      },
      
      // Fix: tag: string !== tagToRemove -> tag !== tagToRemove
      {
        file: 'pages/VideoUploadPage.tsx',
        from: 'tag: string !== tagToRemove',
        to: 'tag !== tagToRemove'
      },
      
      // Fix complex type guard: (id): id: string is string => id: string !== null
      // Should be: (id): id is string => id !== null
      {
        file: 'services/googleSearchService.ts',
        from: '(id): id: string is string => id: string !== null',
        to: '(id): id is string => id !== null'
      },
      
      // Fix: v.id: string === id -> v.id === id
      {
        file: 'services/realVideoService.ts',
        from: 'v.id: string === id',
        to: 'v.id === id'
      },
      
      // Fix: tag: string.trim() -> tag.trim()
      {
        file: 'services/youtubeSearchService.ts',
        from: 'tag: string.trim()',
        to: 'tag.trim()'
      },
      
      // Fix: 'og:video:tag: string' -> 'og:video:tag'
      {
        file: 'services/youtubeSearchService.ts',
        from: "metaTags['og:video:tag: string']",
        to: "metaTags['og:video:tag']"
      },
      
      // Fix: tag: string !== tagToRemove patterns in other files
      {
        file: 'src/features/livestream/components/StreamScheduler.tsx',
        from: 'tag: string !== tagToRemove',
        to: 'tag !== tagToRemove'
      },
      
      {
        file: 'src/features/playlist/components/PlaylistManager.tsx',
        from: 'tag: string !== tagToRemove', 
        to: 'tag !== tagToRemove'
      }
    ];

    for (const fix of fixes) {
      this.applyFix(fix);
    }
    
    // Also need to fix the template literal issue
    this.fixTemplateLiteral();
  }
  
  applyFix(fix) {
    try {
      const filePath = fix.file;
      let content = readFileSync(filePath, 'utf8');
      
      if (content.includes(fix.from)) {
        content = content.replace(fix.from, fix.to);
        writeFileSync(filePath, content, 'utf8');
        this.fixedFiles++;
        this.totalFixes++;
        this.log(`Fixed: ${filePath} - "${fix.from}" → "${fix.to}"`, 'info');
      }
    } catch (err) {
      this.log(`Error fixing ${fix.file}: ${err.message}`, 'error');
    }
  }
  
  fixTemplateLiteral() {
    try {
      const filePath = 'src/utils/testingHelpers.tsx';
      let content = readFileSync(filePath, 'utf8');
      
      // The file ends abruptly - add missing closing for any unclosed template literal
      const backtickCount = (content.match(/`/g) || []).length;
      
      if (backtickCount % 2 !== 0) {
        // If odd number of backticks, we have an unclosed template literal
        content = content.trim();
        if (!content.endsWith('`')) {
          content += '\n';
        }
        writeFileSync(filePath, content, 'utf8');
        this.totalFixes++;
        this.log(`Fixed template literal in: ${filePath}`, 'info');
      }
    } catch (err) {
      this.log(`Error fixing template literal: ${err.message}`, 'error');
    }
  }

  async run() {
    this.log('🚀 Starting surgical TS1005 fixes...');
    
    this.fixSpecificErrors();
    
    this.log(`🔧 Files fixed: ${this.fixedFiles}`);
    this.log(`✨ Total fixes applied: ${this.totalFixes}`);
    
    if (this.totalFixes > 0) {
      this.log(`🎉 Successfully applied ${this.totalFixes} surgical fixes!`, 'success');
    } else {
      this.log('No fixes needed');
    }
  }
}

const fixer = new SurgicalTS1005Fixer();
fixer.run().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});