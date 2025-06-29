import type React from 'react';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchCombined } from '../../../../services/googleSearchService';
import VideoCard from '../components/VideoCard';
import type { Video } from '../../../types/core';

/**
 * SearchResultsPage component for displaying video search results
 */
const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    const performSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await searchCombined(query);
        // Convert search results to Video format
        const videoResults: Video[] = [
          ...results.youtubeVideos.map(video => ({
            id: video.id,
            title: video.title,
            description: video.description,
            duration: typeof video.duration === 'string' ? parseInt(video.duration, 10) : video.duration,
            thumbnailUrl: video.thumbnailUrl,
            channelId: video.channelId || '',
            channelName: video.channelName,
            channelAvatarUrl: video.channelAvatarUrl,
            viewCount: video.viewCount || 0,
            likeCount: video.likeCount || 0,
            dislikeCount: video.dislikeCount || 0,
            commentCount: video.commentCount || 0,
            publishedAt: video.uploadedAt,
            tags: video.tags || [],
            category: video.categoryId || '',
            license: 'Standard YouTube License',
            visibility: 'public' as const,
            isLive: false,
            isUpcoming: false,
            isLiveContent: false,
            isFamilySafe: true,
            allowedRegions: [],
            blockedRegions: [],
            isAgeRestricted: false,
            embeddable: true,
            defaultLanguage: 'en',
            defaultAudioLanguage: 'en',
            recordingStatus: 'recorded',
            uploadStatus: 'processed',
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false,
            statistics: {
              viewCount: video.viewCount || 0,
              likeCount: video.likeCount || 0,
              dislikeCount: video.dislikeCount || 0,
              favoriteCount: 0,
              commentCount: video.commentCount || 0
            },
            topicDetails: {
              topicIds: [],
              relevantTopicIds: [],
              topicCategories: []
            },
            contentDetails: {
              duration: `PT${Math.floor((typeof video.duration === 'string' ? parseInt(video.duration, 10) : video.duration) / 60)}M${(typeof video.duration === 'string' ? parseInt(video.duration, 10) : video.duration) % 60}S`,
              dimension: '2d',
              definition: 'hd',
              caption: 'false',
              licensedContent: false,
              contentRating: {},
              projection: 'rectangular'
            },
            // Legacy fields for compatibility
            views: video.viewCount || 0,
            likes: video.likeCount || 0,
            createdAt: video.uploadedAt
          })),
          ...results.googleSearchVideos.map(video => ({
            id: video.id,
            title: video.title,
            description: video.description,
            duration: typeof video.duration === 'string' ? parseInt(video.duration, 10) : video.duration,
            thumbnailUrl: video.thumbnailUrl,
            channelId: video.channelId || '',
            channelName: video.channelName,
            channelAvatarUrl: video.channelAvatarUrl,
            viewCount: video.viewCount || 0,
            likeCount: video.likeCount || 0,
            dislikeCount: video.dislikeCount || 0,
            commentCount: video.commentCount || 0,
            publishedAt: video.uploadedAt,
            tags: video.tags || [],
            category: video.categoryId || '',
            license: 'Standard YouTube License',
            visibility: 'public' as const,
            isLive: false,
            isUpcoming: false,
            isLiveContent: false,
            isFamilySafe: true,
            allowedRegions: [],
            blockedRegions: [],
            isAgeRestricted: false,
            embeddable: true,
            defaultLanguage: 'en',
            defaultAudioLanguage: 'en',
            recordingStatus: 'recorded',
            uploadStatus: 'processed',
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false,
            statistics: {
              viewCount: video.viewCount || 0,
              likeCount: video.likeCount || 0,
              dislikeCount: video.dislikeCount || 0,
              favoriteCount: 0,
              commentCount: video.commentCount || 0
            },
            topicDetails: {
              topicIds: [],
              relevantTopicIds: [],
              topicCategories: []
            },
            contentDetails: {
              duration: `PT${Math.floor((typeof video.duration === 'string' ? parseInt(video.duration, 10) : video.duration) / 60)}M${(typeof video.duration === 'string' ? parseInt(video.duration, 10) : video.duration) % 60}S`,
              dimension: '2d',
              definition: 'hd',
              caption: 'false',
              licensedContent: false,
              contentRating: {},
              projection: 'rectangular'
            },
            // Legacy fields for compatibility
            views: video.viewCount || 0,
            likes: video.likeCount || 0,
            createdAt: video.uploadedAt
          }))
        ];
        setVideos(videoResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while searching');
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const handleVideoClick = (video: Video) => {
    // Video click is handled by the Link components in VideoCard
    console.log('Video clicked:', video.title);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Search Results</h1>
      <p className="text-gray-600 mb-4">
        {query ? `Showing results for: "${query}"` : 'No search query provided'}
      </p>
      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Searching...</span>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700 mb-4">
          <p>Error: {error}</p>
        </div>
      )}
      
      {!loading && !error && videos.length === 0 && query && (
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-700">
          <p>No videos found for "{query}". Try a different search term.</p>
        </div>
      )}
      
      {!loading && videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onClick={handleVideoClick}
            />
          ))}
        </div>
      )}
      
      {!query && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-blue-700">
          <p>Enter a search query to find videos.</p>
          <p className="mt-2">For demonstration of video components, please visit the <strong>Video Demo</strong> page using the user menu dropdown.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
