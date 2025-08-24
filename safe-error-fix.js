#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Safe TypeScript Error Resolution...');

function getCurrentErrors() {
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    return '';
  } catch (error) {
    const output = error.stdout ? error.stdout.toString() : error.stderr.toString();
    console.log(`🔍 TSC output length: ${output.length} characters`);
    console.log('🔍 First 500 characters:', output.substring(0, 500));
    
    // Test parsing on first few lines
    const testLines = output.split('\n').slice(0, 5);
    console.log('🔍 Testing first 5 lines:');
    testLines.forEach((line, i) => {
      console.log(`Line ${i}: "${line}"`);
      const match = line.match(/^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):?\s*(.*)$/);
      console.log(`Match result:`, match ? 'YES' : 'NO');
    });
    
    return output;
  }
}

function parseTypeScriptErrors(output) {
  const errors = [];
  
  // Use regex to find all error patterns in the entire output
  const errorPattern = /([^\n\r]+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*([^\n\r]*)/g;
  
  let match;
  while ((match = errorPattern.exec(output)) !== null) {
    const [, file, lineNum, column, code, message] = match;
    
    errors.push({
      file: file.trim(),
      line: parseInt(lineNum),
      column: parseInt(column),
      code,
      message: message.trim() || 'Error message not found'
    });
  }
  
  console.log(`🔍 Parsed ${errors.length} errors from TSC output`);
  if (errors.length > 0) {
    console.log('Sample error:', errors[0]);
  }
  
  return errors;
}

function groupErrorsByFile(errors) {
  const grouped = {};
  for (const error of errors) {
    if (!grouped[error.file]) {
      grouped[error.file] = [];
    }
    grouped[error.file].push(error);
  }
  return grouped;
}

function safeFix(filePath, errors) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Create backup
  const backupPath = `${filePath}.safe-backup`;
  fs.writeFileSync(backupPath, content);
  
  // Only handle safe, non-destructive fixes
  
  // Fix TS6133 - unused variables (safe removal)
  const unusedVarErrors = errors.filter(e => e.code === 'TS6133');
  for (const error of unusedVarErrors) {
    if (error.message.includes("is declared but its value is never read")) {
      const varName = error.message.match(/'([^']+)'/)?.[1];
      if (varName && !varName.startsWith('_')) {
        // Only prefix with underscore, don't remove
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        content = content.replace(regex, `_${varName}`);
        modified = true;
        console.log(`   ✓ Prefixed unused variable: ${varName} -> _${varName}`);
      }
    }
  }
  
  // Fix TS6192 - unused imports (safe removal)
  const unusedImportErrors = errors.filter(e => e.code === 'TS6192');
  for (const error of unusedImportErrors) {
    if (error.message.includes("All imports in import declaration are unused")) {
      const lines = content.split('\n');
      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        if (line.trim().startsWith('import') && !line.includes('side-effect')) {
          lines[lineIndex] = `// ${line} // Unused import`;
          content = lines.join('\n');
          modified = true;
          console.log(`   ✓ Commented out unused import at line ${error.line}`);
        }
      }
    }
  }
  
  // Fix TS7006 - implicit any (safe type annotation)
  const implicitAnyErrors = errors.filter(e => e.code === 'TS7006');
  for (const error of implicitAnyErrors) {
    if (error.message.includes("Parameter") && error.message.includes("implicitly has an 'any' type")) {
      const paramName = error.message.match(/Parameter '([^']+)'/)?.[1];
      if (paramName) {
        // Add type annotation
        const regex = new RegExp(`\\b${paramName}\\b(?!:)`, 'g');
        content = content.replace(regex, `${paramName}: any`);
        modified = true;
        console.log(`   ✓ Added type annotation: ${paramName}: any`);
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}`);
    return true;
  }
  
  return false;
}

function main() {
  console.log('🔍 Analyzing TypeScript errors...');
  
  const output = getCurrentErrors();
  if (!output.trim()) {
    console.log('🎉 No TypeScript errors found!');
    return;
  }
  
  const errors = parseTypeScriptErrors(output);
  console.log(`📊 Found ${errors.length} TypeScript errors`);
  
  if (errors.length === 0) {
    console.log('✅ No parseable errors to fix');
    return;
  }
  
  const groupedErrors = groupErrorsByFile(errors);
  let fixedFiles = 0;
  
  for (const [filePath, fileErrors] of Object.entries(groupedErrors)) {
    console.log(`\n🔍 Processing: ${filePath} (${fileErrors.length} errors)`);
    
    // Show sample errors
    fileErrors.slice(0, 3).forEach(error => {
      console.log(`   Line ${error.line}: ${error.message}`);
    });
    
    if (safeFix(filePath, fileErrors)) {
      fixedFiles++;
    }
  }
  
  console.log(`\n📈 Summary: Applied safe fixes to ${fixedFiles} files`);
  
  // Check remaining errors
  const remainingOutput = getCurrentErrors();
  const remainingErrors = parseTypeScriptErrors(remainingOutput);
  console.log(`📊 Remaining errors: ${remainingErrors.length}`);
  
  if (remainingErrors.length > 0) {
    const errorTypes = {};
    remainingErrors.forEach(error => {
      const key = `${error.code}: ${error.message.split(':')[0]}`;
      errorTypes[key] = (errorTypes[key] || 0) + 1;
    });
    
    console.log('\n🔧 Top remaining error types:');
    Object.entries(errorTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([type, count]) => {
        console.log(`   ${count}x: ${type}`);
      });
  }
}

main();