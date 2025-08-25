#!/usr/bin/env node
/**
 * Advanced Import Resolution Fixer
 * 
 * Specialized script to fix import and module resolution errors
 * with intelligent path correction and dependency resolution.
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PROJECT_ROOT = process.cwd();

class AdvancedImportFixer {
  constructor() {
    this.fixedFiles = new Set();
    this.importMap = new Map();
    this.moduleAliases = new Map();
  }

  log(message, level = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m', 
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[level]}[${level.toUpperCase()}] ${message}${colors.reset}`);
  }

  async run() {
    this.log('🔧 Starting Advanced Import Resolution...', 'info');
    
    try {
      // 1. Build module map
      await this.buildModuleMap();
      
      // 2. Get current TypeScript errors
      const errors = await this.getTypeScriptErrors();
      const importErrors = this.filterImportErrors(errors);
      
      this.log(`📊 Found ${importErrors.length} import-related errors`, 'info');
      
      // 3. Process each import error
      let fixedCount = 0;
      for (const error of importErrors) {
        if (await this.fixImportError(error)) {
          fixedCount++;
        }
      }
      
      this.log(`✅ Fixed ${fixedCount} import errors in ${this.fixedFiles.size} files`, 'success');
      return fixedCount;
      
    } catch (error) {
      this.log(`❌ Import fixing failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async buildModuleMap() {
    this.log('📚 Building module map...', 'info');
    
    const srcDirs = ['src', 'components', 'contexts', 'utils', 'services'];
    
    for (const dir of srcDirs) {
      const dirPath = path.join(PROJECT_ROOT, dir);
      if (fsSync.existsSync(dirPath)) {
        await this.scanDirectory(dirPath, dir);
      }
    }
    
    this.log(`📋 Built module map with ${this.importMap.size} modules`, 'info');
  }

  async scanDirectory(dirPath, relativePath) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativeFilePath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        await this.scanDirectory(fullPath, relativeFilePath);
      } else if (entry.isFile() && this.isSourceFile(entry.name)) {
        const exports = await this.extractExports(fullPath);
        this.importMap.set(relativeFilePath, exports);
      }
    }
  }

  isSourceFile(filename) {
    return /\.(ts|tsx|js|jsx)$/.test(filename);
  }

  async extractExports(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const exports = new Set();
      
      // Extract named exports
      const namedExportMatches = content.matchAll(/export\s+(?:const|let|var|function|class|interface|type)\s+(\w+)/g);
      for (const match of namedExportMatches) {
        exports.add(match[1]);
      }
      
      // Extract destructured exports
      const destructuredMatches = content.matchAll(/export\s*\{\s*([^}]+)\s*\}/g);
      for (const match of destructuredMatches) {
        const exportList = match[1].split(',').map(e => e.trim().split(' as ')[0]);
        exportList.forEach(exp => exports.add(exp));
      }
      
      // Check for default export
      if (/export\s+default/.test(content)) {
        exports.add('default');
      }
      
      return exports;
    } catch (error) {
      return new Set();
    }
  }

  async getTypeScriptErrors() {
    try {
      execSync('npx tsc --noEmit --pretty', { 
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return [];
    } catch (error) {
      const errors = [];
      const lines = error.stdout.split('\n');
      
      for (const line of lines) {
        const match = line.match(/^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$/);
        if (match) {
          const [, file, line, column, code, message] = match;
          errors.push({ file, line: parseInt(line), column: parseInt(column), code, message });
        }
      }
      
      return errors;
    }
  }

  filterImportErrors(errors) {
    const importErrorCodes = ['TS2307', 'TS2305', 'TS2614', 'TS2724'];
    return errors.filter(error => importErrorCodes.includes(error.code));
  }

  async fixImportError(error) {
    const filePath = path.resolve(PROJECT_ROOT, error.file);
    
    if (!fsSync.existsSync(filePath)) {
      this.log(`⚠️ File not found: ${filePath}`, 'warning');
      return false;
    }
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\n');
      const errorLine = lines[error.line - 1];
      
      if (!errorLine) return false;
      
      let fixedLine = errorLine;
      let fixed = false;
      
      switch (error.code) {
        case 'TS2307': // Cannot find module
          fixedLine = await this.fixCannotFindModule(errorLine, error);
          break;
          
        case 'TS2305': // No exported member
          fixedLine = await this.fixNoExportedMember(errorLine, error);
          break;
          
        case 'TS2614': // Module has no exported member
          fixedLine = await this.fixModuleExportedMember(errorLine, error);
          break;
          
        case 'TS2724': // Has no exported member named
          fixedLine = await this.fixNamedExportMember(errorLine, error);
          break;
      }
      
      if (fixedLine !== errorLine) {
        lines[error.line - 1] = fixedLine;
        await fs.writeFile(filePath, lines.join('\n'), 'utf8');
        this.fixedFiles.add(error.file);
        this.log(`✅ Fixed ${error.code} in ${error.file}:${error.line}`, 'success');
        return true;
      }
      
      return false;
      
    } catch (err) {
      this.log(`❌ Failed to fix ${error.file}: ${err.message}`, 'error');
      return false;
    }
  }

  async fixCannotFindModule(line, error) {
    // Extract module name from error message
    const moduleMatch = error.message.match(/Cannot find module '(.+?)'/);
    if (!moduleMatch) return line;
    
    const moduleName = moduleMatch[1];
    
    // Fix spaced paths
    if (moduleName.includes(' / ')) {
      const fixedModule = moduleName.replace(/ \/ /g, '/');
      return line.replace(moduleName, fixedModule);
    }
    
    // Fix relative imports by adding file extensions
    if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
      const possibleExtensions = ['.tsx', '.ts', '.jsx', '.js'];
      
      for (const ext of possibleExtensions) {
        const moduleWithExt = moduleName + ext;
        const resolvedPath = this.resolveRelativePath(error.file, moduleWithExt);
        
        if (fsSync.existsSync(path.resolve(PROJECT_ROOT, resolvedPath))) {
          return line.replace(moduleName, moduleWithExt);
        }
      }
      
      // Try without .tsx extension
      if (moduleName.endsWith('.tsx')) {
        const withoutExt = moduleName.replace('.tsx', '');
        return line.replace(moduleName, withoutExt);
      }
    }
    
    // Try to find the module in our module map
    const foundModule = this.findModuleInMap(moduleName);
    if (foundModule) {
      const relativePath = this.getRelativeImportPath(error.file, foundModule);
      return line.replace(moduleName, relativePath);
    }
    
    return line;
  }

  async fixNoExportedMember(line, error) {
    // Extract export member name
    const exportMatch = error.message.match(/has no exported member '(.+?)'/);
    if (!exportMatch) return line;
    
    const memberName = exportMatch[1];
    
    // Common export name corrections
    const corrections = {
      'ChatBubbleOvalLeftIcon': 'ChatBubbleLeftIcon',
      'CalendarDaysIcon': 'CalendarIcon',
      'ChartBarIcon': 'ChartBarSquareIcon',
      'SignalSlashIcon': 'SignalIcon'
    };
    
    if (corrections[memberName]) {
      return line.replace(memberName, corrections[memberName]);
    }
    
    // Try to find similar exports
    const moduleMatch = line.match(/from\s+['"`](.+?)['"`]/);
    if (moduleMatch) {
      const modulePath = moduleMatch[1];
      const moduleExports = this.getModuleExports(modulePath);
      
      if (moduleExports.size > 0) {
        // Find closest match
        const closestMatch = this.findClosestMatch(memberName, Array.from(moduleExports));
        if (closestMatch && closestMatch !== memberName) {
          return line.replace(memberName, closestMatch);
        }
      }
    }
    
    return line;
  }

  async fixModuleExportedMember(line, error) {
    // Similar to fixNoExportedMember but for different error format
    return this.fixNoExportedMember(line, error);
  }

  async fixNamedExportMember(line, error) {
    // Extract member name from error message
    const memberMatch = error.message.match(/named '(.+?)'/);
    if (!memberMatch) return line;
    
    const memberName = memberMatch[1];
    
    // Check if we should use default import instead
    if (line.includes(`{ ${memberName} }`)) {
      // Convert to default import
      return line.replace(`{ ${memberName} }`, memberName);
    }
    
    return this.fixNoExportedMember(line, error);
  }

  resolveRelativePath(fromFile, toModule) {
    const fromDir = path.dirname(fromFile);
    const resolved = path.resolve(PROJECT_ROOT, fromDir, toModule);
    return path.relative(PROJECT_ROOT, resolved);
  }

  findModuleInMap(moduleName) {
    // Try exact match first
    for (const [filePath] of this.importMap) {
      if (filePath.includes(moduleName) || path.basename(filePath, path.extname(filePath)) === moduleName) {
        return filePath;
      }
    }
    
    // Try partial match
    for (const [filePath] of this.importMap) {
      if (filePath.toLowerCase().includes(moduleName.toLowerCase())) {
        return filePath;
      }
    }
    
    return null;
  }

  getRelativeImportPath(fromFile, toFile) {
    const fromDir = path.dirname(fromFile);
    const relativePath = path.relative(fromDir, toFile);
    
    // Ensure it starts with ./ or ../
    if (!relativePath.startsWith('.')) {
      return './' + relativePath;
    }
    
    // Remove file extension for TypeScript imports
    return relativePath.replace(/\.(tsx?|jsx?)$/, '');
  }

  getModuleExports(modulePath) {
    // Check if it's a relative path
    if (modulePath.startsWith('./') || modulePath.startsWith('../')) {
      const resolvedPath = this.resolveRelativePath('', modulePath);
      return this.importMap.get(resolvedPath) || new Set();
    }
    
    // For node_modules, we can't easily determine exports
    return new Set();
  }

  findClosestMatch(target, candidates) {
    if (candidates.length === 0) return null;
    
    // Simple string similarity based on common prefixes/suffixes
    let bestMatch = null;
    let bestScore = 0;
    
    for (const candidate of candidates) {
      const score = this.calculateSimilarity(target, candidate);
      if (score > bestScore && score > 0.6) { // Threshold for similarity
        bestScore = score;
        bestMatch = candidate;
      }
    }
    
    return bestMatch;
  }

  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new AdvancedImportFixer();
  fixer.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { AdvancedImportFixer };