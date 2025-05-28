
import { Video, Channel, Comment, PlaylistSummary, CommunityPost, UserPlaylist, UserPlaylistDetails, VideoUploadData, UploadProgress } from '../types'; // Correct relative path

const mockVideos: Video[] = [
  {
    id: '1',
    title: 'Exploring the Alps: A Scenic Journey',
    thumbnailUrl: 'https://picsum.photos/seed/alps/680/380',
    channelName: 'Nature Explorers',
    channelAvatarUrl: 'https://picsum.photos/seed/channel1/48/48',
    views: '1.2M views',
    uploadedAt: '2 weeks ago',
    duration: '12:34',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'A breathtaking journey through the Swiss Alps, showcasing stunning landscapes and wildlife. Join us as we hike, climb, and capture the beauty of this majestic mountain range. This trip was an unforgettable experience filled with adventure and discovery. We encountered diverse flora and fauna, and the views from the peaks were simply awe-inspiring. \n\nMusic by: Inspiring Tunes Co.\nFilmed with: DronePro X & ActionCam Z',
    category: 'Travel',
    isShort: false,
  },
  {
    id: 's1', 
    title: 'Coolest 30s Trick Shot!',
    thumbnailUrl: 'https://picsum.photos/seed/shorttrick/380/680', 
    channelName: 'TrickShotMasters',
    channelAvatarUrl: 'https://picsum.photos/seed/channelShort1/48/48',
    views: '5.3M views',
    uploadedAt: '1 day ago',
    duration: '0:30',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 
    description: 'Check out this insane trick shot! #shorts #trickshot',
    category: 'Shorts',
    isShort: true,
  },
  {
    id: '2',
    title: 'Ultimate Gaming Setup Tour 2024',
    thumbnailUrl: 'https://picsum.photos/seed/gaming/680/380',
    channelName: 'TechLevelUp',
    channelAvatarUrl: 'https://picsum.photos/seed/channel2/48/48',
    views: '870K views',
    uploadedAt: '5 days ago',
    duration: '22:10',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    description: 'Check out my ultimate gaming setup for 2024! We cover everything from the PC build, peripherals, to the overall room aesthetics. Links to all products mentioned are in the description below. Let me know what you think in the comments!',
    category: 'Gaming',
    isShort: false,
  },
  {
    id: 's2', 
    title: 'QuickLaughs: Funny Cat Moment',
    thumbnailUrl: 'https://picsum.photos/seed/catshort/380/680', 
    channelName: 'Funny Pets TV',
    channelAvatarUrl: 'https://picsum.photos/seed/channelFunnyPets/48/48',
    views: '10.1M views',
    uploadedAt: '6 hours ago',
    duration: '0:15',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 
    description: 'This cat is hilarious! 😂 #shorts #funnycat #pets',
    category: 'Shorts',
    isShort: true,
  },
  {
    id: '3',
    title: 'Delicious & Easy Pasta Recipe',
    thumbnailUrl: 'https://picsum.photos/seed/pasta/680/380',
    channelName: 'Chef Studio',
    channelAvatarUrl: 'https://picsum.photos/seed/channel3/48/48',
    views: '2.5M views',
    uploadedAt: '1 month ago',
    duration: '8:15',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description: 'Learn how to make a delicious and easy pasta dish that will impress your friends and family. This recipe is perfect for a quick weeknight meal or a fancy dinner party. Ingredients: Pasta, tomatoes, garlic, basil, olive oil, salt, pepper.',
    category: 'Cooking',
    isShort: false,
  },
  {
    id: 's3', 
    title: 'Amazing Parkour Skills #shorts',
    thumbnailUrl: 'https://picsum.photos/seed/parkourshort/380/680', 
    channelName: 'Urban Ninjas',
    channelAvatarUrl: 'https://picsum.photos/seed/channelParkour/48/48',
    views: '2.2M views',
    uploadedAt: '3 days ago',
    duration: '0:45',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', 
    description: 'Flipping through the city! #parkour #freerunning #shorts',
    category: 'Shorts',
    isShort: true,
  },
  {
    id: '4',
    title: 'Introduction to Quantum Computing',
    thumbnailUrl: 'https://picsum.photos/seed/quantum/680/380',
    channelName: 'Science Explained',
    channelAvatarUrl: 'https://picsum.photos/seed/channel4/48/48',
    views: '500K views',
    uploadedAt: '3 days ago',
    duration: '18:45',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    description: 'Dive into the fascinating world of quantum computing. This video breaks down the basic concepts, potential applications, and the current state of this revolutionary technology. No prior physics knowledge required!',
    category: 'Science',
    isShort: false,
  },
   {
    id: '5',
    title: 'Acoustic Guitar Cover: Classic Hits',
    thumbnailUrl: 'https://picsum.photos/seed/guitar/680/380',
    channelName: 'Music Moments',
    channelAvatarUrl: 'https://picsum.photos/seed/channel5/48/48',
    views: '750K views',
    uploadedAt: '1 week ago',
    duration: '15:20',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    description: 'Relax and enjoy this acoustic guitar medley of classic hits. Perfect for studying, chilling, or just unwinding. Let me know your favorite song in the comments!',
    category: 'Music',
    isShort: false,
  },
  {
    id: '6',
    title: 'DIY Home Office Makeover',
    thumbnailUrl: 'https://picsum.photos/seed/office/680/380',
    channelName: 'Creative Homes',
    channelAvatarUrl: 'https://picsum.photos/seed/channel6/48/48',
    views: '320K views',
    uploadedAt: '2 months ago',
    duration: '25:55',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    description: 'Transform your home office space with these DIY tips and tricks. From organization hacks to decor ideas, this makeover will boost your productivity and creativity. All on a budget!',
    category: 'DIY',
    isShort: false,
  },
  {
    id: '7',
    title: 'Travel Vlog: Tokyo Adventures',
    thumbnailUrl: 'https://picsum.photos/seed/tokyo/680/380',
    channelName: 'Wanderlust Life',
    channelAvatarUrl: 'https://picsum.photos/seed/channel7/48/48',
    views: '1.8M views',
    uploadedAt: '6 days ago',
    duration: '30:05',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    description: 'Join me on an exciting adventure through Tokyo, Japan! We explore vibrant markets, serene temples, and indulge in delicious local cuisine. This city is full of surprises!',
    category: 'Travel',
    isShort: false,
  },
  {
    id: '8',
    title: 'Advanced JavaScript Concepts for Developers',
    thumbnailUrl: 'https://picsum.photos/seed/javascript/680/380',
    channelName: 'Code Master',
    channelAvatarUrl: 'https://picsum.photos/seed/channel8/48/48',
    views: '400K views',
    uploadedAt: '10 days ago',
    duration: '45:12',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    description: 'Take your JavaScript skills to the next level with this deep dive into advanced concepts like closures, prototypes, async/await, and more. Essential for any serious web developer.',
    category: 'Education',
    isShort: false,
  },
  {
    id: '9',
    title: 'Sunrise Timelapse Over Mountains - Nature Beauty',
    thumbnailUrl: 'https://picsum.photos/seed/sunrise/680/380',
    channelName: 'Nature Explorers',
    channelAvatarUrl: 'https://picsum.photos/seed/channel1/48/48',
    views: '300K views',
    uploadedAt: '3 weeks ago',
    duration: '5:50',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    description: 'A stunning timelapse of the sunrise over a remote mountain range. Captured over 3 hours. The changing colors of the sky are truly magical. Perfect for meditation or a peaceful background.',
    category: 'Nature',
    isShort: false,
  },
  {
    id: '10',
    title: 'The Future of AI in Gaming Industry',
    thumbnailUrl: 'https://picsum.photos/seed/aigaming/680/380',
    channelName: 'TechLevelUp',
    channelAvatarUrl: 'https://picsum.photos/seed/channel2/48/48',
    views: '620K views',
    uploadedAt: '1 day ago',
    duration: '19:30',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    description: 'Exploring how artificial intelligence is revolutionizing the gaming industry. From smarter NPCs to procedurally generated worlds, AI is taking immersion to new heights. What are your thoughts on AI in games?',
    category: 'Technology',
    isShort: false,
  },
  {
    id: '11',
    title: 'Baking Sourdough Bread for Beginners Guide',
    thumbnailUrl: 'https://picsum.photos/seed/sourdough/680/380',
    channelName: 'Chef Studio',
    channelAvatarUrl: 'https://picsum.photos/seed/channel3/48/48',
    views: '1.9M views',
    uploadedAt: '2 months ago',
    duration: '28:40',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    description: 'Your comprehensive guide to baking delicious sourdough bread at home, even if you\'re a complete beginner. I cover starter care, kneading techniques, and baking tips for that perfect crust and crumb.',
    category: 'Cooking',
    isShort: false,
  },
  {
    id: '12',
    title: 'Mysteries of the Deep Blue Ocean Creatures',
    thumbnailUrl: 'https://picsum.photos/seed/ocean/680/380',
    channelName: 'Science Explained',
    channelAvatarUrl: 'https://picsum.photos/seed/channel4/48/48',
    views: '950K views',
    uploadedAt: '10 days ago',
    duration: '24:15',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    description: 'The deep ocean is Earth\'s last great frontier. Discover the strange and wonderful creatures that inhabit these dark depths, and the unique ecosystems they form. Prepare to be amazed by the biodiversity hidden beneath the waves.',
    category: 'Science',
    isShort: false,
  }
];

const mockPlaylistsData: { [channelName: string]: PlaylistSummary[] } = {
  'Nature Explorers': [
    { id: 'pl1-1', title: 'Mountain Expeditions Collection', videoCount: 5, thumbnailUrl: 'https://picsum.photos/seed/mountainplaylist/320/180' },
    { id: 'pl1-2', title: 'Wildlife Wonders Series', videoCount: 12, thumbnailUrl: 'https://picsum.photos/seed/wildlifeplaylist/320/180' },
    { id: 'pl1-3', title: 'Forest Adventures', videoCount: 8, thumbnailUrl: 'https://picsum.photos/seed/forestplaylist/320/180' },
  ],
  'TechLevelUp': [
    { id: 'pl2-1', title: 'Ultimate PC Build Guides', videoCount: 8, thumbnailUrl: 'https://picsum.photos/seed/pcbuildplaylist/320/180' },
    { id: 'pl2-2', title: 'Gadget Reviews 2024', videoCount: 15, thumbnailUrl: 'https://picsum.photos/seed/softwarereview/320/180' },
  ],
  'Chef Studio': [
    { id: 'pl3-1', title: '30-Minute Quick Dinners', videoCount: 20, thumbnailUrl: 'https://picsum.photos/seed/quickdinner/320/180' },
    { id: 'pl3-2', title: 'Artisan Baking Masterclass', videoCount: 10, thumbnailUrl: 'https://picsum.photos/seed/bakingclass/320/180' },
    { id: 'pl3-3', title: 'Healthy Breakfast Ideas', videoCount: 12, thumbnailUrl: 'https://picsum.photos/seed/breakfastplaylist/320/180' },
  ],
};

const mockCommunityPostsData: { [channelName: string]: CommunityPost[] } = {
  'Nature Explorers': [
    { id: 'cp1-1', channelName: 'Nature Explorers', channelAvatarUrl: 'https://picsum.photos/seed/channel1/48/48', timestamp: '2 days ago', textContent: 'Just wrapped up filming our new documentary on the Amazon! Stay tuned for some incredible footage. What are you hoping to see?', likes: 1256, commentsCount: 87, imageUrl: 'https://picsum.photos/seed/amazonpost/600/400' },
    { id: 'cp1-2', channelName: 'Nature Explorers', channelAvatarUrl: 'https://picsum.photos/seed/channel1/48/48', timestamp: '1 week ago', textContent: 'Poll: What should our next expedition focus on?\nA) Arctic Tundra\nB) Coral Reefs\nC) African Savanna\nVote now!', likes: 530, commentsCount: 255 },
  ],
  'TechLevelUp': [
    { id: 'cp2-1', channelName: 'TechLevelUp', channelAvatarUrl: 'https://picsum.photos/seed/channel2/48/48', timestamp: '5 hours ago', textContent: 'Working on a review of the latest flagship smartphone. Any specific features you want me to cover in detail? Drop your questions below! 👇', likes: 380, commentsCount: 42 },
    { id: 'cp2-2', channelName: 'TechLevelUp', channelAvatarUrl: 'https://picsum.photos/seed/channel2/48/48', timestamp: '3 days ago', textContent: 'Throwback to one of my favorite PC builds! Still running strong after all these years. What was your first PC build like?\n#PCGaming #Tech #Throwback', likes: 815, commentsCount: 123, imageUrl: 'https://picsum.photos/seed/pcbuildthrowback/600/300' },
  ],
   'Chef Studio': [
    { id: 'cp3-1', channelName: 'Chef Studio', channelAvatarUrl: 'https://picsum.photos/seed/channel3/48/48', timestamp: '1 day ago', textContent: 'Just tested a new pasta sauce recipe - it\'s divine! Absolutely creamy and full of flavor. Sharing it next week. What\'s your go-to comfort food?', likes: 975, commentsCount: 77, imageUrl: 'https://picsum.photos/seed/pastasaucepost/600/450' },
    { id: 'cp3-2', channelName: 'Chef Studio', channelAvatarUrl: 'https://picsum.photos/seed/channel3/48/48', timestamp: '5 days ago', textContent: 'What are your favorite holiday baking traditions? Share them in the comments! 🍪🎄', likes: 450, commentsCount: 95 },
  ],
};

const mockChannelsData: { [key: string]: Channel } = {
  'Nature Explorers': { 
    id: 'channel1', name: 'Nature Explorers', avatarUrl: 'https://picsum.photos/seed/channel1/48/48', subscribers: '1.5M subscribers',
    joinDate: 'Joined Sep 12, 2015', totalViews: '150,320,100 views',
    channelDescription: 'Exploring the wonders of the natural world, from towering mountains to the depths of the oceans. Join us for breathtaking documentaries, wildlife encounters, and travel vlogs that inspire a love for our planet.\n\nWe believe in conservation and ethical wildlife filmmaking.\nOur content aims to educate and entertain, bringing the wild to your screen.',
    playlists: mockPlaylistsData['Nature Explorers'], communityPosts: mockCommunityPostsData['Nature Explorers']
  },
  'TechLevelUp': { 
    id: 'channel2', name: 'TechLevelUp', avatarUrl: 'https://picsum.photos/seed/channel2/48/48', subscribers: '890K subscribers',
    joinDate: 'Joined Mar 5, 2018', totalViews: '95,780,500 views',
    channelDescription: 'Your go-to source for tech reviews, gaming news, PC builds, and software tutorials. We help you level up your tech game with informative and engaging content. Check out our latest hardware comparisons and in-depth analysis of emerging technologies.\n\nWeekly uploads and live Q&A sessions!',
    playlists: mockPlaylistsData['TechLevelUp'], communityPosts: mockCommunityPostsData['TechLevelUp']
  },
  'Chef Studio': { 
    id: 'channel3', name: 'Chef Studio', avatarUrl: 'https://picsum.photos/seed/channel3/48/48', subscribers: '3.2M subscribers',
    joinDate: 'Joined Jan 20, 2012', totalViews: '450,100,700 views',
    channelDescription: 'Delicious recipes, cooking tips, and culinary adventures from our kitchen to yours. Whether you\'re a beginner cook or a seasoned chef, you\'ll find something to tantalize your taste buds. New recipes every week, from simple meals to gourmet dishes.\n\nFollow us on Instagram @ChefStudioOfficial',
    playlists: mockPlaylistsData['Chef Studio'], communityPosts: mockCommunityPostsData['Chef Studio']
  },
  'Science Explained': { 
    id: 'channel4', name: 'Science Explained', avatarUrl: 'https://picsum.photos/seed/channel4/48/48', subscribers: '750K subscribers',
    joinDate: 'Joined Jul 30, 2019', totalViews: '60,450,200 views',
    channelDescription: 'Making complex science simple and fun! We break down fascinating topics in physics, biology, astronomy, and more, with clear explanations and engaging visuals. Ask your science questions in the comments! Our mission is to make science accessible to everyone.',
    playlists: [], communityPosts: [] 
  },
  'Music Moments': { 
    id: 'channel5', name: 'Music Moments', avatarUrl: 'https://picsum.photos/seed/channel5/48/48', subscribers: '500K subscribers',
    joinDate: 'Joined Nov 15, 2016', totalViews: '70,800,300 views',
    channelDescription: 'Acoustic covers, live performances, and music theory lessons. Sharing the joy of music one note at a time. Request your favorite songs for future covers! We also feature up-and-coming artists.',
    playlists: [], communityPosts: []
  },
  'Creative Homes': { 
    id: 'channel6', name: 'Creative Homes', avatarUrl: 'https://picsum.photos/seed/channel6/48/48', subscribers: '280K subscribers',
    joinDate: 'Joined Apr 22, 2017', totalViews: '35,600,900 views',
    channelDescription: 'DIY projects, home decor inspiration, and organization hacks to make your living space beautiful and functional. Let\'s get creative together! Budget-friendly ideas for a stylish home.',
    playlists: [], communityPosts: []
  },
  'Wanderlust Life': { 
    id: 'channel7', name: 'Wanderlust Life', avatarUrl: 'https://picsum.photos/seed/channel7/48/48', subscribers: '2.1M subscribers',
    joinDate: 'Joined Dec 1, 2014', totalViews: '320,950,600 views',
    channelDescription: 'Travel vlogs, city guides, and adventure stories from around the globe. Inspiring you to explore the world and create unforgettable memories. Where should we go next? Join our community of explorers!',
    playlists: [], communityPosts: []
  },
  'Code Master': { 
    id: 'channel8', name: 'Code Master', avatarUrl: 'https://picsum.photos/seed/channel8/48/48', subscribers: '600K subscribers',
    joinDate: 'Joined Feb 10, 2020', totalViews: '50,200,100 views',
    channelDescription: 'Tutorials and courses on programming languages, web development, software engineering, and computer science. Helping you master the art of code. Join our coding challenges and improve your skills!',
    playlists: [], communityPosts: []
  },
  'TrickShotMasters': {
    id: 'channelShort1', name: 'TrickShotMasters', avatarUrl: 'https://picsum.photos/seed/channelShort1/48/48', subscribers: '1.1M subscribers',
    joinDate: 'Joined May 5, 2021', totalViews: '250,000,000 views', channelDescription: 'Epic trick shots and short, fun challenges! New shorts daily. #shorts #trickshots #challenges',
    playlists: [], communityPosts: []
  },
  'Funny Pets TV': {
    id: 'channelFunnyPets', name: 'Funny Pets TV', avatarUrl: 'https://picsum.photos/seed/channelFunnyPets/48/48', subscribers: '3.5M subscribers',
    joinDate: 'Joined Aug 18, 2019', totalViews: '700,500,000 views', channelDescription: 'The funniest pet moments and cute animal shorts! Daily uploads. Guaranteed to make you smile. #pets #funnyanimals #shorts #cute',
    playlists: [], communityPosts: []
  },
  'Urban Ninjas': {
    id: 'channelParkour', name: 'Urban Ninjas', avatarUrl: 'https://picsum.photos/seed/channelParkour/48/48', subscribers: '780K subscribers',
    joinDate: 'Joined Oct 10, 2020', totalViews: '180,000,000 views', channelDescription: 'Pushing the limits of urban exploration and parkour. High-octane shorts and longer form adventures. #parkour #freerunning #urbanexploration #shorts',
    playlists: [], communityPosts: []
  }
};

const initialMockComments: Comment[] = [
  { 
    id: 'c1', 
    userAvatarUrl: 'https://picsum.photos/seed/user1/32/32', 
    userName: 'Alice W.', 
    commentText: 'Great video! Really enjoyed the scenery.', 
    timestamp: '2 hours ago', 
    likes: 15, 
    isLikedByCurrentUser: false,
    isDislikedByCurrentUser: false,
    isEdited: false,
    replyCount: 1,
    replies: [
      {
        id: 'c1-r1',
        parentId: 'c1',
        userAvatarUrl: 'https://picsum.photos/seed/userChannel1/32/32',
        userName: 'Nature Explorers', // Channel owner reply
        commentText: 'Thanks Alice! Glad you liked it.',
        timestamp: '1 hour ago',
        likes: 3,
        isLikedByCurrentUser: false,
        isDislikedByCurrentUser: false,
        isEdited: false,
        replyTo: 'Alice W.'
      }
    ]
  },
  { 
    id: 'c2', 
    userAvatarUrl: 'https://picsum.photos/seed/user2/32/32', 
    userName: 'BobTheBuilder', 
    commentText: 'Awesome content, learned a lot!', 
    timestamp: '5 hours ago', 
    likes: 8, 
    isLikedByCurrentUser: true,
    isDislikedByCurrentUser: false,
    isEdited: false,
    replyCount: 0,
    replies: []
  },
  { 
    id: 'c3', 
    userAvatarUrl: 'https://picsum.photos/seed/user3/32/32', 
    userName: 'Charlie', 
    commentText: 'This is so helpful, thanks for sharing!', 
    timestamp: '1 day ago', 
    likes: 22, 
    isLikedByCurrentUser: false,
    isDislikedByCurrentUser: false,
    isEdited: true, // Example of an edited comment
    replyCount: 2,
    replies: [
      {
        id: 'c3-r1',
        parentId: 'c3',
        userAvatarUrl: 'https://picsum.photos/seed/user1/32/32',
        userName: 'Alice W.',
        commentText: 'I agree, very informative!',
        timestamp: '20 hours ago',
        likes: 2,
        isLikedByCurrentUser: false,
        isDislikedByCurrentUser: false,
        isEdited: false,
        replyTo: 'Charlie'
      },
      {
        id: 'c3-r2',
        parentId: 'c3',
        userAvatarUrl: 'https://picsum.photos/seed/userBob/32/32',
        userName: 'BobTheBuilder',
        commentText: 'Seconded!',
        timestamp: '19 hours ago',
        likes: 1,
        isLikedByCurrentUser: true,
        isDislikedByCurrentUser: false,
        isEdited: false,
        replyTo: 'Charlie'
      }
    ]
  },
  { 
    id: 'c4', 
    userAvatarUrl: 'https://picsum.photos/seed/user4/32/32', 
    userName: 'Diana P.', 
    commentText: 'Can you do a video on X topic next? This was an amazing explanation of Quantum Computing.', 
    timestamp: '3 days ago', 
    likes: 5, 
    isLikedByCurrentUser: false,
    isDislikedByCurrentUser: true, // Example of disliked comment
    isEdited: false,
    replyCount: 0,
    replies: []
  },
  { 
    id: 'c5', 
    userAvatarUrl: 'https://picsum.photos/seed/user5/32/32', 
    userName: 'Eddy', 
    commentText: 'The music in this Alps video is perfect.', 
    timestamp: '4 hours ago', 
    likes: 12, 
    isLikedByCurrentUser: false,
    isDislikedByCurrentUser: false,
    isEdited: false,
    replyCount: 0,
    replies: []
  },
  { 
    id: 'c6', 
    userAvatarUrl: 'https://picsum.photos/seed/user6/32/32', 
    userName: 'Fiona G.', 
    commentText: 'My gaming setup needs an upgrade after seeing this!', 
    timestamp: '1 hour ago', 
    likes: 3, 
    isLikedByCurrentUser: false,
    isDislikedByCurrentUser: false,
    isEdited: false,
    replyCount: 0,
    replies: []
  },
];

const MOCK_SUBSCRIBED_CHANNELS = ['Nature Explorers', 'TechLevelUp', 'Chef Studio', 'Science Explained', 'Wanderlust Life'];

// Helper to return copies of mock data to prevent direct mutation
const deepCopy = <T>(data: T): T => JSON.parse(JSON.stringify(data));

export const getVideos = async (): Promise<Video[]> => {
  await new Promise(resolve => setTimeout(resolve, 200)); 
  return deepCopy(mockVideos);
};

export const getVideoById = async (id: string): Promise<Video | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  const video = mockVideos.find(v => v.id === id);
  return video ? deepCopy(video) : undefined;
};

export const getChannelByName = async (name: string): Promise<Channel | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const decodedName = decodeURIComponent(name);
  const channel = mockChannelsData[decodedName];
  return channel ? deepCopy(channel) : undefined;
};

export const getVideosByChannelName = async (channelName: string): Promise<Video[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const decodedName = decodeURIComponent(channelName);
  return deepCopy(mockVideos.filter(video => video.channelName === decodedName));
};

export const getCommentsByVideoId = async (videoId: string): Promise<Comment[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const numericVideoId = parseInt(videoId.replace(/\D/g,''), 10) || 1;
    const start = (numericVideoId % 2) * 3; // Cycle through 0 or 3 for variety
    const commentsToReturn = initialMockComments.slice(start, start + 3 + (numericVideoId % 2));

    // Ensure deep copy and unique IDs for this video context
    return deepCopy(commentsToReturn.map(comment => ({
      ...comment,
      id: `${comment.id}-v${videoId}`, // Original ID + video context
      isLikedByCurrentUser: Math.random() > 0.85, // Randomize initial like state
      isDislikedByCurrentUser: Math.random() > 0.95, // Randomize initial dislike state
      isEdited: comment.isEdited, // Keep original edited state for some examples
      replies: comment.replies ? deepCopy(comment.replies.map(reply => ({
        ...reply,
        id: `${reply.id}-v${videoId}`, // Ensure reply IDs are also unique per video context
        parentId: `${comment.id}-v${videoId}`, // Update parentId to match video context
        isLikedByCurrentUser: Math.random() > 0.9,
        isDislikedByCurrentUser: false,
        isEdited: false,
      }))) : [],
      replyCount: comment.replies?.length || 0,
    })));
};


export const searchVideos = async (query: string): Promise<Video[]> => {
  await new Promise(resolve => setTimeout(resolve, 250));
  if (!query) return []; 
  const lowerQuery = query.toLowerCase();
  return deepCopy(mockVideos.filter(v =>
    v.title.toLowerCase().includes(lowerQuery) ||
    v.channelName.toLowerCase().includes(lowerQuery) ||
    v.description.toLowerCase().includes(lowerQuery) ||
    v.category.toLowerCase().includes(lowerQuery)
  ));
};

export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  if (!query.trim()) return [];
  const lowerQuery = query.toLowerCase();
  const suggestions = new Set<string>();

  mockVideos.forEach(video => {
    if (video.title.toLowerCase().includes(lowerQuery)) suggestions.add(video.title);
    if (video.channelName.toLowerCase().includes(lowerQuery)) suggestions.add(video.channelName);
  });
  
  const uniqueCategories = [...new Set(mockVideos.map(v => v.category))];
  uniqueCategories.forEach(category => {
    if (category.toLowerCase().includes(lowerQuery)) {
      suggestions.add(category);
    }
  });
  
  return Array.from(suggestions).slice(0, 8); // Limit suggestions
};

export const getShortsVideos = async (): Promise<Video[]> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  return deepCopy(mockVideos.filter(v => v.isShort));
};

export const getChannelPlaylists = async (channelName: string): Promise<PlaylistSummary[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const decodedChannelName = decodeURIComponent(channelName);
  return deepCopy(mockPlaylistsData[decodedChannelName] || []);
};

export const getChannelCommunityPosts = async (channelName: string): Promise<CommunityPost[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const decodedChannelName = decodeURIComponent(channelName);
  return deepCopy(mockCommunityPostsData[decodedChannelName] || []);
};

// --- START OF MOCK LIVE STREAM DATA ---
export const getChannelLiveStreams = async (channelName: string): Promise<Video[]> => {
  await new Promise(resolve => setTimeout(resolve, 120));
  const decodedChannelName = decodeURIComponent(channelName);

  const baseStreams: Video[] = [
    {
      id: 'live1', title: `🔴 LIVE NOW: Q&A with ${decodedChannelName}`, thumbnailUrl: 'https://picsum.photos/seed/livechannel1/680/380', 
      channelName: decodedChannelName, channelAvatarUrl: mockChannelsData[decodedChannelName]?.avatarUrl || 'https://picsum.photos/seed/defaultLive/48/48', 
      views: '', uploadedAt: 'Live', duration: 'LIVE', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 
      description: `Join ${decodedChannelName} for a live Q&A session! Ask anything.`, category: 'Live', isShort: false,
      isLiveNow: true, viewerCount: `${Math.floor(Math.random() * 5 + 1)}.${Math.floor(Math.random() * 9)}K watching`
    },
    {
      id: 'upcoming1', title: `Upcoming: Grand Canyon Adventure Premiere`, thumbnailUrl: 'https://picsum.photos/seed/upcomingchannel1/680/380', 
      channelName: decodedChannelName, channelAvatarUrl: mockChannelsData[decodedChannelName]?.avatarUrl || 'https://picsum.photos/seed/defaultUpcoming/48/48', 
      views: '', uploadedAt: 'Upcoming', duration: 'UPCOMING', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 
      description: `Premiere of our latest adventure in the Grand Canyon. Don't miss it!`, category: 'Travel', isShort: false,
      isLiveNow: false, scheduledStartTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days from now
    },
     {
      id: 'upcoming2', title: `Scheduled: Deep Dive into New Game Release`, thumbnailUrl: 'https://picsum.photos/seed/upcominggame/680/380', 
      channelName: decodedChannelName, channelAvatarUrl: mockChannelsData[decodedChannelName]?.avatarUrl || 'https://picsum.photos/seed/defaultUpcomingGame/48/48', 
      views: '', uploadedAt: 'Upcoming', duration: 'UPCOMING', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 
      description: `Join us as we explore the new features of 'Galaxy Warriors Online'.`, category: 'Gaming', isShort: false,
      isLiveNow: false, scheduledStartTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days from now
    }
  ];
  // Only return streams if the channel is one of the main ones for this mock
  if (['Nature Explorers', 'TechLevelUp', 'Chef Studio'].includes(decodedChannelName)) {
    if (decodedChannelName === 'Nature Explorers') return deepCopy([baseStreams[0], baseStreams[1]]);
    if (decodedChannelName === 'TechLevelUp') return deepCopy([baseStreams[0], baseStreams[2]]);
    return deepCopy(baseStreams); // Chef Studio gets all three for variety
  }
  return [];
};
// --- END OF MOCK LIVE STREAM DATA ---

// Subscriptions related
export const getSubscribedChannelNames = async (): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 80));
  return MOCK_SUBSCRIBED_CHANNELS;
};


const RECENT_SEARCHES_KEY = 'youtubeCloneRecentSearches_v2'; 
const MAX_RECENT_SEARCHES = 7;
const WATCH_HISTORY_KEY = 'youtubeCloneWatchHistory_v1';
const MAX_WATCH_HISTORY = 50;
const LIKED_VIDEOS_KEY = 'youtubeCloneLikedVideos_v1';
const WATCH_LATER_KEY = 'youtubeCloneWatchLater_v1';
const USER_PLAYLISTS_KEY = 'youtubeCloneUserPlaylists_v1';

const mockUserPlaylistsData: UserPlaylist[] = [
  {
    id: 'userpl1',
    title: 'My Favorite Tech Reviews',
    description: 'A collection of the best tech review videos I\'ve found.',
    videoIds: ['2', '10', '8'], 
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), 
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
  },
  {
    id: 'userpl2',
    title: 'Travel Inspiration',
    description: 'Videos that make me want to pack my bags!',
    videoIds: ['1', '7', '9'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), 
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), 
  },
  {
    id: 'userpl3',
    title: 'Cooking & Recipes',
    videoIds: ['3', '11'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), 
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const initializeUserPlaylists = (): void => {
  try {
    const storedPlaylists = localStorage.getItem(USER_PLAYLISTS_KEY);
    if (!storedPlaylists) {
      localStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(mockUserPlaylistsData));
    } else {
        const playlists = JSON.parse(storedPlaylists);
        if (!Array.isArray(playlists) || playlists.some(p => !Array.isArray(p.videoIds))) {
             // If data is malformed (e.g., videoIds is not an array), reset to mock data
             console.warn("User playlists data in localStorage is malformed. Resetting to default mock data.");
             localStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(mockUserPlaylistsData));
        }
    }
  } catch (e) {
    console.error("Error initializing user playlists:", e);
    // If parsing fails, reset to default mock data
    localStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(mockUserPlaylistsData));
  }
};
initializeUserPlaylists(); 


export const getRecentSearches = async (): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  try {
    const searches = localStorage.getItem(RECENT_SEARCHES_KEY);
    return searches ? JSON.parse(searches) : [];
  } catch (e) {
    console.error("Error fetching recent searches:", e);
    return []; 
  }
};

export const saveRecentSearch = (query: string): void => {
  if (!query.trim()) return;
  try {
    let searches: string[] = [];
    const storedSearches = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (storedSearches) {
      try {
        searches = JSON.parse(storedSearches);
        if(!Array.isArray(searches)) searches = []; 
      } catch {
        searches = []; 
      }
    }
    searches = searches.filter((s: string) => s.toLowerCase() !== query.toLowerCase());
    searches.unshift(query);
    if (searches.length > MAX_RECENT_SEARCHES) {
      searches = searches.slice(0, MAX_RECENT_SEARCHES);
    }
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch (e) {
    console.error("Error saving recent search:", e);
  }
};

export const removeRecentSearch = async (queryToRemove: string): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 30));
  try {
    let searches: string[] = await getRecentSearches();
    searches = searches.filter((s: string) => s.toLowerCase() !== queryToRemove.toLowerCase());
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
    return searches;
  } catch (e) {
    console.error("Error removing recent search:", e);
    return await getRecentSearches(); 
  }
};

export const clearAllRecentSearches = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 30));
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (e) {
    console.error("Error clearing all recent searches:", e);
  }
};


// Watch History
export const addToWatchHistory = (videoId: string): void => {
  if (!videoId) return;
  try {
    let history: string[] = [];
    const storedHistory = localStorage.getItem(WATCH_HISTORY_KEY);
    if (storedHistory) {
      try {
        history = JSON.parse(storedHistory);
        if (!Array.isArray(history)) history = [];
      } catch {
        history = [];
      }
    }
    history = history.filter(id => id !== videoId);
    history.unshift(videoId);
    if (history.length > MAX_WATCH_HISTORY) {
      history = history.slice(0, MAX_WATCH_HISTORY);
    }
    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Error adding to watch history:", e);
  }
};

export const getWatchHistoryVideos = async (): Promise<Video[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  try {
    const storedHistory = localStorage.getItem(WATCH_HISTORY_KEY);
    const videoIds: string[] = storedHistory ? JSON.parse(storedHistory) : [];
    if (!Array.isArray(videoIds)) return [];

    const historyVideosPromises = videoIds.map(id => getVideoById(id));
    const historyVideos = (await Promise.all(historyVideosPromises)).filter(Boolean) as Video[];
    return historyVideos;
  } catch (e) {
    console.error("Error fetching watch history videos:", e);
    return [];
  }
};

// Liked Videos
export const toggleLikeVideo = async (videoId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  if (!videoId) return false;
  try {
    let likedIds: string[] = [];
    const storedLiked = localStorage.getItem(LIKED_VIDEOS_KEY);
    if (storedLiked) {
      try {
        likedIds = JSON.parse(storedLiked);
        if (!Array.isArray(likedIds)) likedIds = [];
      } catch {
        likedIds = [];
      }
    }
    const isCurrentlyLiked = likedIds.includes(videoId);
    if (isCurrentlyLiked) {
      likedIds = likedIds.filter(id => id !== videoId);
    } else {
      likedIds.unshift(videoId); 
    }
    localStorage.setItem(LIKED_VIDEOS_KEY, JSON.stringify(likedIds));
    return !isCurrentlyLiked;
  } catch (e) {
    console.error("Error toggling like video:", e);
    return false;
  }
};

export const isVideoLiked = async (videoId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 30));
  if (!videoId) return false;
  try {
    const storedLiked = localStorage.getItem(LIKED_VIDEOS_KEY);
    const likedIds: string[] = storedLiked ? JSON.parse(storedLiked) : [];
    if (!Array.isArray(likedIds)) return false;
    return likedIds.includes(videoId);
  } catch (e) {
    console.error("Error checking if video is liked:", e);
    return false;
  }
};

export const getLikedVideos = async (): Promise<Video[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  try {
    const storedLiked = localStorage.getItem(LIKED_VIDEOS_KEY);
    const videoIds: string[] = storedLiked ? JSON.parse(storedLiked) : [];
    if (!Array.isArray(videoIds)) return [];

    const likedVideosPromises = videoIds.map(id => getVideoById(id));
    const likedVideos = (await Promise.all(likedVideosPromises)).filter(Boolean) as Video[];
    return likedVideos;
  } catch (e) {
    console.error("Error fetching liked videos:", e);
    return [];
  }
};

// Watch Later
export const toggleWatchLater = async (videoId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  if (!videoId) return false;
  try {
    let watchLaterIds: string[] = [];
    const storedWatchLater = localStorage.getItem(WATCH_LATER_KEY);
    if (storedWatchLater) {
      try {
        watchLaterIds = JSON.parse(storedWatchLater);
        if (!Array.isArray(watchLaterIds)) watchLaterIds = [];
      } catch {
        watchLaterIds = [];
      }
    }
    const isCurrentlyInWatchLater = watchLaterIds.includes(videoId);
    if (isCurrentlyInWatchLater) {
      watchLaterIds = watchLaterIds.filter(id => id !== videoId);
    } else {
      watchLaterIds.unshift(videoId); 
    }
    localStorage.setItem(WATCH_LATER_KEY, JSON.stringify(watchLaterIds));
    return !isCurrentlyInWatchLater; 
  } catch (e) {
    console.error("Error toggling Watch Later video:", e);
    return false; 
  }
};

export const isVideoInWatchLater = async (videoId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 30));
  if (!videoId) return false;
  try {
    const storedWatchLater = localStorage.getItem(WATCH_LATER_KEY);
    const watchLaterIds: string[] = storedWatchLater ? JSON.parse(storedWatchLater) : [];
    if (!Array.isArray(watchLaterIds)) return false;
    return watchLaterIds.includes(videoId);
  } catch (e) {
    console.error("Error checking if video is in Watch Later:", e);
    return false;
  }
};

export const getWatchLaterVideos = async (): Promise<Video[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  try {
    const storedWatchLater = localStorage.getItem(WATCH_LATER_KEY);
    const videoIds: string[] = storedWatchLater ? JSON.parse(storedWatchLater) : [];
    if (!Array.isArray(videoIds)) return [];

    const watchLaterVideosPromises = videoIds.map(id => getVideoById(id));
    const watchLaterVideos = (await Promise.all(watchLaterVideosPromises)).filter(Boolean) as Video[];
    return watchLaterVideos;
  } catch (e) {
    console.error("Error fetching Watch Later videos:", e);
    return [];
  }
};

// User Playlists
const getAllUserPlaylistsRaw = (): UserPlaylist[] => {
  initializeUserPlaylists(); // Ensure data is initialized and potentially sanitized
  try {
    const storedPlaylists = localStorage.getItem(USER_PLAYLISTS_KEY);
    const playlists: UserPlaylist[] = storedPlaylists ? JSON.parse(storedPlaylists) : [];
    if (!Array.isArray(playlists)) return []; // Should be caught by initialize, but good check
    return playlists;
  } catch (e) {
    console.error("Error fetching raw user playlists:", e);
    return [];
  }
};

export const getUserPlaylists = async (): Promise<UserPlaylistDetails[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const playlists = getAllUserPlaylistsRaw();

  const playlistDetailsPromises = playlists.map(async (playlist) => {
    let thumbnailUrl: string | undefined = 'https://picsum.photos/seed/playlistplaceholder/320/180'; 
    if (playlist.videoIds.length > 0) {
      const firstVideo = await getVideoById(playlist.videoIds[0]);
      if (firstVideo) {
        thumbnailUrl = firstVideo.thumbnailUrl;
      }
    }
    return {
      ...playlist,
      videoCount: playlist.videoIds.length,
      thumbnailUrl: thumbnailUrl,
    };
  });

  return await Promise.all(playlistDetailsPromises);
};

export const getUserPlaylistById = async (playlistId: string): Promise<(UserPlaylist & { videos: Video[] }) | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  const playlists = getAllUserPlaylistsRaw();
  const playlist = playlists.find(p => p.id === playlistId);
  
  if (!playlist) return undefined;

  const videoPromises = playlist.videoIds.map(id => getVideoById(id));
  const videos = (await Promise.all(videoPromises)).filter(Boolean) as Video[];
  
  return { ...deepCopy(playlist), videos }; // Return a deep copy of playlist too
};

export const createUserPlaylist = async (title: string, description?: string): Promise<UserPlaylistDetails> => {
    await new Promise(resolve => setTimeout(resolve, 80));
    const playlists = getAllUserPlaylistsRaw();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
        console.warn("Attempted to create playlist with empty title. Using default title.");
    }
    const newPlaylist: UserPlaylist = {
        id: `userpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: trimmedTitle || "Untitled Playlist",
        description: description?.trim() || undefined,
        videoIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    playlists.push(newPlaylist);
    localStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(playlists));
    return {
        ...newPlaylist,
        videoCount: 0,
        thumbnailUrl: 'https://picsum.photos/seed/playlistplaceholder/320/180'
    };
};

export const addVideoToPlaylist = async (playlistId: string, videoId: string): Promise<UserPlaylist | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 70));
  const playlists = getAllUserPlaylistsRaw();
  const playlistIndex = playlists.findIndex(p => p.id === playlistId);

  if (playlistIndex === -1) {
    console.warn(`Playlist with ID ${playlistId} not found for adding video.`);
    return undefined;
  }

  const playlist = playlists[playlistIndex];
  if (!playlist.videoIds.includes(videoId)) {
    playlist.videoIds.push(videoId); // Add to end by default
    playlist.updatedAt = new Date().toISOString();
    localStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(playlists));
  }
  return deepCopy(playlist);
};

export const removeVideoFromPlaylist = async (playlistId: string, videoId: string): Promise<UserPlaylist | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 70));
  const playlists = getAllUserPlaylistsRaw();
  const playlistIndex = playlists.findIndex(p => p.id === playlistId);

  if (playlistIndex === -1) {
     console.warn(`Playlist with ID ${playlistId} not found for removing video.`);
    return undefined;
  }
  
  const playlist = playlists[playlistIndex];
  const videoIndexInPlaylist = playlist.videoIds.indexOf(videoId);

  if (videoIndexInPlaylist > -1) {
    playlist.videoIds.splice(videoIndexInPlaylist, 1);
    playlist.updatedAt = new Date().toISOString();
    localStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(playlists));
  }
  return deepCopy(playlist);
};

export const getAllPlaylistMemberships = async (videoId: string): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 60));
  const playlists = getAllUserPlaylistsRaw();
  return playlists
    .filter(playlist => playlist.videoIds.includes(videoId))
    .map(playlist => playlist.id);
};

export const updateUserPlaylistDetails = async (playlistId: string, newTitle: string, newDescription?: string): Promise<UserPlaylist | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 70));
  const playlists = getAllUserPlaylistsRaw();
  const playlistIndex = playlists.findIndex(p => p.id === playlistId);

  if (playlistIndex === -1) {
    console.warn(`Playlist with ID ${playlistId} not found for updating details.`);
    return undefined;
  }

  const playlist = playlists[playlistIndex];
  playlist.title = newTitle.trim() || playlist.title; // Don't allow empty title during update
  playlist.description = newDescription?.trim() || undefined;
  playlist.updatedAt = new Date().toISOString();
  
  localStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(playlists));
  return deepCopy(playlist);
};

// Mock service for reordering videos in a playlist
export const reorderVideoInPlaylist = async (
  playlistId: string,
  videoId: string,
  direction: 'top' | 'up' | 'down' | 'bottom'
): Promise<UserPlaylist | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 70));
  const playlists = getAllUserPlaylistsRaw();
  const playlistIndex = playlists.findIndex(p => p.id === playlistId);

  if (playlistIndex === -1) {
    console.warn(`Playlist with ID ${playlistId} not found for reordering.`);
    return undefined;
  }

  const playlist = playlists[playlistIndex];
  const videoIdx = playlist.videoIds.indexOf(videoId);

  if (videoIdx === -1) {
    console.warn(`Video ID ${videoId} not found in playlist ${playlistId}.`);
    return undefined; // Video not in playlist
  }

  const newVideoIds = [...playlist.videoIds];
  const [videoToMove] = newVideoIds.splice(videoIdx, 1);

  switch (direction) {
    case 'top':
      newVideoIds.unshift(videoToMove);
      break;
    case 'up':
      newVideoIds.splice(Math.max(0, videoIdx - 1), 0, videoToMove);
      break;
    case 'down':
      newVideoIds.splice(Math.min(newVideoIds.length, videoIdx + 1), 0, videoToMove);
      break;
    case 'bottom':
      newVideoIds.push(videoToMove);
      break;
    default:
      // Should not happen, but put it back if direction is invalid
      newVideoIds.splice(videoIdx, 0, videoToMove); 
      break;
  }

  playlist.videoIds = newVideoIds;
  playlist.updatedAt = new Date().toISOString();
  localStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(playlists));
  return deepCopy(playlist);
};

// Mock service for deleting a playlist
export const deleteUserPlaylist = async (playlistId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 70));
  let playlists = getAllUserPlaylistsRaw();
  playlists = playlists.filter(p => p.id !== playlistId);
  localStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(playlists));
};

// Mock service for uploading a video
export const uploadVideo = async (
  uploadData: VideoUploadData,
  onProgress: (progress: UploadProgress) => void
): Promise<Video> => {
  return new Promise((resolve, reject) => {
    let progress = 0;
    
    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      progress += Math.random() * 15 + 5; // Random increment between 5-20%
      
      if (progress < 70) {
        onProgress({
          percentage: Math.min(progress, 70),
          status: 'uploading',
          message: 'Uploading video...'
        });
      } else if (progress < 90) {
        onProgress({
          percentage: Math.min(progress, 90),
          status: 'processing',
          message: 'Processing video...'
        });
      } else {
        clearInterval(uploadInterval);
        
        // Create new video object
        const newVideo: Video = {
          id: `uploaded_${Date.now()}`,
          title: uploadData.title,
          thumbnailUrl: uploadData.thumbnailFile 
            ? URL.createObjectURL(uploadData.thumbnailFile)
            : 'https://picsum.photos/seed/uploaded/680/380',
          channelName: 'Your Channel',
          channelAvatarUrl: 'https://picsum.photos/seed/yourchannel/48/48',
          views: '0 views',
          uploadedAt: 'just now',
          duration: uploadData.isShorts ? '0:30' : '10:45',
          videoUrl: uploadData.videoFile ? URL.createObjectURL(uploadData.videoFile) : '',
          description: uploadData.description,
          category: uploadData.category,
          isShort: uploadData.isShorts
        };
        
        // Add to mock videos array (in a real app, this would be sent to server)
        mockVideos.unshift(newVideo);
        
        onProgress({
          percentage: 100,
          status: 'completed',
          message: 'Upload completed successfully!'
        });
        
        resolve(newVideo);
      }
    }, 500); // Update every 500ms
    
    // Simulate potential error (5% chance)
    setTimeout(() => {
      if (Math.random() < 0.05) {
        clearInterval(uploadInterval);
        onProgress({
          percentage: 0,
          status: 'error',
          message: 'Upload failed. Please try again.'
        });
        reject(new Error('Upload failed'));
      }
    }, 2000);
  });
};

// Make sure all functions using MOCK_SUBSCRIBED_CHANNELS are defined after it.
// This is generally good practice for constants used by functions in the same module.
// (The original code was fine, just a general note for more complex scenarios)
