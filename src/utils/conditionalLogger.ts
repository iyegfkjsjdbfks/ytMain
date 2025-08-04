
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


class ConditionalLogger {
  private isDevelopment: any;
  private isDebugMode: any;
  private logLevel: any;

  constructor() {
    // Simple and safe environment detection
    this.isDevelopment = this.detectDevelopmentMode();
    this.isDebugMode = this.detectDebugMode();

    // Set log level based on environment
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : any;
  }

  private detectDevelopmentMode(): boolean {
    try {
      // Check Vite environment first
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env.MODE === 'development';
      }
    } catch {}

    try {
      // Check Node.js environment
      if (typeof process !== 'undefined' && process.env) {
        return process.env.NODE_ENV === 'development';
      }
    } catch {}

    // Browser fallback - assume development if we can't determine
    return typeof window !== 'undefined';
  }

  private detectDebugMode(): boolean {
    try {
      // Check Vite debug flag first
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env.VITE_DEBUG === 'true';
      }
    } catch {}

    try {
      // Check Node.js debug flag
      if (typeof process !== 'undefined' && process.env) {
        return process.env.VITE_DEBUG === 'true';
      }
    } catch {}

    // Default to development mode setting
    return this.isDevelopment;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.currentLogLevel;
  }

  private formatMessage(level: LogLevel, message: any, source?: string): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const sourcePrefix = source ? `[${source}]` : '';
    return `${timestamp} ${levelName}${sourcePrefix}: ${message}`;
  }


  error(message: any, data?: unknown, source?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formattedMessage = this.formatMessage(LogLevel.ERROR, message, source);
      console.error(formattedMessage, data || '');
    }
  }

  warn(message: any, data?: unknown, source?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formattedMessage = this.formatMessage(LogLevel.WARN, message, source);
      console.warn(formattedMessage, data || '');
    }
  }

  info(message: any, data?: unknown, source?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formattedMessage = this.formatMessage(LogLevel.INFO, message, source);
      console.info(formattedMessage, data || '');
    }
  }

  debug(message: any, data?: unknown, source?: string): void {
    if (this.shouldLog(LogLevel.DEBUG) && this.isDebugMode) {
      const formattedMessage = this.formatMessage(LogLevel.DEBUG, message, source);
      console.debug(formattedMessage, data || '');
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
  apiResponse(endpoint: string, response: any, duration?: number): void {
    if (this.isDebugMode) {
      const message = duration
        ? `API Response from ${endpoint} (${duration}ms)`
        : `API Response from ${endpoint}`;
      this.debug(message, this.sanitizeApiResponse(response), 'API');
    }
  }

  // API error logging
  apiError(endpoint: string, error: any): void {
    const message = `API Error from ${endpoint}`;
    this.error(message, this.sanitizeError(error), 'API');
  }

  private sanitizeApiResponse(response: any): any {
    if (typeof response === 'object' && response !== null) {
      const sanitized = { ...response };
      delete sanitized.apiKey;
      delete sanitized.token;
      delete sanitized.authorization;
      return sanitized;
    }
    return response;
  }

  private sanitizeError(error: any): any {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
    return error;
  }
}

// Create singleton instance safely
let conditionalLoggerInstance: ConditionalLogger;

try {
  conditionalLoggerInstance = new ConditionalLogger();
} catch (error) {
  // Fallback logger if construction fails
  class FallbackLogger extends ConditionalLogger {
    constructor() {
      super();
    }

    override error(msg: any): void {
      console.error(msg);
    }
    override warn(msg: any): void {
      console.warn(msg);
    }
    override info(msg: any): void {
      console.info(msg);
    }
    override debug(msg: any): void {
      console.debug(msg);
    }
    override time(label: string): void {
      console.time(label);
    }
    override timeEnd(label: string): void {
      console.timeEnd(label);
    }
    override group(label: string): void {
      console.group(label);
    }
    override groupEnd(): void {
      console.groupEnd();
    }
    override apiResponse(): void {}
    override apiError(endpoint: string, err: any): void {
      console.error(`API Error from ${endpoint}:`, err);
    }
  }

  conditionalLoggerInstance = new FallbackLogger();
}

// Export singleton instance
export const conditionalLogger = conditionalLoggerInstance;

// Export for testing
export { ConditionalLogger };

// Convenience exports - safely destructure
export const error = conditionalLogger.error.bind(conditionalLogger);
export const warn = conditionalLogger.warn.bind(conditionalLogger);
export const info = conditionalLogger.info.bind(conditionalLogger);
export const debug = conditionalLogger.debug.bind(conditionalLogger);
export const time = conditionalLogger.time.bind(conditionalLogger);
export const timeEnd = conditionalLogger.timeEnd.bind(conditionalLogger);
export const group = conditionalLogger.group.bind(conditionalLogger);
export const groupEnd = conditionalLogger.groupEnd.bind(conditionalLogger);
export const apiResponse = conditionalLogger.apiResponse.bind(conditionalLogger);
export const apiError = conditionalLogger.apiError.bind(conditionalLogger);