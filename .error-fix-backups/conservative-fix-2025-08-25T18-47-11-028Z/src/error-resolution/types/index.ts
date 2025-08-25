export interface ErrorPattern {
  code: string;
  name: string;
  description: string;
  priority: number;
  strategy: string;
  examples: string[];
}

export interface ErrorAnalysis {
  totalErrors: number;
  categories: Map<string, ErrorCategory>;
  fileGroups: Map<string, TypeScriptError[]>;
  codeGroups: Map<string, TypeScriptError[]>;
}

export interface ErrorCategory {
  name: string;
  priority: number;
  description: string;
  strategy: string;
  errors: TypeScriptError[];
}

export interface TypeScriptError {
  file: string;
  line: number;
  column: number;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ResolutionResult {
  success: boolean;
  errorsFixed: number;
  errorsRemaining: number;
  duration: number;
  phase: string;
  details: string[];
}

export interface DeploymentOptions {
  dryRun: boolean;
  backup: boolean;
  generateReports: boolean;
  timeoutSeconds: number;
  projectPath: string;
}

export interface SystemComponents {
  ExecutionOrchestrator: boolean;
  ProcessMonitor: boolean;
  ReportGenerator: boolean;
  RollbackManager: boolean;
  ValidationEngine: boolean;
  WorkflowCoordinator: boolean;
  ImportFixer: boolean;
  TypeFixer: boolean;
  LogicFixer: boolean;
}

export default {
  ErrorPattern,
  ErrorAnalysis,
  ErrorCategory,
  TypeScriptError,
  ResolutionResult,
  DeploymentOptions,
  SystemComponents
};