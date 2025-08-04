#!/usr/bin/env node
/**
 * Master Refactoring Script
 * 
 * Orchestrates systematic refactoring and optimization of the entire codebase
 * by running existing refactoring scripts in the optimal order.
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class MasterRefactorer {
  constructor() {
    this.phase = 1;
    this.results = {
      success: [],
      warnings: [],
      errors: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
    
    if (type === 'error') this.results.errors.push(message);
    if (type === 'warning') this.results.warnings.push(message);
    if (type === 'success') this.results.success.push(message);
  }

  async runCommand(command, description, options = {}) {
    this.log(`Running: ${description}`);
    try {
      const output = execSync(command, { 
        cwd: projectRoot, 
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      this.log(`✓ ${description} completed`, 'success');
      return { success: true, output };
    } catch (error) {
      this.log(`✗ ${description} failed: ${error.message}`, 'error');
      return { success: false, error: error.message, output: error.stdout };
    }
  }

  async runRefactorScript(scriptName, description) {
    const scriptPath = join(__dirname, scriptName);
    if (!existsSync(scriptPath)) {
      this.log(`Script not found: ${scriptName}`, 'warning');
      return false;
    }

    this.log(`=== Running ${scriptName} ===`);
    const result = await this.runCommand(`node "${scriptPath}"`, description);
    return result.success;
  }

  // Phase 1: Core Infrastructure Fixes
  async fixCoreInfrastructure() {
    this.log('=== PHASE 1: Core Infrastructure Fixes ===');
    
    // Fix immediate TypeScript config issues
    await this.fixTypeScriptConfig();
    
    // Run comprehensive syntax fixes
    await this.runRefactorScript('comprehensive-syntax-fixer.js', 'Comprehensive syntax fixing');
    
    // Run phase 2 syntax fixes
    await this.runRefactorScript('phase2-syntax-fixer.js', 'Phase 2 syntax fixes');
    
    this.log('Phase 1 completed: Core infrastructure fixed', 'success');
  }

  async fixTypeScriptConfig() {
    this.log('Fixing TypeScript configuration...');
    
    // Ensure vite-env.d.ts is properly configured
    const viteEnvPath = join(projectRoot, 'vite-env.d.ts');
    if (existsSync(viteEnvPath)) {
      let content = readFileSync(viteEnvPath, 'utf8');
      if (content.startsWith('// /')) {
        content = content.replace('// /', '///');
        writeFileSync(viteEnvPath, content);
        this.log('Fixed vite-env.d.ts reference directive', 'success');
      }
    }

    // Add global types file for vitest
    const globalTypesPath = join(projectRoot, 'src', 'types', 'global.d.ts');
    const globalTypesContent = `/// <reference types="vitest/globals" />
/// <reference types="vite/client" />

declare global {
  namespace Vi {
    interface AssertsShape {
      toBeInTheDocument(): void;
    }
  }
}
`;
    
    if (!existsSync(globalTypesPath)) {
      writeFileSync(globalTypesPath, globalTypesContent);
      this.log('Created global types file for vitest', 'success');
    }
  }

  // Phase 2: Module and Import Resolution
  async fixModulesAndImports() {
    this.log('=== PHASE 2: Module and Import Resolution ===');
    
    // Run iterative module fixer
    await this.runRefactorScript('iterative-module-fixer.js', 'Iterative module fixing');
    
    // Run targeted import fixes
    await this.runRefactorScript('targeted-import-fix.js', 'Targeted import fixes');
    
    // Run remaining imports fix
    await this.runRefactorScript('fix-remaining-imports.js', 'Fix remaining imports');
    
    this.log('Phase 2 completed: Modules and imports fixed', 'success');
  }

  // Phase 3: TypeScript Error Resolution
  async fixTypeScriptErrors() {
    this.log('=== PHASE 3: TypeScript Error Resolution ===');
    
    // Run specific TypeScript error fixes
    await this.runRefactorScript('fix-typescript-errors.js', 'TypeScript error fixes');
    
    // Run critical error fixes
    await this.runRefactorScript('fix-critical-errors.js', 'Critical error fixes');
    
    // Run advanced error fixes
    await this.runRefactorScript('fix-advanced-errors.js', 'Advanced error fixes');
    
    this.log('Phase 3 completed: TypeScript errors resolved', 'success');
  }

  // Phase 4: Code Quality and Optimization
  async optimizeCodeQuality() {
    this.log('=== PHASE 4: Code Quality and Optimization ===');
    
    // Run comprehensive refactoring
    await this.runRefactorScript('comprehensive-refactor-v2.js', 'Comprehensive refactoring v2');
    
    // Run iterative optimizer
    await this.runRefactorScript('iterative-optimizer.js', 'Iterative optimization');
    
    // Fix ESLint issues
    await this.runRefactorScript('fix-eslint-issues.js', 'ESLint fixes');
    
    this.log('Phase 4 completed: Code quality optimized', 'success');
  }

  // Phase 5: Final Cleanup and Validation
  async finalCleanupAndValidation() {
    this.log('=== PHASE 5: Final Cleanup and Validation ===');
    
    // Run final comprehensive cleanup
    await this.runRefactorScript('final-comprehensive-cleanup.js', 'Final comprehensive cleanup');
    
    // Run final validation
    await this.runRefactorScript('final-refactor-validation.js', 'Final refactor validation');
    
    this.log('Phase 5 completed: Final cleanup and validation done', 'success');
  }

  // Phase 6: Comprehensive Testing
  async runComprehensiveTesting() {
    this.log('=== PHASE 6: Comprehensive Testing ===');
    
    // Type checking
    this.log('Running TypeScript type checking...');
    const typeCheckResult = await this.runCommand('npm run type-check', 'TypeScript type checking', { silent: true });
    
    // Linting
    this.log('Running ESLint...');
    const lintResult = await this.runCommand('npm run lint', 'ESLint checking', { silent: true });
    
    // Building
    this.log('Building project...');
    const buildResult = await this.runCommand('npm run build:optimized', 'Project build', { silent: true });
    
    // Testing (with memory-safe options)
    this.log('Running tests...');
    const testResult = await this.runCommand('npm run test:simple', 'Test suite', { silent: true });
    
    const allPassed = typeCheckResult.success && lintResult.success && buildResult.success && testResult.success;
    
    if (allPassed) {
      this.log('All validation tests passed!', 'success');
    } else {
      this.log('Some validation tests failed - manual fixes may be needed', 'warning');
    }
    
    return allPassed;
  }

  // Main orchestration
  async run() {
    this.log('🚀 Starting master refactoring process...');
    
    try {
      await this.fixCoreInfrastructure();
      await this.fixModulesAndImports();
      await this.fixTypeScriptErrors();
      await this.optimizeCodeQuality();
      await this.finalCleanupAndValidation();
      
      const allTestsPassed = await this.runComprehensiveTesting();
      
      if (allTestsPassed) {
        this.log('🎉 Master refactoring completed successfully!', 'success');
      } else {
        this.log('🔧 Master refactoring completed with some issues - see summary', 'warning');
      }
      
      this.printSummary();
      
    } catch (error) {
      this.log(`💥 Fatal error during master refactoring: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 MASTER REFACTORING SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successful Operations: ${this.results.success.length}`);
    console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
    console.log(`❌ Errors: ${this.results.errors.length}`);
    console.log('='.repeat(80));
    
    if (this.results.success.length > 0) {
      console.log('\n🔧 Successful Operations:');
      this.results.success.forEach(msg => console.log(`  • ${msg}`));
    }
    
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.results.warnings.forEach(msg => console.log(`  • ${msg}`));
    }
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.results.errors.forEach(msg => console.log(`  • ${msg}`));
    }

    console.log('\n📋 Next Steps:');
    console.log('  • Review any remaining errors manually');
    console.log('  • Run validation: npm run validate:comprehensive');
    console.log('  • Test application: npm run dev');
    console.log('  • Check documentation: README.md');
  }
}

// Run the master refactoring if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const refactorer = new MasterRefactorer();
  refactorer.run().catch(console.error);
}

export default MasterRefactorer;