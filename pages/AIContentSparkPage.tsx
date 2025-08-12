

import { useState, FC } from 'react';

import { LightBulbIcon, SparklesIcon } from '@heroicons/react/24/outline';

import { generateVideoIdeas } from '../services/geminiService';

import type { VideoIdeaResponse } from '../types';

const AIContentSparkPage: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoIdea, setVideoIdea] = useState<VideoIdeaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) {
      setError('Please enter a topic or some keywords to spark ideas.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setVideoIdea(null);
    try {
      const result = await generateVideoIdeas(userInput);
      setVideoIdea(result);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSkeleton = () => (
    <div className="mt-8 space-y-6 animate-pulse">
      <div>
        <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-2" />
        <div className="space-y-2">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-5/6" />
        </div>
      </div>
      <div>
        <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-2" />
        <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded" />
      </div>
      <div>
        <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-2" />
        <div className="space-y-2">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
        </div>
      </div>
      <div>
        <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-2" />
        <div className="flex flex-wrap gap-2">
          <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded-full w-20" />
          <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded-full w-24" />
          <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded-full w-16" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-neutral-950 min-h-full">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center text-center mb-8">
          <LightBulbIcon className="w-16 h-16 text-yellow-400 dark:text-yellow-300 mb-3" />
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
            AI Content Spark
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base max-w-xl">
            Unleash your creativity! Enter a topic or keywords, and let AI help you brainstorm ideas for your next video.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-neutral-50 dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700/50">
          <label htmlFor="userInput" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Your Topic or Keywords:
          </label>
          <textarea
            id="userInput"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="e.g., 'beginner friendly JavaScript tutorials', 'baking sourdough bread for the first time', 'travel vlog Bali'"
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 placeholder-neutral-400 dark:placeholder-neutral-500 text-sm transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full flex items-center justify-center px-6 py-3 bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-semibold rounded-lg text-base transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <AiIcon className="w-5 h-5 mr-2" />
                Spark Ideas
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700/60 rounded-lg text-sm text-red-700 dark:text-red-300 text-center" role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        {isLoading && renderSkeleton()}

        {videoIdea && !isLoading && (
          <div className="space-y-8 p-6 bg-neutral-50 dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700/50">
            <section>
              <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-3 border-b border-neutral-300 dark:border-neutral-700 pb-2">Suggested Titles</h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-neutral-700 dark:text-neutral-200 text-sm">
                {videoIdea.titles.map((title: any,
          index: number) => (
                  <li key={`title-${index}`}>{title}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-3 border-b border-neutral-300 dark:border-neutral-700 pb-2">Video Concept</h2>
              <p className="text-neutral-700 dark:text-neutral-200 whitespace-pre-wrap text-sm leading-relaxed">{videoIdea.concept}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-3 border-b border-neutral-300 dark:border-neutral-700 pb-2">Key Talking Points / Outline</h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-neutral-700 dark:text-neutral-200 text-sm">
                {videoIdea.talkingPoints.map((point: any,
          index: number) => (
                  <li key={`point-${index}`}>{point}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-3 border-b border-neutral-300 dark:border-neutral-700 pb-2">Suggested Tags</h2>
              <div className="flex flex-wrap gap-2">
                {videoIdea.tags.map((tag: string,
          index: number) => (
                  <span key={`tag-${index}`} className="px-3 py-1 bg-sky-100 dark:bg-sky-700/50 text-sky-700 dark:text-sky-300 rounded-full text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIContentSparkPage;
