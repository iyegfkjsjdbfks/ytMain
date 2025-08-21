const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Fix all build-blocking syntax errors
 */

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixes = [];
    
    // Fix 1: Remove "as const" from type definitions
    content = content.replace(/type:\s*"([^"]+)"\s*as\s*const/g, 'type: "$1"');
    if (content !== originalContent) fixes.push('Removed "as const" from type definitions');
    
    // Fix 2: Fix object literals with comma after opening brace
    content = content.replace(/=\s*\{,/g, '= {');
    content = content.replace(/:\s*\{,/g, ': {');
    if (content !== originalContent) fixes.push('Fixed comma after opening brace');
    
    // Fix 3: Fix array literals with comma issues
    content = content.replace(/:\s*\[,/g, ': [');
    content = content.replace(/=\s*\[,/g, '= [');
    
    // Fix 4: Fix interface properties with trailing comma after type
    content = content.replace(/;,\n/g, ';\n');
    content = content.replace(/,\n\s*}/g, '\n}');
    
    // Fix 5: Fix duplicate imports in single line
    content = content.replace(/import React, \{ ([^}]+), \1 \}/g, 'import React, { $1 }');
    
    // Fix 6: Remove duplicate ReactNode imports
    content = content.replace(/, type ReactNode, type ReactNode/g, ', type ReactNode');
    content = content.replace(/, ReactNode, ReactNode/g, ', ReactNode');
    content = content.replace(/, FC, FC/g, ', FC');
    
    // Fix 7: Fix closing brace issues
    content = content.replace(/}\s*}\s*;/g, '};');
    content = content.replace(/}\s*}\s*$/gm, '}');
    
    // Fix 8: Fix state declarations with comma issues
    content = content.replace(/state:\s*(\w+)\s*=\s*\{,/g, 'state: $1 = {');
    
    // Fix 9: Fix function parameters with extra commas
    content = content.replace(/\(([\w\s:]+),\s*,/g, '($1,');
    
    // Fix 10: Fix type definitions in action types
    // Change { type: "SET_USER" as const; payload: User } to { type: "SET_USER"; payload: User }
    content = content.replace(/\{\s*type:\s*"([^"]+)"\s*as\s*const;\s*/g, '{ type: "$1"; ');
    
    // Fix 11: Fix multiple spaces and clean up
    content = content.replace(/  +/g, ' ');
    content = content.replace(/\n{4,}/g, '\n\n\n');
    
    // Fix 12: Fix array/object type definitions with wrong syntax
    content = content.replace(/:\s*string\[\]/g, ': string[]');
    content = content.replace(/:\s*(\w+)\[\]/g, ': $1[]');
    
    // Fix 13: Fix StrictNotification array type
    content = content.replace(/notifications:\s*StrictNotification\s*$/gm, 'notifications: StrictNotification[]');
    content = content.replace(/watchLaterVideos:\s*string\s*$/gm, 'watchLaterVideos: string[]');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${filePath}`);
      if (fixes.length > 0) {
        console.log(`   Issues: ${[...new Set(fixes)].join(', ')}`);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Fixing build-blocking errors...\n');

// Priority files that are blocking the build
const priorityFiles = [
  'contexts/UnifiedAppContext.tsx',
  'contexts/AuthContext.tsx',
  'contexts/OptimizedMiniplayerContext.tsx',
  'contexts/MiniplayerContext.tsx',
  'contexts/ThemeContext.tsx',
  'contexts/WatchLaterContext.tsx',
  'components/ErrorBoundary.tsx',
  'App.tsx',
  'providers/RefactoredAppProviders.tsx'
];

// Fix priority files first
console.log('📌 Fixing priority files...');
for (const file of priorityFiles) {
  if (fs.existsSync(file)) {
    fixFile(file);
  }
}

// Then fix all other files
console.log('\n📂 Fixing remaining files...');
const allFiles = glob.sync('**/*.{ts,tsx,js,jsx}', {
  ignore: ['node_modules/**', 'dist/**', 'build/**', '.next/**', 'scripts/**']
});

let totalFixed = 0;
for (const file of allFiles) {
  if (!priorityFiles.includes(file) && fixFile(file)) {
    totalFixed++;
  }
}

console.log(`\n✨ Fixed ${totalFixed + priorityFiles.filter(f => fs.existsSync(f)).length} files total`);
console.log('\n🎯 Build error fixes complete!');
