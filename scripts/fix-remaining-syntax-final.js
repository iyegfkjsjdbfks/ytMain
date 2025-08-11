#!/usr/bin/env node
/**
 * Fix Remaining Syntax Issues
 * Targets the specific remaining syntax errors in imports
 */

import { readFileSync, writeFileSync } from 'fs';

class RemainingSyntaxFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
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

  fixMalformedImports(content) {
    let fixedContent = content;
    let fixes = 0;

    // Pattern 1: Fix "import {\nimport { ... }" pattern
    // This happens when an import block is broken and mixed with another import
    const pattern1 = /import\s*\{\s*\nimport\s*\{([^}]+)\}\s*from\s*(['"][^'"]+['"];?)\s*\n([^}]+)\}\s*from\s*(['"][^'"]+['"];?)/g;
    fixedContent = fixedContent.replace(pattern1, (match, items1, from1, items2, from2) => {
      fixes++;
      return `import { ${items1.trim()} } from ${from1}\nimport {\n${items2.trim()}\n} from ${from2}`;
    });

    // Pattern 2: Fix standalone "import {" without closing
    const pattern2 = /^import\s*\{\s*$/gm;
    fixedContent = fixedContent.replace(pattern2, (match) => {
      // Look for the next import and merge them
      const lines = fixedContent.split('\n');
      const matchIndex = lines.findIndex(line => line.trim() === 'import {');
      
      if (matchIndex !== -1) {
        // Find the corresponding closing brace and from statement
        let nextImportIndex = -1;
        let closingBraceIndex = -1;
        
        for (let i = matchIndex + 1; i < lines.length; i++) {
          if (lines[i].includes('import {')) {
            nextImportIndex = i;
            break;
          }
          if (lines[i].includes('} from')) {
            closingBraceIndex = i;
            break;
          }
        }
        
        if (nextImportIndex !== -1 && closingBraceIndex !== -1) {
          // Remove the broken import line
          lines.splice(matchIndex, 1);
          fixes++;
          return lines.join('\n');
        }
      }
      
      return match;
    });

    return { content: fixedContent, fixes };
  }

  fixShebangInTS(content, filePath) {
    let fixedContent = content;
    let fixes = 0;

    // Remove shebang from .ts files (they're not meant to be executable scripts)
    if (filePath.endsWith('.ts') && !filePath.includes('/scripts/')) {
      const pattern = /^#!/gm;
      if (pattern.test(fixedContent)) {
        fixedContent = fixedContent.replace(pattern, '//');
        fixes++;
      }
    }

    return { content: fixedContent, fixes };
  }

  async processFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      let result = { content, fixes: 0 };
      
      // Apply fixes
      const importFix = this.fixMalformedImports(result.content);
      result.content = importFix.content;
      result.fixes += importFix.fixes;
      
      const shebangFix = this.fixShebangInTS(result.content, filePath);
      result.content = shebangFix.content;
      result.fixes += shebangFix.fixes;
      
      if (result.fixes > 0) {
        writeFileSync(filePath, result.content);
        this.fixedFiles++;
        this.totalFixes += result.fixes;
        this.log(`Fixed ${result.fixes} syntax issues in ${filePath}`);
      }
      
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
    }
  }

  async run() {
    this.log('🚀 Starting remaining syntax fixes...');
    
    const problematicFiles = [
      'pages/ChannelPage.tsx',
      'pages/LibraryPage.tsx',
      'pages/StudioPage.tsx',
      'scripts/refactor-codebase.ts',
      'src/features/moderation/components/ModerationDashboard.tsx'
    ];
    
    const startTime = Date.now();
    
    for (const file of problematicFiles) {
      await this.processFile(file);
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    this.log('\n' + '='.repeat(60));
    this.log('📊 REMAINING SYNTAX FIXES REPORT');
    this.log('='.repeat(60));
    this.log(`⏱️  Duration: ${duration} seconds`);
    this.log(`📁 Files processed: ${problematicFiles.length}`);
    this.log(`🔧 Files fixed: ${this.fixedFiles}`);
    this.log(`✨ Total fixes applied: ${this.totalFixes}`);
    
    if (this.totalFixes > 0) {
      this.log(`🎉 Successfully fixed ${this.totalFixes} syntax issues!`, 'success');
    } else {
      this.log('ℹ️  No remaining syntax issues found.', 'info');
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new RemainingSyntaxFixer();
  fixer.run().catch(err => {
    console.error('RemainingSyntaxFixer failed:', err);
    process.exitCode = 1;
  });
}

export { RemainingSyntaxFixer };