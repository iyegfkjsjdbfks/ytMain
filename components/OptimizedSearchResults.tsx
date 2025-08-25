import React, { useState, useEffect } from 'react';

export interface OptimizedSearchResultsProps {
  query: string;
  onResultSelect?: (result: any) => void;
}

const OptimizedSearchResults: React.FC<OptimizedSearchResultsProps> = ({ query, onResultSelect }) => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const searchResults = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Mock search results - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockResults = [
          {
            id: '1',
            type: 'video',
            title: `Sample video for "${query}"`,
            description: 'This is a sample video description',
            thumbnail: 'https://via.placeholder.com/320x180',
            duration: '10:30',
            views: 15000,
            uploadedAt: new Date().toISOString(),
            channel: {
              name: 'Sample Channel',
              avatar: 'https://via.placeholder.com/32x32'
            }
          },
          {
            id: '2',
            type: 'channel',
            title: `Sample channel for "${query}"`,
            description: 'This is a sample channel description',
            avatar: 'https://via.placeholder.com/64x64',
            subscribers: 50000
          }
        ];
        
        setResults(mockResults);
      } catch (err) {
        setError('Failed to search. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    searchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (results.length === 0 && query) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No results found for "{query}"</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
          <div
          key={result.id}
          className="flex gap-4 p-4 hover:bg-gray-50 rounded-lg cursor-pointer"
          onClick={() => onResultSelect?.(result)}
        >
          {result.type === 'video' ? (
            <>
              <div className="flex-shrink-0">
                <img />
                  src={result.thumbnail}
                  alt={result.title}
                  className="w-40 h-24 object-cover rounded"
 /  />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-1">{result.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{result.views.toLocaleString()} views</span>
                  <span>•</span>
                  <span>{result.channel.name}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex-shrink-0">
                <img />
                  src={result.avatar}
                  alt={result.title}
                  className="w-16 h-16 rounded-full"
 /  />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-1">{result.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                <p className="text-sm text-gray-500">
                  {result.subscribers?.toLocaleString()} subscribers
                </p>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default OptimizedSearchResults;
