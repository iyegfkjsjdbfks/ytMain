enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3 }

class ConditionalLogger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;
  private isDebugMode: boolean;

  constructor() {
    this.isDevelopment = this.detectDevelopmentMode();
    this.isDebugMode = this.detectDebugMode();
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
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
      return process.env.NODE_ENV === 'development';
    } catch {}

    // Browser fallback - assume development if we can't determine
    return typeof window !== 'undefined';
  }

  private detectDebugMode(): boolean {
    try {
      // Check Vite debug flag first
      return import.meta.env?.VITE_DEBUG === 'true';
    } catch {}

    try {
      // Check Node.js debug flag
      return process.env.DEBUG === 'true';
    } catch {}

    // Default to development mode setting
    return this.isDevelopment;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(,
  level: LogLevel,
    message: any,
    source?: string
  ): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const sourcePrefix = source ? `[${source}]` : '';
    return `${timestamp} ${levelName}${sourcePrefix}: ${message}`;
  }

  error(message: any, data?: unknown, source?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formattedMessage = this.formatMessage(
        LogLevel.ERROR,
        message,
        source
      );
      (console as any).error(formattedMessage, data || '');
    }
  }

  warn(message: any, data?: unknown, source?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formattedMessage = this.formatMessage(
        LogLevel.WARN,
        message,
        source
      );
      (console as any).warn(formattedMessage, data || '');
    }
  }

  info(message: any, data?: unknown, source?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formattedMessage = this.formatMessage(
        LogLevel.INFO,
        message,
        source
      );
      (console as any).info(formattedMessage, data || '');
    }
  }

  debug(message: any, data?: unknown, source?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formattedMessage = this.formatMessage(
        LogLevel.DEBUG,
        message,
        source
      );
      (console as any).debug(formattedMessage, data || '');
    }
  }

  // Performance logging for development
  time(label: any): void {
    if (this.isDevelopment) {
      (console as any).time(label);
    }
  }

  timeEnd(label: any): void {
    if (this.isDevelopment) {
      (console as any).timeEnd(label);
    }
  }

  // Group logging for complex operations
  group(label: any): void {
    if (this.isDevelopment) {
      (console as any).group(label);
    }
  }

  groupEnd(): void {
    if (this.isDevelopment) {
      (console as any).groupEnd();
    }
  }

  // API response logging with sanitization
  apiResponse(endpoint: any, response: any, duration?: number): void {
    if (this.isDevelopment) {
      const message = duration
        ? `API Response from ${endpoint} (${duration}ms)`
        : `API Response from ${endpoint}`;
      this.debug(message, this.sanitizeApiResponse(response), 'API');
    }
  }

  // API error logging
  apiError(endpoint: any, error: Error): void {
    const message = `API Error from ${endpoint}`;
    this.error(message, this.sanitizeError(error), 'API');
  }

  // Sanitize API responses to avoid logging sensitive data
  private sanitizeApiResponse(response: any): any {
    if (!response) return response;

    try {
      // Remove common sensitive fields
      const sensitiveFields = ['password', 'token', 'key', 'secret', 'auth'];
      const sanitized = { ...response };

      // Recursively remove sensitive fields
      const removeSensitiveFields: any = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) return obj;

        if (Array.isArray(obj)) {
          return obj.map(removeSensitiveFields);
        }

        const result = {};
        for (const [key, value] of Object.entries(obj)) {
          if (
            sensitiveFields.some(field => key.toLowerCase().includes(field))
          ) {
            result[key] = '[REDACTED]';
          } else {
            result[key] = removeSensitiveFields(value);
          }
        }
        return result;
      };

      return removeSensitiveFields(sanitized);
    } catch {
      return '[Sanitization Error]';
    }
  }

  // Sanitize error objects
  private sanitizeError(error: Error): any {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: this.isDebugMode ? error.stack : '[Stack trace hidden]' };
    }
    return error;
  }

  // Set log level dynamically
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  // Get current log level
  getLogLevel(): LogLevel {
    return this.logLevel;
  }

  // Check if development mode
  isDev(): boolean {
    return this.isDevelopment;
  }

  // Check if debug mode
  isDebug(): boolean {
    return this.isDebugMode;
  }
}

// Create singleton instance
const logger = new ConditionalLogger();

// Export both the class and instance
export { ConditionalLogger, LogLevel, logger };
export { logger as conditionalLogger };
export default logger;
