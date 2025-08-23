import { EventEmitter } from 'events';
import { Logger } from '../utils/Logger';
import { ChildProcess } from 'child_process';
import * as os from 'os';
import * as fs from 'fs';

export interface ProcessInfo {
  id: string;
  name: string;
  command: string;
  args: string[];
  pid?: number;
  startTime: Date;
  endTime?: Date;
  status: 'starting' | 'running' | 'completed' | 'failed' | 'timeout' | 'killed';
  exitCode?: number;
  memoryUsage?: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
  timeoutSeconds: number;
  maxMemoryMB: number;
}

export interface ProcessMetrics {
  totalProcesses: number;
  runningProcesses: number;
  completedProcesses: number;
  failedProcesses: number;
  timeoutProcesses: number;
  averageExecutionTime: number;
  peakMemoryUsage: number;
  totalCpuTime: number;
}

export interface SystemResources {
  totalMemoryMB: number;
  freeMemoryMB: number;
  usedMemoryMB: number;
  memoryUsagePercent: number;
  cpuLoadAverage: number[];
  processCount: number;
  timestamp: Date;
}

export interface TimeoutConfig {
  defaultTimeoutSeconds: number;
  maxTimeoutSeconds: number;
  stuckDetectionIntervalMs: number;
  memoryLimitMB: number;
  cpuThresholdPercent: number;
}

export class ProcessMonitor extends EventEmitter {
  private logger: Logger;
  private processes: Map<string, ProcessInfo> = new Map();
  private childProcesses: Map<string, ChildProcess> = new Map();
  private timeoutConfig: TimeoutConfig;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private resourceMonitoringInterval: NodeJS.Timeout | null = null;
  private isShuttingDown: boolean = false;
  private shutdownTimeout: NodeJS.Timeout | null = null;

  constructor(
    timeoutConfig: Partial<TimeoutConfig> = {},
    logger?: Logger
  ) {
    super();
    this.logger = logger || new Logger();
    
    this.timeoutConfig = {
      defaultTimeoutSeconds: 300, // 5 minutes
      maxTimeoutSeconds: 1800, // 30 minutes
      stuckDetectionIntervalMs: 30000, // 30 seconds
      memoryLimitMB: 1024, // 1GB
      cpuThresholdPercent: 80,
      ...timeoutConfig
    };

    this.startMonitoring();
  }

  /**
   * Registers a new process for monitoring
   */
  public registerProcess(
    id: string,
    name: string,
    command: string,
    args: string[] = [],
    timeoutSeconds?: number,
    maxMemoryMB?: number
  ): ProcessInfo {
    const processInfo: ProcessInfo = {
      id,
      name,
      command,
      args,
      startTime: new Date(),
      status: 'starting',
      timeoutSeconds: timeoutSeconds || this.timeoutConfig.defaultTimeoutSeconds,
      maxMemoryMB: maxMemoryMB || this.timeoutConfig.memoryLimitMB
    };

    this.processes.set(id, processInfo);
    this.logger.info('PROCESS_MONITOR', `Registered process: ${name} (${id})`);
    
    this.emit('processRegistered', processInfo);
    return processInfo;
  }

  /**
   * Associates a child process with a registered process
   */
  public attachChildProcess(processId: string, childProcess: ChildProcess): void {
    const processInfo = this.processes.get(processId);
    if (!processInfo) {
      throw new Error(`Process not found: ${processId}`);
    }

    processInfo.pid = childProcess.pid;
    processInfo.status = 'running';
    
    this.childProcesses.set(processId, childProcess);
    
    // Set up process event handlers
    this.setupProcessHandlers(processId, childProcess);
    
    // Set up timeout
    this.setupProcessTimeout(processId);
    
    this.logger.info('PROCESS_MONITOR', `Attached child process: ${processInfo.name} (PID: ${childProcess.pid})`);
    this.emit('processStarted', processInfo);
  }

  /**
   * Marks a process as completed
   */
  public completeProcess(processId: string, exitCode: number = 0): void {
    const processInfo = this.processes.get(processId);
    if (!processInfo) {
      this.logger.warn('PROCESS_MONITOR', `Attempted to complete unknown process: ${processId}`);
      return;
    }

    processInfo.status = exitCode === 0 ? 'completed' : 'failed';
    processInfo.exitCode = exitCode;
    processInfo.endTime = new Date();
    
    // Clean up child process reference
    this.childProcesses.delete(processId);
    
    const duration = processInfo.endTime.getTime() - processInfo.startTime.getTime();
    
    this.logger.info('PROCESS_MONITOR', 
      `Process completed: ${processInfo.name} (${duration}ms, exit code: ${exitCode})`
    );
    
    this.emit('processCompleted', processInfo);
  }

  /**
   * Kills a process due to timeout
   */
  public timeoutProcess(processId: string, reason: string = 'Timeout'): void {
    const processInfo = this.processes.get(processId);
    const childProcess = this.childProcesses.get(processId);
    
    if (!processInfo) {
      this.logger.warn('PROCESS_MONITOR', `Attempted to timeout unknown process: ${processId}`);
      return;
    }

    processInfo.status = 'timeout';
    processInfo.endTime = new Date();
    
    if (childProcess && !childProcess.killed) {
      this.logger.warn('PROCESS_MONITOR', `Killing process due to timeout: ${processInfo.name} (${reason})`);
      
      // Try graceful shutdown first
      childProcess.kill('SIGTERM');
      
      // Force kill after 5 seconds if still running
      setTimeout(() => {
        if (!childProcess.killed) {
          childProcess.kill('SIGKILL');
        }
      }, 5000);
    }
    
    this.childProcesses.delete(processId);
    this.emit('processTimeout', processInfo, reason);
  }

  /**
   * Kills a process
   */
  public killProcess(processId: string, signal: NodeJS.Signals = 'SIGTERM'): void {
    const processInfo = this.processes.get(processId);
    const childProcess = this.childProcesses.get(processId);
    
    if (!processInfo) {
      this.logger.warn('PROCESS_MONITOR', `Attempted to kill unknown process: ${processId}`);
      return;
    }

    processInfo.status = 'killed';
    processInfo.endTime = new Date();
    
    if (childProcess && !childProcess.killed) {
      this.logger.info('PROCESS_MONITOR', `Killing process: ${processInfo.name} (${signal})`);
      childProcess.kill(signal);
    }
    
    this.childProcesses.delete(processId);
    this.emit('processKilled', processInfo, signal);
  }

  /**
   * Gets information about a specific process
   */
  public getProcessInfo(processId: string): ProcessInfo | undefined {
    return this.processes.get(processId);
  }

  /**
   * Gets all processes
   */
  public getAllProcesses(): ProcessInfo[] {
    return Array.from(this.processes.values());
  }

  /**
   * Gets running processes
   */
  public getRunningProcesses(): ProcessInfo[] {
    return Array.from(this.processes.values()).filter(p => p.status === 'running');
  }

  /**
   * Gets process metrics
   */
  public getProcessMetrics(): ProcessMetrics {
    const processes = Array.from(this.processes.values());
    
    const runningProcesses = processes.filter(p => p.status === 'running').length;
    const completedProcesses = processes.filter(p => p.status === 'completed').length;
    const failedProcesses = processes.filter(p => p.status === 'failed').length;
    const timeoutProcesses = processes.filter(p => p.status === 'timeout').length;
    
    const completedWithTimes = processes.filter(p => p.endTime);
    const averageExecutionTime = completedWithTimes.length > 0
      ? completedWithTimes.reduce((sum, p) => {
          return sum + (p.endTime!.getTime() - p.startTime.getTime());
        }, 0) / completedWithTimes.length
      : 0;
    
    const peakMemoryUsage = processes.reduce((max, p) => {
      return Math.max(max, p.memoryUsage?.heapUsed || 0);
    }, 0);
    
    const totalCpuTime = processes.reduce((sum, p) => {
      return sum + (p.cpuUsage?.user || 0) + (p.cpuUsage?.system || 0);
    }, 0);

    return {
      totalProcesses: processes.length,
      runningProcesses,
      completedProcesses,
      failedProcesses,
      timeoutProcesses,
      averageExecutionTime,
      peakMemoryUsage,
      totalCpuTime
    };
  }

  /**
   * Gets current system resources
   */
  public getSystemResources(): SystemResources {
    const totalMemoryMB = os.totalmem() / (1024 * 1024);
    const freeMemoryMB = os.freemem() / (1024 * 1024);
    const usedMemoryMB = totalMemoryMB - freeMemoryMB;
    const memoryUsagePercent = (usedMemoryMB / totalMemoryMB) * 100;
    
    return {
      totalMemoryMB,
      freeMemoryMB,
      usedMemoryMB,
      memoryUsagePercent,
      cpuLoadAverage: os.loadavg(),
      processCount: this.getRunningProcesses().length,
      timestamp: new Date()
    };
  }

  /**
   * Checks for stuck processes
   */
  public checkForStuckProcesses(): ProcessInfo[] {
    const stuckProcesses: ProcessInfo[] = [];
    const now = Date.now();
    
    for (const processInfo of this.processes.values()) {
      if (processInfo.status === 'running') {
        const runningTime = now - processInfo.startTime.getTime();
        const timeoutMs = processInfo.timeoutSeconds * 1000;
        
        if (runningTime > timeoutMs) {
          stuckProcesses.push(processInfo);
        }
      }
    }
    
    return stuckProcesses;
  }

  /**
   * Performs graceful shutdown
   */
  public async gracefulShutdown(timeoutMs: number = 30000): Promise<void> {
    this.logger.info('PROCESS_MONITOR', 'Starting graceful shutdown...');
    this.isShuttingDown = true;
    
    // Stop monitoring
    this.stopMonitoring();
    
    const runningProcesses = this.getRunningProcesses();
    
    if (runningProcesses.length === 0) {
      this.logger.info('PROCESS_MONITOR', 'No running processes, shutdown complete');
      return;
    }
    
    this.logger.info('PROCESS_MONITOR', `Shutting down ${runningProcesses.length} running processes...`);
    
    // Send SIGTERM to all running processes
    for (const processInfo of runningProcesses) {
      const childProcess = this.childProcesses.get(processInfo.id);
      if (childProcess && !childProcess.killed) {
        childProcess.kill('SIGTERM');
      }
    }
    
    // Wait for processes to exit gracefully
    const shutdownPromise = new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        const stillRunning = this.getRunningProcesses().length;
        if (stillRunning === 0) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 1000);
    });
    
    // Set up timeout for forced shutdown
    const timeoutPromise = new Promise<void>((resolve) => {
      this.shutdownTimeout = setTimeout(() => {
        this.logger.warn('PROCESS_MONITOR', 'Graceful shutdown timeout, forcing kill...');
        
        // Force kill remaining processes
        for (const processInfo of this.getRunningProcesses()) {
          const childProcess = this.childProcesses.get(processInfo.id);
          if (childProcess && !childProcess.killed) {
            childProcess.kill('SIGKILL');
          }
        }
        
        resolve();
      }, timeoutMs);
    });
    
    await Promise.race([shutdownPromise, timeoutPromise]);
    
    if (this.shutdownTimeout) {
      clearTimeout(this.shutdownTimeout);
      this.shutdownTimeout = null;
    }
    
    this.logger.info('PROCESS_MONITOR', 'Graceful shutdown complete');
  }

  /**
   * Cleans up completed processes from memory
   */
  public cleanupCompletedProcesses(olderThanMs: number = 3600000): void { // 1 hour default
    const cutoffTime = Date.now() - olderThanMs;
    const toRemove: string[] = [];
    
    for (const [id, processInfo] of this.processes.entries()) {
      if (processInfo.status !== 'running' && 
          processInfo.endTime && 
          processInfo.endTime.getTime() < cutoffTime) {
        toRemove.push(id);
      }
    }
    
    for (const id of toRemove) {
      this.processes.delete(id);
    }
    
    if (toRemove.length > 0) {
      this.logger.debug('PROCESS_MONITOR', `Cleaned up ${toRemove.length} completed processes`);
    }
  }

  /**
   * Sets up process event handlers
   */
  private setupProcessHandlers(processId: string, childProcess: ChildProcess): void {
    const processInfo = this.processes.get(processId)!;
    
    childProcess.on('exit', (code, signal) => {
      this.logger.debug('PROCESS_MONITOR', 
        `Process exited: ${processInfo.name} (code: ${code}, signal: ${signal})`
      );
      this.completeProcess(processId, code || 0);
    });
    
    childProcess.on('error', (error) => {
      this.logger.error('PROCESS_MONITOR', 
        `Process error: ${processInfo.name} - ${error.message}`, error
      );
      processInfo.status = 'failed';
      processInfo.endTime = new Date();
      this.emit('processError', processInfo, error);
    });
    
    // Monitor memory usage if available
    if (childProcess.pid) {
      this.startMemoryMonitoring(processId, childProcess.pid);
    }
  }

  /**
   * Sets up process timeout
   */
  private setupProcessTimeout(processId: string): void {
    const processInfo = this.processes.get(processId)!;
    
    setTimeout(() => {
      if (processInfo.status === 'running') {
        this.timeoutProcess(processId, `Exceeded timeout of ${processInfo.timeoutSeconds} seconds`);
      }
    }, processInfo.timeoutSeconds * 1000);
  }

  /**
   * Starts memory monitoring for a process
   */
  private startMemoryMonitoring(processId: string, pid: number): void {
    const processInfo = this.processes.get(processId)!;
    
    const memoryInterval = setInterval(() => {
      if (processInfo.status !== 'running') {
        clearInterval(memoryInterval);
        return;
      }
      
      try {
        // Update memory usage (Node.js process only)
        if (process.pid === pid) {
          processInfo.memoryUsage = process.memoryUsage();
          processInfo.cpuUsage = process.cpuUsage();
          
          // Check memory limit
          const memoryMB = processInfo.memoryUsage.heapUsed / (1024 * 1024);
          if (memoryMB > processInfo.maxMemoryMB) {
            this.timeoutProcess(processId, `Exceeded memory limit of ${processInfo.maxMemoryMB}MB`);
            clearInterval(memoryInterval);
          }
        }
      } catch (error) {
        // Process might have exited
        clearInterval(memoryInterval);
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Starts monitoring intervals
   */
  private startMonitoring(): void {
    // Process monitoring interval
    this.monitoringInterval = setInterval(() => {
      if (this.isShuttingDown) return;
      
      // Check for stuck processes
      const stuckProcesses = this.checkForStuckProcesses();
      for (const processInfo of stuckProcesses) {
        this.timeoutProcess(processInfo.id, 'Process appears to be stuck');
      }
      
      // Clean up old completed processes
      this.cleanupCompletedProcesses();
      
    }, this.timeoutConfig.stuckDetectionIntervalMs);
    
    // Resource monitoring interval
    this.resourceMonitoringInterval = setInterval(() => {
      if (this.isShuttingDown) return;
      
      const resources = this.getSystemResources();
      this.emit('systemResources', resources);
      
      // Check system resource limits
      if (resources.memoryUsagePercent > 90) {
        this.logger.warn('PROCESS_MONITOR', `High memory usage: ${resources.memoryUsagePercent.toFixed(1)}%`);
        this.emit('highMemoryUsage', resources);
      }
      
      if (resources.cpuLoadAverage[0] > this.timeoutConfig.cpuThresholdPercent / 100) {
        this.logger.warn('PROCESS_MONITOR', `High CPU load: ${resources.cpuLoadAverage[0].toFixed(2)}`);
        this.emit('highCpuLoad', resources);
      }
      
    }, 60000); // Check every minute
  }

  /**
   * Stops monitoring intervals
   */
  private stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    if (this.resourceMonitoringInterval) {
      clearInterval(this.resourceMonitoringInterval);
      this.resourceMonitoringInterval = null;
    }
  }

  /**
   * Gets monitoring statistics
   */
  public getMonitoringStatistics(): {
    uptime: number;
    processMetrics: ProcessMetrics;
    systemResources: SystemResources;
    timeoutConfig: TimeoutConfig;
  } {
    return {
      uptime: process.uptime() * 1000,
      processMetrics: this.getProcessMetrics(),
      systemResources: this.getSystemResources(),
      timeoutConfig: this.timeoutConfig
    };
  }
}