// Re-export all types from the core analyzer
export {
  ErrorRootCause,
  ErrorSeverity,
  ErrorCategory,
  AnalyzedError,
  ErrorAnalysisResult
} from '../core/ErrorAnalyzer';

// Additional types for script generation and execution
export interface ScriptCommand {
  type: 'replace' | 'insert' | 'delete' | 'move';
  file: string;
  pattern?: RegExp;
  replacement?: string;
  position?: { line: number; column: number };
  description: string;
}

export interface FixingScript {
  id: string;
  category: string;
  targetErrors: AnalyzedError[];
  commands: ScriptCommand[];
  rollbackCommands: ScriptCommand[];
  validationChecks: ValidationCheck[];
  estimatedRuntime: number;
}

export interface ValidationCheck {
  type: 'syntax' | 'compilation' | 'test' | 'lint';
  command: string;
  expectedResult: 'success' | 'zero-errors' | 'improved-count';
  timeoutSeconds: number;
}

export interface ExecutionPlan {
  phases: ExecutionPhase[];
  totalErrors: number;
  estimatedDuration: number;
  rollbackStrategy: RollbackPlan;
}

export interface ExecutionPhase {
  name: string;
  priority: number;
  scripts: FixingScript[];
  prerequisites: string[];
  successCriteria: ValidationCheck[];
}

export interface RollbackPlan {
  levels: RollbackLevel[];
  automaticTriggers: RollbackTrigger[];
  manualOverrides: boolean;
}

export enum RollbackLevel {
  SCRIPT_LEVEL = 'script',     // Rollback single script changes
  PHASE_LEVEL = 'phase',       // Rollback entire phase changes
  SESSION_LEVEL = 'session'    // Rollback all session changes
}

export interface RollbackTrigger {
  condition: 'compilation_failure' | 'test_failure' | 'timeout' | 'manual';
  level: RollbackLevel;
  maxRetries: number;
}

export interface ProgressMonitor {
  startTime: Date;
  currentPhase: string;
  errorsFixed: number;
  errorsRemaining: number;
  estimatedCompletion: Date;
  performanceMetrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  averageFixTime: number;
  successRate: number;
  rollbackCount: number;
  timeoutCount: number;
}

export interface ExecutionState {
  sessionId: string;
  startTime: Date;
  currentPhase: ExecutionPhase | null;
  completedPhases: ExecutionPhase[];
  errorCounts: Record<string, number>;
  appliedFixes: AppliedFix[];
  rollbackStack: RollbackAction[];
}

export interface AppliedFix {
  timestamp: Date;
  script: string;
  targetFiles: string[];
  errorsFixed: number;
  newErrorsIntroduced: number;
  rollbackId: string;
}

export interface RollbackAction {
  id: string;
  timestamp: Date;
  type: RollbackLevel;
  affectedFiles: string[];
  backupPath: string;
  description: string;
}

// Import the AnalyzedError type for use in other interfaces
import type { AnalyzedError } from '../core/ErrorAnalyzer';