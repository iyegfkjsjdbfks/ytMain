import { EventEmitter } from 'events';
import { Logger } from '../utils/Logger';
import { ScriptCommand } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import * as crypto from 'crypto';

export interface Checkpoint {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  files: CheckpointFile[];
  gitCommit?: string;
  metadata: Record<string, any>;
}

export interface CheckpointFile {
  path: string;
  hash: string;
  size: number;
  backupPath: string;
  lastModified: Date;
}

export interface RollbackOperation {
  id: string;
  checkpointId: string;
  reason: string;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  filesRestored: string[];
  errors: Error[];
}

export interface RecoveryPoint {
  checkpoint: Checkpoint;
  isGitBased: boolean;
  canRestore: boolean;
  integrityCheck: boolean;
}

export class RollbackManager extends EventEmitter {
  private logger: Logger;
  private checkpoints: Map<string, Checkpoint> = new Map();
  private backupDirectory: string;
  private maxCheckpoints: number;
  private gitEnabled: boolean;
  private currentOperation: RollbackOperation | null = null;

  constructor(
    backupDirectory: string = '.error-resolution-backups',
    maxCheckpoints: number = 10,
    gitEnabled: boolean = true,
    logger?: Logger
  ) {
    super();
    this.logger = logger || new Logger();
    this.backupDirectory = path.resolve(backupDirectory);
    this.maxCheckpoints = maxCheckpoints;
    this.gitEnabled = gitEnabled;
    
    this.initializeBackupDirectory();
  }

  /**
   * Creates a new checkpoint
   */
  public async createCheckpoint(
    name: string,
    files: string[],
    description?: string,
    metadata?: Record<string, any>
  ): Promise<Checkpoint> {
    const checkpointId = `checkpoint-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    
    this.logger.info('CHECKPOINT', `Creating checkpoint: ${name} (${files.length} files)`);
    
    try {
      const checkpointDir = path.join(this.backupDirectory, checkpointId);
      await fs.promises.mkdir(checkpointDir, { recursive: true });
      
      const checkpointFiles: CheckpointFile[] = [];
      
      // Backup files
      for (const filePath of files) {
        try {
          const fileStats = await fs.promises.stat(filePath);
          const fileContent = await fs.promises.readFile(filePath);
          const fileHash = crypto.createHash('sha256').update(fileContent).digest('hex');
          
          const relativePath = path.relative(process.cwd(), filePath);
          const backupPath = path.join(checkpointDir, relativePath);
          
          // Ensure backup directory exists
          await fs.promises.mkdir(path.dirname(backupPath), { recursive: true });
          
          // Copy file to backup location
          await fs.promises.copyFile(filePath, backupPath);
          
          checkpointFiles.push({
            path: filePath,
            hash: fileHash,
            size: fileStats.size,
            backupPath,
            lastModified: fileStats.mtime
          });
          
        } catch (error) {
          this.logger.warn('CHECKPOINT', `Failed to backup file ${filePath}: ${error}`);
        }
      }
      
      // Create Git commit if enabled
      let gitCommit: string | undefined;
      if (this.gitEnabled) {
        try {
          gitCommit = await this.createGitCommit(`Checkpoint: ${name}`);
        } catch (error) {
          this.logger.warn('CHECKPOINT', `Failed to create Git commit: ${error}`);
        }
      }
      
      const checkpoint: Checkpoint = {
        id: checkpointId,
        name,
        description: description || `Checkpoint created at ${new Date().toISOString()}`,
        createdAt: new Date(),
        files: checkpointFiles,
        gitCommit,
        metadata: metadata || {}
      };
      
      // Save checkpoint metadata
      const metadataPath = path.join(checkpointDir, 'checkpoint.json');
      await fs.promises.writeFile(metadataPath, JSON.stringify(checkpoint, null, 2));
      
      this.checkpoints.set(checkpointId, checkpoint);
      
      // Cleanup old checkpoints
      await this.cleanupOldCheckpoints();
      
      this.logger.info('CHECKPOINT', `Created checkpoint: ${checkpointId} with ${checkpointFiles.length} files`);
      this.emit('checkpointCreated', checkpoint);
      
      return checkpoint;
      
    } catch (error) {
      this.logger.error('CHECKPOINT', `Failed to create checkpoint: ${error}`, error as Error);
      throw error;
    }
  }

  /**
   * Performs rollback to a specific checkpoint
   */
  public async rollbackToCheckpoint(
    checkpointId: string,
    reason: string,
    options: {
      verifyIntegrity?: boolean;
      createBackupBeforeRollback?: boolean;
      useGitIfAvailable?: boolean;
    } = {}
  ): Promise<RollbackOperation> {
    const checkpoint = this.checkpoints.get(checkpointId);
    if (!checkpoint) {
      throw new Error(`Checkpoint not found: ${checkpointId}`);
    }
    
    const operationId = `rollback-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    
    const operation: RollbackOperation = {
      id: operationId,
      checkpointId,
      reason,
      startTime: new Date(),
      status: 'pending',
      filesRestored: [],
      errors: []
    };
    
    this.currentOperation = operation;
    
    this.logger.info('ROLLBACK', `Starting rollback to checkpoint: ${checkpoint.name} (${checkpoint.id})`);
    
    try {
      operation.status = 'running';
      
      // Create backup before rollback if requested
      if (options.createBackupBeforeRollback) {
        const preRollbackFiles = checkpoint.files.map(f => f.path);
        await this.createCheckpoint(
          `Pre-rollback backup for ${checkpoint.name}`,
          preRollbackFiles,
          `Automatic backup before rolling back to ${checkpoint.name}`
        );
      }
      
      // Verify checkpoint integrity if requested
      if (options.verifyIntegrity) {
        const integrityCheck = await this.verifyCheckpointIntegrity(checkpoint);
        if (!integrityCheck.isValid) {
          throw new Error(`Checkpoint integrity check failed: ${integrityCheck.errors.join(', ')}`);
        }
      }
      
      // Attempt Git-based rollback first if available and requested
      if (options.useGitIfAvailable && checkpoint.gitCommit) {
        try {
          await this.performGitRollback(checkpoint.gitCommit);
          operation.filesRestored = checkpoint.files.map(f => f.path);
          
        } catch (error) {
          this.logger.warn('ROLLBACK', `Git rollback failed, falling back to file-based rollback: ${error}`);
          await this.performFileBasedRollback(checkpoint, operation);
        }
      } else {
        await this.performFileBasedRollback(checkpoint, operation);
      }
      
      operation.status = 'completed';
      operation.endTime = new Date();
      
      this.logger.info('ROLLBACK', `Rollback completed: ${operation.filesRestored.length} files restored`);
      this.emit('rollbackCompleted', operation);
      
    } catch (error) {
      operation.status = 'failed';
      operation.endTime = new Date();
      operation.errors.push(error as Error);
      
      this.logger.error('ROLLBACK', `Rollback failed: ${error}`, error as Error);
      this.emit('rollbackFailed', operation);
      
      throw error;
    } finally {
      this.currentOperation = null;
    }
    
    return operation;
  }

  /**
   * Performs file-based rollback
   */
  private async performFileBasedRollback(
    checkpoint: Checkpoint,
    operation: RollbackOperation
  ): Promise<void> {
    for (const file of checkpoint.files) {
      try {
        // Verify backup file exists
        if (!await this.fileExists(file.backupPath)) {
          throw new Error(`Backup file not found: ${file.backupPath}`);
        }
        
        // Restore file
        await fs.promises.copyFile(file.backupPath, file.path);
        operation.filesRestored.push(file.path);
        
        this.logger.debug('ROLLBACK', `Restored file: ${file.path}`);
        
      } catch (error) {
        const errorMsg = `Failed to restore file ${file.path}: ${error}`;
        operation.errors.push(new Error(errorMsg));
        this.logger.error('ROLLBACK', errorMsg, error as Error);
      }
    }
  }

  /**
   * Performs Git-based rollback
   */
  private async performGitRollback(commitHash: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn('git', ['reset', '--hard', commitHash], {
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      let stderr = '';
      
      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Git rollback failed: ${stderr}`));
        }
      });
      
      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Creates a Git commit
   */
  private async createGitCommit(message: string): Promise<string> {
    // Add all changes
    await this.runGitCommand(['add', '.']);
    
    // Create commit
    await this.runGitCommand(['commit', '-m', message]);
    
    // Get commit hash
    const commitHash = await this.runGitCommand(['rev-parse', 'HEAD']);
    return commitHash.trim();
  }

  /**
   * Runs a Git command
   */
  private async runGitCommand(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn('git', args, {
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      let stdout = '';
      let stderr = '';
      
      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Git command failed: ${stderr || stdout}`));
        }
      });
      
      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Verifies checkpoint integrity
   */
  public async verifyCheckpointIntegrity(checkpoint: Checkpoint): Promise<{
    isValid: boolean;
    errors: string[];
    details: Record<string, any>;
  }> {
    const errors: string[] = [];
    const details: Record<string, any> = {};
    
    this.logger.debug('INTEGRITY', `Verifying checkpoint integrity: ${checkpoint.id}`);
    
    for (const file of checkpoint.files) {
      try {
        // Check if backup file exists
        if (!await this.fileExists(file.backupPath)) {
          errors.push(`Backup file missing: ${file.backupPath}`);
          continue;
        }
        
        // Verify file hash
        const backupContent = await fs.promises.readFile(file.backupPath);
        const currentHash = crypto.createHash('sha256').update(backupContent).digest('hex');
        
        if (currentHash !== file.hash) {
          errors.push(`Hash mismatch for ${file.path}: expected ${file.hash}, got ${currentHash}`);
        }
        
        // Verify file size
        const backupStats = await fs.promises.stat(file.backupPath);
        if (backupStats.size !== file.size) {
          errors.push(`Size mismatch for ${file.path}: expected ${file.size}, got ${backupStats.size}`);
        }
        
        details[file.path] = {
          hashValid: currentHash === file.hash,
          sizeValid: backupStats.size === file.size,
          exists: true
        };
        
      } catch (error) {
        errors.push(`Error verifying ${file.path}: ${error}`);
        details[file.path] = {
          error: (error as Error).message,
          exists: false
        };
      }
    }
    
    const isValid = errors.length === 0;
    
    this.logger.debug('INTEGRITY', `Integrity check completed: ${isValid ? 'VALID' : 'INVALID'} (${errors.length} errors)`);
    
    return { isValid, errors, details };
  }

  /**
   * Lists all available checkpoints
   */
  public getCheckpoints(): Checkpoint[] {
    return Array.from(this.checkpoints.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Gets recovery points with status information
   */
  public async getRecoveryPoints(): Promise<RecoveryPoint[]> {
    const checkpoints = this.getCheckpoints();
    const recoveryPoints: RecoveryPoint[] = [];
    
    for (const checkpoint of checkpoints) {
      const integrityResult = await this.verifyCheckpointIntegrity(checkpoint);
      
      recoveryPoints.push({
        checkpoint,
        isGitBased: !!checkpoint.gitCommit,
        canRestore: integrityResult.isValid,
        integrityCheck: integrityResult.isValid
      });
    }
    
    return recoveryPoints;
  }

  /**
   * Deletes a checkpoint
   */
  public async deleteCheckpoint(checkpointId: string): Promise<void> {
    const checkpoint = this.checkpoints.get(checkpointId);
    if (!checkpoint) {
      throw new Error(`Checkpoint not found: ${checkpointId}`);
    }
    
    this.logger.info('CHECKPOINT', `Deleting checkpoint: ${checkpoint.name} (${checkpointId})`);
    
    try {
      // Delete backup directory
      const checkpointDir = path.join(this.backupDirectory, checkpointId);
      if (await this.fileExists(checkpointDir)) {
        await fs.promises.rm(checkpointDir, { recursive: true, force: true });
      }
      
      // Remove from memory
      this.checkpoints.delete(checkpointId);
      
      this.logger.info('CHECKPOINT', `Deleted checkpoint: ${checkpointId}`);
      this.emit('checkpointDeleted', checkpointId);
      
    } catch (error) {
      this.logger.error('CHECKPOINT', `Failed to delete checkpoint ${checkpointId}: ${error}`, error as Error);
      throw error;
    }
  }

  /**
   * Creates rollback commands for a set of script commands
   */
  public createRollbackCommands(
    originalCommands: ScriptCommand[],
    originalFileContents: Map<string, string>
  ): ScriptCommand[] {
    const rollbackCommands: ScriptCommand[] = [];
    
    // Process commands in reverse order
    for (let i = originalCommands.length - 1; i >= 0; i--) {
      const command = originalCommands[i];
      const originalContent = originalFileContents.get(command.file);
      
      if (originalContent !== undefined) {
        rollbackCommands.push({
          type: 'replace',
          file: command.file,
          pattern: /.*/s, // Match entire file
          replacement: originalContent,
          description: `Rollback: ${command.description}`
        });
      }
    }
    
    return rollbackCommands;
  }

  /**
   * Gets current operation status
   */
  public getCurrentOperation(): RollbackOperation | null {
    return this.currentOperation;
  }

  /**
   * Initializes backup directory
   */
  private async initializeBackupDirectory(): Promise<void> {
    try {
      await fs.promises.mkdir(this.backupDirectory, { recursive: true });
      
      // Load existing checkpoints
      await this.loadExistingCheckpoints();
      
    } catch (error) {
      this.logger.error('INIT', `Failed to initialize backup directory: ${error}`, error as Error);
      throw error;
    }
  }

  /**
   * Loads existing checkpoints from disk
   */
  private async loadExistingCheckpoints(): Promise<void> {
    try {
      const entries = await fs.promises.readdir(this.backupDirectory, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith('checkpoint-')) {
          try {
            const metadataPath = path.join(this.backupDirectory, entry.name, 'checkpoint.json');
            const metadataContent = await fs.promises.readFile(metadataPath, 'utf8');
            const checkpoint: Checkpoint = JSON.parse(metadataContent);
            
            // Convert date strings back to Date objects
            checkpoint.createdAt = new Date(checkpoint.createdAt);
            checkpoint.files.forEach(file => {
              file.lastModified = new Date(file.lastModified);
            });
            
            this.checkpoints.set(checkpoint.id, checkpoint);
            
          } catch (error) {
            this.logger.warn('INIT', `Failed to load checkpoint ${entry.name}: ${error}`);
          }
        }
      }
      
      this.logger.info('INIT', `Loaded ${this.checkpoints.size} existing checkpoints`);
      
    } catch (error) {
      this.logger.warn('INIT', `Failed to load existing checkpoints: ${error}`);
    }
  }

  /**
   * Cleans up old checkpoints
   */
  private async cleanupOldCheckpoints(): Promise<void> {
    const checkpoints = this.getCheckpoints();
    
    if (checkpoints.length > this.maxCheckpoints) {
      const toDelete = checkpoints.slice(this.maxCheckpoints);
      
      for (const checkpoint of toDelete) {
        try {
          await this.deleteCheckpoint(checkpoint.id);
        } catch (error) {
          this.logger.warn('CLEANUP', `Failed to delete old checkpoint ${checkpoint.id}: ${error}`);
        }
      }
    }
  }

  /**
   * Checks if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets statistics about checkpoints and rollbacks
   */
  public getStatistics(): {
    totalCheckpoints: number;
    totalBackupSize: number;
    oldestCheckpoint?: Date;
    newestCheckpoint?: Date;
    gitEnabled: boolean;
  } {
    const checkpoints = this.getCheckpoints();
    
    const totalBackupSize = checkpoints.reduce((sum, checkpoint) => {
      return sum + checkpoint.files.reduce((fileSum, file) => fileSum + file.size, 0);
    }, 0);
    
    return {
      totalCheckpoints: checkpoints.length,
      totalBackupSize,
      oldestCheckpoint: checkpoints.length > 0 ? checkpoints[checkpoints.length - 1].createdAt : undefined,
      newestCheckpoint: checkpoints.length > 0 ? checkpoints[0].createdAt : undefined,
      gitEnabled: this.gitEnabled
    };
  }
}