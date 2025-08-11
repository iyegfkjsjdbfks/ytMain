
/// <reference types="react/jsx-runtime" />
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName]: any;
    }
  }
}
import { Component, type ErrorInfo, type ReactNode } from 'react';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Error reporting service
interface ErrorReport {
  error: Error;
  errorInfo: ErrorInfo;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId: string;
}

class ErrorReportingService {
  private static instance: ErrorReportingService;
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  public static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  public async reportError(error: Error, errorInfo: ErrorInfo): Promise<void> {
    const report: ErrorReport = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack || '',
      } as Error,
      errorInfo,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
    };

    try {
      // In development, log to console
      if (import.meta.env.DEV) {
        console.group('🚨 Error Report');
        console.error('Error:', error);
        console.error('Error Info:', errorInfo);
        console.error('Full Report:', report);
        console.groupEnd();
      }

      // In production, send to error reporting service
      if (import.meta.env.PROD) {
        // Example: Send to error reporting service
        // await fetch('/api/errors', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(report)
        // });

        // Or use a service like Sentry
        // Sentry.captureException(error, { contexts: { react: errorInfo } });
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

const errorReporter = ErrorReportingService.getInstance();

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
  errorId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;
  private prevResetKeys: Array<string | number> = [];

  public override state: State = {
    hasError: false,
    retryCount: 0,
  };

  constructor(props: Props) {
    super(props);
    this.prevResetKeys = props.resetKeys || [];
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  public override componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys !== resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => this.prevResetKeys[index] !== key,
      );

      if (hasResetKeyChanged) {
        this.prevResetKeys = resetKeys;
        this.resetErrorBoundary();
      }
    }

    // Reset error boundary when any props change (if enabled)
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary();
    }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Report error to external service
    errorReporter.reportError(error, errorInfo).catch(console.error);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({ error, errorInfo });
  }

  public override componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      retryCount: 0,
    });
  };

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  private handleAutoRetry = () => {
    // Auto-retry after 5 seconds for the first error
    if (this.state.retryCount === 0) {
      this.resetTimeoutId = window.setTimeout(() => {
        this.handleRetry();
      }, 5000);
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public override render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { maxRetries = 3 } = this.props;
      const { retryCount, error, errorInfo, errorId } = this.state;
      const canRetry = retryCount < maxRetries;

      // Auto-retry for first error
      if (retryCount === 0) {
        this.handleAutoRetry();
      }

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Something went wrong
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {retryCount > 0
                ? `We've tried ${retryCount} time${retryCount > 1 ? 's' : ''} to fix this. Please try refreshing the page.`
                : "We're sorry, but something unexpected happened. We'll automatically retry in a moment."
              }
            </p>

            {retryCount === 0 && (
              <div className="mt-3 flex justify-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Auto-retrying in 5 seconds...
                </div>
              </div>
            )}

            {errorId && (
              <p className="mt-2 text-center text-xs text-gray-400">
                Error ID: {errorId}
              </p>
            )}
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="space-y-4">
                {canRetry && (
                  <button
                    onClick={this.handleRetry}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Try Again ({maxRetries - retryCount} left)
                  </button>
                )}
                <button
                  onClick={this.handleReload}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Refresh Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Home
                </button>
              </div>

              {import.meta.env.MODE === 'development' && error && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                    <div className="font-semibold text-red-600 mb-2">
                      {error.name}: {error.message}
                    </div>
                    <pre className="whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                    {errorInfo && (
                      <div className="mt-2 pt-2 border-t border-gray-300">
                        <div className="font-semibold mb-1">Component Stack:</div>
                        <pre className="whitespace-pre-wrap">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;