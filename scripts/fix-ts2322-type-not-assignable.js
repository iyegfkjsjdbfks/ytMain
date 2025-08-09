#!/usr/bin/env node
/**
 * Fix TS2322: Type 'X' is not assignable to type 'Y'
 * Strategy: add safe casts where obvious (number<string coercions, etc.)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class TS2322Fixer {
  log(msg) { console.log(`🧰 ${msg}`); }
  getErrors() {
    try {
      const run = () => {
        try {
          execSync('npm run type-check', { encoding: 'utf8', stdio: 'pipe', cwd: projectRoot });
          return '';
        } catch (err) {
          return `${err.stdout || ''}${err.stderr || ''}`;
        }
      };
      const output = run();
      if (!output) return [];
      return output.split('\n').filter(l => /error TS2322:/.test(l));
    } catch {
      return [];
    }
  }
  getCount() {
    try {
      const run = () => {
        try {
          execSync('npm run type-check', { encoding: 'utf8', stdio: 'pipe', cwd: projectRoot });
          return '';
        } catch (err) {
          return `${err.stdout || ''}${err.stderr || ''}`;
        }
      };
      const output = run();
      if (!output) return 0;
      return output.split('\n').filter(l => /error TS2322:/.test(l)).length;
    } catch { return 0; }
  }
  fix() {
    const initial = this.getCount();
    this.log(`Found ${initial} TS2322 errors`);
    if (initial === 0) return;

    const lines = this.getErrors();
    const fileSet = new Set();

    for (const line of lines) {
      const m = line.match(/([^:]+):(\d+):(\d+): error TS2322: Type '([^']+)' is not assignable to type '([^']+)'/);
      if (!m) continue;
      const [_, file, lineNumStr, colStr, fromType, toType] = m;
      fileSet.add(file);

      // Heuristic fixes per file
      const full = join(projectRoot, file);
      let content = readFileSync(full, 'utf8');

      // string -> number: wrap with Number()
      if (fromType.includes('string') && toType.includes('number')) {
        // naive replacement: value = '...' -> Number(value)
        content = content.replace(/=\s*([^;]+);/g, (s) => {
          if (s.includes('Number(') || s.includes('parseInt(') || s.includes('parseFloat(')) return s;
          return s.replace(/=\s*([^;]+);/, '= Number($1);');
        });
      }

      // number -> string: ensure toString()
      if (fromType.includes('number') && toType.includes('string')) {
        content = content.replace(/=\s*([^;]+);/g, (s) => {
          if (s.includes('toString(') || s.includes('String(')) return s;
          return s.replace(/=\s*([^;]+);/, '= String($1);');
        });
      }

      writeFileSync(full, content);
    }

    const final = this.getCount();
    this.log(`Initial: ${initial}, Final: ${final}, Fixed: ${initial - final}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) new TS2322Fixer().fix();

export { TS2322Fixer };