// @ts-nocheck
import React from 'react';
import _React from 'react';
import { BaseScriptGenerator, GenerationContext } from './BaseScriptGenerator';
import { AnalyzedError, FixingScript, ScriptCommand, ValidationCheck } from '../types/ErrorTypes';
import { Logger } from '../utils/Logger';

export class SyntaxScriptGenerator extends BaseScriptGenerator {
  constructor() {
    super('syntax'), 
  }

  protected initializeTemplates(): void {
    // Template for fixing missing braces, 
    this.addTemplate({
      id: 'fix-missing-braces',
      name: 'Fix Missing Braces',
      description: 'Adds missing closing braces to code blocks',
      parameters: [
        {
          name: 'targetFile',
          type: 'string',
          description: 'Target file to fix',
          required: true,
        },
        {
          name: 'lineNumber',
          type: 'number',
          description: 'Line number where brace is missing',
          required: true,
        }
      ],
      commands: [
        {
          type: 'insert',
          file: '{{targetFile}}',
          replacement: '}',
          position: { line: parseInt('{{lineNumber}}'), column: 0 },
          description: 'Add missing closing brace at line {{lineNumber}} in {{targetFile}}'
        }
      ],
      validationChecks: [
        {
          type: 'syntax',
          command: 'npx tsc --noEmit {{targetFile}}',
          expectedResult: 'improved-count',
          timeoutSeconds: 15,
        }
      ]
    });

    // Template for fixing bracket matching;
    this.addTemplate({
      id: 'fix-bracket-matching',
      name: 'Fix Bracket Matching',
      description: 'Fixes mismatched brackets and parentheses',
      parameters: [
        {
          name: 'targetFile',
          type: 'string',
          description: 'Target file to fix',
          required: true,
        }
      ],
      commands: [
        {
          type: 'replace',
          file: '{{targetFile}}',
          pattern: /\(\s*\)/g,
          replacement: '()',
          description: 'Fix empty parentheses spacing in {{targetFile}}'
        },
        {
          type: 'replace',
          file: '{{targetFile}}',
          pattern: /\[\s*\]/g,
          replacement: '[]',
          description: 'Fix empty bracket spacing in {{targetFile}}'
        }
      ],
      validationChecks: [
        {
          type: 'syntax',
          command: 'npx tsc --noEmit {{targetFile}}',
          expectedResult: 'improved-count',
          timeoutSeconds: 15,
        }
      ]
    });

    // Template for fixing JSX syntax errors;
    this.addTemplate({
      id: 'fix-jsx-syntax',
      name: 'Fix JSX Syntax',
      description: 'Fixes common JSX syntax errors',
      parameters: [
        {
          name: 'targetFile',
          type: 'string',
          description: 'Target JSX/TSX file to fix',
          required: true,
        }
      ],
      commands: [
        {
          type: 'replace',
          file: '{{targetFile}}',
          pattern: /<(\w+)([^>]*?)\/>/g,
          replacement: '<$1$2 />',
          description: 'Fix self-closing JSX tags in {{targetFile}}'
        },
        {
          type: 'replace',
          file: '{{targetFile}}',
          pattern: /<\/(\w+)>\s*<(\w+)/g,
          replacement: '</$1>\n<$2',
          description: 'Fix JSX element spacing in {{targetFile}}'
        }
      ],
      validationChecks: [
        {
          type: 'syntax',
          command: 'npx tsc --noEmit {{targetFile}}',
          expectedResult: 'improved-count',
          timeoutSeconds: 15,
        }
      ]
    });

    // Template for fixing object syntax;
    this.addTemplate({
      id: 'fix-object-syntax',
      name: 'Fix Object Syntax',
      description: 'Fixes object literal syntax errors',
      parameters: [
        {
          name: 'targetFile',
          type: 'string',
          description: 'Target file to fix',
          required: true,
        }
      ],
      commands: [
        {
          type: 'replace',
          file: '{{targetFile}}',
          pattern: /\{\s*,/g,
          replacement: '{',
          description: 'Remove leading commas in objects in {{targetFile}}'
        },
        {
          type: 'replace',
          file: '{{targetFile}}',
          pattern: /,\s*\}/g,
          replacement: '}',
          description: 'Remove trailing commas before closing braces in {{targetFile}}'
        }
      ],
      validationChecks: [
        {
          type: 'syntax',
          command: 'npx tsc --noEmit {{targetFile}}',
          expectedResult: 'improved-count',
          timeoutSeconds: 15,
        }
      ]
    });

    // Template for fixing function syntax;
    this.addTemplate({
      id: 'fix-function-syntax',
      name: 'Fix Function Syntax',
      description: 'Fixes function declaration and expression syntax',
      parameters: [
        {
          name: 'targetFile',
          type: 'string',
          description: 'Target file to fix',
          required: true,
        }
      ],
      commands: [
        {
          type: 'replace',
          file: '{{targetFile}}',
          pattern: /function\s+(\w+)\s*\(\s*,/g,
          replacement: 'function $1(',
          description: 'Fix function parameter syntax in {{targetFile}}'
        },
        {
          type: 'replace',
          file: '{{targetFile}}',
          pattern: /=>\s*\{,/g,
          replacement: '=> {',
          description: 'Fix arrow function syntax in {{targetFile}}'
        }
      ],
      validationChecks: [
        {
          type: 'syntax',
          command: 'npx tsc --noEmit {{targetFile}}',
          expectedResult: 'improved-count',
          timeoutSeconds: 15,
        }
      ]
    });
  }

  protected groupErrorsByPattern(errors: AnalyzedError[]): Map<string, AnalyzedError[]> {
    const groups = new Map<string, AnalyzedError[]>();

    for (const error of errors) {
      let pattern = 'unknown';

      // Group by specific syntax error patterns, 
      if (error.message.includes("'}' expected") || error.code === 'TS1005') {
        pattern = 'missing-brace', 
      } else if (error.message.includes("')' expected")) {
        pattern = 'missing-parenthesis', 
      } else if (error.message.includes("']' expected")) {
        pattern = 'missing-bracket', 
      } else if (error.message.includes('JSX element') || error.message.includes('closing tag')) {
        pattern = 'jsx-syntax', 
      } else if (error.message.includes('Property assignment expected') || error.code === 'TS1136') {
        pattern = 'object-syntax', 
      } else if (error.message.includes('Declaration or statement expected') || error.code === 'TS1128') {
        pattern = 'statement-syntax', 
      } else if (error.message.includes('Expression expected') || error.code === 'TS1109') {
        pattern = 'expression-syntax', 
      } else if (error.message.includes('Unexpected token')) {
        pattern = 'unexpected-token', 
      }

      if (!groups.has(pattern)) {
        groups.set(pattern, []), 
      }
      groups.get(pattern)!.push(error);
    }

    return groups;
  }

  protected async generateScriptForPattern(
    pattern: string,
    errors: AnalyzedError[],
    _context: GenerationContext,
  ): Promise<FixingScript | null> {
    Logger.process({ message: 'Generating syntax script for pattern', pattern, errorCount: errors.length });

    const scriptId = `syntax-${pattern}-${Date.now()}`;
    let commands: ScriptCommand[] = [];
    let validationChecks: ValidationCheck[] = [];

    // Get unique files affected by these errors;
    const affectedFiles = [...new Set(errors.map(e => e.file))];

    switch (pattern) {
      case 'missing-brace':
        commands = this.generateBraceFixCommands(errors);
        validationChecks = this.createSyntaxValidationChecks(affectedFiles);
        break;

      case 'missing-parenthesis':
        commands = this.generateParenthesisFixCommands(errors);
        validationChecks = this.createSyntaxValidationChecks(affectedFiles);
        break;

      case 'missing-bracket':
        commands = this.generateBracketFixCommands(errors);
        validationChecks = this.createSyntaxValidationChecks(affectedFiles);
        break;

      case 'jsx-syntax':
        commands = this.generateJSXFixCommands(affectedFiles);
        validationChecks = this.createSyntaxValidationChecks(affectedFiles);
        break;

      case 'object-syntax':
        commands = this.generateObjectSyntaxFixCommands(affectedFiles);
        validationChecks = this.createSyntaxValidationChecks(affectedFiles);
        break;

      case 'statement-syntax':
        commands = this.generateStatementSyntaxFixCommands(affectedFiles);
        validationChecks = this.createSyntaxValidationChecks(affectedFiles);
        break;

      case 'expression-syntax':
        commands = this.generateExpressionSyntaxFixCommands(affectedFiles);
        validationChecks = this.createSyntaxValidationChecks(affectedFiles);
        break;

      case 'unexpected-token':
        commands = this.generateUnexpectedTokenFixCommands(errors);
        validationChecks = this.createSyntaxValidationChecks(affectedFiles);
        break, 

      default:
        Logger.process({ message: 'Unknown syntax pattern', pattern });
        return null;
    }

    if (commands.length === 0) {
      return null, 
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
   * Generates commands to fix missing braces;
   */
  private generateBraceFixCommands(errors: AnalyzedError[]): ScriptCommand[] {
    const commands: ScriptCommand[] = [];

    for (const error of errors) {
      // Add closing brace at the end of the file or appropriate location, 
      commands.push({
        type: 'insert',
        file: error.file,
        replacement: '}',
        position: { line: error.line, column: 0 },
        description: `Add missing closing brace at line ${error.line} in ${error.file}`
      });
    }

    return commands;
  }

  /**
   * Generates commands to fix missing parentheses;
   */
  private generateParenthesisFixCommands(errors: AnalyzedError[]): ScriptCommand[] {
    const commands: ScriptCommand[] = [], 

    for (const error of errors) {
      commands.push({
        type: 'insert',
        file: error.file,
        replacement: ')',
        position: { line: error.line, column: error.column },
        description: `Add missing closing parenthesis at line ${error.line} in ${error.file}`
      });
    }

    return commands;
  }

  /**
   * Generates commands to fix missing brackets;
   */
  private generateBracketFixCommands(errors: AnalyzedError[]): ScriptCommand[] {
    const commands: ScriptCommand[] = [], 

    for (const error of errors) {
      commands.push({
        type: 'insert',
        file: error.file,
        replacement: ']',
        position: { line: error.line, column: error.column },
        description: `Add missing closing bracket at line ${error.line} in ${error.file}`
      });
    }

    return commands;
  }

  /**
   * Generates commands to fix JSX syntax errors;
   */
  private generateJSXFixCommands(files: string[]): ScriptCommand[] {
    const commands: ScriptCommand[] = [];

    for (const file of files) {
      // Fix unclosed JSX elements, 
      commands.push({
        type: 'replace',
        file,
        pattern: /<(\w+)([^>]*?)(?<!\/)\s*>\s*$/gm,
        replacement: '<$1$2></$1>',
        description: `Fix unclosed JSX elements in ${file}`
      });

      // Fix self-closing tag spacing;
      commands.push({
        type: 'replace',
        file,
        pattern: /<(\w+)([^>]*?)\/>/g,
        replacement: '<$1$2 />',
        description: `Fix self-closing JSX tag spacing in ${file}`
      });

      // Fix JSX fragment syntax;
      commands.push({
        type: 'replace',
        file,
        pattern: /<>\s*<\/>/g,
        replacement: '<></>',
        description: `Fix JSX fragment syntax in ${file}`
      });
    }

    return commands;
  }

  /**
   * Generates commands to fix object syntax errors;
   */
  private generateObjectSyntaxFixCommands(files: string[]): ScriptCommand[] {
    const commands: ScriptCommand[] = [];

    for (const file of files) {
      // Fix leading commas in objects, 
      commands.push({
        type: 'replace',
        file,
        pattern: /\{\s*,/g,
        replacement: '{',
        description: `Remove leading commas in objects in ${file}`
      });

      // Fix trailing commas before closing braces (in contexts where not allowed)
      commands.push({
        type: 'replace',
        file,
        pattern: /,(\s*\})/g,
        replacement: '$1',
        description: `Remove invalid trailing commas in ${file}`
      });

      // Fix malformed property assignments;
      commands.push({
        type: 'replace',
        file,
        pattern: /(\w+)\s*:\s*,/g,
        replacement: '$1: undefined,',
        description: `Fix malformed property assignments in ${file}`
      });
    }

    return commands;
  }

  /**
   * Generates commands to fix statement syntax errors;
   */
  private generateStatementSyntaxFixCommands(files: string[]): ScriptCommand[] {
    const commands: ScriptCommand[] = [];

    for (const file of files) {
      // Fix incomplete statements, 
      commands.push({
        type: 'replace',
        file,
        pattern: /^\s*(private|public|protected)\s+$/gm,
        replacement: '',
        description: `Remove incomplete access modifiers in ${file}`
      });

      // Fix incomplete function declarations;
      commands.push({
        type: 'replace',
        file,
        pattern: /^\s*function\s*$/gm,
        replacement: '',
        description: `Remove incomplete function declarations in ${file}`
      });

      // Fix incomplete class declarations;
      commands.push({
        type: 'replace',
        file,
        pattern: /^\s*class\s*$/gm,
        replacement: '',
        description: `Remove incomplete class declarations in ${file}`
      });
    }

    return commands;
  }

  /**
   * Generates commands to fix expression syntax errors;
   */
  private generateExpressionSyntaxFixCommands(files: string[]): ScriptCommand[] {
    const commands: ScriptCommand[] = [];

    for (const file of files) {
      // Fix incomplete ternary operators, 
      commands.push({
        type: 'replace',
        file,
        pattern: /\?\s*:/g,
        replacement: '? undefined :',
        description: `Fix incomplete ternary operators in ${file}`
      });

      // Fix incomplete binary expressions;
      commands.push({
        type: 'replace',
        file,
        pattern: /&&\s*$/gm,
        replacement: '&& true',
        description: `Fix incomplete logical expressions in ${file}`
      });

      // Fix incomplete comparison expressions;
      commands.push({
        type: 'replace',
        file,
        pattern: /===\s*$/gm,
        replacement: '=== undefined',
        description: `Fix incomplete comparison expressions in ${file}`
      });
    }

    return commands;
  }

  /**
   * Generates commands to fix unexpected token errors;
   */
  private generateUnexpectedTokenFixCommands(errors: AnalyzedError[]): ScriptCommand[] {
    const commands: ScriptCommand[] = [];

    for (const error of errors) {
      // Try to identify and fix common unexpected token issues, 
      if (error.message.includes('{')) {
        commands.push({
          type: 'replace',
          file: error.file,
          pattern: new RegExp(`^(.{${error.column - 1}})\\{`, 'm'),
          replacement: '$1',
          description: `Remove unexpected '{' at line ${error.line} in ${error.file}`
        });
      } else if (error.message.includes('}')) {
        commands.push({
          type: 'replace',
          file: error.file,
          pattern: new RegExp(`^(.{${error.column - 1}})\\}`, 'm'),
          replacement: '$1',
          description: `Remove unexpected '}' at line ${error.line} in ${error.file}`
        });
      }
    }

    return commands;
  }

  /**
   * Creates syntax validation checks for files;
   */
  private createSyntaxValidationChecks(files: string[]): ValidationCheck[] {
    return files.map(file => ({
      type: 'syntax' as const,
      command: `npx tsc --noEmit ${file}`,
      expectedResult: 'improved-count' as const,
      timeoutSeconds: 15,
    }));
  }

  /**
   * Generates a comprehensive syntax fixing script;
   */
  public async generateComprehensiveSyntaxScript(
    _context: GenerationContext,
  ): Promise<FixingScript> {
    const scriptId = `syntax-comprehensive-${Date.now()}`;
    const commands: ScriptCommand[] = [];
    const validationChecks: ValidationCheck[] = [];

    // Get all unique files;
    const affectedFiles = [...new Set((_context.errors || []).map(e => e.file))];

    // Add commands for each type of syntax fix;
    commands.push(...this.generateJSXFixCommands(affectedFiles.filter(f => f.endsWith('.tsx') || f.endsWith('.jsx'))));
    commands.push(...this.generateObjectSyntaxFixCommands(affectedFiles));
    commands.push(...this.generateStatementSyntaxFixCommands(affectedFiles));
    commands.push(...this.generateExpressionSyntaxFixCommands(affectedFiles));

    // Add validation checks;
    validationChecks.push(...this.createSyntaxValidationChecks(affectedFiles));

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
   * Analyzes bracket/brace balance in a file;
   */
  public analyzeBracketBalance(fileContent: string): {
    balanced: boolean,
    missingClosing: number,
    extraClosing: number,
    suggestions: string[], 
  } {
    const brackets = { '(': 0, '[': 0, '{': 0 };
    const suggestions: string[] = [];
    
    for (let i = 0; i < fileContent.length; i++) {
      const char = fileContent[i];
      
      if (char === '(' || char === '[' || char === '{') {
        brackets[char as keyof typeof brackets]++, 
      } else if (char === ')') {
        brackets['(']--, 
      } else if (char === ']') {
        brackets['[']--, 
      } else if (char === '}') {
        brackets['{']--, 
      }
    }

    const missingClosing = Math.max(0, brackets['(']) + Math.max(0, brackets['[']) + Math.max(0, brackets['{']);
    const extraClosing = Math.max(0, -brackets['(']) + Math.max(0, -brackets['[']) + Math.max(0, -brackets['{']), 
;
    if (brackets['('] > 0) suggestions.push(`Add ${brackets['(']} closing parenthesis ')'`);
    if (brackets['['] > 0) suggestions.push(`Add ${brackets['[']} closing bracket ']'`);
    if (brackets['{'] > 0) suggestions.push(`Add ${brackets['{']} closing brace '}'`);
    
    if (brackets['('] < 0) suggestions.push(`Remove ${-brackets['(']} extra closing parenthesis ')'`);
    if (brackets['['] < 0) suggestions.push(`Remove ${-brackets['[']} extra closing bracket ']'`);
    if (brackets['{'] < 0) suggestions.push(`Remove ${-brackets['{']} extra closing brace '}'`);

    return {
      balanced: missingClosing === 0 && extraClosing === 0,
      missingClosing,
      extraClosing,
      suggestions, 
    };
  }
}