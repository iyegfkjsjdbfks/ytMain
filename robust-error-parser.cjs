const fs = require('fs');
const path = require('path');

// Read the raw TypeScript errors
const rawErrorsPath = 'typescript-errors-raw.txt';
const rawErrors = fs.readFileSync(rawErrorsPath, 'utf8');

// Parse TypeScript errors with improved regex
const errorPattern = /^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/gm;
const errors = [];
let match;

while ((match = errorPattern.exec(rawErrors)) !== null) {
  const [, filePath, line, column, errorCode, message] = match;
  errors.push({
    file: filePath.trim(),
    line: parseInt(line),
    column: parseInt(column),
    code: errorCode,
    message: message.trim(),
    severity: getSeverity(errorCode, message)
  });
}

function getSeverity(code, message) {
  if (message.includes('has no corresponding closing tag') || 
      message.includes('Unexpected token') ||
      message.includes('expected') ||
      message.includes('Unterminated')) {
    return 'critical';
  }
  if (code.startsWith('TS17') || code.startsWith('TS13')) {
    return 'high';
  }
  return 'medium';
}

// Group errors by file
const fileErrors = {};
errors.forEach(error => {
  if (!fileErrors[error.file]) {
    fileErrors[error.file] = [];
  }
  fileErrors[error.file].push(error);
});

// Identify corrupted files (files with many critical errors)
const corruptedFiles = [];
const criticalThreshold = 10; // Files with 10+ critical errors are considered corrupted

Object.entries(fileErrors).forEach(([file, fileErrorList]) => {
  const criticalErrors = fileErrorList.filter(e => e.severity === 'critical').length;
  const totalErrors = fileErrorList.length;
  
  if (criticalErrors >= criticalThreshold || totalErrors >= 30) {
    corruptedFiles.push({
      file,
      totalErrors,
      criticalErrors,
      errorCodes: [...new Set(fileErrorList.map(e => e.code))]
    });
  }
});

// Generate comprehensive report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalErrors: errors.length,
    totalFiles: Object.keys(fileErrors).length,
    corruptedFiles: corruptedFiles.length,
    averageErrorsPerFile: Math.round(errors.length / Object.keys(fileErrors).length * 100) / 100
  },
  corruptedFiles,
  topErrorFiles: Object.entries(fileErrors)
    .map(([file, errs]) => ({ file, count: errs.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20),
  errorCategories: {
    critical: errors.filter(e => e.severity === 'critical').length,
    high: errors.filter(e => e.severity === 'high').length,
    medium: errors.filter(e => e.severity === 'medium').length
  },
  commonErrors: getTopErrors(errors),
  recommendations: generateRecommendations(corruptedFiles, errors)
};

function getTopErrors(errors) {
  const errorCounts = {};
  errors.forEach(error => {
    const key = `${error.code}: ${error.message.substring(0, 50)}...`;
    errorCounts[key] = (errorCounts[key] || 0) + 1;
  });
  
  return Object.entries(errorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([error, count]) => ({ error, count }));
}

function generateRecommendations(corruptedFiles, errors) {
  const recommendations = [];
  
  if (corruptedFiles.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      action: 'DELETE_CORRUPTED_FILES',
      description: `Delete ${corruptedFiles.length} severely corrupted files`,
      files: corruptedFiles.map(f => f.file)
    });
  }
  
  const jsxErrors = errors.filter(e => e.message.includes('JSX') || e.message.includes('closing tag'));
  if (jsxErrors.length > 100) {
    recommendations.push({
      priority: 'HIGH',
      action: 'FIX_JSX_STRUCTURE',
      description: `Fix ${jsxErrors.length} JSX structure errors`,
      count: jsxErrors.length
    });
  }
  
  const syntaxErrors = errors.filter(e => e.message.includes('expected') || e.message.includes('Unexpected token'));
  if (syntaxErrors.length > 50) {
    recommendations.push({
      priority: 'HIGH',
      action: 'FIX_SYNTAX_ERRORS',
      description: `Fix ${syntaxErrors.length} syntax errors`,
      count: syntaxErrors.length
    });
  }
  
  return recommendations;
}

// Save detailed report
fs.writeFileSync('error-analysis-comprehensive.json', JSON.stringify(report, null, 2));

// Save list of corrupted files for deletion
if (corruptedFiles.length > 0) {
  const filesToDelete = corruptedFiles.map(f => f.file);
  fs.writeFileSync('corrupted-files-to-delete.txt', filesToDelete.join('\n'));
  
  console.log(`\n🔍 ANALYSIS COMPLETE`);
  console.log(`📊 Total errors found: ${errors.length}`);
  console.log(`📁 Files affected: ${Object.keys(fileErrors).length}`);
  console.log(`💥 Corrupted files identified: ${corruptedFiles.length}`);
  console.log(`\n🗑️  CORRUPTED FILES TO DELETE:`);
  corruptedFiles.forEach(f => {
    console.log(`   ${f.file} (${f.totalErrors} errors, ${f.criticalErrors} critical)`);
  });
  
  console.log(`\n📋 Files list saved to: corrupted-files-to-delete.txt`);
  console.log(`📋 Full report saved to: error-analysis-comprehensive.json`);
} else {
  console.log('No corrupted files found.');
}

console.log(`\n✅ Analysis complete. Check error-analysis-comprehensive.json for full details.`);