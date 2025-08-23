import { BaseScriptGenerator, ScriptTemplate, GenerationContext } from './BaseScriptGenerator';
import { AnalyzedError } from '../core/ErrorAnalyzer';
import { FixingScript, ScriptCommand } from '../types';
import { logger } from '../utils/Logger';

export class FormattingScriptGenerator extends BaseScriptGenerator {
  constructor() {
    super('formatting');
  }

  protected initializeTemplates(): void {
    // Template for removing trailing spaces
    this.templates.set('remove-trailing-spaces', {
      id: 'remove-trailing-spaces',
      name: 'Remove Trailing Spaces',
      description: 'Removes trailing whitespace from lines',
      targetErrorTypes: ['trailing-space', 'formatting'],
      commands: [{
        type: 'replace',
        file: '{{file}}',
        pattern: /\s+$/gm,
        replacement: '',
        description: 'Remove trailing spaces from {{file}}'
      }],
      validationChecks: [{
        type: 'lint',
        command: 'npx eslint {{file}} --fix-dry-run',
        expectedResult: 'improved-count',
        timeoutSeconds: 30
      }]
    });

    // Template for adding missing semicolons
    this.templates.set('add-semicolons', {
      id: 'add-semicolons',
      name: 'Add Missing Semicolons',
      description: 'Adds missing semicolons to statements',
      targetErrorTypes: ['TS1005'],
      commands: [{
        type: 'replace',
        file: '{{file}}',
        pattern: /^(\s*(?:const|let|var|return|throw|break|continue|import|export)\s+[^;]+)$/gm,
        replacement: '$1;',
        description: 'Add missing semicolons in {{file}}'
      }],
      validationChecks: [{
        type: 'syntax',
        command: 'npx tsc --noEmit {{file}}',
        expectedResult: 'improved-count',
        timeoutSeconds: 30
      }]
    });

    // Template for adding missing commas
    this.templates.set('add-commas', {
      id: 'add-commas',
      name: 'Add Missing Commas',
      description: 'Adds missing commas in object literals and arrays',
      targetErrorTypes: ['TS1005'],
      commands: [{
        type: 'replace',
        file: '{{file}}',
        pattern: /(\w+:\s*[^,}\]]+)(\s*[\n\r]\s*)([}\]])/gm,
        replacement: '$1,$2$3',
        description: 'Add missing commas in {{file}}'
      }],
      validationChecks: [{
        type: 'syntax',
        command: 'npx tsc --noEmit {{file}}',
        expectedResult: 'improved-count',
        timeoutSeconds: 30
      }]
    });

    // Template for fixing import ordering
    this.templates.set('fix-import-order', {
      id: 'fix-import-order',
      name: 'Fix Import Order',
      description: 'Organizes imports according to ESLint rules',
      targetErrorTypes: ['import-order', 'eslint'],
      commands: [{
        type: 'replace',
        file: '{{file}}',
        pattern: /^(import\s+.*?;?\s*\n)+/gm,
        replacement: '{{organizedImports}}',
        description: 'Organize imports in {{file}}'
      }],
      validationChecks: [{
        type: 'lint',
        command: 'npx eslint {{file}} --rule "import/order: error"',
        expectedResult: 'improved-count',
        timeoutSeconds: 30
      }]
    });

    // Template for removing duplicate imports
    this.templates.set('remove-duplicate-imports', {
      id: 'remove-duplicate-imports',
      name: 'Remove Duplicate Imports',
      description: 'Removes duplicate import statements',
      targetErrorTypes: ['duplicate-import', 'eslint'],
      commands: [{
        type: 'replace',
        file: '{{file}}',
        pattern: /^(import\s+.*from\s+['"][^'"]+['"];?\s*\n)(?=[\s\S]*^\1)/gm,
        replacement: '',
        description: 'Remove duplicate imports from {{file}}'
      }],
      validationChecks: [{
        type: 'syntax',
        command: 'npx tsc --noEmit {{file}}',
        expectedResult: 'success',
        timeoutSeconds: 30
      }]
    });
  }

  protected async generateScriptForGroup(
    pattern: string,
    errors: AnalyzedError[],
    context: GenerationContext
  ): Promise<FixingScript | null> {
    logger.debug(`Generating formatting script for pattern: ${pattern}`, 'formatting-generator');

    const scriptId = `formatting-${pattern}-${Date.now()}`;
    const commands: ScriptCommand[] = [];

    // Group errors by file for efficient processing
    const fileGroups = this.groupErrorsByFile(errors);

    for (const [file, fileErrors] of fileGroups.entries()) {
      const fileCommands = await this.generateCommandsForFile(file, fileErrors, context);
      commands.push(...fileCommands);
    }

    if (commands.length === 0) {
      return null;
    }

    return this.createBaseScript(scriptId, this.category, errors, commands);
  }

  /**
   * Groups errors by file for batch processing
   */
  private groupErrorsByFile(errors: AnalyzedError[]): Map<string, AnalyzedError[]> {
    const groups = new Map<string, AnalyzedError[]>();

    for (const error of errors) {
      if (!groups.has(error.file)) {
        groups.set(error.file, []);
      }
      groups.get(error.file)!.push(error);
    }

    return groups;
  }

  /**
   * Generates commands for a specific file
   */
  private async generateCommandsForFile(
    file: string,
    errors: AnalyzedError[],
    context: GenerationContext
  ): Promise<ScriptCommand[]> {
    const commands: ScriptCommand[] = [];

    // Analyze error types in this file
    const errorTypes = new Set(errors.map(e => e.code));
    const hasTrailingSpaces = errors.some(e => e.message.includes('trailing'));
    const hasMissingSemicolons = errorTypes.has('TS1005') && errors.some(e => e.message.includes("';' expected"));
    const hasMissingCommas = errorTypes.has('TS1005') && errors.some(e => e.message.includes("',' expected"));
    const hasDuplicateImports = errors.some(e => e.message.includes('duplicate') || e.message.includes('import'));

    // Generate appropriate commands based on error analysis
    if (hasTrailingSpaces) {
      commands.push({
        type: 'replace',
        file,
        pattern: /\s+$/gm,
        replacement: '',
        description: `Remove trailing spaces from ${file}`
      });
    }

    if (hasMissingSemicolons) {
      commands.push(...await this.generateSemicolonCommands(file, errors));
    }

    if (hasMissingCommas) {
      commands.push(...await this.generateCommaCommands(file, errors));
    }

    if (hasDuplicateImports) {
      commands.push(...await this.generateImportCleanupCommands(file, errors));
    }

    // Add general formatting command
    commands.push({
      type: 'replace',
      file,
      pattern: /\r\n/g,
      replacement: '\n',
      description: `Normalize line endings in ${file}`
    });

    return commands;
  }

  /**
   * Generates commands to fix missing semicolons
   */
  private async generateSemicolonCommands(file: string, errors: AnalyzedError[]): Promise<ScriptCommand[]> {
    const commands: ScriptCommand[] = [];

    // Find specific lines that need semicolons
    const semicolonErrors = errors.filter(e => 
      e.code === 'TS1005' && e.message.includes("';' expected")
    );

    if (semicolonErrors.length > 0) {
      // Add semicolons to common statement patterns
      commands.push({
        type: 'replace',
        file,
        pattern: /^(\s*(?:const|let|var)\s+[^;=]+=[^;]+)$/gm,
        replacement: '$1;',
        description: `Add semicolons to variable declarations in ${file}`
      });

      commands.push({
        type: 'replace',
        file,
        pattern: /^(\s*(?:return|throw|break|continue)\s+[^;]+)$/gm,
        replacement: '$1;',
        description: `Add semicolons to control statements in ${file}`
      });

      commands.push({
        type: 'replace',
        file,
        pattern: /^(\s*(?:import|export)\s+[^;]+)$/gm,
        replacement: '$1;',
        description: `Add semicolons to import/export statements in ${file}`
      });
    }

    return commands;
  }

  /**
   * Generates commands to fix missing commas
   */
  private async generateCommaCommands(file: string, errors: AnalyzedError[]): Promise<ScriptCommand[]> {
    const commands: ScriptCommand[] = [];

    const commaErrors = errors.filter(e => 
      e.code === 'TS1005' && e.message.includes("',' expected")
    );

    if (commaErrors.length > 0) {
      // Add commas in object literals
      commands.push({
        type: 'replace',
        file,
        pattern: /(\w+:\s*[^,}\]]+)(\s*\n\s*)(\w+:)/gm,
        replacement: '$1,$2$3',
        description: `Add missing commas in object literals in ${file}`
      });

      // Add commas in arrays
      commands.push({
        type: 'replace',
        file,
        pattern: /([^,\[\s][^,\]]*?)(\s*\n\s*)([^,\]\s])/gm,
        replacement: '$1,$2$3',
        description: `Add missing commas in arrays in ${file}`
      });

      // Add commas in function parameters
      commands.push({
        type: 'replace',
        file,
        pattern: /(\w+:\s*\w+)(\s*\n\s*)(\w+:)/gm,
        replacement: '$1,$2$3',
        description: `Add missing commas in function parameters in ${file}`
      });
    }

    return commands;
  }

  /**
   * Generates commands to clean up imports
   */
  private async generateImportCleanupCommands(file: string, errors: AnalyzedError[]): Promise<ScriptCommand[]> {
    const commands: ScriptCommand[] = [];

    // Remove duplicate React imports (common issue)
    commands.push({
      type: 'replace',
      file,
      pattern: /^import\s+React\s*,?\s*\{[^}]*\}\s+from\s+['"]react['"];?\s*\n(?=[\s\S]*^import\s+React)/gm,
      replacement: '',
      description: `Remove duplicate React imports from ${file}`
    });

    // Remove duplicate imports from same module
    commands.push({
      type: 'replace',
      file,
      pattern: /^(import\s+.*from\s+['"]([^'"]+)['"];?\s*\n)(?=[\s\S]*^import\s+.*from\s+['"]\2['"])/gm,
      replacement: '',
      description: `Remove duplicate imports from same modules in ${file}`
    });

    // Consolidate multiple imports from same module
    commands.push({
      type: 'replace',
      file,
      pattern: /^import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]+)['"];?\s*\n^import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]\2['"];?/gm,
      replacement: 'import { $1, $3 } from \'$2\';',
      description: `Consolidate imports from same modules in ${file}`
    });

    return commands;
  }

  /**
   * Gets error pattern specific to formatting issues
   */
  protected getErrorPattern(error: AnalyzedError): string {
    // Create more specific patterns for formatting errors
    if (error.code === 'TS1005') {
      if (error.message.includes("';' expected")) {
        return 'missing-semicolon';
      }
      if (error.message.includes("',' expected")) {
        return 'missing-comma';
      }
      if (error.message.includes("'}' expected")) {
        return 'missing-brace';
      }
    }

    if (error.message.includes('trailing')) {
      return 'trailing-spaces';
    }

    if (error.message.includes('import') || error.message.includes('duplicate')) {
      return 'import-issues';
    }

    return `${error.code}-${error.category.name}`;
  }

  /**
   * Estimates runtime more accurately for formatting operations
   */
  protected estimateRuntime(commands: ScriptCommand[]): number {
    // Formatting operations are generally fast
    let estimate = 0;
    
    for (const command of commands) {
      switch (command.type) {
        case 'replace':
          estimate += 1; // 1 second per replace operation
          break;
        default:
          estimate += 0.5;
      }
    }

    // Add overhead for file I/O
    const uniqueFiles = new Set(commands.map(c => c.file));
    estimate += uniqueFiles.size * 0.5;

    return Math.max(estimate, 5); // Minimum 5 seconds
  }
}