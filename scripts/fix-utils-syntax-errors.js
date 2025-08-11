#!/usr/bin/env node
/**
 * Utils.ts Syntax Error Fixer
 * Specifically targets the malformed patterns in src/lib/utils.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

class UtilsSyntaxFixer {
  constructor() {
    this.totalFixes = 0;
  }

  fixUtilsFile() {
    const filePath = join(process.cwd(), 'src/lib/utils.ts');
    
    try {
      console.log('🔧 Fixing src/lib/utils.ts syntax errors...');
      
      let content = readFileSync(filePath, 'utf8');
      
      // Fix pattern: export function throttle<T ext={true}e={true}n={true}d={true}s={true} (...args) => any>(;
      content = content.replace(
        /export\s+function\s+throttle<T\s+ext=\{true\}e=\{true\}n=\{true\}d=\{true\}s=\{true\}\s+\(\.\.\.args\)\s*=>\s*any>\(;/g,
        'export function throttle<T extends (...args: any[]) => any>('
      );
      
      // Fix pattern: func: T, limit,
      content = content.replace(
        /func:\s*T,\s*limit,/g,
        'func: T, limit: number'
      );
      
      // Fix pattern: return function executedFunction(...args: Parameters<T>);
      content = content.replace(
        /return\s+function\s+executedFunction\(\.\.\.args:\s*Parameters<T>\);/g,
        'return function executedFunction(...args: Parameters<T>) {'
      );
      
      // Fix pattern: export function isString(value) value is string {
      content = content.replace(
        /export\s+function\s+isString\(value\)\s+value\s+is\s+string\s*{/g,
        'export function isString(value: any): value is string {'
      );
      
      // Fix pattern: export function isNumber(value) value is number {
      content = content.replace(
        /export\s+function\s+isNumber\(value\)\s+value\s+is\s+number\s*{/g,
        'export function isNumber(value: any): value is number {'
      );
      
      // Fix pattern: export function isEmail(value) value is string {
      content = content.replace(
        /export\s+function\s+isEmail\(value\)\s+value\s+is\s+string\s*{/g,
        'export function isEmail(value: any): value is string {'
      );
      
      // Fix pattern: export function cloneDeep<T ext={true}e={true}n={true}d={true}s={true} any, U ext={true}e={true}n={true}d={true}s={true} T | T[]>(;
      content = content.replace(
        /export\s+function\s+cloneDeep<T\s+ext=\{true\}e=\{true\}n=\{true\}d=\{true\}s=\{true\}\s+any,\s*U\s+ext=\{true\}e=\{true\}n=\{true\}d=\{true\}s=\{true\}\s+T\s*\|\s*T\[\]>\(;/g,
        'export function cloneDeep<T, U extends T | T[]>('
      );
      
      // Fix pattern: value: U
      content = content.replace(
        /value:\s*U$/gm,
        'value: U): U {'
      );
      
      // Fix pattern: if (value obj[{key] = cloneDeep(obj.>);
      content = content.replace(
        /if\s*\(value\s+obj\[\{key\]\s*=\s*cloneDeep\(obj\.>\);/g,
        'if (Array.isArray(value)) {'
      );
      
      // Fix pattern: export function mergeDeep obj: Record<any any [...objects]: any.>): Record<any any> {
      content = content.replace(
        /export\s+function\s+mergeDeep\s+obj:\s*Record<any\s+any\s+\[\.\.\.objects\]:\s*any\.>\):\s*Record<any\s+any>\s*{/g,
        'export function mergeDeep(obj: Record<string, any>, ...objects: any[]): Record<string, any> {'
      );
      
      // Fix pattern: const output [{}]: {}; obj,
      content = content.replace(
        /const\s+output\s+\[\{\}\]:\s*\{\};\s*obj,/g,
        'const output = { ...obj };'
      );
      
      // Fix pattern: export function pickProperties<T, K ext={true}e={true}n={true}d={true}s={true} keyof T obj: T keys: K[]):
      content = content.replace(
        /export\s+function\s+pickProperties<T,\s*K\s+ext=\{true\}e=\{true\}n=\{true\}d=\{true\}s=\{true\}\s+keyof\s+T\s+obj:\s*T\s+keys:\s*K\[\]\):/g,
        'export function pickProperties<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {'
      );
      
      // Fix pattern: Pick,< K> [
      content = content.replace(
        /Pick,<\s*K>\s*\[/g,
        'Pick<T, K> {'
      );
      
      // Fix corrupted color pattern: export function isValidHexColor(color string new RegExp(/\w:
      content = content.replace(
        /export\s+function\s+isValidHexColor\(color\s+string\s+new\s+RegExp\(\/\\w:/g,
        'export function isValidHexColor(color: string): boolean {'
      );
      
      // Fix pattern: ^# followed by corrupted regex
      content = content.replace(
        /\^\#[a-fA-F0-9]\{6,8\}\$\s*\)\s*test\(color\)/g,
        'return /^#[a-fA-F0-9]{6,8}$/.test(color);'
      );
      
      // Fix pattern: export function createError message {...details { ext={true}e={true}n={true}d={true}s={true} Error>(;
      content = content.replace(
        /export\s+function\s+createError\s+message\s+\{\.\.\.details\s*\{\s*ext=\{true\}e=\{true\}n=\{true\}d=\{true\}s=\{true\}\s+Error>\(;/g,
        'export function createError<T extends Error>('
      );
      
      // Fix pattern: message: string details ...details: any
      content = content.replace(
        /message:\s*string\s+details\s+\.\.\.details:\s*any/g,
        'message: string, ...details: any[]'
      );
      
      // Fix pattern ending with ) { instead of ): T {
      content = content.replace(
        /\)\s*\{\s*$/gm,
        '): T {'
      );
      
      // Fix pattern: const error ] any = Object.assign
      content = content.replace(
        /const\s+error\s*\]\s*any\s*=\s*Object\.assign/g,
        'const error = Object.assign'
      );
      
      // Fix pattern: } catch (e any {
      content = content.replace(
        /\}\s*catch\s*\(e\s+any\s*\{/g,
        '} catch (e: any) {'
      );
      
      // Fix generic corrupted parameter patterns
      content = content.replace(
        /([a-zA-Z_$][a-zA-Z0-9_$]*)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*>/g,
        '$1, $2, $3>'
      );
      
      // Fix corrupted function endings: });
      content = content.replace(
        /\)\s*;\s*$/gm,
        ')'
      );
      
      // Write fixed content
      writeFileSync(filePath, content);
      console.log('✅ Fixed src/lib/utils.ts syntax errors');
      
      return true;
      
    } catch (error) {
      console.error('❌ Error fixing utils.ts:', error.message);
      return false;
    }
  }

  run() {
    console.log('🚀 Starting Utils.ts Syntax Error Fixer...');
    console.log('');
    
    const success = this.fixUtilsFile();
    
    console.log('');
    if (success) {
      console.log('✅ Run `npm run type-check` to verify the fixes');
    } else {
      console.log('❌ Some errors may require manual review');
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new UtilsSyntaxFixer();
  fixer.run();
}

export { UtilsSyntaxFixer };