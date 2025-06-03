# YouTube Utilities

A collection of TypeScript utilities for working with YouTube videos in a React application. This package provides type-safe functions and components for handling YouTube video embeds, extracting video IDs, and managing YouTube player state.

## Features

- 🎥 Type-safe YouTube Player wrapper
- 🔍 Extract video IDs from various YouTube URL formats
- ✅ Validate YouTube URLs
- 🎛️ Control YouTube player programmatically
- 🎨 Customizable player options
- 📱 Responsive by default
- 🛡️ TypeScript support out of the box

## Installation

```bash
npm install --save @your-org/youtube-utils
# or
yarn add @your-org/youtube-utils
```

## Usage

### Basic Video Embed

```tsx
import { YouTubePlayer } from './youtube-utils';

// In your component
const MyVideoPlayer = () => {
  const playerRef = useRef<YouTubePlayer | null>(null);
  
  useEffect(() => {
    // Initialize player when component mounts
    const player = new YouTubePlayer(
      'youtube-player',
      'dQw4w9WgXcQ',
      {
        width: 800,
        height: 450,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => {
            console.log('Player is ready', event);
          },
          onStateChange: (event) => {
            console.log('Player state changed:', event.data);
          },
        },
      }
    );
    
    playerRef.current = player;
    
    // Cleanup on unmount
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);
  
  return <div id="youtube-player" />;
};
```

### Extracting Video IDs

```typescript
import { getYouTubeVideoId, extractVideoIdFromUrl, isYouTubeUrl } from './youtube-utils';

// Get video ID from URL
const videoId = getYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
// => 'dQw4w9WgXcQ'

// Extract video ID from various URL formats
const id = extractVideoIdFromUrl('https://youtu.be/dQw4w9WgXcQ');
// => 'dQw4w9WgXcQ'

// Check if a string is a valid YouTube URL
const isValid = isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
// => true
```

### Player Controls

```typescript
// Assuming player is an instance of YouTubePlayer
await player.playVideo();
await player.pauseVideo();
await player.seekTo(60); // Seek to 1 minute
await player.setVolume(50); // Set volume to 50%
await player.mute();
await player.unMute();
const isMuted = await player.isMuted();
const currentTime = await player.getCurrentTime();
const duration = await player.getDuration();
```

## API Reference

### `getYouTubeVideoId(url: string | null | undefined): string | null`

Extracts the video ID from a YouTube URL.

### `isYouTubeUrl(url: string): boolean`

Checks if a string is a valid YouTube URL.

### `extractVideoIdFromUrl(url: string | null | undefined): string | null`

Extracts video ID from various YouTube URL formats.

### `class YouTubePlayer`

A class that wraps the YouTube IFrame Player API.

#### Constructor

```typescript
new YouTubePlayer(
  elementId: string,
  videoId: string,
  options: {
    width?: number;
    height?: number;
    playerVars?: YouTubePlayerParameters;
    events?: {
      onReady?: (event: any) => void;
      onStateChange?: (event: any) => void;
    };
  } = {}
)
```

#### Methods

- `playVideo(): Promise<void>`: Starts playing the video.
- `pauseVideo(): Promise<void>`: Pauses the video.
- `stopVideo(): Promise<void>`: Stops the video.
- `seekTo(seconds: number, allowSeekAhead?: boolean): Promise<void>`: Seeks to a specified time.
- `getCurrentTime(): Promise<number>`: Gets the current playback time in seconds.
- `getDuration(): Promise<number>`: Gets the duration of the video in seconds.
- `getVolume(): Promise<number>`: Gets the current volume (0-100).
- `setVolume(volume: number): Promise<void>`: Sets the volume (0-100).
- `isMuted(): Promise<boolean>`: Checks if the player is muted.
- `mute(): Promise<void>`: Mutes the player.
- `unMute(): Promise<void>`: Unmutes the player.
- `destroy(): void`: Removes the player instance.

### `YouTubePlayerState`

Enum representing the various states of the YouTube player:

```typescript
enum YouTubePlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  VIDEO_CUED = 5,
}
```

### `YouTubePlayerParameters`

TypeScript interface for YouTube player parameters:

```typescript
interface YouTubePlayerParameters {
  autoplay?: 0 | 1;
  cc_load_policy?: 1;
  color?: 'red' | 'white';
  controls?: 0 | 1 | 2;
  disablekb?: 0 | 1;
  enablejsapi?: 0 | 1;
  end?: number;
  fs?: 0 | 1;
  hl?: string;
  iv_load_policy?: 1 | 3;
  list?: string;
  listType?: 'playlist' | 'user_uploads';
  loop?: 0 | 1;
  modestbranding?: 1;
  origin?: string;
  playlist?: string;
  playsinline?: 0 | 1;
  rel?: 0 | 1;
  showinfo?: 0 | 1;
  start?: number;
  wmode?: 'opaque' | 'transparent';
  theme?: 'dark' | 'light';
  autohide?: 0 | 1 | 2;
  cc_lang_pref?: string;
}
```

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`

## License

MIT

## Features

- 🎥 Type-safe YouTube Player wrapper
- 🔍 Extract video IDs from various YouTube URL formats
- ✅ Validate YouTube URLs
- 🎛️ Control YouTube player programmatically
- 🎨 Customizable player options
- 📱 Responsive by default
- 🛡️ TypeScript support out of the box

## Usage

### Basic Video Embed

```tsx
import { YouTubePlayer } from './youtube-utils';

// In your component
const MyVideoPlayer = () => {
  const playerRef = useRef<YouTubePlayer | null>(null);
  
  useEffect(() => {
    // Initialize player when component mounts
    const player = new YouTubePlayer('youtube-player', 'dQw4w9WgXcQ', {
      width: 800,
      height: 450,
      playerVars: {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
      },
      events: {
        onReady: (event) => {
          console.log('Player is ready', event);
        },
        onStateChange: (event) => {
          console.log('Player state changed:', event.data);
        },
      },
    });
    
    playerRef.current = player;
    
    // Cleanup on unmount
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);
  
  return <div id="youtube-player" />;
};
```

### Extracting Video IDs

```typescript
import { getYouTubeVideoId, extractVideoIdFromUrl, isYouTubeUrl } from './youtube-utils';

// Get video ID from URL
const videoId = getYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
// => 'dQw4w9WgXcQ'

// Extract video ID from various URL formats
const id = extractVideoIdFromUrl('https://youtu.be/dQw4w9WgXcQ');
// => 'dQw4w9WgXcQ'

// Check if a string is a valid YouTube URL
const isValid = isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
// => true
```

### Player Controls

```typescript
// Assuming player is an instance of YouTubePlayer
player.playVideo();
player.pauseVideo();
player.stopVideo();
player.seekTo(60); // Seek to 1 minute
```

## API Reference

### `getYouTubeVideoId(url: string | null | undefined): string | null`

Extracts the video ID from a YouTube URL.

### `isYouTubeUrl(url: string): boolean`

Checks if a string is a valid YouTube URL.

### `extractVideoIdFromUrl(url: string | null | undefined): string | null`

Extracts video ID from various YouTube URL formats.

### `class YouTubePlayer`

A class that wraps the YouTube IFrame Player API.

#### Constructor

```typescript
new YouTubePlayer(
  elementId: string,
  videoId: string,
  options: {
    width?: number;
    height?: number;
    playerVars?: YouTubePlayerParameters;
    events?: {
      onReady?: (event: any) => void;
      onStateChange?: (event: any) => void;
    };
  } = {}
)
```

#### Methods

- `playVideo()`: Starts playing the video.
- `pauseVideo()`: Pauses the video.
- `stopVideo()`: Stops the video.
- `seekTo(seconds: number, allowSeekAhead?: boolean)`: Seeks to a specified time.
- `destroy()`: Removes the player instance.

### `YouTubePlayerState`

Enum representing the various states of the YouTube player:

```typescript
enum YouTubePlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  VIDEO_CUED = 5,
}
```

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`

## License

MIT
