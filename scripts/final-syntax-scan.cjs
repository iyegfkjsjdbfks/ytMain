const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Final Syntax Scanner and Fixer
 * Finds and fixes all remaining syntax errors
 */

function scanAndFixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixes = [];
    
    // Fix 1: Remove trailing commas in interfaces/types
    content = content.replace(/(\w+)\s*:\s*([^;,}]+);,/g, (match, prop, type) => {
      fixes.push('Fixed trailing comma after semicolon');
      return `${prop}: ${type};`;
    });
    
    // Fix 2: Fix object literals with trailing comma-semicolon
    content = content.replace(/(\w+)\s*:\s*\{,/g, (match, prop) => {
      fixes.push('Fixed comma after opening brace');
      return `${prop}: {`;
    });
    
    // Fix 3: Fix function parameters with double commas
    content = content.replace(/\(([\w\s:]+),\s*,/g, (match, params) => {
      fixes.push('Fixed double comma in parameters');
      return `(${params},`;
    });
    
    // Fix 4: Fix object property with comma after colon
    content = content.replace(/(\w+)\s*:,/g, (match, prop) => {
      fixes.push('Fixed comma immediately after colon');
      return `${prop}:`;
    });
    
    // Fix 5: Fix closing brace with trailing semicolon-comma
    content = content.replace(/\};,/g, '};');
    
    // Fix 6: Fix interface properties with comma after semicolon
    content = content.replace(/;,\n/g, ';\n');
    
    // Fix 7: Remove duplicate imports
    const importRegex = /^import .+ from ['"][^'"]+['"];?$/gm;
    const imports = content.match(importRegex) || [];
    const uniqueImports = new Set();
    const duplicateImports = new Set();
    
    imports.forEach(imp => {
      const normalized = imp.replace(/;$/, '');
      if (uniqueImports.has(normalized)) {
        duplicateImports.add(imp);
      } else {
        uniqueImports.add(normalized);
      }
    });
    
    if (duplicateImports.size > 0) {
      duplicateImports.forEach(dup => {
        content = content.replace(dup + '\n', '');
        fixes.push('Removed duplicate import');
      });
    }
    
    // Fix 8: Fix multiple React imports
    const reactImports = content.match(/^import .+ from ['"]react['"];?$/gm) || [];
    if (reactImports.length > 1) {
      // Combine all React imports into one
      const allImports = new Set();
      reactImports.forEach(imp => {
        const match = imp.match(/import \{?([^}]+)\}? from/);
        if (match && match[1]) {
          match[1].split(',').forEach(i => allImports.add(i.trim()));
        }
      });
      
      // Remove all React imports
      reactImports.forEach(imp => {
        content = content.replace(imp + '\n', '');
      });
      
      // Add combined import at the top
      const hasReactDefault = allImports.has('React') || allImports.has('default as React');
      allImports.delete('React');
      allImports.delete('default as React');
      
      let combinedImport = '';
      if (hasReactDefault && allImports.size > 0) {
        combinedImport = `import React, { ${Array.from(allImports).join(', ')} } from 'react';\n`;
      } else if (hasReactDefault) {
        combinedImport = `import React from 'react';\n`;
      } else if (allImports.size > 0) {
        combinedImport = `import { ${Array.from(allImports).join(', ')} } from 'react';\n`;
      }
      
      if (combinedImport) {
        content = combinedImport + content;
        fixes.push('Combined React imports');
      }
    }
    
    // Fix 9: Fix property/method definitions with invalid syntax
    content = content.replace(/(\w+)\s*:\s*(\w+)\s*;,/g, '$1: $2;');
    
    // Fix 10: Fix arrow functions with invalid syntax
    content = content.replace(/=>\s*,/g, '=>');
    
    // Fix 11: Fix JSX props with trailing commas
    content = content.replace(/(<\w+[^>]*)(,)(\s*\/?>)/g, '$1$3');
    
    // Fix 12: Fix empty catch blocks
    content = content.replace(/} catch \{/g, '} catch (e) {');
    
    // Fix 13: Fix interface extends with comma
    content = content.replace(/interface (\w+) extends (\w+),/g, 'interface $1 extends $2');
    
    // Fix 14: Fix type definitions with trailing comma
    content = content.replace(/type (\w+) = ([^;]+),;/g, 'type $1 = $2;');
    
    // Fix 15: Clean up whitespace issues
    content = content.replace(/\n{4,}/g, '\n\n\n');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${fixes.length} issues in ${filePath}`);
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

console.log('🔍 Scanning for syntax errors...\n');

// Get all TypeScript and JavaScript files
const allFiles = glob.sync('**/*.{ts,tsx,js,jsx}', {
  ignore: ['node_modules/**', 'dist/**', 'build/**', '.next/**', 'scripts/**', '*.config.*']
});

let totalFixed = 0;

for (const file of allFiles) {
  if (scanAndFixFile(file)) {
    totalFixed++;
  }
}

console.log(`\n✨ Fixed syntax issues in ${totalFixed} files`);
console.log('\n🎯 Syntax scan complete!');
