import { useState, useEffect, useCallback } from 'react';
import type { LivePoll, QAQuestion } from '@/types/livestream';

// Import statement fixed
//
interface LiveStreamState {
  isLive: boolean;
  viewerCount: number;
  chatMessages;
  streamQuality: string;
  error: string | null;
}

export const useLiveStream = (streamId?: string) => {
  const [state, setState] = useState<LiveStreamState>({
    isLive: false,
    viewerCount: 0,
    chatMessages: [],
    streamQuality: 'auto',
    error: null });

  const startStream = useCallback(async () => {
    try {
      // Implementation here
      setState(prev => ({ ...prev, isLive: true, error: null }));
    } catch (error) {
      setState(prev => ({ ...prev, error: (error as Error).message }));
    }
  }, []);

  const stopStream = useCallback(async () => {
    try {
      // Implementation here
      setState(prev => ({ ...prev, isLive: false, error: null }));
    } catch (error) {
      setState(prev => ({ ...prev, error: (error as Error).message }));
    }
  }, []);

  return {
    ...state,
    startStream,
    stopStream };
};

// Lightweight, in-memory implementation for live polls used by livestream components
export const useLivePolls = (streamId?: string) => {
  const [polls, setPolls] = useState<LivePoll[]>([]);

  // Reset polls when stream changes
  useEffect(() => {
    setPolls([]);
  }, [streamId]);

  const recalcPercentages = (totalVotes: any, votes: any) => {
    if (totalVotes === 0) return 0;
    return (votes / totalVotes) * 100;
  };

  const createPoll = async (question: any, options: any) => {
    const id = `poll_${Math.random().toString(36).slice(2, 9)}`;
    const createdAt = new Date();
    const durationMs = 60 * 1000; // default 60s

    const poll: LivePoll = {
      id,
      streamId,
      question,
      options: options.map((text: any, idx: any) => ({
        id: `opt_${idx}_${Math.random().toString(36).slice(2, 6)}`,
        text,
        votes: 0,
        percentage: 0 })),
      isActive: true,
      totalVotes: 0,
      createdAt,
      duration: durationMs };

    setPolls(prev => [poll, ...prev]);
  };

  const votePoll = async (pollId: any, optionId: any) => {
    setPolls(prev =>
      prev.map(p => {
        if (p.id !== pollId || !p.isActive) return p;
        const total = p.totalVotes + 1;
        const options = p.options.map((o: any) => {
          const votes = o.id === optionId ? o.votes + 1 : o.votes;
          return { ...o, votes };
        });
        const withPct = options.map((o: any) => ({
          ...o,
          percentage: recalcPercentages(total, o.votes) }));
        return { ...p, options: withPct, totalVotes: total };
      })
    );
  };

  return { polls, createPoll, votePoll } as const;
};

// Lightweight, in-memory implementation for Q&A used by livestream components
export const useLiveQA = (streamId?: string) => {
  const [questions, setQuestions] = useState<QAQuestion[]>([]);

  // Reset on stream change
  useEffect(() => {
    setQuestions([]);
  }, [streamId]);

  const submitQuestion = async (text: any) => {
    const q: QAQuestion = {
      id: `q_${Math.random().toString(36).slice(2, 9)}`,
      streamId,
      userId: `user_${Math.random().toString(36).slice(2, 6)}`,
      username: 'Guest',
      question: text,
      answer: undefined,
      answered: false,
      isAnswered: false,
      timestamp: new Date(),
      answeredAt: undefined,
      isHighlighted: false,
      upvotes: 0 };
    setQuestions(prev => [q, ...prev]);
  };

  const answerQuestion = async (questionId: any, answer: any) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? {
              ...q,
              answer,
              answered: true,
              isAnswered: true,
              answeredAt: new Date() }
          : q
      )
    );
  };

  const upvoteQuestion = async (questionId: any) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, upvotes: (q.upvotes || 0) + 1 } : q
      )
    );
  };

  return { questions, submitQuestion, answerQuestion, upvoteQuestion } as const;
};

export default useLiveStream;
