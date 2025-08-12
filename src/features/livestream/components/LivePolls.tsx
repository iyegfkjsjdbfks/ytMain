import React, { useEffect, useState, FC } from 'react';
import { logger } from '@/utils/logger';
import { useLivePolls } from '@/hooks/useLiveStream';
import type { LivePoll } from '@/types/livestream';
import { PlusIcon, ClockIcon, CheckCircleIcon, ChartBarIcon, TrashIcon, StopIcon } from '@heroicons/react/24/outline';

interface LivePollsProps {
 streamId: string;
 isOwner: boolean;
 className?: string;
}

const LivePolls: React.FC<LivePollsProps> = ({
 streamId,
 isOwner,
 className = '' }) => {
 const { polls, createPoll, votePoll } = useLivePolls(streamId);
 const [activePoll, setActivePoll] = useState<LivePoll | null>(null);
 const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
 const [newPoll, setNewPoll] = useState({
 question: '',
 options: ['', ''],
 duration: 60, // seconds
 });

 // Set active poll from the polls returned by the hook
 useEffect(() => {
 const active = polls.find(p => p.isActive);
 setActivePoll(active || null);
 }, [polls]);

 const handleCreatePoll = async (): Promise<void> => {
 if (!newPoll.question.trim() || newPoll.options.some(opt => !opt.trim())) {
 return;
 }

 try {
 await createPoll(
 newPoll.question,
 newPoll.options.filter((opt: any) => opt.trim())
 );

 setNewPoll({ question: '',
 options: ['', ''], duration: 60 });
 setShowCreateForm(false);
 } catch (error: any) {
 logger.error('Failed to create poll:', error);
 };

 const handleVote = async (pollId: any,
 optionId: any): Promise<any> => {
 try {
 await votePoll(pollId, optionId);
 } catch (error: any) {
 logger.error('Failed to vote:', error);
 };

 const handleEndPoll = async (pollId: any): Promise<any> => {
 try {
 // TODO: Implement end poll functionality
 logger.debug('End poll:', pollId);
 } catch (error: any) {
 logger.error('Failed to end poll:', error);
 };

 const addOption: any = () => {
 if (newPoll.options.length < 5) {
 setNewPoll(prev => ({ ...prev as any, options: [...prev.options, ''] }));
 };

 const removeOption: any = (index: number) => {
 if (newPoll.options.length > 2) {
 setNewPoll(prev => ({
 ...prev as any,
 options: prev.options.filter((_, i) => i !== index) }));
 };

 const updateOption: any = (index: number,
 value: string | number) => {
 setNewPoll(prev => ({
 ...prev as any,
 options: prev.options.map((opt, i) => (i === index ? value : opt)) }));
 };

 const formatDuration: any = (seconds: any) => {
 const mins = Math.floor(seconds / 60);
 const secs = seconds % 60;
 return `${mins}:${secs.toString().padStart(2, '0')}`;
 };

 const getTimeRemaining: any = (poll: LivePoll) => {
 if (!poll.isActive) {
 return 0;
 }
 const endTime = new Date(poll.createdAt.getTime() + poll.duration);
 return Math.max(0, Math.floor((endTime.getTime() - Date.now()) / 1000));
 };

 return (
 <div
// FIXED:  className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`} />
 >
 <div className='flex items-center justify-between mb-4'>
 <div className='flex items-center space-x-2'>
 <ChartBarIcon className='w-5 h-5 text-gray-600' />
 <span className='font-medium text-gray-900'>Live Polls</span>
// FIXED:  </div>
 {isOwner && (
 <button />
// FIXED:  onClick={() => setShowCreateForm(!showCreateForm)}
// FIXED:  className='flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm'
 >
 <PlusIcon className='w-4 h-4' />
 <span>Create Poll</span>
// FIXED:  </button>
 )}
// FIXED:  </div>

 {/* Create Poll Form */}
 {showCreateForm && isOwner && (
 <div className='mb-4 p-4 bg-gray-50 rounded-lg border'>
 <div className='space-y-3'>
 <div>
 <label
// FIXED:  htmlFor='poll-question'
// FIXED:  className='block text-sm font-medium text-gray-700 mb-1' />
 >
 Question
// FIXED:  </label>
 <input
// FIXED:  id='poll-question'
// FIXED:  type='text'
// FIXED:  value={newPoll.question} />
// FIXED:  onChange={e =>
 setNewPoll(prev => ({ ...prev as any, question: e.target.value }))
 }
// FIXED:  placeholder='Ask your audience a question...'
// FIXED:  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
 />
// FIXED:  </div>

 <div>
 <label
// FIXED:  htmlFor='poll-option-1'
// FIXED:  className='block text-sm font-medium text-gray-700 mb-2' />
 >
 Options
// FIXED:  </label>
 <div className='space-y-2'>
 {newPoll.options.map((option, index) => (
 <div key={index} className='flex items-center space-x-2'>
 <input
// FIXED:  id={`poll-option-${index + 1}`}
// FIXED:  type='text'
// FIXED:  value={option} />
// FIXED:  onChange={e => updateOption(index, e.target.value)}
// FIXED:  placeholder={`Option ${index + 1}`}
// FIXED:  className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
 />
 {newPoll.options.length > 2 && (
 <button />
// FIXED:  onClick={() => removeOption(index)}
// FIXED:  className='p-2 text-red-500 hover:bg-red-50 rounded-lg'
 >
 <TrashIcon className='w-4 h-4' />
// FIXED:  </button>
 )}
// FIXED:  </div>
 ))}
// FIXED:  </div>
 {newPoll.options.length < 5 && (
 <button />
// FIXED:  onClick={(e: any) => addOption(e)}
// FIXED:  className='mt-2 text-sm text-blue-600 hover:text-blue-800'
 >
 + Add another option
// FIXED:  </button>
 )}
// FIXED:  </div>

 <div>
 <label
// FIXED:  htmlFor='poll-duration'
// FIXED:  className='block text-sm font-medium text-gray-700 mb-1' />
 >
 Duration (seconds)
// FIXED:  </label>
 <input
// FIXED:  id='poll-duration'
// FIXED:  type='number'
// FIXED:  value={newPoll.duration} />
// FIXED:  onChange={e =>
 setNewPoll(prev => ({
 ...prev as any,
 duration: parseInt(e.target.value, 10) || 60 }))
 }
 min='30'
 max='600'
// FIXED:  className='w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
 />
// FIXED:  </div>

 <div className='flex space-x-2'>
 <button />
// FIXED:  onClick={(e: any) => handleCreatePoll(e)}
// FIXED:  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
 >
 Create & Start Poll
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => setShowCreateForm(false)}
// FIXED:  className='px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50'
 >
 Cancel
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 )}

 {/* Active Poll */}
 {activePoll && (
 <div className='mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
 <div className='flex items-center justify-between mb-3'>
 <h3 className='font-medium text-blue-900'>Active Poll</h3>
 <div className='flex items-center space-x-2'>
 <ClockIcon className='w-4 h-4 text-blue-600' />
 <span className='text-sm text-blue-600'>
 {formatDuration(getTimeRemaining(activePoll))} left
// FIXED:  </span>
 {isOwner && (
 <button />
// FIXED:  onClick={() => handleEndPoll(activePoll.id)}
// FIXED:  className='ml-2 p-1 text-red-500 hover:bg-red-50 rounded'
 >
 <StopIcon className='w-4 h-4' />
// FIXED:  </button>
 )}
// FIXED:  </div>
// FIXED:  </div>

 <p className='text-gray-900 mb-3 font-medium'>
 {activePoll.question}
// FIXED:  </p>

 <div className='space-y-2'>
 {activePoll.options.map((option: any) => (
 <div key={option.id} className='relative'>
 <button />
// FIXED:  onClick={() => handleVote(activePoll.id, option.id)}
// FIXED:  className='w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-white transition-colors group'
 >
 <div className='flex items-center justify-between'>
 <span className='text-gray-900'>{option.text}</span>
 <div className='flex items-center space-x-2'>
 <span className='text-sm font-medium text-gray-600'>
 {option.votes} votes
// FIXED:  </span>
 <span className='text-sm text-gray-500'>
 {option.percentage.toFixed(1)}%
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </div>
 <div className='mt-2 bg-gray-200 rounded-full h-2'>
 <div
// FIXED:  className='bg-blue-600 h-2 rounded-full transition-all duration-300'
// FIXED:  style={{ width: `${option.percentage}%` } />
 />
// FIXED:  </div>
// FIXED:  </button>
// FIXED:  </div>
 ))}
// FIXED:  </div>

 <div className='mt-3 text-sm text-gray-600'>
 Total votes: {activePoll.totalVotes}
// FIXED:  </div>
// FIXED:  </div>
 )}

 {/* Past Polls */}
 {polls.filter((p: any) => !p.isActive).length > 0 && (
 <div>
 <h3 className='font-medium text-gray-900 mb-3'>Past Polls</h3>
 <div className='space-y-3'>
 {polls
 .filter((p: any) => !p.isActive)
 .map((poll: any) => (
 <div
 key={poll.id}
// FIXED:  className='p-3 border border-gray-200 rounded-lg' />
 >
 <div className='flex items-center justify-between mb-2'>
 <p className='font-medium text-gray-900'>{poll.question}</p>
 <div className='flex items-center space-x-1 text-green-600'>
 <CheckCircleIcon className='w-4 h-4' />
 <span className='text-sm'>Ended</span>
// FIXED:  </div>
// FIXED:  </div>

 <div className='space-y-2'>
 {poll.options.map((option: any) => (
 <div
 key={option.id}
// FIXED:  className='flex items-center justify-between text-sm' />
 >
 <span className='text-gray-700'>{option.text}</span>
 <div className='flex items-center space-x-2'>
 <span className='text-gray-600'>
 {option.votes} votes
// FIXED:  </span>
 <span className='text-gray-500'>
 ({option.percentage.toFixed(1)}%)
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </div>
 ))}
// FIXED:  </div>

 <div className='mt-2 text-xs text-gray-500'>
 Total votes: {poll.totalVotes} • Duration:{' '}
 {formatDuration(poll.duration)}
// FIXED:  </div>
// FIXED:  </div>
 ))}
// FIXED:  </div>
// FIXED:  </div>
 )}

 {polls.length === 0 && (
 <div className='text-center py-8 text-gray-500'>
 <ChartBarIcon className='w-12 h-12 mx-auto mb-3 text-gray-300' />
 <p>No polls yet</p>
 {isOwner && (
 <p className='text-sm mt-1'>
 Create your first poll to engage with your audience!
// FIXED:  </p>
 )}
// FIXED:  </div>
 )}
// FIXED:  </div>
 );
};

export default LivePolls;
