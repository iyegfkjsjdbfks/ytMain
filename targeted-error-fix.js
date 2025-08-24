#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎯 Starting Targeted TypeScript Error Resolution...');

// Read configuration
const config = JSON.parse(fs.readFileSync('error-resolver.config.json', 'utf8'));
const { targetedFiles, criticalErrorPatterns } = config;

// Get current TypeScript errors
function getCurrentErrors() {
  try {
    const result = execSync('npx tsc --noEmit --pretty false', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 1024 * 1024 * 50, // 50MB buffer
      cwd: process.cwd()
    });
    return [];
  } catch (error) {
    const output = error.stdout || error.stderr || error.message || '';
    console.log(`Raw TSC output length: ${output.length} characters`);
    console.log('First 1000 characters:');
    console.log(output.substring(0, 1000));
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

// Filter errors for targeted files and critical patterns
function filterTargetedErrors(errors, config) {
  const targetedFiles = config.targetedFiles || [];
  const criticalPatterns = config.criticalErrorPatterns || [];
  
  console.log(`Filtering ${errors.length} errors...`);
  console.log('Targeted files:', targetedFiles);
  console.log('Critical patterns:', criticalPatterns);
  
  const filtered = errors.filter(error => {
    // Check if error is in a targeted file
    // Convert both paths to use forward slashes for comparison
    const normalizedErrorFile = error.file.replace(/\\/g, '/');
    const isTargetedFile = targetedFiles.some(target => {
      const normalizedTarget = target.replace(/\\/g, '/');
      return normalizedErrorFile.endsWith(normalizedTarget) || normalizedErrorFile.includes(normalizedTarget);
    });
    
    // Check if error matches critical patterns
    const isCriticalError = criticalPatterns.some(pattern => 
      error.code.includes(pattern)
    );
    
    if (isTargetedFile || isCriticalError) {
      console.log(`Match found: ${error.file} - ${error.code} - Targeted: ${isTargetedFile}, Critical: ${isCriticalError}`);
    }
    
    return isTargetedFile && isCriticalError;
  });
  
  console.log(`Filtered to ${filtered.length} targeted errors`);
  return filtered;
}

// Apply targeted fixes
function applyFixes(errors) {
  let fixedCount = 0;
  
  for (const error of errors) {
    console.log(`\n🔍 Applying fix for: ${error.file} (Line ${error.line})`);
    console.log(`   Error: ${error.message}`);
    
    let content = fs.readFileSync(error.file, 'utf8');
    const lines = content.split('\n');

    if (error.code === 'TS1005' && error.message.includes("expected")) {
        const line = lines[error.line - 1];
        const trimmedLine = line.trim();
        if (trimmedLine.endsWith("}")) {
            lines[error.line - 1] = line.replace("}", ",");
        }
    }

    fs.writeFileSync(error.file, lines.join('\n'));
    fixedCount++;
  }
  
  return fixedCount;
}

// Main execution
function main() {
  const allErrors = getCurrentErrors();
  const targetedErrors = filterTargetedErrors(allErrors, config);
  
  console.log(`🎯 Found ${targetedErrors.length} targeted TypeScript errors`);

  if (targetedErrors.length === 0) {
    console.log('🎉 No targeted errors found!');
    return;
  }

  const fixedCount = applyFixes(targetedErrors);
  console.log(`\n📈 Summary: Applied fixes for ${fixedCount} targeted errors`);
}

main();