import type React from 'react';

import { useSearchParams } from 'react-router-dom';

/**
 * SearchResultsPage component for displaying video search results
 */
const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Search Results</h1>
      <p className="text-gray-600 mb-4">
        {query ? `Showing results for: "${query}"` : 'No search query provided'}
      </p>
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-blue-700">
        <p>This is a placeholder for the search results page that will display videos matching the search query.</p>
        <p className="mt-2">For demonstration of video components, please visit the <strong>Video Demo</strong> page using the user menu dropdown.</p>
      </div>
    </div>
  );
};

export default SearchResultsPage;
