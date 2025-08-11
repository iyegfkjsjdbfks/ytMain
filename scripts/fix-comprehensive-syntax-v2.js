#!/usr/bin/env node
/**
 * Comprehensive TypeScript Syntax Fixer
 * Targets all remaining syntax corruption patterns
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

class ComprehensiveSyntaxFixer {
  constructor() {
    this.totalFixes = 0;
  }

  fixFile(filePath) {
    try {
      console.log(`🔧 Fixing ${filePath}...`);
      
      let content = readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      // Fix pattern: if (condition): T {
      content = content.replace(
        /if\s*\([^)]+\):\s*T\s*\{/g,
        (match) => match.replace(/:\s*T\s*\{/, ') {')
      );
      
      // Fix pattern: num, decimals -> num: number, decimals
      content = content.replace(
        /export\s+function\s+formatNumber\(num,\s*decimals:/g,
        'export function formatNumber(num: number, decimals:'
      );
      
      // Fix pattern: Missing closing brace in functions
      content = content.replace(
        /return\s+([^;\n]+)$/gm,
        'return $1;'
      );
      
      // Fix pattern: Missing semicolons at end of statements
      content = content.replace(
        /^(\s*const\s+[^=]+=[^;]+)$/gm,
        '$1;'
      );
      
      // Fix pattern: Missing semicolons for method calls
      content = content.replace(
        /^(\s*parts\.push\([^)]+\))$/gm,
        '$1;'
      );
      
      // Fix pattern: return parts.join(':')
      content = content.replace(
        /return\s+parts\.join\(':'\)$/gm,
        'return parts.join(\':\');'
      );
      
      // Fix pattern: if (condition): { -> if (condition) {
      content = content.replace(
        /if\s*\([^)]+\):\s*\{/g,
        (match) => match.replace(/:\s*\{/, ') {')
      );
      
      // Fix pattern: while (condition): { -> while (condition) {
      content = content.replace(
        /while\s*\([^)]+\):\s*\{/g,
        (match) => match.replace(/:\s*\{/, ') {')
      );
      
      // Fix pattern: for (condition): { -> for (condition) {
      content = content.replace(
        /for\s*\([^)]+\):\s*\{/g,
        (match) => match.replace(/:\s*\{/, ') {')
      );
      
      // Fix pattern: Missing parameter types in function signatures
      content = content.replace(
        /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\(([^)]*)\)\s*:\s*([^{]+)\{/g,
        (match, funcName, params, returnType) => {
          // Add types to parameters if missing
          const fixedParams = params.split(',').map(param => {
            param = param.trim();
            if (param && !param.includes(':')) {
              return `${param}: any`;
            }
            return param;
          }).join(', ');
          
          return `function ${funcName}(${fixedParams}): ${returnType.trim()} {`;
        }
      );
      
      // Fix pattern: Corrupted return types: ): T
      content = content.replace(
        /\):\s*T\s*\{/g,
        ') {'
      );
      
      // Fix pattern: Missing type in variable declarations
      content = content.replace(
        /^(\s*)(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*([^;]+)$/gm,
        '$1$2 $3 = $4;'
      );
      
      // Fix pattern: Generic syntax corruption
      content = content.replace(
        /<([^>]*)\s+ext=\{true\}[^>]*>/g,
        '<$1>'
      );
      
      // Fix multiple pattern corruptions in one line
      content = content.replace(
        /\s+ext=\{true\}[^>\s]*/g,
        ''
      );
      
      // Fix missing opening parentheses
      content = content.replace(
        /if\s+([a-zA-Z_$][a-zA-Z0-9_$]*[^(])/g,
        'if ($1)'
      );
      
      // Fix missing commas in parameter lists
      content = content.replace(
        /\(([^,)]+)\s+([^,)]+)\)/g,
        '($1, $2)'
      );
      
      // Fix function declaration ending with semicolon instead of brace
      content = content.replace(
        /^(\s*)(export\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\([^)]*\):\s*[^{;]+;$/gm,
        '$1$2function $3(...): returnType {'
      );
      
      // Fix corrupted object destructuring
      content = content.replace(
        /\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}/g,
        '{ $1, $2 }'
      );
      
      // Fix missing return type declarations  
      content = content.replace(
        /export\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\([^)]*\)\s*\{/g,
        (match, funcName) => {
          if (!match.includes(':')) {
            return match.replace(' {', ': any {');
          }
          return match;
        }
      );
      
      if (content !== originalContent) {
        writeFileSync(filePath, content);
        console.log(`✅ Fixed ${filePath}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  run() {
    console.log('🚀 Starting Comprehensive TypeScript Syntax Fixer...');
    console.log('');
    
    const utilsPath = join(process.cwd(), 'src/lib/utils.ts');
    const success = this.fixFile(utilsPath);
    
    console.log('');
    if (success) {
      console.log('✅ Run `npm run type-check` to verify the fixes');
    } else {
      console.log('ℹ️  No additional patterns found to fix');
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new ComprehensiveSyntaxFixer();
  fixer.run();
}

export { ComprehensiveSyntaxFixer };