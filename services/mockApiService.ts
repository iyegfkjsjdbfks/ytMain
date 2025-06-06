// Mock API service for development environment
export class MockApiService {
  private static instance: MockApiService;
  private baseUrl = 'https://picsum.photos';

  static getInstance(): MockApiService {
    if (!MockApiService.instance) {
      MockApiService.instance = new MockApiService();
    }
    return MockApiService.instance;
  }

  // Generate placeholder image URLs
  getPlaceholderImage(width: number, height: number, seed?: string | number): string {
    const seedParam = seed ? `?random=${seed}` : `?random=${Math.floor(Math.random() * 1000)}`;
    return `${this.baseUrl}/${width}/${height}${seedParam}`;
  }

  // Generate placeholder video URL (using a static video for demo)
  getPlaceholderVideo(id?: string): string {
    // Using a sample video from the internet for demo purposes
    const videos = [
      'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    ];
    
    const index = id ? parseInt(id) % videos.length : Math.floor(Math.random() * videos.length);
    return videos[index] || videos[0] || '';
  }

  // Generate mock video data
  generateMockVideo(id: string): any {
    const titles = [
      'Amazing Nature Documentary',
      'Coding Tutorial: React Hooks',
      'Travel Vlog: Japan Adventure',
      'Cooking Masterclass',
      'Music Performance Live',
      'Tech Review: Latest Gadgets',
      'Fitness Workout Routine',
      'Art Tutorial: Digital Painting',
      'Gaming Highlights',
      'Science Explained Simply'
    ];

    const channels = [
      'NatureWorld', 'CodeMaster', 'TravelBuddy', 'ChefExpert', 'MusicLive',
      'TechReviewer', 'FitnessPro', 'ArtStudio', 'GameZone', 'ScienceHub'
    ];

    const descriptions = [
      'An incredible journey through the natural world showcasing amazing wildlife and landscapes.',
      'Learn the fundamentals of React Hooks with practical examples and best practices.',
      'Join me on an amazing adventure through the beautiful country of Japan.',
      'Master the art of cooking with professional techniques and secret recipes.',
      'Experience live music performance with incredible sound quality and energy.',
      'Comprehensive review of the latest technology gadgets and innovations.',
      'Complete workout routine for all fitness levels with expert guidance.',
      'Step-by-step digital art tutorial for beginners and advanced artists.',
      'Epic gaming moments and highlights from the latest popular games.',
      'Complex scientific concepts explained in simple, easy-to-understand terms.'
    ];

    const index = parseInt(id) % titles.length;
    const views = Math.floor(Math.random() * 1000000) + 1000;
    const likes = Math.floor(views * 0.05);
    const uploadDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);

    return {
      id,
      title: titles[index],
      description: descriptions[index],
      thumbnailUrl: this.getPlaceholderImage(320, 180, id),
      videoUrl: this.getPlaceholderVideo(id),
      duration: this.generateRandomDuration(),
      views: views.toLocaleString(),
      likes,
      dislikes: Math.floor(likes * 0.1),
      uploadedAt: uploadDate.toISOString(),
      channelId: `channel-${index}`,
      channelName: channels[index],
      channelAvatar: this.getPlaceholderImage(40, 40, `channel-${index}`),
      channelVerified: Math.random() > 0.7,
      category: this.getRandomCategory(),
      tags: this.generateRandomTags(),
      isLive: Math.random() > 0.95,
      subscriberCount: Math.floor(Math.random() * 1000000) + 1000
    };
  }

  // Generate mock shorts data
  generateMockShort(id: string): any {
    const video = this.generateMockVideo(id);
    return {
      ...video,
      duration: Math.floor(Math.random() * 60) + 15, // 15-75 seconds
      hashtags: ['#shorts', '#viral', '#trending', ...this.generateRandomTags().slice(0, 3)],
      isShort: true
    };
  }

  // Generate mock comment data
  generateMockComment(id: string, _videoId: string): any {
    const authors = [
      'VideoLover123', 'TechEnthusiast', 'NatureFan', 'MusicAddict', 'Gamer4Life',
      'ArtAppreciator', 'FoodieExplorer', 'TravelBug', 'ScienceGeek', 'FitnessFreak'
    ];

    const comments = [
      'This is absolutely amazing! Thanks for sharing.',
      'Great content as always. Keep up the excellent work!',
      'I learned so much from this video. Very informative.',
      'The quality of this content is outstanding.',
      'This deserves way more views. Underrated channel!',
      'Can you make more videos like this? Love your style.',
      'This helped me so much with my project. Thank you!',
      'Your explanation is so clear and easy to understand.',
      'I\'ve been waiting for a video like this. Perfect timing!',
      'This is exactly what I needed to see today.'
    ];

    const index = parseInt(id) % authors.length;
    const commentIndex = parseInt(id) % comments.length;

    return {
      id,
      content: comments[commentIndex],
      authorId: `user-${index}`,
      authorName: authors[index],
      authorAvatar: this.getPlaceholderImage(32, 32, `user-${index}`),
      authorVerified: Math.random() > 0.8,
      isChannelOwner: Math.random() > 0.9,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      likes: Math.floor(Math.random() * 100),
      dislikes: Math.floor(Math.random() * 10),
      isLiked: Math.random() > 0.8,
      isDisliked: false,
      isPinned: Math.random() > 0.95,
      isEdited: Math.random() > 0.9,
      replies: [],
      moderationStatus: 'approved' as const,
      mentions: [],
      hashtags: []
    };
  }

  private generateRandomDuration(): string {
    const minutes = Math.floor(Math.random() * 30) + 1;
    const seconds = Math.floor(Math.random() * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private getRandomCategory(): string {
    const categories = [
      'Education', 'Entertainment', 'Gaming', 'Music', 'News & Politics',
      'Science & Technology', 'Sports', 'Travel & Events', 'People & Blogs',
      'Comedy', 'Film & Animation', 'Autos & Vehicles', 'Pets & Animals'
    ];
    return categories[Math.floor(Math.random() * categories.length)] || 'General';
  }

  private generateRandomTags(): string[] {
    const allTags = [
      'tutorial', 'review', 'vlog', 'music', 'gaming', 'tech', 'science',
      'nature', 'travel', 'food', 'art', 'fitness', 'education', 'entertainment',
      'comedy', 'news', 'sports', 'diy', 'howto', 'tips', 'tricks', 'guide'
    ];
    
    const numTags = Math.floor(Math.random() * 5) + 3;
    const shuffled = allTags.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numTags);
  }

  // Generate mock playlist data
  generateMockPlaylist(id: string): any {
    const titles = [
      'My Favorite Videos',
      'Watch Later',
      'Coding Tutorials',
      'Music Collection',
      'Travel Adventures',
      'Cooking Recipes',
      'Workout Routines',
      'Art Inspiration',
      'Gaming Highlights',
      'Science Documentaries'
    ];

    const index = parseInt(id) % titles.length;
    const videoCount = Math.floor(Math.random() * 50) + 5;
    const title = titles[index] || 'Default Playlist';

    return {
      id,
      title,
      description: `A curated collection of ${title.toLowerCase()}`,
      thumbnailUrl: this.getPlaceholderImage(320, 180, id),
      videoCount,
      visibility: Math.random() > 0.5 ? 'public' : 'private',
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      creatorId: `user-${index}`,
      creatorName: `Creator${index}`,
      views: Math.floor(Math.random() * 10000) + 100
    };
  }

  // Generate mock channel data
  generateMockChannel(id: string): any {
    const names = [
      'TechMaster', 'NatureExplorer', 'MusicMaven', 'GameGuru', 'ArtisticSoul',
      'FoodieAdventure', 'TravelDiaries', 'ScienceSimplified', 'FitnessJourney', 'ComedyCentral'
    ];

    const index = parseInt(id.replace('channel-', '')) % names.length;
    const subscriberCount = Math.floor(Math.random() * 1000000) + 1000;
    const videoCount = Math.floor(Math.random() * 500) + 10;
    const name = names[index] || 'Default Channel';

    return {
      id,
      name,
      handle: `@${name.toLowerCase()}`,
      description: `Welcome to ${name}! We create amazing content for our viewers.`,
      avatarUrl: this.getPlaceholderImage(80, 80, id),
      bannerUrl: this.getPlaceholderImage(1280, 320, `${id}-banner`),
      subscriberCount,
      videoCount,
      verified: Math.random() > 0.7,
      joinedDate: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Global',
      links: [
        { title: 'Website', url: `https://${name.toLowerCase()}.com` },
        { title: 'Twitter', url: `https://twitter.com/${name.toLowerCase()}` }
      ]
    };
  }

  // API endpoint simulation
  async simulateApiCall<T>(data: T, delay: number = 500): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), delay);
    });
  }

  // Error simulation for testing
  simulateApiError(message: string = 'API Error', status: number = 500): never {
    throw new Error(`${status}: ${message}`);
  }
}

// Export singleton instance
export const mockApi = MockApiService.getInstance();

// Helper functions for common use cases
export const getPlaceholderImage = (width: number, height: number, seed?: string | number) => 
  mockApi.getPlaceholderImage(width, height, seed);

export const getPlaceholderVideo = (id?: string) => 
  mockApi.getPlaceholderVideo(id);

export const generateMockVideos = (count: number) => 
  Array.from({ length: count }, (_, i) => mockApi.generateMockVideo(i.toString()));

export const generateMockShorts = (count: number) => 
  Array.from({ length: count }, (_, i) => mockApi.generateMockShort(i.toString()));

export const generateMockComments = (count: number, videoId: string) => 
  Array.from({ length: count }, (_, i) => mockApi.generateMockComment(i.toString(), videoId));

export default mockApi;
