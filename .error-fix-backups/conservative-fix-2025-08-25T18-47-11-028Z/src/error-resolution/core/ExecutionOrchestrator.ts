import { execSync, exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/Logger';

export interface ExecutionOptions {
  projectPath: string;
  dryRun: boolean;
  backup: boolean;
  maxIterations: number;
  timeoutSeconds: number;
}

export interface ExecutionResult {
  success: boolean;
  errorsFixed: number;
  errorsRemaining: number;
  duration: number;
  phase: string;
  details: string[];
}

export class ExecutionOrchestrator {
  private options: ExecutionOptions;
  private startTime: number = 0;
  
  constructor(options: ExecutionOptions) {
    this.options = options;
  }

  async orchestrateErrorResolution(): Promise<ExecutionResult> {
    this.startTime = Date.now();
    logger.info('🚀 Starting TypeScript Error Resolution Orchestration');
    
    try {
      // Phase 1: Analyze current state
      const initialErrors = await this.getErrorCount();
      logger.info(`📊 Initial error count: ${initialErrors}`);
      
      if (initialErrors === 0) {
        return {
          success: true,
          errorsFixed: 0,
          errorsRemaining: 0,
          duration: Date.now() - this.startTime,
          phase: 'complete',
          details: ['No errors found - project is already clean!']
        };
      }

      // Phase 2: Create backup if requested
      if (this.options.backup && !this.options.dryRun) {
        await this.createBackup();
      }

      // Phase 3: Execute error resolution
      const result = await this.executeResolutionPhases(initialErrors);
      
      const duration = Date.now() - this.startTime;
      logger.info(`✅ Orchestration completed in ${duration}ms`);
      
      return {
        ...result,
        duration
      };
      
    } catch (error) {
      logger.error('❌ Orchestration failed:', error);
      throw error;
    }
  }

  private async executeResolutionPhases(initialErrors: number): Promise<ExecutionResult> {
    const phases = [
      { name: 'syntax', description: 'Syntax Error Resolution' },
      { name: 'imports', description: 'Import Error Resolution' },
      { name: 'types', description: 'Type Error Resolution' },
      { name: 'cleanup', description: 'Final Cleanup' }
    ];

    let currentErrors = initialErrors;
    const details: string[] = [];

    for (const phase of phases) {
      logger.info(`🔄 Starting ${phase.description}...`);
      
      const phaseStart = Date.now();
      const beforeCount = await this.getErrorCount();
      
      // Execute phase-specific resolution
      await this.executePhase(phase.name);
      
      const afterCount = await this.getErrorCount();
      const fixed = beforeCount - afterCount;
      const duration = Date.now() - phaseStart;
      
      details.push(`${phase.description}: Fixed ${fixed} errors in ${duration}ms`);
      logger.info(`📈 ${phase.description}: ${beforeCount} → ${afterCount} (fixed ${fixed})`);
      
      currentErrors = afterCount;
      
      // Early exit if no errors remain
      if (currentErrors === 0) {
        details.push('🎉 All errors resolved!');
        break;
      }
      
      // Break if no progress made
      if (fixed === 0) {
        details.push(`⚠️ ${phase.description}: No progress made, skipping remaining phases`);
        break;
      }
    }

    return {
      success: currentErrors < initialErrors,
      errorsFixed: initialErrors - currentErrors,
      errorsRemaining: currentErrors,
      duration: 0, // Will be set by caller
      phase: currentErrors === 0 ? 'complete' : 'partial',
      details
    };
  }

  private async executePhase(phaseName: string): Promise<void> {
    // This would integrate with the specialized fixers
    // For now, we'll use a simple approach
    
    if (this.options.dryRun) {
      logger.info(`🔍 DRY RUN: Would execute ${phaseName} phase`);
      return;
    }

    try {
      // Run basic TypeScript compilation to identify errors
      await this.runTypeScriptCheck();
    } catch (error) {
      // Expected - errors exist
    }
  }

  private async getErrorCount(): Promise<number> {
    try {
      const result = execSync('npx tsc --noEmit --skipLibCheck', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return 0; // No errors if successful
    } catch (error: any) {
      const output = error.stdout || error.stderr || '';
      const lines = output.split('\n');
      const errorLines = lines.filter((line: string) => line.includes('error TS'));
      return errorLines.length;
    }
  }

  private async runTypeScriptCheck(): Promise<string> {
    return new Promise((resolve: any, reject: any) => {
      exec('npx tsc --noEmit --skipLibCheck', (error, stdout, stderr) => {
        const output = stdout || stderr;
        if (error && output) {
          reject(new Error(output));
        } else {
          resolve(output);
        }
      });
    });
  }

  private async createBackup(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.options.projectPath, '.error-fix-backups', `backup-${timestamp}`);
    
    logger.info(`💾 Creating backup in ${backupDir}`);
    
    try {
      execSync(`mkdir -p "${backupDir}"`, { encoding: 'utf8' });
      execSync(`cp -r src "${backupDir}/"`, { 
        encoding: 'utf8',
        cwd: this.options.projectPath
      });
      
      logger.info(`✅ Backup created successfully`);
    } catch (error) {
      logger.error('❌ Backup creation failed:', error);
      throw error;
    }
  }
}

export default ExecutionOrchestrator;