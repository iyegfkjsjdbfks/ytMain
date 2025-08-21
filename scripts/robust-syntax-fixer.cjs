#!/usr/bin/env node
/**
 * Robust Syntax Fixer
 * Handles the massive number of TypeScript errors (7669) by targeting the most critical ones first
 */

const { readFileSync, writeFileSync, existsSync } = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const projectRoot = process.cwd();

function log(message, type = 'info') {
  const colors = { info: '\x1b[36m', success: '\x1b[32m', error: '\x1b[31m', reset: '\x1b[0m' };
  const prefix = { info: '🔧', success: '✅', error: '❌' }[type] || '🔧';
  console.log(`${colors[type]}${prefix} ${message}${colors.reset}`);
}

function getErrorsWithTimeout() {
  try {
    // Use a longer timeout and capture errors properly
    const result = execSync('npm run type-check 2>&1', {
      encoding: 'utf8', 
      stdio: 'pipe', 
      cwd: projectRoot, 
      timeout: 60000 // 60 second timeout
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      output: `${error.stdout || ''}${error.stderr || ''}`,
      errorCount: (error.stdout || '').split('\n').filter(line => /error TS\d+:/.test(line)).length
    };
  }
}

function fixCriticalSyntaxPatterns() {
  log('🚨 Targeting critical syntax patterns that block compilation...');
  
  const criticalFiles = [
    'components/AdvancedVideoPlayer.tsx',
    'components/BaseForm.tsx', 
    'components/BaseModal.tsx',
    'components/CommentsSection.tsx',
    'components/CategoryTabs.tsx',
    'components/ChannelHeader.tsx',
    'components/ChannelTabs.tsx'
  ];

  let fixedCount = 0;

  for (const relativePath of criticalFiles) {
    const filePath = path.join(projectRoot, relativePath);
    if (!existsSync(filePath)) continue;

    try {
      let content = readFileSync(filePath, 'utf8');
      const original = content;

      // CRITICAL FIX 1: AdvancedVideoPlayer.tsx - Fix malformed import
      if (relativePath.includes('AdvancedVideoPlayer.tsx')) {
        content = content.replace(/Cog6\s*ToothIcon/g, 'Cog6ToothIcon');
      }

      // CRITICAL FIX 2: BaseForm.tsx - Complete reconstruction of malformed section
      if (relativePath.includes('BaseForm.tsx')) {
        // Find and replace the entire malformed section with a working version
        const malformedPattern = /\{showResetButton\s*&&[\s\S]*?export\s+default\s+BaseForm;/;
        
        const fixedSection = `{showResetButton && (
          <button
            type="button"
            onClick={() => {
              reset();
              setTouched({});
            }}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {resetLabel}
          </button>
        )}
      </div>
    </form>
  );
};

export default BaseForm;`;

        content = content.replace(malformedPattern, fixedSection);
      }

      // CRITICAL FIX 3: CommentsSection.tsx - Fix template literal and JSX issues
      if (relativePath.includes('CommentsSection.tsx')) {
        // Fix the malformed template literal
        content = content.replace(
          /className=\{\s*`text-xs \$\{\s*\/>/g,
          'className={`text-xs ${'
        );
        
        // Fix unterminated template literals
        content = content.replace(/\/\/\s*([^\/\n]*?)$/gm, '');
        
        // Fix malformed JSX elements
        content = content.replace(/<(\w+)\s*\/>\s*\/\/[^}]*$/gm, '<$1 />');
      }

      // UNIVERSAL FIXES for all files:
      
      // Fix 1: Remove all malformed // FIXED: comments
      content = content.replace(/\/\/\s*FIXED:\s*[^\n]*/g, '');
      
      // Fix 2: Fix incomplete JSX elements
      content = content.replace(/<(\w+)\s*\/>\s*$/gm, '<$1 />');
      
      // Fix 3: Fix malformed template literals
      content = content.replace(/\$\{\s*\/>/g, '}');
      content = content.replace(/`\s*\/>/g, '`');
      
      // Fix 4: Fix incomplete JSX attributes
      content = content.replace(/(\w+)=\{[^}]*\/>/g, '$1=""');
      
      // Fix 5: Remove trailing malformed comments
      content = content.replace(/\/\/\s*$/, '');

      if (content !== original) {
        writeFileSync(filePath, content);
        fixedCount++;
        log(`Fixed critical syntax in ${relativePath}`);
      }

    } catch (error) {
      log(`Error fixing ${relativePath}: ${error.message}`, 'error');
    }
  }

  return fixedCount;
}

function main() {
  log('🚨 Starting Robust Syntax Fix for 7669+ TypeScript errors...');

  // Get initial error state with robust timeout handling
  const initialState = getErrorsWithTimeout();
  log(`Initial error count: ${initialState.errorCount || 'timeout'}`);

  if (initialState.success) {
    log('🎉 No errors found! Codebase is clean.', 'success');
    return;
  }

  // Focus on critical files that are blocking compilation
  const fixedFiles = fixCriticalSyntaxPatterns();
  log(`Applied critical fixes to ${fixedFiles} files`);

  // Quick recheck to see if we made progress
  const finalState = getErrorsWithTimeout();
  
  if (finalState.success) {
    log('🎉 ALL SYNTAX ERRORS FIXED!', 'success');
  } else {
    const improvement = (initialState.errorCount || 0) - (finalState.errorCount || 0);
    
    log('\n📊 ROBUST SYNTAX FIX RESULTS:');
    log(`Initial errors: ${initialState.errorCount || 'timeout'}`);
    log(`Final errors: ${finalState.errorCount || 'timeout'}`);
    log(`Errors fixed: ${improvement}`);

    if (improvement > 0) {
      log(`✅ Progress made! ${improvement} errors fixed`, 'success');
    } else {
      log('⚠️ Limited progress - may need additional targeted fixes');
    }

    // Show sample of remaining errors
    if (finalState.output) {
      const errorLines = finalState.output.split('\n').filter(line => /error TS\d+:/.test(line));
      log('\n🔍 SAMPLE OF REMAINING ERRORS:');
      errorLines.slice(0, 5).forEach(line => {
        log(`  ${line}`);
      });
    }
  }

  // Recommend next steps
  log('\n📝 NEXT STEPS:');
  if (finalState.success) {
    log('• Run npm run validate to verify build works');
    log('• Test the application functionality');
  } else {
    log('• Continue with enhanced orchestrator for remaining errors');
    log('• Consider manual review of most problematic files');
    log('• Run npm run orchestrate:enhanced-v2 for systematic fixing');
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };