#!/usr/bin/env node
/**
 * Object Literal Syntax Fixer
 * 
 * Fixes missing commas in object literals and const assertions
 * Specifically targets TS1005 errors in service and hook files
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const projectRoot = process.cwd();

class ObjectLiteralSyntaxFixer {
  constructor() {
    this.fixedFiles = [];
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

  fixObjectLiteralSyntax(content) {
    let fixed = content;
    let changes = 0;

    // Fix 1: Missing comma after 'as const' before identifier
    // Pattern: 'public' as const createdAt: → 'public' as const, createdAt:
    const constCommaRegex = /(\w+['"]?\s*as\s+const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*\s*:)/g;
    fixed = fixed.replace(constCommaRegex, '$1, $2');
    if (fixed !== content) changes++;

    // Fix 2: Missing comma after const assertion arrays
    // Pattern: ['videos'] as const lists: → ['videos'] as const, lists:
    const constArrayCommaRegex = /(\[.*?\]\s*as\s+const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*\s*:)/g;
    fixed = fixed.replace(constArrayCommaRegex, '$1, $2');
    if (fixed !== content) changes++;

    // Fix 3: Missing comma after function calls in object literals
    // Pattern: () => [...something] as const detail: → () => [...something] as const, detail:
    const functionConstCommaRegex = /(\)\s*=>\s*\[.*?\]\s*as\s+const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*\s*:)/g;
    fixed = fixed.replace(functionConstCommaRegex, '$1, $2');
    if (fixed !== content) changes++;

    // Fix 4: Missing comma after object method definitions
    // Pattern: ) => [...filters] as const details: → ) => [...filters] as const, details:
    const methodConstCommaRegex = /(.*?\]\s*as\s+const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*\()/g;
    fixed = fixed.replace(methodConstCommaRegex, '$1, $2');
    if (fixed !== content) changes++;

    // Fix 5: General object literal comma fixes
    // Look for pattern: } identifier: where } should be },
    const objectCommaRegex = /(\})\s+([a-zA-Z_$][a-zA-Z0-9_$]*\s*:)/g;
    fixed = fixed.replace(objectCommaRegex, '$1, $2');
    if (fixed !== content) changes++;

    return { fixed, changes };
  }

  async fixFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const result = this.fixObjectLiteralSyntax(content);
      
      if (result.changes > 0) {
        writeFileSync(filePath, result.fixed, 'utf8');
        this.fixedFiles.push({
          file: filePath,
          changes: result.changes
        });
        
        const relativePath = filePath.replace(projectRoot + '/', '');
        this.log(`Fixed ${relativePath} (${result.changes} object literal fixes)`);
        return true;
      }
      
      return false;
    } catch (error) {
      this.log(`Error fixing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    this.log('🚀 Starting Object Literal Syntax Fix...');
    
    // Target the specific files mentioned in the error output
    const targetFiles = [
      'services/googleSearchService.ts',
      'services/realVideoService.ts',
      'src/features/video/hooks/useVideo.ts',
      'src/hooks/useTrendingSearch.ts',
      'src/hooks/useWatchPage.ts',
      'src/services/unifiedDataService.ts'
    ];
    
    let fixedCount = 0;
    
    for (const file of targetFiles) {
      const fullPath = `${projectRoot}/${file}`;
      try {
        const wasFixed = await this.fixFile(fullPath);
        if (wasFixed) fixedCount++;
      } catch (error) {
        this.log(`File not found or error: ${file}`, 'warning');
      }
    }
    
    // Run verification
    this.log('\n🔍 Verifying fixes...');
    try {
      execSync('timeout 30s npx tsc --noEmit --maxNodeModuleJsDepth 0', { 
        stdio: 'pipe',
        timeout: 30000 
      });
      this.log('✅ TypeScript compilation successful!', 'success');
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      const remainingErrors = (output.match(/error TS1005:/g) || []).length;
      
      if (remainingErrors > 0) {
        this.log(`⚠️ ${remainingErrors} TS1005 errors still remain`, 'warning');
        
        // Show first few remaining errors
        const errorLines = output.split('\n').filter(line => line.includes('error TS1005:'));
        this.log('\n📋 Remaining TS1005 errors:');
        errorLines.slice(0, 5).forEach((line, i) => {
          console.log(`  ${i + 1}. ${line.trim()}`);
        });
      } else {
        this.log('✅ All TS1005 errors resolved!', 'success');
      }
    }
    
    // Report results
    this.log('\n' + '='.repeat(50));
    this.log(`📊 Object Literal Syntax Fix Complete`);
    this.log(`🔧 Files fixed: ${fixedCount}`);
    
    if (this.fixedFiles.length > 0) {
      this.log('\n📋 Files Modified:');
      for (const fix of this.fixedFiles) {
        const relativePath = fix.file.replace(projectRoot + '/', '');
        console.log(`  • ${relativePath} (${fix.changes} fixes)`);
      }
    }
    
    return {
      filesFixed: fixedCount,
      fixedFiles: this.fixedFiles
    };
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new ObjectLiteralSyntaxFixer();
  fixer.run().catch(err => {
    console.error('Object literal syntax fixer failed:', err);
    process.exitCode = 1;
  });
}

export { ObjectLiteralSyntaxFixer };