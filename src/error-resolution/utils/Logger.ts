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
  category: string;
  metadata?: any;
}

export interface LoggerConfig {
  level: LogLevel;
  outputFile?: string;
  maxFileSize: number;
  maxFiles: number;
  enableConsole: boolean;
  enableFile: boolean;
}

export class Logger {
  private config: LoggerConfig;
  private logEntries: LogEntry[] = [];
  private currentLogFile?: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      enableConsole: true,
      enableFile: true,
      ...config
    };

    if (this.config.enableFile) {
      this.initializeLogFile();
    }
  }

  /**
   * Logs a debug message
   */
  public debug(message: string, category = 'general', metadata?: any): void {
    this.log(LogLevel.DEBUG, message, category, metadata);
  }

  /**
   * Logs an info message
   */
  public info(message: string, category = 'general', metadata?: any): void {
    this.log(LogLevel.INFO, message, category, metadata);
  }

  /**
   * Logs a warning message
   */
  public warn(message: string, category = 'general', metadata?: any): void {
    this.log(LogLevel.WARN, message, category, metadata);
  }

  /**
   * Logs an error message
   */
  public error(message: string, category = 'general', metadata?: any): void {
    this.log(LogLevel.ERROR, message, category, metadata);
  }

  /**
   * Logs a message with specified level
   */
  public log(level: LogLevel, message: string, category = 'general', metadata?: any): void {
    if (level < this.config.level) {
      return; // Skip if below configured level
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      category,
      metadata
    };

    this.logEntries.push(entry);

    // Output to console if enabled
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }

    // Output to file if enabled
    if (this.config.enableFile) {
      this.outputToFile(entry);
    }

    // Cleanup old entries to prevent memory issues
    if (this.logEntries.length > 10000) {
      this.logEntries = this.logEntries.slice(-5000);
    }
  }

  /**
   * Gets log entries with optional filtering
   */
  public getEntries(filter?: {
    level?: LogLevel;
    category?: string;
    since?: Date;
    limit?: number;
  }): LogEntry[] {
    let entries = [...this.logEntries];

    if (filter) {
      if (filter.level !== undefined) {
        entries = entries.filter(e => e.level >= filter.level!);
      }
      
      if (filter.category) {
        entries = entries.filter(e => e.category === filter.category);
      }
      
      if (filter.since) {
        entries = entries.filter(e => e.timestamp >= filter.since!);
      }
      
      if (filter.limit) {
        entries = entries.slice(-filter.limit);
      }
    }

    return entries;
  }

  /**
   * Generates a log report
   */
  public generateReport(since?: Date): string {
    const entries = this.getEntries({ since });
    const report = [];

    report.push('📋 LOG REPORT');
    report.push('=============');
    report.push(`Total Entries: ${entries.length}`);
    
    if (since) {
      report.push(`Since: ${since.toLocaleString()}`);
    }

    // Count by level
    const levelCounts = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.ERROR]: 0
    };

    entries.forEach(entry => {
      levelCounts[entry.level]++;
    });

    report.push('');
    report.push('📊 BY LEVEL');
    report.push('===========');
    report.push(`Debug: ${levelCounts[LogLevel.DEBUG]}`);
    report.push(`Info: ${levelCounts[LogLevel.INFO]}`);
    report.push(`Warn: ${levelCounts[LogLevel.WARN]}`);
    report.push(`Error: ${levelCounts[LogLevel.ERROR]}`);

    // Count by category
    const categoryMap = new Map<string, number>();
    entries.forEach(entry => {
      const count = categoryMap.get(entry.category) || 0;
      categoryMap.set(entry.category, count + 1);
    });

    if (categoryMap.size > 0) {
      report.push('');
      report.push('📂 BY CATEGORY');
      report.push('==============');
      Array.from(categoryMap.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, count]) => {
          report.push(`${category}: ${count}`);
        });
    }

    // Recent errors
    const recentErrors = entries
      .filter(e => e.level === LogLevel.ERROR)
      .slice(-10);

    if (recentErrors.length > 0) {
      report.push('');
      report.push('🚨 RECENT ERRORS');
      report.push('================');
      recentErrors.forEach(entry => {
        report.push(`[${entry.timestamp.toLocaleTimeString()}] ${entry.category}: ${entry.message}`);
      });
    }

    return report.join('\n');
  }

  /**
   * Clears all log entries
   */
  public clear(): void {
    this.logEntries = [];
    this.info('Log entries cleared', 'logger');
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
      this.info(`Logs exported to ${filePath}`, 'logger');
    } catch (error) {
      this.error(`Failed to export logs: ${error}`, 'logger');
    }
  }

  /**
   * Outputs log entry to console
   */
  private outputToConsole(entry: LogEntry): void {
    const formatted = this.formatLogEntry(entry);
    const levelIcon = this.getLevelIcon(entry.level);
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`${levelIcon} ${formatted}`);
        break;
      case LogLevel.INFO:
        console.log(`${levelIcon} ${formatted}`);
        break;
      case LogLevel.WARN:
        console.warn(`${levelIcon} ${formatted}`);
        break;
      case LogLevel.ERROR:
        console.error(`${levelIcon} ${formatted}`);
        break;
    }
  }

  /**
   * Outputs log entry to file
   */
  private async outputToFile(entry: LogEntry): Promise<void> {
    if (!this.currentLogFile) {
      return;
    }

    try {
      const formatted = this.formatLogEntry(entry) + '\n';
      await fs.promises.appendFile(this.currentLogFile, formatted, 'utf8');
      
      // Check file size and rotate if needed
      await this.checkAndRotateLog();
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Initializes the log file
   */
  private initializeLogFile(): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = this.config.outputFile || `error-resolution-${timestamp}.log`;
    this.currentLogFile = path.resolve(fileName);
    
    // Ensure directory exists
    const dir = path.dirname(this.currentLogFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Checks log file size and rotates if necessary
   */
  private async checkAndRotateLog(): Promise<void> {
    if (!this.currentLogFile) {
      return;
    }

    try {
      const stats = await fs.promises.stat(this.currentLogFile);
      
      if (stats.size > this.config.maxFileSize) {
        await this.rotateLogFile();
      }
    } catch (error) {
      // File might not exist yet, ignore
    }
  }

  /**
   * Rotates the current log file
   */
  private async rotateLogFile(): Promise<void> {
    if (!this.currentLogFile) {
      return;
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedFile = this.currentLogFile.replace('.log', `-${timestamp}.log`);
      
      await fs.promises.rename(this.currentLogFile, rotatedFile);
      
      // Clean up old log files
      await this.cleanupOldLogs();
      
      this.info(`Log file rotated to ${rotatedFile}`, 'logger');
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }

  /**
   * Cleans up old log files
   */
  private async cleanupOldLogs(): Promise<void> {
    if (!this.currentLogFile) {
      return;
    }

    try {
      const dir = path.dirname(this.currentLogFile);
      const baseName = path.basename(this.currentLogFile, '.log');
      const files = await fs.promises.readdir(dir);
      
      const logFiles = files
        .filter(file => file.startsWith(baseName) && file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(dir, file),
          stats: fs.statSync(path.join(dir, file))
        }))
        .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      // Keep only the most recent files
      const filesToDelete = logFiles.slice(this.config.maxFiles);
      
      for (const file of filesToDelete) {
        await fs.promises.unlink(file.path);
        this.info(`Deleted old log file: ${file.name}`, 'logger');
      }
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

  /**
   * Formats a log entry for output
   */
  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level].padEnd(5);
    const category = entry.category.padEnd(12);
    
    let formatted = `[${timestamp}] ${level} [${category}] ${entry.message}`;
    
    if (entry.metadata) {
      formatted += ` | ${JSON.stringify(entry.metadata)}`;
    }
    
    return formatted;
  }

  /**
   * Gets icon for log level
   */
  private getLevelIcon(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return '🔍';
      case LogLevel.INFO: return 'ℹ️';
      case LogLevel.WARN: return '⚠️';
      case LogLevel.ERROR: return '❌';
      default: return '📝';
    }
  }
}

// Create default logger instance
export const logger = new Logger({
  level: LogLevel.INFO,
  outputFile: 'logs/error-resolution.log'
});