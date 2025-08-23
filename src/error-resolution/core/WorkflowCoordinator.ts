import { EventEmitter } from 'events';
import { Logger } from '../utils/Logger';
import { ErrorAnalyzer } from './ErrorAnalyzer';
import { ExecutionOrchestrator, ExecutionContext, ExecutionResult } from './ExecutionOrchestrator';
import { ValidationEngine, ValidationReport } from './ValidationEngine';
import { ReportGenerator, ErrorResolutionReport } from './ReportGenerator';
import { RollbackManager } from './RollbackManager';
import { ProcessMonitor } from './ProcessMonitor';
import { ProgressMonitor } from './ProgressMonitor';
import { BaseScriptGenerator } from '../generators/BaseScriptGenerator';
import { FormattingScriptGenerator } from '../generators/FormattingScriptGenerator';
import { SyntaxScriptGenerator } from '../generators/SyntaxScriptGenerator';
import { TypeScriptGenerator } from '../generators/TypeScriptGenerator';
import { AnalyzedError } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export interface WorkflowConfig {
  projectRoot: string;
  dryRun: boolean;
  backupEnabled: boolean;
  validationEnabled: boolean;
  timeoutSeconds: number;
  maxRetries: number;
  rollbackOnFailure: boolean;
  continueOnValidationFailure: boolean;
  generateReports: boolean;
  reportFormats: ('json' | 'html' | 'markdown')[];
}

export interface WorkflowResult {
  success: boolean;
  initialErrorCount: number;
  finalErrorCount: number;
  errorsFixed: number;
  executionTime: number;
  phasesCompleted: string[];
  validationResults: ValidationReport[];
  report?: ErrorResolutionReport;
  rollbackPerformed: boolean;
  errors: Error[];
}

export interface WorkflowPhase {
  id: string;
  name: string;
  description: string;
  dependencies: string[];
  required: boolean;
  execute: (context: WorkflowContext) => Promise<void>;
}

export interface WorkflowContext {
  config: WorkflowConfig;
  initialErrors: AnalyzedError[];
  currentErrors: AnalyzedError[];
  executionResult?: ExecutionResult;
  validationResults: ValidationReport[];
  checkpointId?: string;
  startTime: Date;
}

export class WorkflowCoordinator extends EventEmitter {
  private logger: Logger;
  private errorAnalyzer: ErrorAnalyzer;
  private executionOrchestrator: ExecutionOrchestrator;
  private validationEngine: ValidationEngine;
  private reportGenerator: ReportGenerator;
  private rollbackManager: RollbackManager;
  private processMonitor: ProcessMonitor;
  private progressMonitor: ProgressMonitor;
  
  private generators: Map<string, BaseScriptGenerator> = new Map();
  private phases: Map<string, WorkflowPhase> = new Map();
  private currentWorkflow: WorkflowContext | null = null;

  constructor(logger?: Logger) {
    super();
    this.logger = logger || new Logger();
    
    // Initialize core components
    this.errorAnalyzer = new ErrorAnalyzer(this.logger);
    this.executionOrchestrator = new ExecutionOrchestrator(this.logger);
    this.validationEngine = new ValidationEngine({}, this.logger);
    this.reportGenerator = new ReportGenerator({}, this.logger);
    this.rollbackManager = new RollbackManager('.error-resolution-backups', 10, true, this.logger);
    this.processMonitor = new ProcessMonitor({}, this.logger);
    this.progressMonitor = new ProgressMonitor();

    // Initialize generators
    this.initializeGenerators();
    
    // Initialize workflow phases
    this.initializeWorkflowPhases();
    
    this.logger.info('WORKFLOW', 'Workflow coordinator initialized');
  }

  /**
   * Executes the complete error resolution workflow
   */
  public async executeWorkflow(
    files: string[],
    config: Partial<WorkflowConfig> = {}
  ): Promise<WorkflowResult> {
    const fullConfig: WorkflowConfig = {
      projectRoot: process.cwd(),
      dryRun: false,
      backupEnabled: true,
      validationEnabled: true,
      timeoutSeconds: 300,
      maxRetries: 2,
      rollbackOnFailure: true,
      continueOnValidationFailure: false,
      generateReports: true,
      reportFormats: ['json', 'html', 'markdown'],
      ...config
    };

    this.logger.info('WORKFLOW', `Starting error resolution workflow for ${files.length} files`);
    
    const startTime = new Date();
    const context: WorkflowContext = {
      config: fullConfig,
      initialErrors: [],
      currentErrors: [],
      validationResults: [],
      startTime
    };

    this.currentWorkflow = context;
    
    const result: WorkflowResult = {
      success: false,
      initialErrorCount: 0,
      finalErrorCount: 0,
      errorsFixed: 0,
      executionTime: 0,
      phasesCompleted: [],
      validationResults: [],
      rollbackPerformed: false,
      errors: []
    };

    try {
      // Execute workflow phases in order
      const phaseOrder = this.calculatePhaseExecutionOrder();
      
      for (const phaseId of phaseOrder) {
        const phase = this.phases.get(phaseId);
        if (!phase) {
          throw new Error(`Phase not found: ${phaseId}`);
        }

        try {
          this.logger.info('WORKFLOW', `Executing phase: ${phase.name}`);
          this.emit('phaseStarted', phase);
          
          await phase.execute(context);
          
          result.phasesCompleted.push(phaseId);
          this.emit('phaseCompleted', phase);
          
        } catch (error) {
          this.logger.error('WORKFLOW', `Phase failed: ${phase.name} - ${error}`, error as Error);
          result.errors.push(error as Error);
          
          if (phase.required) {
            throw error; // Stop workflow for required phases
          } else {
            this.logger.warn('WORKFLOW', `Continuing workflow despite optional phase failure: ${phase.name}`);
          }
        }
      }

      // Calculate final results
      result.success = result.errors.length === 0;
      result.initialErrorCount = context.initialErrors.length;
      result.finalErrorCount = context.currentErrors.length;
      result.errorsFixed = result.initialErrorCount - result.finalErrorCount;
      result.executionTime = Date.now() - startTime.getTime();
      result.validationResults = context.validationResults;
      result.rollbackPerformed = context.executionResult?.rollbackPerformed || false;

      this.logger.info('WORKFLOW', 
        `Workflow completed: ${result.success ? 'SUCCESS' : 'PARTIAL'} - ` +
        `${result.errorsFixed}/${result.initialErrorCount} errors fixed in ${this.formatDuration(result.executionTime)}`
      );

    } catch (error) {
      this.logger.error('WORKFLOW', `Workflow failed: ${error}`, error as Error);
      result.errors.push(error as Error);
      result.executionTime = Date.now() - startTime.getTime();
    } finally {
      this.currentWorkflow = null;
    }

    this.emit('workflowCompleted', result);
    return result;
  }

  /**
   * Gets current workflow status
   */
  public getCurrentWorkflowStatus(): {
    isRunning: boolean;
    currentPhase?: string;
    progress?: any;
    elapsedTime?: number;
  } {
    if (!this.currentWorkflow) {
      return { isRunning: false };
    }

    return {
      isRunning: true,
      elapsedTime: Date.now() - this.currentWorkflow.startTime.getTime(),
      progress: this.progressMonitor.getProgressSummary()
    };
  }

  /**
   * Stops the current workflow
   */
  public async stopWorkflow(reason: string = 'User requested'): Promise<void> {
    if (!this.currentWorkflow) {
      this.logger.warn('WORKFLOW', 'No workflow running to stop');
      return;
    }

    this.logger.info('WORKFLOW', `Stopping workflow: ${reason}`);
    
    // Stop all running processes
    this.processMonitor.gracefulShutdown(30000);
    
    // Stop validation engine
    this.validationEngine.stopAllChecks();
    
    // Perform rollback if configured
    if (this.currentWorkflow.config.rollbackOnFailure && this.currentWorkflow.checkpointId) {
      await this.rollbackManager.rollbackToCheckpoint(
        this.currentWorkflow.checkpointId,
        `Workflow stopped: ${reason}`
      );
    }

    this.currentWorkflow = null;
    this.emit('workflowStopped', reason);
  }

  /**
   * Initializes script generators
   */
  private initializeGenerators(): void {
    const formattingGenerator = new FormattingScriptGenerator(this.logger);
    const syntaxGenerator = new SyntaxScriptGenerator(this.logger);
    const typeScriptGenerator = new TypeScriptGenerator(this.logger);

    this.generators.set('Formatting', formattingGenerator);
    this.generators.set('Syntax', syntaxGenerator);
    this.generators.set('Type', typeScriptGenerator);

    // Register generators with orchestrator
    for (const [category, generator] of this.generators.entries()) {
      this.executionOrchestrator.registerGenerator(category, generator);
    }

    this.logger.info('WORKFLOW', `Initialized ${this.generators.size} script generators`);
  }

  /**
   * Initializes workflow phases
   */
  private initializeWorkflowPhases(): void {
    // Phase 1: Analysis and Preparation
    this.phases.set('analysis', {
      id: 'analysis',
      name: 'Error Analysis',
      description: 'Analyze TypeScript errors and categorize them',
      dependencies: [],
      required: true,
      execute: async (context) => {
        this.logger.info('PHASE', 'Starting error analysis...');
        
        // Get all TypeScript files if not specified
        const files = await this.getTypeScriptFiles(context.config.projectRoot);
        
        // Analyze errors
        context.initialErrors = await this.errorAnalyzer.analyzeProject(context.config.projectRoot);
        context.currentErrors = [...context.initialErrors];
        
        this.logger.info('PHASE', `Found ${context.initialErrors.length} errors across ${files.length} files`);
        
        // Initialize progress monitoring
        this.progressMonitor = new ProgressMonitor(context.initialErrors.length);
      }
    });

    // Phase 2: Backup Creation
    this.phases.set('backup', {
      id: 'backup',
      name: 'Backup Creation',
      description: 'Create backup checkpoint before making changes',
      dependencies: ['analysis'],
      required: false,
      execute: async (context) => {
        if (!context.config.backupEnabled) {
          this.logger.info('PHASE', 'Backup disabled, skipping...');
          return;
        }

        this.logger.info('PHASE', 'Creating backup checkpoint...');
        
        const files = [...new Set(context.initialErrors.map(e => e.file))];
        const checkpoint = await this.rollbackManager.createCheckpoint(
          'Pre-error-resolution',
          files,
          'Backup before automated error resolution'
        );
        
        context.checkpointId = checkpoint.id;
        this.logger.info('PHASE', `Backup created: ${checkpoint.id}`);
      }
    });

    // Phase 3: Script Generation and Execution
    this.phases.set('execution', {
      id: 'execution',
      name: 'Error Resolution Execution',
      description: 'Generate and execute error fixing scripts',
      dependencies: ['analysis', 'backup'],
      required: true,
      execute: async (context) => {
        this.logger.info('PHASE', 'Starting error resolution execution...');
        
        // Create execution context
        const executionContext: ExecutionContext = {
          projectRoot: context.config.projectRoot,
          dryRun: context.config.dryRun,
          backupEnabled: context.config.backupEnabled,
          validationEnabled: context.config.validationEnabled,
          timeoutSeconds: context.config.timeoutSeconds,
          maxRetries: context.config.maxRetries,
          rollbackOnFailure: context.config.rollbackOnFailure
        };

        // Create execution plan
        const plan = await this.executionOrchestrator.createExecutionPlan(
          context.currentErrors,
          executionContext
        );

        // Execute the plan
        context.executionResult = await this.executionOrchestrator.executePlan(executionContext);
        
        // Update current errors based on execution result
        context.currentErrors = context.initialErrors.slice(context.executionResult.errorsFixed);
        
        this.logger.info('PHASE', 
          `Execution completed: ${context.executionResult.errorsFixed} errors fixed, ` +
          `${context.executionResult.errorsRemaining} remaining`
        );
      }
    });

    // Phase 4: Validation
    this.phases.set('validation', {
      id: 'validation',
      name: 'Validation',
      description: 'Validate the results of error resolution',
      dependencies: ['execution'],
      required: false,
      execute: async (context) => {
        if (!context.config.validationEnabled) {
          this.logger.info('PHASE', 'Validation disabled, skipping...');
          return;
        }

        this.logger.info('PHASE', 'Starting validation...');
        
        const files = [...new Set(context.initialErrors.map(e => e.file))];
        
        // Run TypeScript compilation validation
        const tsValidation = await this.validationEngine.runSuite('typescript-basic', { files });
        context.validationResults.push(tsValidation);
        
        // Run code quality validation
        const qualityValidation = await this.validationEngine.runSuite('code-quality', { files });
        context.validationResults.push(qualityValidation);
        
        // Check if validation failed and rollback is needed
        const hasFailures = context.validationResults.some(r => !r.overallSuccess);
        if (hasFailures && !context.config.continueOnValidationFailure) {
          throw new Error('Validation failed and continueOnValidationFailure is false');
        }
        
        this.logger.info('PHASE', `Validation completed: ${context.validationResults.length} suites run`);
      }
    });

    // Phase 5: Error Count Verification
    this.phases.set('verification', {
      id: 'verification',
      name: 'Error Count Verification',
      description: 'Verify that error count has actually improved',
      dependencies: ['validation'],
      required: true,
      execute: async (context) => {
        this.logger.info('PHASE', 'Verifying error count improvement...');
        
        // Re-analyze errors to get current count
        const currentErrors = await this.errorAnalyzer.analyzeProject(context.config.projectRoot);
        context.currentErrors = currentErrors;
        
        const improvement = context.initialErrors.length - currentErrors.length;
        
        if (improvement <= 0 && currentErrors.length > 0) {
          this.logger.warn('PHASE', `No improvement detected: ${context.initialErrors.length} → ${currentErrors.length}`);
        } else {
          this.logger.info('PHASE', `Error count improved: ${context.initialErrors.length} → ${currentErrors.length} (${improvement} fixed)`);
        }
      }
    });

    // Phase 6: Report Generation
    this.phases.set('reporting', {
      id: 'reporting',
      name: 'Report Generation',
      description: 'Generate comprehensive error resolution report',
      dependencies: ['verification'],
      required: false,
      execute: async (context) => {
        if (!context.config.generateReports) {
          this.logger.info('PHASE', 'Report generation disabled, skipping...');
          return;
        }

        this.logger.info('PHASE', 'Generating reports...');
        
        if (!context.executionResult) {
          throw new Error('No execution result available for reporting');
        }

        const report = await this.reportGenerator.generateReport(
          context.initialErrors,
          context.executionResult,
          context.validationResults
        );

        // Export in requested formats
        await this.reportGenerator.exportReport(report.id, context.config.reportFormats);
        
        this.logger.info('PHASE', `Report generated: ${report.id}`);
      }
    });

    this.logger.info('WORKFLOW', `Initialized ${this.phases.size} workflow phases`);
  }

  /**
   * Calculates phase execution order based on dependencies
   */
  private calculatePhaseExecutionOrder(): string[] {
    const phases = Array.from(this.phases.values());
    const ordered: string[] = [];
    const remaining = [...phases];

    while (remaining.length > 0) {
      const readyPhases = remaining.filter(phase =>
        phase.dependencies.every(dep => ordered.includes(dep))
      );

      if (readyPhases.length === 0) {
        throw new Error('Circular dependency detected in workflow phases');
      }

      const nextPhase = readyPhases[0];
      ordered.push(nextPhase.id);
      remaining.splice(remaining.indexOf(nextPhase), 1);
    }

    return ordered;
  }

  /**
   * Gets all TypeScript files in a project
   */
  private async getTypeScriptFiles(projectRoot: string): Promise<string[]> {
    const files: string[] = [];
    
    const searchDir = async (dir: string): Promise<void> => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules and other common directories
          if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
            await searchDir(fullPath);
          }
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      }
    };

    await searchDir(projectRoot);
    return files;
  }

  /**
   * Formats duration in human readable format
   */
  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Adds a custom workflow phase
   */
  public addPhase(phase: WorkflowPhase): void {
    this.phases.set(phase.id, phase);
    this.logger.info('WORKFLOW', `Added custom phase: ${phase.name}`);
  }

  /**
   * Removes a workflow phase
   */
  public removePhase(phaseId: string): void {
    if (this.phases.delete(phaseId)) {
      this.logger.info('WORKFLOW', `Removed phase: ${phaseId}`);
    }
  }

  /**
   * Gets workflow statistics
   */
  public getStatistics(): {
    totalPhases: number;
    totalGenerators: number;
    isWorkflowRunning: boolean;
    components: {
      errorAnalyzer: boolean;
      executionOrchestrator: boolean;
      validationEngine: boolean;
      reportGenerator: boolean;
      rollbackManager: boolean;
      processMonitor: boolean;
    };
  } {
    return {
      totalPhases: this.phases.size,
      totalGenerators: this.generators.size,
      isWorkflowRunning: this.currentWorkflow !== null,
      components: {
        errorAnalyzer: !!this.errorAnalyzer,
        executionOrchestrator: !!this.executionOrchestrator,
        validationEngine: !!this.validationEngine,
        reportGenerator: !!this.reportGenerator,
        rollbackManager: !!this.rollbackManager,
        processMonitor: !!this.processMonitor
      }
    };
  }
}