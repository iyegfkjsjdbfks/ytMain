#!/usr/bin/env node
/**
 * Fix TS6133: 'X' is declared but its value is never read
 * Strategy: remove unused imports and variables safely
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class TS6133Fixer {
  log(msg) { console.log(`🧹 ${msg}`); }

  normalizeFilePath(filePath) {
    // Normalize path separators and make relative to project root
    const normalized = filePath.replace(/\\/g, '/');
    const projectRootNormalized = projectRoot.replace(/\\/g, '/');

    if (normalized.startsWith(projectRootNormalized)) {
      return normalized.substring(projectRootNormalized.length + 1);
    }
    return normalized;
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
        // Try Windows format first: file(line,col): error TS6133: ...
        let match = line.match(/^([^(]+)\(\d+,\d+\):/);
        if (match) {
          const fullPath = match[1].trim();
          return this.normalizeFilePath(fullPath);
        }

        // Try Unix format: file:line:col: error TS6133: ...
        match = line.match(/^([^:]+):\d+:\d+:/);
        if (match) {
          const fullPath = match[1].trim();
          return this.normalizeFilePath(fullPath);
        }

        // Fallback
        const filePath = line.split(':')[0];
        return this.normalizeFilePath(filePath);
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

      try {
        // Check if file exists
        if (!existsSync(full)) {
          this.log(`File not found: ${file}`);
          continue;
        }

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

        // Remove unused named imports from braces (more conservative approach)
        content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['\"][^'\"]+['\"];?\n?/g, (match, names) => {
          try {
            const importNames = names.split(',').map(n => n.trim()).filter(Boolean);
            const usedNames = importNames.filter(name => {
              // Handle 'as' aliases
              const actualName = name.includes(' as ') ? name.split(' as ')[1].trim() : name.trim();
              // Check if the name is used in the rest of the content (excluding this import line)
              const contentWithoutImport = content.replace(match, '');
              return new RegExp(`\\b${actualName}\\b`).test(contentWithoutImport);
            });

            if (usedNames.length === 0) {
              modified = true;
              return ''; // Remove entire import
            }
            if (usedNames.length !== importNames.length) {
              modified = true;
              return `import { ${usedNames.join(', ')} } from` + match.split('from')[1];
            }
            return match; // No changes needed
          } catch (regexError) {
            // If regex processing fails, keep the original import to be safe
            return match;
          }
        });

        if (modified) {
          writeFileSync(full, content);
        }
      } catch (error) {
        this.log(`Error processing ${file}: ${error.message}`);
      }
    }

    const final = this.getCount();
    this.log(`Initial: ${initial}, Final: ${final}, Fixed: ${initial - final}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) new TS6133Fixer().run();

export { TS6133Fixer };