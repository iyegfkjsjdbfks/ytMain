// TODO: Fix import - import React from "react";
// TODO: Fix import - import { useState, useEffect } from 'react';
import { logger } from '@/utils/logger';
import { useLivePolls } from '@/hooks/useLiveStream';
import type { LivePoll } from '@/types/livestream';
// TODO: Fix import - import { PlusIcon, ClockIcon, CheckCircleIcon, ChartBarIcon, TrashIcon, StopIcon } from '@heroicons/react/24/outline';

interface LivePollsProps {
  streamId: string;
  isOwner: boolean;
  className?: string;
}

const LivePolls: React.FC<LivePollsProps> = ({
  streamId,
  isOwner,
  className = '',
}) => {
  const { polls, createPoll, votePoll } = useLivePolls(streamId);
  const [activePoll, setActivePoll] = useState<LivePoll | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    duration: 60, // seconds
  });

  // Set active poll from the polls returned by the hook
  useEffect(() => {
    const active = polls.find(p => p: any.isActive);
    setActivePoll(active || null);
  }, [polls]);

  const handleCreatePoll = async () => {
    if (!newPoll.question.trim() || newPoll.options.some(opt => !opt: any.trim())) {
      return;
    }

    try {
      await createPoll(
        newPoll.question,
        newPoll.options.filter((opt: any) => opt.trim()),
      );

      setNewPoll({ question: '', options: ['', ''], duration: 60 });
      setShowCreateForm(false);
    } catch (error) {
      logger.error('Failed to create poll:', error);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    try {
      await votePoll(pollId, optionId);
    } catch (error) {
      logger.error('Failed to vote:', error);
    }
  };

  const handleEndPoll = async (pollId: string) => {
    try {
      // TODO: Implement end poll functionality
      logger.debug('End poll:', pollId);
    } catch (error) {
      logger.error('Failed to end poll:', error);
    }
  };

  const addOption = () => {
    if (newPoll.options.length < 5) {
      setNewPoll(prev => ({ ...prev, options: [...prev.options, ''] }));
    }
  };

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll(prev => ({
        ...prev,
        options: prev.options.filter((_: any, i: any) => i: any !== index),
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((opt: any, i: any) => i: any === index ? value : opt: any),
    }));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeRemaining = (poll: LivePoll) => {
    if (!poll.isActive) {
return 0;
}
    const endTime = new Date(poll.createdAt.getTime() + poll.duration);
    return Math.max(0, Math.floor((endTime.getTime() - Date.now()) / 1000));
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Live Polls</span>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Poll</span>
          </button>
        )}
      </div>

      {/* Create Poll Form */}
      {showCreateForm && isOwner && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <div className="space-y-3">
            <div>
              <label htmlFor="poll-question" className="block text-sm font-medium text-gray-700 mb-1">
                Question
              </label>
              <input
                id="poll-question"
                type="text"
                value={newPoll.question}
                onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Ask your audience a question..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="poll-option-1" className="block text-sm font-medium text-gray-700 mb-2">
                Options
              </label>
              <div className="space-y-2">
                {newPoll.options.map((option: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      id={`poll-option-${index + 1}`}
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {newPoll.options.length > 2 && (
                      <button
                        onClick={() => removeOption(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {newPoll.options.length < 5 && (
                <button
                  onClick={addOption}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add another option
                </button>
              )}
            </div>

            <div>
              <label htmlFor="poll-duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (seconds)
              </label>
              <input
                id="poll-duration"
                type="number"
                value={newPoll.duration}
                onChange={(e) => setNewPoll(prev => ({ ...prev, duration: parseInt(e.target.value, 10) || 60 }))}
                min="30"
                max="600"
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleCreatePoll}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create & Start Poll
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Poll */}
      {activePoll && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-blue-900">Active Poll</h3>
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600">
                {formatDuration(getTimeRemaining(activePoll))} left
              </span>
              {isOwner && (
                <button
                  onClick={() => handleEndPoll(activePoll.id)}
                  className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <StopIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <p className="text-gray-900 mb-3 font-medium">{activePoll.question}</p>

          <div className="space-y-2">
            {activePoll.options.map((option: any) => (
              <div key={option.id} className="relative">
                <button
                  onClick={() => handleVote(activePoll.id, option.id)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-white transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900">{option.text}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">
                        {option.votes} votes
                      </span>
                      <span className="text-sm text-gray-500">
                        {option.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${option.percentage}%` }}
                    />
                  </div>
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 text-sm text-gray-600">
            Total votes: {activePoll.totalVotes}
          </div>
        </div>
      )}

      {/* Past Polls */}
      {polls.filter((p: any) => !p.isActive).length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Past Polls</h3>
          <div className="space-y-3">
            {polls.filter((p: any) => !p.isActive).map((poll: any) => (
              <div key={poll.id} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">{poll.question}</p>
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span className="text-sm">Ended</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {poll.options.map((option: any) => (
                    <div key={option.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{option.text}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">{option.votes} votes</span>
                        <span className="text-gray-500">({option.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  Total votes: {poll.totalVotes} •
                  Duration: {formatDuration(poll.duration)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {polls.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ChartBarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No polls yet</p>
          {isOwner && (
            <p className="text-sm mt-1">Create your first poll to engage with your audience!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LivePolls;
