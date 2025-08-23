// YouTube API Types - Minimal Implementation
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
}

export interface YouTubeComment {
  id: string;
  text: string;
  authorDisplayName: string;
  authorProfileImageUrl: string;
  likeCount: number;
  publishedAt: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  itemCount: number;
}

export interface YouTubeSearchResult {
  videos: YouTubeVideo[];
  channels: YouTubeChannel[];
  playlists: YouTubePlaylist[];
  nextPageToken?: string;
}

export interface YouTubeApiResponse<T> {
  items: T[];
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export class YouTubeEventTarget extends EventTarget {
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ): void {
    super.addEventListener(type, listener, options);
  }

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions
  ): void {
    super.removeEventListener(type, listener, options);
  }
}