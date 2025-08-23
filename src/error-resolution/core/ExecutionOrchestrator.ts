import { EventEmitter } from 'events';
import { AnalyzedError, FixingScript, ScriptCommand, ValidationCheck, PerformanceMetrics } from '../types';
import { ProgressMonitor } from './ProgressMonitor';
import { Logger } from '../utils/Logger';
import { BaseScriptGenerator } from '../generators/BaseScriptGenerator';
import * as fs from 'fs';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';

export interface ExecutionPhase {
  id: string;
  name: string;
  description: string;
  scripts: FixingScript[];
  dependencies: string[];
  priority: number;
  estimatedDuration: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  errors?: Error[];
}

export interface ExecutionPlan {
  id: string;
  name: string;
  phases: ExecutionPhase[];
  totalEstimatedDuration: number;
  createdAt: Date;
  targetErrors: AnalyzedError[];
}

export interface ExecutionContext {
  projectRoot: string;
  dryRun: boolean;
  backupEnabled: boolean;
  validationEnabled: boolean;
  timeoutSeconds: number;
  maxRetries: number;
  rollbackOnFailure: boolean;
}

export interface ExecutionResult {
  success: boolean;
  executedPhases: string[];
  failedPhases: string[];
  skippedPhases: string[];
  errorsFixed: number;
  errorsRemaining: number;
  executionTime: number;
  performanceMetrics: PerformanceMetrics;
  rollbackPerformed: boolean;
  errors: Error[];
}

export class ExecutionOrchestrator extends EventEmitter {
  private logger: Logger;
  private progressMonitor: ProgressMonitor;
  private generators: Map<string, BaseScriptGenerator> = new Map();
  private currentPlan: ExecutionPlan | null = null;
  private currentExecution: {
    context: ExecutionContext;
    startTime: Date;
    runningProcesses: Map<string, ChildProcess>;
    backupPaths: string[];
  } | null = null;

  constructor(logger?: Logger) {
    super();
    this.logger = logger || new Logger();
    this.progressMonitor = new ProgressMonitor();
  }

  /**
   * Registers a script generator for a specific category
   */
  public registerGenerator(category: string, generator: BaseScriptGenerator): void {
    this.generators.set(category, generator);
    this.logger.info('ORCHESTRATOR', `Registered generator for category: ${category}`);
  }

  /**
   * Creates an execution plan from analyzed errors
   */
  public async createExecutionPlan(
    errors: AnalyzedError[],
    context: ExecutionContext
  ): Promise<ExecutionPlan> {
    this.logger.info('PLAN_CREATION', `Creating execution plan for ${errors.length} errors`);

    const planId = `plan-${Date.now()}`;
    const phases: ExecutionPhase[] = [];

    // Group errors by category and priority
    const errorsByCategory = this.groupErrorsByCategory(errors);
    
    // Create phases based on error categories and dependencies
    let phaseIndex = 0;
    
    // Phase 1: Syntax and formatting errors (highest priority)
    const syntaxErrors = [
      ...(errorsByCategory.get('Syntax') || []),
      ...(errorsByCategory.get('Formatting') || [])
    ];
    
    if (syntaxErrors.length > 0) {
      const syntaxScripts = await this.generateScriptsForErrors(syntaxErrors, context);
      phases.push({
        id: `phase-${++phaseIndex}`,
        name: 'Syntax and Formatting Fixes',
        description: 'Fix syntax errors, formatting issues, and basic code structure problems',
        scripts: syntaxScripts,
        dependencies: [],
        priority: 1,
        estimatedDuration: this.estimatePhaseDuration(syntaxScripts),
        status: 'pending'
      });
    }

    // Phase 2: Import and module resolution
    const importErrors = errorsByCategory.get('Import') || [];
    if (importErrors.length > 0) {
      const importScripts = await this.generateScriptsForErrors(importErrors, context);
      phases.push({
        id: `phase-${++phaseIndex}`,
        name: 'Import Resolution',
        description: 'Resolve missing imports, circular dependencies, and module path issues',
        scripts: importScripts,
        dependencies: phases.length > 0 ? [phases[0].id] : [],
        priority: 2,
        estimatedDuration: this.estimatePhaseDuration(importScripts),
        status: 'pending'
      });
    }

    // Phase 3: Type system errors
    const typeErrors = errorsByCategory.get('Type') || [];
    if (typeErrors.length > 0) {
      const typeScripts = await this.generateScriptsForErrors(typeErrors, context);
      phases.push({
        id: `phase-${++phaseIndex}`,
        name: 'Type System Fixes',
        description: 'Fix type compatibility, missing properties, and generic constraints',
        scripts: typeScripts,
        dependencies: phases.slice(-2).map(p => p.id), // Depends on previous phases
        priority: 3,
        estimatedDuration: this.estimatePhaseDuration(typeScripts),
        status: 'pending'
      });
    }

    // Phase 4: Logic and runtime errors
    const logicErrors = errorsByCategory.get('Logic') || [];
    if (logicErrors.length > 0) {
      const logicScripts = await this.generateScriptsForErrors(logicErrors, context);
      phases.push({
        id: `phase-${++phaseIndex}`,
        name: 'Logic and Runtime Fixes',
        description: 'Fix null/undefined handling, async patterns, and runtime logic issues',
        scripts: logicScripts,
        dependencies: phases.slice(-1).map(p => p.id), // Depends on type fixes
        priority: 4,
        estimatedDuration: this.estimatePhaseDuration(logicScripts),
        status: 'pending'
      });
    }

    const plan: ExecutionPlan = {
      id: planId,
      name: `Error Resolution Plan - ${new Date().toISOString()}`,
      phases,
      totalEstimatedDuration: phases.reduce((sum, phase) => sum + phase.estimatedDuration, 0),
      createdAt: new Date(),
      targetErrors: errors
    };

    this.currentPlan = plan;
    this.logger.info('PLAN_CREATION', `Created execution plan with ${phases.length} phases`);
    
    return plan;
  }

  /**
   * Executes the current execution plan
   */
  public async executePlan(context: ExecutionContext): Promise<ExecutionResult> {
    if (!this.currentPlan) {
      throw new Error('No execution plan available. Create a plan first.');
    }

    this.logger.info('EXECUTION', `Starting execution of plan: ${this.currentPlan.id}`);
    
    const startTime = new Date();
    this.currentExecution = {
      context,
      startTime,
      runningProcesses: new Map(),
      backupPaths: []
    };

    // Initialize progress monitoring
    const totalErrors = this.currentPlan.targetErrors.length;
    this.progressMonitor = new ProgressMonitor(totalErrors, context.timeoutSeconds * 1000);
    
    const result: ExecutionResult = {
      success: false,
      executedPhases: [],
      failedPhases: [],
      skippedPhases: [],
      errorsFixed: 0,
      errorsRemaining: totalErrors,
      executionTime: 0,
      performanceMetrics: this.progressMonitor.getPerformanceMetrics(),
      rollbackPerformed: false,
      errors: []
    };

    try {
      // Create backup if enabled
      if (context.backupEnabled) {
        await this.createBackup();
      }

      // Execute phases in dependency order
      const executionOrder = this.calculateExecutionOrder(this.currentPlan.phases);
      
      for (const phase of executionOrder) {
        try {
          await this.executePhase(phase, context);
          result.executedPhases.push(phase.id);
          
          // Update progress
          const errorsInPhase = phase.scripts.reduce((sum, script) => sum + script.targetErrors.length, 0);
          result.errorsFixed += errorsInPhase;
          result.errorsRemaining -= errorsInPhase;
          
        } catch (error) {
          this.logger.error('PHASE_EXECUTION', `Phase ${phase.id} failed: ${error}`, error as Error);
          phase.status = 'failed';
          phase.errors = [error as Error];
          result.failedPhases.push(phase.id);
          result.errors.push(error as Error);
          
          if (context.rollbackOnFailure) {
            await this.performRollback();
            result.rollbackPerformed = true;
            break;
          }
        }
      }

      // Skip remaining phases if rollback was performed
      if (result.rollbackPerformed) {
        const remainingPhases = this.currentPlan.phases.filter(
          p => p.status === 'pending' && !result.executedPhases.includes(p.id)
        );
        result.skippedPhases = remainingPhases.map(p => p.id);
      }

      result.success = result.failedPhases.length === 0;
      result.executionTime = Date.now() - startTime.getTime();
      result.performanceMetrics = this.progressMonitor.getPerformanceMetrics();

      this.logger.info('EXECUTION', `Execution completed. Success: ${result.success}, Fixed: ${result.errorsFixed}, Remaining: ${result.errorsRemaining}`);
      
    } catch (error) {
      this.logger.error('EXECUTION', `Execution failed: ${error}`, error as Error);
      result.errors.push(error as Error);
      
      if (context.rollbackOnFailure) {
        await this.performRollback();
        result.rollbackPerformed = true;
      }
    } finally {
      // Cleanup
      await this.cleanup();
    }

    this.emit('executionComplete', result);
    return result;
  }

  /**
   * Executes a single phase
   */
  private async executePhase(phase: ExecutionPhase, context: ExecutionContext): Promise<void> {
    this.logger.info('PHASE_EXECUTION', `Starting phase: ${phase.name}`);
    this.progressMonitor.startPhase(phase.name, phase.scripts.length);
    
    phase.status = 'running';
    phase.startTime = new Date();

    try {
      // Execute scripts in the phase
      for (const script of phase.scripts) {
        await this.executeScript(script, context);
      }

      // Validate phase completion
      if (context.validationEnabled) {
        await this.validatePhase(phase);
      }

      phase.status = 'completed';
      phase.endTime = new Date();
      
      this.progressMonitor.completePhase(phase.name);
      this.logger.info('PHASE_EXECUTION', `Completed phase: ${phase.name}`);
      
    } catch (error) {
      phase.status = 'failed';
      phase.endTime = new Date();
      phase.errors = [error as Error];
      throw error;
    }
  }

  /**
   * Executes a single script
   */
  private async executeScript(script: FixingScript, context: ExecutionContext): Promise<void> {
    this.logger.info('SCRIPT_EXECUTION', `Executing script: ${script.id}`);
    
    const startTime = Date.now();
    
    try {
      if (context.dryRun) {
        this.logger.info('SCRIPT_EXECUTION', `DRY RUN: Would execute ${script.commands.length} commands`);
        await this.simulateScriptExecution(script);
      } else {
        await this.executeScriptCommands(script.commands, context);
      }

      // Run validation checks
      if (context.validationEnabled) {
        await this.validateScript(script);
      }

      const executionTime = Date.now() - startTime;
      this.progressMonitor.recordErrorFixed(script.category, executionTime);
      
      this.logger.info('SCRIPT_EXECUTION', `Script executed successfully: ${script.id} (${executionTime}ms)`);
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.progressMonitor.recordErrorFailed(script.category, (error as Error).message);
      
      this.logger.error('SCRIPT_EXECUTION', `Script execution failed: ${script.id}`, error as Error);
      throw error;
    }
  }

  /**
   * Executes script commands
   */
  private async executeScriptCommands(commands: ScriptCommand[], context: ExecutionContext): Promise<void> {
    for (const command of commands) {
      await this.executeCommand(command, context);
    }
  }

  /**
   * Executes a single command
   */
  private async executeCommand(command: ScriptCommand, context: ExecutionContext): Promise<void> {
    this.logger.debug('COMMAND_EXECUTION', `Executing command: ${command.type} on ${command.file}`);
    
    try {
      switch (command.type) {
        case 'replace':
          await this.executeReplaceCommand(command);
          break;
        case 'insert':
          await this.executeInsertCommand(command);
          break;
        case 'delete':
          await this.executeDeleteCommand(command);
          break;
        case 'move':
          await this.executeMoveCommand(command);
          break;
        case 'copy':
          await this.executeCopyCommand(command);
          break;
        default:
          throw new Error(`Unknown command type: ${command.type}`);
      }
    } catch (error) {
      this.logger.error('COMMAND_EXECUTION', `Command execution failed: ${command.type} on ${command.file}`, error as Error);
      throw error;
    }
  }

  /**
   * Executes a replace command
   */
  private async executeReplaceCommand(command: ScriptCommand): Promise<void> {
    if (!command.pattern || command.replacement === undefined) {
      throw new Error('Replace command requires pattern and replacement');
    }

    const content = await fs.promises.readFile(command.file, 'utf8');
    const newContent = content.replace(command.pattern, command.replacement);
    
    if (content !== newContent) {
      await fs.promises.writeFile(command.file, newContent, 'utf8');
      this.logger.debug('COMMAND_EXECUTION', `Replaced content in ${command.file}`);
    }
  }

  /**
   * Executes an insert command
   */
  private async executeInsertCommand(command: ScriptCommand): Promise<void> {
    if (!command.position || command.replacement === undefined) {
      throw new Error('Insert command requires position and replacement');
    }

    const content = await fs.promises.readFile(command.file, 'utf8');
    const lines = content.split('\n');
    
    const lineIndex = command.position.line - 1;
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const line = lines[lineIndex];
      const newLine = line.slice(0, command.position.column) + command.replacement + line.slice(command.position.column);
      lines[lineIndex] = newLine;
      
      await fs.promises.writeFile(command.file, lines.join('\n'), 'utf8');
      this.logger.debug('COMMAND_EXECUTION', `Inserted content in ${command.file} at line ${command.position.line}`);
    }
  }

  /**
   * Executes a delete command
   */
  private async executeDeleteCommand(command: ScriptCommand): Promise<void> {
    if (!command.position) {
      throw new Error('Delete command requires position');
    }

    const content = await fs.promises.readFile(command.file, 'utf8');
    const lines = content.split('\n');
    
    const lineIndex = command.position.line - 1;
    if (lineIndex >= 0 && lineIndex < lines.length) {
      lines.splice(lineIndex, 1);
      
      await fs.promises.writeFile(command.file, lines.join('\n'), 'utf8');
      this.logger.debug('COMMAND_EXECUTION', `Deleted line ${command.position.line} from ${command.file}`);
    }
  }

  /**
   * Executes a move command
   */
  private async executeMoveCommand(command: ScriptCommand): Promise<void> {
    if (!command.targetFile) {
      throw new Error('Move command requires targetFile');
    }

    await fs.promises.rename(command.file, command.targetFile);
    this.logger.debug('COMMAND_EXECUTION', `Moved ${command.file} to ${command.targetFile}`);
  }

  /**
   * Executes a copy command
   */
  private async executeCopyCommand(command: ScriptCommand): Promise<void> {
    if (!command.targetFile) {
      throw new Error('Copy command requires targetFile');
    }

    await fs.promises.copyFile(command.file, command.targetFile);
    this.logger.debug('COMMAND_EXECUTION', `Copied ${command.file} to ${command.targetFile}`);
  }

  /**
   * Simulates script execution for dry run
   */
  private async simulateScriptExecution(script: FixingScript): Promise<void> {
    this.logger.info('SIMULATION', `Simulating execution of ${script.commands.length} commands`);
    
    for (const command of script.commands) {
      this.logger.debug('SIMULATION', `Would execute: ${command.type} on ${command.file} - ${command.description}`);
      
      // Simulate execution time
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  /**
   * Validates a script execution
   */
  private async validateScript(script: FixingScript): Promise<void> {
    this.logger.debug('VALIDATION', `Validating script: ${script.id}`);
    
    for (const check of script.validationChecks) {
      await this.runValidationCheck(check);
    }
  }

  /**
   * Validates a phase execution
   */
  private async validatePhase(phase: ExecutionPhase): Promise<void> {
    this.logger.debug('VALIDATION', `Validating phase: ${phase.name}`);
    
    // Run TypeScript compilation check
    const files = [...new Set(phase.scripts.flatMap(s => s.targetErrors.map(e => e.file)))];
    await this.runTypeScriptValidation(files);
  }

  /**
   * Runs a validation check
   */
  private async runValidationCheck(check: ValidationCheck): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn('npx', check.command.split(' ').slice(1), {
        stdio: 'pipe',
        timeout: (check.timeoutSeconds || 30) * 1000
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
        if (code === 0 || check.expectedResult === 'improved-count') {
          resolve();
        } else {
          reject(new Error(`Validation failed: ${check.type} - ${stderr || stdout}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Runs TypeScript validation
   */
  private async runTypeScriptValidation(files: string[]): Promise<void> {
    const command = `npx tsc --noEmit --skipLibCheck ${files.join(' ')}`;
    
    return new Promise((resolve, reject) => {
      const process = spawn('npx', ['tsc', '--noEmit', '--skipLibCheck', ...files], {
        stdio: 'pipe',
        timeout: 60000
      });

      let stderr = '';

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`TypeScript validation failed: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Groups errors by category
   */
  private groupErrorsByCategory(errors: AnalyzedError[]): Map<string, AnalyzedError[]> {
    const groups = new Map<string, AnalyzedError[]>();
    
    for (const error of errors) {
      const category = error.category.primary;
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(error);
    }
    
    return groups;
  }

  /**
   * Generates scripts for errors using registered generators
   */
  private async generateScriptsForErrors(
    errors: AnalyzedError[],
    context: ExecutionContext
  ): Promise<FixingScript[]> {
    const scripts: FixingScript[] = [];
    const errorsByCategory = this.groupErrorsByCategory(errors);
    
    for (const [category, categoryErrors] of errorsByCategory.entries()) {
      const generator = this.generators.get(category);
      if (generator && generator.canHandle(categoryErrors)) {
        const generationContext = {
          errors: categoryErrors,
          projectRoot: context.projectRoot,
          dryRun: context.dryRun,
          backupEnabled: context.backupEnabled,
          validationEnabled: context.validationEnabled
        };
        
        const categoryScripts = await generator.generateScripts(generationContext);
        scripts.push(...categoryScripts);
      }
    }
    
    return scripts;
  }

  /**
   * Estimates phase duration
   */
  private estimatePhaseDuration(scripts: FixingScript[]): number {
    return scripts.reduce((sum, script) => sum + script.estimatedRuntime, 0);
  }

  /**
   * Calculates execution order based on dependencies
   */
  private calculateExecutionOrder(phases: ExecutionPhase[]): ExecutionPhase[] {
    const ordered: ExecutionPhase[] = [];
    const remaining = [...phases];
    
    while (remaining.length > 0) {
      const readyPhases = remaining.filter(phase => 
        phase.dependencies.every(dep => ordered.some(p => p.id === dep))
      );
      
      if (readyPhases.length === 0) {
        throw new Error('Circular dependency detected in execution phases');
      }
      
      // Sort by priority
      readyPhases.sort((a, b) => a.priority - b.priority);
      
      const nextPhase = readyPhases[0];
      ordered.push(nextPhase);
      remaining.splice(remaining.indexOf(nextPhase), 1);
    }
    
    return ordered;
  }

  /**
   * Creates backup of target files
   */
  private async createBackup(): Promise<void> {
    if (!this.currentPlan || !this.currentExecution) return;
    
    const backupDir = path.join(process.cwd(), '.error-resolution-backup', Date.now().toString());
    await fs.promises.mkdir(backupDir, { recursive: true });
    
    const files = [...new Set(this.currentPlan.targetErrors.map(e => e.file))];
    
    for (const file of files) {
      try {
        const relativePath = path.relative(process.cwd(), file);
        const backupPath = path.join(backupDir, relativePath);
        
        await fs.promises.mkdir(path.dirname(backupPath), { recursive: true });
        await fs.promises.copyFile(file, backupPath);
        
        this.currentExecution.backupPaths.push(backupPath);
      } catch (error) {
        this.logger.warn('BACKUP', `Failed to backup file ${file}: ${error}`);
      }
    }
    
    this.logger.info('BACKUP', `Created backup in ${backupDir}`);
  }

  /**
   * Performs rollback to backup
   */
  private async performRollback(): Promise<void> {
    if (!this.currentExecution) return;
    
    this.logger.info('ROLLBACK', 'Performing rollback to backup');
    this.progressMonitor.recordRollback('Execution failure', this.currentExecution.backupPaths);
    
    // Restore files from backup
    for (const backupPath of this.currentExecution.backupPaths) {
      try {
        const relativePath = path.relative(
          path.join(process.cwd(), '.error-resolution-backup'),
          backupPath
        );
        const originalPath = path.join(process.cwd(), relativePath);
        
        await fs.promises.copyFile(backupPath, originalPath);
      } catch (error) {
        this.logger.error('ROLLBACK', `Failed to restore file ${backupPath}: ${error}`, error as Error);
      }
    }
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    // Stop any running processes
    if (this.currentExecution) {
      for (const [id, process] of this.currentExecution.runningProcesses.entries()) {
        if (!process.killed) {
          process.kill();
          this.logger.debug('CLEANUP', `Killed process: ${id}`);
        }
      }
    }
    
    // Stop progress monitoring
    this.progressMonitor.stop();
    
    this.currentExecution = null;
  }

  /**
   * Gets current execution status
   */
  public getExecutionStatus(): {
    isRunning: boolean;
    currentPlan: ExecutionPlan | null;
    progress: any;
  } {
    return {
      isRunning: this.currentExecution !== null,
      currentPlan: this.currentPlan,
      progress: this.progressMonitor.getProgressSummary()
    };
  }
}