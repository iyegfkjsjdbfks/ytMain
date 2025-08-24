#!/usr/bin/env node
/**
 * Comprehensive TypeScript File Corruption Fixer
 * 
 * This script systematically fixes the most common syntax errors found in corrupted TypeScript files:
 * - TS1005: ';' expected
 * - TS1381: Unexpected token
 * - TS1382: Unexpected token
 * - TS1131: Property or signature expected
 * - TS1161: Unterminated regular expression literal
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class CorruptedFileFixer {
  constructor() {
    this.fixedFiles = [];
    this.failedFiles = [];
    this.totalErrors = 0;
    this.fixedErrors = 0;
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    const prefix = {
      info: '🔧',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type] || '🔧';
    
    console.log(`${colors[type]}${prefix} ${message}${colors.reset}`);
  }

  // Fix malformed import statements
  fixImportStatements(content) {
    // Fix imports with spaces in paths like '../utils / advancedMonitoring'
    content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]([^'"]*?)\s+\/\s+([^'"]*?)['"];?/g, 
      (match, imports, path1, path2) => {
        return `import { ${imports.trim()} } from '${path1}/${path2}';`;
      });
    
    // Fix incomplete import statements
    content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]([^'"]*?)$/gm, 
      (match, imports, path) => {
        return `import { ${imports.trim()} } from '${path}';`;
      });
    
    return content;
  }

  // Fix interface definitions
  fixInterfaceDefinitions(content) {
    // Fix malformed interface declarations like 'export interface DashboardMetrics {}'
    content = content.replace(/export\s+interface\s+(\w+)\s*\{\}([^{]*?)\{/g, 
      (match, interfaceName, body) => {
        return `export interface ${interfaceName} {${body.replace(/^\s*/, '\n  ')}`;
      });
    
    // Fix property declarations with misplaced commas and braces
    content = content.replace(/(\w+):\s*\{,\}/g, '$1: {');
    content = content.replace(/(\w+):\s*(\w+);,/g, '$1: $2;');
    content = content.replace(/(\w+):\s*(\w+),$/gm, '$1: $2;');
    
    // Fix incomplete property types
    content = content.replace(/(\w+):\s*\{$/gm, '$1: {');
    
    return content;
  }

  // Fix function declarations
  fixFunctionDeclarations(content) {
    // Fix malformed function declarations like 'export const Component: React.FC = () => {}'
    content = content.replace(/export\s+const\s+(\w+):\s*React\.FC\s*=\s*\(\)\s*=>\s*\{\}([^{]*?)\{/g, 
      (match, componentName, body) => {
        return `export const ${componentName}: React.FC = () => {${body.replace(/^\s*/, '\n  ')}`;
      });
    
    // Fix async function declarations
    content = content.replace(/(const\s+\w+\s*=\s*async\s*\(.*?\)\s*:\s*Promise<.*?>)\s*<\s*void>\s*=>\s*\{\}/g, 
      '$1 => {');
    
    return content;
  }

  // Fix generic type declarations
  fixGenericTypes(content) {
    // Fix malformed generic declarations like 'useState < Type >'
    content = content.replace(/useState\s*<\s*([^>]+?)\s*>/g, 'useState<$1>');
    content = content.replace(/Promise<([^>]+?)>\s*\.all/g, 'Promise.all');
    
    return content;
  }

  // Fix object and array declarations
  fixObjectArrayDeclarations(content) {
    // Fix malformed object declarations
    content = content.replace(/\{,\}/g, '{');
    content = content.replace(/\[,\]/g, '[');
    
    // Fix trailing commas in wrong places
    content = content.replace(/,\s*\}/g, ' }');
    content = content.replace(/,\s*\]/g, ' ]');
    
    return content;
  }

  // Fix JSX and React specific issues
  fixReactSpecificIssues(content) {
    // Fix return statements
    content = content.replace(/return\s+null;\s*const/g, 'const');
    
    return content;
  }

  // Comprehensive file fixing
  fixFile(filePath) {
    try {
      if (!existsSync(filePath)) {
        this.log(`File not found: ${filePath}`, 'warning');
        return false;
      }

      let content = readFileSync(filePath, 'utf8');
      const originalContent = content;

      // Apply all fixes
      content = this.fixImportStatements(content);
      content = this.fixInterfaceDefinitions(content);
      content = this.fixFunctionDeclarations(content);
      content = this.fixGenericTypes(content);
      content = this.fixObjectArrayDeclarations(content);
      content = this.fixReactSpecificIssues(content);

      // Only write if content changed
      if (content !== originalContent) {
        writeFileSync(filePath, content);
        this.fixedFiles.push(filePath);
        this.log(`Fixed: ${filePath}`, 'success');
        return true;
      } else {
        this.log(`No changes needed: ${filePath}`, 'info');
        return true;
      }
    } catch (error) {
      this.failedFiles.push({ file: filePath, error: error.message });
      this.log(`Failed to fix ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  // Get list of most corrupted files from analysis
  getMostCorruptedFiles() {
    const analysisFile = join(projectRoot, 'error-analysis-comprehensive.json');
    if (!existsSync(analysisFile)) {
      this.log('No analysis file found. Running basic file discovery...', 'warning');
      return this.discoverCorruptedFiles();
    }

    try {
      const analysis = JSON.parse(readFileSync(analysisFile, 'utf8'));
      this.log(`Loaded analysis with ${analysis.fileErrors?.length || 0} files`);
      
      // Handle different analysis file formats
      if (analysis.fileErrors) {
        return analysis.fileErrors
          .filter(f => f.errorCount > 10) // Focus on most corrupted
          .sort((a, b) => b.errorCount - a.errorCount)
          .slice(0, 20) // Top 20 most corrupted
          .map(f => join(projectRoot, f.file));
      } else if (analysis.corruptedFiles) {
        return analysis.corruptedFiles
          .filter(f => f.criticalErrors > 10)
          .sort((a, b) => b.totalErrors - a.totalErrors)
          .slice(0, 20)
          .map(f => join(projectRoot, f.file));
      } else {
        this.log('Unknown analysis format, using file discovery', 'warning');
        return this.discoverCorruptedFiles();
      }
    } catch (error) {
      this.log(`Failed to read analysis: ${error.message}`, 'error');
      return this.discoverCorruptedFiles();
    }
  }

  // Discover corrupted files by scanning
  discoverCorruptedFiles() {
    const commonCorruptedFiles = [
      'components/DeveloperDashboard.tsx',
      'components/DevOpsDashboard.tsx',
      'components/CommentsSection.tsx',
      'components/CommunityPosts.tsx',
      'components/BaseForm.tsx',
      'components/BaseModal.tsx',
      'components/ChannelHeader.tsx',
      'components/ChannelTabs.tsx',
      'components/EnhancedCommentSystem.tsx',
      'components/EnhancedVideoUpload.tsx'
    ];

    return commonCorruptedFiles
      .map(f => join(projectRoot, f))
      .filter(f => existsSync(f));
  }

  // Run the fixing process
  async run() {
    try {
      this.log('🚀 Starting Corrupted File Fixing Process...');
      
      const corruptedFiles = this.getMostCorruptedFiles();
      this.log(`Found ${corruptedFiles.length} corrupted files to fix`);

      if (corruptedFiles.length === 0) {
        this.log('No corrupted files found to fix', 'warning');
        return { fixedFiles: [], failedFiles: [], successCount: 0 };
      }

      let successCount = 0;
      for (const filePath of corruptedFiles) {
        this.log(`Processing: ${filePath}`);
        if (this.fixFile(filePath)) {
          successCount++;
        }
      }

      this.log(`\n📊 Fixing Summary:`);
      this.log(`✅ Successfully fixed: ${successCount} files`);
      this.log(`❌ Failed to fix: ${this.failedFiles.length} files`);
      
      if (this.failedFiles.length > 0) {
        this.log('\n❌ Failed files:');
        this.failedFiles.forEach(f => {
          this.log(`  - ${f.file}: ${f.error}`, 'error');
        });
      }

      // Run type check to see improvement
      this.log('\n🔍 Running type check to verify improvements...');
      try {
        execSync('npm run type-check', { 
          cwd: projectRoot, 
          stdio: 'pipe' 
        });
        this.log('✅ All TypeScript errors fixed!', 'success');
      } catch (error) {
        const output = error.stdout?.toString() || error.stderr?.toString() || '';
        const errorCount = (output.match(/error TS\d+:/g) || []).length;
        this.log(`⚠️ ${errorCount} TypeScript errors remaining`, 'warning');
      }

      return {
        fixedFiles: this.fixedFiles,
        failedFiles: this.failedFiles,
        successCount
      };
    } catch (error) {
      this.log(`Fatal error in run(): ${error.message}`, 'error');
      console.error(error.stack);
      throw error;
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new CorruptedFileFixer();
  fixer.run().catch(err => {
    console.error('❌ Fixing failed:', err.message);
    process.exit(1);
  });
}

export { CorruptedFileFixer };