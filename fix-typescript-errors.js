#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting TypeScript Error Resolution...');

// Get current TypeScript errors
function getCurrentErrors() {
  try {
    execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    return [];
  } catch (error) {
    const output = error.stdout?.toString() || error.stderr?.toString() || '';
    return parseTypeScriptErrors(output);
  }
}

// Parse TypeScript error output
function parseTypeScriptErrors(output) {
  const errors = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);
    if (match) {
      const [, file, lineStr, colStr, code, message] = match;
      errors.push({
        file: file.trim(),
        line: parseInt(lineStr),
        column: parseInt(colStr),
        code,
        message: message.trim()
      });
    }
  }
  
  return errors;
}

// Group errors by file
function groupErrorsByFile(errors) {
  const groups = new Map();
  
  for (const error of errors) {
    if (!groups.has(error.file)) {
      groups.set(error.file, []);
    }
    groups.get(error.file).push(error);
  }
  
  return groups;
}

// Fix common syntax errors
function fixSyntaxErrors(filePath, errors) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix missing semicolons
  if (errors.some(e => e.message.includes("';' expected"))) {
    content = content.replace(/^(\s*(?:const|let|var|return|throw|break|continue|import|export)\s+[^;{}\n]+)$/gm, '$1;');
    modified = true;
  }

  // Fix missing commas
  if (errors.some(e => e.message.includes("',' expected"))) {
    content = content.replace(/(\w+:\s*[^,\n}]+)(\n\s*\w+:)/g, '$1,$2');
    modified = true;
  }

  // Fix missing closing braces
  if (errors.some(e => e.message.includes("'}' expected"))) {
    // This is more complex and needs manual inspection
    console.log(`⚠️  Manual fix needed for missing braces in: ${filePath}`);
  }

  // Fix duplicate imports
  if (errors.some(e => e.message.includes('duplicate'))) {
    content = content.replace(/^import\s+React\s*;\s*\nimport\s+React\s*,/gm, 'import React,');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed syntax errors in: ${filePath}`);
    return true;
  }

  return false;
}

// Main execution
function main() {
  const errors = getCurrentErrors();
  console.log(`📊 Found ${errors.length} TypeScript errors`);

  if (errors.length === 0) {
    console.log('🎉 No TypeScript errors found!');
    return;
  }

  const errorsByFile = groupErrorsByFile(errors);
  console.log(`📁 Errors found in ${errorsByFile.size} files`);

  let totalFixed = 0;

  // Process each file
  for (const [filePath, fileErrors] of errorsByFile) {
    console.log(`\n🔍 Processing: ${filePath} (${fileErrors.length} errors)`);
    
    // Show first few errors for context
    fileErrors.slice(0, 3).forEach(error => {
      console.log(`   Line ${error.line}: ${error.message}`);
    });

    if (fixSyntaxErrors(filePath, fileErrors)) {
      totalFixed++;
    }
  }

  console.log(`\n📈 Summary: Fixed syntax errors in ${totalFixed} files`);
  
  // Check remaining errors
  const remainingErrors = getCurrentErrors();
  console.log(`📊 Remaining errors: ${remainingErrors.length}`);

  if (remainingErrors.length > 0) {
    console.log('\n🔧 Top remaining error types:');
    const errorTypes = new Map();
    
    remainingErrors.forEach(error => {
      const type = error.message.split(':')[0] || error.message.substring(0, 50);
      errorTypes.set(type, (errorTypes.get(type) || 0) + 1);
    });

    Array.from(errorTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([type, count]) => {
        console.log(`   ${count}x: ${type}`);
      });
  }
}

main();