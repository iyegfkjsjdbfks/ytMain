import React, { useState, FC } from 'react';
import { realVideos } from '../../../../services/realVideoService';

import { VideoCard, VideoList, VideoGrid, StudioVideoGrid } from '../components';
import type { Video } from '../types';

/**
 * Demo page to showcase video components
 */
const VideoDemo: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'components' | 'studio'>(
    'components'
  );

  const handleVideoClick = (video: Video) => {
    alert(`Video clicked: ${video.title}`);
  };

  const handleVideoEdit = (videoId: any) => {
    alert(`Edit video: ${videoId}`);
  };

  const handleVideoDelete = (videoId: any) => {
    alert(`Delete video: ${videoId}`);
  };

  const handleVisibilityChange = (
    videoId: any,
    visibility: VideoVisibility
  ) => {
    alert(`Changed visibility of ${videoId} to ${visibility}`);
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8'>Video Component Demo</h1>

      {/* Tabs */}
      <div className='flex border-b mb-8'>
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
          <section className='mb-12'>
            <h2 className='text-2xl font-semibold mb-4'>
              Video Card (Default)
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6'>
              {realVideos[0] && (
                <VideoCard video={realVideos[0]} onClick={handleVideoClick} />
              )}
              {realVideos[1] && (
                <VideoCard video={realVideos[1]} onClick={handleVideoClick} />
              )}
            </div>
          </section>

          <section className='mb-12'>
            <h2 className='text-2xl font-semibold mb-4'>
              Video Card (Compact)
            </h2>
            <div className='max-w-md'>
              {realVideos[2] && (
                <VideoCard
                  video={realVideos[2]}
                  variant='compact'
                  onClick={handleVideoClick}
                />
              )}
              {realVideos[3] && (
                <VideoCard
                  video={realVideos[3]}
                  variant='compact'
                  onClick={handleVideoClick}
                />
              )}
            </div>
          </section>

          <section className='mb-12'>
            <h2 className='text-2xl font-semibold mb-4'>Video Card (Studio)</h2>
            <div className='max-w-4xl'>
              {realVideos[4] && (
                <VideoCard
                  video={realVideos[4]}
                  variant='studio'
                  onClick={handleVideoClick}
                />
              )}
            </div>
          </section>

          <section className='mb-12'>
            <h2 className='text-2xl font-semibold mb-4'>Video Grid</h2>
            {realVideos.length > 0 && (
              <VideoGrid
                title='Featured Videos'
                videos={realVideos}
                columns={4}
                showMoreLink='/videos/featured'
                onVideoClick={handleVideoClick}
              />
            )}
          </section>

          <section className='mb-12'>
            <h2 className='text-2xl font-semibold mb-4'>
              Video List (Grid Layout)
            </h2>
            {realVideos.length > 0 && (
              <VideoList
                videos={realVideos}
                layout='grid'
                onVideoClick={handleVideoClick}
              />
            )}
          </section>

          <section className='mb-12'>
            <h2 className='text-2xl font-semibold mb-4'>
              Video List (List Layout)
            </h2>
            {realVideos.length > 0 && (
              <VideoList
                videos={realVideos.slice(0, 4)}
                layout='list'
                variant='compact'
                onVideoClick={handleVideoClick}
              />
            )}
          </section>

          <section className='mb-12'>
            <h2 className='text-2xl font-semibold mb-4'>Empty Video List</h2>
            <VideoList
              videos={[]}
              emptyMessage='No videos found. Try a different search term.'
            />
          </section>
        </>
      ) : (
        <section className='mb-12'>
          <h2 className='text-2xl font-semibold mb-4'>Studio Video Grid</h2>
          {realVideos.length > 0 && (
            <StudioVideoGrid
              videos={realVideos}
              title='Your Videos'
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

