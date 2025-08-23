# TypeScript Error Resolution API Documentation

This document provides comprehensive API documentation for the TypeScript Error Resolution system.

## Table of Contents

- [Core Classes](#core-classes)
- [Generators](#generators)
- [Fixers](#fixers)
- [Utilities](#utilities)
- [Types](#types)
- [Configuration](#configuration)
- [Examples](#examples)

## Core Classes

### WorkflowCoordinator

The main orchestrator that coordinates the entire error resolution workflow.

```typescript
import { WorkflowCoordinator } from 'typescript-error-resolution';

const coordinator = new WorkflowCoordinator(logger?);
```

#### Methods

##### `executeWorkflow(files: string[], config: WorkflowConfig): Promise<WorkflowResult>`

Executes the complete error resolution workflow.

**Parameters:**
- `files`: Array of file paths to process (empty array processes all TypeScript files)
- `config`: Workflow configuration object

**Returns:** Promise resolving to WorkflowResult

**Example:**
```typescript
const result = await coordinator.executeWorkflow([], {
  projectRoot: './my-project',
  dryRun: false,
  backupEnabled: true,
  validationEnabled: true,
  timeoutSeconds: 300,
  maxRetries: 2,
  rollbackOnFailure: true,
  continueOnValidationFailure: false,
  generateReports: true,
  reportFormats: ['json', 'html', 'markdown']
});
```

##### `addPhase(phase: WorkflowPhase): void`

Adds a custom workflow phase.

##### `removePhase(phaseId: string): void`

Removes a workflow phase.

##### `getCurrentWorkflowStatus(): WorkflowStatus`

Gets the current workflow execution status.

##### `stopWorkflow(reason?: string): Promise<void>`

Stops the currently running workflow.

### ErrorAnalyzer

Analyzes TypeScript compilation errors and categorizes them.

```typescript
import { ErrorAnalyzer } from 'typescript-error-resolution';

const analyzer = new ErrorAnalyzer(logger?);
```

#### Methods

##### `analyzeProject(projectRoot: string): Promise<AnalyzedError[]>`

Analyzes all TypeScript errors in a project.

##### `analyzeFiles(files: string[]): Promise<AnalyzedError[]>`

Analyzes specific files for TypeScript errors.

##### `categorizeErrors(errors: AnalyzedError[]): Record<string, number>`

Categorizes errors by type and returns counts.

### ExecutionOrchestrator

Orchestrates the execution of error-fixing scripts in phases.

```typescript
import { ExecutionOrchestrator } from 'typescript-error-resolution';

const orchestrator = new ExecutionOrchestrator(logger?);
```

#### Methods

##### `createExecutionPlan(errors: AnalyzedError[], context: ExecutionContext): Promise<ExecutionPlan>`

Creates an execution plan for fixing errors.

##### `executePlan(context: ExecutionContext): Promise<ExecutionResult>`

Executes the current execution plan.

##### `registerGenerator(category: string, generator: BaseScriptGenerator): void`

Registers a script generator for a specific error category.

### ValidationEngine

Provides multi-stage validation capabilities.

```typescript
import { ValidationEngine } from 'typescript-error-resolution';

const validator = new ValidationEngine(config?, logger?);
```

#### Methods

##### `runSuite(suiteId: string, context: any): Promise<ValidationReport>`

Runs a validation suite.

##### `validateTypeScriptCompilation(files: string[]): Promise<ValidationResult>`

Validates TypeScript compilation.

##### `validateESLint(files: string[]): Promise<ValidationResult>`

Validates ESLint rules.

##### `validatePrettier(files: string[]): Promise<ValidationResult>`

Validates Prettier formatting.

### ReportGenerator

Generates comprehensive error resolution reports.

```typescript
import { ReportGenerator } from 'typescript-error-resolution';

const generator = new ReportGenerator(config?, logger?);
```

#### Methods

##### `generateReport(initialErrors: AnalyzedError[], executionResult: ExecutionResult, validationResults: ValidationReport[]): Promise<ErrorResolutionReport>`

Generates a comprehensive error resolution report.

##### `exportReport(reportId: string, formats: string[]): Promise<string[]>`

Exports a report in multiple formats.

### RollbackManager

Manages backup creation and rollback operations.

```typescript
import { RollbackManager } from 'typescript-error-resolution';

const rollbackManager = new RollbackManager(backupDir?, maxCheckpoints?, gitEnabled?, logger?);
```

#### Methods

##### `createCheckpoint(name: string, files: string[], description?: string): Promise<Checkpoint>`

Creates a backup checkpoint.

##### `rollbackToCheckpoint(checkpointId: string, reason: string): Promise<RollbackOperation>`

Rolls back to a specific checkpoint.

##### `getRecoveryPoints(): Promise<RecoveryPoint[]>`

Gets all available recovery points.

## Generators

### BaseScriptGenerator

Abstract base class for all script generators.

```typescript
import { BaseScriptGenerator } from 'typescript-error-resolution';

class CustomGenerator extends BaseScriptGenerator {
  public getCategory(): string {
    return 'Custom';
  }
  
  public canHandle(errors: AnalyzedError[]): boolean {
    return errors.some(error => /* custom logic */);
  }
  
  protected initializeTemplates(): void {
    // Initialize error-specific templates
  }
}
```

### FormattingScriptGenerator

Generates scripts for formatting and linting fixes.

```typescript
import { FormattingScriptGenerator } from 'typescript-error-resolution';

const generator = new FormattingScriptGenerator(logger?);
```

### SyntaxScriptGenerator

Generates scripts for syntax error fixes.

```typescript
import { SyntaxScriptGenerator } from 'typescript-error-resolution';

const generator = new SyntaxScriptGenerator(logger?);
```

### TypeScriptGenerator

Generates scripts for TypeScript-specific error fixes.

```typescript
import { TypeScriptGenerator } from 'typescript-error-resolution';

const generator = new TypeScriptGenerator(logger?);
```

## Fixers

### ImportFixer

Fixes import and module resolution errors.

```typescript
import { ImportFixer } from 'typescript-error-resolution';

const fixer = new ImportFixer(projectRoot, logger?);
```

#### Methods

##### `fixImportErrors(errors: AnalyzedError[]): Promise<ScriptCommand[]>`

Generates commands to fix import-related errors.

##### `analyzeImportError(error: AnalyzedError): Promise<ImportFixSuggestion[]>`

Analyzes a specific import error and suggests fixes.

### TypeFixer

Fixes type system errors.

```typescript
import { TypeFixer } from 'typescript-error-resolution';

const fixer = new TypeFixer(projectRoot, logger?);
```

### LogicFixer

Fixes logic and runtime errors.

```typescript
import { LogicFixer } from 'typescript-error-resolution';

const fixer = new LogicFixer(projectRoot, logger?);
```

## Utilities

### Logger

Comprehensive logging system with multiple output formats.

```typescript
import { Logger } from 'typescript-error-resolution';

const logger = new Logger(config?);
```

#### Methods

##### `debug(category: string, message: string, metadata?: any): void`
##### `info(category: string, message: string, metadata?: any): void`
##### `warn(category: string, message: string, metadata?: any): void`
##### `error(category: string, message: string, error?: Error, metadata?: any): void`

### ConfigManager

Manages system configuration.

```typescript
import { ConfigManager } from 'typescript-error-resolution';

const configManager = new ConfigManager(configPath?, logger?);
```

#### Methods

##### `loadConfig(): Promise<ErrorResolutionConfig>`
##### `saveConfig(config?: Partial<ErrorResolutionConfig>): Promise<void>`
##### `updateConfig(updates: Partial<ErrorResolutionConfig>): void`

## Types

### Core Types

```typescript
interface AnalyzedError {
  file: string;
  line: number;
  column: number;
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  category: ErrorCategory;
}

interface ErrorCategory {
  primary: string;
  secondary: string;
  rootCause: ErrorRootCause;
}

interface ScriptCommand {
  type: 'replace' | 'insert' | 'delete' | 'move' | 'copy';
  file: string;
  pattern?: RegExp;
  replacement?: string;
  position?: { line: number; column: number };
  targetFile?: string;
  description: string;
}

interface FixingScript {
  id: string;
  category: string;
  targetErrors: AnalyzedError[];
  commands: ScriptCommand[];
  rollbackCommands: ScriptCommand[];
  validationChecks: ValidationCheck[];
  estimatedRuntime: number;
}
```

### Configuration Types

```typescript
interface WorkflowConfig {
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

interface ErrorResolutionConfig {
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
  customPatterns: CustomErrorPattern[];
  plugins: PluginConfig[];
}
```

### Result Types

```typescript
interface WorkflowResult {
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

interface ValidationReport {
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
```

## Configuration

### Basic Configuration

```typescript
const config: WorkflowConfig = {
  projectRoot: './my-project',
  dryRun: false,
  backupEnabled: true,
  validationEnabled: true,
  timeoutSeconds: 300,
  maxRetries: 2,
  rollbackOnFailure: true,
  continueOnValidationFailure: false,
  generateReports: true,
  reportFormats: ['json', 'html', 'markdown']
};
```

### Advanced Configuration with Plugins

```typescript
const advancedConfig: ErrorResolutionConfig = {
  // ... basic config
  customPatterns: [
    {
      id: 'custom-pattern',
      name: 'Custom Error Pattern',
      pattern: 'TS\\d+: Custom error',
      category: 'Custom',
      fixTemplate: 'Custom fix template',
      enabled: true
    }
  ],
  plugins: [
    {
      name: 'custom-plugin',
      path: './plugins/custom-plugin.js',
      enabled: true,
      options: {
        customOption: 'value'
      }
    }
  ]
};
```

## Examples

### Simple Usage

```typescript
import { resolveTypeScriptErrors } from 'typescript-error-resolution';

const result = await resolveTypeScriptErrors('./my-project', {
  dryRun: false,
  backupEnabled: true,
  validationEnabled: true,
  generateReports: true
});

console.log(`Fixed ${result.errorsFixed} out of ${result.initialErrorCount} errors`);
```

### Advanced Usage with Custom Workflow

```typescript
import { WorkflowCoordinator, ErrorAnalyzer } from 'typescript-error-resolution';

const coordinator = new WorkflowCoordinator();
const analyzer = new ErrorAnalyzer();

// Analyze errors first
const errors = await analyzer.analyzeProject('./my-project');
console.log(`Found ${errors.length} errors`);

// Execute workflow
const result = await coordinator.executeWorkflow([], {
  projectRoot: './my-project',
  dryRun: false,
  backupEnabled: true,
  validationEnabled: true,
  timeoutSeconds: 600,
  maxRetries: 3,
  rollbackOnFailure: true,
  continueOnValidationFailure: false,
  generateReports: true,
  reportFormats: ['json', 'html']
});
```

### Custom Plugin Development

```typescript
import { BaseScriptGenerator } from 'typescript-error-resolution';

class MyCustomGenerator extends BaseScriptGenerator {
  public getCategory(): string {
    return 'MyCustomCategory';
  }
  
  public canHandle(errors: AnalyzedError[]): boolean {
    return errors.some(error => error.message.includes('my-custom-pattern'));
  }
  
  protected initializeTemplates(): void {
    this.addTemplate({
      id: 'my-custom-fix',
      name: 'My Custom Fix',
      description: 'Fixes my custom error pattern',
      pattern: /my-custom-pattern/i,
      commands: [{
        type: 'replace',
        file: '',
        pattern: /old-pattern/g,
        replacement: 'new-pattern',
        description: 'Replace old pattern with new pattern'
      }],
      validationChecks: [{
        type: 'compilation',
        command: 'npx tsc --noEmit {file}',
        expectedResult: 'zero-errors',
        timeoutSeconds: 30
      }]
    });
  }
}

// Register the custom generator
const coordinator = new WorkflowCoordinator();
coordinator.registerGenerator('MyCustomCategory', new MyCustomGenerator());
```

## Error Handling

All methods that can fail return Promises that may reject with specific error types:

```typescript
try {
  const result = await resolveTypeScriptErrors('./my-project');
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.message);
  } else if (error instanceof RollbackError) {
    console.error('Rollback failed:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Events

The system emits events that you can listen to:

```typescript
const coordinator = new WorkflowCoordinator();

coordinator.on('phaseStarted', (phase) => {
  console.log(`Phase started: ${phase.name}`);
});

coordinator.on('phaseCompleted', (phase) => {
  console.log(`Phase completed: ${phase.name}`);
});

coordinator.on('workflowCompleted', (result) => {
  console.log(`Workflow completed: ${result.success}`);
});
```

## Performance Considerations

- **Batch Processing**: The system processes errors in batches for optimal performance
- **Caching**: Module resolution and file analysis results are cached
- **Parallel Execution**: Validation checks run in parallel when possible
- **Memory Management**: Large files are processed in streams to minimize memory usage
- **Timeout Protection**: All operations have configurable timeouts to prevent hanging

## Best Practices

1. **Always Enable Backups**: Set `backupEnabled: true` for safety
2. **Use Dry Run First**: Test with `dryRun: true` before applying changes
3. **Enable Validation**: Keep `validationEnabled: true` to ensure quality
4. **Monitor Progress**: Listen to events for real-time progress updates
5. **Handle Errors Gracefully**: Implement proper error handling for production use
6. **Configure Timeouts**: Set appropriate timeouts based on project size
7. **Use Reports**: Enable report generation for audit trails