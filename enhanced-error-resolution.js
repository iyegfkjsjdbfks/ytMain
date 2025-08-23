#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Enhanced TypeScript Error Resolution System');
console.log('==============================================');
console.log('Running on ACTUAL TypeScript errors in this project!\n');

// Get current TypeScript errors using execSync
function getCurrentErrors() {
  try {
    console.log('📊 Capturing TypeScript errors...');
    
    // Use execSync with proper error handling
    const result = execSync('npx tsc --noEmit --skipLibCheck', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    // If no errors, return empty array
    return [];
  } catch (error) {
    // TypeScript errors come through stderr
    const output = error.stdout || error.stderr || '';
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
        message: message.trim(),
        severity: getSeverity(code, message)
      });
    }
  }
  
  return errors;
}

// Determine error severity
function getSeverity(code, message) {
  // Critical syntax errors that prevent compilation
  const criticalPatterns = [
    'expected',
    'Declaration or statement expected',
    'Expression expected',
    'Unexpected token',
    'Unexpected keyword'
  ];
  
  if (criticalPatterns.some(pattern => message.includes(pattern))) {
    return 'critical';
  }
  
  // Type errors
  if (code.startsWith('TS2') || message.includes('Type ') || message.includes('not assignable')) {
    return 'type';
  }
  
  // Import/export errors
  if (message.includes('import') || message.includes('export') || message.includes('module')) {
    return 'import';
  }
  
  return 'other';
}

// Group errors by file and severity
function analyzeErrors(errors) {
  const analysis = {
    total: errors.length,
    byFile: new Map(),
    bySeverity: new Map(),
    byErrorCode: new Map(),
    criticalFiles: []
  };
  
  for (const error of errors) {
    // By file
    if (!analysis.byFile.has(error.file)) {
      analysis.byFile.set(error.file, []);
    }
    analysis.byFile.get(error.file).push(error);
    
    // By severity
    if (!analysis.bySeverity.has(error.severity)) {
      analysis.bySeverity.set(error.severity, 0);
    }
    analysis.bySeverity.set(error.severity, analysis.bySeverity.get(error.severity) + 1);
    
    // By error code
    if (!analysis.byErrorCode.has(error.code)) {
      analysis.byErrorCode.set(error.code, 0);
    }
    analysis.byErrorCode.set(error.code, analysis.byErrorCode.get(error.code) + 1);
  }
  
  // Identify critical files (files with many critical errors)
  for (const [file, fileErrors] of analysis.byFile) {
    const criticalCount = fileErrors.filter(e => e.severity === 'critical').length;
    if (criticalCount > 10) {
      analysis.criticalFiles.push({ file, criticalCount, totalErrors: fileErrors.length });
    }
  }
  
  // Sort critical files by error count
  analysis.criticalFiles.sort((a, b) => b.criticalCount - a.criticalCount);
  
  return analysis;
}

// Apply targeted fixes based on error patterns
function applyTargetedFixes(errors) {
  const fixedFiles = new Set();
  let totalFixed = 0;
  
  // Group errors by file
  const errorsByFile = new Map();
  for (const error of errors) {
    if (!errorsByFile.has(error.file)) {
      errorsByFile.set(error.file, []);
    }
    errorsByFile.get(error.file).push(error);
  }
  
  // Process each file
  for (const [filePath, fileErrors] of errorsByFile) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      continue;
    }
    
    // Skip if too many errors (likely corrupted)
    if (fileErrors.length > 50) {
      console.log(`⚠️  Skipping ${filePath} - too many errors (${fileErrors.length}), likely corrupted`);
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Apply common fixes
    const fixes = [
      // Fix missing semicolons
      {
        pattern: /^(\s*(?:const|let|var|return|throw|break|continue|import|export)\s+[^;{}\n]+)$/gm,
        replacement: '$1;',
        condition: (errors) => errors.some(e => e.message.includes("';' expected"))
      },
      
      // Fix missing commas in object literals
      {
        pattern: /(\w+:\s*[^,\n}]+)(\n\s*\w+:)/g,
        replacement: '$1,$2',
        condition: (errors) => errors.some(e => e.message.includes("',' expected"))
      },
      
      // Fix invalid generic syntax
      {
        pattern: /Promise<any>\s*<\s*([^>]+)>/g,
        replacement: 'Promise<$1>',
        condition: (errors) => errors.some(e => e.message.includes('expected'))
      },
      
      // Fix duplicate imports
      {
        pattern: /^import\s+React\s*;\s*\nimport\s+React\s*,/gm,
        replacement: 'import React,',
        condition: (errors) => errors.some(e => e.message.includes('duplicate'))
      }
    ];
    
    for (const fix of fixes) {
      if (fix.condition(fileErrors)) {
        const newContent = content.replace(fix.pattern, fix.replacement);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      fixedFiles.add(filePath);
      totalFixed++;
      console.log(`✅ Applied fixes to: ${filePath}`);
    }
  }
  
  return { fixedFiles: Array.from(fixedFiles), totalFixed };
}

// Generate detailed report
function generateReport(initialErrors, finalErrors, fixedFiles) {
  const report = {
    timestamp: new Date().toISOString(),
    initialErrorCount: initialErrors.length,
    finalErrorCount: finalErrors.length,
    errorsFixed: initialErrors.length - finalErrors.length,
    filesModified: fixedFiles.length,
    successRate: ((initialErrors.length - finalErrors.length) / initialErrors.length * 100).toFixed(2)
  };
  
  console.log('\n📊 ERROR RESOLUTION REPORT');
  console.log('==========================');
  console.log(`Initial Errors: ${report.initialErrorCount}`);
  console.log(`Final Errors: ${report.finalErrorCount}`);
  console.log(`Errors Fixed: ${report.errorsFixed}`);
  console.log(`Files Modified: ${report.filesModified}`);
  console.log(`Success Rate: ${report.successRate}%`);
  
  if (fixedFiles.length > 0) {
    console.log('\n📁 Modified Files:');
    fixedFiles.forEach(file => console.log(`   ✅ ${file}`));
  }
  
  return report;
}

// Main execution
async function main() {
  try {
    // Step 1: Get initial errors
    console.log('🔍 Step 1: Analyzing current TypeScript errors...');
    const initialErrors = getCurrentErrors();
    
    if (initialErrors.length === 0) {
      console.log('🎉 No TypeScript errors found! Project is clean.');
      return;
    }
    
    console.log(`📊 Found ${initialErrors.length} TypeScript errors`);
    
    // Step 2: Analyze error patterns
    console.log('\n🔍 Step 2: Analyzing error patterns...');
    const analysis = analyzeErrors(initialErrors);
    
    console.log(`📈 Error Analysis:`);
    console.log(`   Critical: ${analysis.bySeverity.get('critical') || 0}`);
    console.log(`   Type: ${analysis.bySeverity.get('type') || 0}`);
    console.log(`   Import: ${analysis.bySeverity.get('import') || 0}`);
    console.log(`   Other: ${analysis.bySeverity.get('other') || 0}`);
    console.log(`   Files affected: ${analysis.byFile.size}`);
    
    if (analysis.criticalFiles.length > 0) {
      console.log('\n⚠️  Most problematic files:');
      analysis.criticalFiles.slice(0, 5).forEach(({ file, criticalCount, totalErrors }) => {
        console.log(`   ${file}: ${criticalCount} critical errors (${totalErrors} total)`);
      });
    }
    
    // Step 3: Apply targeted fixes
    console.log('\n🔧 Step 3: Applying targeted fixes...');
    const { fixedFiles, totalFixed } = applyTargetedFixes(initialErrors);
    
    // Step 4: Check results
    console.log('\n🔍 Step 4: Verifying fixes...');
    const finalErrors = getCurrentErrors();
    
    // Step 5: Generate report
    const report = generateReport(initialErrors, finalErrors, fixedFiles);
    
    // Save report
    fs.writeFileSync('typescript-error-resolution-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Report saved to: typescript-error-resolution-report.json');
    
    if (report.errorsFixed > 0) {
      console.log('\n🎉 Error resolution completed successfully!');
    } else {
      console.log('\n⚠️  No errors were automatically fixable. Manual intervention may be required.');
    }
    
  } catch (error) {
    console.error('❌ Error Resolution Failed:', error.message);
    console.error(error);
  }
}

main();