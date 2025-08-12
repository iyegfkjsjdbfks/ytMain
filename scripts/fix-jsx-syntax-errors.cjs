const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * JSX/TSX Syntax Error Fixer
 * Specifically targets JSX syntax issues and remaining comma problems
 */

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Fix 1: Remove commas after JSX closing tags
    content = content.replace(/>},/g, '>}');
    content = content.replace(/>\s*,\s*</g, '><');
    content = content.replace(/<\/(\w+)>\s*,/g, '</$1>');
    
    // Fix 2: Fix MetricCard component calls with wrong comma placement
    content = content.replace(/<MetricCard,/g, '<MetricCard');
    
    // Fix 3: Fix JSX expressions with stray commas
    content = content.replace(/\{([^}]+)}\s*,\s*</g, '{$1}<');
    content = content.replace(/\}\s*,\s*\)/g, '})');
    
    // Fix 4: Fix arrow functions with commas in wrong places
    content = content.replace(/\(\s*,\s*\)/g, '()');
    content = content.replace(/\s*,\s*\)/g, ')');
    
    // Fix 5: Fix conditional rendering with wrong commas
    content = content.replace(/&&\s*\(\s*,/g, '&& (');
    content = content.replace(/\?\s*([^:]+)\s*:\s*,/g, '? $1 :');
    
    // Fix 6: Fix object properties in interfaces (missing semicolons)
    content = content.replace(/(\w+:\s*\w+)\s*\n(\s+\})/g, '$1;\n$2');
    content = content.replace(/(\w+:\s*\w+)\s*\n(\s+\w+:)/g, '$1;\n$2');
    
    // Fix 7: Fix array literals with wrong syntax
    content = content.replace(/\[\s*;/g, '[');
    content = content.replace(/:\s*\[([^\]]+)\s*;\s*\]/g, ': [$1]');
    
    // Fix 8: Fix function calls with extra commas in arguments
    content = content.replace(/\.find\(([^)]+),\s*\)/g, '.find($1)');
    content = content.replace(/\.map\(([^)]+),\s*\)/g, '.map($1)');
    content = content.replace(/\.filter\(([^)]+),\s*\)/g, '.filter($1)');
    
    // Fix 9: Fix object properties with commas on same line as next property
    content = content.replace(/(\w+:\s*[^,\n]+),\s*(\w+:)/g, '$1,\n          $2');
    
    // Fix 10: Fix JSX props with wrong syntax
    content = content.replace(/(\w+)=\{([^}]+)},\s*(\w+)=/g, '$1={$2}\n            $3=');
    content = content.replace(/(\w+)=\{([^}]+)}\s*,\s*\/>/g, '$1={$2} />');
    
    // Fix 11: Fix component definitions with wrong syntax
    content = content.replace(/title,\s*value:/g, 'title: string;\n    value:');
    
    // Fix 12: Fix closing braces/brackets with extra commas
    content = content.replace(/}\s*,\s*}/g, '}}');
    content = content.replace(/]\s*,\s*]/g, ']]');
    content = content.replace(/}\s*,\s*]/g, '}]');
    content = content.replace(/]\s*,\s*}/g, ']}');
    
    // Fix 13: Fix ternary operators in JSX
    content = content.replace(/\?\s*'([^']+)'\s*:\s*,/g, "? '$1' :");
    content = content.replace(/:\s*'([^']+)'\s*,\s*}/g, ": '$1'}");
    
    // Fix 14: Fix function body issues
    content = content.replace(/}\s*,\s*;/g, '};');
    content = content.replace(/}\s*;\s*}/g, '}}');
    
    // Fix 15: Fix missing closing tags issue
    content = content.replace(/\/>\s*,\s*</g, '/><');
    
    // Fix 16: Fix evaluations property issue
    content = content.replace(/activeFlags:\s*0,\s*evaluations:\s*0/g, 'activeFlags: 0');
    
    // Fix 17: Fix comment ending with closing braces
    content = content.replace(/\/\/[^}]+}\s*}/g, (match) => {
      // Move closing braces outside comment
      const braces = match.match(/}+$/)[0];
      return match.replace(/}+$/, '') + '\n        ' + braces;
    });
    
    // Fix 18: Fix missing commas between properties in multi-line objects
    content = content.replace(/(\w+:\s*[^,}\n]+)\n(\s+\w+:)/g, '$1,\n$2');
    
    // Fix 19: Fix specific JSX return statement issues
    content = content.replace(/return\s+'([^']+)',\s*}/g, "return '$1'}");
    content = content.replace(/return\s+'([^']+)',\s*;/g, "return '$1';");
    
    // Fix 20: Fix array/object combined syntax issues
    content = content.replace(/]\s*:\s*\[/g, ']: [');
    
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

console.log('🔧 Fixing JSX/TSX syntax errors...\n');

// Priority files with most JSX errors
const priorityFiles = [
  'components/DevOpsDashboard.tsx',
  'components/forms/UnifiedFormSystem.tsx',
  'components/ui/FormComponents.tsx',
  'components/DeveloperDashboard.tsx',
  'pages/StudioDashboardPage.tsx',
  'pages/StudioPage.tsx',
  'config/routes.tsx'
];

let totalFixed = 0;

// Fix priority files first
console.log('📌 Fixing priority JSX files...');
for (const file of priorityFiles) {
  if (fs.existsSync(file)) {
    if (fixFile(file)) {
      totalFixed++;
    }
  }
}

// Then fix all other TypeScript/TSX files
console.log('\n🔍 Scanning for additional JSX files...');
const allTsxFiles = glob.sync('**/*.{tsx,jsx}', {
  ignore: ['node_modules/**', 'dist/**', 'build/**', '.next/**', 'scripts/**']
});

for (const file of allTsxFiles) {
  if (!priorityFiles.includes(file)) {
    if (fixFile(file)) {
      totalFixed++;
    }
  }
}

console.log(`\n✨ Fixed JSX syntax errors in ${totalFixed} files`);
console.log('\n📊 Next steps:');
console.log('1. Run "npm run type-check" to verify fixes');
console.log('2. Remaining errors should be type-related, not syntax');
