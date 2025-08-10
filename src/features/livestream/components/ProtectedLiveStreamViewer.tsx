
import { useCallback, type FC } from 'react';

import { conditionalLogger } from '@/utils/conditionalLogger';

import { LiveStreamErrorBoundary } from '@/components/ErrorBoundaries';
import LiveStreamViewer from './LiveStreamViewer';

interface ProtectedLiveStreamViewerProps {
  streamId: string;
  className?: string;
}

/**
 * LiveStreamViewer wrapped with specialized error boundary
 * Provides enhanced error handling and recovery for live streaming
 */
const ProtectedLiveStreamViewer: FC<ProtectedLiveStreamViewerProps> = ({
  streamId,
  className,
}) => {
  const handleRetry = useCallback(() => {
    conditionalLogger.debug('Retrying live stream viewer', { streamId });
    // The error boundary will reset and re-render the component
  }, [streamId]);

  const handleReconnect = useCallback(() => {
    conditionalLogger.debug('Reconnecting live stream', { streamId });
    // Additional reconnection logic can be added here
    // For example, clearing cached stream data or resetting connection state
  }, [streamId]);

  return (
    <LiveStreamErrorBoundary
      streamId={streamId}
      onRetry={handleRetry}
      onReconnect={handleReconnect}
    >
      <LiveStreamViewer
        streamId={streamId}
        {...(className && { className })}
      />
    </LiveStreamErrorBoundary>
  );
};

export default ProtectedLiveStreamViewer;