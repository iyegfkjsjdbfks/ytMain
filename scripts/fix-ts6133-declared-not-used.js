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

        // Remove unused React import when not needed (more comprehensive)
        if (/import\s+React\s+from\s+['\"]react['\"];?/.test(content)) {
          // Check if React is actually used (JSX, React.*, or JSX elements)
          const hasJSX = /<[A-Z][^>]*>/.test(content) || /<\/[A-Z][^>]*>/.test(content);
          const hasReactUsage = /React\./.test(content);
          const hasJSXElements = /<[a-z][^>]*>/.test(content); // HTML elements in JSX

          if (!hasJSX && !hasReactUsage && !hasJSXElements) {
            content = content.replace(/import\s+React\s+from\s+['\"]react['\"];?\n?/, '');
            modified = true;
          }
        }

        // Remove unused named imports from braces (enhanced approach)
        content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['\"]([^'\"]+)['\"];?\n?/g, (match, names, moduleName) => {
          try {
            const importNames = names.split(',').map(n => n.trim()).filter(Boolean);
            const usedNames = importNames.filter(name => {
              // Handle 'as' aliases
              const actualName = name.includes(' as ') ? name.split(' as ')[1].trim() : name.trim();
              // Check if the name is used in the rest of the content (excluding this import line)
              const contentWithoutImport = content.replace(match, '');

              // More comprehensive usage check
              const usagePatterns = [
                new RegExp(`\\b${actualName}\\b`), // Direct usage
                new RegExp(`${actualName}\\(`), // Function call
                new RegExp(`${actualName}\\.`), // Property access
                new RegExp(`<${actualName}[\\s>]`), // JSX component
                new RegExp(`</${actualName}>`), // JSX closing tag
              ];

              return usagePatterns.some(pattern => pattern.test(contentWithoutImport));
            });

            if (usedNames.length === 0) {
              modified = true;
              this.log(`Removing unused import from ${moduleName}`);
              return ''; // Remove entire import
            }
            if (usedNames.length !== importNames.length) {
              modified = true;
              this.log(`Cleaning unused imports from ${moduleName}`);
              return `import { ${usedNames.join(', ')} } from '${moduleName}';\n`;
            }
            return match; // No changes needed
          } catch (regexError) {
            // If regex processing fails, keep the original import to be safe
            return match;
          }
        });

        // Remove unused variable declarations
        content = content.replace(/^\s*(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*[^;]+;?\s*$/gm, (match, keyword, varName) => {
          // Check if variable is used elsewhere in the file
          const contentWithoutDeclaration = content.replace(match, '');
          const isUsed = new RegExp(`\\b${varName}\\b`).test(contentWithoutDeclaration);

          if (!isUsed) {
            modified = true;
            this.log(`Removing unused variable: ${varName}`);
            return ''; // Remove the declaration
          }
          return match;
        });

        // Remove unused function parameters (prefix with underscore)
        content = content.replace(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]+)\)/g, (match, funcName, params) => {
          const paramList = params.split(',').map(p => p.trim());
          const modifiedParams = paramList.map(param => {
            const paramName = param.split(':')[0].trim();
            if (paramName && !paramName.startsWith('_')) {
              // Check if parameter is used in function body
              const funcBodyRegex = new RegExp(`function\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{([^}]*)\\}`, 's');
              const funcBodyMatch = content.match(funcBodyRegex);
              if (funcBodyMatch) {
                const funcBody = funcBodyMatch[1];
                const isParamUsed = new RegExp(`\\b${paramName}\\b`).test(funcBody);
                if (!isParamUsed) {
                  modified = true;
                  return param.replace(paramName, `_${paramName}`);
                }
              }
            }
            return param;
          });

          if (modifiedParams.join(', ') !== params) {
            return `function ${funcName}(${modifiedParams.join(', ')})`;
          }
          return match;
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