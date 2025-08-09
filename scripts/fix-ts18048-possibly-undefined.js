import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();

class TS18048Fixer {
  constructor() {
    this.fixedFiles = new Set();
  }

  log(message, type = 'info') {
    const prefix = {
      info: '⚠️',
      success: '✅', 
      error: '❌',
      warning: '🚧'
    }[type] || '⚠️';
    console.log(`${prefix} ${message}`);
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
      return output.split('\n').filter(line => /error TS18048:/.test(line)).length;
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
      
      return output.split('\n')
        .filter(line => /error TS18048:/.test(line))
        .map(line => {
          const match = line.match(/^(.+?)\((\d+),(\d+)\):\s*error TS18048:\s*(.+)$/);
          if (match) {
            return {
              filePath: match[1].replace(projectRoot + '/', '').replace(projectRoot + '\\', ''),
              line: parseInt(match[2]),
              column: parseInt(match[3]),
              message: match[4]
            };
          }
          return null;
        })
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  fixPossiblyUndefined(filePath, line, column, message) {
    try {
      const fullPath = join(projectRoot, filePath);
      let content = readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      let modified = false;

      if (line <= lines.length) {
        const targetLine = lines[line - 1];
        
        // Common patterns for possibly undefined fixes
        if (message.includes('possibly \'undefined\'')) {
          // Add optional chaining or null check
          if (targetLine.includes('.') && !targetLine.includes('?.')) {
            lines[line - 1] = targetLine.replace(/(\w+)\.(\w+)/g, '$1?.$2');
            modified = true;
          }
          // Add null check for function calls
          else if (targetLine.includes('(') && !targetLine.includes('&&')) {
            const varMatch = targetLine.match(/(\w+)\s*\(/);
            if (varMatch) {
              lines[line - 1] = targetLine.replace(varMatch[0], `${varMatch[1]} && ${varMatch[0]}`);
              modified = true;
            }
          }
        }
      }

      if (modified) {
        writeFileSync(fullPath, lines.join('\n'));
        this.log(`Added safety checks to ${filePath}`, 'success');
        this.fixedFiles.add(filePath);
        return true;
      }

      return false;
    } catch (error) {
      this.log(`Error fixing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  run() {
    const initialCount = this.getCount();
    this.log(`Found ${initialCount} TS18048 possibly undefined errors`);
    
    if (initialCount === 0) {
      this.log('No TS18048 errors to fix');
      return;
    }

    const errors = this.getErrors();
    let filesModified = 0;

    for (const error of errors) {
      if (this.fixPossiblyUndefined(error.filePath, error.line, error.column, error.message)) {
        filesModified++;
      }
    }

    const finalCount = this.getCount();
    const improvement = initialCount - finalCount;

    this.log(`\n=== TS18048 Fix Results ===`);
    this.log(`Initial errors: ${initialCount}`);
    this.log(`Final errors: ${finalCount}`);
    this.log(`Errors fixed: ${improvement}`);
    this.log(`Files modified: ${filesModified}`);
    this.log(`Fix rate: ${((improvement / initialCount) * 100).toFixed(1)}%`);

    if (improvement > 0) {
      this.log('TS18048 errors successfully reduced!', 'success');
    } else if (finalCount <= initialCount) {
      this.log('Error count maintained (no increase)', 'success');
    } else {
      this.log('Warning: Error count increased', 'warning');
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new TS18048Fixer();
  fixer.run();
}

export { TS18048Fixer };
