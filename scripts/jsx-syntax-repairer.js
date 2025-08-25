#!/usr/bin/env node
/**
 * JSX Syntax Repair System
 * 
 * This script fixes malformed JSX syntax patterns that prevent compilation.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class JSXSyntaxRepairer {
  constructor(options = {}) {
    this.options = {
      projectPath: process.cwd(),
      dryRun: false,
      ...options
    };
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }

  async run() {
    this.log('🔧 Starting JSX Syntax Repair...');
    
    // Get files with JSX syntax errors
    const jsxFiles = await this.getJSXFiles();
    this.log(`📊 Found ${jsxFiles.length} JSX files to check`);
    
    let totalFixed = 0;
    for (const filePath of jsxFiles) {
      if (this.options.dryRun) {
        this.log(`🔍 DRY RUN: Would repair ${filePath}`);
        continue;
      }

      try {
        const fixed = await this.repairJSXFile(filePath);
        if (fixed > 0) {
          totalFixed += fixed;
          this.log(`✅ Repaired ${fixed} JSX issues in ${path.basename(filePath)}`);
        }
      } catch (error) {
        this.log(`❌ Error repairing ${filePath}: ${error.message}`, 'error');
      }
    }

    this.log(`🎉 JSX Syntax Repair completed. Fixed ${totalFixed} issues.`);
    return { success: true, issuesFixed: totalFixed };
  }

  async getJSXFiles() {
    const files = [];
    const searchDirs = ['components', 'src'];
    
    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        this.findJSXFiles(dir, files);
      }
    }
    
    return files;
  }

  findJSXFiles(dir, files) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        this.findJSXFiles(fullPath, files);
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) {
        files.push(fullPath);
      }
    }
  }

  async repairJSXFile(filePath) {
    if (!fs.existsSync(filePath)) return 0;

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixCount = 0;

    // Fix double quotes in JSX attributes
    const fixes = [
      // Fix double quotes at end of className
      { 
        pattern: /className="([^"]*)""/g, 
        replacement: 'className="$1"',
        description: 'Double quotes after className'
      },
      
      // Fix double quotes at end of other attributes
      { 
        pattern: /(\w+)="([^"]*)""/g, 
        replacement: '$1="$2"',
        description: 'Double quotes after attributes'
      },
      
      // Fix malformed map calls
      { 
        pattern: /\.map\?\(/g, 
        replacement: '.map(',
        description: 'Optional chaining in map calls'
      },
      
      // Fix button attributes outside of opening tag
      { 
        pattern: /<button>\s*key=/g, 
        replacement: '<button\n            key=',
        description: 'Button attributes outside tag'
      },
      
      // Fix malformed JSX element structure
      { 
        pattern: /<button>\s*onClick=/g, 
        replacement: '<button\n          onClick=',
        description: 'Button onClick outside tag'
      },
      
      // Fix prop spreading issues
      { 
        pattern: />\s*key=/g, 
        replacement: '\n          key=',
        description: 'Key prop after closing bracket'
      },
      
      // Fix JSX closing tag issues
      { 
        pattern: /\s*}\s*>\s*}\)/g, 
        replacement: '\n          }\n        ))}',
        description: 'Malformed JSX closing'
      },
      
      // Fix unterminated string literals in JSX
      { 
        pattern: /className=\{`([^`]*)`}\s*}/g, 
        replacement: 'className="`$1`"',
        description: 'Template literal in className'
      }
    ];

    for (const fix of fixes) {
      const beforeLength = content.length;
      content = content.replace(fix.pattern, fix.replacement);
      const afterLength = content.length;
      
      if (beforeLength !== afterLength) {
        fixCount++;
        this.log(`  ✓ Applied: ${fix.description}`, 'debug');
      }
    }

    // Manual pattern fixes for specific complex cases
    content = this.fixComplexJSXPatterns(content, filePath);

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      return fixCount + 1; // +1 for manual fixes
    }

    return 0;
  }

  fixComplexJSXPatterns(content, filePath) {
    // Fix specific complex JSX patterns that regex can't handle well
    
    // Fix malformed map with button structure
    if (content.includes('map?.((')) {
      content = content.replace(/\.map\?\(\(([^)]+)\) => \(/g, '.map(($1) => (');
    }

    // Fix button with props outside the opening tag
    content = content.replace(
      /<button>\s*(key=\{[^}]+\})\s*(onClick=\{[^}]+\})\s*(className=\{[^}]+\}|className="[^"]*")/g,
      '<button\n            $1\n            $2\n            $3'
    );

    // Fix div with props outside the opening tag  
    content = content.replace(
      /<div>\s*(ref=\{[^}]+\})\s*(className=\{[^}]+\}|className="[^"]*")/g,
      '<div\n        $1\n        $2'
    );

    // Fix JSX fragments and closing issues
    content = content.replace(/\s*}\s*>\s*}\)\s*$/gm, '\n          }\n        ))}');
    
    // Fix arrow function return JSX
    content = content.replace(/\) => \(\s*<([^>]+)>/g, ') => (\n          <$1>');

    return content;
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  console.log('🔧 JSX Syntax Repair System');
  console.log('🎯 Fixing malformed JSX syntax patterns\n');

  const repairer = new JSXSyntaxRepairer({ dryRun });

  repairer.run()
    .then(result => {
      console.log('\n🎉 JSX Syntax Repair Complete!');
      console.log(`📈 Fixed ${result.issuesFixed} JSX syntax issues`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ JSX Syntax Repair Failed:');
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = { JSXSyntaxRepairer };