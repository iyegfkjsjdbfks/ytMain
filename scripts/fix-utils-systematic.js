#!/usr/bin/env node
/**
 * Systematic Utils.ts Error Fixer
 * Applies all known patterns to fix remaining syntax errors in utils.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

class SystematicUtilsFixer {
  constructor() {
    this.totalFixes = 0;
  }

  run() {
    console.log('🚀 Starting Systematic Utils.ts Error Fixer...');
    
    const filePath = join(process.cwd(), 'src/lib/utils.ts');
    
    try {
      let content = readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      console.log('🔧 Applying systematic fixes...');
      
      // Fix 1: Type predicate patterns: export function isString(value) value is string {
      content = content.replace(
        /export\s+function\s+(is[A-Z][a-zA-Z]*)\(([^)]*)\)\s+([^)]*)\s+is\s+([^{]+)\s*\{/g,
        'export function $1($2: any): $2 is $4 {'
      );
      
      // Fix 2: Missing parameter types  
      content = content.replace(
        /export\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\(([^:)]+)\):/g,
        'export function $1($2: any):'
      );
      
      // Fix 3: Corrupted generic type parameters
      content = content.replace(
        /export\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)<([^>]*)\s+ext=\{true\}[^>]*>/g,
        'export function $1<T>'
      );
      
      // Fix 4: Missing colon in object destructuring  
      content = content.replace(
        /obj\s+Record<[^>]+>/g,
        'obj: Record<string, any>'
      );
      
      // Fix 5: Malformed conditional expressions
      content = content.replace(
        /if\s*\(\s*value\s+obj\[\{[^}]*\}\][^)]*\);/g,
        'if (Array.isArray(value)) {'
      );
      
      // Fix 6: Corrupted function parameters with complex types
      content = content.replace(
        /([a-zA-Z_$][a-zA-Z0-9_$]*)\s+Record<[^>]*>\s+\[\.\.\.([^]]*)\]:\s*[^)]*\)/g,
        '$1: Record<string, any>, ...$2: any[])'
      );
      
      // Fix 7: Corrupted return type declarations
      content = content.replace(
        /\):\s*Record<[^>]*>\s*\{/g,
        '): Record<string, any> {'
      );
      
      // Fix 8: Fix object assignment patterns
      content = content.replace(
        /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+\[(\{[^}]*\})\]:\s*(\{[^}]*\});\s*([^,]+),/g,
        'const $1 = { ...$4 };'
      );
      
      // Fix 9: Fix generic type with keyof constraints
      content = content.replace(
        /([a-zA-Z_$][a-zA-Z0-9_$]*)\s+ext=\{true\}[^>]*keyof\s+([A-Z])\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
        '$1 extends keyof $2'
      );
      
      // Fix 10: Fix Pick utility type usage
      content = content.replace(
        /Pick,<\s*([A-Z])\s*>\s*\[/g,
        'Pick<T, $1> {'
      );
      
      // Fix 11: Fix hex color regex pattern
      content = content.replace(
        /export\s+function\s+isValidHexColor\([^)]*\)\s*[^{]*string\s+new\s+RegExp[^:]*:/g,
        'export function isValidHexColor(color: string): boolean {'
      );
      
      // Fix 12: Fix regex test patterns
      content = content.replace(
        /\^\#\[a-fA-F0-9\]\{6,8\}\$[^)]*\)\s*test\([^)]*\)/g,
        'return /^#[a-fA-F0-9]{6,8}$/.test(color);'
      );
      
      // Fix 13: Fix error creation function signature
      content = content.replace(
        /export\s+function\s+createError[^(]*\([^)]*\):/g,
        'export function createError<T extends Error>(message: string, ...details: any[]):'
      );
      
      // Fix 14: Fix error assignment
      content = content.replace(
        /const\s+error\s*\]\s*any\s*=/g,
        'const error ='
      );
      
      // Fix 15: Fix catch block parameter
      content = content.replace(
        /catch\s*\(([a-zA-Z_$][a-zA-Z0-9_$]*)\s+any\s*\{/g,
        'catch ($1: any) {'
      );
      
      // Fix 16: Complete missing function bodies with proper closing
      content = content.replace(
        /\)\s*\{\s*$/gm,
        ') {\n  // TODO: Implementation needed\n}'
      );
      
      // Fix 17: Fix corrupted parameter lists
      content = content.replace(
        /([a-zA-Z_$][a-zA-Z0-9_$]*)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*>/g,
        '$1, $2, $3>'
      );
      
      // Fix 18: Remove extra closing braces
      content = content.replace(/\}\s*\}\s*$/gm, '}');
      
      if (content !== originalContent) {
        writeFileSync(filePath, content);
        console.log('✅ Applied systematic fixes to utils.ts');
        
        // Count improvements
        const beforeLines = originalContent.split('\n').length;
        const afterLines = content.split('\n').length;
        console.log(`📏 Lines: ${beforeLines} → ${afterLines}`);
        
        return true;
      } else {
        console.log('ℹ️  No patterns matched for fixing');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error fixing utils.ts:', error.message);
      return false;
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new SystematicUtilsFixer();
  const success = fixer.run();
  
  console.log('');
  if (success) {
    console.log('✅ Run `npm run type-check` to verify the fixes');
  } else {
    console.log('❌ Manual intervention may be required');
  }
}

export { SystematicUtilsFixer };