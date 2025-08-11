#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function fixDuplicateImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let lines = content.split('\n');
    
    // Remove reference types that are causing issues
    lines = lines.filter(line => !line.includes('/// <reference types="react/jsx-runtime" />'));
    
    // Find import statements
    let imports = {};
    let nonImportLines = [];
    let importStarted = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('import ')) {
        importStarted = true;
        
        // Parse import statement
        const match = line.match(/^import\s+(.*?)\s+from\s+['"]([^'"]+)['"];?\s*$/);
        if (match) {
          const importParts = match[1];
          const module = match[2];
          
          if (!imports[module]) {
            imports[module] = new Set();
          }
          
          // Handle different import patterns
          if (importParts.includes('{')) {
            // Named imports
            const namedMatch = importParts.match(/\{\s*([^}]+)\s*\}/);
            if (namedMatch) {
              const namedImports = namedMatch[1].split(',').map(imp => imp.trim());
              namedImports.forEach(imp => imports[module].add(imp));
            }
          } else if (importParts.startsWith('type ')) {
            // Type import
            const typeName = importParts.replace('type ', '').trim();
            imports[module].add(`type ${typeName}`);
          } else {
            // Default import
            imports[module].add(importParts.trim());
          }
        }
      } else if (line.startsWith('declare global') || line.includes('[elemName]')) {
        // Skip problematic global declarations
        continue;
      } else {
        if (importStarted && line === '') {
          // Skip empty lines immediately after imports
          continue;
        }
        nonImportLines.push(lines[i]);
      }
    }
    
    // Reconstruct file with deduplicated imports
    let newContent = '';
    
    // Add imports back
    for (const [module, importSet] of Object.entries(imports)) {
      const importsList = Array.from(importSet);
      
      // Separate default, type, and named imports
      const defaultImports = importsList.filter(imp => !imp.startsWith('type ') && !imp.includes(',') && !imp.includes('{'));
      const typeImports = importsList.filter(imp => imp.startsWith('type '));
      const namedImports = importsList.filter(imp => !imp.startsWith('type ') && (imp.includes(',') || defaultImports.indexOf(imp) === -1));
      
      if (defaultImports.length > 0 || typeImports.length > 0 || namedImports.length > 0) {
        let importStatement = 'import ';
        
        if (defaultImports.length > 0) {
          importStatement += defaultImports[0];
        }
        
        if (typeImports.length > 0) {
          if (defaultImports.length > 0) importStatement += ', ';
          importStatement += typeImports.join(', ');
        }
        
        if (namedImports.length > 0) {
          if (defaultImports.length > 0 || typeImports.length > 0) importStatement += ', ';
          importStatement += `{ ${namedImports.join(', ')} }`;
        }
        
        importStatement += ` from '${module}';`;
        newContent += importStatement + '\n';
      }
    }
    
    // Add empty line after imports
    if (Object.keys(imports).length > 0) {
      newContent += '\n';
    }
    
    // Add rest of the file
    newContent += nonImportLines.join('\n');
    
    // Write back to file
    fs.writeFileSync(filePath, newContent);
    console.log(`Fixed: ${filePath}`);
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Get all TypeScript/TSX files
const files = glob.sync('**/*.{ts,tsx}', {
  cwd: process.cwd(),
  ignore: ['node_modules/**', 'dist/**', 'build/**']
});

console.log(`Processing ${files.length} files...`);

files.slice(0, 10).forEach(fixDuplicateImports); // Process first 10 files as a test

console.log('Done!');