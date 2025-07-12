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
      enableConsole: typeof window !== 'undefined' && window.location.hostname === 'localhost',
      enableRemote: false,
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logLevels[level] >= this.logLevels[this.config.level];
  }

  private formatMessage(level: LogLevel, message: string, ..._args: any[]): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return `${prefix} ${message}`;
  }

  debug(message: string, ...args: any[]): void {
    if (!this.shouldLog('debug')) {
return;
}

    if (this.config.enableConsole) {
      // eslint-disable-next-line no-console
      console.debug(this.formatMessage('debug', message), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (!this.shouldLog('info')) {
return;
}

    if (this.config.enableConsole) {
      // eslint-disable-next-line no-console
      console.info(this.formatMessage('info', message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (!this.shouldLog('warn')) {
return;
}

    if (this.config.enableConsole) {
      // eslint-disable-next-line no-console
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: string, error?: Error | unknown, ...args: any[]): void {
    if (!this.shouldLog('error')) {
return;
}

    if (this.config.enableConsole) {
      // eslint-disable-next-line no-console
      console.error(this.formatMessage('error', message), error, ...args);
    }

    // In production, you might want to send errors to a remote service
    if (this.config.enableRemote && error instanceof Error) {
      this.sendToRemoteService(message, error);
    }
  }

  private sendToRemoteService(_message: string, _error: Error): void {
    // Implement remote logging service integration here
    // For example: Sentry, LogRocket, etc.
  }

  // Utility methods for common logging patterns
  apiCall(method: string, url: string, data?: any): void {
    this.debug(`API ${method} ${url}`, data);
  }

  apiResponse(method: string, url: string, status: number, data?: any): void {
    if (status >= 400) {
      this.error(`API ${method} ${url} failed with status ${status}`, undefined, data);
    } else {
      this.debug(`API ${method} ${url} succeeded with status ${status}`, data);
    }
  }

  userAction(action: string, data?: any): void {
    this.info(`User action: ${action}`, data);
  }

  performance(operation: string, duration: number): void {
    this.debug(`Performance: ${operation} took ${duration}ms`);
  }
}

// Create default logger instance
export const logger = new Logger();

// Export Logger class for custom instances
export { Logger };
export type { LogLevel, LoggerConfig };