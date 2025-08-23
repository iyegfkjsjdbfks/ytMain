import { Logger } from '../utils/Logger';
import { AnalyzedError, ScriptCommand } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export interface TypeFixSuggestion {
  type: 'add-property' | 'fix-type' | 'add-generic' | 'fix-assertion' | 'add-interface';
  description: string;
  commands: ScriptCommand[];
  confidence: number;
}

export class TypeFixer {
  private logger: Logger;
  private projectRoot: string;

  constructor(projectRoot: string, logger?: Logger) {
    this.logger = logger || new Logger();
    this.projectRoot = projectRoot;
  }

  /**
   * Fixes type-related errors
   */
  public async fixTypeErrors(errors: AnalyzedError[]): Promise<ScriptCommand[]> {
    this.logger.info('TYPE_FIXER', `Fixing ${errors.length} type-related errors`);
    
    const commands: ScriptCommand[] = [];
    
    for (const error of errors) {
      try {
        const suggestions = await this.analyzeTypeError(error);
        
        if (suggestions.length > 0) {
          const bestSuggestion = suggestions.sort((a, b) => b.confidence - a.confidence)[0];
          commands.push(...bestSuggestion.commands);
          
          this.logger.debug('TYPE_FIXER', 
            `Applied fix for ${error.code} in ${error.file}: ${bestSuggestion.description}`
          );
        }
      } catch (fixError) {
        this.logger.error('TYPE_FIXER', 
          `Failed to fix type error in ${error.file}: ${fixError}`, fixError as Error
        );
      }
    }
    
    this.logger.info('TYPE_FIXER', `Generated ${commands.length} type fix commands`);
    return commands;
  }

  /**
   * Analyzes a specific type error and suggests fixes
   */
  public async analyzeTypeError(error: AnalyzedError): Promise<TypeFixSuggestion[]> {
    const suggestions: TypeFixSuggestion[] = [];
    
    const fileContent = await fs.promises.readFile(error.file, 'utf8');
    const lines = fileContent.split('\n');
    const errorLine = lines[error.line - 1];
    
    if (this.isMissingPropertyError(error)) {
      suggestions.push(...await this.fixMissingProperty(error, errorLine, fileContent));
    }
    
    if (this.isTypeAssignmentError(error)) {
      suggestions.push(...await this.fixTypeAssignment(error, errorLine, fileContent));
    }
    
    if (this.isGenericConstraintError(error)) {
      suggestions.push(...await this.fixGenericConstraint(error, errorLine, fileContent));
    }
    
    return suggestions;
  }

  private async fixMissingProperty(
    error: AnalyzedError,
    errorLine: string,
    fileContent: string
  ): Promise<TypeFixSuggestion[]> {
    const suggestions: TypeFixSuggestion[] = [];
    
    // Extract property name from error message
    const propertyMatch = error.message.match(/Property '(\w+)' does not exist/);
    if (!propertyMatch) return suggestions;
    
    const propertyName = propertyMatch[1];
    
    suggestions.push({
      type: 'add-property',
      description: `Add missing property '${propertyName}'`,
      commands: [{
        type: 'insert',
        file: error.file,
        position: { line: error.line, column: error.column },
        replacement: `${propertyName}: any; // TODO: Add proper type`,
        description: `Add property ${propertyName}`
      }],
      confidence: 0.8
    });
    
    return suggestions;
  }

  private async fixTypeAssignment(
    error: AnalyzedError,
    errorLine: string,
    fileContent: string
  ): Promise<TypeFixSuggestion[]> {
    const suggestions: TypeFixSuggestion[] = [];
    
    suggestions.push({
      type: 'fix-assertion',
      description: 'Add type assertion to fix assignment',
      commands: [{
        type: 'replace',
        file: error.file,
        pattern: new RegExp(`(.+)\\s*=\\s*(.+);`),
        replacement: '$1 = $2 as any;',
        description: 'Add type assertion'
      }],
      confidence: 0.6
    });
    
    return suggestions;
  }

  private async fixGenericConstraint(
    error: AnalyzedError,
    errorLine: string,
    fileContent: string
  ): Promise<TypeFixSuggestion[]> {
    const suggestions: TypeFixSuggestion[] = [];
    
    suggestions.push({
      type: 'add-generic',
      description: 'Add generic constraint',
      commands: [{
        type: 'replace',
        file: error.file,
        pattern: /<([^>]+)>/,
        replacement: '<$1 extends any>',
        description: 'Add generic constraint'
      }],
      confidence: 0.7
    });
    
    return suggestions;
  }

  private isMissingPropertyError(error: AnalyzedError): boolean {
    return error.message.includes('Property') && error.message.includes('does not exist');
  }

  private isTypeAssignmentError(error: AnalyzedError): boolean {
    return error.message.includes('Type') && error.message.includes('is not assignable');
  }

  private isGenericConstraintError(error: AnalyzedError): boolean {
    return error.message.includes('constraint') || error.code === 'TS2344';
  }
}