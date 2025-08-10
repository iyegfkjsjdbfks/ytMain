#!/usr/bin/env node
/**
 * Fix TS2322: Type 'X' is not assignable to type 'Y'
 * Strategy: add safe casts where obvious (number<string coercions, etc.)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
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
      // Try Windows format first: file(line,col): error TS2322: Type 'X' is not assignable to type 'Y'
      let m = line.match(/([^(]+)\((\d+),(\d+)\): error TS2322: Type '([^']+)' is not assignable to type '([^']+)'/);
      if (!m) {
        // Try Unix format: file:line:col: error TS2322: Type 'X' is not assignable to type 'Y'
        m = line.match(/([^:]+):(\d+):(\d+): error TS2322: Type '([^']+)' is not assignable to type '([^']+)'/);
      }
      if (!m) continue;

      const [_, file, lineNumStr, colStr, fromType, toType] = m;
      fileSet.add(file);

      // Heuristic fixes per file
      const full = join(projectRoot, file);

      try {
        // Check if file exists
        if (!existsSync(full)) {
          this.log(`File not found: ${file}`);
          continue;
        }

        let content = readFileSync(full, 'utf8');

      // More conservative approach: only fix specific line mentioned in error
      const lineNum = parseInt(lineNumStr);
      const lines = content.split('\n');

      if (lineNum > 0 && lineNum <= lines.length) {
        const targetLine = lines[lineNum - 1];
        let modifiedLine = targetLine;

        // string -> number: wrap with Number() only if it's a simple assignment
        if (fromType.includes('string') && toType.includes('number')) {
          if (/=\s*['"`][^'"`]*['"`]/.test(targetLine) &&
              !targetLine.includes('Number(') &&
              !targetLine.includes('parseInt(') &&
              !targetLine.includes('parseFloat(')) {
            modifiedLine = targetLine.replace(/=\s*(['"`][^'"`]*['"`])/, '= Number($1)');
          }
        }

        // number -> string: ensure toString() only for simple cases
        if (fromType.includes('number') && toType.includes('string')) {
          if (/=\s*\d+/.test(targetLine) &&
              !targetLine.includes('toString(') &&
              !targetLine.includes('String(')) {
            modifiedLine = targetLine.replace(/=\s*(\d+)/, '= String($1)');
          }
        }

        if (modifiedLine !== targetLine) {
          lines[lineNum - 1] = modifiedLine;
          content = lines.join('\n');
        }
      }

        try {
          writeFileSync(full, content);
        } catch (writeError) {
          this.log(`Failed to write file ${file}: ${writeError.message}`);
        }
      } catch (error) {
        this.log(`Error processing ${file}: ${error.message}`);
      }
    }

    const final = this.getCount();
    this.log(`Initial: ${initial}, Final: ${final}, Fixed: ${initial - final}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) new TS2322Fixer().fix();

export { TS2322Fixer };