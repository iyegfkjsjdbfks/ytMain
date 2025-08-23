import { Logger } from '../utils/Logger';
import { AnalyzedError, ScriptCommand } from '../types';
import * as fs from 'fs';

export interface LogicFixSuggestion {
  type: 'null-check' | 'async-fix' | 'error-handling' | 'promise-fix';
  description: string;
  commands: ScriptCommand[];
  confidence: number;
}

export class LogicFixer {
  private logger: Logger;
  private projectRoot: string;

  constructor(projectRoot: string, logger?: Logger) {
    this.logger = logger || new Logger();
    this.projectRoot = projectRoot;
  }

  /**
   * Fixes logic and runtime errors
   */
  public async fixLogicErrors(errors: AnalyzedError[]): Promise<ScriptCommand[]> {
    this.logger.info('LOGIC_FIXER', `Fixing ${errors.length} logic-related errors`);
    
    const commands: ScriptCommand[] = [];
    
    for (const error of errors) {
      try {
        const suggestions = await this.analyzeLogicError(error);
        
        if (suggestions.length > 0) {
          const bestSuggestion = suggestions.sort((a, b) => b.confidence - a.confidence)[0];
          commands.push(...bestSuggestion.commands);
          
          this.logger.debug('LOGIC_FIXER', 
            `Applied fix for ${error.code} in ${error.file}: ${bestSuggestion.description}`
          );
        }
      } catch (fixError) {
        this.logger.error('LOGIC_FIXER', 
          `Failed to fix logic error in ${error.file}: ${fixError}`, fixError as Error
        );
      }
    }
    
    this.logger.info('LOGIC_FIXER', `Generated ${commands.length} logic fix commands`);
    return commands;
  }

  /**
   * Analyzes a specific logic error and suggests fixes
   */
  public async analyzeLogicError(error: AnalyzedError): Promise<LogicFixSuggestion[]> {
    const suggestions: LogicFixSuggestion[] = [];
    
    const fileContent = await fs.promises.readFile(error.file, 'utf8');
    const lines = fileContent.split('\n');
    const errorLine = lines[error.line - 1];
    
    if (this.isNullUndefinedError(error)) {
      suggestions.push(...await this.fixNullUndefined(error, errorLine, fileContent));
    }
    
    if (this.isAsyncAwaitError(error)) {
      suggestions.push(...await this.fixAsyncAwait(error, errorLine, fileContent));
    }
    
    if (this.isPromiseError(error)) {
      suggestions.push(...await this.fixPromise(error, errorLine, fileContent));
    }
    
    return suggestions;
  }

  private async fixNullUndefined(
    error: AnalyzedError,
    errorLine: string,
    fileContent: string
  ): Promise<LogicFixSuggestion[]> {
    const suggestions: LogicFixSuggestion[] = [];
    
    suggestions.push({
      type: 'null-check',
      description: 'Add null/undefined check',
      commands: [{
        type: 'replace',
        file: error.file,
        pattern: new RegExp(`(\\w+)\\.(\\w+)`),
        replacement: '$1?.$2',
        description: 'Add optional chaining'
      }],
      confidence: 0.8
    });
    
    return suggestions;
  }

  private async fixAsyncAwait(
    error: AnalyzedError,
    errorLine: string,
    fileContent: string
  ): Promise<LogicFixSuggestion[]> {
    const suggestions: LogicFixSuggestion[] = [];
    
    suggestions.push({
      type: 'async-fix',
      description: 'Add await keyword',
      commands: [{
        type: 'replace',
        file: error.file,
        pattern: /(\w+\([^)]*\))/,
        replacement: 'await $1',
        description: 'Add await'
      }],
      confidence: 0.7
    });
    
    return suggestions;
  }

  private async fixPromise(
    error: AnalyzedError,
    errorLine: string,
    fileContent: string
  ): Promise<LogicFixSuggestion[]> {
    const suggestions: LogicFixSuggestion[] = [];
    
    suggestions.push({
      type: 'promise-fix',
      description: 'Add promise handling',
      commands: [{
        type: 'replace',
        file: error.file,
        pattern: /(.+)/,
        replacement: '$1.catch(console.error)',
        description: 'Add error handling'
      }],
      confidence: 0.6
    });
    
    return suggestions;
  }

  private isNullUndefinedError(error: AnalyzedError): boolean {
    return error.message.includes('null') || error.message.includes('undefined');
  }

  private isAsyncAwaitError(error: AnalyzedError): boolean {
    return error.message.includes('await') || error.message.includes('async');
  }

  private isPromiseError(error: AnalyzedError): boolean {
    return error.message.includes('Promise') || error.code === 'TS2794';
  }
}