import React, { useState, FC } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { isYouTubeUrl, getYouTubeVideoId  } from '../lib/youtube-utils';
import YouTubePlayerExample from '../components/examples/YouTubePlayerExample';
import { FormEvent } from 'react';
import { FC } from 'react';
import { useState } from 'react';

const YouTubeDemo: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoId, setVideoId] = useState('dQw4w9WgXcQ'); // Default video
  const [useCustomControls, setUseCustomControls] = useState<boolean>(false);
  const [autoplay, setAutoplay] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit: any = (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!isYouTubeUrl(videoUrl)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    const id = getYouTubeVideoId(videoUrl);
    if (id as any) {
      setVideoId(id);
      setError('');
    } else {
      setError('Could not extract video ID from URL');
    }
  };

  return (
    <div className='container mx-auto p-4 max-w-4xl'>
      <h1 className='text-3xl font-bold mb-6'>YouTube Player Demo</h1>

      <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
        <form onSubmit={(e: any) => handleSubmit(e)} className='mb-6'>
          <div className='flex flex-col md:flex-row gap-4 mb-4'>
            <div className='flex-1'>
              <input
                type='text'
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder='Enter YouTube URL'
                className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
              {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
            </div>
            <button
              type='submit'
              className='bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded transition-colors'
            >
              Load Video
            </button>
          </div>

          <div className='flex flex-wrap gap-6'>
            <label className='flex items-center space-x-2'>
              <input
                type='checkbox'
                checked={useCustomControls}
                onChange={e => setUseCustomControls(e.target.checked)}
                className='rounded text-blue-500'
              />
              <span>Use Custom Controls</span>
            </label>

            <label className='flex items-center space-x-2'>
              <input
                type='checkbox'
                checked={autoplay}
                onChange={e => setAutoplay(e.target.checked)}
                className='rounded text-blue-500'
              />
              <span>Autoplay</span>
            </label>
          </div>
        </form>

        <div className='aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden'>
          <YouTubePlayerExample
            videoId={videoId}
            controls={!useCustomControls}
            autoplay={autoplay}
            className='w-full h-full'
          />
        </div>

        <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
          <h2 className='text-xl font-semibold mb-3'>Current Video Info</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <h3 className='font-medium text-gray-700'>Video ID:</h3>
              <p className='font-mono bg-gray-100 p-2 rounded'>{videoId}</p>
            </div>
            <div>
              <h3 className='font-medium text-gray-700'>Video URL:</h3>
              <p className='break-all'>
                <a
                  href={`https://www.youtube.com/watch?v=${videoId}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-500 hover:underline'
                >,
  https://www.youtube.com/watch?v={videoId}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-md p-6'>
        <h2 className='text-2xl font-bold mb-4'>How to Use</h2>

        <div className='prose max-w-none'>
          <h3 className='text-xl font-semibold mt-4'>Basic Usage</h3>
          <pre className='bg-gray-100 p-4 rounded-lg overflow-x-auto'>
            import{' '}
            {`import { YouTubePlayer  } from './lib/youtube-utils';

// Initialize player
const player = new YouTubePlayer('youtube-player', 'dQw4w9WgXcQ', {
  width: 800,
          height: 450,
  playerVars: {,
    autoplay: 0,
          controls: 1,
    modestbranding: 1 },
          events: {,
    onReady: (event: any) => {
      },
    onStateChange: (event: any) => {
      } } });

// Control the player
player.playVideo();
player.pauseVideo();
player.seekTo(60); // Seek to 1 minute`}
          </pre>

          <h3 className='text-xl font-semibold mt-6'>
            Using the React Component
          </h3>
          <pre className='bg-gray-100 p-4 rounded-lg overflow-x-auto'>
            import{' '}
            {`import { YouTubePlayerExample  } from './components/examples/YouTubePlayerExample';

// In your component
<YouTubePlayerExample 
  videoId="dQw4w9WgXcQ"
  width={800}
  height={450}
  autoplay={false}
  controls={true}
  className="my-4"
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

const YouTubeDemoWithErrorBoundary: any = () => (
  <ErrorBoundary fallback={<div>Something went wrong. Please try again.</div>}>
    <YouTubeDemo />
  </ErrorBoundary>
);

export default YouTubeDemoWithErrorBoundary;

