#!/usr/bin/env node
/**
 * Direct Syntax Fix - CommonJS for compatibility
 * Targets the critical syntax errors preventing compilation
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

function getCurrentErrors() {
  try {
    execSync('npm run type-check 2>&1', {
      encoding: 'utf8', stdio: 'pipe', cwd: projectRoot, timeout: 30000
    });
    return [];
  } catch (error) {
    const output = `${error.stdout || ''}${error.stderr || ''}`;
    return parseErrors(output);
  }
}

function parseErrors(output) {
  const errors = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);
    if (match) {
      const [, file, lineNum, column, code, message] = match;
      errors.push({
        file: file.trim(),
        line: parseInt(lineNum),
        column: parseInt(column),
        code, 
        message: message.trim()
      });
    }
  }
  return errors;
}

function fixSpecificFiles() {
  let fixedCount = 0;

  // Fix 1: AdvancedVideoPlayer.tsx - malformed import
  const advancedPlayerPath = path.join(projectRoot, 'components/AdvancedVideoPlayer.tsx');
  if (existsSync(advancedPlayerPath)) {
    let content = readFileSync(advancedPlayerPath, 'utf8');
    const fixed = content.replace(
      /Cog6\s*ToothIcon/g,
      'Cog6ToothIcon'
    );
    if (fixed !== content) {
      writeFileSync(advancedPlayerPath, fixed);
      log('Fixed AdvancedVideoPlayer.tsx import');
      fixedCount++;
    }
  }

  // Fix 2: BaseForm.tsx - restore proper JSX structure
  const baseFormPath = path.join(projectRoot, 'components/BaseForm.tsx');
  if (existsSync(baseFormPath)) {
    let content = readFileSync(baseFormPath, 'utf8');
    
    // Remove the malformed // FIXED: comments and restore proper structure
    content = content.replace(/\/\/\s*FIXED:\s*/g, '');
    
    // Fix the specific malformed structure around line 299
    content = content.replace(
      /\{\s*showResetButton\s*&&\s*\(\s*<button[^>]*>\s*.*?{resetLabel}.*?\)\s*\}\s*\)\s*;\s*\}/gs,
      `{showResetButton && (
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
};`
    );

    writeFileSync(baseFormPath, content);
    log('Fixed BaseForm.tsx structure');
    fixedCount++;
  }

  // Fix 3: CommentsSection.tsx - fix malformed template literals
  const commentsSectionPath = path.join(projectRoot, 'components/CommentsSection.tsx');
  if (existsSync(commentsSectionPath)) {
    let content = readFileSync(commentsSectionPath, 'utf8');
    
    // Fix malformed template literal
    content = content.replace(
      /className=\{\s*`text-xs \$\{\s*\/>/g,
      'className={`text-xs ${'
    );
    
    // Fix unterminated regex patterns
    content = content.replace(
      /\/\/([^\/\n]*?)$/gm,
      '// $1'
    );
    
    // Remove malformed // FIXED: comments
    content = content.replace(/\/\/\s*FIXED:\s*/g, '');
    
    writeFileSync(commentsSectionPath, content);
    log('Fixed CommentsSection.tsx template literals');
    fixedCount++;
  }

  return fixedCount;
}

function fixAllErrorFiles() {
  const errors = getCurrentErrors();
  if (errors.length === 0) {
    log('No TypeScript errors found!', 'success');
    return 0;
  }

  log(`Found ${errors.length} TypeScript errors in ${new Set(errors.map(e => e.file)).size} files`);

  const errorFiles = [...new Set(errors.map(e => e.file))];
  let totalFixed = 0;

  for (const filePath of errorFiles) {
    if (!existsSync(filePath)) continue;

    try {
      let content = readFileSync(filePath, 'utf8');
      const original = content;

      // Apply comprehensive fixes
      
      // 1. Fix malformed imports
      content = content.replace(/Cog6\s*ToothIcon/g, 'Cog6ToothIcon');
      
      // 2. Remove malformed // FIXED: comments
      content = content.replace(/\/\/\s*FIXED:\s*/g, '');
      
      // 3. Fix incomplete JSX elements
      content = content.replace(/<(\w+)\s*\/>\s*\/\/[^}]*$/gm, '<$1 />');
      
      // 4. Fix malformed template literals
      content = content.replace(/className=\{\s*`[^`]*?\$\{\s*\/>/g, 'className={`');
      content = content.replace(/\$\{\s*\/>/g, '}');
      
      // 5. Fix unterminated strings and regexes  
      content = content.replace(/\/\/([^\/\n]*?)$/gm, '// $1');
      
      // 6. Fix missing closing brackets
      content = content.replace(/\{\s*([^}]*?)$/gm, '{$1}');

      if (content !== original) {
        writeFileSync(filePath, content);
        totalFixed++;
        log(`Fixed ${path.relative(projectRoot, filePath)}`);
      }

    } catch (error) {
      log(`Error processing ${filePath}: ${error.message}`, 'error');
    }
  }

  return totalFixed;
}

function main() {
  log('🚨 Starting Direct Syntax Fix...');

  const initialErrors = getCurrentErrors();
  log(`Initial error count: ${initialErrors.length}`);

  if (initialErrors.length === 0) {
    log('🎉 No errors found! Codebase is clean.', 'success');
    return;
  }

  // Try specific file fixes first
  const specificFixes = fixSpecificFiles();
  log(`Applied ${specificFixes} specific fixes`);

  // Then apply general fixes to all error files
  const generalFixes = fixAllErrorFiles();
  log(`Applied general fixes to ${generalFixes} files`);

  // Check final state
  const finalErrors = getCurrentErrors();
  const improvement = initialErrors.length - finalErrors.length;

  log('\n📊 DIRECT SYNTAX FIX RESULTS:');
  log(`Initial errors: ${initialErrors.length}`);
  log(`Final errors: ${finalErrors.length}`);
  log(`Errors fixed: ${improvement}`);

  if (finalErrors.length === 0) {
    log('🎉 ALL SYNTAX ERRORS FIXED!', 'success');
  } else if (improvement > 0) {
    log(`✅ Progress made! ${improvement} errors fixed`, 'success');
  } else {
    log('⚠️ No improvement - complex manual fixes may be needed');
  }

  if (finalErrors.length > 0 && finalErrors.length <= 10) {
    log('\n🔍 REMAINING ERRORS:');
    finalErrors.forEach(error => {
      log(`  ${error.file}(${error.line}): ${error.code} - ${error.message}`);
    });
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };