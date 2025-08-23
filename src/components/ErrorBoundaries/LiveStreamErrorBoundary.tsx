import React, { ReactNode, Component, ErrorInfo } from 'react';
import { SignalSlashIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';
import { createComponentError } from '../src/../utils/errorUtils';
import { logger } from '../src/../utils/conditionalLogger';

export interface LiveStreamErrorBoundaryProps {
  children?: React.ReactNode;
  streamId?: string;
  onRetry?: () => void;
  onReconnect?: () => void;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isReconnecting: boolean;
}

/**
 * Specialized error boundary for live streaming components
 * Provides streaming-specific error handling and recovery options
 */
export class LiveStreamErrorBoundary extends Component<LiveStreamErrorBoundaryProps, State> {
  private maxRetries = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(props: LiveStreamErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isReconnecting: false,
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
      'LiveStreamErrorBoundary',
      'Live stream component error',
      error,
      JSON.stringify({
        streamId: this.props.streamId,
        retryCount: this.state.retryCount,
        componentStack: errorInfo.componentStack,
      })
    );

    logger.error('Live stream component error caught:', componentError);

    this.setState({ errorInfo });
  }

  override componentWillUnmount(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
  }

  private handleRetry = (): void => {
    if (this.state.retryCount < this.maxRetries) {
      logger.debug('Retrying live stream component', {
        streamId: this.props.streamId,
        attempt: this.state.retryCount + 1,
      });

      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: this.state.retryCount + 1,
      });

      this.props.onRetry?.();
    }
  };

  private handleReconnect = (): void => {
    this.setState({ isReconnecting: true });

    logger.debug('Attempting to reconnect live stream', {
      streamId: this.props.streamId,
    });

    // Simulate reconnection delay
    this.reconnectTimeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isReconnecting: false,
        retryCount: 0, // Reset retry count on manual reconnect
      });

      this.props.onReconnect?.();
    }, 2000);
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.state.retryCount < this.maxRetries;

      if (this.state.isReconnecting) {
        return (
          <div className='flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200'>
            <div className='flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4'>
              <ArrowPathIcon className='w-8 h-8 text-blue-600 animate-spin' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Reconnecting...
            </h3>
            <p className='text-sm text-gray-600 text-center'>
              Attempting to reconnect to the live stream
            </p>
          </div>
        );
      }

      return (
        <div className='flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200'>
          <div className='flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4'>
            <SignalSlashIcon className='w-8 h-8 text-red-600' />
          </div>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            Live Stream Error
          </h3>

          <p className='text-sm text-gray-600 text-center mb-6 max-w-md'>
            {this.props.streamId
              ? `There was an error with live stream ${this.props.streamId}. This might be due to network issues or the stream being offline.`
              : 'There was an error with the live stream. The stream might be offline or experiencing technical difficulties.'}
          </p>

          <div className='flex flex-wrap gap-3 justify-center'>
            {canRetry && (
              <button
                onClick={this.handleRetry}
                className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <ArrowPathIcon className='w-4 h-4' />
                Retry ({this.maxRetries - this.state.retryCount} left)
              </button>
            )}

            <button
              onClick={this.handleReconnect}
              className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
            >
              <SignalSlashIcon className='w-4 h-4' />
              Reconnect
            </button>

            <button
              onClick={this.handleGoHome}
              className='flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
            >
              <HomeIcon className='w-4 h-4' />
              Go Home
            </button>
          </div>
          <div className='mt-4 text-xs text-gray-500 text-center'>
            Stream errors: {this.state.retryCount} / {this.maxRetries}
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className='mt-6 w-full'>
              <summary className='cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900'>
                Error Details (Development)
              </summary>
              <div className='mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40'>
                <div className='font-semibold text-red-600 mb-2'>
                  {this.state.error.name}: {this.state.error.message}
                </div>
                <pre className='whitespace-pre-wrap text-xs'>
                  {this.state.error.stack}
                </pre>
                {this.state.errorInfo && (
                  <div className='mt-2 pt-2 border-t border-gray-300'>
                    <div className='font-semibold mb-1'>Component Stack:</div>
                    <pre className='whitespace-pre-wrap text-xs'>
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

export default LiveStreamErrorBoundary;