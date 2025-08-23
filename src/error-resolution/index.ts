// Main entry point for the TypeScript Error Resolution System

export { ErrorAnalyzer } from './core/ErrorAnalyzer';
export { ExecutionOrchestrator } from './core/ExecutionOrchestrator';
export { ValidationEngine } from './core/ValidationEngine';
export { ReportGenerator } from './core/ReportGenerator';
export { RollbackManager } from './core/RollbackManager';
export { ProcessMonitor } from './core/ProcessMonitor';
export { ProgressMonitor } from './core/ProgressMonitor';
export { WorkflowCoordinator } from './core/WorkflowCoordinator';
export { CacheManager } from './core/CacheManager';

export { BaseScriptGenerator } from './generators/BaseScriptGenerator';
export { FormattingScriptGenerator } from './generators/FormattingScriptGenerator';
export { SyntaxScriptGenerator } from './generators/SyntaxScriptGenerator';
export { TypeScriptGenerator } from './generators/TypeScriptGenerator';

export { ImportFixer } from './fixers/ImportFixer';
export { TypeFixer } from './fixers/TypeFixer';
export { LogicFixer } from './fixers/LogicFixer';

export { Logger } from './utils/Logger';
export { FileManager } from './utils/FileManager';

export { ConfigManager } from './config/ConfigManager';

export * from './types';

// Main workflow function for easy usage
export async function resolveTypeScriptErrors(
  projectRoot: string,
  options: {
    dryRun?: boolean;
    backupEnabled?: boolean;
    validationEnabled?: boolean;
    generateReports?: boolean;
  } = {}
) {
  const { WorkflowCoordinator } = await import('./core/WorkflowCoordinator');
  const { Logger } = await import('./utils/Logger');
  
  const logger = new Logger();
  const coordinator = new WorkflowCoordinator(logger);
  
  const config = {
    projectRoot,
    dryRun: false,
    backupEnabled: true,
    validationEnabled: true,
    timeoutSeconds: 300,
    maxRetries: 2,
    rollbackOnFailure: true,
    continueOnValidationFailure: false,
    generateReports: true,
    reportFormats: ['json', 'html', 'markdown'] as const,
    ...options
  };
  
  return coordinator.executeWorkflow([], config);
}