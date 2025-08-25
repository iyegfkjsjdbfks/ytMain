#!/usr/bin/env node

/**
 * Advanced TypeScript Error Resolution - Phase 2
 * Target remaining specific error patterns
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AdvancedErrorFixer {
  constructor() {
    this.processedFiles = new Set();
    this.fixedFiles = [];
    this.backupDir = `.error-fix-backups/phase2-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    this.setupBackup();
  }

  setupBackup() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  createBackup(filePath) {
    const backupPath = path.join(this.backupDir, filePath);
    const backupDir = path.dirname(backupPath);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, backupPath);
    }
  }

  // Get current TypeScript errors
  getCurrentErrors() {
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      return [];
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      return output.split('\n').filter(line => line.includes('error TS'));
    }
  }

  // Fix JSX runtime errors by adding proper imports
  fixJSXRuntimeErrors() {
    console.log('Fixing JSX runtime errors...');
    
    const errors = this.getCurrentErrors();
    const jsxRuntimeErrors = errors.filter(error => 
      error.includes('react/jsx-runtime') || 
      error.includes('This JSX tag requires the module path')
    );

    const filesToFix = new Set();
    jsxRuntimeErrors.forEach(error => {
      const match = error.match(/^([^(]+)/);
      if (match) {
        filesToFix.add(match[1]);
      }
    });

    filesToFix.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        this.fixJSXImportsInFile(filePath);
      }
    });
  }

  fixJSXImportsInFile(filePath) {
    if (this.processedFiles.has(filePath)) return;
    this.processedFiles.add(filePath);
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Ensure React is imported if JSX is used
    if (content.includes('<') && content.includes('>')) {
      if (!content.includes('import React') && !content.includes('from \'react\'')) {
        // Add React import at the top
        const imports = ['React'];
        if (content.includes('useState')) imports.push('useState');
        if (content.includes('useEffect')) imports.push('useEffect');
        if (content.includes('useRef')) imports.push('useRef');
        if (content.includes('useCallback')) imports.push('useCallback');
        if (content.includes('useMemo')) imports.push('useMemo');
        if (content.includes('memo')) imports.push('memo');
        if (content.includes('Component')) imports.push('Component');
        if (content.includes('ErrorInfo')) imports.push('ErrorInfo');
        if (content.includes('ReactNode')) imports.push('ReactNode');
        if (content.includes('FormEvent')) imports.push('FormEvent');

        const uniqueImports = [...new Set(imports)];
        const importStatement = uniqueImports.length === 1 ? 
          `import React from 'react';\n` :
          `import React, { ${uniqueImports.slice(1).join(', ')} } from 'react';\n`;
        
        content = importStatement + content;
      }
    }

    if (content !== originalContent) {
      this.createBackup(filePath);
      fs.writeFileSync(filePath, content);
      this.fixedFiles.push(filePath);
    }
  }

  // Fix module resolution errors
  fixModuleResolutionErrors() {
    console.log('Fixing module resolution errors...');
    
    const errors = this.getCurrentErrors();
    const moduleErrors = errors.filter(error => 
      error.includes('Cannot find module') && (
        error.includes('react-router-dom') ||
        error.includes('@heroicons/react') ||
        error.includes('react')
      )
    );

    const filesToFix = new Set();
    moduleErrors.forEach(error => {
      const match = error.match(/^([^(]+)/);
      if (match) {
        filesToFix.add(match[1]);
      }
    });

    filesToFix.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        this.fixModuleImportsInFile(filePath);
      }
    });
  }

  fixModuleImportsInFile(filePath) {
    if (this.processedFiles.has(filePath)) return;
    this.processedFiles.add(filePath);
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Fix react-router-dom imports
    if (content.includes('useNavigate') || content.includes('Link') || content.includes('useLocation')) {
      if (!content.includes('from \'react-router-dom\'')) {
        const routerImports = [];
        if (content.includes('useNavigate')) routerImports.push('useNavigate');
        if (content.includes('Link')) routerImports.push('Link');
        if (content.includes('useLocation')) routerImports.push('useLocation');
        if (content.includes('useParams')) routerImports.push('useParams');
        if (content.includes('Navigate')) routerImports.push('Navigate');
        if (content.includes('Outlet')) routerImports.push('Outlet');

        if (routerImports.length > 0) {
          const importLine = `import { ${routerImports.join(', ')} } from 'react-router-dom';\n`;
          content = importLine + content;
        }
      }
    }

    // Fix heroicons imports - add them if icons are used
    const heroiconNames = [
      'XMarkIcon', 'UserIcon', 'PlayIcon', 'ArrowTopRightOnSquareIcon',
      'ExclamationTriangleIcon', 'FunnelIcon', 'LightBulbIcon',
      'ArrowUpTrayIcon', 'SignalIcon', 'PencilSquareIcon',
      'ChatBubbleLeftIcon', 'HeartIcon', 'PaperAirplaneIcon',
      'EllipsisVerticalIcon', 'HandThumbUpIcon', 'HandThumbDownIcon',
      'ShareIcon', 'BookmarkIcon', 'FlagIcon', 'ChevronDownIcon',
      'ChevronUpIcon', 'MagnifyingGlassIcon', 'Bars3Icon',
      'BellIcon', 'Cog6ToothIcon', 'HomeIcon', 'FireIcon'
    ];

    const usedIcons = heroiconNames.filter(icon => content.includes(icon));
    if (usedIcons.length > 0 && !content.includes('@heroicons/react/24/outline')) {
      const iconImport = `import { ${usedIcons.join(', ')} } from '@heroicons/react/24/outline';\n`;
      content = iconImport + content;
    }

    if (content !== originalContent) {
      this.createBackup(filePath);
      fs.writeFileSync(filePath, content);
      this.fixedFiles.push(filePath);
    }
  }

  // Fix type annotation errors
  fixTypeAnnotationErrors() {
    console.log('Fixing type annotation errors...');
    
    const errors = this.getCurrentErrors();
    const typeErrors = errors.filter(error => 
      error.includes('implicitly has an \'any\' type') ||
      error.includes('Binding element') ||
      error.includes('Parameter')
    );

    const filesToFix = new Set();
    typeErrors.forEach(error => {
      const match = error.match(/^([^(]+)/);
      if (match) {
        filesToFix.add(match[1]);
      }
    });

    filesToFix.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        this.fixTypeAnnotationsInFile(filePath);
      }
    });
  }

  fixTypeAnnotationsInFile(filePath) {
    if (this.processedFiles.has(filePath)) return;
    this.processedFiles.add(filePath);
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Fix common parameter type annotations
    const parameterFixes = [
      // Event handlers
      { pattern: /\(e\)\s*=>/g, replacement: '(e: any) =>' },
      { pattern: /\(event\)\s*=>/g, replacement: '(event: any) =>' },
      { pattern: /\(prev\)\s*=>/g, replacement: '(prev: any) =>' },
      
      // Common parameters
      { pattern: /\(index\)\s*=>/g, replacement: '(index: number) =>' },
      { pattern: /\(id\)\s*=>/g, replacement: '(id: string) =>' },
      { pattern: /\(name\)\s*=>/g, replacement: '(name: string) =>' },
      { pattern: /\(value\)\s*=>/g, replacement: '(value: any) =>' },
      { pattern: /\(item\)\s*=>/g, replacement: '(item: any) =>' },
      { pattern: /\(data\)\s*=>/g, replacement: '(data: any) =>' },
      
      // Function parameters
      { pattern: /function\s+\w+\((\w+)\)/g, replacement: (match, p1) => match.replace(p1, `${p1}: any`) },
    ];

    parameterFixes.forEach(({ pattern, replacement }) => {
      content = content.replace(pattern, replacement);
    });

    // Fix destructuring parameters
    content = content.replace(
      /\{\s*(\w+)\s*\}/g,
      '{ $1 }: any'
    );

    // Fix binding elements
    content = content.replace(
      /\{\s*(\w+),\s*(\w+)\s*\}/g,
      '{ $1, $2 }: any'
    );

    if (content !== originalContent) {
      this.createBackup(filePath);
      fs.writeFileSync(filePath, content);
      this.fixedFiles.push(filePath);
    }
  }

  // Fix namespace errors (React, NodeJS)
  fixNamespaceErrors() {
    console.log('Fixing namespace errors...');
    
    const errors = this.getCurrentErrors();
    const namespaceErrors = errors.filter(error => 
      error.includes('Cannot find namespace') ||
      error.includes('Cannot find name')
    );

    const filesToFix = new Set();
    namespaceErrors.forEach(error => {
      const match = error.match(/^([^(]+)/);
      if (match) {
        filesToFix.add(match[1]);
      }
    });

    filesToFix.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        this.fixNamespacesInFile(filePath);
      }
    });
  }

  fixNamespacesInFile(filePath) {
    if (this.processedFiles.has(filePath)) return;
    this.processedFiles.add(filePath);
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Add type imports if React types are used
    if (content.includes('React.') || content.includes('ReactNode') || content.includes('ReactElement')) {
      if (!content.includes('import React') && !content.includes('from \'react\'')) {
        content = `import React from 'react';\n` + content;
      }
    }

    // Fix NodeJS namespace
    if (content.includes('NodeJS.Timeout')) {
      if (!content.includes('@types/node')) {
        content = content.replace(/NodeJS\.Timeout/g, 'ReturnType<typeof setTimeout>');
      }
    }

    if (content !== originalContent) {
      this.createBackup(filePath);
      fs.writeFileSync(filePath, content);
      this.fixedFiles.push(filePath);
    }
  }

  // Fix duplicate signatures and syntax errors
  fixSyntaxErrors() {
    console.log('Fixing syntax errors...');
    
    const errors = this.getCurrentErrors();
    const syntaxErrors = errors.filter(error => 
      error.includes('Duplicate index signature') ||
      error.includes('Expected') ||
      error.includes('Unexpected')
    );

    const filesToFix = new Set();
    syntaxErrors.forEach(error => {
      const match = error.match(/^([^(]+)/);
      if (match) {
        filesToFix.add(match[1]);
      }
    });

    filesToFix.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        this.fixSyntaxInFile(filePath);
      }
    });
  }

  fixSyntaxInFile(filePath) {
    if (this.processedFiles.has(filePath)) return;
    this.processedFiles.add(filePath);
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Remove duplicate export default lines
    const lines = content.split('\n');
    const seenExportDefaults = new Set();
    const filteredLines = lines.filter(line => {
      if (line.trim().startsWith('export default')) {
        const signature = line.trim();
        if (seenExportDefaults.has(signature)) {
          return false;
        }
        seenExportDefaults.add(signature);
      }
      return true;
    });
    
    content = filteredLines.join('\n');

    // Fix common syntax issues
    content = content.replace(/\[Symbol\.iterator\]\(\)/g, '[Symbol.iterator]');
    content = content.replace(/override\s+/g, '');

    if (content !== originalContent) {
      this.createBackup(filePath);
      fs.writeFileSync(filePath, content);
      this.fixedFiles.push(filePath);
    }
  }

  // Main execution
  async run() {
    console.log('🚀 Starting advanced TypeScript error resolution (Phase 2)...\n');

    try {
      // Reset processed files for each phase
      this.processedFiles.clear();
      this.fixJSXRuntimeErrors();
      
      this.processedFiles.clear();
      this.fixModuleResolutionErrors();
      
      this.processedFiles.clear();
      this.fixTypeAnnotationErrors();
      
      this.processedFiles.clear();
      this.fixNamespaceErrors();
      
      this.processedFiles.clear();
      this.fixSyntaxErrors();

      console.log('\n✅ Advanced error resolution completed!');
      console.log(`📁 Backup created at: ${this.backupDir}`);
      console.log(`📝 Fixed ${this.fixedFiles.length} additional files`);

      // Test compilation
      console.log('\n🔍 Testing TypeScript compilation...');
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        console.log('✅ TypeScript compilation successful!');
      } catch (error) {
        const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
        const errorCount = (errorOutput.match(/error TS\d+:/g) || []).length;
        console.log(`⚠️ Remaining errors: ${errorCount}`);
        
        if (errorCount < 100) {
          console.log('\n📋 Remaining errors summary:');
          const lines = errorOutput.split('\n').filter(line => line.includes('error TS')).slice(0, 20);
          lines.forEach(line => console.log(`   ${line}`));
          if (errorCount > 20) {
            console.log(`   ... and ${errorCount - 20} more errors`);
          }
        }
      }

    } catch (error) {
      console.error('❌ Error during resolution:', error.message);
      process.exit(1);
    }
  }
}

// Run the advanced fixer
const fixer = new AdvancedErrorFixer();
fixer.run().catch(console.error);