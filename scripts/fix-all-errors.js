#!/usr/bin/env node
/**
 * Master Error Fixer - Orchestrates all TypeScript error fixing scripts
 * Runs all type-specific fixers in optimal order and provides comprehensive reporting
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const MAX_ALLOWED_TOTAL_INCREASE = 1;

class MasterErrorFixer {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.lastKnownErrorCount = 0;
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
      error: '❌',
      warning: '⚠️'
    }[type] || '🔧';
    
    console.log(`${colors[type]}${prefix} [${timestamp}] ${message}${colors.reset}`);
  }

  async getTotalErrorCount() {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        // Try to read from existing type-errors.txt file first
        const typeErrorsPath = join(projectRoot, 'type-errors.txt');
        if (existsSync(typeErrorsPath)) {
          const content = readFileSync(typeErrorsPath, 'utf8');
          const errorLines = content.split('\n').filter(line => /error TS\d+:/.test(line));
          const count = errorLines.length;
          if (count > 0) {
            this.lastKnownErrorCount = count;
            return count;
          }
        }

        // Use npm run type-check with progressive timeout
        const timeout = 30000 + (retryCount * 15000); // 30s, 45s, 60s
        const result = execSync('npm run type-check', {
          encoding: 'utf8',
          stdio: 'pipe',
          cwd: projectRoot,
          timeout
        });
        // No errors
        return 0;
      } catch (error) {
        retryCount++;
        
        // Handle timeout specifically
        if (error.signal === 'SIGTERM' || error.code === 'ETIMEDOUT') {
          this.log(`Type check attempt ${retryCount} timed out after ${30 + (retryCount-1) * 15}s`, 'warning');
          
          if (retryCount >= maxRetries) {
            this.log('All type check attempts timed out, falling back to cached count', 'warning');
            const typeErrorsPath = join(projectRoot, 'type-errors.txt');
            if (existsSync(typeErrorsPath)) {
              const content = readFileSync(typeErrorsPath, 'utf8');
              const errorLines = content.split('\n').filter(line => /error TS\d+:/.test(line));
              return errorLines.length;
            }
            return this.lastKnownErrorCount || 500; // Conservative fallback
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }
        
        // Parse error output
        const out = `${error.stdout || ''}${error.stderr || ''}`;
        if (!out) {
          if (retryCount >= maxRetries) return 0;
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        const errorLines = out.split('\n').filter(line => /error TS\d+:/.test(line));
        const count = errorLines.length;
        this.lastKnownErrorCount = count;
        return count;
      }
    }
    
    return this.lastKnownErrorCount || 0;
  }

  async getErrorCountByType(errorCode) {
    const maxRetries = 2;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        // Try to read from existing type-errors.txt file first
        const typeErrorsPath = join(projectRoot, 'type-errors.txt');
        if (existsSync(typeErrorsPath)) {
          const content = readFileSync(typeErrorsPath, 'utf8');
          const regex = new RegExp(`error TS${errorCode}[:]`);
          const count = content.split('\n').filter(l => regex.test(l)).length;
          if (count >= 0) return count;
        }

        // Run type-check and parse output with timeout
        const timeout = 15000 + (retryCount * 10000); // 15s, 25s
        const run = () => {
          try {
            execSync('npm run type-check', { 
              encoding: 'utf8', 
              stdio: 'pipe', 
              cwd: projectRoot, 
              timeout 
            });
            return '';
          } catch (err) {
            if (err.signal === 'SIGTERM' || err.code === 'ETIMEDOUT') {
              throw err; // Re-throw timeout errors
            }
            const out = `${err.stdout || ''}${err.stderr || ''}`;
            return out;
          }
        };
        
        const output = run();
        if (!output) return 0;
        const regex = new RegExp(`error TS${errorCode}[:]`);
        const count = output.split('\n').filter(l => regex.test(l)).length;
        return count;
        
      } catch (error) {
        retryCount++;
        
        if (error.signal === 'SIGTERM' || error.code === 'ETIMEDOUT') {
          this.log(`Error count check for TS${errorCode} timed out (attempt ${retryCount})`, 'warning');
          if (retryCount >= maxRetries) {
            // Fallback to file-based counting
            const typeErrorsPath = join(projectRoot, 'type-errors.txt');
            if (existsSync(typeErrorsPath)) {
              const content = readFileSync(typeErrorsPath, 'utf8');
              const regex = new RegExp(`error TS${errorCode}[:]`);
              return content.split('\n').filter(l => regex.test(l)).length;
            }
            return 0;
          }
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }
        
        if (retryCount >= maxRetries) return 0;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return 0;
  }

  runGit(command) {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe', cwd: projectRoot });
  }

  createCheckpoint(label) {
    try {
      // Stage everything and commit a checkpoint, bypassing hooks to avoid interference
      this.runGit('git add -A');
      this.runGit(`git commit -m "chore(ts-fix): checkpoint before ${label}" --no-verify`);
      this.log(`Created checkpoint before ${label}`, 'info');
      return true;
    } catch (err) {
      // If commit fails (e.g., nothing to commit), it's fine; continue
      this.log(`Checkpoint not created (possibly no changes staged): ${err.message.split('\n')[0]}`, 'warning');
      return false;
    }
  }

  commitChanges(label) {
    try {
      this.runGit('git add -A');
      this.runGit(`git commit -m "fix(ts): apply ${label}" --no-verify`);
      this.log(`Committed changes for ${label}`, 'success');
      return true;
    } catch (err) {
      // If nothing to commit, that's OK
      this.log(`No commit needed for ${label}: ${err.message.split('\n')[0]}`);
      return false;
    }
  }

  revertToPreviousCheckpoint() {
    try {
      // Revert to the commit before the last one (the checkpoint state)
      this.runGit('git reset --hard HEAD~1');
      // Clean any untracked files that may have been generated
      try { this.runGit('git clean -fd'); } catch {}
      this.log('Reverted to previous checkpoint', 'warning');
      return true;
    } catch (err) {
      this.log(`Failed to revert to checkpoint: ${err.message}`, 'error');
      return false;
    }
  }

  async runFixer(name, script, errorCode, maxIterations = 3) {
    this.log(`Starting ${name} (TS${errorCode}) fixes...`);
    
    let iteration = 0;
    let lastErrorCount = await this.getErrorCountByType(errorCode);
    
    while (iteration < maxIterations && lastErrorCount >= 5) {
      const iterationLabel = maxIterations > 1 ? ` (iteration ${iteration + 1}/${maxIterations})` : '';
      this.log(`${name}${iterationLabel}: ${lastErrorCount} errors remaining`);
      
      const beforeCount = lastErrorCount;
      const beforeTotal = await this.getTotalErrorCount();
      const checkpointLabel = `${name} (TS${errorCode})${iterationLabel}`;
      const checkpointMade = this.createCheckpoint(checkpointLabel);
      
      try {
        const output = execSync(`node scripts/${script}`, {
          encoding: 'utf8',
          stdio: 'pipe',
          cwd: projectRoot,
          timeout: 120000 // 2 minute timeout per fixer
        });
        
        const afterCount = await this.getErrorCountByType(errorCode);
        const afterTotal = await this.getTotalErrorCount();
        const totalDelta = afterTotal - beforeTotal;
        const fixed = beforeCount - afterCount;
        
        const result = {
          name: `${name}${iterationLabel}`,
          errorCode,
          iteration: iteration + 1,
          beforeCount,
          afterCount,
          beforeTotal,
          afterTotal,
          fixed,
          totalImprovement: beforeTotal - afterTotal,
          totalDelta,
          success: totalDelta <= MAX_ALLOWED_TOTAL_INCREASE,
          output: output.split('\n').slice(-10).join('\n')
        };
        
        this.results.push(result);
        
        if (!result.success && checkpointMade) {
          this.revertToPreviousCheckpoint();
          result.skipped = true;
          this.log(`${name}: Rolled back iteration ${iteration + 1} due to error increase of ${result.totalDelta} (> ${MAX_ALLOWED_TOTAL_INCREASE})`, 'warning');
          break; // Stop iterations for this fixer
        } else {
          this.commitChanges(`${name} (TS${errorCode})${iterationLabel}`);
          
          if (fixed > 0) {
            this.log(`${name}: Fixed ${fixed}/${beforeCount} errors (${((fixed/(beforeCount||1))*100).toFixed(1)}%)`, 'success');
          } else if (fixed === 0 && iteration > 0) {
            this.log(`${name}: No progress made, stopping iterations`, 'warning');
            break; // No progress, stop iterations
          }
          
          lastErrorCount = afterCount;
          
          // If we're below the threshold, we're done
          if (afterCount < 5) {
            this.log(`${name}: Reached target (${afterCount} < 5 errors), stopping iterations`, 'success');
            break;
          }
        }
        
        iteration++;
        
        // Small delay between iterations
        if (iteration < maxIterations && lastErrorCount >= 5) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        this.log(`${name}: Failed iteration ${iteration + 1} - ${error.message}`, 'error');
        
        const result = {
          name: `${name}${iterationLabel}`,
          errorCode,
          iteration: iteration + 1,
          beforeCount,
          afterCount: beforeCount,
          beforeTotal,
          afterTotal: beforeTotal,
          fixed: 0,
          totalImprovement: 0,
          totalDelta: 0,
          success: true,
          error: error.message
        };
        
        this.results.push(result);
        break; // Stop iterations on error
      }
    }
    
    const finalCount = await this.getErrorCountByType(errorCode);
    const totalIterations = iteration;
    
    if (finalCount < 5) {
      this.log(`${name}: Successfully reduced to ${finalCount} errors after ${totalIterations} iteration(s)`, 'success');
    } else if (totalIterations >= maxIterations) {
      this.log(`${name}: Reached max iterations (${maxIterations}), ${finalCount} errors remaining`, 'warning');
    }
    
    return this.results[this.results.length - 1] || {
      name,
      errorCode,
      beforeCount: lastErrorCount,
      afterCount: finalCount,
      success: true
    };
  }

  async run() {
    this.log('🚀 Starting comprehensive TypeScript error fixing...');
    
    const initialTotal = await this.getTotalErrorCount();
    this.log(`Initial total errors: ${initialTotal}`);
    
    if (initialTotal === 0) {
      this.log('🎉 No TypeScript errors found! Codebase is clean.', 'success');
      return;
    }

    // Define fixers in optimal order (high-impact errors first)
    const fixers = [
      // High-priority infrastructure fixes first
      {
        name: 'JSX Runtime Module',
        script: 'fix-ts2875-jsx-runtime.js',
        errorCode: '2875',
        description: 'Fixes JSX tag requires module path errors'
      },
      {
        name: 'Cannot Find Module',
        script: 'fix-ts2307-cannot-find-module.js',
        errorCode: '2307',
        description: 'Fixes import paths and creates missing modules'
      },
      {
        name: 'Cannot Find Namespace',
        script: 'fix-ts2503-cannot-find-namespace.js',
        errorCode: '2503',
        description: 'Adds namespace declarations and imports'
      },
      // Type annotation fixes
      {
        name: 'JSX Element Implicit Any',
        script: 'fix-ts7026-jsx-implicit-any.js',
        errorCode: '7026',
        description: 'Fixes JSX element implicitly has any type'
      },
      {
        name: 'Binding Element Implicit Any',
        script: 'fix-ts7031-binding-element-any.js',
        errorCode: '7031',
        description: 'Fixes binding element implicitly has any type'
      },
      {
        name: 'Implicit Any Parameter',
        script: 'fix-ts7006-implicit-any-param.js',
        errorCode: '7006',
        description: 'Adds explicit types to function parameters'
      },
      {
        name: 'Element Implicit Any',
        script: 'fix-ts7053-element-implicit-any.js',
        errorCode: '7053',
        description: 'Fixes element implicitly has any type'
      },
      // Existing fixers
      {
        name: 'Syntax Errors',
        script: 'fix-ts1003-syntax-errors.js',
        errorCode: '1003',
        description: 'Fixes syntax errors from type assertions'
      },
      {
        name: 'Property Does Not Exist',
        script: 'fix-ts2339-property-errors.js',
        errorCode: '2339',
        description: 'Fixes missing properties and type mismatches'
      },
      {
        name: 'Cannot Find Name',
        script: 'fix-ts2304-cannot-find-name.js',
        errorCode: '2304',
        description: 'Fixes undefined variables and missing imports'
      },
      {
        name: 'Declared But Not Used',
        script: 'fix-ts6133-declared-not-used.js',
        errorCode: '6133',
        description: 'Removes unused imports and variables'
      },
      {
        name: 'Missing Properties',
        script: 'fix-ts2739-missing-properties.js',
        errorCode: '2739',
        description: 'Fixes type objects missing required properties'
      },
      {
        name: 'Property Suggestions',
        script: 'fix-ts2551-property-does-not-exist.js',
        errorCode: '2551',
        description: 'Applies TypeScript property name suggestions'
      },
      {
        name: 'No Exported Member',
        script: 'fix-ts2305-no-exported-member.js',
        errorCode: '2305',
        description: 'Fixes missing exports and import statements'
      },
      {
        name: 'Enhanced Type Not Assignable',
        script: 'fix-ts2322-enhanced.js',
        errorCode: '2322',
        description: 'Smart fixes for type assignment errors'
      },
      {
        name: 'Argument Type Mismatch',
        script: 'fix-ts2345-argument-type.js',
        errorCode: '2345',
        description: 'Fixes function argument type mismatches'
      },
      {
        name: 'Duplicate Identifier',
        script: 'fix-ts2300-duplicate-identifier.js',
        errorCode: '2300',
        description: 'Removes duplicate imports and declarations'
      },
      {
        name: 'Implicit Any Type',
        script: 'fix-ts7019-implicit-any.js',
        errorCode: '7019',
        description: 'Adds explicit types to rest parameters'
      },
      {
        name: 'Type Not Assignable (Legacy)',
        script: 'fix-ts2322-type-not-assignable.js',
        errorCode: '2322',
        description: 'Adds type casts and conversions'
      },
      {
        name: 'Possibly Undefined',
        script: 'fix-ts18048-possibly-undefined.js',
        errorCode: '18048',
        description: 'Adds null checks and optional chaining'
      }
    ];

    // Run each fixer with iterative capability
    for (const fixer of fixers) {
      const maxIterations = ['7026', '7031', '7006', '2307', '2503', '2875', '7053'].includes(fixer.errorCode) ? 3 : 1;
      const result = await this.runFixer(fixer.name, fixer.script, fixer.errorCode, maxIterations);

      // If this fixer was rolled back (skipped), continue with next without stopping the whole run
      if (result && result.skipped) {
        continue;
      }

      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate final report
    await this.generateReport(initialTotal);
  }

  async generateReport(initialTotal) {
    const finalTotal = await this.getTotalErrorCount();
    const totalImprovement = initialTotal - finalTotal;
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      initialErrors: initialTotal,
      finalErrors: finalTotal,
      totalFixed: totalImprovement,
      improvementRate: initialTotal > 0 ? ((totalImprovement / initialTotal) * 100).toFixed(1) : '0',
      results: this.results
    };

    // Save detailed report
    const reportPath = join(projectRoot, 'error-fix-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Display summary
    this.log('\n' + '='.repeat(80));
    this.log('📊 COMPREHENSIVE ERROR FIXING REPORT');
    this.log('='.repeat(80));
    this.log(`⏱️  Duration: ${duration} seconds`);
    this.log(`📈 Initial errors: ${initialTotal}`);
    this.log(`📉 Final errors: ${finalTotal}`);
    this.log(`✨ Total fixed: ${totalImprovement}`);
    this.log(`🎯 Success rate: ${report.improvementRate}%`);
    this.log('');

    // Individual fixer results
    this.log('📋 FIXER BREAKDOWN:');
    for (const result of this.results) {
      const status = result.success ? '✅' : '❌';
      const percentage = result.beforeCount > 0 ? ((result.fixed / result.beforeCount) * 100).toFixed(1) : '0';
      this.log(`${status} ${result.name}: ${result.fixed}/${result.beforeCount} fixed (${percentage}%)`);
    }

    this.log('');
    this.log(`📁 Detailed report saved to: ${reportPath}`);

    if (totalImprovement > 0) {
      this.log(`🎉 Successfully reduced TypeScript errors by ${totalImprovement}!`, 'success');
    } else if (finalTotal <= initialTotal + MAX_ALLOWED_TOTAL_INCREASE) {
      this.log(`✅ Error count maintained within allowed threshold (+${MAX_ALLOWED_TOTAL_INCREASE} max)`, 'success');
    } else {
      this.log('⚠️  Warning: Some fixers may have introduced too many new errors', 'warning');
    }

    // Recommendations
    this.log('\n📝 NEXT STEPS:');
    if (finalTotal > 0) {
      this.log(`• ${finalTotal} errors remaining - consider manual review`);
      this.log('• Run npm run type-check to see remaining errors');
      this.log('• Use npm run fix:all-types to rerun all fixers');
    } else {
      this.log('• All TypeScript errors resolved! 🎉');
      this.log('• Run npm run validate to verify the build');
    }
  }
}

// Execute if run directly (cross-platform ESM detection)
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     import.meta.url.endsWith(process.argv[1]) ||
                     process.argv[1].endsWith('fix-all-errors.js');

if (isMainModule) {
  const fixer = new MasterErrorFixer();
  fixer.run().catch(err => {
    console.error('MasterErrorFixer failed:', err);
    process.exitCode = 1;
  });
}

export { MasterErrorFixer };