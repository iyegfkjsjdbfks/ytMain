#!/usr/bin/env node
/**
 * Import Path Fixer
 * 
 * Fixes incorrect import paths throughout the codebase
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class ImportPathFixer {
  constructor() {
    this.fixes = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} ${message}`);
    if (type === 'success') this.fixes.push(message);
    if (type === 'error') this.errors.push(message);
  }

  // Find all TypeScript/JavaScript files
  findFiles(directory, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
    const files = [];
    
    try {
      const entries = readdirSync(join(projectRoot, directory));
      
      for (const entry of entries) {
        const fullPath = join(projectRoot, directory, entry);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
          files.push(...this.findFiles(join(directory, entry), extensions));
        } else if (stat.isFile() && extensions.some(ext => entry.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    
    return files;
  }

  // Fix common import path issues
  fixImportPaths() {
    this.log('Fixing import paths throughout codebase...');
    
    const files = this.findFiles('src');
    
    for (const filePath of files) {
      this.fixFileImports(filePath);
    }
  }

  fixFileImports(filePath) {
    if (!existsSync(filePath)) return;
    
    let content = readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Common import path fixes
    const fixes = [
      // Fix ../src/ paths to relative paths
      { from: /from ['"](\.\.\/src\/[^'"]+)['"]/g, to: (match, path) => `from '${path.replace('../src/', '../')}'` },
      
      // Fix missing service files - create placeholder or comment out
      { from: /from ['"](\.\.\/services\/settingsService)['"]/g, to: "// from '../services/settingsService' // Service not found" },
      { from: /from ['"](\.\.\/services\/realVideoService)['"]/g, to: "// from '../services/realVideoService' // Service not found" },
      
      // Fix incorrect path references
      { from: /from ['"](\.\.\/\.\.\/src\/[^'"]+)['"]/g, to: (match, path) => `from '${path.replace('../../src/', '../')}'` },
      
      // Fix relative imports that might be wrong
      { from: /from ['"](\.\/src\/[^'"]+)['"]/g, to: (match, path) => `from '${path.replace('./src/', './')}'` },
    ];
    
    for (const fix of fixes) {
      const newContent = content.replace(fix.from, fix.to);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    }
    
    if (modified) {
      writeFileSync(filePath, content);
      this.log(`Fixed imports in ${filePath.replace(projectRoot, '')}`, 'success');
    }
  }

  // Create missing service files as placeholders
  createMissingServices() {
    this.log('Creating missing service files...');
    
    const missingServices = [
      'src/services/settingsService.ts',
      'src/services/realVideoService.ts'
    ];
    
    for (const servicePath of missingServices) {
      const fullPath = join(projectRoot, servicePath);
      if (!existsSync(fullPath)) {
        const serviceName = servicePath.split('/').pop().replace('.ts', '');
        const placeholder = `// Placeholder service - ${serviceName}
// TODO: Implement actual service functionality

export const ${serviceName.replace('Service', '')} = {
  // Placeholder methods
};

export default ${serviceName.replace('Service', '')};
`;
        writeFileSync(fullPath, placeholder);
        this.log(`Created placeholder ${servicePath}`, 'success');
      }
    }
  }

  // Fix duplicate class members
  fixDuplicateMembers() {
    this.log('Fixing duplicate class members...');
    
    const conditionalLoggerPath = join(projectRoot, 'src/utils/conditionalLogger.ts');
    if (existsSync(conditionalLoggerPath)) {
      let content = readFileSync(conditionalLoggerPath, 'utf8');
      
      // Remove duplicate timeEnd method
      const lines = content.split('\n');
      const seenMethods = new Set();
      const filteredLines = [];
      let inMethod = false;
      let currentMethod = '';
      let braceCount = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for method declaration
        const methodMatch = line.match(/^\s*(\w+)\s*\(/);
        if (methodMatch && !inMethod) {
          currentMethod = methodMatch[1];
          if (seenMethods.has(currentMethod)) {
            this.log(`Removing duplicate method: ${currentMethod}`, 'success');
            inMethod = true;
            braceCount = 0;
            continue; // Skip this line
          } else {
            seenMethods.add(currentMethod);
          }
        }
        
        if (inMethod) {
          // Count braces to know when method ends
          braceCount += (line.match(/\{/g) || []).length;
          braceCount -= (line.match(/\}/g) || []).length;
          
          if (braceCount <= 0) {
            inMethod = false;
            currentMethod = '';
          }
          continue; // Skip lines in duplicate method
        }
        
        filteredLines.push(line);
      }
      
      if (filteredLines.length !== lines.length) {
        writeFileSync(conditionalLoggerPath, filteredLines.join('\n'));
        this.log('Fixed duplicate methods in conditionalLogger.ts', 'success');
      }
    }
  }

  async run() {
    this.log('🔧 Running import path fixes...');
    
    this.fixImportPaths();
    this.createMissingServices();
    this.fixDuplicateMembers();
    
    this.log(`✅ Applied ${this.fixes.length} import fixes`, 'success');
    if (this.errors.length > 0) {
      this.log(`❌ ${this.errors.length} errors encountered`, 'error');
    }
    
    console.log('\n🔧 Import Fixes Applied:');
    this.fixes.forEach(fix => console.log(`  • ${fix}`));
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => console.log(`  • ${error}`));
    }
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new ImportPathFixer();
  fixer.run().catch(console.error);
}

export default ImportPathFixer;