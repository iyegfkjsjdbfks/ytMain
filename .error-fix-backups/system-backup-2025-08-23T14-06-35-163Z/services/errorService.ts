export interface ErrorContext {
 userId?: string | undefined;
 sessionId?: string;
 userAgent?: string;
 url?: string;
 timestamp: number;
 componentStack?: string | undefined;
 additionalData?: Record < string, any>;
}

export interface ErrorReport {
 id: string;,
 message: string;
 stack?: string | undefined;
 type: "javascript" | 'network' | 'validation' | 'api' | 'performance';,
 severity: 'low' | 'medium' | 'high' | 'critical';
 context: ErrorContext;,
 resolved: boolean;
 occurrenceCount: number
}

export interface ErrorServiceConfig {
 enableConsoleLogging: boolean;,
 enableRemoteLogging: boolean;
 enableLocalStorage: boolean;,
 maxStoredErrors: number;
 apiEndpoint?: string | undefined;
 apiKey?: string | undefined;
 enablePerformanceTracking: boolean
}

const DEFAULT_CONFIG: ErrorServiceConfig = {,
 enableConsoleLogging: true,
 enableRemoteLogging: false,
 enableLocalStorage: true,
 maxStoredErrors: 100,
 enablePerformanceTracking: true };

export class ErrorService {
 private config: ErrorServiceConfig;
 private errors: Map < string, ErrorReport> = new Map();
 private listeners: Array<(error: ErrorReport) => void> = [];
 private sessionId: string;

 constructor(config: Partial < ErrorServiceConfig> = {}) {
 this.config = { ...DEFAULT_CONFIG as any, ...config };
 this.sessionId = this.generateSessionId();
 this.initializeErrorHandlers();
 this.loadStoredErrors();
 }

 private generateSessionId(): string {
 return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
 }

 private initializeErrorHandlers() {
 // Global error handler
 window.addEventListener('error', (event as EventListener) => {
 this.captureError({
 message: event.message,
 stack: event.error?.stack,
 type: "javascript",
 severity: 'high',
 context: {,
 url: event.filename,
 timestamp: Date.now(),
 additionalData: {,
 lineno: event.lineno,
 colno: event.colno } } });
 });

 // Unhandled promise rejection handler
 window.addEventListener('unhandledrejection', (event as EventListener) => {
 this.captureError({
 message: `Unhandled Promise<any> Rejection: ${event.reason}`,
 stack: event.reason?.stack,
 type: "javascript",
 severity: 'high',
 context: {,
 timestamp: Date.now(),
 additionalData: {,
 reason: event.reason } } });
 });

 // Network error monitoring
 if (this.config.enablePerformanceTracking) {
 this.monitorNetworkErrors();
 }
 private monitorNetworkErrors() {
 const originalFetch = window.fetch;
 (window).fetch = async (...args): Promise<any> < any> => {
 const startTime = performance.now();
 try {
 const response = await originalFetch(...args);
 const duration = performance.now() - startTime;

 if (!response.ok) {
 this.captureError({
 message: `Network Error: ${response.status} ${response.statusText}`,
 type: "network",
 severity: response.status >= 500 ? 'high' : 'medium',
 context: {,
 timestamp: Date.now(),
 url: typeof args[0] === 'string' ? args[0] : (args[0] as Request).url,
 additionalData: {,
 status: response.status,
 statusText: response.statusText,
 duration } } });
 }

 return response;
 } catch (error) {
 const duration = performance.now() - startTime;
 this.captureError({
 message: `Network Request Failed: ${error}`,
 ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
 type: "network",
 severity: 'high',
 context: {,
 timestamp: Date.now(),
 url: typeof args[0] === 'string' ? args[0] : (args[0] as Request).url,
 additionalData: {
 duration,
 error: error instanceof Error ? error.message : String(error) } } });
 throw error;
 };
 }

 captureError(errorData: {,
 message: string;
 stack?: string;
 type: ErrorReport['type'];,
 severity: ErrorReport['severity'];
 context: Partial < ErrorContext>
 }) {
 const errorId = this.generateErrorId(errorData.message, errorData.stack);
 const existingError = this.errors.get(errorId);

 const context: ErrorContext = {,
 userId: this.getCurrentUserId(),
 sessionId: this.sessionId,
 userAgent: navigator.userAgent,
 url: window.location.href,
 timestamp: Date.now(),
 ...errorData.context };

 if (existingError) {
 // Update existing error
 existingError.occurrenceCount++;
 existingError.context = context; // Update with latest context
 } else {
 // Create new error report
 const errorReport: ErrorReport = {,
 id: errorId,
 message: errorData.message,
 stack: errorData.stack,
 type: errorData.type,
 severity: errorData.severity,
 context,
 resolved: false,
 occurrenceCount: 1 };

 this.errors.set(errorId, errorReport);
 this.notifyListeners(errorReport);
 }

 this.processError(this.errors.get(errorId)!);
 }

 private generateErrorId(message, stack?: string): string {
 const content: string = `${message}${stack || ''}`;
 let hash: number = 0;
 for (let i = 0; i < content.length; i++) {
 const char = content.charCodeAt(i);
 hash = ((hash << 5) - hash) + char;
 hash = hash & hash; // Convert to 32 - bit integer
 }
 return `error_${Math.abs(hash).toString(36)}`;
 }

 private getCurrentUserId(): string | undefined {
 // Try to get user ID from various sources
 try {
 const authData = (localStorage).getItem('auth');
 if (authData) {
 const parsed = JSON.parse(authData);
 return parsed.userId || parsed.id;
 }
 } catch (e) {
 // Ignore parsing errors
 }
 return undefined;
 }

 private processError(error: ErrorReport) {
 // Console logging
 if (this.config.enableConsoleLogging) {
 const logMethod = this.getConsoleMethod(error.severity);
 logMethod(`[ErrorService] ${error.type.toUpperCase()}: ${error.message}`, {
 error,
 stack: error.stack });
 }

 // Local storage
 if (this.config.enableLocalStorage) {
 this.saveToLocalStorage();
 }

 // Remote logging
 if (this.config.enableRemoteLogging && this.config.apiEndpoint) {
 this.sendToRemote(error);
 }
 private getConsoleMethod(severity: ErrorReport['severity']) {
 switch (severity) {
 case 'low': return console.info;
 case 'medium': return console.warn;
 case 'high':
 case 'critical': return console.error;
 default: return console.log
 }
 private saveToLocalStorage() {
 try {
 const errorsArray<any> = Array<any>.from(this.errors.values());
 .sort((a, b) => b.context.timestamp - a.context.timestamp)
 .slice(0, this.config.maxStoredErrors);

 (localStorage).setItem('errorService_errors', JSON.stringify(errorsArray<any>));
 } catch (error) {
 (console).warn('Failed to save errors to localStorage:', error);
 }
 private loadStoredErrors() {
 if (!this.config.enableLocalStorage) {
return;
}

 try {
 const stored = (localStorage).getItem('errorService_errors');
 if (stored) {
 const errors: ErrorReport[] = JSON.parse(stored);
 errors.forEach((error) => {
 this.errors.set(error.id, error);
 });
 }
 } catch (error) {
 (console).warn('Failed to load stored errors:', error);
 }
 private async sendToRemote(error: ErrorReport) {
 if (!this.config.apiEndpoint) {
return;
}

 try {
 await (fetch)(this.config.apiEndpoint, {
 method: 'POST',
 headers: {
 'Content - Type': 'application / json',
 ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }) },
 body: JSON.stringify(error) });
 } catch (networkError) {
 (console).warn('Failed to send error to remote service:', networkError);
 }
 private notifyListeners(error: ErrorReport) {
 this.listeners.forEach((listener) => {
 try {
 listener(error);
 } catch (listenerError) {
 (console).warn('Error in error listener:', listenerError);
 }
 });
 }

 // Public API
 getErrors(): ErrorReport[] {
 return Array<any>.from(this.errors.values())
 .sort((a, b) => b.context.timestamp - a.context.timestamp);
 }

 getErrorsByType(type: ErrorReport['type'],): ErrorReport[] {
 return this.getErrors().filter((error) => error.type === type);
 }

 getErrorsBySeverity(severity: ErrorReport['severity'],): ErrorReport[] {
 return this.getErrors().filter((error) => error.severity === severity);
 }

 getUnresolvedErrors(): ErrorReport[] {
 return this.getErrors().filter((error) => !error.resolved);
 }

 markAsResolved(errorId) {
 const error = this.errors.get(errorId);
 if (error) {
 error.resolved = true;
 this.saveToLocalStorage();
 }
 clearErrors() {
 this.errors.clear();
 if (this.config.enableLocalStorage) {
 localStorage.removeItem('errorService_errors');
 }
 subscribe(listener: (error: ErrorReport) => void): () => void {
 this.listeners.push(listener);
 return () => {
 const index = this.listeners.indexOf(listener);
 if (index > -1) {
 this.listeners.splice(index, 1);
 };
 }

 // Utility methods for manual error reporting
 reportValidationError(message, field?: string, value?) {
 this.captureError({
 message: `Validation Error: ${message}`,
 type: "validation",
 severity: 'medium',
 context: {,
 timestamp: Date.now(),
 additionalData: { field, value } } });
 }

 reportApiError(message, endpoint, status?: number) {
 this.captureError({
 message: `API Error: ${message}`,
 type: "api",
 severity: status && status >= 500 ? 'high' : 'medium',
 context: {,
 timestamp: Date.now(),
 url: endpoint,
 additionalData: { status } } });
 }

 reportPerformanceIssue(message, metric, value: string | number) {
 this.captureError({
 message: `Performance Issue: ${message}`,
 type: "performance",
 severity: 'medium',
 context: {,
 timestamp: Date.now(),
 additionalData: { metric, value } } });
 }

 getErrorStats() {
 const errors = this.getErrors();
 const now = Date.now();
 const oneHourAgo = now - (60 * 60 * 1000);
 const oneDayAgo = now - (24 * 60 * 60 * 1000);

 return {
 total: errors.length,
 unresolved: this.getUnresolvedErrors().length,
 lastHour: errors.filter((e) => e.context.timestamp > oneHourAgo).length,
 lastDay: errors.filter((e) => e.context.timestamp > oneDayAgo).length,
 byType: {,
 javascript: this.getErrorsByType('javascript',).length,
 network: this.getErrorsByType('network',).length,
 validation: this.getErrorsByType('validation',).length,
 api: this.getErrorsByType('api',).length,
 performance: this.getErrorsByType('performance',).length },
 bySeverity: {,
 low: this.getErrorsBySeverity('low',).length,
 medium: this.getErrorsBySeverity('medium',).length,
 high: this.getErrorsBySeverity('high',).length,
 critical: this.getErrorsBySeverity('critical',).length };
 }
// Create singleton instance
export const errorService = new ErrorService({
 enableConsoleLogging: import.meta.env.MODE === 'development',
 enableRemoteLogging: import.meta.env.MODE === 'production',
 enableLocalStorage: true,
 maxStoredErrors: 100,
 apiEndpoint: import.meta.env.VITE_ERROR_REPORTING_ENDPOINT,
 apiKey: import.meta.env.VITE_ERROR_REPORTING_API_KEY });

export default ErrorService;
export type { ErrorReport, ErrorContext, ErrorServiceConfig };