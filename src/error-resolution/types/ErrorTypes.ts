import React from 'react';
/**
 * Core TypeScript Error Resolution System - Type Definitions;
 * 
 * This module defines the fundamental data structures for the intelligent;
 * TypeScript error resolution system.
 */

// Root cause categories with fixing priorities;
export enum ErrorRootCause {
  FORMATTING = 1,    // Highest priority - safe to fix first;
  SYNTAX = 2,        // Second priority - enables other fixes;
  IMPORT = 3,        // Third priority - resolves dependencies;
  TYPE = 4,          // Fourth priority - complex type issues;
  LOGIC = 5          // Lowest priority - requires careful analysis;
}

// Error severity levels;
export enum ErrorSeverity {
  CRITICAL = 'critical',  // Blocks compilation completely;
  HIGH = 'high',         // Causes major functionality issues;
  MEDIUM = 'medium',     // Causes minor issues or warnings;
  LOW = 'low'           // Style or optimization issues;
}

// Error categorization interface;
export interface ErrorCategory {
  name: string;
  priority: number;
  pattern: RegExp;
  rootCause: ErrorRootCause;
  fixingStrategy: 'bulk' | 'individual' | 'template';
  description: string;
}

// Analyzed error interface;
export interface AnalyzedError {
  id: string;
  file: string;
  line: number;
  column: number;
  message: string;
  code: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  dependencies: string[];
  rawOutput: string;
}

// Error analysis result;
export interface ErrorAnalysisResult {
  totalErrors: number;
  errorsByCategory: Map<string, AnalyzedError[]>;
  errorsByFile: Map<string, AnalyzedError[]>;
  errorsBySeverity: Map<ErrorSeverity, AnalyzedError[]>;
  analysisTimestamp: Date;
  summary: ErrorSummary;
}

// Error summary statistics;
export interface ErrorSummary {
  criticalErrors: number;
  highPriorityErrors: number;
  mediumPriorityErrors: number;
  lowPriorityErrors: number;
  formattingErrors: number;
  syntaxErrors: number;
  importErrors: number;
  typeErrors: number;
  logicErrors: number;
  filesAffected: number;
}

// Script command types;
export interface ScriptCommand {
  type: 'replace' | 'insert' | 'delete' | 'move';
  file: string;
  pattern?: RegExp;
  replacement?: string;
  position?: { line: number; column: number };
  description: string;
}

// Fixing script interface;
export interface FixingScript {
  id: string;
  category: string;
  targetErrors: AnalyzedError[];
  commands: ScriptCommand[];
  rollbackCommands: ScriptCommand[];
  validationChecks: ValidationCheck[];
  estimatedRuntime: number;
}

// Validation check interface;
export interface ValidationCheck {
  type: 'syntax' | 'compilation' | 'test' | 'lint';
  command: string;
  expectedResult: 'success' | 'zero-errors' | 'improved-count';
  timeoutSeconds: number;
}

// Progress monitoring interfaces;
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

// Execution state management;
export interface ExecutionState {
  sessionId: string;
  startTime: Date;
  currentPhase: ExecutionPhase;
  completedPhases: ExecutionPhase[];
  errorCounts: Record<string, number>;
  appliedFixes: AppliedFix[];
  rollbackStack: RollbackAction[];
}

export interface ExecutionPhase {
  name: string;
  priority: number;
  scripts: FixingScript[];
  prerequisites: string[];
  successCriteria: ValidationCheck[];
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
  type: 'file' | 'script' | 'phase';
  targetFiles: string[];
  backupPath: string;
  description: string;
}