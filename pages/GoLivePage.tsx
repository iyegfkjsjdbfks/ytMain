import type React from 'react';
import { useState, useRef, useEffect } from 'react';

const GoLivePage: React.FC = () => {
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private' | 'unlisted'>('public');
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Cleanup media stream on component unmount
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleStartStream = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          mediaStreamRef.current = stream;
        }
        setIsStreaming(true);
        // Here you would typically connect to a streaming server (e.g., RTMP server)
        } catch (error) {
        console.error('Error accessing media devices.', error);
        alert('Could not access camera and microphone. Please check permissions.');
      }
    } else {
      alert('getUserMedia is not supported in this browser.');
    }
  };

  const handleStopStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    mediaStreamRef.current = null;
    };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-neutral-800 dark:text-neutral-100">Go Live</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Stream Setup Form */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-neutral-700 dark:text-neutral-200">Stream Setup</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="streamTitle" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Title</label>
              <input
                type="text"
                id="streamTitle"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                className="w-full p-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow duration-150"
                placeholder="Enter your stream title"
              />
            </div>
            <div>
              <label htmlFor="streamDescription" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Description</label>
              <textarea
                id="streamDescription"
                value={streamDescription}
                onChange={(e) => setStreamDescription(e.target.value)}
                rows={3}
                className="w-full p-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow duration-150"
                placeholder="Tell viewers about your stream"
              />
            </div>
            <div>
              <label htmlFor="privacy" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Privacy</label>
              <select
                id="privacy"
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as 'public' | 'private' | 'unlisted')}
                className="w-full p-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow duration-150"
              >
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        </div>

        {/* Video Preview and Controls */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-neutral-700 dark:text-neutral-200">Live Preview</h2>
          <div className="aspect-video bg-black rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-700 mb-4">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
          </div>
          {!isStreaming ? (
            <button
              onClick={handleStartStream}
              disabled={!streamTitle}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800"
            >
              Start Streaming
            </button>
          ) : (
            <button
              onClick={handleStopStream}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800"
            >
              Stop Streaming
            </button>
          )}
        </div>
      </div>

      {/* Placeholder for advanced settings, chat, analytics etc. */}
      <div className="mt-10 p-6 bg-neutral-100 dark:bg-neutral-800/50 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
        <p className="text-center text-neutral-500 dark:text-neutral-400">Advanced Settings & Stream Analytics (Coming Soon)</p>
      </div>
    </div>
  );
};

export default GoLivePage;