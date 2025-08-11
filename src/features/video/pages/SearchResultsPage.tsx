/// <reference types="react/jsx-runtime" />
import React from "react";
import { useSearchParams } from 'react-router-dom';

import { useState, useEffect } from 'react';

import { getYouTubeVideoId } from '@/lib/youtube-utils';

import { searchForSearchResultsPage } from '@services/googleSearchService';
import type { Video } from '@/types/core';
import { Link } from 'react-router-dom';

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
    if (!query) {
return;
}

    const performSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        // Mock local video search function
        const searchLocalVideos = async (_searchQuery): Promise<Video[]> => {
          // Return empty array for now - this would normally search local videos
          return [];
        };

        const results = await searchForSearchResultsPage(query, searchLocalVideos);
        // Convert search results to Video format
        const videoResults: Video[] = [
          ...results.youtubeVideos.map((video) => ({
            id: video.id,
            title: video.title,
            description: video.description,
            thumbnailUrl: video.thumbnailUrl,
            videoUrl: video.videoUrl,
            duration: video.duration || '0:00',
            views: video.viewCount?.toString() || '0',
            likes: video.likeCount || 0,
            dislikes: video.dislikeCount || 0,
            uploadedAt: video.uploadedAt || new Date().toISOString(),
            channelName: video.channelName,
            channelId: video.channelId || '',
            channelAvatarUrl: video.channelAvatarUrl || '',
            category: video.categoryId || 'Entertainment',
            tags: video.tags || [],
            visibility: 'public' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isLive: false,
            isShort: false,
            viewCount: video.viewCount || 0,
            likeCount: video.likeCount || 0,
            dislikeCount: video.dislikeCount || 0,
            commentCount: video.commentCount || 0,
          })),
          ...(results.googleSearchVideos || []).map((video) => ({
            id: video.id,
            title: video.title,
            description: video.description,
            duration: typeof video.duration === 'string' ? video.duration : String(video.duration || 0),
            thumbnailUrl: video.thumbnailUrl,
            videoUrl: video.videoUrl || `https://www.youtube.com/watch?v=${video.id}`,
            channelId: video.channelId || '',
            channelName: video.channelName,
            channelAvatarUrl: video.channelAvatarUrl || '',
            views: video.viewCount?.toString() || '0',
            likes: video.likeCount || 0,
            dislikes: video.dislikeCount || 0,
            uploadedAt: video.uploadedAt || new Date().toISOString(),
            tags: video.tags || [],
            category: video.categoryId || 'Entertainment',
            visibility: 'public' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isLive: false,
            isShort: video.isShort || false,
            viewCount: video.viewCount || 0,
            likeCount: video.likeCount || 0,
            dislikeCount: video.dislikeCount || 0,
            commentCount: video.commentCount || 0,
          })),
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

  // Video click is handled by the Link components in VideoCard

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Search Results</h1>
      <p className="text-gray-600 mb-4">
        {query ? `Showing results for: "${query}"` : 'No search query provided'}
      </p>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
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
          {videos.map((video) => {
            // Extract YouTube video ID from the video object using utility function
            let videoId = getYouTubeVideoId(video.videoUrl) || video.id;

            // Clean up video ID to ensure it's just the 11-character YouTube ID
            if (videoId && videoId.includes('-')) {
              // Handle cases like "google-search-xyz" or "youtube-xyz"
              const parts = videoId.split('-');
              const lastPart = parts[parts.length - 1];
              if (lastPart && lastPart.length === 11) {
                videoId = lastPart;
              }
            }

            // Video ID logging removed for cleaner output

            return (
              <div key={video.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* YouTube Player */}
                <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                  {videoId && videoId.length === 11 ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&controls=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
                      title={video.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                      <div className="text-center text-gray-600 dark:text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        <p className="text-sm">Video unavailable</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                    {video.title}
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="mb-1">{video.channelName}</p>
                    <div className="flex items-center space-x-2">
                      <span>{video.views} views</span>
                      <span>•</span>
                      <span>{new Date(video.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {video.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
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


declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

