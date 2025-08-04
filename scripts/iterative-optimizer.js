#!/usr/bin/env node
/**
 * Iterative Optimization Script
 * 
 * Continues the refactoring process with safe, incremental improvements
 * that can be run repeatedly until the codebase is fully optimized.
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

class IterativeOptimizer {
  constructor() {
    this.fixes = [];
    this.warnings = [];
    this.errors = [];
    this.iteration = 0;
  }

  log(message, type = 'info') {
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [Iteration ${this.iteration}] ${message}`);
    
    if (type === 'error') this.errors.push(message);
    if (type === 'warning') this.warnings.push(message);
    if (type === 'success') this.fixes.push(message);
  }

  async runSafeCommand(command, description) {
    try {
      const output = execSync(command, { 
        cwd: rootDir, 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 60000
      });
      this.log(`✓ ${description}`, 'success');
      return { success: true, output };
    } catch (error) {
      this.log(`✗ ${description}: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // Step 1: Optimize remaining dynamic imports
  async optimizeDynamicImports() {
    this.log('Optimizing remaining dynamic imports...');
    
    const dynamicImportFiles = [
      'src/features/video/pages/WatchPage.tsx',
      'components/RecommendationEngine.tsx',
      'pages/SearchResultsPage.tsx',
      'pages/AdminPage.tsx',
      'services/googleSearchService.ts'
    ];
    
    for (const file of dynamicImportFiles) {
      const filePath = join(rootDir, file);
      if (existsSync(filePath)) {
        await this.optimizeFileImports(filePath);
      }
    }
  }

  async optimizeFileImports(filePath) {
    let content = readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Find patterns we can safely convert
    const safeDynamicImports = [
      {
        pattern: /const\s+{\s*([^}]+)\s*}\s*=\s*await\s+import\(['"]([^'"]+)['"]\);?\s*/g,
        replacement: (match, imports, modulePath) => {
          // Only convert if not inside conditional blocks
          if (!this.isInConditionalBlock(content, match)) {
            modified = true;
            return ''; // Remove the dynamic import, we'll add static import at top
          }
          return match;
        }
      }
    ];
    
    const staticImportsToAdd = [];
    
    for (const { pattern, replacement } of safeDynamicImports) {
      const matches = [...content.matchAll(pattern)];
      for (const match of matches) {
        const [fullMatch, imports, modulePath] = match;
        if (!this.isInConditionalBlock(content, fullMatch)) {
          staticImportsToAdd.push(`import { ${imports} } from '${modulePath}';`);
          content = content.replace(fullMatch, '');
          modified = true;
        }
      }
    }
    
    // Add static imports at the top
    if (staticImportsToAdd.length > 0) {
      const lines = content.split('\n');
      const lastImportIndex = this.findLastImportLine(lines);
      lines.splice(lastImportIndex + 1, 0, ...staticImportsToAdd);
      content = lines.join('\n');
    }
    
    if (modified) {
      writeFileSync(filePath, content);
      this.log(`Optimized imports in ${relative(rootDir, filePath)}`, 'success');
    }
  }

  isInConditionalBlock(content, match) {
    const matchIndex = content.indexOf(match);
    const beforeMatch = content.substring(0, matchIndex);
    
    // Count opening and closing braces/conditionals
    const conditionalKeywords = ['if (', 'try {', 'catch', 'function', '=>'];
    return conditionalKeywords.some(keyword => 
      beforeMatch.lastIndexOf(keyword) > beforeMatch.lastIndexOf('}')
    );
  }

  findLastImportLine(lines) {
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim().startsWith('import ')) {
        return i;
      }
    }
    return 0;
  }

  // Step 2: Add memoization to more components
  async addMemoizationToComponents() {
    this.log('Adding memoization to components...');
    
    const componentFiles = this.findComponentFiles();
    const heavyComponentPatterns = [
      'VideoGrid', 'SearchResults', 'RecommendationEngine', 
      'VideoList', 'ChannelCard', 'PlaylistCard'
    ];
    
    for (const file of componentFiles) {
      const fileName = file.split('/').pop()?.replace('.tsx', '') || '';
      
      if (heavyComponentPatterns.some(pattern => fileName.includes(pattern))) {
        await this.addMemoToComponentFile(file);
      }
    }
  }

  findComponentFiles() {
    const componentDirs = [
      'src/components',
      'src/features/video/components',
      'components'
    ];
    
    const files = [];
    for (const dir of componentDirs) {
      const dirPath = join(rootDir, dir);
      if (existsSync(dirPath)) {
        files.push(...this.findFilesRecursive(dirPath, '.tsx'));
      }
    }
    return files;
  }

  findFilesRecursive(dir, extension) {
    const files = [];
    try {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory() && !entry.startsWith('.')) {
          files.push(...this.findFilesRecursive(fullPath, extension));
        } else if (stat.isFile() && entry.endsWith(extension)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore errors for non-existent directories
    }
    return files;
  }

  async addMemoToComponentFile(filePath) {
    let content = readFileSync(filePath, 'utf8');
    
    // Skip if already memoized
    if (content.includes('React.memo') || content.includes('memo(')) {
      return;
    }
    
    // Check for functional component pattern
    const componentPattern = /(?:export\s+default\s+)?(?:const|function)\s+(\w+)[^{]*{/;
    const match = content.match(componentPattern);
    
    if (match) {
      const componentName = match[1];
      
      // Add React import if needed
      if (!content.includes('import React')) {
        content = `import React from 'react';\n${content}`;
      }
      
      // Wrap with memo
      if (content.includes(`export default ${componentName}`)) {
        content = content.replace(
          `export default ${componentName}`,
          `export default React.memo(${componentName})`
        );
        
        writeFileSync(filePath, content);
        this.log(`Added memoization to ${relative(rootDir, filePath)}`, 'success');
      }
    }
  }

  // Step 3: Clean up code
  async cleanupCode() {
    this.log('Cleaning up code...');
    
    // Run linting fixes
    const lintResult = await this.runSafeCommand('npm run lint:fix', 'Auto-fix linting issues');
    
    // Clean up unused imports in key files
    const keyFiles = this.findFilesRecursive(join(rootDir, 'src'), '.ts').concat(
      this.findFilesRecursive(join(rootDir, 'src'), '.tsx')
    );
    
    for (const file of keyFiles.slice(0, 10)) { // Limit to 10 files per iteration
      await this.removeUnusedImports(file);
    }
  }

  async removeUnusedImports(filePath) {
    let content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    
    const cleanedLines = lines.filter(line => {
      // Keep non-import lines
      if (!line.trim().startsWith('import ')) return true;
      
      // Check if type-only import is actually used
      if (line.includes('import type')) {
        const typeMatch = line.match(/import\s+type\s+{\s*([^}]+)\s*}/);
        if (typeMatch) {
          const types = typeMatch[1].split(',').map(t => t.trim());
          const usedTypes = types.filter(type => content.includes(type));
          
          if (usedTypes.length === 0) {
            modified = true;
            return false; // Remove unused type import
          }
        }
      }
      
      return true;
    });
    
    if (modified) {
      writeFileSync(filePath, cleanedLines.join('\n'));
      this.log(`Cleaned unused imports in ${relative(rootDir, filePath)}`, 'success');
    }
  }

  // Step 4: Validate changes
  async validateChanges() {
    this.log('Validating changes...');
    
    const checks = [
      { command: 'npm run type-check', description: 'TypeScript compilation' },
      { command: 'npm run build:optimized', description: 'Production build' },
      { command: 'npm run lint', description: 'Code linting' }
    ];
    
    let allPassed = true;
    
    for (const check of checks) {
      const result = await this.runSafeCommand(check.command, check.description);
      if (!result.success) {
        allPassed = false;
      }
    }
    
    return allPassed;
  }

  // Main execution
  async run() {
    this.iteration++;
    this.log(`🚀 Starting iterative optimization (iteration ${this.iteration})...`);
    
    try {
      // Step 1: Optimize imports
      await this.optimizeDynamicImports();
      
      // Step 2: Add performance optimizations
      await this.addMemoizationToComponents();
      
      // Step 3: Clean up code
      await this.cleanupCode();
      
      // Step 4: Validate
      const validationPassed = await this.validateChanges();
      
      this.printSummary(validationPassed);
      
      if (this.fixes.length > 0) {
        this.log('✨ Optimization iteration completed with improvements!', 'success');
        return true; // Indicates more work can be done
      } else {
        this.log('🎯 No more optimizations needed in this iteration', 'info');
        return false; // Indicates completion
      }
      
    } catch (error) {
      this.log(`Fatal error: ${error.message}`, 'error');
      return false;
    }
  }

  printSummary(validationPassed) {
    console.log('\n' + '='.repeat(60));
    console.log(`📊 ITERATION ${this.iteration} SUMMARY`);
    console.log('='.repeat(60));
    console.log(`✅ Fixes Applied: ${this.fixes.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    console.log(`🔍 Validation: ${validationPassed ? 'PASSED' : 'FAILED'}`);
    console.log('='.repeat(60));
    
    if (this.fixes.length > 0) {
      console.log('\n🔧 Applied Fixes:');
      this.fixes.forEach(fix => console.log(`  • ${fix}`));
    }
  }
}

// Run continuous optimization
async function runContinuousOptimization() {
  const optimizer = new IterativeOptimizer();
  const maxIterations = 5;
  
  for (let i = 0; i < maxIterations; i++) {
    const hasMoreWork = await optimizer.run();
    
    if (!hasMoreWork) {
      console.log('\n🎉 Optimization complete! No more improvements needed.');
      break;
    }
    
    if (i < maxIterations - 1) {
      console.log('\n⏳ Waiting 2 seconds before next iteration...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runContinuousOptimization().catch(console.error);
}

export default IterativeOptimizer;