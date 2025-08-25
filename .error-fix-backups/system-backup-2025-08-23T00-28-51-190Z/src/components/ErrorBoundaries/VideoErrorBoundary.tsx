import React, { Component, type ErrorInfo, type ReactNode, ReactNode } from 'react';

import { ExclamationTriangleIcon, PlayIcon } from '@heroicons/react/24/outline';

import { createComponentError } from '@/utils/errorUtils';

import { conditionalLogger } from '../../utils/conditionalLogger';

export interface VideoErrorBoundaryProps {
 children?: React.ReactNode;
 videoId?: string;
 onRetry?: () => void;
 fallback?: ReactNode;
}

type Props = VideoErrorBoundaryProps;

interface State {
 hasError: boolean;
 error: Error | null;
 errorInfo: ErrorInfo | null;
 retryCount: number
}

/**
 * Specialized error boundary for video-related components
 * Provides video-specific error handling and recovery options
 */
export class VideoErrorBoundary extends Component<Props, State> {
 private maxRetries = 3;

 constructor(props: Props) {
 super(props);
 this.state = {
 hasError: false,
 error: null,
 errorInfo: null,
 retryCount: 0 }
 static getDerivedStateFromError(error: Error): Partial<State> {
 return {
 hasError: true,
 error }
 override componentDidCatch(error: Error,
 errorInfo: ErrorInfo): void {
 const componentError = createComponentError(
 'VideoErrorBoundary',
 'Video component error',
 error,
 JSON.stringify({
 videoId: this.props.videoId,
 retryCount: this.state.retryCount,
 componentStack: errorInfo.componentStack })
 );

 conditionalLogger.error('Video component error caught:', componentError);

 this.setState({
 errorInfo });
 }

 private handleRetry = (): void => {
 if (this.state.retryCount < this.maxRetries) {
 conditionalLogger.debug('Retrying video component', {
 videoId: this.props.videoId,
 attempt: this.state.retryCount + 1 });

 this.setState({
 hasError: false,
 error: null,
 errorInfo: null,
 retryCount: this.state.retryCount + 1 });

 this.props.onRetry?.();
 };

 private handleReload = (): void => {
 window.location.reload();
 };

 override render(): ReactNode {
 if (this.state.hasError) {
 if (this.props.fallback) {
 return this.props.fallback;
 }

 const canRetry = this.state.retryCount < this.maxRetries;

 return (
 <div className={'fle}x flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200'>
 <div className={'fle}x items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4'>
 <ExclamationTriangleIcon className={'w}-8 h-8 text-red-600' />
// FIXED:  </div>
<h3 className={'text}-lg font-semibold text-gray-900 mb-2'>
 Video Error
// FIXED:  </h3>

 <p className={'text}-sm text-gray-600 text-center mb-6 max-w-md'>
 {this.props.videoId
 ? `There was an error loading video ${this.props.videoId}. This might be due to network issues or the video being unavailable.`
 : 'There was an error with the video player. Please try again.'}
// FIXED:  </p>

 <div className={'fle}x gap-3'>
 {canRetry && (
 <button>
// FIXED:  onClick={this.handleRetry}
// FIXED:  className={'fle}x items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'/>
 <PlayIcon className={'w}-4 h-4' />
 Try Again ({this.maxRetries - this.state.retryCount} left)
// FIXED:  </button>
 )}

 <button>
// FIXED:  onClick={this.handleReload}
// FIXED:  className={'px}-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'/>
 Reload Page
// FIXED:  </button>
// FIXED:  </div>

 {import.meta.env.MODE === 'development' && this.state.error && (
 <details className={'mt}-6 w-full'>
 <summary className={'cursor}-pointer text-sm font-medium text-gray-700 hover:text-gray-900'>
 Error Details (Development)
// FIXED:  </summary>
 <div className={'mt}-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40'>
 <div className={'font}-semibold text-red-600 mb-2'>
 {this.state.error.name}: {this.state.error.message}
// FIXED:  </div>
<pre className={'whitespace}-pre-wrap text-xs'>
 {this.state.error.stack}
// FIXED:  </pre>
 {this.state.errorInfo && (
 <div className={'mt}-2 pt-2 border-t border-gray-300'>
 <div className={'font}-semibold mb-1'>Component Stack:</div>
<pre className={'whitespace}-pre-wrap text-xs'>
 {this.state.errorInfo.componentStack}
// FIXED:  </pre>
// FIXED:  </div>
 )}
// FIXED:  </div>
// FIXED:  </details>
 )}
// FIXED:  </div>
 );
 }

 return this.props.children;
 }
export default VideoErrorBoundary;
