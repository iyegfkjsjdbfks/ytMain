import React from 'react';
import * as fs from 'fs';
import * as path from 'path';

export interface FileOperation {
  type: 'create' | 'update' | 'delete' | 'move' | 'copy';
  source: string;
  target?: string;
  content?: string;
  backup?: boolean;
}

export interface FileOperationResult {
  success: boolean;
  operation: FileOperation;
  error?: string;
  backupPath?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export class FileManager {
  private operationHistory: FileOperationResult[] = [];

  /**
   * Performs a batch of file operations safely with rollback capability
   */
  public async performOperations(operations: FileOperation[]): Promise<FileOperationResult[]> {
    console.log(`📁 Performing ${operations.length} file operations...`);
    
    const results: FileOperationResult[] = [];
    const rollbackOperations: FileOperation[] = [];

    try {
      for (const operation of operations) {
        const result = await this.performSingleOperation(operation);
        results.push(result);
        this.operationHistory.push(result);

        if (!result.success) {
          console.error(`❌ Operation failed: ${operation.type} ${operation.source}`);
          
          // Rollback previous operations
          await this.rollbackOperations(rollbackOperations);
          break;
        }

        // Track rollback operation
        const rollbackOp = this.createRollbackOperation(operation, result);
        if (rollbackOp) {
          rollbackOperations.unshift(rollbackOp); // Add to beginning for reverse order
        }
      }

      const successCount = results.filter(r => r.success).length;
      console.log(`✅ File operations complete: ${successCount}/${operations.length} successful`);

    } catch (error) {
      console.error(`❌ Batch operation failed: ${error}`);
      await this.rollbackOperations(rollbackOperations);
    }

    return results;
  }

  /**
   * Validates file syntax and structure
   */
  public async validateFile(filePath: string): Promise<FileValidationResult> {
    const result: FileValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    try {
      // Check if file exists
      if (!await this.fileExists(filePath)) {
        result.isValid = false;
        result.errors.push(`File does not exist: ${filePath}`);
        return result;
      }

      // Read file content
      const content = await fs.promises.readFile(filePath, 'utf8');
      const ext = path.extname(filePath).toLowerCase();

      // Perform validation based on file type
      switch (ext) {
        case '.ts':
        case '.tsx':
          await this.validateTypeScriptFile(content, result);
          break;
        case '.js':
        case '.jsx':
          await this.validateJavaScriptFile(content, result);
          break;
        case '.json':
          await this.validateJsonFile(content, result);
          break;
        default:
          result.warnings.push(`No specific validation available for ${ext} files`);
      }

      // General file validation
      await this.validateGeneralFile(content, filePath, result);

    } catch (error) {
      result.isValid = false;
      result.errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Safely deletes files with backup option
   */
  public async safeDelete(filePaths: string[], createBackup = true): Promise<FileOperationResult[]> {
    console.log(`🗑️ Safely deleting ${filePaths.length} files...`);
    
    const operations: FileOperation[] = filePaths.map(filePath => ({
      type: 'delete',
      source: filePath,
      backup: createBackup
    }));

    return await this.performOperations(operations);
  }

  /**
   * Creates a safe copy of files with validation
   */
  public async safeCopy(sourceFiles: string[], targetDir: string): Promise<FileOperationResult[]> {
    console.log(`📋 Copying ${sourceFiles.length} files to ${targetDir}...`);
    
    // Ensure target directory exists
    await fs.promises.mkdir(targetDir, { recursive: true });

    const operations: FileOperation[] = sourceFiles.map(source => ({
      type: 'copy',
      source,
      target: path.join(targetDir, path.basename(source))
    }));

    return await this.performOperations(operations);
  }

  /**
   * Moves files safely with validation
   */
  public async safeMove(fileMoves: Array<{ source: string; target: string }>): Promise<FileOperationResult[]> {
    console.log(`📦 Moving ${fileMoves.length} files...`);
    
    const operations: FileOperation[] = fileMoves.map(({ source, target }) => ({
      type: 'move',
      source,
      target,
      backup: true
    }));

    return await this.performOperations(operations);
  }

  /**
   * Gets operation history for debugging
   */
  public getOperationHistory(): FileOperationResult[] {
    return [...this.operationHistory];
  }

  /**
   * Clears operation history
   */
  public clearHistory(): void {
    this.operationHistory = [];
  }

  /**
   * Performs a single file operation
   */
  private async performSingleOperation(operation: FileOperation): Promise<FileOperationResult> {
    const result: FileOperationResult = {
      success: false,
      operation
    };

    try {
      switch (operation.type) {
        case 'create':
          await this.createFile(operation, result);
          break;
        case 'update':
          await this.updateFile(operation, result);
          break;
        case 'delete':
          await this.deleteFile(operation, result);
          break;
        case 'move':
          await this.moveFile(operation, result);
          break;
        case 'copy':
          await this.copyFile(operation, result);
          break;
        default:
          throw new Error(`Unknown operation type: ${(operation as any).type}`);
      }

      result.success = true;

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  /**
   * Creates a new file
   */
  private async createFile(operation: FileOperation, result: FileOperationResult): Promise<void> {
    if (!operation.content) {
      throw new Error('Content is required for create operation');
    }

    if (await this.fileExists(operation.source)) {
      throw new Error(`File already exists: ${operation.source}`);
    }

    // Ensure directory exists
    await fs.promises.mkdir(path.dirname(operation.source), { recursive: true });
    
    // Create file
    await fs.promises.writeFile(operation.source, operation.content, 'utf8');
    console.log(`📄 Created: ${operation.source}`);
  }

  /**
   * Updates an existing file
   */
  private async updateFile(operation: FileOperation, result: FileOperationResult): Promise<void> {
    if (!operation.content) {
      throw new Error('Content is required for update operation');
    }

    if (!await this.fileExists(operation.source)) {
      throw new Error(`File does not exist: ${operation.source}`);
    }

    // Create backup if requested
    if (operation.backup) {
      const backupPath = `${operation.source}.backup.${Date.now()}`;
      await fs.promises.copyFile(operation.source, backupPath);
      result.backupPath = backupPath;
    }

    // Update file
    await fs.promises.writeFile(operation.source, operation.content, 'utf8');
    console.log(`✏️ Updated: ${operation.source}`);
  }

  /**
   * Deletes a file
   */
  private async deleteFile(operation: FileOperation, result: FileOperationResult): Promise<void> {
    if (!await this.fileExists(operation.source)) {
      throw new Error(`File does not exist: ${operation.source}`);
    }

    // Create backup if requested
    if (operation.backup) {
      const backupPath = `${operation.source}.deleted.${Date.now()}`;
      await fs.promises.copyFile(operation.source, backupPath);
      result.backupPath = backupPath;
    }

    // Delete file
    await fs.promises.unlink(operation.source);
    console.log(`🗑️ Deleted: ${operation.source}`);
  }

  /**
   * Moves a file
   */
  private async moveFile(operation: FileOperation, result: FileOperationResult): Promise<void> {
    if (!operation.target) {
      throw new Error('Target is required for move operation');
    }

    if (!await this.fileExists(operation.source)) {
      throw new Error(`Source file does not exist: ${operation.source}`);
    }

    // Ensure target directory exists
    await fs.promises.mkdir(path.dirname(operation.target), { recursive: true });

    // Create backup if requested
    if (operation.backup) {
      const backupPath = `${operation.source}.moved.${Date.now()}`;
      await fs.promises.copyFile(operation.source, backupPath);
      result.backupPath = backupPath;
    }

    // Move file
    await fs.promises.rename(operation.source, operation.target);
    console.log(`📦 Moved: ${operation.source} → ${operation.target}`);
  }

  /**
   * Copies a file
   */
  private async copyFile(operation: FileOperation, result: FileOperationResult): Promise<void> {
    if (!operation.target) {
      throw new Error('Target is required for copy operation');
    }

    if (!await this.fileExists(operation.source)) {
      throw new Error(`Source file does not exist: ${operation.source}`);
    }

    // Ensure target directory exists
    await fs.promises.mkdir(path.dirname(operation.target), { recursive: true });

    // Copy file
    await fs.promises.copyFile(operation.source, operation.target);
    console.log(`📋 Copied: ${operation.source} → ${operation.target}`);
  }

  /**
   * Creates a rollback operation for the given operation
   */
  private createRollbackOperation(operation: FileOperation, result: FileOperationResult): FileOperation | null {
    switch (operation.type) {
      case 'create':
        return { type: 'delete', source: operation.source };
      
      case 'delete':
        if (result.backupPath) {
          return { type: 'move', source: result.backupPath, target: operation.source };
        }
        break;
      
      case 'move':
        if (operation.target) {
          return { type: 'move', source: operation.target, target: operation.source };
        }
        break;
      
      case 'update':
        if (result.backupPath) {
          return { type: 'move', source: result.backupPath, target: operation.source };
        }
        break;
    }

    return null;
  }

  /**
   * Rolls back a list of operations
   */
  private async rollbackOperations(operations: FileOperation[]): Promise<void> {
    if (operations.length === 0) return;

    console.log(`🔄 Rolling back ${operations.length} operations...`);

    for (const operation of operations) {
      try {
        await this.performSingleOperation(operation);
      } catch (error) {
        console.error(`❌ Rollback failed for operation: ${operation.type} ${operation.source}`);
      }
    }
  }

  /**
   * Validates TypeScript files
   */
  private async validateTypeScriptFile(content: string, result: FileValidationResult): Promise<void> {
    // Check for common TypeScript syntax issues
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Check for missing semicolons
      if (line.trim().match(/^(const|let|var|return|throw)\s+.*[^;{}\s]$/)) {
        result.warnings.push(`Line ${lineNum}: Missing semicolon`);
      }

      // Check for unused imports
      if (line.trim().startsWith('import') && !content.includes(line.match(/import\s+.*?\s+from/)?.[0]?.replace(/import\s+/, '').replace(/\s+from/, '') || '')) {
        result.warnings.push(`Line ${lineNum}: Potentially unused import`);
      }

      // Check for console.log statements
      if (line.includes('console.log')) {
        result.suggestions.push(`Line ${lineNum}: Consider removing console.log for production`);
      }
    }

    // Check for TypeScript-specific issues
    if (content.includes('any') && !content.includes('// @ts-ignore')) {
      result.warnings.push('File contains "any" types - consider using more specific types');
    }
  }

  /**
   * Validates JavaScript files
   */
  private async validateJavaScriptFile(content: string, result: FileValidationResult): Promise<void> {
    // Basic JavaScript validation
    try {
      // Check for syntax errors by attempting to parse
      new Function(content);
    } catch (error) {
      result.isValid = false;
      result.errors.push(`Syntax error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates JSON files
   */
  private async validateJsonFile(content: string, result: FileValidationResult): Promise<void> {
    try {
      JSON.parse(content);
    } catch (error) {
      result.isValid = false;
      result.errors.push(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates general file properties
   */
  private async validateGeneralFile(content: string, filePath: string, result: FileValidationResult): Promise<void> {
    // Check file size
    const sizeInMB = Buffer.byteLength(content, 'utf8') / (1024 * 1024);
    if (sizeInMB > 10) {
      result.warnings.push(`Large file size: ${sizeInMB.toFixed(2)}MB`);
    }

    // Check for trailing whitespace
    const lines = content.split('\n');
    const trailingWhitespaceLines = lines
      .map((line, index) => ({ line: line, number: index + 1 }))
      .filter(({ line }) => line.match(/\s+$/))
      .map(({ number }) => number);

    if (trailingWhitespaceLines.length > 0) {
      result.suggestions.push(`Trailing whitespace found on lines: ${trailingWhitespaceLines.slice(0, 5).join(', ')}${trailingWhitespaceLines.length > 5 ? '...' : ''}`);
    }

    // Check line endings
    if (content.includes('\r\n') && content.includes('\n')) {
      result.warnings.push('Mixed line endings detected (CRLF and LF)');
    }
  }

  /**
   * Checks if a file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}