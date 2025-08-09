#!/usr/bin/env node
/**
 * Fix TS6133: 'X' is declared but its value is never read
 * Strategy: remove unused imports and variables safely
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class TS6133Fixer {
  log(msg) { console.log(`🧹 ${msg}`); }
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
      return output.split('\n').filter(l => /error TS6133:/.test(l)).length;
    } catch { return 0; }
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
      return output.split('\n').filter(l => /error TS6133:/.test(l)).map(line => {
        // Extract just the file path, removing line/column info
        const match = line.match(/^([^(]+)\(\d+,\d+\):/);
        return match ? match[1] : line.split(':')[0];
      });
    } catch { return []; }
  }
  run() {
    const initial = this.getCount();
    this.log(`Found ${initial} TS6133 unused declarations`);
    if (initial === 0) return;

    const lines = this.getErrors();
    const files = [...new Set(lines)];

    for (const file of files) {
      const full = join(projectRoot, file);
      let content = readFileSync(full, 'utf8');
      let modified = false;

      // Remove unused React import when not needed
      if (/['\"]react['\"]/.test(content) && /import\s+React\s+from\s+['\"]react['\"];?/.test(content)) {
        // If no JSX pragma usage or React variable references
        if (!/React\./.test(content)) {
          content = content.replace(/import\s+React\s+from\s+['\"]react['\"];?\n?/, '');
          modified = true;
        }
      }

      // Remove unused named imports from braces
      content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['\"][^'\"]+['\"];?/g, (match, names) => {
        const used = names.split(',').map(n => n.trim()).filter(n => n && new RegExp(`\\b${n.split(' as ')[1] || n.split(' as ')[0]}\\b`).test(content.replace(match, '')));
        if (used.length === 0) { modified = true; return ''; }
        if (used.join(', ') !== names.replace(/\s+/g, ' ').trim()) { modified = true; return `import { ${used.join(', ')} } from` + match.split('from')[1]; }
        return match;
      });

      if (modified) writeFileSync(full, content);
    }

    const final = this.getCount();
    this.log(`Initial: ${initial}, Final: ${final}, Fixed: ${initial - final}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) new TS6133Fixer().run();

export { TS6133Fixer };