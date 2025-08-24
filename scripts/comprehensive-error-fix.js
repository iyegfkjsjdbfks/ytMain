const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Comprehensive TypeScript error fixing script
class ComprehensiveErrorFixer {
  constructor() {
    this.fixedFiles = new Set();
    this.errorPatterns = [
      // Import fixes
      { pattern: /import React, \{ _ReactNode \}/g, replacement: 'import React, { ReactNode }' },
      { pattern: /React\._ReactNode/g, replacement: 'React.ReactNode' },
      
      // Any type corruption fixes
      { pattern: /: any\./g, replacement: '.' },
      { pattern: /\(([^)]+): any\)/g, replacement: '($1)' },
      { pattern: /value: any=/g, replacement: 'value=' },
      { pattern: /videos: any=/g, replacement: 'videos=' },
      { pattern: /channel: any\./g, replacement: 'channel.' },
      { pattern: /video: any\./g, replacement: 'video.' },
      { pattern: /short: any\./g, replacement: 'short.' },
      { pattern: /prev: any\./g, replacement: 'prev.' },
      { pattern: /option: any\./g, replacement: 'option.' },
      { pattern: /user: any\./g, replacement: 'user.' },
      { pattern: /data: any\./g, replacement: 'data.' },
      { pattern: /item: any\./g, replacement: 'item.' },
      { pattern: /element: any\./g, replacement: 'element.' },
      { pattern: /event: any\./g, replacement: 'event.' },
      { pattern: /response: any\./g, replacement: 'response.' },
      { pattern: /result: any\./g, replacement: 'result.' },
      { pattern: /state: any\./g, replacement: 'state.' },
      { pattern: /props: any\./g, replacement: 'props.' },
      { pattern: /config: any\./g, replacement: 'config.' },
      { pattern: /params: any\./g, replacement: 'params.' },
      { pattern: /args: any\./g, replacement: 'args.' },
      { pattern: /obj: any\./g, replacement: 'obj.' },
      { pattern: /val: any\./g, replacement: 'val.' },
      { pattern: /key: any\./g, replacement: 'key.' },
      
      // Function parameter fixes
      { pattern: /\(([^)]+): any\) =>/g, replacement: '($1) =>' },
      { pattern: /\{([^}]+): any\}/g, replacement: '{$1}' },
      
      // JSX prop fixes
      { pattern: /([a-zA-Z]+): any=\{/g, replacement: '$1={' },
      
      // Array and object access fixes
      { pattern: /\[([^\]]+): any\]/g, replacement: '[$1]' },
      
      // State setter fixes
      { pattern: /setPrev: any\(/g, replacement: 'setPrev(' },
      { pattern: /setData: any\(/g, replacement: 'setData(' },
      { pattern: /setState: any\(/g, replacement: 'setState(' },
      
      // Event handler fixes
      { pattern: /onChange=\{\(([^)]+): any\)/g, replacement: 'onChange={($1)' },
      { pattern: /onClick=\{\(([^)]+): any\)/g, replacement: 'onClick={($1)' },
      { pattern: /onSubmit=\{\(([^)]+): any\)/g, replacement: 'onSubmit={($1)' },
      
      // Type assertion fixes
      { pattern: / as any/g, replacement: '' },
      
      // Incomplete lines fixes
      { pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*): any\s*$/gm, replacement: '$1' },
      
      // Malformed property access
      { pattern: /\.([a-zA-Z_$][a-zA-Z0-9_$]*): any/g, replacement: '.$1' },
      
      // Template literal fixes
      { pattern: /\$\{([^}]+): any\}/g, replacement: '${$1}' }
    ];
  }

  async fixAllErrors() {
    console.log('🔧 Starting comprehensive TypeScript error fixing...');
    
    try {
      // Get all TypeScript files
      const tsFiles = this.getAllTSFiles();
      console.log(`📁 Found ${tsFiles.length} TypeScript files`);
      
      // Fix each file
      for (const file of tsFiles) {
        this.fixFile(file);
      }
      
      console.log(`✅ Fixed ${this.fixedFiles.size} files`);
      
      // Run TypeScript check
      console.log('🔍 Running TypeScript check...');
      const result = this.runTypeScriptCheck();
      
      if (result.success) {
        console.log('🎉 All TypeScript errors have been resolved!');
      } else {
        console.log(`⚠️  ${result.errorCount} errors remaining`);
        console.log('📋 Remaining errors:');
        console.log(result.output.slice(0, 2000) + (result.output.length > 2000 ? '...' : ''));
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error during fixing process:', error.message);
      return { success: false, error: error.message };
    }
  }

  getAllTSFiles() {
    const files = [];
    const searchDirs = ['src', 'scripts'];
    
    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        this.findTSFiles(dir, files);
      }
    }
    
    return files;
  }

  findTSFiles(dir, files) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        this.findTSFiles(fullPath, files);
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  }

  fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Apply all error patterns
      for (const { pattern, replacement } of this.errorPatterns) {
        content = content.replace(pattern, replacement);
      }
      
      // Additional specific fixes
      content = this.applySpecificFixes(content, filePath);
      
      // Only write if content changed
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.fixedFiles.add(filePath);
        console.log(`🔧 Fixed: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
  }

  applySpecificFixes(content, filePath) {
    // Fix incomplete lines that end with truncated patterns
    content = content.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*): any\s*\n/g, '$1\n');
    
    // Fix malformed JSX attributes
    content = content.replace(/(\w+): any=\{([^}]+)\}/g, '$1={$2}');
    
    // Fix malformed function calls
    content = content.replace(/(\w+)\(([^)]*): any([^)]*)\)/g, '$1($2$3)');
    
    // Fix malformed object destructuring
    content = content.replace(/\{([^}]*): any([^}]*)\}/g, '{$1$2}');
    
    // Fix malformed array destructuring
    content = content.replace(/\[([^\]]*): any([^\]]*)\]/g, '[$1$2]');
    
    // Fix malformed template literals
    content = content.replace(/`([^`]*): any([^`]*)`/g, '`$1$2`');
    
    // Fix malformed imports
    content = content.replace(/import\s+([^{]*): any([^;]*);/g, 'import $1$2;');
    
    // Fix malformed exports
    content = content.replace(/export\s+([^{]*): any([^;]*);/g, 'export $1$2;');
    
    return content;
  }

  runTypeScriptCheck() {
    try {
      const output = execSync('npx tsc --noEmit', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return { success: true, output, errorCount: 0 };
    } catch (error) {
      const output = error.stdout || error.stderr || error.message;
      const errorCount = (output.match(/error TS\d+:/g) || []).length;
      return { success: false, output, errorCount };
    }
  }
}

// Run the fixer
if (require.main === module) {
  const fixer = new ComprehensiveErrorFixer();
  fixer.fixAllErrors().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = ComprehensiveErrorFixer;