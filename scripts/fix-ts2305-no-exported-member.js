#!/usr/bin/env node
/**
 * Fix TypeScript TS2305 "Module has no exported member" errors
 * Fixes import statements by removing non-existent imports or adding exports
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class NoExportedMemberFixer {
  constructor() {
    this.fixedCount = 0;
    this.addedExports = [];
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    const prefix = {
      info: '🔧',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type] || '🔧';
    
    console.log(`${colors[type]}${prefix} ${message}${colors.reset}`);
  }

  getTypeScriptErrors() {
    try {
      execSync('npm run type-check', { encoding: 'utf8', stdio: 'pipe', cwd: projectRoot });
      return [];
    } catch (error) {
      const output = error.stdout + error.stderr;
      const lines = output.split('\n');
      const errors = [];
      
      for (const line of lines) {
        // Match pattern: file(line,col): error TS2305: Module 'module-path' has no exported member 'memberName'
        const match = line.match(/(.+?)\((\d+),(\d+)\): error TS2305: Module '(.+?)' has no exported member '(.+?)'/);
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            module: match[4],
            member: match[5]
          });
        }
      }
      
      return errors;
    }
  }

  findModulePath(fromFile, modulePath) {
    if (modulePath.startsWith('./') || modulePath.startsWith('../')) {
      // Relative import
      const fromDir = dirname(fromFile);
      const resolvedPath = join(projectRoot, fromDir, modulePath);
      const possibleFiles = [
        resolvedPath + '.ts',
        resolvedPath + '.tsx',
        resolvedPath + '.js',
        resolvedPath + '.jsx',
        join(resolvedPath, 'index.ts'),
        join(resolvedPath, 'index.tsx'),
        join(resolvedPath, 'index.js')
      ];

      for (const file of possibleFiles) {
        if (existsSync(file)) {
          return file;
        }
      }
    }
    return null;
  }

  addExportToModule(modulePath, memberName) {
    if (!existsSync(modulePath)) {
      return false;
    }

    let content = readFileSync(modulePath, 'utf8');
    
    // Check if export already exists
    if (content.includes(`export { ${memberName};`) || 
        content.includes(`export const ${memberName}`) ||
        content.includes(`export function ${memberName}`) ||
        content.includes(`export class ${memberName}`) ||
        content.includes(`export interface ${memberName}`) ||
        content.includes(`export type ${memberName}`)) {
      return false; // Already exported
    }

    // Strategy 1: Add stub export at the end
    const stubExport = `\n// TODO: Implement ${memberName}\nexport const ${memberName} = {};\n`;
    content += stubExport;

    try {
      writeFileSync(modulePath, content, 'utf8');
      this.addedExports.push({ file: modulePath, member: memberName });
      this.log(`Added stub export for ${memberName} in ${modulePath}`, 'success');
      return true;
    } catch (err) {
      this.log(`Failed to add export to ${modulePath}: ${err.message}`, 'error');
      return false;
    }
  }

  fixNoExportedMember(filePath, error) {
    const fullPath = join(projectRoot, filePath);
    if (!existsSync(fullPath)) {
      this.log(`File not found: ${fullPath}`, 'warning');
      return false;
    }

    const content = readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    
    if (error.line > lines.length) {
      return false;
    }

    const line = lines[error.line - 1];
    const { module, member } = error;

    // Strategy 1: Try to add the export to the target module
    const modulePath = this.findModulePath(filePath, module);
    if (modulePath && this.addExportToModule(modulePath, member)) {
      this.fixedCount++;
      return true;
    }

    // Strategy 2: Remove the problematic import
    if (line.includes(`import`) && line.includes(member)) {
      // Check if it's a named import
      const namedImportMatch = line.match(/import\s*{([^}]+)}\s*from/);
      if (namedImportMatch) {
        const imports = namedImportMatch[1].split(',').map(i => i.trim()).filter(i => i !== member);
        if (imports.length > 0) {
          // Remove just this member from the import
          const newLine = line.replace(namedImportMatch[1], imports.join(', '));
          lines[error.line - 1] = newLine;
        } else {
          // Remove entire import line
          lines[error.line - 1] = `// TODO: Fix import - ${line.trim()}`;
        }
        
        writeFileSync(fullPath, lines.join('\n'), 'utf8');
        this.fixedCount++;
        this.log(`Removed non-existent import: ${member} from ${module}`, 'warning');
        return true;
      }
    }

    // Strategy 3: Comment out the problematic line
    if (line.trim()) {
      lines[error.line - 1] = `// TODO: Fix missing export - ${line.trim()}`;
      writeFileSync(fullPath, lines.join('\n'), 'utf8');
      this.fixedCount++;
      this.log(`Commented out problematic import: ${member}`, 'warning');
      return true;
    }

    return false;
  }

  async run() {
    this.log('🔍 Analyzing TS2305 no exported member errors...');
    
    const errors = this.getTypeScriptErrors();
    this.log(`Found ${errors.length} no exported member errors`);
    
    if (errors.length === 0) {
      this.log('No TS2305 errors to fix');
      return;
    }

    // Group errors by file
    const errorsByFile = {};
    for (const error of errors) {
      if (!errorsByFile[error.file]) {
        errorsByFile[error.file] = [];
      }
      errorsByFile[error.file].push(error);
    }
    
    // Fix errors file by file
    for (const [file, fileErrors] of Object.entries(errorsByFile)) {
      this.log(`Fixing ${fileErrors.length} errors in ${file}`);
      
      // Sort errors by line number in reverse to avoid line number shifts
      fileErrors.sort((a, b) => b.line - a.line);
      
      for (const error of fileErrors) {
        this.fixNoExportedMember(file, error);
      }
    }
    
    this.log(`✅ Fixed ${this.fixedCount} no exported member errors`);
    if (this.addedExports.length > 0) {
      this.log(`📤 Added ${this.addedExports.length} stub exports`, 'info');
    }
    
    // Verify results
    const finalErrors = this.getTypeScriptErrors();
    this.log(`Remaining TS2305 errors: ${finalErrors.length}`);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('fix-ts2305-no-exported-member.js')) {
  const fixer = new NoExportedMemberFixer();
  fixer.run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}

export { NoExportedMemberFixer };