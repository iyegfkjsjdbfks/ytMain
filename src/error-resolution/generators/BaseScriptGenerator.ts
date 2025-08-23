import { AnalyzedError, ScriptCommand, FixingScript, ValidationCheck } from '../types';
import { logger } from '../utils/Logger';

export interface ScriptTemplate {
  id: string;
  name: string;
  description: string;
  parameters: TemplateParameter[];
  commands: ScriptCommand[];
  validationChecks: ValidationCheck[];
}

export interface TemplateParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  description: string;
  required: boolean;
  defaultValue?: any;
}

export interface GenerationContext {
  errors: AnalyzedError[];
  projectRoot: string;
  targetFiles: string[];
  options: Record<string, any>;
}

export abstract class BaseScriptGenerator {
  protected templates: Map<string, ScriptTemplate> = new Map();
  protected generatedScripts: FixingScript[] = [];

  constructor(protected category: string) {
    this.initializeTemplates();
  }

  /**
   * Generates fixing scripts for the given errors
   */
  public async generateScripts(context: GenerationContext): Promise<FixingScript[]> {
    logger.startOperation(`Generating ${this.category} scripts`, {
      errorCount: context.errors.length,
      fileCount: context.targetFiles.length
    });

    try {
      // Group errors by pattern for bulk processing
      const errorGroups = this.groupErrorsByPattern(context.errors);
      const scripts: FixingScript[] = [];

      for (const [pattern, errors] of Array.from(errorGroups.entries())) {
        const script = await this.generateScriptForPattern(pattern, errors, context);
        if (script) {
          scripts.push(script);
        }
      }

      // Generate individual scripts for ungrouped errors
      const individualScripts = await this.generateIndividualScripts(context);
      scripts.push(...individualScripts);

      this.generatedScripts = scripts;
      
      logger.completeOperation(`${this.category} script generation`, Date.now(), {
        scriptsGenerated: scripts.length
      });

      return scripts;

    } catch (error) {
      logger.failOperation(`${this.category} script generation`, error as Error);
      throw error;
    }
  }

  /**
   * Validates a generated script
   */
  public async validateScript(script: FixingScript): Promise<boolean> {
    try {
      // Check script structure
      if (!script.id || !script.category || !script.commands.length) {
        logger.warn('Invalid script structure', { scriptId: script.id });
        return false;
      }

      // Validate commands
      for (const command of script.commands) {
        if (!this.validateCommand(command)) {
          logger.warn('Invalid command in script', { 
            scriptId: script.id, 
            commandType: command.type 
          });
          return false;
        }
      }

      // Run validation checks
      for (const check of script.validationChecks) {
        if (!await this.runValidationCheck(check)) {
          logger.warn('Validation check failed', { 
            scriptId: script.id, 
            checkType: check.type 
          });
          return false;
        }
      }

      return true;

    } catch (error) {
      logger.error('Script validation failed', error as Error, { scriptId: script.id });
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
   * Creates a script from a template with parameters
   */
  public createScriptFromTemplate(
    templateId: string, 
    parameters: Record<string, any>,
    targetErrors: AnalyzedError[]
  ): FixingScript {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Validate parameters
    this.validateTemplateParameters(template, parameters);

    // Generate script ID
    const scriptId = `${this.category}-${templateId}-${Date.now()}`;

    // Process template commands with parameters
    const commands = this.processTemplateCommands(template.commands, parameters);
    const rollbackCommands = this.generateRollbackCommands(commands);

    return {
      id: scriptId,
      category: this.category,
      targetErrors,
      commands,
      rollbackCommands,
      validationChecks: template.validationChecks,
      estimatedRuntime: this.estimateRuntime(commands)
    };
  }

  /**
   * Abstract method to initialize category-specific templates
   */
  protected abstract initializeTemplates(): void;

  /**
   * Abstract method to group errors by pattern
   */
  protected abstract groupErrorsByPattern(errors: AnalyzedError[]): Map<string, AnalyzedError[]>;

  /**
   * Abstract method to generate script for a specific pattern
   */
  protected abstract generateScriptForPattern(
    pattern: string, 
    errors: AnalyzedError[], 
    context: GenerationContext
  ): Promise<FixingScript | null>;

  /**
   * Generates individual scripts for errors that don't fit patterns
   */
  protected async generateIndividualScripts(context: GenerationContext): Promise<FixingScript[]> {
    const scripts: FixingScript[] = [];
    
    // Default implementation - can be overridden by subclasses
    for (const error of context.errors) {
      const script = await this.generateScriptForSingleError(error, context);
      if (script) {
        scripts.push(script);
      }
    }

    return scripts;
  }

  /**
   * Generates a script for a single error
   */
  protected async generateScriptForSingleError(
    error: AnalyzedError, 
    context: GenerationContext
  ): Promise<FixingScript | null> {
    // Default implementation - should be overridden by subclasses
    logger.debug('Generating individual script for error', { 
      file: error.file, 
      code: error.code 
    });

    return null;
  }

  /**
   * Validates a script command
   */
  protected validateCommand(command: ScriptCommand): boolean {
    // Check required fields
    if (!command.type || !command.file) {
      return false;
    }

    // Validate command type
    const validTypes = ['replace', 'insert', 'delete', 'move'];
    if (!validTypes.includes(command.type)) {
      return false;
    }

    // Type-specific validation
    switch (command.type) {
      case 'replace':
        return !!(command.pattern && command.replacement);
      case 'insert':
        return !!(command.replacement && command.position);
      case 'move':
        return !!command.replacement; // replacement serves as target path
      case 'delete':
        return true; // Only needs file
      default:
        return false;
    }
  }

  /**
   * Runs a validation check
   */
  protected async runValidationCheck(check: ValidationCheck): Promise<boolean> {
    try {
      // This is a placeholder - actual implementation would run the check
      logger.debug('Running validation check', { type: check.type, command: check.command });
      return true;
    } catch (error) {
      logger.error('Validation check failed', error as Error, { checkType: check.type });
      return false;
    }
  }

  /**
   * Validates template parameters
   */
  protected validateTemplateParameters(
    template: ScriptTemplate, 
    parameters: Record<string, any>
  ): void {
    for (const param of template.parameters) {
      const value = parameters[param.name];

      // Check required parameters
      if (param.required && (value === undefined || value === null)) {
        throw new Error(`Required parameter missing: ${param.name}`);
      }

      // Type validation
      if (value !== undefined && value !== null) {
        if (!this.validateParameterType(value, param.type)) {
          throw new Error(`Invalid type for parameter ${param.name}: expected ${param.type}`);
        }
      }
    }
  }

  /**
   * Validates parameter type
   */
  protected validateParameterType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      default:
        return false;
    }
  }

  /**
   * Processes template commands with parameter substitution
   */
  protected processTemplateCommands(
    templateCommands: ScriptCommand[], 
    parameters: Record<string, any>
  ): ScriptCommand[] {
    return templateCommands.map(command => ({
      ...command,
      file: this.substituteParameters(command.file, parameters),
      pattern: command.pattern ? new RegExp(this.substituteParameters(command.pattern.source, parameters)) : command.pattern,
      replacement: command.replacement ? this.substituteParameters(command.replacement, parameters) : command.replacement,
      description: this.substituteParameters(command.description, parameters)
    }));
  }

  /**
   * Substitutes template parameters in strings
   */
  protected substituteParameters(template: string, parameters: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, paramName) => {
      const value = parameters[paramName];
      return value !== undefined ? String(value) : match;
    });
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
        // For replace operations, we'd need to store the original content
        // This is a simplified version
        return {
          type: 'replace',
          file: command.file,
          pattern: command.replacement ? new RegExp(this.escapeRegex(command.replacement)) : undefined,
          replacement: '', // Would need original content
          description: `Rollback: ${command.description}`
        };

      case 'insert':
        // For insert operations, delete the inserted content
        return {
          type: 'delete',
          file: command.file,
          position: command.position,
          description: `Rollback: ${command.description}`
        };

      case 'delete':
        // For delete operations, we'd need to restore the original content
        // This would require backup functionality
        return null; // Cannot rollback without backup

      case 'move':
        // For move operations, move back to original location
        return {
          type: 'move',
          file: command.replacement || '', // target becomes source
          replacement: command.file, // source becomes target
          description: `Rollback: ${command.description}`
        };

      default:
        return null;
    }
  }

  /**
   * Escapes special regex characters
   */
  protected escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Estimates runtime for a set of commands
   */
  protected estimateRuntime(commands: ScriptCommand[]): number {
    // Simple estimation based on command types
    let totalTime = 0;

    for (const command of commands) {
      switch (command.type) {
        case 'replace':
          totalTime += 100; // 100ms per replace
          break;
        case 'insert':
          totalTime += 50; // 50ms per insert
          break;
        case 'delete':
          totalTime += 25; // 25ms per delete
          break;
        case 'move':
          totalTime += 200; // 200ms per move
          break;
      }
    }

    return totalTime;
  }

  /**
   * Adds a template to the generator
   */
  protected addTemplate(template: ScriptTemplate): void {
    this.templates.set(template.id, template);
    logger.debug('Added template', { 
      category: this.category, 
      templateId: template.id, 
      name: template.name 
    });
  }
}