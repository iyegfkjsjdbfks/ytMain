import { AnalyzedError, ErrorCategory } from '../core/ErrorAnalyzer';
import { ScriptCommand, FixingScript, ValidationCheck } from '../types';
import { logger } from '../utils/Logger';

export interface ScriptTemplate {
  id: string;
  name: string;
  description: string;
  targetErrorTypes: string[];
  commands: ScriptCommand[];
  validationChecks: ValidationCheck[];
  parameters?: Record<string, any>;
}

export interface GenerationContext {
  errors: AnalyzedError[];
  projectRoot: string;
  dryRun: boolean;
  safetyChecks: boolean;
}

export abstract class BaseScriptGenerator {
  protected templates: Map<string, ScriptTemplate> = new Map();
  
  constructor(protected category: string) {
    this.initializeTemplates();
  }

  /**
   * Generates fixing scripts for the given errors
   */
  public async generateScripts(
    errors: AnalyzedError[], 
    context: GenerationContext
  ): Promise<FixingScript[]> {
    logger.info(`Generating ${this.category} scripts for ${errors.length} errors`, 'script-generator');
    
    const scripts: FixingScript[] = [];
    const errorGroups = this.groupErrorsByPattern(errors);

    for (const [pattern, groupedErrors] of errorGroups.entries()) {
      try {
        const script = await this.generateScriptForGroup(pattern, groupedErrors, context);
        if (script) {
          scripts.push(script);
        }
      } catch (error) {
        logger.error(`Failed to generate script for pattern ${pattern}: ${error}`, 'script-generator');
      }
    }

    logger.info(`Generated ${scripts.length} ${this.category} scripts`, 'script-generator');
    return scripts;
  }

  /**
   * Validates that a script can be safely executed
   */
  public async validateScript(script: FixingScript): Promise<boolean> {
    logger.debug(`Validating script: ${script.id}`, 'script-generator');
    
    try {
      // Check if all target files exist
      for (const error of script.targetErrors) {
        if (!await this.fileExists(error.file)) {
          logger.warn(`Target file does not exist: ${error.file}`, 'script-generator');
          return false;
        }
      }

      // Validate commands
      for (const command of script.commands) {
        if (!await this.validateCommand(command)) {
          logger.warn(`Invalid command in script ${script.id}`, 'script-generator');
          return false;
        }
      }

      // Run validation checks
      for (const check of script.validationChecks) {
        if (!await this.runValidationCheck(check)) {
          logger.warn(`Validation check failed for script ${script.id}`, 'script-generator');
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error(`Script validation failed: ${error}`, 'script-generator');
      return false;
    }
  }

  /**
   * Gets available templates for this generator
   */
  public getTemplates(): ScriptTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Gets a specific template by ID
   */
  public getTemplate(id: string): ScriptTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Abstract method to initialize templates - must be implemented by subclasses
   */
  protected abstract initializeTemplates(): void;

  /**
   * Abstract method to generate script for a group of errors
   */
  protected abstract generateScriptForGroup(
    pattern: string,
    errors: AnalyzedError[],
    context: GenerationContext
  ): Promise<FixingScript | null>;

  /**
   * Groups errors by their patterns for batch processing
   */
  protected groupErrorsByPattern(errors: AnalyzedError[]): Map<string, AnalyzedError[]> {
    const groups = new Map<string, AnalyzedError[]>();

    for (const error of errors) {
      const pattern = this.getErrorPattern(error);
      
      if (!groups.has(pattern)) {
        groups.set(pattern, []);
      }
      
      groups.get(pattern)!.push(error);
    }

    return groups;
  }

  /**
   * Gets a pattern identifier for an error
   */
  protected getErrorPattern(error: AnalyzedError): string {
    // Default implementation uses error code + category
    return `${error.code}-${error.category.name}`;
  }

  /**
   * Creates a basic fixing script structure
   */
  protected createBaseScript(
    id: string,
    category: string,
    errors: AnalyzedError[],
    commands: ScriptCommand[]
  ): FixingScript {
    return {
      id,
      category,
      targetErrors: errors,
      commands,
      rollbackCommands: this.generateRollbackCommands(commands),
      validationChecks: this.generateValidationChecks(errors),
      estimatedRuntime: this.estimateRuntime(commands)
    };
  }

  /**
   * Generates rollback commands for the given commands
   */
  protected generateRollbackCommands(commands: ScriptCommand[]): ScriptCommand[] {
    const rollbackCommands: ScriptCommand[] = [];

    // Generate rollback commands in reverse order
    for (let i = commands.length - 1; i >= 0; i--) {
      const command = commands[i];
      const rollback = this.createRollbackCommand(command);
      
      if (rollback) {
        rollbackCommands.push(rollback);
      }
    }

    return rollbackCommands;
  }

  /**
   * Creates a rollback command for a given command
   */
  protected createRollbackCommand(command: ScriptCommand): ScriptCommand | null {
    switch (command.type) {
      case 'replace':
        // For replace operations, we need to store the original content
        return {
          type: 'replace',
          file: command.file,
          pattern: command.replacement ? new RegExp(this.escapeRegex(command.replacement)) : undefined,
          replacement: command.pattern?.source || '',
          description: `Rollback: ${command.description}`
        };
      
      case 'insert':
        // For insert operations, we need to delete the inserted content
        return {
          type: 'delete',
          file: command.file,
          pattern: command.replacement ? new RegExp(this.escapeRegex(command.replacement)) : undefined,
          description: `Rollback: ${command.description}`
        };
      
      case 'delete':
        // Delete operations are harder to rollback without backup
        logger.warn('Delete operations cannot be automatically rolled back', 'script-generator');
        return null;
      
      default:
        return null;
    }
  }

  /**
   * Generates validation checks for errors
   */
  protected generateValidationChecks(errors: AnalyzedError[]): ValidationCheck[] {
    const checks: ValidationCheck[] = [];

    // Add TypeScript compilation check
    checks.push({
      type: 'compilation',
      command: 'npx tsc --noEmit --skipLibCheck',
      expectedResult: 'success',
      timeoutSeconds: 120
    });

    // Add syntax check for each affected file
    const uniqueFiles = [...new Set(errors.map(e => e.file))];
    
    for (const file of uniqueFiles.slice(0, 5)) { // Limit to first 5 files
      checks.push({
        type: 'syntax',
        command: `npx tsc --noEmit --skipLibCheck ${file}`,
        expectedResult: 'improved-count',
        timeoutSeconds: 30
      });
    }

    return checks;
  }

  /**
   * Estimates runtime for commands
   */
  protected estimateRuntime(commands: ScriptCommand[]): number {
    // Basic estimation: 2 seconds per command + 1 second per file operation
    let estimate = commands.length * 2;
    
    const uniqueFiles = new Set(commands.map(c => c.file));
    estimate += uniqueFiles.size * 1;
    
    return estimate;
  }

  /**
   * Validates a single command
   */
  protected async validateCommand(command: ScriptCommand): Promise<boolean> {
    // Check if file exists
    if (!await this.fileExists(command.file)) {
      return false;
    }

    // Validate command structure
    switch (command.type) {
      case 'replace':
        return !!(command.pattern && command.replacement !== undefined);
      
      case 'insert':
        return !!(command.replacement && command.position);
      
      case 'delete':
        return !!command.pattern;
      
      case 'move':
        return !!(command.file && command.position);
      
      default:
        return false;
    }
  }

  /**
   * Runs a validation check
   */
  protected async runValidationCheck(check: ValidationCheck): Promise<boolean> {
    // In a real implementation, this would execute the command and check results
    // For now, we'll just validate the check structure
    return !!(check.command && check.expectedResult && check.timeoutSeconds > 0);
  }

  /**
   * Checks if a file exists
   */
  protected async fileExists(filePath: string): Promise<boolean> {
    try {
      const fs = await import('fs');
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Escapes special regex characters
   */
  protected escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Creates a parameterized template
   */
  protected createTemplate(
    id: string,
    name: string,
    description: string,
    targetErrorTypes: string[],
    commandFactory: (params: Record<string, any>) => ScriptCommand[],
    validationFactory?: (params: Record<string, any>) => ValidationCheck[]
  ): ScriptTemplate {
    return {
      id,
      name,
      description,
      targetErrorTypes,
      commands: [], // Will be populated by factory
      validationChecks: validationFactory ? validationFactory({}) : [],
      parameters: {}
    };
  }

  /**
   * Applies template parameters to generate actual commands
   */
  protected applyTemplate(
    template: ScriptTemplate,
    parameters: Record<string, any>
  ): { commands: ScriptCommand[]; validationChecks: ValidationCheck[] } {
    // This is a simplified implementation
    // In a real scenario, you'd have a more sophisticated templating system
    
    const commands = template.commands.map(cmd => ({
      ...cmd,
      file: this.substituteParameters(cmd.file, parameters),
      replacement: cmd.replacement ? this.substituteParameters(cmd.replacement, parameters) : undefined,
      description: this.substituteParameters(cmd.description, parameters)
    }));

    const validationChecks = template.validationChecks.map(check => ({
      ...check,
      command: this.substituteParameters(check.command, parameters)
    }));

    return { commands, validationChecks };
  }

  /**
   * Substitutes parameters in a string template
   */
  protected substituteParameters(template: string, parameters: Record<string, any>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(parameters)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }
    
    return result;
  }

  /**
   * Merges multiple script commands, removing duplicates
   */
  protected mergeCommands(commandSets: ScriptCommand[][]): ScriptCommand[] {
    const merged: ScriptCommand[] = [];
    const seen = new Set<string>();

    for (const commands of commandSets) {
      for (const command of commands) {
        const key = `${command.type}-${command.file}-${command.pattern?.source || ''}-${command.replacement || ''}`;
        
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(command);
        }
      }
    }

    return merged;
  }
}