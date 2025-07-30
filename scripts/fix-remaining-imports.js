import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Files with duplicate React imports
const filesToFix = [
  'src/components/EnhancedPWAInstallBanner.tsx',
  'src/components/ModularPWAInstallBanner.tsx',
  'src/components/OfflineIndicator.tsx',
  'src/components/PWAInstallBanner.tsx',
  'src/components/PWAUpdateNotification.tsx',
  'src/features/livestream/components/LiveQA.tsx',
  'src/features/video/components/ProtectedVideoPlayer.tsx'
];

function fixDuplicateReactImports() {
  filesToFix.forEach(filePath => {
    const fullPath = join(projectRoot, filePath);
    try {
      let content = readFileSync(fullPath, 'utf8');
      
      // Pattern to match separate React imports
      const typeImportPattern = /import type React from 'react';\s*\n/;
      const namedImportPattern = /import \{([^}]+)\} from 'react';/;
      
      if (typeImportPattern.test(content) && namedImportPattern.test(content)) {
        // Remove the type import
        content = content.replace(typeImportPattern, '');
        
        // Add type React to the named import
        content = content.replace(namedImportPattern, (match, imports) => {
          const cleanImports = imports.trim();
          return `import { ${cleanImports}, type React } from 'react';`;
        });
        
        writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed duplicate React imports in: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error fixing ${filePath}:`, error.message);
    }
  });
}

fixDuplicateReactImports();
console.log('Finished fixing duplicate React imports.');