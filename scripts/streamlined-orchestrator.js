#!/usr/bin/env node
/**
 * Streamlined TypeScript Error Fixing Orchestrator
 * Focus on the most effective fixers in order
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class StreamlinedOrchestrator {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.maxIterations = 10;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
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
      warning: '⚠️',
      error: '❌'
    }[type] || '🔧';
    
    console.log(`${colors[type]}${prefix} [${timestamp}] ${message}${colors.reset}`);
  }

  getTotalErrorCount() {
    try {
      const result = execSync('npm run type-check 2>&1', { 
        encoding: 'utf8', 
        stdio: 'pipe', 
        cwd: projectRoot,
        timeout: 60000
      });
      return 0; // No errors
    } catch (err) {
      const output = `${err.stdout || ''}${err.stderr || ''}`;
      const errorLines = output.split('\n').filter(line => /error TS\d+:/.test(line));
      return errorLines.length;
    }
  }

  runScript(scriptName, maxIterations = 3) {
    this.log(`Running ${scriptName} (max ${maxIterations} iterations)...`);
    
    let bestImprovement = 0;
    let iteration = 0;
    
    while (iteration < maxIterations) {
      const beforeCount = this.getTotalErrorCount();
      
      if (beforeCount === 0) {
        this.log(`All errors resolved! Stopping.`, 'success');
        return { success: true, improvement: bestImprovement, stopped: true };
      }
      
      try {
        this.log(`Iteration ${iteration + 1}/${maxIterations}: ${beforeCount} errors`);
        
        const output = execSync(`node scripts/${scriptName}`, {
          encoding: 'utf8',
          stdio: 'pipe',
          cwd: projectRoot,
          timeout: 180000 // 3 minutes
        });
        
        const afterCount = this.getTotalErrorCount();
        const improvement = beforeCount - afterCount;
        
        this.log(`Result: ${improvement} errors fixed (${beforeCount} → ${afterCount})`);
        
        if (improvement > 0) {
          bestImprovement += improvement;
          iteration++;
          
          // If significant improvement, continue
          if (improvement >= 5) {
            continue;
          }
        } else {
          // No improvement, stop iterations
          this.log(`No improvement in iteration ${iteration + 1}, stopping`);
          break;
        }
        
        iteration++;
      } catch (error) {
        this.log(`Error running ${scriptName}: ${error.message}`, 'error');
        break;
      }
    }
    
    return { 
      success: bestImprovement > 0, 
      improvement: bestImprovement,
      iterations: iteration
    };
  }

  async run() {
    this.log('🚀 Starting Streamlined TypeScript Error Fixing...');
    
    const initialCount = this.getTotalErrorCount();
    this.log(`Initial total errors: ${initialCount}`);
    
    if (initialCount === 0) {
      this.log('🎉 No TypeScript errors found! Codebase is clean.', 'success');
      return;
    }

    // Run fixers in order of effectiveness
    const fixers = [
      { script: 'fix-comprehensive-syntax.js', iterations: 3, description: 'Comprehensive syntax fixes' },
      { script: 'fix-ts1005-critical-syntax.js', iterations: 2, description: 'Critical TS1005 fixes' },
      { script: 'fix-ts1144-critical.js', iterations: 2, description: 'TS1144 brace/semicolon fixes' },
      { script: 'fix-ts1128-declaration-expected.js', iterations: 2, description: 'TS1128 declaration fixes' },
      { script: 'fix-ts1109-expression-expected.js', iterations: 2, description: 'TS1109 expression fixes' }
    ];

    let totalImprovement = 0;
    
    for (const fixer of fixers) {
      const scriptPath = join(projectRoot, 'scripts', fixer.script);
      
      if (!existsSync(scriptPath)) {
        this.log(`Script not found: ${fixer.script}, skipping`, 'warning');
        continue;
      }
      
      this.log(`\n${'='.repeat(60)}`);
      this.log(`Running: ${fixer.description}`);
      this.log(`${'='.repeat(60)}`);
      
      const result = this.runScript(fixer.script, fixer.iterations);
      this.results.push({
        script: fixer.script,
        description: fixer.description,
        improvement: result.improvement,
        success: result.success,
        iterations: result.iterations || 0
      });
      
      totalImprovement += result.improvement;
      
      if (result.stopped) {
        this.log('🎉 All errors resolved!', 'success');
        break;
      }
      
      // Small delay between fixers
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Final report
    const finalCount = this.getTotalErrorCount();
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    this.log('\n' + '='.repeat(80));
    this.log('📊 STREAMLINED ORCHESTRATION REPORT');
    this.log('='.repeat(80));
    this.log(`⏱️  Duration: ${duration} seconds`);
    this.log(`📈 Initial errors: ${initialCount}`);
    this.log(`📉 Final errors: ${finalCount}`);
    this.log(`✨ Total fixed: ${totalImprovement}`);
    this.log(`🎯 Success rate: ${initialCount > 0 ? ((totalImprovement / initialCount) * 100).toFixed(1) : '0'}%`);

    this.log('\n📋 FIXER BREAKDOWN:');
    for (const result of this.results) {
      const status = result.success ? '✅' : '❌';
      this.log(`${status} ${result.description}: ${result.improvement} errors fixed (${result.iterations} iterations)`);
    }

    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      initialErrors: initialCount,
      finalErrors: finalCount,
      totalFixed: totalImprovement,
      successRate: initialCount > 0 ? ((totalImprovement / initialCount) * 100).toFixed(1) : '0',
      fixerResults: this.results
    };
    
    writeFileSync(join(projectRoot, 'streamlined-orchestration-report.json'), JSON.stringify(report, null, 2));

    this.log('\n📝 NEXT STEPS:');
    if (finalCount === 0) {
      this.log('🎉 All TypeScript errors resolved!', 'success');
      this.log('• Run npm run validate to verify the build');
      this.log('• Consider running tests to ensure functionality is preserved');
    } else if (finalCount < initialCount) {
      this.log(`✅ Progress made: ${totalImprovement} errors fixed`, 'success');
      this.log(`• ${finalCount} errors remaining`);
      this.log('• Run npm run type-check to see remaining errors');
      this.log('• Consider manual review for remaining complex errors');
      this.log('• Re-run this orchestrator if patterns emerge');
    } else {
      this.log('⚠️  No net improvement achieved', 'warning');
      this.log('• Review the remaining errors manually');
      this.log('• Consider creating specialized fixers for specific patterns');
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new StreamlinedOrchestrator();
  orchestrator.run().catch(err => {
    console.error('StreamlinedOrchestrator failed:', err);
    process.exitCode = 1;
  });
}

export { StreamlinedOrchestrator };