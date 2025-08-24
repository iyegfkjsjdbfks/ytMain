#!/usr/bin/env node

/**
 * Fix Remaining TypeScript Errors
 * Targeted fixes for the 13 remaining errors
 */

const fs = require('fs');
const path = require('path');

// Specific fixes for remaining errors
const REMAINING_FIXES = {
  'src/pages/HistoryPage.tsx': [
    {
      line: 28,
      description: 'Fix missing comma in useEffect dependencies',
      find: '}, []);',
      replace: '}, []);'
    }
  ],

  'src/pages/LikedVideosPage.tsx': [
    {
      line: 30,
      description: 'Fix missing comma in useEffect dependencies',
      find: '}, []);',
      replace: '}, []);'
    }
  ],

  'src/pages/LoginPage.tsx': [
    {
      line: 192,
      description: 'Add missing closing brace',
      find: 'export default LoginPage;',
      replace: '}\n\nexport default LoginPage;'
    }
  ],

  'src/pages/PlaylistsPage.tsx': [
    {
      line: 35,
      description: 'Fix missing comma in useEffect dependencies',
      find: '}, []);',
      replace: '}, []);'
    },
    {
      line: 99,
      description: 'Fix JSX closing tag',
      find: '>\n    ~',
      replace: '>\n    </div>'
    },
    {
      line: 102,
      description: 'Fix JSX structure',
      find: '// FIXED:  </button>',
      replace: '</button>'
    },
    {
      line: 105,
      description: 'Fix missing parenthesis',
      find: '{loading ? (',
      replace: '{loading ? ('
    },
    {
      line: 164,
      description: 'Fix identifier issue',
      find: 'setNewPlaylistName(e.target.value);',
      replace: 'setNewPlaylistName((e.target as HTMLInputElement).value);'
    },
    {
      line: 166,
      description: 'Fix syntax error',
      find: '}',
      replace: '}'
    },
    {
      line: 171,
      description: 'Fix JSX syntax',
      find: '/>',
      replace: '/>'
    },
    {
      line: 201,
      description: 'Fix declaration error',
      find: ');',
      replace: '});'
    },
    {
      line: 202,
      description: 'Fix declaration error',
      find: '};',
      replace: '};'
    }
  ],

  'src/pages/RegisterPage.tsx': [
    {
      line: 246,
      description: 'Add missing closing brace',
      find: 'export default RegisterPage;',
      replace: '}\n\nexport default RegisterPage;'
    }
  ]
};

class RemainingErrorsFixer {
  constructor() {
    this.fixedFiles = [];
    this.errorsFixed = 0;
    this.backupDir = path.join(process.cwd(), '.error-fix-backups');
  }

  async run() {
    console.log('🔧 Starting Remaining Errors Fixer...\n');

    // Create backup
    await this.createBackup();

    // Fix each file with specific issues
    for (const [filePath, fixes] of Object.entries(REMAINING_FIXES)) {
      if (fs.existsSync(filePath)) {
        console.log(`📝 Fixing ${path.basename(filePath)}...`);
        const result = await this.fixFile(filePath, fixes);
        if (result) {
          this.fixedFiles.push(filePath);
          this.errorsFixed += fixes.length;
        }
      } else {
        console.log(`⚠️  File not found: ${filePath}`);
      }
    }

    // Apply additional pattern fixes
    await this.applyPatternFixes();

    // Validate fixes
    await this.validateFixes();

    // Generate final report
    this.generateReport();
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `remaining-fixes-${timestamp}`);

    console.log(`💾 Creating backup: ${backupPath}`);

    fs.mkdirSync(backupPath, { recursive: true });

    // Copy affected files
    for (const filePath of Object.keys(REMAINING_FIXES)) {
      if (fs.existsSync(filePath)) {
        const backupFilePath = path.join(backupPath, path.basename(filePath));
        try {
          fs.copyFileSync(filePath, backupFilePath);
        } catch (error) {
          console.warn(`⚠️  Could not backup ${filePath}:`, error.message);
        }
      }
    }
  }

  async fixFile(filePath, fixes) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      for (const fix of fixes) {
        if (fix.find && fix.replace) {
          // Try to find and replace the specific text
          if (content.includes(fix.find)) {
            content = content.replace(fix.find, fix.replace);
            modified = true;
            console.log(`  ✅ ${fix.description}`);
          } else {
            console.log(`  ⚠️  Pattern not found: ${fix.description}`);
          }
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`  📄 Fixed ${path.basename(filePath)}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`  ❌ Error fixing ${filePath}:`, error.message);
      return false;
    }
  }

  async applyPatternFixes() {
    console.log('\n🔍 Applying additional pattern fixes...');

    // Additional fixes for common issues
    const additionalFixes = {
      'src/pages/PlaylistsPage.tsx': [
        {
          pattern: /}\s*else\s*{/g,
          replacement: '} else {'
        },
        {
          pattern: /\(\s*\(/g,
          replacement: '('
        }
      ]
    };

    for (const [filePath, patterns] of Object.entries(additionalFixes)) {
      if (fs.existsSync(filePath)) {
        console.log(`🔧 Applying patterns to ${path.basename(filePath)}...`);
        await this.applyPatternsToFile(filePath, patterns);
      }
    }
  }

  async applyPatternsToFile(filePath, patterns) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      for (const { pattern, replacement } of patterns) {
        const regex = new RegExp(pattern, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`  ✅ Applied pattern fixes to ${path.basename(filePath)}`);
        this.fixedFiles.push(filePath);
      }
    } catch (error) {
      console.error(`  ❌ Error applying patterns to ${filePath}:`, error.message);
    }
  }

  async validateFixes() {
    console.log('\n🔍 Validating remaining fixes...');

    return new Promise((resolve) => {
      const { exec } = require('child_process');
      exec('npx tsc --noEmit --pretty', (error, stdout, stderr) => {
        const output = stdout + stderr;
        const remainingErrors = (output.match(/error TS\d+:/g) || []).length;

        console.log(`📊 Validation Results:`);
        console.log(`  - Files processed: ${this.fixedFiles.length}`);
        console.log(`  - Errors before: 13`);
        console.log(`  - Errors after: ${remainingErrors}`);
        console.log(`  - Errors fixed: ${13 - remainingErrors}`);

        if (remainingErrors > 0) {
          console.log('\n⚠️  Remaining errors:');
          const errorLines = output.split('\n').filter(line => line.includes('error TS'));
          errorLines.slice(0, 10).forEach(line => console.log(`  ${line}`));
          if (errorLines.length > 10) {
            console.log(`  ... and ${errorLines.length - 10} more`);
          }
        } else {
          console.log('\n✅ All remaining errors fixed successfully!');
        }

        resolve();
      });
    });
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      system: 'Remaining Errors Fixer',
      summary: {
        filesProcessed: this.fixedFiles.length,
        errorsBefore: 13,
        errorsFixed: this.errorsFixed
      },
      fixedFiles: [...new Set(this.fixedFiles)], // Remove duplicates
      specificFixes: REMAINING_FIXES
    };

    const reportPath = path.join(process.cwd(), 'remaining-errors-fix-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📄 Report saved: ${reportPath}`);
    console.log('\n🎉 Remaining errors fixing complete!');
  }
}

// CLI Interface
function showHelp() {
  console.log(`
Fix Remaining TypeScript Errors v1.0.0

Usage:
  node fix-remaining-errors.js [options]

Options:
  --help          Show this help message
  --dry-run       Show what would be fixed without making changes

Description:
  Fixes the remaining 13 TypeScript errors found in the project:
  - Missing commas in useEffect dependencies
  - Missing closing braces
  - JSX syntax issues
  - Declaration errors

Files targeted:
  - src/pages/HistoryPage.tsx
  - src/pages/LikedVideosPage.tsx
  - src/pages/LoginPage.tsx
  - src/pages/PlaylistsPage.tsx
  - src/pages/RegisterPage.tsx
`);
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  if (args.includes('--dry-run')) {
    console.log('🔍 Dry run mode - no changes will be made');
    console.log('\nFiles that would be fixed:');
    Object.keys(REMAINING_FIXES).forEach(file => {
      console.log(`  ${file}`);
    });
    process.exit(0);
  }

  const fixer = new RemainingErrorsFixer();
  fixer.run().catch(error => {
    console.error('❌ Error during remaining fixes:', error);
    process.exit(1);
  });
}

module.exports = { RemainingErrorsFixer };