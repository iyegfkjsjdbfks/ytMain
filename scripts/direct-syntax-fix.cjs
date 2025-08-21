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

      // Apply comprehensive fixes based on the specific errors observed
      
      // 1. Fix malformed imports (AdvancedVideoPlayer.tsx)
      content = content.replace(/Cog6\s*ToothIcon/g, 'Cog6ToothIcon');
      
      // 2. Remove malformed // FIXED: comments completely
      content = content.replace(/\/\/\s*FIXED:\s*[^\n]*/g, '');
      
      // 3. Fix BaseForm.tsx specific issue - completely rebuild the problematic section
      if (filePath.includes('BaseForm.tsx')) {
        // Fix the malformed JSX structure around the reset button
        content = content.replace(
          /\{\s*showResetButton\s*&&\s*\([^}]*?\{resetLabel\}[^}]*?\)\s*\}\s*[^}]*?\}\s*;\s*\}/gs,
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
      }
      
      // 4. Fix CommentsSection.tsx template literals
      if (filePath.includes('CommentsSection.tsx')) {
        // Fix the malformed template literal pattern
        content = content.replace(
          /className=\{\s*`text-xs \$\{\s*\/>/g,
          'className={`text-xs ${'
        );
        
        // Fix incomplete JSX structures
        content = content.replace(
          /<span[^>]*>\s*\{[^}]*\}\s*<\/span>/g,
          (match) => {
            if (match.includes('editText.length > maxCommentLength')) {
              return `<span className={\`text-xs \${editText.length > maxCommentLength ? 'text-red-500 dark:text-red-400' : 'text-neutral-500 dark:text-neutral-400'}\`}>
                {editText.length}/{maxCommentLength}
              </span>`;
            }
            return match;
          }
        );
      }
      
      // 5. Fix incomplete JSX elements and missing attributes
      content = content.replace(/<button\s*\/>/g, '<button');
      content = content.replace(/<(\w+)\s*\/>\s*$/gm, '<$1 />');
      
      // 6. Fix malformed template literals and expressions
      content = content.replace(/\$\{\s*\/>/g, '}');
      content = content.replace(/`\s*\/>/g, '`');
      
      // 7. Fix unterminated regex patterns
      content = content.replace(/\/\/([^\/\n]*?)$/gm, '// $1');
      
      // 8. Fix missing closing brackets and parentheses
      content = content.replace(/\{\s*([^}]*?)$(?!\n.*\})/gm, '{$1}');

      // 9. Fix specific problematic patterns from the error list
      
      // Fix JSX closing tag issues
      content = content.replace(/\/\/[^<]*?<\/(\w+)>/g, '</$1>');
      
      // Fix malformed JSX attributes
      content = content.replace(/(\w+)=\{[^}]*\/>/g, '$1=""');

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

  // Apply fixes to all error files
  const fixedFiles = fixAllErrorFiles();
  log(`Applied fixes to ${fixedFiles} files`);

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
    log('⚠️ No improvement - examining specific issues...');
    
    // Show first few errors for manual analysis
    if (finalErrors.length > 0) {
      log('\n🔍 FIRST 5 REMAINING ERRORS:');
      finalErrors.slice(0, 5).forEach(error => {
        log(`  ${error.file}(${error.line}): ${error.code} - ${error.message}`);
      });
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };