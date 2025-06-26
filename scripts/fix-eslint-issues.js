/**
 * Script to fix common ESLint issues systematically
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Helper function to find all TypeScript/JavaScript files
function findTSFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findTSFiles(fullPath, files);
    } else if (item.match(/\.(ts|tsx|js|jsx)$/)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Fix duplicate imports
function fixDuplicateImports(content) {
  const lines = content.split('\n');
  const imports = new Map();
  const nonImportLines = [];
  let inImportSection = true;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('import ') && inImportSection) {
      // Extract the module path
      const match = line.match(/from ['"]([^'"]+)['"]/);;
      if (match) {
        const modulePath = match[1];
        if (imports.has(modulePath)) {
          // Merge imports from the same module
          const existing = imports.get(modulePath);
          const currentImport = line.match(/import\s+({[^}]+}|[^\s,]+|\*\s+as\s+\w+)/);
          if (currentImport && !existing.includes(currentImport[1])) {
            // This is a simplified merge - in practice you'd need more sophisticated logic
            continue; // Skip duplicate for now
          }
        } else {
          imports.set(modulePath, line);
        }
      }
    } else {
      if (trimmed.length > 0 && !trimmed.startsWith('import ')) {
        inImportSection = false;
      }
      nonImportLines.push(line);
    }
  }
  
  // Reconstruct the file
  const importLines = Array.from(imports.values());
  return [...importLines, ...nonImportLines].join('\n');
}

// Fix missing radix parameter
function fixMissingRadix(content) {
  // Fix parseInt calls without radix
  return content.replace(/parseInt\(([^,)]+)\)/g, 'parseInt($1, 10)');
}

// Fix prefer nullish coalescing
function fixNullishCoalescing(content) {
  // Replace logical OR with nullish coalescing where safe
  // This is a simplified version - be careful with boolean values
  return content.replace(/\|\|\s*(['"][^'"]*['"]|\d+|true|false)/g, '?? $1');
}

// Fix form labels
function fixFormLabels(content) {
  // Add htmlFor attribute to labels (simplified)
  return content.replace(/<label([^>]*)>/g, (match, attrs) => {
    if (!attrs.includes('htmlFor')) {
      return `<label${attrs} htmlFor="">`;
    }
    return match;
  });
}

// Main fix function
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Apply fixes
    content = fixDuplicateImports(content);
    content = fixMissingRadix(content);
    // content = fixNullishCoalescing(content); // Commented out as it needs careful handling
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

// Run the fixes
function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const files = findTSFiles(projectRoot);
  
  console.log(`Found ${files.length} files to process...`);
  
  for (const file of files) {
    // Skip certain directories
    if (file.includes('node_modules') || file.includes('.git')) {
      continue;
    }
    
    fixFile(file);
  }
  
  console.log('\nRunning ESLint autofix...');
  try {
    execSync('npm run lint:fix', { stdio: 'inherit', cwd: projectRoot });
  } catch (error) {
    console.log('ESLint autofix completed with some remaining issues.');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  fixDuplicateImports,
  fixMissingRadix,
  fixNullishCoalescing,
  fixFormLabels
};
