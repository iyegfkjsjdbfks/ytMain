const fs = require('fs');
const path = require('path');

/**
 * Comprehensive TypeScript Syntax Error Fixer
 * Fixes common syntax errors like missing commas, colons, and brackets
 */

// Files to fix based on error report
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

    // Fix object literal syntax - missing commas after properties
    // Pattern: property: value } or property: value })
    content = content.replace(/(\w+:\s*[^,\s][^,\n]*?)(\s*)(}|\))/g, (match, prop, space, bracket) => {
      // Don't add comma before closing bracket in single-line objects
      if (bracket === '}' && !space.includes('\n')) {
        return match;
      }
      // Add comma if missing
      if (!prop.endsWith(',') && !prop.endsWith('{') && !prop.endsWith('[')) {
        fixCount++;
        return prop + ',' + space + bracket;
      }
      return match;
    });

    // Fix missing commas in object properties (multi-line)
    content = content.replace(/([}\]"'`\d\w])(\s*\n\s+)(\w+:)/g, (match, end, space, prop) => {
      if (end !== ',' && end !== '{' && end !== '[' && end !== ';') {
        fixCount++;
        return end + ',' + space + prop;
      }
      return match;
    });

    // Fix array type declarations - should be Type[] not Type
    content = content.replace(/:\s*AlertItem\s*=/g, ': AlertItem[] =');
    
    // Fix missing commas in multiline object literals
    content = content.replace(/(\w+:\s*[^,\n]+)(\n\s+)(\w+:)/g, (match, prop, space, nextProp) => {
      if (!prop.endsWith(',') && !prop.endsWith('{') && !prop.endsWith('[')) {
        fixCount++;
        return prop + ',' + space + nextProp;
      }
      return match;
    });

    // Fix missing commas in function parameters
    content = content.replace(/\(([^)]*)\)/g, (match, params) => {
      if (params.includes('\n')) {
        const lines = params.split('\n');
        const fixed = lines.map((line, i) => {
          if (i < lines.length - 1 && line.trim() && !line.trim().endsWith(',') && !line.trim().endsWith('{')) {
            return line + ',';
          }
          return line;
        }).join('\n');
        return '(' + fixed + ')';
      }
      return match;
    });

    // Fix missing colons in type definitions
    content = content.replace(/interface\s+\w+\s*{([^}]+)}/g, (match, body) => {
      const fixed = body.replace(/(\w+)\s+(\w+)/g, (m, name, type) => {
        if (!name.includes(':')) {
          return name + ': ' + type;
        }
        return m;
      });
      return match.replace(body, fixed);
    });

    // Fix trailing commas before closing brackets
    content = content.replace(/,(\s*[}\]])/g, '$1');

    // Fix double commas
    content = content.replace(/,,+/g, ',');

    // Fix missing semicolons after statements
    content = content.replace(/^(\s*(?:const|let|var|import|export)\s+.+)$/gm, (match) => {
      if (!match.trim().endsWith(';') && !match.trim().endsWith('{') && !match.includes('=>')) {
        return match + ';';
      }
      return match;
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${fixCount} syntax issues in ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Fixing remaining TypeScript syntax errors...\n');

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

console.log(`\n✨ Fixed syntax errors in ${totalFixed} files`);
