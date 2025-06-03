#!/usr/bin/env node

/**
 * Refactoring Migration Script
 * 
 * This script helps migrate existing components to use the new refactored patterns.
 * It performs automated code transformations and provides migration guidance.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  sourceDir: './components',
  pagesDir: './pages',
  hooksDir: './hooks',
  backupDir: './backup-pre-refactoring',
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
};

// Migration patterns
const MIGRATION_PATTERNS = {
  // Component imports
  componentImports: [
    {
      from: /import\s+{\s*VideoCard\s*}\s+from\s+['"]\.\.?\/.*VideoCard['"];?/g,
      to: "import { ConsolidatedVideoCard as VideoCard } from '../components';"
    },
    {
      from: /import\s+{\s*OptimizedVideoCard\s*}\s+from\s+['"]\.\.?\/.*OptimizedVideoCard['"];?/g,
      to: "import { ConsolidatedVideoCard as OptimizedVideoCard } from '../components';"
    },
    {
      from: /import\s+{\s*AppProviders\s*}\s+from\s+['"]\.\.?\/.*AppProviders['"];?/g,
      to: "import { RefactoredAppProviders as AppProviders } from '../providers/RefactoredAppProviders';"
    }
  ],

  // Hook imports
  hookImports: [
    {
      from: /import\s+{\s*useLocalStorage\s*}\s+from\s+['"]\.\.?\/.*useCommon['"];?/g,
      to: "import { useLocalStorage } from '../hooks/useRefactoredHooks';"
    },
    {
      from: /import\s+{\s*useDebounce\s*}\s+from\s+['"]\.\.?\/.*useCommon['"];?/g,
      to: "import { useDebounce } from '../hooks/useRefactoredHooks';"
    },
    {
      from: /import\s+{\s*useToggle\s*}\s+from\s+['"]\.\.?\/.*useCommon['"];?/g,
      to: "import { useToggle } from '../hooks/useRefactoredHooks';"
    }
  ],

  // Component usage patterns
  componentUsage: [
    {
      from: /<VideoCard\s+video={([^}]+)}\s*\/>/g,
      to: '<ConsolidatedVideoCard video={$1} variant="default" />'
    },
    {
      from: /<OptimizedVideoCard\s+video={([^}]+)}\s+autoplay={true}/g,
      to: '<ConsolidatedVideoCard video={$1} variant="default" autoplay={true} optimized={true}'
    }
  ]
};

// Utility functions
function log(message, level = 'info') {
  if (level === 'verbose' && !CONFIG.verbose) return;
  
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📝',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    verbose: '🔍'
  }[level] || '📝';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function createBackup() {
  if (CONFIG.dryRun) {
    log('DRY RUN: Would create backup directory', 'verbose');
    return;
  }

  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
    log(`Created backup directory: ${CONFIG.backupDir}`, 'success');
  }

  // Copy source files to backup
  const dirsToBackup = [CONFIG.sourceDir, CONFIG.pagesDir, CONFIG.hooksDir];
  
  dirsToBackup.forEach(dir => {
    if (fs.existsSync(dir)) {
      const backupPath = path.join(CONFIG.backupDir, path.basename(dir));
      execSync(`cp -r ${dir} ${backupPath}`);
      log(`Backed up ${dir} to ${backupPath}`, 'verbose');
    }
  });
}

function findFiles(directory, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  if (!fs.existsSync(directory)) {
    log(`Directory not found: ${directory}`, 'warning');
    return [];
  }

  const files = [];
  
  function walkDir(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walkDir(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  }
  
  walkDir(directory);
  return files;
}

function applyMigrationPatterns(content, patterns) {
  let modifiedContent = content;
  let changeCount = 0;
  
  patterns.forEach(pattern => {
    const matches = modifiedContent.match(pattern.from);
    if (matches) {
      modifiedContent = modifiedContent.replace(pattern.from, pattern.to);
      changeCount += matches.length;
      log(`Applied pattern: ${pattern.from} -> ${pattern.to}`, 'verbose');
    }
  });
  
  return { content: modifiedContent, changes: changeCount };
}

function migrateFile(filePath) {
  log(`Processing file: ${filePath}`, 'verbose');
  
  const content = fs.readFileSync(filePath, 'utf8');
  let modifiedContent = content;
  let totalChanges = 0;
  
  // Apply all migration patterns
  Object.values(MIGRATION_PATTERNS).forEach(patterns => {
    const result = applyMigrationPatterns(modifiedContent, patterns);
    modifiedContent = result.content;
    totalChanges += result.changes;
  });
  
  if (totalChanges > 0) {
    if (CONFIG.dryRun) {
      log(`DRY RUN: Would apply ${totalChanges} changes to ${filePath}`, 'info');
    } else {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      log(`Applied ${totalChanges} changes to ${filePath}`, 'success');
    }
  }
  
  return totalChanges;
}

function generateMigrationReport(results) {
  const totalFiles = results.length;
  const modifiedFiles = results.filter(r => r.changes > 0).length;
  const totalChanges = results.reduce((sum, r) => sum + r.changes, 0);
  
  log('\n📊 Migration Report:', 'info');
  log(`Total files processed: ${totalFiles}`, 'info');
  log(`Files modified: ${modifiedFiles}`, 'info');
  log(`Total changes applied: ${totalChanges}`, 'info');
  
  if (CONFIG.dryRun) {
    log('\n⚠️  This was a DRY RUN. No files were actually modified.', 'warning');
    log('Run without --dry-run to apply changes.', 'info');
  }
  
  // Generate detailed report
  const reportPath = './migration-report.json';
  const report = {
    timestamp: new Date().toISOString(),
    dryRun: CONFIG.dryRun,
    summary: {
      totalFiles,
      modifiedFiles,
      totalChanges
    },
    files: results.filter(r => r.changes > 0)
  };
  
  if (!CONFIG.dryRun) {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log(`Detailed report saved to: ${reportPath}`, 'success');
  }
}

function validateEnvironment() {
  // Check if we're in the right directory
  if (!fs.existsSync('./package.json')) {
    log('Error: package.json not found. Please run this script from the project root.', 'error');
    process.exit(1);
  }
  
  // Check if required directories exist
  const requiredDirs = [CONFIG.sourceDir];
  const missingDirs = requiredDirs.filter(dir => !fs.existsSync(dir));
  
  if (missingDirs.length > 0) {
    log(`Error: Required directories not found: ${missingDirs.join(', ')}`, 'error');
    process.exit(1);
  }
  
  log('Environment validation passed', 'success');
}

function main() {
  log('🚀 Starting Refactoring Migration Script', 'info');
  
  if (CONFIG.dryRun) {
    log('Running in DRY RUN mode - no files will be modified', 'warning');
  }
  
  // Validate environment
  validateEnvironment();
  
  // Create backup
  createBackup();
  
  // Find all files to migrate
  const allFiles = [
    ...findFiles(CONFIG.sourceDir),
    ...findFiles(CONFIG.pagesDir),
    ...findFiles(CONFIG.hooksDir)
  ];
  
  log(`Found ${allFiles.length} files to process`, 'info');
  
  // Process each file
  const results = allFiles.map(filePath => ({
    file: filePath,
    changes: migrateFile(filePath)
  }));
  
  // Generate report
  generateMigrationReport(results);
  
  log('🎉 Migration script completed', 'success');
  
  if (!CONFIG.dryRun && results.some(r => r.changes > 0)) {
    log('\n📋 Next Steps:', 'info');
    log('1. Review the changes made to your files', 'info');
    log('2. Run your tests to ensure everything works correctly', 'info');
    log('3. Update any remaining manual imports as needed', 'info');
    log('4. Consider running the linter to fix any formatting issues', 'info');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  migrateFile,
  applyMigrationPatterns,
  MIGRATION_PATTERNS
};
