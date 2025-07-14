import React, { useCallback } from 'react';
import { DataFetchErrorBoundary } from '@/components/ErrorBoundaries';
import { conditionalLogger } from '@/utils/conditionalLogger';
import SearchResultsPage from './SearchResultsPage';
import { useSearchParams } from 'react-router-dom';

/**
 * SearchResultsPage wrapped with specialized error boundary
 * Provides enhanced error handling for search data fetching
 */
const ProtectedSearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const handleRetry = useCallback(() => {
    conditionalLogger.debug('Retrying search results data fetch', { query });
    // The error boundary will reset and re-render the component
    // Additional retry logic can be implemented here if needed
  }, [query]);

  return (
    <DataFetchErrorBoundary
      dataType="search results"
      onRetry={handleRetry}
      showOfflineMessage={true}
    >
      <SearchResultsPage />
    </DataFetchErrorBoundary>
  );
};

export default ProtectedSearchResultsPage;