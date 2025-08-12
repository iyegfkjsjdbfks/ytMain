const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Advanced TypeScript Error Fixer
 * Targets remaining complex syntax errors
 */

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixCount = 0;

    // Fix 1: Remove trailing commas in return statements
    content = content.replace(/return\s+(['"`].*?['"`])\s*,\s*;/g, 'return $1;');
    content = content.replace(/return\s+(\w+)\s*,\s*;/g, 'return $1;');
    
    // Fix 2: Fix object returns with missing commas
    content = content.replace(/return\s*{\s*([^}]+)}\s*,\s*;/g, (match, props) => {
      // Add commas between properties
      const fixed = props.replace(/([^,\s])\s*\n\s*(\w+:)/g, '$1,\n  $2');
      return `return {\n${fixed}\n};`;
    });
    
    // Fix 3: Fix array literals with syntax issues - remove "[;" pattern
    content = content.replace(/\[\s*;/g, '[');
    
    // Fix 4: Fix JSX closing tags with commas
    content = content.replace(/<\/(\w+)>,/g, '</$1>');
    content = content.replace(/>,\s*</g, '><');
    
    // Fix 5: Fix missing commas in multi-line objects (more aggressive)
    content = content.replace(/([^,{[\s])\s*\n\s+(\w+):/g, (match, prev, prop) => {
      if (prev === ';' || prev === '}' || prev === ')') {
        return match;
      }
      return `${prev},\n  ${prop}:`;
    });
    
    // Fix 6: Fix arrow function bodies with wrong syntax
    content = content.replace(/=>\s*{\s*,/g, '=> {');
    content = content.replace(/=>\s*\(,/g, '=> (');
    
    // Fix 7: Fix type annotations with commas
    content = content.replace(/:\s*(\w+),\s*=/g, ': $1 =');
    content = content.replace(/:\s*(\w+\[\]),\s*=/g, ': $1 =');
    
    // Fix 8: Fix function parameters with trailing commas
    content = content.replace(/\(([^)]*),\s*\)\s*=>/g, '($1) =>');
    content = content.replace(/\(([^)]*),\s*\)\s*{/g, '($1) {');
    
    // Fix 9: Fix destructuring with commas
    content = content.replace(/const\s*{\s*([^}]+)}\s*,\s*=/g, 'const { $1 } =');
    content = content.replace(/const\s*\[\s*([^\]]+)\]\s*,\s*=/g, 'const [$1] =');
    
    // Fix 10: Fix incorrect semicolons in object properties
    content = content.replace(/(\w+):\s*([^,}\n]+);(\s*[,}])/g, '$1: $2$3');
    
    // Fix 11: Fix catch blocks
    content = content.replace(/}\s*catch\s*\(/g, '} catch (');
    content = content.replace(/}\s*finally\s*{/g, '} finally {');
    
    // Fix 12: Fix JSX props with wrong commas
    content = content.replace(/(\w+)=\{([^}]+)},\s*>/g, '$1={$2}>');
    content = content.replace(/(\w+)="([^"]+)",\s*>/g, '$1="$2">');
    
    // Fix 13: Fix empty parameter lists
    content = content.replace(/\(\s*,\s*\)/g, '()');
    
    // Fix 14: Fix object method definitions
    content = content.replace(/(\w+)\s*,\s*\(/g, '$1(');
    
    // Fix 15: Fix interface/type properties (remove commas before semicolons)
    content = content.replace(/,\s*;/g, ';');
    
    // Fix 16: Fix array access with commas
    content = content.replace(/\[\s*,/g, '[');
    content = content.replace(/,\s*\]/g, ']');
    
    // Fix 17: Fix conditional operators
    content = content.replace(/\?\s*([^:]+),\s*:/g, '? $1 :');
    content = content.replace(/:\s*([^,;}]+),\s*;/g, ': $1;');
    
    // Fix 18: Fix spread operators
    content = content.replace(/\.\.\.,/g, '...');
    
    // Fix 19: Fix template literals
    content = content.replace(/\${\s*,/g, '${');
    content = content.replace(/,\s*}/g, '}');
    
    // Fix 20: Fix export statements
    content = content.replace(/export\s*{\s*([^}]+)}\s*,\s*;/g, 'export { $1 };');
    content = content.replace(/export\s+default\s+(\w+)\s*,\s*;/g, 'export default $1;');
    
    // Fix 21: Fix JSX fragments
    content = content.replace(/<>\s*,/g, '<>');
    content = content.replace(/,\s*<\/>/g, '</>');
    
    // Fix 22: Fix async functions
    content = content.replace(/async\s*\(\s*,/g, 'async (');
    
    // Fix 23: Fix switch cases
    content = content.replace(/case\s+(['"`].*?['"`])\s*,\s*:/g, 'case $1:');
    content = content.replace(/default\s*,\s*:/g, 'default:');
    
    // Fix 24: Fix for loops
    content = content.replace(/for\s*\(\s*,/g, 'for (');
    
    // Fix 25: Fix while loops
    content = content.replace(/while\s*\(\s*,/g, 'while (');
    
    // Count changes
    const lines1 = originalContent.split('\n');
    const lines2 = content.split('\n');
    let changes = 0;
    for (let i = 0; i < Math.max(lines1.length, lines2.length); i++) {
      if (lines1[i] !== lines2[i]) changes++;
    }
    
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

console.log('🔧 Fixing remaining complex TypeScript errors...\n');

// Priority files with most errors
const priorityFiles = [
  'components/DevOpsDashboard.tsx',
  'components/forms/UnifiedFormSystem.tsx',
  'components/ui/FormComponents.tsx',
  'services/apiService.ts',
  'services/analyticsService.ts',
  'services/errorService.ts',
  'src/hooks/useInstallPrompt.ts',
  'src/hooks/usePWA.ts',
  'src/hooks/useServiceWorker.ts',
  'src/hooks/useVideoPlayer.ts',
  'src/hooks/useEnhancedQuery.ts',
  'utils/advancedMonitoring.ts',
  'utils/performanceMonitor.ts'
];

let totalFixed = 0;

// Fix priority files first
console.log('📌 Fixing priority files with most errors...');
for (const file of priorityFiles) {
  if (fs.existsSync(file)) {
    if (fixFile(file)) {
      totalFixed++;
    }
  }
}

// Then fix all other TypeScript files
console.log('\n🔍 Scanning for additional files...');
const allTsFiles = glob.sync('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', 'dist/**', 'build/**', '.next/**', 'scripts/**']
});

for (const file of allTsFiles) {
  if (!priorityFiles.includes(file)) {
    if (fixFile(file)) {
      totalFixed++;
    }
  }
}

console.log(`\n✨ Fixed complex errors in ${totalFixed} files`);
console.log('\n📊 Next steps:');
console.log('1. Run "npm run type-check" to see remaining errors');
console.log('2. Most remaining errors should be semantic (type mismatches, missing imports)');
console.log('3. Consider running the comprehensive error fixer for remaining issues');
