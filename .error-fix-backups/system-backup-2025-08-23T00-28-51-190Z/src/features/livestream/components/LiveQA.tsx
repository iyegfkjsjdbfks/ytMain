import React, { useState, FC } from 'react';
import { conditionalLogger } from '@/utils/conditionalLogger';
import { createComponentError } from '@/utils/errorUtils';
import { useLiveQA } from '@/hooks/useLiveStream';
import { QuestionMarkCircleIcon, HeartIcon, CheckCircleIcon, ClockIcon, MicrophoneIcon } from '@heroicons/react/24/outline';

interface LiveQAProps {
 streamId: string;
 isOwner: boolean;
 className?: string;
}

const LiveQA: React.FC<LiveQAProps> = ({
 streamId,
 isOwner,
 className = '' }) => {
 const { questions, submitQuestion, answerQuestion, upvoteQuestion } =
 useLiveQA(streamId);
 const [newQuestion, setNewQuestion] = useState<string>('');
 const [filter, setFilter] = useState<
 'all' | 'unanswered' | 'answered' | 'pinned'
 >('all');
 const [answerMode, setAnswerMode] = useState<string | null>(null);
 const [answerText, setAnswerText] = useState<string>('');

 const handleSubmitQuestion = async (): Promise<void> => {
 if (!newQuestion.trim()) {
 return;
 }

 try {
 await submitQuestion(newQuestion.trim());
 setNewQuestion('');
 } catch (error) {
 const componentError = createComponentError(
 'LiveQA',
 'Failed to submit question',
 error
 );
 conditionalLogger.error('Failed to submit question:', componentError);
 };

 const handleLikeQuestion = async (questionId): Promise<any> => {
 try {
 await upvoteQuestion(questionId);
 } catch (error) {
 const componentError = createComponentError(
 'LiveQA',
 'Failed to like question',
 error
 );
 conditionalLogger.error('Failed to like question:', componentError);
 };

 const handlePinQuestion = async (questionId): Promise<any> => {
 try {
 // TODO: Implement pin functionality in service
 conditionalLogger.debug('Pin question:', questionId);
 } catch (error) {
 const componentError = createComponentError(
 'LiveQA',
 'Failed to pin question',
 error
 );
 conditionalLogger.error('Failed to pin question:', componentError);
 };

 const handleAnswerQuestion = async (questionId): Promise<any> => {
 if (!answerText.trim()) {
 return;
 }

 try {
 await answerQuestion(questionId, answerText.trim());
 setAnswerMode(null);
 setAnswerText('');
 } catch (error) {
 const componentError = createComponentError(
 'LiveQA',
 'Failed to answer question',
 error
 );
 conditionalLogger.error('Failed to answer question:', componentError);
 };

 const formatTimestamp = (timestamp: Date) => {
 return new Intl.DateTimeFormat('en-US', {
 hour: '2-digit',
 minute: '2-digit' }).format(timestamp);
 };

 const filteredQuestions = questions.filter((question) => {
 switch (filter as any) {
 case 'unanswered':
 return !question.answered;
 case 'answered':
 return question.answered;
 case 'pinned':
 return question.isHighlighted; // Use isHighlighted as pinned,
 default: return true
 }

 });

 const sortedQuestions = filteredQuestions.sort((a, b) => {
 // Highlighted questions first
 if (a.isHighlighted && !b.isHighlighted) {
 return -1;
 }
 if (!a.isHighlighted && b.isHighlighted) {
 return 1;
 }

 // Then by upvotes
 const aUpvotes = a.upvotes || 0;
 const bUpvotes = b.upvotes || 0;
 if (aUpvotes !== bUpvotes) {
 return bUpvotes - aUpvotes;
 }

 // Then by timestamp
 return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
 });

 return (
 <div
// FIXED:  className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`} />
 >
 <div className='flex items-center justify-between mb-4'>
 <div className='flex items-center space-x-2'>
 <QuestionMarkCircleIcon className='w-5 h-5 text-gray-600' />
 <span className='font-medium text-gray-900'>Q&A</span>
 <span className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
 {questions.length} questions
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </div>

 {/* Submit Question */}
 <div className='mb-4 p-3 bg-gray-50 rounded-lg'>
 <div className='flex space-x-2'>
 <input
// FIXED:  type='text'
// FIXED:  value={newQuestion} />
// FIXED:  onChange={e => setNewQuestion(e.target.value)}
 onKeyPress={e => e.key === 'Enter' && handleSubmitQuestion()}
// FIXED:  placeholder='Ask a question...'
// FIXED:  className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
 />
 <button />
// FIXED:  onClick={(e) => handleSubmitQuestion(e)}
// FIXED:  disabled={!newQuestion.trim()}
// FIXED:  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
 >
 Ask
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>

 {/* Filter Tabs */}
 <div className='flex space-x-1 mb-4 p-1 bg-gray-100 rounded-lg'>
 {[
 { key: 'all',
 label: 'All', count: questions.length },
 {
 key: 'unanswered',
 label: 'Unanswered',
 count: questions.filter((q) => !q.answered).length },
 {
 key: 'answered',
 label: 'Answered',
 count: questions.filter((q) => q.answered).length },
 {
 key: 'pinned',
 label: 'Pinned',
 count: questions.filter((q) => q.isHighlighted).length }].map((tab) => (
 <button
 key={tab.key} />
// FIXED:  onClick={() => setFilter(tab.key as any)}
// FIXED:  className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
 filter === tab.key
 ? 'bg-white text-blue-600 shadow-sm'
 : 'text-gray-600 hover:text-gray-900'
 }`}
 >
 {tab.label} ({tab.count})
// FIXED:  </button>
 ))}
// FIXED:  </div>

 {/* Questions List */}
 <div className='space-y-3 max-h-96 overflow-y-auto'>
 {sortedQuestions.map((question) => (
 <div
 key={question.id}
// FIXED:  className={`p-4 border rounded-lg ${
 question.isHighlighted
 ? 'border-yellow-300 bg-yellow-50'
 : question.answered
 ? 'border-green-300 bg-green-50'
 : 'border-gray-200 bg-white'
 }`} />
 >
 <div className='flex items-start justify-between mb-2'>
 <div className='flex items-center space-x-2'>
 <img
// FIXED:  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${question.username}`}
// FIXED:  alt={question.username}
// FIXED:  className='w-6 h-6 rounded-full' />
 />
 <span className='font-medium text-sm text-gray-900'>
 {question.username}
// FIXED:  </span>
 <span className='text-xs text-gray-500'>
 {formatTimestamp(question.timestamp)}
// FIXED:  </span>
 {question.isHighlighted && (
 <span className='text-yellow-500 text-xs font-bold'>📌</span>
 )}
 {question.answered && (
 <CheckCircleIcon className='w-4 h-4 text-green-500' />
 )}
// FIXED:  </div>

 {isOwner && (
 <div className='flex space-x-1'>
 <button />
// FIXED:  onClick={() => handlePinQuestion(question.id)}
// FIXED:  className={`p-1 rounded hover:bg-gray-100 ${
 question.isHighlighted
 ? 'text-yellow-500'
 : 'text-gray-400'
 }`}
 title={
 question.isHighlighted ? 'Unpin question' : 'Pin question'
 }
 >
 <span className='text-yellow-500'>📌</span>
// FIXED:  </button>
 {!question.answered && (
 <button />
// FIXED:  onClick={() =>
 setAnswerMode(
 answerMode === question.id ? null : question.id
 )
 }
// FIXED:  className='p-1 rounded hover:bg-gray-100 text-blue-500'
 title='Answer question'
 >
 <MicrophoneIcon className='w-4 h-4' />
// FIXED:  </button>
 )}
// FIXED:  </div>
 )}
// FIXED:  </div>
<p className='text-gray-900 mb-3'>{question.question}</p>

 {question.answered && question.answer && (
 <div className='mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
 <div className='flex items-center space-x-2 mb-1'>
 <MicrophoneIcon className='w-4 h-4 text-blue-600' />
 <span className='text-sm font-medium text-blue-900'>
 Answer
// FIXED:  </span>
 {question.answeredAt && (
 <span className='text-xs text-blue-600'>
 {formatTimestamp(question.answeredAt)}
// FIXED:  </span>
 )}
// FIXED:  </div>
<p className='text-blue-900'>{question.answer}</p>
// FIXED:  </div>
 )}

 {answerMode === question.id && isOwner && (
 <div className='mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg'>
 <div className='space-y-2'>
 <textarea
// FIXED:  value={answerText} />
// FIXED:  onChange={e => setAnswerText(e.target.value)}
// FIXED:  placeholder='Type your answer...'
 rows={3}
// FIXED:  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
 />
 <div className='flex space-x-2'>
 <button />
// FIXED:  onClick={() => handleAnswerQuestion(question.id)}
// FIXED:  disabled={!answerText.trim()}
// FIXED:  className='px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm'
 >
 Answer
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => {
 setAnswerMode(null);
 setAnswerText('');
 }
// FIXED:  className='px-3 py-1 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm'
 >
 Cancel
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 )}

 <div className='flex items-center justify-between'>
 <button />
// FIXED:  onClick={() => handleLikeQuestion(question.id)}
// FIXED:  className='flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors'
 >
 <HeartIcon className='w-4 h-4' />
 <span className='text-sm'>{question.upvotes || 0}</span>
// FIXED:  </button>

 <div className='flex items-center space-x-2 text-xs text-gray-500'>
 {question.answered ? (
 <span className='flex items-center space-x-1 text-green-600'>
 <CheckCircleIcon className='w-3 h-3' />
 <span>Answered</span>
// FIXED:  </span>
 ) : (
 <span className='flex items-center space-x-1 text-orange-600'>
 <ClockIcon className='w-3 h-3' />
 <span>Pending</span>
// FIXED:  </span>
 )}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 ))}
// FIXED:  </div>

 {sortedQuestions.length === 0 && (
 <div className='text-center py-8 text-gray-500'>
 <QuestionMarkCircleIcon className='w-12 h-12 mx-auto mb-3 text-gray-300' />
 <p>No questions yet</p>
 <p className='text-sm mt-1'>
 {filter === 'all'
 ? 'Be the first to ask a question!'
 : `No ${filter} questions found.`}
// FIXED:  </p>
// FIXED:  </div>
 )}
// FIXED:  </div>
 );
};

export default LiveQA;
