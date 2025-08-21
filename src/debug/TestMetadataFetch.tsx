import React, { useState, FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSingleVideoFromGoogleSearch } from '../../services/googleSearchService';
import { logger } from '../utils/logger';
import { unifiedDataService } from '../services/unifiedDataService';

const TestMetadataFetch: React.FC = () => {
 return null;
 const [result, setResult] = useState<any>(null);
 const [loading, setLoading] = useState<boolean>(false);
 const [error, setError] = useState<string | null>(null);

 // Test with standard React Query hook
 const {
 data: reactQueryData,
 isLoading: reactQueryLoading,
 error: reactQueryError } = useQuery({
 queryKey: ['test-video', 'google-search-bnVUHWCynig'],
 queryFn: async (): Promise<void> => {
 logger.debug('🔍 React Query: Fetching video...');
 const video = await unifiedDataService.getVideoById(
 'google-search-bnVUHWCynig'
 );
 logger.debug('📊 React Query: Result:', video);
 return video;
 },
 enabled: true });

 const testDirectGoogleSearch = async (): Promise<void> => {
 setLoading(true);
 setError(null);
 setResult(null);

 try {
 logger.debug('🔍 Testing direct Google Custom Search API call...');

 // Check environment variables first
 const searchApiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
 const searchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;
 logger.debug('🔑 API Key available:', !!searchApiKey);
 logger.debug('🔍 Search Engine ID available:', !!searchEngineId);

 const result = await fetchSingleVideoFromGoogleSearch('bnVUHWCynig');
 logger.debug('📊 Direct API result:', result);
 setResult({ type: "direct",
 data: result });
 } catch (err) {
 logger.error('❌ Direct API error:', err);
 setError(err instanceof Error ? err.message : 'Unknown error');
 } finally {
 setLoading(false);
 };

 const testUnifiedDataService = async (): Promise<void> => {
 setLoading(true);
 setError(null);
 setResult(null);

 try {
 logger.debug('🔍 Testing unified data service...');
 logger.debug('🔍 Environment variables check:');
 logger.debug(
 ' - VITE_GOOGLE_SEARCH_API_KEY:',
 !!import.meta.env.VITE_GOOGLE_SEARCH_API_KEY
 );
 logger.debug(
 ' - VITE_GOOGLE_SEARCH_ENGINE_ID:',
 !!import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID
 );

 const result = await unifiedDataService.getVideoById(
 'google-search-bnVUHWCynig'
 );
 logger.debug('📊 Unified service result:', result);
 setResult({ type: "unified",
 data: result });
 } catch (err) {
 logger.error('❌ Unified service error:', err);
 setError(err instanceof Error ? err.message : 'Unknown error');
 } finally {
 setLoading(false);
 };

 return (
 <div className='p-6 max-w-4xl mx-auto'>
 <h1 className='text-2xl font-bold mb-6'>Test Metadata Fetch</h1>

 {/* React Query Test Results */}
 <div className='mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded'>
 <h2 className='text-lg font-semibold mb-4'>
 React Query Test (Auto-running)
// FIXED:  </h2>
 <div className='space-y-2'>
 <p>
 <strong>Loading:</strong> {reactQueryLoading ? 'Yes' : 'No'}
// FIXED:  </p>
 <p>
 <strong>Error:</strong>{' '}
 {reactQueryError ? String(reactQueryError) : 'None'}
// FIXED:  </p>
 <p>
 <strong>Data:</strong>{' '}
 {reactQueryData ? `Found: ${reactQueryData.title}` : 'None'}
// FIXED:  </p>
// FIXED:  </div>
 {reactQueryData && (
 <details className='mt-4'>
 <summary className='cursor-pointer font-medium'>
 Raw React Query Data
// FIXED:  </summary>
 <pre className='mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto'>
 {JSON.stringify(reactQueryData, null, 2)}
// FIXED:  </pre>
// FIXED:  </details>
 )}
// FIXED:  </div>

 <div className='space-y-4 mb-6'>
 <button />
// FIXED:  onClick={(e) => testDirectGoogleSearch(e)}
// FIXED:  disabled={loading}
// FIXED:  className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'
 >
 Test Direct Google Custom Search API
// FIXED:  </button>

 <button />
// FIXED:  onClick={(e) => testUnifiedDataService(e)}
// FIXED:  disabled={loading}
// FIXED:  className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50'
 >
 Test Unified Data Service
// FIXED:  </button>
// FIXED:  </div>

 {loading && <div className='text-blue-600'>Loading...</div>}

 {error && (
 <div className='text-red-600 bg-red-50 p-4 rounded'>
 <strong>Error:</strong> {error}
// FIXED:  </div>
 )}

 {result && (
 <div className='bg-gray-50 p-4 rounded'>
 <h3 className='font-bold mb-2'>
 Result from{' '}
 {result.type === 'direct'
 ? 'Direct Google API'
 : 'Unified Data Service'}
 :
// FIXED:  </h3>

 {result.data ? (
 <div className='space-y-2'>
 <p>
 <strong>Title:</strong> {result.data.title || 'N/A'}
// FIXED:  </p>
 <p>
 <strong>Description:</strong> {result.data.description || 'N/A'}
// FIXED:  </p>
 <p>
 <strong>Video URL:</strong> {result.data.videoUrl || 'N/A'}
// FIXED:  </p>
 <p>
 <strong>Source:</strong> {result.data.source || 'N/A'}
// FIXED:  </p>
 {result.data.thumbnailUrl && (
 <div>
 <strong>Thumbnail:</strong>
 <br />
 <img
// FIXED:  src={result.data.thumbnailUrl}
// FIXED:  alt='Thumbnail'
// FIXED:  className='max-w-xs mt-2' />
 />
// FIXED:  </div>
 )}
// FIXED:  </div>
 ) : (
 <p className='text-red-600'>No data returned</p>
 )}

 <details className='mt-4'>
 <summary className='cursor-pointer font-medium'>Raw Data</summary>
 <pre className='mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto'>
 {JSON.stringify(result.data, null, 2)}
// FIXED:  </pre>
// FIXED:  </details>
// FIXED:  </div>
 )}
// FIXED:  </div>
 );
};

export default TestMetadataFetch;
