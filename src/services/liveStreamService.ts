import type { 
  LiveStream, 
  ChatMessage, 
  SuperChat, 
  LivePoll, 
  QAQuestion,
  ChatModerationAction,
  StreamReplay
} from '../types/livestream';

// Simulated WebSocket service for real-time features
class LiveStreamService {
  private listeners: Map<string, Function[]> = new Map();
  private streams: Map<string, LiveStream> = new Map();
  private chatMessages: Map<string, ChatMessage[]> = new Map();
  private activePolls: Map<string, LivePoll> = new Map();
  private qaQuestions: Map<string, QAQuestion[]> = new Map();
  private superChats: Map<string, SuperChat[]> = new Map();

  // Event subscription
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Stream management
  async createStream(streamData: Partial<LiveStream>): Promise<LiveStream> {
    const stream: LiveStream = {
      id: `stream_${Date.now()}`,
      title: streamData.title || 'Untitled Stream',
      description: streamData.description || '',
      thumbnailUrl: streamData.thumbnailUrl || '/default-stream-thumbnail.jpg',
      streamUrl: `rtmp://stream.example.com/live/${Date.now()}`,
      streamKey: Math.random().toString(36).substring(2, 15),
      category: streamData.category || 'Just Chatting',
      tags: streamData.tags || [],
      visibility: streamData.visibility || 'public',
      status: 'scheduled',
      scheduledStartTime: streamData.scheduledStartTime || undefined,
      creatorId: 'user_123', // Mock user
      creatorName: 'Creator Name',
      creatorAvatar: '/default-avatar.jpg',
      settings: {
        enableChat: true,
        enableSuperChat: true,
        enablePolls: true,
        enableQA: true,
        chatMode: 'live',
        slowMode: 0,
        subscribersOnly: false,
        moderationLevel: 'moderate',
        quality: '1080p',
        bitrate: 4500,
        frameRate: 30,
        enableRecording: true,
        enableMultiplatform: false,
        platforms: [],
        ...streamData.settings,
      },
      stats: {
        viewers: 0,
        peakViewers: 0,
        averageViewers: 0,
        duration: 0,
        likes: 0,
        dislikes: 0,
        chatMessages: 0,
        superChatAmount: 0,
        superChatCount: 0,
        pollVotes: 0,
        qaQuestions: 0,
        streamHealth: 'excellent',
        bitrate: 4500,
        frameDrops: 0,
        latency: 2000,
      },
      monetization: {
        totalRevenue: 0,
        superChatRevenue: 0,
        adRevenue: 0,
        membershipRevenue: 0,
        donationRevenue: 0,
        superChats: [],
      },
    };

    this.streams.set(stream.id, stream);
    this.chatMessages.set(stream.id, []);
    this.qaQuestions.set(stream.id, []);
    this.superChats.set(stream.id, []);

    return stream;
  }

  async startStream(streamId: string): Promise<void> {
    const stream = this.streams.get(streamId);
    if (!stream) throw new Error('Stream not found');

    stream.status = 'live';
    stream.actualStartTime = new Date();
    this.streams.set(streamId, stream);

    // Start simulating real-time data
    this.simulateStreamActivity(streamId);
    
    this.emit('streamStarted', stream);
  }

  async endStream(streamId: string): Promise<StreamReplay> {
    const stream = this.streams.get(streamId);
    if (!stream) throw new Error('Stream not found');

    stream.status = 'ended';
    stream.endTime = new Date();
    this.streams.set(streamId, stream);

    // Create replay
    const replay: StreamReplay = {
      id: `replay_${Date.now()}`,
      streamId,
      title: stream.title + ' - Replay',
      thumbnailUrl: stream.thumbnailUrl,
      videoUrl: `https://replay.example.com/${streamId}`,
      duration: stream.stats.duration,
      chatMessages: this.chatMessages.get(streamId) || [],
      highlights: [],
      stats: stream.stats,
      createdAt: new Date(),
    };

    this.emit('streamEnded', { stream, replay });
    return replay;
  }

  // Chat functionality
  async sendChatMessage(streamId: string, message: string, userId: string = 'user_123'): Promise<ChatMessage> {
    const stream = this.streams.get(streamId);
    if (!stream || stream.status !== 'live') {
      throw new Error('Cannot send message to inactive stream');
    }

    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      userId,
      username: userId === 'user_123' ? 'StreamViewer' : `User${userId.slice(-4)}`,
      message,
      timestamp: new Date(),
      type: 'message',
      isModerator: false,
      isOwner: userId === stream.creatorId,
      isVerified: false,
      badges: [],
    };

    const messages = this.chatMessages.get(streamId) || [];
    messages.push(chatMessage);
    this.chatMessages.set(streamId, messages);

    // Update stats
    stream.stats.chatMessages++;
    this.streams.set(streamId, stream);

    this.emit('chatMessage', { streamId, message: chatMessage });
    return chatMessage;
  }

  async sendSuperChat(streamId: string, message: string, amount: number, currency: string = 'USD'): Promise<SuperChat> {
    const stream = this.streams.get(streamId);
    if (!stream || !stream.settings.enableSuperChat) {
      throw new Error('Super Chat not available');
    }

    const superChat: SuperChat = {
      id: `sc_${Date.now()}`,
      amount,
      currency,
      message,
      color: this.getSuperChatColor(amount),
      duration: this.getSuperChatDuration(amount),
      userId: 'user_123',
      username: 'SuperChatUser',
      timestamp: new Date(),
    };

    // Add to chat as special message
    const chatMessage: ChatMessage = {
      id: `msg_sc_${Date.now()}`,
      userId: 'user_123',
      username: 'SuperChatUser',
      message,
      timestamp: new Date(),
      type: 'super_chat',
      isModerator: false,
      isOwner: false,
      isVerified: false,
      badges: [],
      superChat,
    };

    const messages = this.chatMessages.get(streamId) || [];
    messages.push(chatMessage);
    this.chatMessages.set(streamId, messages);

    const superChats = this.superChats.get(streamId) || [];
    superChats.push(superChat);
    this.superChats.set(streamId, superChats);

    // Update monetization
    stream.stats.superChatAmount += amount;
    stream.stats.superChatCount++;
    stream.monetization.superChatRevenue += amount;
    stream.monetization.totalRevenue += amount;
    stream.monetization.superChats.push(superChat);

    this.streams.set(streamId, stream);
    this.emit('superChat', { streamId, superChat, chatMessage });
    
    return superChat;
  }

  // Moderation
  async moderateMessage(streamId: string, messageId: string, action: ChatModerationAction): Promise<void> {
    const messages = this.chatMessages.get(streamId) || [];
    const messageIndex = messages.findIndex(m => m.id === messageId);
    
    if (messageIndex === -1) return;

    const message = messages[messageIndex];
    if (!message) return;
    
    switch (action.type) {
      case 'delete':
        message.deleted = true;
        message.deletedBy = action.moderatorId;
        break;
      case 'timeout':
        // In real implementation, would prevent user from chatting
        this.emit('userTimedOut', { 
          streamId, 
          userId: message.userId, 
          duration: action.duration 
        });
        break;
      case 'ban':
        this.emit('userBanned', { 
          streamId, 
          userId: message.userId 
        });
        break;
    }

    messages[messageIndex] = message;
    this.chatMessages.set(streamId, messages);
    this.emit('messageModerated', { streamId, messageId, action });
  }

  // Polls
  async createPoll(streamId: string, question: string, options: string[], duration: number = 60): Promise<LivePoll> {
    const poll: LivePoll = {
      id: `poll_${Date.now()}`,
      question,
      options: options.map((text, index) => ({
        id: `option_${index}`,
        text,
        votes: 0,
        percentage: 0,
      })),
      duration,
      startTime: new Date(),
      totalVotes: 0,
      isActive: true,
      createdBy: 'user_123',
    };

    this.activePolls.set(poll.id, poll);
    
    // Auto-end poll after duration
    setTimeout(() => {
      this.endPoll(poll.id);
    }, duration * 1000);

    this.emit('pollCreated', { streamId, poll });
    return poll;
  }

  async votePoll(pollId: string, optionId: string): Promise<void> {
    const poll = this.activePolls.get(pollId);
    if (!poll || !poll.isActive) return;

    const option = poll.options.find(o => o.id === optionId);
    if (!option) return;

    option.votes++;
    poll.totalVotes++;

    // Recalculate percentages
    poll.options.forEach(opt => {
      opt.percentage = poll.totalVotes > 0 ? (opt.votes / poll.totalVotes) * 100 : 0;
    });

    this.activePolls.set(pollId, poll);
    this.emit('pollVote', { pollId, poll });
  }

  private async endPoll(pollId: string): Promise<void> {
    const poll = this.activePolls.get(pollId);
    if (!poll) return;

    poll.isActive = false;
    poll.endTime = new Date();
    this.activePolls.set(pollId, poll);
    this.emit('pollEnded', { pollId, poll });
  }

  // Q&A
  async submitQuestion(streamId: string, question: string, userId: string = 'user_123'): Promise<QAQuestion> {
    const qaQuestion: QAQuestion = {
      id: `qa_${Date.now()}`,
      question,
      askedBy: `User${userId.slice(-4)}`,
      userId,
      timestamp: new Date(),
      likes: 0,
      answered: false,
      pinned: false,
    };

    const questions = this.qaQuestions.get(streamId) || [];
    questions.push(qaQuestion);
    this.qaQuestions.set(streamId, questions);

    const stream = this.streams.get(streamId);
    if (stream) {
      stream.stats.qaQuestions++;
      this.streams.set(streamId, stream);
    }

    this.emit('questionSubmitted', { streamId, question: qaQuestion });
    return qaQuestion;
  }

  async answerQuestion(streamId: string, questionId: string, answer: string): Promise<void> {
    const questions = this.qaQuestions.get(streamId) || [];
    const questionIndex = questions.findIndex(q => q.id === questionId);
    
    if (questionIndex === -1) return;

    const question = questions[questionIndex];
    if (!question) return;
    
    question.answered = true;
    question.answeredAt = new Date();
    question.answer = answer;

    questions[questionIndex] = question;
    this.qaQuestions.set(streamId, questions);
    this.emit('questionAnswered', { streamId, question });
  }

  // Multi-platform streaming
  async enableMultiplatform(streamId: string, platforms: string[]): Promise<void> {
    const stream = this.streams.get(streamId);
    if (!stream) return;

    stream.settings.enableMultiplatform = true;
    stream.settings.platforms = platforms.map(name => ({
      name: name as any,
      enabled: true,
      streamKey: Math.random().toString(36).substring(2, 15),
    }));

    this.streams.set(streamId, stream);
    this.emit('multiplatformEnabled', { streamId, platforms });
  }

  // Utility methods
  private getSuperChatColor(amount: number): string {
    if (amount >= 500) return '#FF0000'; // Red
    if (amount >= 200) return '#FF6600'; // Orange
    if (amount >= 100) return '#FFFF00'; // Yellow
    if (amount >= 50) return '#00FF00';  // Green
    if (amount >= 20) return '#0099FF';  // Blue
    return '#9966FF'; // Purple
  }

  private getSuperChatDuration(amount: number): number {
    if (amount >= 500) return 300; // 5 minutes
    if (amount >= 200) return 120; // 2 minutes
    if (amount >= 100) return 60;  // 1 minute
    if (amount >= 50) return 30;   // 30 seconds
    return 15; // 15 seconds
  }

  private simulateStreamActivity(streamId: string): void {
    const interval = setInterval(() => {
      const stream = this.streams.get(streamId);
      if (!stream || stream.status !== 'live') {
        clearInterval(interval);
        return;
      }

      // Simulate viewer fluctuations
      const viewerChange = Math.floor(Math.random() * 20) - 10;
      stream.stats.viewers = Math.max(0, stream.stats.viewers + viewerChange);
      stream.stats.peakViewers = Math.max(stream.stats.peakViewers, stream.stats.viewers);
      
      // Simulate duration increment
      stream.stats.duration += 5;

      // Randomly simulate chat messages
      if (Math.random() > 0.7) {
        this.simulateChatMessage(streamId);
      }

      this.streams.set(streamId, stream);
      this.emit('statsUpdate', { streamId, stats: stream.stats });
    }, 5000);
  }

  private simulateChatMessage(streamId: string): void {
    const messages = [
      'Great stream!',
      'Amazing content!',
      'Keep it up!',
      'LOL that was funny',
      'Can you show that again?',
      'First time watching, love it!',
      'Been watching for hours',
      'This is so cool!',
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    const userId = `user_${Math.random().toString(36).substring(2, 8)}`;
    if (message && userId) {
      this.sendChatMessage(streamId, message, userId);
    }
  }

  // Get data methods
  getStream(streamId: string): LiveStream | undefined {
    return this.streams.get(streamId);
  }

  getChatMessages(streamId: string): ChatMessage[] {
    return this.chatMessages.get(streamId) || [];
  }

  getActivePolls(_streamId: string): LivePoll[] {
    return Array.from(this.activePolls.values());
  }

  getQuestions(streamId: string): QAQuestion[] {
    return this.qaQuestions.get(streamId) || [];
  }

  getSuperChats(streamId: string): SuperChat[] {
    return this.superChats.get(streamId) || [];
  }
}

export const liveStreamService = new LiveStreamService();

// Custom hooks
export function useLiveStream(_streamId?: string) {
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStream = useCallback(async (streamData: Partial<LiveStream>) => {
    setIsLoading(true);
    try {
      const newStream = await liveStreamService.createStream(streamData);
      setStream(newStream);
      setError(null);
      return newStream;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create stream');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startStream = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await liveStreamService.startStream(id);
      const updatedStream = liveStreamService.getStream(id);
      if (updatedStream) setStream(updatedStream);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start stream');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const endStream = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const replay = await liveStreamService.endStream(id);
      const updatedStream = liveStreamService.getStream(id);
      if (updatedStream) setStream(updatedStream);
      setError(null);
      return replay;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end stream');
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
  };
}

export function useLiveChat(streamId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const sendMessage = useCallback(async (message: string) => {
    try {
      await liveStreamService.sendChatMessage(streamId, message);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }, [streamId]);

  const sendSuperChat = useCallback(async (message: string, amount: number) => {
    try {
      await liveStreamService.sendSuperChat(streamId, message, amount);
    } catch (err) {
      console.error('Failed to send Super Chat:', err);
    }
  }, [streamId]);

  const moderateMessage = useCallback(async (messageId: string, action: ChatModerationAction) => {
    try {
      await liveStreamService.moderateMessage(streamId, messageId, action);
    } catch (err) {
      console.error('Failed to moderate message:', err);
    }
  }, [streamId]);

  // Listen for chat updates
  React.useEffect(() => {
    const handleChatMessage = (data: { streamId: string; message: ChatMessage }) => {
      if (data.streamId === streamId) {
        setMessages(prev => [...prev, data.message]);
      }
    };

    const handleSuperChat = (data: { streamId: string; chatMessage: ChatMessage }) => {
      if (data.streamId === streamId) {
        setMessages(prev => [...prev, data.chatMessage]);
      }
    };

    liveStreamService.on('chatMessage', handleChatMessage);
    liveStreamService.on('superChat', handleSuperChat);
    setIsConnected(true);

    // Load existing messages
    const existingMessages = liveStreamService.getChatMessages(streamId);
    setMessages(existingMessages);

    return () => {
      liveStreamService.off('chatMessage', handleChatMessage);
      liveStreamService.off('superChat', handleSuperChat);
      setIsConnected(false);
    };
  }, [streamId]);

  return {
    messages,
    isConnected,
    sendMessage,
    sendSuperChat,
    moderateMessage,
  };
}
