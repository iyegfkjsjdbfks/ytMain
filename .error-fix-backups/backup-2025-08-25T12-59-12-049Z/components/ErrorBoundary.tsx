import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Something went wrong
// FIXED:             </h1>
            <p className="text-gray-600 mb-8">
              An unexpected error occurred. Please try refreshing the page.
// FIXED:             </p>
            <button// FIXED:  />
              onClick={() => window.location.reload()}// FIXED: 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
// FIXED:             </button>
// FIXED:           </div>
// FIXED:         </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
