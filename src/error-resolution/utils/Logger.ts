import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  logDir: string;
  maxFileSize: number; // in bytes
  maxFiles: number;
}

export class Logger {
  private config: LoggerConfig;
  private logEntries: LogEntry[] = [];
  private currentLogFile: string | null = null;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: true,
      logDir: 'logs',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      ...config
    };

    this.initializeLogging();
  }

  /**
   * Logs a debug message
   */
  public debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Logs an info message
   */
  public info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Logs a warning message
   */
  public warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Logs an error message
   */
  public error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Logs progress information
   */
  public progress(phase: string, progress: number, message: string): void {
    const progressBar = this.createProgressBar(progress);
    const formattedMessage = `[${phase}] ${progressBar} ${progress.toFixed(1)}% - ${message}`;
    this.info(formattedMessage, { phase, progress });
  }

  /**
   * Logs performance metrics
   */
  public metrics(metrics: Record<string, number>): void {
    const metricsStr = Object.entries(metrics)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    this.info(`📊 Metrics: ${metricsStr}`, { metrics });
  }

  /**
   * Logs operation start
   */
  public startOperation(operation: string, details?: Record<string, any>): void {
    this.info(`🚀 Starting: ${operation}`, { operation: 'start', ...details });
  }

  /**
   * Logs operation completion
   */
  public completeOperation(operation: string, duration: number, details?: Record<string, any>): void {
    this.info(`✅ Completed: ${operation} (${this.formatDuration(duration)})`, {
      operation: 'complete',
      duration,
      ...details
    });
  }

  /**
   * Logs operation failure
   */
  public failOperation(operation: string, error: Error, details?: Record<string, any>): void {
    this.error(`❌ Failed: ${operation}`, error, { operation: 'fail', ...details });
  }

  /**
   * Gets recent log entries
   */
  public getRecentLogs(count = 100): LogEntry[] {
    return this.logEntries.slice(-count);
  }

  /**
   * Gets logs by level
   */
  public getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logEntries.filter(entry => entry.level === level);
  }

  /**
   * Exports logs to a file
   */
  public async exportLogs(filePath: string, format: 'json' | 'text' = 'json'): Promise<void> {
    try {
      let content: string;

      if (format === 'json') {
        content = JSON.stringify(this.logEntries, null, 2);
      } else {
        content = this.logEntries
          .map(entry => this.formatLogEntry(entry))
          .join('\n');
      }

      await fs.promises.writeFile(filePath, content, 'utf8');
      this.info(`📄 Logs exported to: ${filePath}`);
    } catch (error) {
      this.error('Failed to export logs', error as Error, { filePath, format });
    }
  }

  /**
   * Clears log entries from memory
   */
  public clearLogs(): void {
    const count = this.logEntries.length;
    this.logEntries = [];
    this.info(`🧹 Cleared ${count} log entries from memory`);
  }

  /**
   * Creates a summary report of logged activities
   */
  public createSummaryReport(): {
    totalEntries: number;
    entriesByLevel: Record<string, number>;
    errorCount: number;
    warningCount: number;
    timeRange: { start: Date; end: Date } | null;
    topErrors: string[];
  } {
    const entriesByLevel: Record<string, number> = {
      DEBUG: 0,
      INFO: 0,
      WARN: 0,
      ERROR: 0
    };

    const errors: string[] = [];

    for (const entry of this.logEntries) {
      const levelName = LogLevel[entry.level];
      entriesByLevel[levelName]++;

      if (entry.level === LogLevel.ERROR && entry.error) {
        errors.push(entry.error.message);
      }
    }

    // Get top 5 most common errors
    const errorCounts = errors.reduce((acc, error) => {
      acc[error] = (acc[error] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topErrors = Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([error]) => error);

    const timeRange = this.logEntries.length > 0 ? {
      start: this.logEntries[0].timestamp,
      end: this.logEntries[this.logEntries.length - 1].timestamp
    } : null;

    return {
      totalEntries: this.logEntries.length,
      entriesByLevel,
      errorCount: entriesByLevel.ERROR,
      warningCount: entriesByLevel.WARN,
      timeRange,
      topErrors
    };
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (level < this.config.level) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      error
    };

    this.logEntries.push(entry);

    // Console output
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }

    // File output
    if (this.config.enableFile) {
      this.outputToFile(entry);
    }
  }

  /**
   * Outputs log entry to console
   */
  private outputToConsole(entry: LogEntry): void {
    const formatted = this.formatLogEntry(entry);
    const levelName = LogLevel[entry.level];

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.log(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        if (entry.error) {
          console.error(entry.error.stack);
        }
        break;
    }
  }

  /**
   * Outputs log entry to file
   */
  private async outputToFile(entry: LogEntry): Promise<void> {
    try {
      if (!this.currentLogFile) {
        this.currentLogFile = this.createLogFileName();
      }

      // Check if current log file is too large
      if (await this.isLogFileTooLarge(this.currentLogFile)) {
        await this.rotateLogFile();
        this.currentLogFile = this.createLogFileName();
      }

      const formatted = this.formatLogEntry(entry) + '\n';
      const logPath = path.join(this.config.logDir, this.currentLogFile);

      await fs.promises.appendFile(logPath, formatted, 'utf8');
    } catch (error) {
      // Avoid infinite recursion by not logging this error
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Formats a log entry for output
   */
  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level].padEnd(5);
    let formatted = `[${timestamp}] ${level} ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      formatted += ` | Context: ${JSON.stringify(entry.context)}`;
    }

    if (entry.error) {
      formatted += ` | Error: ${entry.error.message}`;
    }

    return formatted;
  }

  /**
   * Creates a progress bar string
   */
  private createProgressBar(progress: number, width = 20): string {
    const filled = Math.round((progress / 100) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  /**
   * Formats duration in human readable format
   */
  private formatDuration(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    }

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Initializes logging system
   */
  private async initializeLogging(): Promise<void> {
    if (this.config.enableFile) {
      try {
        await fs.promises.mkdir(this.config.logDir, { recursive: true });
      } catch (error) {
        console.error('Failed to create log directory:', error);
        this.config.enableFile = false;
      }
    }
  }

  /**
   * Creates a new log file name
   */
  private createLogFileName(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `error-resolution-${timestamp}.log`;
  }

  /**
   * Checks if log file is too large
   */
  private async isLogFileTooLarge(fileName: string): Promise<boolean> {
    try {
      const logPath = path.join(this.config.logDir, fileName);
      const stats = await fs.promises.stat(logPath);
      return stats.size >= this.config.maxFileSize;
    } catch {
      return false; // File doesn't exist yet
    }
  }

  /**
   * Rotates log files when they get too large
   */
  private async rotateLogFile(): Promise<void> {
    try {
      // Get all log files
      const files = await fs.promises.readdir(this.config.logDir);
      const logFiles = files
        .filter(file => file.startsWith('error-resolution-') && file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.config.logDir, file),
          stats: null as any
        }));

      // Get file stats
      for (const file of logFiles) {
        try {
          file.stats = await fs.promises.stat(file.path);
        } catch {
          // Ignore files that can't be accessed
        }
      }

      // Sort by creation time (oldest first)
      logFiles.sort((a, b) => {
        if (!a.stats || !b.stats) return 0;
        return a.stats.birthtime.getTime() - b.stats.birthtime.getTime();
      });

      // Delete old files if we have too many
      while (logFiles.length >= this.config.maxFiles) {
        const oldestFile = logFiles.shift();
        if (oldestFile) {
          await fs.promises.unlink(oldestFile.path);
          this.info(`🗑️ Deleted old log file: ${oldestFile.name}`);
        }
      }
    } catch (error) {
      console.error('Failed to rotate log files:', error);
    }
  }
}

// Create default logger instance
export const logger = new Logger();