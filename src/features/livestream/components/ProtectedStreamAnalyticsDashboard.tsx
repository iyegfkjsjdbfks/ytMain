import React, { useCallback, FC } from 'react';
import { conditionalLogger } from '../../../utils/conditionalLogger';

import { DataFetchErrorBoundary } from '../../../components/ErrorBoundaries';
import StreamAnalyticsDashboard from './StreamAnalyticsDashboard';

interface ProtectedStreamAnalyticsDashboardProps {
  streamId: string;
  className?: string;
}

/**
 * StreamAnalyticsDashboard wrapped with specialized error boundary
 * Provides enhanced error handling for analytics data fetching
 */
const ProtectedStreamAnalyticsDashboard: FC<
  ProtectedStreamAnalyticsDashboardProps
> = ({ streamId, className }) => {
  const handleRetry = useCallback(() => {
    conditionalLogger.debug('Retrying analytics dashboard data fetch', {
      streamId,
    });
    // The error boundary will reset and re-render the component
    // Additional retry logic can be implemented here if needed
  }, [streamId]);

  return (
    <DataFetchErrorBoundary
      dataType='analytics data'
      onRetry={handleRetry}
      showOfflineMessage={true}
    >
      <StreamAnalyticsDashboard
        streamId={streamId}
        {...(className && { className })}
      />
    </DataFetchErrorBoundary>
  );
};

export default ProtectedStreamAnalyticsDashboard;


