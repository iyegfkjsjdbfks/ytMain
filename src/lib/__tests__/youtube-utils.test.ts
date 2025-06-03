// @ts-nocheck
// Note: @ts-nocheck is used to skip type checking for this file
// as we're mocking browser globals that TypeScript doesn't know about

import {
  getYouTubeVideoId,
  isYouTubeUrl,
  extractVideoIdFromUrl,
  YouTubePlayerState,
  YouTubePlayer,
  embedYouTubeVideo,
} from '../youtube-utils';

// Mock YouTube IFrame API
const mockPlayer = {
  playVideo: jest.fn(() => Promise.resolve()),
  pauseVideo: jest.fn(() => Promise.resolve()),
  stopVideo: jest.fn(() => Promise.resolve()),
  seekTo: jest.fn(() => Promise.resolve()),
  getCurrentTime: jest.fn(() => Promise.resolve(0)),
  getDuration: jest.fn(() => Promise.resolve(0)),
  getVolume: jest.fn(() => Promise.resolve(50)),
  setVolume: jest.fn(() => Promise.resolve()),
  isMuted: jest.fn(() => Promise.resolve(false)),
  mute: jest.fn(() => Promise.resolve()),
  unMute: jest.fn(() => Promise.resolve()),
  destroy: jest.fn(),
};

// Mock the YouTube IFrame API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const mockYT = {
  Player: jest.fn().mockImplementation((elementId: string, options: any) => {
    if (options.events?.onReady) {
      options.events.onReady({ target: mockPlayer });
    }
    return mockPlayer;
  }),
  PlayerState: {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    VIDEO_CUED: 5,
  },
};

beforeAll(() => {
  // Set up our mock YT global
  global.window.YT = mockYT;
  
  // Mock document.createElement
  const originalCreateElement = document.createElement;
  document.createElement = jest.fn((tagName: string) => {
    const element = originalCreateElement.call(document, tagName);
    if (tagName === 'script') {
      // Simulate script load
      setTimeout(() => {
        if (window.onYouTubeIframeAPIReady) {
          window.onYouTubeIframeAPIReady();
        }
      }, 0);
    }
    return element;
  });

  // Mock document.body.appendChild
  document.body.appendChild = jest.fn();

  // Mock document.getElementById
  document.getElementById = jest.fn((id: string) => {
    const element = document.createElement('div');
    element.id = id;
    return element;
  });
});

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
});

// Helper function to wait for all promises to resolve
const flushPromises = () => new Promise(setImmediate);

describe('YouTubePlayer', () => {
  let player: YouTubePlayer;
  const elementId = 'test-player';
  const videoId = 'dQw4w9WgXcQ';

  beforeEach(() => {
    // Create a new player instance before each test
    player = new YouTubePlayer(elementId, videoId, {
      width: 800,
      height: 450,
      playerVars: {
        autoplay: 1,
        controls: 1,
      },
      events: {
        onReady: jest.fn(),
        onStateChange: jest.fn(),
      },
    });
  });

  afterEach(() => {
    // Clean up after each test
    if (player) {
      player.destroy();
    }
  });


  it('should initialize with the correct video ID', () => {
    expect(mockYT.Player).toHaveBeenCalledWith(
      elementId,
      expect.objectContaining({
        videoId,
        width: 800,
        height: 450,
        playerVars: {
          autoplay: 1,
          controls: 1,
        },
      })
    );
  });

  it('should call playVideo', async () => {
    await player.playVideo();
    expect(mockPlayer.playVideo).toHaveBeenCalled();
  });

  it('should call pauseVideo', async () => {
    await player.pauseVideo();
    expect(mockPlayer.pauseVideo).toHaveBeenCalled();
  });

  it('should call stopVideo', async () => {
    await player.stopVideo();
    expect(mockPlayer.stopVideo).toHaveBeenCalled();
  });

  it('should call seekTo with correct parameters', async () => {
    await player.seekTo(30, true);
    expect(mockPlayer.seekTo).toHaveBeenCalledWith(30, true);
  });

  it('should get current time', async () => {
    mockPlayer.getCurrentTime.mockResolvedValue(10);
    const time = await player.getCurrentTime();
    expect(time).toBe(10);
  });

  it('should get duration', async () => {
    mockPlayer.getDuration.mockResolvedValue(240);
    const duration = await player.getDuration();
    expect(duration).toBe(240);
  });

  it('should handle volume controls', async () => {
    // Test setVolume
    await player.setVolume(75);
    expect(mockPlayer.setVolume).toHaveBeenCalledWith(75);

    // Test getVolume
    mockPlayer.getVolume.mockResolvedValue(75);
    const volume = await player.getVolume();
    expect(volume).toBe(75);

    // Test mute/unmute
    await player.mute();
    expect(mockPlayer.mute).toHaveBeenCalled();

    await player.unMute();
    expect(mockPlayer.unMute).toHaveBeenCalled();

    // Test isMuted
    mockPlayer.isMuted.mockResolvedValue(true);
    const isMuted = await player.isMuted();
    expect(isMuted).toBe(true);
  });

  it('should handle player state changes', async () => {
    // Simulate a state change
    const onStateChange = jest.fn();
    player = new YouTubePlayer(elementId, videoId, {
      events: { onStateChange }
    });
    
    // Simulate a state change event
    const event = { data: YouTubePlayerState.PLAYING };
    mockYT.Player.mock.calls[1][1].events.onStateChange(event);
    
    expect(onStateChange).toHaveBeenCalledWith(event);
  });

  it('should handle player ready event', async () => {
    const onReady = jest.fn();
    player = new YouTubePlayer(elementId, videoId, {
      events: { onReady }
    });
    
    // The ready event is automatically triggered in the mock setup
    await flushPromises();
    expect(onReady).toHaveBeenCalled();
  });
});

describe('embedYouTubeVideo', () => {
  it('should create a YouTube player with default options', () => {
    const containerId = 'test-container';
    const videoId = 'test-video-id';
    
    const player = embedYouTubeVideo(containerId, videoId);
    
    expect(player).toBeInstanceOf(YouTubePlayer);
    expect(mockYT.Player).toHaveBeenCalledWith(
      containerId,
      expect.objectContaining({
        videoId,
        width: 560,
        height: 315,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 1,
          iv_load_policy: 3,
        },
      })
    );
  });

  it('should create a YouTube player with custom options', () => {
    const containerId = 'test-container';
    const videoId = 'test-video-id';
    const options = {
      width: 800,
      height: 450,
      autoplay: true,
      controls: false,
      modestbranding: true,
      rel: false,
      showinfo: true,
      fs: false,
      iv_load_policy: 1,
    };
    
    const player = embedYouTubeVideo(containerId, videoId, options);
    
    expect(player).toBeInstanceOf(YouTubePlayer);
    expect(mockYT.Player).toHaveBeenCalledWith(
      containerId,
      expect.objectContaining({
        videoId,
        width: options.width,
        height: options.height,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 1,
          fs: 0,
          iv_load_policy: 1,
        },
      })
    );
  });
});

describe('YouTube Utilities', () => {
  describe('getYouTubeVideoId', () => {
    it('should extract video ID from various YouTube URL formats', () => {
      const testCases = [
        {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ',
        },
        {
          url: 'https://youtu.be/dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ',
        },
        {
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ',
        },
        {
          url: 'https://www.youtube.com/v/dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ',
        },
        {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=youtu.be',
          expected: 'dQw4w9WgXcQ',
        },
      ];

      testCases.forEach(({ url, expected }) => {
        expect(getYouTubeVideoId(url)).toBe(expected);
      });
    });

    it('should return null for invalid URLs', () => {
      const invalidUrls = [
        '',
        'not-a-url',
        'https://www.google.com',
        'https://www.youtube.com',
        'https://www.youtube.com/watch',
        null,
        undefined,
      ];

      invalidUrls.forEach((url) => {
        expect(getYouTubeVideoId(url as string)).toBeNull();
      });
    });
  });

  describe('isYouTubeUrl', () => {
    it('should identify valid YouTube URLs', () => {
      const validUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'http://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
        'https://www.youtube.com/v/dQw4w9WgXcQ',
      ];

      validUrls.forEach((url) => {
        expect(isYouTubeUrl(url)).toBe(true);
      });
    });

    it('should reject invalid YouTube URLs', () => {
      const invalidUrls = [
        '',
        'not-a-url',
        'https://www.google.com',
        'https://www.youtube.com',
        'https://www.youtube.com/playlist?list=PL...',
        null,
        undefined,
      ];

      invalidUrls.forEach((url) => {
        expect(isYouTubeUrl(url as string)).toBe(false);
      });
    });
  });

  describe('extractVideoIdFromUrl', () => {
    it('should extract video ID from various URL formats', () => {
      const testCases = [
        {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ',
        },
        {
          url: 'https://youtu.be/dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ',
        },
        {
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ',
        },
        {
          url: 'https://www.youtube.com/v/dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ',
        },
        {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=youtu.be',
          expected: 'dQw4w9WgXcQ',
        },
      ];

      testCases.forEach(({ url, expected }) => {
        expect(extractVideoIdFromUrl(url)).toBe(expected);
      });
    });

    it('should return null for invalid URLs', () => {
      const invalidUrls = [
        '',
        'not-a-url',
        'https://www.google.com',
        'https://www.youtube.com',
        'https://www.youtube.com/watch',
        null,
        undefined,
      ];

      invalidUrls.forEach((url) => {
        expect(extractVideoIdFromUrl(url as string)).toBeNull();
      });
    });
  });

  describe('YouTubePlayerState', () => {
    it('should have the correct enum values', () => {
      expect(YouTubePlayerState.UNSTARTED).toBe(-1);
      expect(YouTubePlayerState.ENDED).toBe(0);
      expect(YouTubePlayerState.PLAYING).toBe(1);
      expect(YouTubePlayerState.PAUSED).toBe(2);
      expect(YouTubePlayerState.BUFFERING).toBe(3);
      expect(YouTubePlayerState.VIDEO_CUED).toBe(5);
    });
  });
});
