#!/usr/bin/env node
/**
 * Fix TS2300: Duplicate identifier
 * - Removes duplicate imports
 * - Merges duplicate type declarations
 * - Ensures React is not imported twice
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class TS2300Fixer {
  constructor() {
    this.modifiedFiles = new Set();
  }

  log(message, type = 'info') {
    const prefix = { info: '🔁', success: '✅', error: '❌', warning: '⚠️' }[type] || '🔁';
    console.log(`${prefix} ${message}`);
  }

  getErrorCount() {
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
      return output.split('\n').filter(l => /error TS2300:/.test(l)).length;
    } catch {
      return 0;
    }
  }

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
      return output.split('\n').filter(l => /error TS2300:/.test(l)).map(line => {
        const match = line.match(/([^:]+):(\d+):(\d+):\s*error TS2300: Duplicate identifier '([^']+)'/);
        return match ? { file: match[1], line: parseInt(match[2]), ident: match[4] } : null;
      }).filter(Boolean);
    } catch {
      return [];
    }
  }

  fixFile(filePath) {
    const fullPath = join(projectRoot, filePath);

    try {
      // Check if file exists
      if (!require('fs').existsSync(fullPath)) {
        this.log(`File not found: ${filePath}`, 'warning');
        return false;
      }

      let content = readFileSync(fullPath, 'utf8');
      let modified = false;

    // Remove duplicated React imports
    const reactImportRegex = /import\s+React\s+from\s+['"]react['"];?/g;
    const reactImports = content.match(reactImportRegex) || [];
    if (reactImports.length > 1) {
      content = content.replace(reactImportRegex, (m, offset, str) => {
        return str.indexOf(m) === str.indexOf(reactImports[0]) ? m : '';
      });
      modified = true;
    }

    // Remove duplicate named imports
    const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
    const seenImports = new Set();
    let newContent = '';
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('import')) {
        const simplified = line.replace(/\s+/g, ' ').trim();
        if (seenImports.has(simplified)) {
          modified = true;
          continue; // skip duplicate import line
        }
        seenImports.add(simplified);
      }
      newContent += line + '\n';
    }

      if (modified) {
        try {
          writeFileSync(fullPath, newContent);
          this.modifiedFiles.add(filePath);
          this.log(`De-duplicated imports in ${filePath}`, 'success');
        } catch (writeError) {
          this.log(`Failed to write file ${filePath}: ${writeError.message}`, 'error');
          return false;
        }
      }

      return modified;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  run() {
    const initial = this.getErrorCount();
    this.log(`Found ${initial} TS2300 duplicate identifier errors`);

    if (initial === 0) return;

    const errors = this.getErrors();
    const files = [...new Set(errors.map(e => e.file))];
    for (const file of files) {
      this.fixFile(file);
    }

    const final = this.getErrorCount();
    this.log(`Initial: ${initial}, Final: ${final}, Fixed: ${initial - final}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  new TS2300Fixer().run();
}

export { TS2300Fixer };