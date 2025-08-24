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
  
  let completeLines = 0;
  let matchedLines = 0;
  
  for (const line of lines) {
    if (line.includes('error TS')) {
      const trimmedLine = line.trim();
      
      // Look for complete error lines that end with a period
      // Format: file.tsx(line,col): error TScode: message.
      if (trimmedLine.endsWith('.')) {
        const match = trimmedLine.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)\.$/); 
        if (match) {
          matchedLines++;
          const [, file, lineStr, colStr, code, message] = match;
          errors.push({
            file: path.resolve(file.trim()),
            line: parseInt(lineStr),
            column: parseInt(colStr),
            code,
            message: message.trim()
          });
        }
      }
      completeLines++;
    }
  }
  
  console.log(`Found ${completeLines} complete error lines, matched ${matchedLines}`);
  console.log(`Parsed ${errors.length} errors from TSC output`);
  if (errors.length > 0) {
    console.log('Sample error:', errors[0]);
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

  // Create backup
  const backupPath = `${filePath}.backup`;
  fs.writeFileSync(backupPath, content);

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
    const lines = content.split('\n');
    let openBraces = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const openCount = (line.match(/{/g) || []).length;
      const closeCount = (line.match(/}/g) || []).length;
      openBraces += openCount - closeCount;
    }

    if (openBraces > 0) {
      content += '\n' + '}'.repeat(openBraces);
      modified = true;
    }
  }

  // Fix missing imports for @heroicons/react
  if (errors.some(e => e.message.includes("Module '@heroicons/react/24/outline' has no exported member"))) {
    const missingIcons = errors
      .filter(e => e.message.includes("Module '@heroicons/react/24/outline' has no exported member"))
      .map(e => {
        const match = e.message.match(/'([^']+)'/);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    if (missingIcons.length > 0) {
      const importStatement = `import { ${missingIcons.join(', ')} } from '@heroicons/react/24/solid';`;
      const lines = content.split('\n');
      const lastImportIndex = lines.findIndex((line, i) => 
        !line.trim().startsWith('import') && lines.slice(0, i).some(l => l.trim().startsWith('import'))
      );
      
      if (lastImportIndex !== -1) {
        lines.splice(lastImportIndex, 0, importStatement);
        content = lines.join('\n');
        modified = true;
      }
    }
  }

  // Fix duplicate imports
  if (errors.some(e => e.message.includes('duplicate'))) {
    content = content.replace(/^import\s+React\s*;\s*\nimport\s+React\s*,/gm, 'import React,');
    modified = true;
  }

  // Fix missing type annotations
  if (errors.some(e => e.code === 'TS7006')) {
    content = content.replace(/\b(function\s+\w+\s*\([^)]*\))\s*{/g, '$1: any {');
    content = content.replace(/\b(const\s+\w+\s*=\s*\([^)]*\))\s*=>/g, '$1: any =>');
    modified = true;
  }

  // Fix unused imports (TS6192, TS6133)
  if (errors.some(e => e.code === 'TS6192' || e.code === 'TS6133')) {
    const unusedImports = errors
      .filter(e => (e.code === 'TS6192' || e.code === 'TS6133') && e.message.includes('is declared but its value is never read'))
      .map(e => {
        const match = e.message.match(/'([^']+)' is declared/);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    // Remove unused imports from import statements
    unusedImports.forEach(unusedImport => {
      // Remove from named imports
      content = content.replace(new RegExp(`import\s*{([^}]*),\s*${unusedImport}\s*([^}]*)}`, 'g'), 'import {$1$2}');
      content = content.replace(new RegExp(`import\s*{\s*${unusedImport}\s*,([^}]*)}`, 'g'), 'import {$1}');
      content = content.replace(new RegExp(`import\s*{\s*${unusedImport}\s*}`, 'g'), '');
      
      // Remove default imports if unused
      content = content.replace(new RegExp(`import\s+${unusedImport}\s*;`, 'g'), '');
      content = content.replace(new RegExp(`import\s+${unusedImport}\s*,`, 'g'), 'import ');
    });

    // Clean up empty import lines
    content = content.replace(/import\s*{\s*}\s*from[^;]+;/g, '');
    content = content.replace(/import\s*;/g, '');
    content = content.replace(/^\s*import\s*$\n/gm, '');
    
    modified = true;
  }

  // Fix unused variables
  if (errors.some(e => e.message.includes('is declared but its value is never read'))) {
    const unusedVars = errors
      .filter(e => e.message.includes('is declared but its value is never read') && !e.message.includes('import'))
      .map(e => {
        const match = e.message.match(/'([^']+)' is declared/);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    // Comment out or remove unused variable declarations
    unusedVars.forEach(unusedVar => {
      // For destructuring assignments, remove the unused variable
      content = content.replace(new RegExp(`const\s*{([^}]*),\s*${unusedVar}\s*([^}]*)}`, 'g'), 'const {$1$2}');
      content = content.replace(new RegExp(`const\s*{\s*${unusedVar}\s*,([^}]*)}`, 'g'), 'const {$1}');
      content = content.replace(new RegExp(`const\s*{\s*${unusedVar}\s*}`, 'g'), '');
      
      // For regular variable declarations, comment them out
      content = content.replace(new RegExp(`^(\s*)(const|let|var)\s+${unusedVar}\s*=`, 'gm'), '$1// $2 $3 =');
    });
    
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