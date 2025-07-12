/**
 * Conditional Logger Utility
 * Provides environment-aware logging with proper levels
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: Date;
  source?: string;
}

class ConditionalLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isDebugMode = process.env.VITE_DEBUG === 'true' || this.isDevelopment;
  private logLevel: LogLevel;

  constructor() {
    // Set log level based on environment
    if (this.isDevelopment) {
      this.logLevel = LogLevel.DEBUG;
    } else {
      this.logLevel = LogLevel.ERROR;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(level: LogLevel, message: string, source?: string): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const sourcePrefix = source ? `[${source}]` : '';
    return `${timestamp} ${levelName}${sourcePrefix}: ${message}`;
  }

  private createLogEntry(level: LogLevel, message: string, data?: unknown, source?: string): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date(),
      source
    };
  }

  error(message: string, data?: unknown, source?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formattedMessage = this.formatMessage(LogLevel.ERROR, message, source);
      console.error(formattedMessage, data || '');
    }
  }

  warn(message: string, data?: unknown, source?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formattedMessage = this.formatMessage(LogLevel.WARN, message, source);
      console.warn(formattedMessage, data || '');
    }
  }

  info(message: string, data?: unknown, source?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formattedMessage = this.formatMessage(LogLevel.INFO, message, source);
      console.info(formattedMessage, data || '');
    }
  }

  debug(message: string, data?: unknown, source?: string): void {
    if (this.shouldLog(LogLevel.DEBUG) && this.isDebugMode) {
      const formattedMessage = this.formatMessage(LogLevel.DEBUG, message, source);
      console.log(formattedMessage, data || '');
    }
  }

  // Performance logging for development
  time(label: string): void {
    if (this.isDebugMode) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDebugMode) {
      console.timeEnd(label);
    }
  }

  // Group logging for complex operations
  group(label: string): void {
    if (this.isDebugMode) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.isDebugMode) {
      console.groupEnd();
    }
  }

  // API response logging with sanitization
  apiResponse(endpoint: string, response: unknown, duration?: number): void {
    if (this.isDebugMode) {
      const message = duration 
        ? `API Response from ${endpoint} (${duration}ms)`
        : `API Response from ${endpoint}`;
      this.debug(message, this.sanitizeApiResponse(response), 'API');
    }
  }

  // API error logging
  apiError(endpoint: string, error: unknown): void {
    const message = `API Error from ${endpoint}`;
    this.error(message, this.sanitizeError(error), 'API');
  }

  private sanitizeApiResponse(response: unknown): unknown {
    if (typeof response === 'object' && response !== null) {
      // Remove sensitive data from logs
      const sanitized = { ...response as Record<string, unknown> };
      delete sanitized.apiKey;
      delete sanitized.token;
      delete sanitized.authorization;
      return sanitized;
    }
    return response;
  }

  private sanitizeError(error: unknown): unknown {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: this.isDebugMode ? error.stack : undefined
      };
    }
    return error;
  }
}

// Export singleton instance
export const conditionalLogger = new ConditionalLogger();

// Export for testing
export { ConditionalLogger };

// Convenience exports
export const { error, warn, info, debug, time, timeEnd, group, groupEnd, apiResponse, apiError } = conditionalLogger;