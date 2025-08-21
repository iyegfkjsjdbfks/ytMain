const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Final Comprehensive Fix - Fix all remaining import and syntax errors
 */

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Fix malformed React imports first
    // Pattern: import React, { { FC, FC } from 'react';
    content = content.replace(/import\s+React,\s*\{\s*\{([^}]+)\}\s*from\s*['"]react['"]/g, (match, imports) => {
      // Remove duplicates and clean up
      const cleanImports = imports.split(',')
        .map(i => i.trim())
        .filter((v, i, a) => a.indexOf(v) === i && v)
        .join(', ');
      return `import React, { ${cleanImports} } from 'react'`;
    });
    
    // Fix pattern: import React, { FC, FC } from 'react';
    content = content.replace(/import\s+React,\s*\{([^}]+)\}\s*from\s*['"]react['"]/g, (match, imports) => {
      // Split imports and remove duplicates
      const importList = imports.split(',').map(i => i.trim());
      const uniqueImports = [...new Set(importList)].filter(Boolean);
      if (uniqueImports.length > 0) {
        return `import React, { ${uniqueImports.join(', ')} } from 'react'`;
      }
      return `import React from 'react'`;
    });
    
    // Fix pattern: import { { something } } from 'module';
    content = content.replace(/import\s*\{\s*\{([^}]+)\}\s*\}\s*from/g, 'import { $1 } from');
    
    // Fix double commas in imports
    content = content.replace(/,\s*,/g, ',');
    
    // Fix trailing commas in interface/type definitions
    content = content.replace(/;,/g, ';');
    content = content.replace(/:,/g, ':');
    
    // Remove empty imports
    content = content.replace(/import\s*\{\s*\}\s*from\s*['"][^'"]+['"]\s*;?\n/g, '');
    
    // Fix duplicate type keywords
    content = content.replace(/type\s+type\s+/g, 'type ');
    content = content.replace(/interface\s+interface\s+/g, 'interface ');
    
    // Clean up whitespace
    content = content.replace(/\n{4,}/g, '\n\n\n');
    content = content.replace(/^\s+$/gm, '');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Running final comprehensive fix...\n');

// Get all TypeScript and JavaScript files
const allFiles = glob.sync('**/*.{ts,tsx,js,jsx}', {
  ignore: ['node_modules/**', 'dist/**', 'build/**', '.next/**', 'scripts/**']
});

let totalFixed = 0;

for (const file of allFiles) {
  if (fixFile(file)) {
    totalFixed++;
  }
}

console.log(`\n✨ Fixed ${totalFixed} files`);
console.log('\n🎯 Final fix complete!');
