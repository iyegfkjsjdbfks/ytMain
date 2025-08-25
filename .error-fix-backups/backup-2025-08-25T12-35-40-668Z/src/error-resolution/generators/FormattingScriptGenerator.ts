import { BaseScriptGenerator, GenerationContext } from './BaseScriptGenerator';
import { AnalyzedError, FixingScript, ScriptCommand, ValidationCheck } from '../types/ErrorTypes';
import { Logger } from '../utils/Logger';

export class FormattingScriptGenerator extends BaseScriptGenerator {
  constructor() {
    super('formatting');
  }

  protected initializeTemplates(): void {
    // Template for removing trailing spaces
    this.addTemplate({
      id: 'remove-trailing-spaces',
      name: 'Remove Trailing Spaces',
      description: 'Removes trailing whitespace from lines',
      parameters: [
        {
          name: 'filePattern',
          type: 'string',
          description: 'File pattern to process',
          required: true,
          defaultValue: '**/*.{ts,tsx,js,jsx}'
        }
      ],
      commands: [
        {
          type: 'replace',
          file: '{{filePattern}}',
          pattern: /\s+$/gm,
          replacement: '',
          description: 'Remove trailing spaces from {{filePattern}}'
        }
      ],
      validationChecks: [
        {
          type: 'lint',
          command: 'eslint --fix {{filePattern}}',
          expectedResult: 'improved-count',
          timeoutSeconds: 30
        }
      ]
    });

    // Template for fixing missing semicolons
    this.addTemplate({
      id: 'add-missing-semicolons',
      name: 'Add Missing Semicolons',
      description: 'Adds missing semicolons to statements',
      parameters: [
        {
          name: 'targetFile',
          type: 'string',
          description: 'Target file to fix',
          required: true
        }
      ],
      commands: [
        {
          type: 'replace',
          file: '{{targetFile}}',
          pattern: /^(\s*(?:const|let|var|return|throw|break|continue|import|export)\s+[^;{}\n]+)$/gm,
          replacement: '$1;',
          description: 'Add semicolons to statements in {{targetFile}}'
        }
      ],
      validationChecks: [
        {
          type: 'syntax',
          command: 'npx tsc --noEmit {{targetFile}}',
          expectedResult: 'improved-count',
          timeoutSeconds: 15
        }
      ]
    });

    // Template for fixing missing commas
    this.addTemplate({
      id: 'add-missing-commas',
      name: 'Add Missing Commas',
      description: 'Adds missing commas in object literals and arrays',
      parameters: [
        {
          name: 'targetFile',
          type: 'string',
          description: 'Target file to fix',
          required: true
        }
      ],
      commands: [
        {
          type: 'replace',
          file: '{{targetFile}}',
          pattern: /(\w+:\s*[^,\n}]+)(\n\s*\w+:)/g,
          replacement: '$1,$2',
          description: 'Add missing commas in object properties in {{targetFile}}'
        },
        {
          type: 'replace',
          file: '{{targetFile}}',
          pattern: /(\w+)(\n\s*\})/g,
          replacement: '$1$2',
          description: 'Clean up object endings in {{targetFile}}'
        }
      ],
      validationChecks: [
        {
          type: 'syntax',
          command: 'npx tsc --noEmit {{targetFile}}',
          expectedResult: 'improved-count',
          timeoutSeconds: 15
        }
      ]
    });

    // Template for organizing imports
    this.addTemplate({
      id: 'organize-imports',
      name: 'Organize Imports',
      description: 'Organizes and deduplicates import statements',
      parameters: [
        {
          name: 'targetFile',
          type: 'string',
          description: 'Target file to organize',
          required: true
        }
      ],
      commands: [
        {
          type: 'replace',
          file: '{{targetFile}}',
          pattern: /^import\s+React\s*,\s*\{\s*([^}]+)\s*\}\s+from\s+['"]react['"];?\s*$/gm,
          replacement: 'import React, { $1 } from \'react\';',
          description: 'Standardize React imports in {{targetFile}}'
        }
      ],
      validationChecks: [
        {
          type: 'lint',
          command: 'eslint {{targetFile}}',
          expectedResult: 'improved-count',
          timeoutSeconds: 10
        }
      ]
    });

    // Template for fixing indentation
    this.addTemplate({
      id: 'fix-indentation',
      name: 'Fix Indentation',
      description: 'Fixes inconsistent indentation',
      parameters: [
        {
          name: 'targetFile',
          type: 'string',
          description: 'Target file to fix',
          required: true
        },
        {
          name: 'indentSize',
          type: 'number',
          description: 'Number of spaces for indentation',
          required: false,
          defaultValue: 2
        }
      ],
      commands: [
        {
          type: 'replace',
          file: '{{targetFile}}',
          pattern: /^\t+/gm,
          replacement: '  ',
          description: 'Convert tabs to spaces in {{targetFile}}'
        }
      ],
      validationChecks: [
        {
          type: 'lint',
          command: 'eslint {{targetFile}}',
          expectedResult: 'improved-count',
          timeoutSeconds: 10
        }
      ]
    });
  }

  protected groupErrorsByPattern(errors: AnalyzedError[]): Map<string, AnalyzedError[]> {
    const groups = new Map<string, AnalyzedError[]>();

    for (const error of errors) {
      let pattern = 'unknown';

      // Group by error patterns
      if (error.message.includes("';' expected")) {
        pattern = 'missing-semicolon';
      } else if (error.message.includes("',' expected")) {
        pattern = 'missing-comma';
      } else if (error.message.includes('trailing')) {
        pattern = 'trailing-spaces';
      } else if (error.message.includes('import') || error.message.includes('duplicate')) {
        pattern = 'import-issues';
      } else if (error.message.includes('indent') || error.message.includes('Expected indentation')) {
        pattern = 'indentation';
      }

      if (!groups.has(pattern)) {
        groups.set(pattern, []);
      }
      groups.get(pattern)!.push(error);
    }

    return groups;
  }

  protected async generateScriptForPattern(
    pattern: string,
    errors: AnalyzedError[],
    _context: GenerationContext
  ): Promise<FixingScript | null> {
    Logger.process({ message: 'Generating formatting script for pattern', pattern, errorCount: errors.length });

    const scriptId = `formatting-${pattern}-${Date.now()}`;
    let commands: ScriptCommand[] = [];
    let validationChecks: ValidationCheck[] = [];

    // Get unique files affected by these errors
    const fileSet = new Set(errors.map(e => e.file));
    const affectedFiles = Array.from(fileSet);

    switch (pattern) {
      case 'missing-semicolon':
        commands = this.generateSemicolonFixCommands(affectedFiles);
        validationChecks = this.createSyntaxValidationChecks(affectedFiles);
        break;

      case 'missing-comma':
        commands = this.generateCommaFixCommands(affectedFiles);
        validationChecks = this.createSyntaxValidationChecks(affectedFiles);
        break;

      case 'trailing-spaces':
        commands = this.generateTrailingSpaceFixCommands(affectedFiles);
        validationChecks = this.createLintValidationChecks(affectedFiles);
        break;

      case 'import-issues':
        commands = this.generateImportFixCommands(affectedFiles);
        validationChecks = this.createLintValidationChecks(affectedFiles);
        break;

      case 'indentation':
        commands = this.generateIndentationFixCommands(affectedFiles);
        validationChecks = this.createLintValidationChecks(affectedFiles);
        break;

      default:
        Logger.process({ message: 'Unknown formatting pattern', pattern });
        return null;
    }

    if (commands.length === 0) {
      return null;
    }

    return {
      id: scriptId,
      category: this.category,
      targetErrors: errors,
      commands,
      rollbackCommands: this.generateRollbackCommands(commands),
      validationChecks,
      estimatedRuntime: this.estimateRuntime(commands)
    };
  }

  /**
   * Generates commands to fix missing semicolons
   */
  private generateSemicolonFixCommands(files: string[]): ScriptCommand[] {
    return files.map(file => ({
      type: 'replace' as const,
      file,
      pattern: /^(\s*(?:const|let|var|return|throw|break|continue|import|export)\s+[^;{}\n]+)$/gm,
      replacement: '$1;',
      description: `Add missing semicolons in ${file}`
    }));
  }

  /**
   * Generates commands to fix missing commas
   */
  private generateCommaFixCommands(files: string[]): ScriptCommand[] {
    const commands: ScriptCommand[] = [];

    for (const file of files) {
      // Fix missing commas in object properties
      commands.push({
        type: 'replace',
        file,
        pattern: /(\w+:\s*[^,\n}]+)(\n\s*\w+:)/g,
        replacement: '$1,$2',
        description: `Add missing commas in object properties in ${file}`
      });

      // Fix missing commas in array elements
      commands.push({
        type: 'replace',
        file,
        pattern: /(\w+)(\n\s*\w+)(?=\s*\])/g,
        replacement: '$1,$2',
        description: `Add missing commas in arrays in ${file}`
      });

      // Fix function parameter commas
      commands.push({
        type: 'replace',
        file,
        pattern: /(\w+:\s*\w+)(\n\s*\w+:)/g,
        replacement: '$1,$2',
        description: `Add missing commas in function parameters in ${file}`
      });
    }

    return commands;
  }

  /**
   * Generates commands to fix trailing spaces
   */
  private generateTrailingSpaceFixCommands(files: string[]): ScriptCommand[] {
    return files.map(file => ({
      type: 'replace' as const,
      file,
      pattern: /\s+$/gm,
      replacement: '',
      description: `Remove trailing spaces from ${file}`
    }));
  }

  /**
   * Generates commands to fix import issues
   */
  private generateImportFixCommands(files: string[]): ScriptCommand[] {
    const commands: ScriptCommand[] = [];

    for (const file of files) {
      // Remove duplicate React imports
      commands.push({
        type: 'replace',
        file,
        pattern: /^import\s+React\s*;\s*\nimport\s+React\s*,/gm,
        replacement: 'import React,',
        description: `Remove duplicate React imports in ${file}`
      });

      // Standardize import formatting
      commands.push({
        type: 'replace',
        file,
        pattern: /^import\s+React\s*,\s*\{\s*([^}]+)\s*\}\s+from\s+['"]react['"];?\s*$/gm,
        replacement: 'import React, { $1 } from \'react\';',
        description: `Standardize React import formatting in ${file}`
      });

      // Fix import ordering (React first, then other libraries, then local imports)
      commands.push({
        type: 'replace',
        file,
        pattern: /^(import.*from\s+['"][^.\/].*['"];?\s*\n)(import\s+React.*['"];?\s*\n)/gm,
        replacement: '$2$1',
        description: `Fix import ordering in ${file}`
      });
    }

    return commands;
  }

  /**
   * Generates commands to fix indentation
   */
  private generateIndentationFixCommands(files: string[]): ScriptCommand[] {
    const commands: ScriptCommand[] = [];

    for (const file of files) {
      // Convert tabs to spaces
      commands.push({
        type: 'replace',
        file,
        pattern: /^\t+/gm,
        replacement: '  ',
        description: `Convert tabs to spaces in ${file}`
      });

      // Fix inconsistent spacing
      commands.push({
        type: 'replace',
        file,
        pattern: /^( {1,3})(\S)/gm,
        replacement: '  $2', // Normalize to 2 spaces
        description: `Normalize indentation to 2 spaces in ${file}`
      });
    }

    return commands;
  }

  /**
   * Creates syntax validation checks for files
   */
  private createSyntaxValidationChecks(files: string[]): ValidationCheck[] {
    return files.map(file => ({
      type: 'syntax' as const,
      command: `npx tsc --noEmit ${file}`,
      expectedResult: 'improved-count' as const,
      timeoutSeconds: 15
    }));
  }

  /**
   * Creates lint validation checks for files
   */
  private createLintValidationChecks(files: string[]): ValidationCheck[] {
    return files.map(file => ({
      type: 'lint' as const,
      command: `eslint ${file}`,
      expectedResult: 'improved-count' as const,
      timeoutSeconds: 10
    }));
  }

  /**
   * Generates a bulk formatting script for all common issues
   */
  public async generateBulkFormattingScript(
    _context: GenerationContext
  ): Promise<FixingScript> {
    const scriptId = `formatting-bulk-${Date.now()}`;
    const commands: ScriptCommand[] = [];
    const validationChecks: ValidationCheck[] = [];

    // Get all unique files
    const fileSet = new Set((_context.errors || []).map(e => e.file));
    const allFiles = Array.from(fileSet);

    // Add commands for each type of formatting fix
    commands.push(...this.generateTrailingSpaceFixCommands(allFiles));
    commands.push(...this.generateSemicolonFixCommands(allFiles));
    commands.push(...this.generateCommaFixCommands(allFiles));
    commands.push(...this.generateImportFixCommands(allFiles));
    commands.push(...this.generateIndentationFixCommands(allFiles));

    // Add comprehensive validation
    validationChecks.push(...this.createLintValidationChecks(allFiles));
    validationChecks.push(...this.createSyntaxValidationChecks(allFiles));

    return {
      id: scriptId,
      category: this.category,
      targetErrors: _context.errors || [],
      commands,
      rollbackCommands: this.generateRollbackCommands(commands),
      validationChecks,
      estimatedRuntime: this.estimateRuntime(commands)
    };
  }

  /**
   * Generates a Prettier formatting script
   */
  public generatePrettierScript(files: string[]): FixingScript {
    const scriptId = `formatting-prettier-${Date.now()}`;

    return {
      id: scriptId,
      category: this.category,
      targetErrors: [],
      commands: [
        {
          type: 'replace',
          file: files.join(' '),
          pattern: /.*/,
          replacement: '',
          description: `Run Prettier on ${files.length} files`
        }
      ],
      rollbackCommands: [],
      validationChecks: [
        {
          type: 'lint',
          command: `npx prettier --write ${files.join(' ')}`,
          expectedResult: 'success',
          timeoutSeconds: 60
        }
      ],
      estimatedRuntime: files.length * 100 // 100ms per file
    };
  }

  /**
   * Generates an ESLint auto-fix script
   */
  public generateESLintScript(files: string[]): FixingScript {
    const scriptId = `formatting-eslint-${Date.now()}`;

    return {
      id: scriptId,
      category: this.category,
      targetErrors: [],
      commands: [
        {
          type: 'replace',
          file: files.join(' '),
          pattern: /.*/,
          replacement: '',
          description: `Run ESLint --fix on ${files.length} files`
        }
      ],
      rollbackCommands: [],
      validationChecks: [
        {
          type: 'lint',
          command: `npx eslint --fix ${files.join(' ')}`,
          expectedResult: 'improved-count',
          timeoutSeconds: 120
        }
      ],
      estimatedRuntime: files.length * 200 // 200ms per file
    };
  }
}