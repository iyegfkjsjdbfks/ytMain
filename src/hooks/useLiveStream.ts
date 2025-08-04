import React from "react";
import { useState, useCallback, useEffect } from 'react';
import type {
import { liveStreamService } from '../services/livestreamAPI';
import { logger } from '../utils/logger';
import { LiveStream, ChatMessage, LivePoll, QAQuestion, ChatModerationAction } from '../types/livestream';

/**
 * Hook for managing live stream state and operations
 */
export const useLiveStream = () => {
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStream = useCallback(async (streamData: Partial<LiveStream>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newStream = await liveStreamService.streams.createStream(streamData);
      setStream(newStream);
      return newStream;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create stream';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startStream = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedStream = await liveStreamService.streams.startStream(id);
      setStream(updatedStream);
      return updatedStream;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start stream';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const endStream = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedStream = await liveStreamService.streams.endStream(id);
      setStream(updatedStream);
      return updatedStream;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end stream';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    stream,
    isLoading,
    error,
    createStream,
    startStream,
    endStream,
    setStream,
  };
};

/**
 * Hook for managing live chat
 */
export const useLiveChat = (streamId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const sendMessage = useCallback(async (message: string) => {
    if (!streamId) {
return;
}
    try {
      const chatMessage = await liveStreamService.chat.sendMessage(
        streamId,
        message,
        'user_123',
        'Current User',
      );
      setMessages(prev => [...prev, chatMessage]);
      return chatMessage;
    } catch (err) {
      logger.error('Failed to send message:', err);
      throw err;
    }
  }, [streamId]);

  const sendSuperChat = useCallback(async (message: string, amount: number) => {
    if (!streamId) {
return;
}
    try {
      const superChat = await liveStreamService.chat.sendSuperChat(
        streamId,
        message,
        amount,
        'user_123',
        'Current User',
      );
      return superChat;
    } catch (err) {
      logger.error('Failed to send Super Chat:', err);
      throw err;
    }
  }, [streamId]);

  const moderateMessage = useCallback(async (messageId: string, action: ChatModerationAction) => {
    try {
      await liveStreamService.chat.moderateMessage(messageId, action);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      logger.error('Failed to moderate message:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (streamId) {
      // Simulate WebSocket connection
      setIsConnected(true);

      // Load initial messages
      liveStreamService.chat.getChatMessages(streamId).then(setMessages);

      // Simulate receiving messages
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
          const randomMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            userId: `user_${Math.random().toString(36).substr(2, 5)}`,
            username: `Viewer${Math.floor(Math.random() * 1000)}`,
            message: `Random message ${Math.floor(Math.random() * 100)}`,
            timestamp: new Date(),
            type: 'message',
            isModerator: false,
            isOwner: false,
            isVerified: false,
            badges: [],
          };
          setMessages(prev => [...prev, randomMessage]);
        }
      }, 5000);

      return () => {
        clearInterval(interval);
        setIsConnected(false);
      };
    }
    return undefined;
  }, [streamId]);

  return {
    messages,
    isConnected,
    sendMessage,
    sendSuperChat,
    moderateMessage,
  };
};

/**
 * Hook for managing live polls
 */
export const useLivePolls = (streamId?: string) => {
  const [polls, setPolls] = useState<LivePoll[]>([]);

  const createPoll = useCallback(async (question: string, options: string[]) => {
    if (!streamId) {
return;
}
    try {
      const poll = await liveStreamService.polls.createPoll(streamId, question, options);
      setPolls(prev => [...prev, poll]);
      return poll;
    } catch (err) {
      logger.error('Failed to create poll:', err);
      throw err;
    }
  }, [streamId]);

  const votePoll = useCallback(async (pollId: string, optionId: string) => {
    try {
      const updatedPoll = await liveStreamService.polls.votePoll(pollId, optionId);
      setPolls(prev => prev.map(poll =>
        poll.id === pollId ? updatedPoll : poll,
      ));
      return updatedPoll;
    } catch (err) {
      logger.error('Failed to vote on poll:', err);
      throw err;
    }
  }, []);

  const endPoll = useCallback(async (pollId: string) => {
    try {
      const updatedPoll = await liveStreamService.polls.endPoll(pollId);
      setPolls(prev => prev.map(poll =>
        poll.id === pollId ? updatedPoll : poll,
      ));
      return updatedPoll;
    } catch (err) {
      logger.error('Failed to end poll:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (streamId) {
      liveStreamService.polls.getStreamPolls(streamId).then(setPolls);
    }
  }, [streamId]);

  return {
    polls,
    createPoll,
    votePoll,
    endPoll,
  };
};

/**
 * Hook for managing Q&A
 */
export const useLiveQA = (streamId?: string) => {
  const [questions, setQuestions] = useState<QAQuestion[]>([]);

  const submitQuestion = useCallback(async (question: string) => {
    if (!streamId) {
return;
}
    try {
      const qaQuestion = await liveStreamService.qa.submitQuestion(
        streamId,
        question,
        'user_123',
        'Current User',
      );
      setQuestions(prev => [...prev, qaQuestion]);
      return qaQuestion;
    } catch (err) {
      logger.error('Failed to submit question:', err);
      throw err;
    }
  }, [streamId]);

  const answerQuestion = useCallback(async (questionId: string, answer: string) => {
    try {
      const updatedQuestion = await liveStreamService.qa.answerQuestion(questionId, answer);
      setQuestions(prev => prev.map(q =>
        q.id === questionId ? updatedQuestion : q,
      ));
      return updatedQuestion;
    } catch (err) {
      logger.error('Failed to answer question:', err);
      throw err;
    }
  }, []);

  const upvoteQuestion = useCallback(async (questionId: string) => {
    try {
      const updatedQuestion = await liveStreamService.qa.upvoteQuestion(questionId);
      setQuestions(prev => prev.map(q =>
        q.id === questionId ? updatedQuestion : q,
      ));
      return updatedQuestion;
    } catch (err) {
      logger.error('Failed to upvote question:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (streamId) {
      liveStreamService.qa.getStreamQuestions(streamId).then(setQuestions);
    }
  }, [streamId]);

  return {
    questions,
    submitQuestion,
    answerQuestion,
    upvoteQuestion,
  };
};
