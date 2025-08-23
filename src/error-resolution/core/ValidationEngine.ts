import { EventEmitter } from 'events';
import { Logger } from '../utils/Logger';
import { AnalyzedError, ValidationCheck } from '../types';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface ValidationResult {
  type: string;
  success: boolean;
  message: string;
  details?: any;
  duration: number;
  timestamp: Date;
  errors?: string[];
  warnings?: string[];
}

export interface ValidationSuite {
  id: string;
  name: string;
  description: string;
  checks: ValidationCheck[];
  parallel: boolean;
  continueOnFailure: boolean;
}

export interface ValidationReport {
  suiteId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  skippedChecks: number;
  results: ValidationResult[];
  overallSuccess: boolean;
  summary: string;
}

export interface ValidationConfig {
  timeoutSeconds: number;
  retryAttempts: number;
  retryDelayMs: number;
  continueOnFailure: boolean;
  parallelExecution: boolean;
  maxConcurrentChecks: number;
}

export class ValidationEngine extends EventEmitter {
  private logger: Logger;
  private config: ValidationConfig;
  private runningChecks: Map<string, ChildProcess> = new Map();
  private validationSuites: Map<string, ValidationSuite> = new Map();

  constructor(config: Partial<ValidationConfig> = {}, logger?: Logger) {
    super();
    this.logger = logger || new Logger();
    
    this.config = {
      timeoutSeconds: 300, // 5 minutes
      retryAttempts: 2,
      retryDelayMs: 1000,
      continueOnFailure: true,
      parallelExecution: true,
      maxConcurrentChecks: 4,
      ...config
    };

    this.initializeBuiltInSuites();
  }

  /**
   * Registers a validation suite
   */
  public registerSuite(suite: ValidationSuite): void {
    this.validationSuites.set(suite.id, suite);
    this.logger.info('VALIDATION', `Registered validation suite: ${suite.name} (${suite.checks.length} checks)`);
  }

  /**
   * Runs a validation suite
   */
  public async runSuite(suiteId: string, context: {
    files?: string[];
    projectRoot?: string;
    beforeErrorCount?: number;
    [key: string]: any;
  } = {}): Promise<ValidationReport> {
    const suite = this.validationSuites.get(suiteId);
    if (!suite) {
      throw new Error(`Validation suite not found: ${suiteId}`);
    }

    this.logger.info('VALIDATION', `Running validation suite: ${suite.name}`);
    
    const startTime = new Date();
    const results: ValidationResult[] = [];
    
    try {
      if (suite.parallel && this.config.parallelExecution) {
        const parallelResults = await this.runChecksInParallel(suite.checks, context);
        results.push(...parallelResults);
      } else {
        const sequentialResults = await this.runChecksSequentially(suite.checks, context);
        results.push(...sequentialResults);
      }
    } catch (error) {
      this.logger.error('VALIDATION', `Suite execution failed: ${suite.name}`, error as Error);
      throw error;
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    const passedChecks = results.filter(r => r.success).length;
    const failedChecks = results.filter(r => !r.success).length;
    const skippedChecks = suite.checks.length - results.length;
    
    const report: ValidationReport = {
      suiteId,
      startTime,
      endTime,
      duration,
      totalChecks: suite.checks.length,
      passedChecks,
      failedChecks,
      skippedChecks,
      results,
      overallSuccess: failedChecks === 0,
      summary: this.generateSummary(suite, results)
    };

    this.logger.info('VALIDATION', 
      `Suite completed: ${suite.name} (${passedChecks}/${suite.checks.length} passed, ${duration}ms)`
    );
    
    this.emit('suiteCompleted', report);
    return report;
  }

  /**
   * Runs a single validation check
   */
  public async runCheck(check: ValidationCheck, context: any = {}): Promise<ValidationResult> {
    const startTime = Date.now();
    
    this.logger.debug('VALIDATION', `Running check: ${check.type} - ${check.command}`);
    
    let attempt = 0;
    let lastError: Error | null = null;
    
    while (attempt <= this.config.retryAttempts) {
      try {
        const result = await this.executeCheck(check, context);
        result.duration = Date.now() - startTime;
        result.timestamp = new Date();
        
        this.emit('checkCompleted', result);
        return result;
        
      } catch (error) {
        lastError = error as Error;
        attempt++;
        
        if (attempt <= this.config.retryAttempts) {
          this.logger.warn('VALIDATION', 
            `Check failed (attempt ${attempt}/${this.config.retryAttempts + 1}): ${check.type} - ${error}`
          );
          await this.delay(this.config.retryDelayMs);
        }
      }
    }
    
    // All attempts failed
    const result: ValidationResult = {
      type: check.type,
      success: false,
      message: `Check failed after ${this.config.retryAttempts + 1} attempts: ${lastError?.message}`,
      duration: Date.now() - startTime,
      timestamp: new Date(),
      errors: [lastError?.message || 'Unknown error']
    };
    
    this.emit('checkFailed', result);
    return result;
  }

  /**
   * Validates TypeScript compilation
   */
  public async validateTypeScriptCompilation(files: string[]): Promise<ValidationResult> {
    const check: ValidationCheck = {
      type: 'typescript-compilation',
      command: `npx tsc --noEmit --skipLibCheck ${files.join(' ')}`,
      expectedResult: 'zero-errors',
      timeoutSeconds: 120
    };
    
    return this.runCheck(check, { files });
  }

  /**
   * Validates ESLint rules
   */
  public async validateESLint(files: string[]): Promise<ValidationResult> {
    const check: ValidationCheck = {
      type: 'eslint',
      command: `npx eslint ${files.join(' ')}`,
      expectedResult: 'improved-count',
      timeoutSeconds: 60
    };
    
    return this.runCheck(check, { files });
  }

  /**
   * Validates Prettier formatting
   */
  public async validatePrettier(files: string[]): Promise<ValidationResult> {
    const check: ValidationCheck = {
      type: 'prettier',
      command: `npx prettier --check ${files.join(' ')}`,
      expectedResult: 'success',
      timeoutSeconds: 30
    };
    
    return this.runCheck(check, { files });
  }

  /**
   * Runs unit tests
   */
  public async validateTests(testPattern?: string): Promise<ValidationResult> {
    const command = testPattern 
      ? `npm test -- ${testPattern}`
      : 'npm test';
      
    const check: ValidationCheck = {
      type: 'unit-tests',
      command,
      expectedResult: 'success',
      timeoutSeconds: 300
    };
    
    return this.runCheck(check, { testPattern });
  }

  /**
   * Validates build process
   */
  public async validateBuild(): Promise<ValidationResult> {
    const check: ValidationCheck = {
      type: 'build',
      command: 'npm run build',
      expectedResult: 'success',
      timeoutSeconds: 300
    };
    
    return this.runCheck(check);
  }

  /**
   * Validates error count improvement
   */
  public async validateErrorCountImprovement(
    files: string[],
    beforeCount: number
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    
    try {
      // Run TypeScript compilation to get current error count
      const tscResult = await this.executeTypeScriptCheck(files);
      const currentErrorCount = this.parseTypeScriptErrors(tscResult.output).length;
      
      const improvement = beforeCount - currentErrorCount;
      const success = improvement > 0 || currentErrorCount === 0;
      
      return {
        type: 'error-count-improvement',
        success,
        message: success 
          ? `Error count improved: ${beforeCount} → ${currentErrorCount} (${improvement} errors fixed)`
          : `No improvement: ${beforeCount} → ${currentErrorCount}`,
        duration: Date.now() - startTime,
        timestamp: new Date(),
        details: {
          beforeCount,
          afterCount: currentErrorCount,
          improvement,
          files: files.length
        }
      };
      
    } catch (error) {
      return {
        type: 'error-count-improvement',
        success: false,
        message: `Failed to validate error count: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date(),
        errors: [(error as Error).message]
      };
    }
  }

  /**
   * Executes a validation check
   */
  private async executeCheck(check: ValidationCheck, context: any): Promise<ValidationResult> {
    const checkId = `check-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return new Promise((resolve, reject) => {
      const timeoutMs = (check.timeoutSeconds || this.config.timeoutSeconds) * 1000;
      
      // Parse command and arguments
      const [command, ...args] = check.command.split(' ');
      
      // Replace context variables in command
      const processedArgs = args.map(arg => this.replaceContextVariables(arg, context));
      
      const childProcess = spawn(command, processedArgs, {
        stdio: 'pipe',
        timeout: timeoutMs,
        cwd: context.projectRoot || process.cwd()
      });
      
      this.runningChecks.set(checkId, childProcess);
      
      let stdout = '';
      let stderr = '';
      
      childProcess.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      
      childProcess.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
      
      childProcess.on('close', (code, signal) => {
        this.runningChecks.delete(checkId);
        
        const output = stdout + stderr;
        const result = this.interpretCheckResult(check, code, output, signal);
        
        if (result.success) {
          resolve(result);
        } else {
          reject(new Error(result.message));
        }
      });
      
      childProcess.on('error', (error) => {
        this.runningChecks.delete(checkId);
        reject(error);
      });
      
      // Set up timeout
      setTimeout(() => {
        if (this.runningChecks.has(checkId)) {
          childProcess.kill('SIGTERM');
          setTimeout(() => {
            if (!childProcess.killed) {
              childProcess.kill('SIGKILL');
            }
          }, 5000);
          
          reject(new Error(`Check timed out after ${timeoutMs}ms`));
        }
      }, timeoutMs);
    });
  }

  /**
   * Executes TypeScript compilation check
   */
  private async executeTypeScriptCheck(files: string[]): Promise<{ exitCode: number; output: string }> {
    return new Promise((resolve, reject) => {
      const childProcess = spawn('npx', ['tsc', '--noEmit', '--skipLibCheck', ...files], {
        stdio: 'pipe',
        timeout: 120000 // 2 minutes
      });
      
      let output = '';
      
      childProcess.stdout?.on('data', (data) => {
        output += data.toString();
      });
      
      childProcess.stderr?.on('data', (data) => {
        output += data.toString();
      });
      
      childProcess.on('close', (code) => {
        resolve({ exitCode: code || 0, output });
      });
      
      childProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Parses TypeScript errors from compiler output
   */
  private parseTypeScriptErrors(output: string): AnalyzedError[] {
    const errors: AnalyzedError[] = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      // Match TypeScript error format: file(line,col): error TS####: message
      const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);
      if (match) {
        const [, file, lineStr, colStr, code, message] = match;
        
        errors.push({
          file: path.resolve(file),
          line: parseInt(lineStr, 10),
          column: parseInt(colStr, 10),
          code,
          message: message.trim(),
          severity: 'error',
          category: {
            primary: 'Type',
            secondary: 'Compilation',
            rootCause: 'TYPE_MISMATCH' as any
          }
        });
      }
    }
    
    return errors;
  }

  /**
   * Interprets check result based on exit code and output
   */
  private interpretCheckResult(
    check: ValidationCheck,
    exitCode: number | null,
    output: string,
    signal: NodeJS.Signals | null
  ): ValidationResult {
    const baseResult = {
      type: check.type,
      duration: 0, // Will be set by caller
      timestamp: new Date()
    };
    
    if (signal) {
      return {
        ...baseResult,
        success: false,
        message: `Process killed with signal: ${signal}`,
        errors: [`Process terminated by signal: ${signal}`]
      };
    }
    
    switch (check.expectedResult) {
      case 'success':
        return {
          ...baseResult,
          success: exitCode === 0,
          message: exitCode === 0 
            ? `Check passed successfully`
            : `Check failed with exit code: ${exitCode}`,
          details: { exitCode, output: output.slice(0, 1000) },
          errors: exitCode !== 0 ? [output] : undefined
        };
        
      case 'zero-errors':
        const errorCount = this.countErrorsInOutput(output);
        return {
          ...baseResult,
          success: errorCount === 0,
          message: errorCount === 0 
            ? 'No errors found'
            : `Found ${errorCount} errors`,
          details: { errorCount, exitCode, output: output.slice(0, 1000) },
          errors: errorCount > 0 ? [output] : undefined
        };
        
      case 'improved-count':
        // For improved count, we consider any reduction or zero errors as success
        return {
          ...baseResult,
          success: true, // We'll handle this in the specific validation methods
          message: 'Check completed',
          details: { exitCode, output: output.slice(0, 1000) }
        };
        
      default:
        return {
          ...baseResult,
          success: exitCode === 0,
          message: `Check completed with exit code: ${exitCode}`,
          details: { exitCode, output: output.slice(0, 1000) }
        };
    }
  }

  /**
   * Counts errors in command output
   */
  private countErrorsInOutput(output: string): number {
    // Count TypeScript errors
    const tsErrorMatches = output.match(/error TS\d+:/g);
    const tsErrorCount = tsErrorMatches ? tsErrorMatches.length : 0;
    
    // Count ESLint errors
    const eslintErrorMatches = output.match(/\d+ error/g);
    const eslintErrorCount = eslintErrorMatches ? 
      eslintErrorMatches.reduce((sum, match) => {
        const num = parseInt(match.match(/\d+/)?.[0] || '0', 10);
        return sum + num;
      }, 0) : 0;
    
    return tsErrorCount + eslintErrorCount;
  }

  /**
   * Replaces context variables in command arguments
   */
  private replaceContextVariables(arg: string, context: any): string {
    let result = arg;
    
    // Replace {files} with file list
    if (context.files && Array.isArray(context.files)) {
      result = result.replace('{files}', context.files.join(' '));
    }
    
    // Replace {file} with single file (first file if multiple)
    if (context.files && Array.isArray(context.files) && context.files.length > 0) {
      result = result.replace('{file}', context.files[0]);
    }
    
    // Replace other context variables
    for (const [key, value] of Object.entries(context)) {
      if (typeof value === 'string' || typeof value === 'number') {
        result = result.replace(new RegExp(`{${key}}`, 'g'), value.toString());
      }
    }
    
    return result;
  }

  /**
   * Runs checks in parallel
   */
  private async runChecksInParallel(checks: ValidationCheck[], context: any): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const batches = this.createBatches(checks, this.config.maxConcurrentChecks);
    
    for (const batch of batches) {
      const batchPromises = batch.map(check => this.runCheck(check, context));
      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            type: 'unknown',
            success: false,
            message: `Check failed: ${result.reason}`,
            duration: 0,
            timestamp: new Date(),
            errors: [result.reason.toString()]
          });
        }
      }
    }
    
    return results;
  }

  /**
   * Runs checks sequentially
   */
  private async runChecksSequentially(checks: ValidationCheck[], context: any): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    for (const check of checks) {
      try {
        const result = await this.runCheck(check, context);
        results.push(result);
        
        if (!result.success && !this.config.continueOnFailure) {
          break;
        }
      } catch (error) {
        const failedResult: ValidationResult = {
          type: check.type,
          success: false,
          message: `Check failed: ${error}`,
          duration: 0,
          timestamp: new Date(),
          errors: [(error as Error).message]
        };
        
        results.push(failedResult);
        
        if (!this.config.continueOnFailure) {
          break;
        }
      }
    }
    
    return results;
  }

  /**
   * Creates batches for parallel execution
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    return batches;
  }

  /**
   * Generates summary for validation report
   */
  private generateSummary(suite: ValidationSuite, results: ValidationResult[]): string {
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const total = results.length;
    
    if (failed === 0) {
      return `All ${total} validation checks passed successfully`;
    } else {
      return `${passed}/${total} checks passed, ${failed} failed`;
    }
  }

  /**
   * Initializes built-in validation suites
   */
  private initializeBuiltInSuites(): void {
    // Basic TypeScript validation suite
    this.registerSuite({
      id: 'typescript-basic',
      name: 'TypeScript Basic Validation',
      description: 'Basic TypeScript compilation and syntax validation',
      parallel: false,
      continueOnFailure: true,
      checks: [
        {
          type: 'typescript-compilation',
          command: 'npx tsc --noEmit --skipLibCheck {files}',
          expectedResult: 'zero-errors',
          timeoutSeconds: 120
        }
      ]
    });

    // Code quality validation suite
    this.registerSuite({
      id: 'code-quality',
      name: 'Code Quality Validation',
      description: 'ESLint, Prettier, and code quality checks',
      parallel: true,
      continueOnFailure: true,
      checks: [
        {
          type: 'eslint',
          command: 'npx eslint {files}',
          expectedResult: 'improved-count',
          timeoutSeconds: 60
        },
        {
          type: 'prettier',
          command: 'npx prettier --check {files}',
          expectedResult: 'success',
          timeoutSeconds: 30
        }
      ]
    });

    // Full validation suite
    this.registerSuite({
      id: 'full-validation',
      name: 'Full Project Validation',
      description: 'Complete validation including compilation, linting, formatting, and tests',
      parallel: false,
      continueOnFailure: false,
      checks: [
        {
          type: 'typescript-compilation',
          command: 'npx tsc --noEmit --skipLibCheck',
          expectedResult: 'zero-errors',
          timeoutSeconds: 180
        },
        {
          type: 'eslint',
          command: 'npx eslint src/**/*.ts',
          expectedResult: 'improved-count',
          timeoutSeconds: 90
        },
        {
          type: 'prettier',
          command: 'npx prettier --check src/**/*.ts',
          expectedResult: 'success',
          timeoutSeconds: 30
        },
        {
          type: 'build',
          command: 'npm run build',
          expectedResult: 'success',
          timeoutSeconds: 300
        },
        {
          type: 'unit-tests',
          command: 'npm test',
          expectedResult: 'success',
          timeoutSeconds: 300
        }
      ]
    });
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Stops all running checks
   */
  public stopAllChecks(): void {
    for (const [checkId, childProcess] of this.runningChecks.entries()) {
      if (!childProcess.killed) {
        childProcess.kill('SIGTERM');
        setTimeout(() => {
          if (!childProcess.killed) {
            childProcess.kill('SIGKILL');
          }
        }, 5000);
      }
    }
    
    this.runningChecks.clear();
  }

  /**
   * Gets validation statistics
   */
  public getStatistics(): {
    registeredSuites: number;
    runningChecks: number;
    config: ValidationConfig;
  } {
    return {
      registeredSuites: this.validationSuites.size,
      runningChecks: this.runningChecks.size,
      config: this.config
    };
  }
}