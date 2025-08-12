const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Comprehensive TypeScript Syntax Pattern Fixer
 * Fixes various malformed syntax patterns found in the codebase
 */

// Files to fix
const filesToFix = [
  'components/DevOpsDashboard.tsx',
  'services/analyticsService.ts',
  'services/apiService.ts', 
  'services/errorService.ts',
  'src/hooks/useInstallPrompt.ts',
  'src/hooks/usePWA.ts',
  'src/hooks/useServiceWorker.ts',
  'src/hooks/useVideoPlayer.ts',
  'src/utils/offlineStorage.ts',
  'utils/advancedMonitoring.ts',
  'utils/performanceMonitor.ts'
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixCount = 0;

    // Fix 1: Remove commas after semicolons in property definitions
    content = content.replace(/;,/g, ';');
    
    // Fix 2: Fix arrow functions with comma in wrong place - (,) => should be () =>
    content = content.replace(/\(,\)\s*=>/g, '() =>');
    
    // Fix 3: Fix property definitions with comma after value (number;, should be number;)
    content = content.replace(/(\w+);,/g, '$1;');
    
    // Fix 4: Fix method calls with extra comma - method(,) should be method()
    content = content.replace(/\(,\)/g, '()');
    
    // Fix 5: Fix object properties with comma in wrong position
    // Pattern: propertyName: type;, should be propertyName: type;
    content = content.replace(/:\s*(\w+);,/g, ': $1;');
    
    // Fix 6: Fix array initialization - const arr = [; should be const arr = [
    content = content.replace(/\[\s*;/g, '[');
    
    // Fix 7: Fix JSX elements with comma after closing tag
    content = content.replace(/>,([\s\n])/g, '>$1');
    
    // Fix 8: Fix JSX opening tags with comma
    content = content.replace(/<(\w+)([^>]*?)>,/g, '<$1$2>');
    
    // Fix 9: Fix expressions with comma in wrong place
    content = content.replace(/(\w+)\s*,\)/g, '$1)');
    
    // Fix 10: Fix object literal properties - remove comma before colon
    content = content.replace(/(\w+),\s*:/g, '$1:');
    
    // Fix 11: Fix function parameters - remove comma after parameter
    content = content.replace(/(\w+:\s*\w+),\s*\)/g, '$1)');
    
    // Fix 12: Fix multiple commas in property lists
    content = content.replace(/,\s*,/g, ',');
    
    // Fix 13: Fix closing braces with preceding comma
    content = content.replace(/,\s*}/g, ' }');
    
    // Fix 14: Fix statements ending with comma instead of semicolon in certain contexts
    content = content.replace(/return\s+'([^']+)',\s*$/gm, "return '$1';");
    
    // Fix 15: Fix interface properties with wrong comma placement
    content = content.replace(/(\w+):\s*(\w+),\s*;/g, '$1: $2;');
    
    // Fix 16: Fix arrow function parameters
    content = content.replace(/\(([^,)]+),\s*\)\s*=>/g, '($1) =>');
    
    // Fix 17: Fix method calls in chains
    content = content.replace(/\.(\w+)\(,/g, '.$1(');
    
    // Fix 18: Fix conditional expressions
    content = content.replace(/\?\s*'([^']+)',\s*:/g, "? '$1' :");
    
    // Fix 19: Fix type definitions with comma issues
    content = content.replace(/type\s+(\w+)\s*=\s*,/g, 'type $1 = ');
    
    // Fix 20: Remove trailing commas in single-line objects before closing brace
    content = content.replace(/,(\s*[}])/g, '$1');
    
    // Fix 21: Fix JSX fragments with commas
    content = content.replace(/<>,/g, '<>');
    content = content.replace(/,<\/>/g, '</>');
    
    // Fix 22: Fix array/object access with comma
    content = content.replace(/\[,\]/g, '[]');
    
    // Fix 23: Fix template literals with comma issues
    content = content.replace(/\${([^}]+),}/g, '${$1}');
    
    // Fix 24: Fix import statements with comma issues
    content = content.replace(/import\s*{([^}]+),\s*}/g, 'import {$1}');
    
    // Fix 25: Remove commas in wrong positions in conditionals
    content = content.replace(/if\s*\(([^)]+),\)/g, 'if ($1)');
    
    // Count fixes
    const changes = content.split('\n').filter((line, i) => 
      line !== originalContent.split('\n')[i]
    ).length;
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${changes} lines in ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Fixing TypeScript syntax patterns...\n');

let totalFixed = 0;
for (const file of filesToFix) {
  if (fs.existsSync(file)) {
    if (fixFile(file)) {
      totalFixed++;
    }
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
}

// Also fix all .ts and .tsx files in the project
console.log('\n🔍 Scanning for additional files to fix...');
const allTsFiles = glob.sync('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', 'dist/**', 'build/**', '.next/**', 'scripts/**']
});

for (const file of allTsFiles) {
  if (!filesToFix.includes(file)) {
    if (fixFile(file)) {
      totalFixed++;
    }
  }
}

console.log(`\n✨ Fixed syntax patterns in ${totalFixed} files`);
