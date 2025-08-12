import React, { useCallback, FC } from 'react';
import { useSearchParams, useParams  } from 'react-router-dom';
import { FC } from 'react';
import { useCallback } from 'react';

import { conditionalLogger } from '@/utils/conditionalLogger';

import { DataFetchErrorBoundary } from '@/components/ErrorBoundaries';
import WatchPage from './WatchPage';

/**
 * WatchPage wrapped with specialized error boundary
 * Provides enhanced error handling for video data fetching and recommendations
 */
const ProtectedWatchPage: FC = () => {
  const { videoId: paramVideoId } = useParams<{ videoId: string }>();
  const [searchParams] = useSearchParams();
  const videoId = paramVideoId || searchParams.get('v') || '';

  const handleRetry = useCallback(() => {
    conditionalLogger.debug('Retrying watch page data fetch', { videoId });
    // The error boundary will reset and re-render the component
    // Additional retry logic can be implemented here if needed
  }, [videoId]);

  return (
    <DataFetchErrorBoundary
      dataType='video and recommendations'
      onRetry={handleRetry}
      showOfflineMessage={true}
    >
      <WatchPage />
    </DataFetchErrorBoundary>
  );
};

export default ProtectedWatchPage;

