/**
 * Centralized logging utility for the application
 * Provides different log levels and can be configured for production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
}

class Logger {
  private config: LoggerConfig;
  private logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: 'info',
      enableConsole:
        typeof window !== 'undefined' &&
        window.location.hostname === 'localhost',
      enableRemote: false,
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logLevels[level] >= this.logLevels[this.config.level];
  }

  private formatMessage(
    level: LogLevel,
    message: any,
    ...args: unknown[]
  ): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return `${prefix} ${message}`;
  }

  debug(message: any, ...args: unknown[]): void {
    if (!this.shouldLog('debug')) {
      return;
    }

    if (this.config.enableConsole) {
      // eslint-disable-next-line no-console
      console.debug(this.formatMessage('debug', message), ...args);
    }
  }

  info(message: any, ...args: unknown[]): void {
    if (!this.shouldLog('info')) {
      return;
    }

    if (this.config.enableConsole) {
      // eslint-disable-next-line no-console
      console.info(this.formatMessage('info', message), ...args);
    }
  }

  warn(message: any, ...args: unknown[]): void {
    if (!this.shouldLog('warn')) {
      return;
    }

    if (this.config.enableConsole) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: any, error?: Error | unknown, ...args: unknown[]): void {
    if (!this.shouldLog('error')) {
      return;
    }

    if (this.config.enableConsole) {
      console.error(this.formatMessage('error', message), error, ...args);
    }

    // In production, you might want to send errors to a remote service
    if (this.config.enableRemote && error instanceof Error) {
      this.sendToRemoteService(message, error);
    }
  }

  private sendToRemoteService(_message: any, _error: Error): void {
    // Implement remote logging service integration here
    // For example: Sentry, LogRocket, etc.
  }

  // Utility methods for common logging patterns
  apiCall(method: any, url: any, data?: unknown): void {
    this.debug(`API ${method} ${url}`, data);
  }

  apiResponse(method: any, url: any, status: any, data?: unknown): void {
    if (status >= 400) {
      this.error(
        `API ${method} ${url} failed with status ${status}`,
        undefined,
        data
      );
    } else {
      this.debug(`API ${method} ${url} succeeded with status ${status}`, data);
    }
  }

  userAction(action: any, data?: Record<string, unknown>): void {
    this.info(`User action: ${action}`, data);
  }

  performance(operation: any, duration: any): void {
    this.debug(`Performance: ${operation} took ${duration}ms`);
  }
}

// Create default logger instance
export const logger = new Logger();

// Export Logger class for custom instances
export { Logger };
export type { LogLevel, LoggerConfig };
