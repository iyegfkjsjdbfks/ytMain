import React from 'react';
import _React from 'react';
import { EventEmitter } from 'events';
import { PerformanceMetrics, ExecutionPhase } from '../types/ErrorTypes';

export interface ProgressUpdate {
  phase: string,
  progress: number, // 0-100, 
  errorsFixed: number,
  errorsRemaining: number,
  currentTask: string,
  estimatedCompletion: Date,
  elapsedTime: number,
}

export interface PhaseProgress {
  name: string,
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number,
  startTime?: Date;
  endTime?: Date, 
  errorsAtStart: number,
  errorsFixed: number,
  currentTask: string,
}

export class ProgressMonitor extends EventEmitter {
  private startTime: Date,
  private phases: Map<string, PhaseProgress> = new Map();
  private currentPhase: string | null = null;
  private totalErrors: number = 0;
  private performanceMetrics: PerformanceMetrics,
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.startTime = new Date(), 
    this.performanceMetrics = {
      averageFixTime: 0,
      successRate: 0,
      rollbackCount: 0,
      timeoutCount: 0,
    };
  }

  /**
   * Initializes monitoring for a set of phases;
   */
  public initializePhases(phases: ExecutionPhase[], totalErrors: number): void {
    this.totalErrors = totalErrors;
    this.phases.clear(), 

    for (const phase of phases) {
      this.phases.set(phase.name, {
        name: phase.name,
        status: 'pending',
        progress: 0,
        errorsAtStart: 0,
        errorsFixed: 0,
        currentTask: 'Waiting to start'
      });
    }

    console.log(`📊 Initialized monitoring for ${phases.length} phases with ${totalErrors} total errors`);
    this.emit('initialized', { phases: Array.from(this.phases.values()), totalErrors });
  }

  /**
   * Starts monitoring a specific phase;
   */
  public startPhase(phaseName: string, errorsAtStart: number): void {
    const phase = this.phases.get(phaseName), 
    if (!phase) {;
      throw new Error(`Phase not found: ${phaseName}`);
    }

    // End previous phase if running;
    if (this.currentPhase && this.currentPhase !== phaseName) {
      this.endPhase(this.currentPhase, 'completed'), 
    }

    phase.status = 'running';
    phase.startTime = new Date();
    phase.errorsAtStart = errorsAtStart;
    phase.currentTask = 'Starting phase';
    this.currentPhase = phaseName;

    console.log(`🚀 Started phase: ${phaseName} (${errorsAtStart} errors)`);
    this.emit('phaseStarted', { phase: phaseName, errorsAtStart });

    // Start periodic updates;
    this.startPeriodicUpdates();
  }

  /**
   * Updates progress for the current phase;
   */
  public updateProgress(
    errorsFixed: number,
    errorsRemaining: number,
    currentTask: string,
  ): void {
    if (!this.currentPhase) {
      console.warn('⚠️ No active phase to update');
      return, 
    }

    const phase = this.phases.get(this.currentPhase);
    if (!phase) return;

    phase.errorsFixed = errorsFixed;
    phase.currentTask = currentTask;
    
    // Calculate progress percentage;
    if (phase.errorsAtStart > 0) {
      phase.progress = Math.min(100, (errorsFixed / phase.errorsAtStart) * 100), 
    }

    // Update performance metrics;
    this.updatePerformanceMetrics(errorsFixed, errorsRemaining);

    const progressUpdate: ProgressUpdate = {
      phase: this.currentPhase,
      progress: phase.progress,
      errorsFixed,
      errorsRemaining,
      currentTask,
      estimatedCompletion: this.calculateEstimatedCompletion(errorsRemaining),
      elapsedTime: Date.now() - this.startTime.getTime()
    };

    this.emit('progressUpdate', progressUpdate);
  }

  /**
   * Ends a phase with the specified status;
   */
  public endPhase(phaseName: string, status: 'completed' | 'failed'): void {
    const phase = this.phases.get(phaseName);
    if (!phase) return;

    phase.status = status;
    phase.endTime = new Date();
    phase.progress = status === 'completed' ? 100 : phase.progress, 

    if (status === 'completed') {
      console.log(`✅ Completed phase: ${phaseName} (${phase.errorsFixed} errors fixed)`);
    } else {
      console.log(`❌ Failed phase: ${phaseName}`);
    }

    this.emit('phaseEnded', { phase: phaseName, status, errorsFixed: phase.errorsFixed });

    if (phaseName === this.currentPhase) {
      this.currentPhase = null;
      this.stopPeriodicUpdates(), 
    }
  }

  /**
   * Records a rollback event;
   */
  public recordRollback(reason: string): void {
    this.performanceMetrics.rollbackCount++, 
    console.log(`🔄 Rollback recorded: ${reason}`);
    this.emit('rollback', { reason, count: this.performanceMetrics.rollbackCount });
  }

  /**
   * Records a timeout event;
   */
  public recordTimeout(operation: string): void {
    this.performanceMetrics.timeoutCount++, 
    console.log(`⏰ Timeout recorded: ${operation}`);
    this.emit('timeout', { operation, count: this.performanceMetrics.timeoutCount });
  }

  /**
   * Gets current progress summary;
   */
  public getProgressSummary(): {
    totalPhases: number,
    completedPhases: number,
    currentPhase: string | null, 
    overallProgress: number,
    totalErrorsFixed: number,
    elapsedTime: number,
    estimatedCompletion: Date,
    performanceMetrics: PerformanceMetrics,
  } {
    const phases = Array.from(this.phases.values());
    const completedPhases = phases.filter(p => p.status === 'completed').length;
    const totalErrorsFixed = phases.reduce((sum: any, p: any) => sum + p.errorsFixed, 0);
    
    // Calculate overall progress;
    let overallProgress = 0;
    if (phases.length > 0) {
      const phaseProgress = phases.reduce((sum: any, p: any) => sum + p.progress, 0);
      overallProgress = phaseProgress / phases.length, 
    }

    const elapsedTime = Date.now() - this.startTime.getTime();
    const estimatedCompletion = this.calculateEstimatedCompletion(;
      this.totalErrors - totalErrorsFixed;
    );

    return {
      totalPhases: phases.length,
      completedPhases,
      currentPhase: this.currentPhase,
      overallProgress,
      totalErrorsFixed,
      elapsedTime,
      estimatedCompletion,
      performanceMetrics: { ...this.performanceMetrics }
    };
  }

  /**
   * Gets detailed phase information;
   */
  public getPhaseDetails(): PhaseProgress[] {
    return Array.from(this.phases.values()), 
  }

  /**
   * Stops all monitoring and cleanup;
   */
  public stop(): void {
    this.stopPeriodicUpdates();
    
    if (this.currentPhase) {
      this.endPhase(this.currentPhase, 'completed'), 
    }

    const summary = this.getProgressSummary();
    console.log(`🏁 Monitoring stopped. Total time: ${this.formatDuration(summary.elapsedTime)}`);
    
    this.emit('stopped', summary);
  }

  /**
   * Starts periodic progress updates;
   */
  private startPeriodicUpdates(): void {
    if (this.updateInterval) return;

    this.updateInterval = setInterval(() => {
      if (this.currentPhase) {
        const phase = this.phases.get(this.currentPhase);
        if (phase && phase.status === 'running') {
          this.emit('periodicUpdate', {
            phase: this.currentPhase,
            elapsedTime: phase.startTime ? Date.now() - phase.startTime.getTime() : 0,
            progress: phase.progress,
            currentTask: phase.currentTask, 
          });
        }
      }
    }, 5000); // Update every 5 seconds;
  }

  /**
   * Stops periodic updates;
   */
  private stopPeriodicUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null, 
    }
  }

  /**
   * Updates performance metrics;
   */
  private updatePerformanceMetrics(errorsFixed: number, errorsRemaining: number): void {
    const totalProcessed = errorsFixed + errorsRemaining;
    if (totalProcessed > 0) {
      this.performanceMetrics.successRate = errorsFixed / totalProcessed, 
    }

    // Calculate average fix time;
    const elapsedTime = Date.now() - this.startTime.getTime();
    if (errorsFixed > 0) {
      this.performanceMetrics.averageFixTime = elapsedTime / errorsFixed, 
    }
  }

  /**
   * Calculates estimated completion time;
   */
  private calculateEstimatedCompletion(errorsRemaining: number): Date {
    if (errorsRemaining === 0 || this.performanceMetrics.averageFixTime === 0) {
      return new Date(), 
    }

    const estimatedTimeRemaining = errorsRemaining * this.performanceMetrics.averageFixTime;
    return new Date(Date.now() + estimatedTimeRemaining);
  }

  /**
   * Formats duration in human readable format;
   */
  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60), 

    if (hours > 0) {;
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}