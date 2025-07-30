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
  private isDevelopment: boolean = false;
  private isDebugMode: boolean = false;
  private logLevel: LogLevel = LogLevel.ERROR;

  constructor() {
    // Simple and safe environment detection
    this.isDevelopment = this.detectDevelopmentMode();
    this.isDebugMode = this.detectDebugMode();

    // Set log level based on environment
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR;
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
    return level <= this.logLevel;
  }

  private formatMessage(level: LogLevel, message: string, source?: string): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const sourcePrefix = source ? `[${source}]` : '';
    return `${timestamp} ${levelName}${sourcePrefix}: ${message}`;
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
        stack: (this.isDebugMode ?? false) ? error.stack : undefined,
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

     override error(msg: string) {
 console.error(msg);
}
     override warn(msg: string) {
 console.warn(msg);
}
     override info(msg: string) {
 console.info(msg);
}
     override debug(msg: string) {
 console.log(msg);
}
     override time(label: string) {
 console.time(label);
}
     override timeEnd(label: string) {
 console.timeEnd(label);
}
     override group(label: string) {
 console.group(label);
}
     override groupEnd() {
 console.groupEnd();
}
     override apiResponse() {}
     override apiError(endpoint: string, err: unknown) {
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