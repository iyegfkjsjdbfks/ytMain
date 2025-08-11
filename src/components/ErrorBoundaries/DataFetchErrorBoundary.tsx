

/// <reference types="react/jsx-runtime" />
declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
  interface Process {
    env: ProcessEnv;
  }
}

// TODO: Fix import - import { Component, type ErrorInfo, type ReactNode } from 'react';

// TODO: Fix import - import { ExclamationCircleIcon, ArrowPathIcon, WifiIcon } from '@heroicons/react/24/outline';

import { createComponentError } from '@/utils/errorUtils';
/// <reference types="node" />

import { conditionalLogger } from '../../utils/conditionalLogger';

export interface DataFetchErrorBoundaryProps {
  children: ReactNode;
  dataType?: string;
  onRetry?: () => void;
  fallback?: ReactNode;
  showOfflineMessage?: boolean;
}

type Props = DataFetchErrorBoundaryProps;

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRetrying: boolean;
}

/**
 * Specialized error boundary for data fetching components
 * Provides data-specific error handling and retry mechanisms
 */
export class DataFetchErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const componentError = createComponentError(
      'DataFetchErrorBoundary',
      'Data fetching component error',
      error,
      JSON.stringify({
        dataType: this.props.dataType,
        retryCount: this.state.retryCount,
        isOnline: navigator.onLine,
        componentStack: errorInfo.componentStack,
      }),
    );

    conditionalLogger.error('Data fetching component error caught:', componentError);

    this.setState({
      errorInfo,
    });
  }

  override componentWillUnmount(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private handleRetry = (): void => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({ isRetrying: true });

      conditionalLogger.debug('Retrying data fetch component', {
        dataType: this.props.dataType,
        attempt: this.state.retryCount + 1,
        isOnline: navigator.onLine,
      });

      // Add a small delay to prevent immediate retry
      this.retryTimeout = setTimeout(() => {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          retryCount: this.state.retryCount + 1,
          isRetrying: false,
        });

        this.props.onRetry?.();
      }, 1000);
    }
  };

  private handleRefresh = (): void => {
    window.location.reload();
  };

  private getErrorMessage = (): string => {
    const { dataType } = this.props;
    const isOffline = !navigator.onLine;

    if (isOffline) {
      return 'You appear to be offline. Please check your internet connection and try again.';
    }

    if (this.state.error?.message.includes('fetch')) {
      return `Failed to load ${dataType || 'data'}. This might be due to network issues or server problems.`;
    }

    if (this.state.error?.message.includes('timeout')) {
      return `Request timed out while loading ${dataType || 'data'}. The server might be experiencing high traffic.`;
    }

    return `There was an error loading ${dataType || 'data'}. Please try again.`;
  };

  private getErrorIcon = (): ReactNode => {
    const isOffline = !navigator.onLine;

    if (isOffline) {
      return <WifiIcon className="w-8 h-8 text-orange-600" />;
    }

    return <ExclamationCircleIcon className="w-8 h-8 text-red-600" />;
  };

  private getErrorIconBg = (): string => {
    const isOffline = !navigator.onLine;
    return isOffline ? 'bg-orange-100' : 'bg-red-100';
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.state.retryCount < this.maxRetries;
      const isOffline = !navigator.onLine;

      if (this.state.isRetrying) {
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <ArrowPathIcon className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Retrying...
            </h3>
            <p className="text-sm text-gray-600 text-center">
              Attempting to reload {this.props.dataType || 'data'}
            </p>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <div className={`flex items-center justify-center w-16 h-16 ${this.getErrorIconBg()} rounded-full mb-4`}>
            {this.getErrorIcon()}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isOffline ? 'Connection Error' : 'Data Loading Error'}
          </h3>

          <p className="text-sm text-gray-600 text-center mb-6 max-w-md">
            {this.getErrorMessage()}
          </p>

          <div className="flex gap-3">
            {canRetry && (
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Try Again ({this.maxRetries - this.state.retryCount} left)
              </button>
            )}

            <button
              onClick={this.handleRefresh}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Refresh Page
            </button>
          </div>

          {this.state.retryCount > 0 && (
            <div className="mt-4 text-xs text-gray-500 text-center">
              Retry attempts: {this.state.retryCount} / {this.maxRetries}
            </div>
          )}

          {isOffline && this.props.showOfflineMessage && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800 text-center">
                Some features may be limited while offline. Data will sync when connection is restored.
              </p>
            </div>
          )}

          {import.meta.env.MODE === 'development' && this.state.error && (
            <details className="mt-6 w-full">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                Error Details (Development)
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                <div className="font-semibold text-red-600 mb-2">
                  {this.state.error.name}: {this.state.error.message}
                </div>
                <div className="mb-2">
                  <strong>Network Status:</strong> {navigator.onLine ? 'Online' : 'Offline'}
                </div>
                <pre className="whitespace-pre-wrap text-xs">
                  {this.state.error.stack}
                </pre>
                {this.state.errorInfo && (
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <div className="font-semibold mb-1">Component Stack:</div>
                    <pre className="whitespace-pre-wrap text-xs">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default DataFetchErrorBoundary;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
