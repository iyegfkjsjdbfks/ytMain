// Conditional Logger - Minimal Implementation
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export class ConditionalLogger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  private formatMessage(
    level: string,
    message: string,
    data?: unknown,
    source?: string
  ): string {
    const timestamp = new Date().toISOString();
    const sourceStr = source ? '[' + source + ']' : '';
    return timestamp + ' [' + level + '] ' + sourceStr + ' ' + message;
  }

  error(message: string, data?: unknown, source?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formatted = this.formatMessage('ERROR', message, data, source);
      console.error(formatted, data);
    }
  }

  warn(message: string, data?: unknown, source?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formatted = this.formatMessage('WARN', message, data, source);
      console.warn(formatted, data);
    }
  }

  info(message: string, data?: unknown, source?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formatted = this.formatMessage('INFO', message, data, source);
      console.info(formatted, data);
    }
  }

  debug(message: string, data?: unknown, source?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formatted = this.formatMessage('DEBUG', message, data, source);
      console.debug(formatted, data);
    }
  }

  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  group(label: string): void {
    if (this.isDevelopment) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }

  apiResponse(endpoint: string, response: any, duration?: number): void {
    if (this.isDevelopment) {
      const message = duration
        ? 'API Response from ' + endpoint + ' (' + duration + 'ms)'
        : 'API Response from ' + endpoint;
      this.info(message, response, 'API');
    }
  }

  apiError(endpoint: string, error: Error): void {
    const message = 'API Error from ' + endpoint;
    this.error(message, error, 'API');
  }
}

export const logger = new ConditionalLogger(
  process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
);

export { ConditionalLogger, LogLevel, logger };