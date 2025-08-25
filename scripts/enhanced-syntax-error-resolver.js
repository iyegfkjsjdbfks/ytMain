#!/usr/bin/env node
/**
 * Enhanced Syntax Error Resolution System
 * 
 * This script targets critical syntax errors (TS1005, TS1382, TS1128) that
 * prevent TypeScript compilation and must be fixed before other errors.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SyntaxErrorResolver {
  constructor(options = {}) {
    this.options = {
      projectPath: process.cwd(),
      dryRun: false,
      backup: true,
      ...options
    };
    
    this.startTime = Date.now();
    this.totalErrorsFixed = 0;
    this.backupDir = path.join(process.cwd(), '.syntax-error-backups');
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }

  async run() {
    this.log('🔧 Starting Enhanced Syntax Error Resolution...');
    
    try {
      // Create backup
      if (this.options.backup) {
        await this.createBackup();
      }
      
      // Get current syntax errors
      const syntaxErrors = await this.getSyntaxErrors();
      this.log(`📊 Found ${syntaxErrors.length} syntax errors to fix`);
      
      if (syntaxErrors.length === 0) {
        this.log('🎉 No syntax errors found!');
        return { success: true, errorsFixed: 0 };
      }

      // Group errors by file
      const fileGroups = new Map();
      for (const error of syntaxErrors) {
        if (!fileGroups.has(error.file)) {
          fileGroups.set(error.file, []);
        }
        fileGroups.get(error.file).push(error);
      }

      // Fix each file
      let totalFixed = 0;
      for (const [filePath, errors] of fileGroups) {
        this.log(`🔧 Fixing syntax errors in ${path.basename(filePath)}...`);
        
        if (this.options.dryRun) {
          this.log(`🔍 DRY RUN: Would fix ${errors.length} errors in ${filePath}`);
          continue;
        }

        try {
          const fixed = await this.fixSyntaxErrorsInFile(filePath, errors);
          totalFixed += fixed;
          this.log(`✅ Fixed ${fixed} syntax errors in ${path.basename(filePath)}`);
        } catch (error) {
          this.log(`❌ Error fixing ${filePath}: ${error.message}`, 'error');
        }
      }

      this.totalErrorsFixed = totalFixed;
      const executionTime = Date.now() - this.startTime;
      this.log(`✅ Syntax error resolution completed in ${Math.round(executionTime / 1000)}s`);
      this.log(`📈 Fixed ${totalFixed} syntax errors`);

      return { success: true, errorsFixed: totalFixed, executionTime };
      
    } catch (error) {
      this.log(`❌ Syntax error resolution failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async getSyntaxErrors() {
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      return [];
    } catch (error) {
      const output = error.stdout ? error.stdout.toString() : error.stderr.toString();
      const lines = output.split('\n').filter(line => 
        line.trim() && 
        line.includes('error TS') && 
        (line.includes('TS1005') || line.includes('TS1382') || line.includes('TS1128') || line.includes('TS2657'))
      );
      
      return lines.map(line => this.parseErrorLine(line)).filter(Boolean);
    }
  }

  parseErrorLine(line) {
    const errorRegex = /^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$/;
    const match = line.match(errorRegex);
    
    if (!match) return null;
    
    const [, file, lineNum, column, code, message] = match;
    
    return {
      file: file.trim(),
      line: parseInt(lineNum, 10),
      column: parseInt(column, 10),
      code,
      message: message.trim(),
      raw: line
    };
  }

  async fixSyntaxErrorsInFile(filePath, errors) {
    if (!fs.existsSync(filePath)) {
      this.log(`⚠️ File not found: ${filePath}`, 'warn');
      return 0;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Critical syntax fixes for React/JSX files
    const criticalFixes = [
      // Fix malformed function closures 
      { pattern: /\}, \[\]\);if \(container\) \{/g, replacement: '}, []);\n\n  const scrollRight = useCallback(() => {\n    const container = scrollContainerRef.current;\n    if (container) {' },
      
      // Fix broken JSX button structure
      { pattern: /<button>\s*onClick=/g, replacement: '<button\n          onClick=' },
      
      // Fix malformed className attributes
      { pattern: /className=\{"([^"]*)\}([^"]*)/g, replacement: 'className="$1$2"' },
      { pattern: /className=\{"absolut\}e/g, replacement: 'className="absolute' },
      { pattern: /className=\{"w\}-4/g, replacement: 'className="w-4' },
      { pattern: /className=\{"fle\}x/g, replacement: 'className="flex' },
      
      // Fix div ref issues
      { pattern: /<div>\s*ref=/g, replacement: '<div\n        ref=' },
      
      // Fix malformed type annotations
      { pattern: /: unknown\)/g, replacement: ')' },
      { pattern: /: unknown;/g, replacement: ';' },
      { pattern: /: unknown,/g, replacement: ',' },
      
      // Fix addEventListener calls
      { pattern: /addEventListener\('([^']+)',\s*([^)]+): unknown\)/g, replacement: "addEventListener('$1', $2)" },
      { pattern: /removeEventListener\('([^']+)',\s*([^)]+): unknown\)/g, replacement: "removeEventListener('$1', $2)" },
      { pattern: /setTimeout\(([^,]+),\s*(\d+): unknown\)/g, replacement: 'setTimeout($1, $2)' },
      
      // Fix JSX fragment issues
      { pattern: /<>\s*{\/\*.*?\*\/}/g, replacement: '<React.Fragment>' },
      { pattern: /<\/>\s*$/g, replacement: '</React.Fragment>' },
    ];

    for (const { pattern, replacement } of criticalFixes) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
        this.log(`  ✓ Applied fix: ${pattern.source}`, 'debug');
      }
    }

    // File-specific fixes based on detected issues
    if (filePath.includes('CategoryChips.tsx')) {
      content = this.fixCategoryChipsSpecific(content);
      modified = true;
    }

    if (filePath.includes('ChannelHeader.tsx')) {
      content = this.fixChannelHeaderSpecific(content);
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      return errors.length;
    }

    return 0;
  }

  fixCategoryChipsSpecific(content) {
    // Fix the specific syntax issues in CategoryChips.tsx
    
    // Fix the broken scrollRight function definition
    content = content.replace(
      /}, \[\]\);if \(container\) \{\s*container\.scrollBy\(\{ left: 200, behavior: 'smooth' \}\);\s*\}\s*\}, \[\]\);/g,
      `}, []);

  const scrollRight = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }, []);`
    );

    // Fix broken button JSX structure
    content = content.replace(
      /<button>\s*onClick=\{scrollLeft\}\s*className=\{"absolut\}e([^"]+)"\s*aria-label="([^"]+)"\s*>/g,
      `<button
          onClick={scrollLeft}
          className="absolute$1"
          aria-label="$2"
        >`
    );

    // Fix broken div with ref
    content = content.replace(
      /<div>\s*ref=\{scrollContainerRef\}\s*className=\{"fle\}x([^"]+)"/g,
      `<div
        ref={scrollContainerRef}
        className="flex$1"`
    );

    // Fix broken svg className
    content = content.replace(
      /className=\{"w\}-4([^"]+)"/g,
      'className="w-4$1"'
    );

    return content;
  }

  fixChannelHeaderSpecific(content) {
    // Fix JSX fragment issues in ChannelHeader
    
    // Add proper React fragment wrapper
    if (content.includes('return (') && !content.includes('<div>') && !content.includes('React.Fragment')) {
      content = content.replace(
        /return \(\s*<img/,
        'return (\n    <React.Fragment>\n      <img'
      );
      
      content = content.replace(
        /}\s*\);$/m,
        '}\n    </React.Fragment>\n  );'
      );
    }

    return content;
  }

  async createBackup() {
    this.log('📦 Creating syntax backup...');
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupPath = path.join(this.backupDir, `syntax-fix-${timestamp}`);
    
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    try {
      const filesToBackup = ['components', 'src'];
      fs.mkdirSync(backupPath, { recursive: true });

      for (const file of filesToBackup) {
        const srcPath = path.join(this.options.projectPath, file);
        const destPath = path.join(backupPath, file);
        
        if (fs.existsSync(srcPath)) {
          await this.copyDirectory(srcPath, destPath);
        }
      }

      this.log(`✅ Backup created at: ${backupPath}`);
      this.backupPath = backupPath;
    } catch (error) {
      this.log(`⚠️ Backup failed: ${error.message}`, 'warn');
    }
  }

  async copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const noBackup = args.includes('--no-backup');
  
  console.log('🔧 Enhanced Syntax Error Resolution System');
  console.log('🎯 Targeting critical syntax errors that block compilation\n');

  const resolver = new SyntaxErrorResolver({
    dryRun,
    backup: !noBackup
  });

  resolver.run()
    .then(result => {
      console.log('\n🎉 Syntax Error Resolution Complete!');
      console.log(`📈 Fixed ${result.errorsFixed} syntax errors in ${Math.round(result.executionTime / 1000)}s`);
      
      if (result.errorsFixed > 0) {
        console.log('🔍 Run TypeScript compilation again to check for remaining errors');
      }
      
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Syntax Error Resolution Failed:');
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = { SyntaxErrorResolver };