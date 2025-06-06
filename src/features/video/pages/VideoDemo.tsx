import * as React from 'react';
import {  useState  } from 'react';
import { VideoCard, VideoList, VideoGrid, StudioVideoGrid } from '../components';
import { 
  mockFeaturedVideos, 
  mockRecommendedVideos, 
  mockTrendingVideos,
  mockUserVideos 
} from '../mocks/videoMocks';
import { Video, VideoVisibility } from '../types';

/**
 * Demo page to showcase video components
 */
const VideoDemo: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'components' | 'studio'>('components');

  const handleVideoClick = (video: Video) => {
    console.log('Video clicked:', video);
    alert(`Video clicked: ${video.title}`);
  };

  const handleVideoEdit = (videoId: string) => {
    console.log('Edit video:', videoId);
    alert(`Edit video: ${videoId}`);
  };

  const handleVideoDelete = (videoId: string) => {
    console.log('Delete video:', videoId);
    alert(`Delete video: ${videoId}`);
  };

  const handleVisibilityChange = (videoId: string, visibility: VideoVisibility) => {
    console.log('Visibility changed:', videoId, visibility);
    alert(`Changed visibility of ${videoId} to ${visibility}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Video Component Demo</h1>
      
      {/* Tabs */}
      <div className="flex border-b mb-8">
        <button
          className={`px-4 py-2 ${
            selectedTab === 'components' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-600'
          }`}
          onClick={() => setSelectedTab('components')}
        >
          Video Components
        </button>
        <button
          className={`px-4 py-2 ${
            selectedTab === 'studio' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-600'
          }`}
          onClick={() => setSelectedTab('studio')}
        >
          Studio Components
        </button>
      </div>

      {selectedTab === 'components' ? (
        <>
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Video Card (Default)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {mockFeaturedVideos[0] && <VideoCard video={mockFeaturedVideos[0]} onClick={handleVideoClick} />}
              {mockFeaturedVideos[1] && <VideoCard video={mockFeaturedVideos[1]} onClick={handleVideoClick} />}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Video Card (Compact)</h2>
            <div className="max-w-md">
              {mockFeaturedVideos[2] && (
                <VideoCard 
                  video={mockFeaturedVideos[2]} 
                  variant="compact"
                  onClick={handleVideoClick}
                />
              )}
              {mockFeaturedVideos[3] && (
                <VideoCard 
                  video={mockFeaturedVideos[3]} 
                  variant="compact"
                  onClick={handleVideoClick}
                />
              )}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Video Card (Studio)</h2>
            <div className="max-w-4xl">
              {mockFeaturedVideos[4] && (
                <VideoCard 
                  video={mockFeaturedVideos[4]} 
                  variant="studio"
                  onClick={handleVideoClick}
                />
              )}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Video Grid</h2>
            {mockFeaturedVideos.length > 0 && (
              <VideoGrid 
                title="Featured Videos" 
                videos={mockFeaturedVideos}
                columns={4}
                showMoreLink="/videos/featured"
                onVideoClick={handleVideoClick}
              />
            )}
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Video List (Grid Layout)</h2>
            {mockRecommendedVideos.length > 0 && (
              <VideoList 
                videos={mockRecommendedVideos}
                layout="grid"
                onVideoClick={handleVideoClick}
              />
            )}
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Video List (List Layout)</h2>
            {mockTrendingVideos.length > 0 && (
              <VideoList 
                videos={mockTrendingVideos.slice(0, 4)}
                layout="list"
                variant="compact"
                onVideoClick={handleVideoClick}
              />
            )}
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Empty Video List</h2>
            <VideoList 
              videos={[]}
              emptyMessage="No videos found. Try a different search term."
            />
          </section>
        </>
      ) : (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Studio Video Grid</h2>
          {mockUserVideos.length > 0 && (
            <StudioVideoGrid 
              videos={mockUserVideos}
              title="Your Videos"
              onEdit={handleVideoEdit}
              onDelete={handleVideoDelete}
              onVisibilityChange={handleVisibilityChange}
            />
          )}
        </section>
      )}
    </div>
  );
};

export default VideoDemo;
