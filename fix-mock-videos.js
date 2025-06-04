// Script to fix mock videos by adding required properties
const fs = require('fs');

// Read the current file
const filePath = 'services/mockVideoService.ts';
const content = fs.readFileSync(filePath, 'utf8');

// Extract the existing video data and convert to proper format
const videoPattern = /{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)',[\s\S]*?}/g;
const matches = [...content.matchAll(videoPattern)];

console.log(`Found ${matches.length} videos to fix`);

// Create the replacement content
const fixedVideos = matches.map((match, index) => {
  const fullMatch = match[0];
  const id = match[1];
  const title = match[2];
  
  // Extract other properties
  const channelNameMatch = fullMatch.match(/channelName:\s*'([^']+)'/);
  const channelName = channelNameMatch ? channelNameMatch[1] : 'Unknown Channel';
  
  const categoryMatch = fullMatch.match(/category:\s*'([^']+)'/);
  const category = categoryMatch ? categoryMatch[1] : 'Entertainment';
  
  const isShortMatch = fullMatch.match(/isShort:\s*(true|false)/);
  const isShort = isShortMatch ? isShortMatch[1] === 'true' : false;
  
  return `  createMockVideo({
    id: '${id}',
    title: '${title}',
    channelName: '${channelName}',
    channelId: 'channel-${index + 1}',
    category: '${category}',
    isShort: ${isShort},
    likes: ${Math.floor(Math.random() * 50000) + 1000},
    dislikes: ${Math.floor(Math.random() * 1000) + 10},
    tags: ['${category.toLowerCase()}', 'video']
  })`;
}).join(',\n');

console.log('Generated fixed videos array');
console.log('Please manually replace the mockVideos array in the file');
