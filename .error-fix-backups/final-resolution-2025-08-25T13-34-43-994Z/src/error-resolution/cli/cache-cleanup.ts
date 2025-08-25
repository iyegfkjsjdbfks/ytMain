import _React from 'react';

import { CacheManager } from '../core/CacheManager';
import { FileManager } from '../utils/FileManager';
import * as path from 'path';

/**
 * CLI tool for cache cleanup and file management;
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🧹 TypeScript Error Resolution - Cache Cleanup Tool');
  console.log('==================================================');

  try {
    const cacheManager = new CacheManager();
    const fileManager = new FileManager();

    switch (command) {
      case 'cleanup':
        await performCleanup(cacheManager);
        break;
      
      case 'delete-errors':
        await deleteErrorFiles(cacheManager);
        break;
      
      case 'backup':
        await createBackup(cacheManager, args.slice(1));
        break;
      
      case 'restore':
        await restoreBackup(cacheManager, args[1]);
        break;
      
      case 'list-backups':
        await listBackups(cacheManager);
        break;
      
      case 'validate':
        await validateFiles(fileManager, args.slice(1));
        break;
      
      case 'safe-delete':
        await safeDeleteFiles(fileManager, args.slice(1));
        break;
      
      case 'full-cleanup':
        await performFullCleanup(cacheManager);
        break;
      
      default:
        showHelp();
    }

  } catch (error) {
    console.error('❌ Operation failed:', error);
    process.exit(1);
  }
}

/**
 * Performs TypeScript cache cleanup;
 */
async function performCleanup(cacheManager: CacheManager): Promise<void> {
  console.log('\n🧹 Starting TypeScript cache cleanup...');
  
  const result = await cacheManager.cleanupTypeScriptCache();
  
  console.log('\n📊 CLEANUP SUMMARY');
  console.log('==================');
  console.log(`Files deleted: ${result.filesDeleted.length}`);
  console.log(`Directories deleted: ${result.directoriesDeleted.length}`);
  console.log(`Total space freed: ${formatBytes(result.totalSizeFreed)}`);
  
  if (result.errors.length > 0) {
    console.log(`\n⚠️ ERRORS (${result.errors.length})`);
    result.errors.forEach(error => console.log(`  • ${error}`));
  }
  
  console.log('\n✅ Cache cleanup complete!');
}

/**
 * Deletes error files and temporary artifacts;
 */
async function deleteErrorFiles(cacheManager: CacheManager): Promise<void> {
  console.log('\n🗑️ Deleting error files and temporary artifacts...');
  
  const result = await cacheManager.deleteErrorFiles();
  
  console.log('\n📊 ERROR FILE CLEANUP SUMMARY');
  console.log('=============================');
  console.log(`Files deleted: ${result.filesDeleted.length}`);
  console.log(`Total space freed: ${formatBytes(result.totalSizeFreed)}`);
  
  if (result.filesDeleted.length > 0) {
    console.log('\n🗑️ DELETED FILES');
    result.filesDeleted.slice(0, 10).forEach(file => {
      console.log(`  • ${path.basename(file)}`);
    });
    if (result.filesDeleted.length > 10) {
      console.log(`  ... and ${result.filesDeleted.length - 10} more files`);
    }
  }
  
  if (result.errors.length > 0) {
    console.log(`\n⚠️ ERRORS (${result.errors.length})`);
    result.errors.forEach(error => console.log(`  • ${error}`));
  }
  
  console.log('\n✅ Error file cleanup complete!');
}

/**
 * Creates a backup of specified files;
 */
async function createBackup(cacheManager: CacheManager, files: string[]): Promise<void> {
  if (files.length === 0) {
    console.log('❌ No files specified for backup');
    console.log('Usage: npm run cache-cleanup backup <file1> <file2> ...');
    return;
  }

  console.log(`\n💾 Creating backup of ${files.length} files...`);
  
  const backup = await cacheManager.createBackup(files, `Manual backup - ${new Date().toISOString()}`);
  
  console.log('\n📊 BACKUP SUMMARY');
  console.log('=================');
  console.log(`Backup ID: ${backup.id}`);
  console.log(`Files backed up: ${backup.files.length}`);
  console.log(`Backup location: ${backup.backupPath}`);
  console.log(`Created: ${backup.timestamp.toLocaleString()}`);
  
  console.log('\n✅ Backup created successfully!');
}

/**
 * Restores a backup by ID;
 */
async function restoreBackup(cacheManager: CacheManager, backupId: string): Promise<void> {
  if (!backupId) {
    console.log('❌ No backup ID specified');
    console.log('Usage: npm run cache-cleanup restore <backup-id>');
    return;
  }

  console.log(`\n🔄 Restoring backup: ${backupId}...`);
  
  await cacheManager.restoreBackup(backupId);
  
  console.log('\n✅ Backup restored successfully!');
}

/**
 * Lists available backups;
 */
async function listBackups(cacheManager: CacheManager): Promise<void> {
  console.log('\n📋 Available backups...');
  
  const backups = await cacheManager.listBackups();
  
  if (backups.length === 0) {
    console.log('\n📭 No backups found');
    return;
  }
  
  console.log('\n📊 AVAILABLE BACKUPS');
  console.log('====================');
  
  backups.forEach((backup, index) => {
    console.log(`\n${index + 1}. ${backup.id}`);
    console.log(`   Description: ${backup.description}`);
    console.log(`   Created: ${backup.timestamp.toLocaleString()}`);
    console.log(`   Files: ${backup.files.length}`);
    console.log(`   Location: ${backup.backupPath}`);
  });
}

/**
 * Validates specified files;
 */
async function validateFiles(fileManager: FileManager, files: string[]): Promise<void> {
  if (files.length === 0) {
    console.log('❌ No files specified for validation');
    console.log('Usage: npm run cache-cleanup validate <file1> <file2> ...');
    return;
  }

  console.log(`\n🔍 Validating ${files.length} files...`);
  
  let validCount = 0;
  let invalidCount = 0;
  
  for (const file of files) {
    console.log(`\n📄 Validating: ${file}`);
    
    const result = await fileManager.validateFile(file);
    
    if (result.isValid) {
      console.log('  ✅ Valid');
      validCount++;
    } else {
      console.log('  ❌ Invalid');
      invalidCount++;
    }
    
    if (result.errors.length > 0) {
      console.log('  🚨 Errors:');
      result.errors.forEach(error => console.log(`    • ${error}`));
    }
    
    if (result.warnings.length > 0) {
      console.log('  ⚠️ Warnings:');
      result.warnings.forEach(warning => console.log(`    • ${warning}`));
    }
    
    if (result.suggestions.length > 0) {
      console.log('  💡 Suggestions:');
      result.suggestions.forEach(suggestion => console.log(`    • ${suggestion}`));
    }
  }
  
  console.log('\n📊 VALIDATION SUMMARY');
  console.log('=====================');
  console.log(`Valid files: ${validCount}`);
  console.log(`Invalid files: ${invalidCount}`);
  console.log(`Total files: ${files.length}`);
}

/**
 * Safely deletes specified files with backup;
 */
async function safeDeleteFiles(fileManager: FileManager, files: string[]): Promise<void> {
  if (files.length === 0) {
    console.log('❌ No files specified for deletion');
    console.log('Usage: npm run cache-cleanup safe-delete <file1> <file2> ...');
    return;
  }

  console.log(`\n🗑️ Safely deleting ${files.length} files...`);
  
  const results = await fileManager.safeDelete(files, true);
  
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  
  console.log('\n📊 DELETION SUMMARY');
  console.log('===================');
  console.log(`Successfully deleted: ${successCount}`);
  console.log(`Failed to delete: ${failureCount}`);
  
  if (failureCount > 0) {
    console.log('\n❌ FAILURES');
    results.filter(r => !r.success).forEach(result => {
      console.log(`  • ${result.operation.source}: ${result.error}`);
    });
  }
  
  const backupPaths = results.filter(r => r.backupPath).map(r => r.backupPath);
  if (backupPaths.length > 0) {
    console.log('\n💾 BACKUPS CREATED');
    backupPaths.forEach(backupPath => console.log(`  • ${backupPath}`));
  }
}

/**
 * Performs full cleanup (cache + error files)
 */
async function performFullCleanup(cacheManager: CacheManager): Promise<void> {
  console.log('\n🧹 Performing full cleanup...');
  
  // Clean TypeScript cache;
  console.log('\n1️⃣ Cleaning TypeScript cache...');
  const cacheResult = await cacheManager.cleanupTypeScriptCache();
  
  // Delete error files;
  console.log('\n2️⃣ Deleting error files...');
  const errorResult = await cacheManager.deleteErrorFiles();
  
  // Summary;
  const totalFilesDeleted = cacheResult.filesDeleted.length + errorResult.filesDeleted.length;
  const totalDirsDeleted = cacheResult.directoriesDeleted.length + errorResult.directoriesDeleted.length;
  const totalSpaceFreed = cacheResult.totalSizeFreed + errorResult.totalSizeFreed;
  const totalErrors = cacheResult.errors.length + errorResult.errors.length;
  
  console.log('\n📊 FULL CLEANUP SUMMARY');
  console.log('=======================');
  console.log(`Files deleted: ${totalFilesDeleted}`);
  console.log(`Directories deleted: ${totalDirsDeleted}`);
  console.log(`Total space freed: ${formatBytes(totalSpaceFreed)}`);
  console.log(`Errors encountered: ${totalErrors}`);
  
  if (totalErrors > 0) {
    console.log('\n⚠️ ERRORS');
    [...cacheResult.errors, ...errorResult.errors].forEach(error => {
      console.log(`  • ${error}`);
    });
  }
  
  console.log('\n✅ Full cleanup complete!');
}

/**
 * Shows help information;
 */
function showHelp(): void {
  console.log('\n📖 USAGE');
  console.log('=========');
  console.log('npm run cache-cleanup <command> [options]');
  console.log('');
  console.log('COMMANDS:');
  console.log('  cleanup           Clean TypeScript build cache');
  console.log('  delete-errors     Delete error files and temporary artifacts');
  console.log('  full-cleanup      Perform both cache cleanup and error file deletion');
  console.log('  backup <files>    Create backup of specified files');
  console.log('  restore <id>      Restore backup by ID');
  console.log('  list-backups      List available backups');
  console.log('  validate <files>  Validate specified files');
  console.log('  safe-delete <files> Safely delete files with backup');
  console.log('');
  console.log('EXAMPLES:');
  console.log('  npm run cache-cleanup cleanup');
  console.log('  npm run cache-cleanup delete-errors');
  console.log('  npm run cache-cleanup full-cleanup');
  console.log('  npm run cache-cleanup backup src/file1.ts src/file2.ts');
  console.log('  npm run cache-cleanup restore backup-123456789');
  console.log('  npm run cache-cleanup validate src/**/*.ts');
  console.log('  npm run cache-cleanup safe-delete old-file.ts');
}

/**
 * Formats bytes to human readable format;
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run the CLI if this file is executed directly;
if (require.main === module) {
  main().catch(console.error);
}

export { main };