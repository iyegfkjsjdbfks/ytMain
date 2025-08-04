#!/usr/bin/env node
/**
 * Targeted TypeScript Error Fixer
 * 
 * Fixes specific TypeScript compilation errors with surgical precision
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class TargetedFixer {
  constructor() {
    this.fixes = [];
  }

  log(message, type = 'info') {
    const prefix = type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} ${message}`);
    if (type === 'success') this.fixes.push(message);
  }

  fixVideoPlayer() {
    this.log('Fixing AdvancedVideoPlayer component...');
    
    const videoPlayerPath = join(projectRoot, 'components', 'AdvancedVideoPlayer.tsx');
    if (existsSync(videoPlayerPath)) {
      let content = readFileSync(videoPlayerPath, 'utf8');
      
      // Fix the malformed conditional property spread
      content = content.replace(
        /\{\.\.\.(src && \{ src \}: any)\}/,
        '{...(src && { src })}'
      );
      
      // Fix the useVideoPlayer destructuring to match interface
      if (content.includes('const { videoRef, state, actions } = useVideoPlayer({')) {
        // Replace with proper destructuring based on available properties
        content = content.replace(
          /const \{ videoRef, state, actions \} = useVideoPlayer\(/,
          'const videoPlayerInstance = useVideoPlayer('
        );
        
        // Add proper property access
        content = content.replace(
          /videoRef\./g,
          'videoPlayerInstance.videoRef.'
        );
        content = content.replace(
          /state\./g,
          'videoPlayerInstance.state.'
        );
        content = content.replace(
          /actions\./g,
          'videoPlayerInstance.actions.'
        );
      }
      
      // Fix callback prop types to handle undefined
      content = content.replace(
        /onTimeUpdate: \(\(currentTime: number\) => void\) \| undefined/g,
        'onTimeUpdate?: (currentTime: number) => void'
      );
      
      writeFileSync(videoPlayerPath, content);
      this.log('Fixed AdvancedVideoPlayer component', 'success');
    }
  }

  fixVideoTypes() {
    this.log('Fixing Video interface extensions...');
    
    const coreTypesPath = join(projectRoot, 'src', 'types', 'core.ts');
    if (existsSync(coreTypesPath)) {
      let content = readFileSync(coreTypesPath, 'utf8');
      
      // Add missing properties to Video interface
      const missingProps = [
        'channelName?: string; // Alternative name field',
        'channelAvatarUrl?: string; // Channel avatar URL',
        'isLive?: boolean; // Live stream indicator'
      ];
      
      for (const prop of missingProps) {
        const propName = prop.split('?')[0];
        if (!content.includes(propName)) {
          content = content.replace(
            /(export interface Video \{[^}]+)(})/s,
            `$1  ${prop}\n$2`
          );
        }
      }
      
      // Add missing properties to Channel interface  
      const channelProps = [
        'totalViews?: number; // Total channel views'
      ];
      
      for (const prop of channelProps) {
        const propName = prop.split('?')[0];
        if (!content.includes(propName)) {
          content = content.replace(
            /(export interface Channel \{[^}]+)(})/s,
            `$1  ${prop}\n$2`
          );
        }
      }
      
      writeFileSync(coreTypesPath, content);
      this.log('Extended Video and Channel interfaces', 'success');
    }
  }

  fixChannelComponents() {
    this.log('Fixing Channel-related components...');
    
    // Fix ChannelHeader.tsx
    const channelHeaderPath = join(projectRoot, 'components', 'ChannelHeader.tsx');
    if (existsSync(channelHeaderPath)) {
      let content = readFileSync(channelHeaderPath, 'utf8');
      
      // Fix possibly undefined channel.name access
      content = content.replace(
        /channel\.name\b/g,
        '(channel.name || channel.title)'
      );
      
      // Fix possibly undefined channel.avatarUrl
      content = content.replace(
        /channel\.avatarUrl/g,
        '(channel.avatarUrl || channel.thumbnail)'
      );
      
      // Fix subscribers property
      content = content.replace(
        /channel\.subscribers/g,
        '(channel.subscribers || channel.subscriberCount)'
      );
      
      writeFileSync(channelHeaderPath, content);
      this.log('Fixed ChannelHeader component', 'success');
    }

    // Fix ChannelTabContent.tsx
    const channelTabPath = join(projectRoot, 'components', 'ChannelTabContent.tsx');
    if (existsSync(channelTabPath)) {
      let content = readFileSync(channelTabPath, 'utf8');
      
      // Fix views.replace on number type
      content = content.replace(
        /parseInt\((\w+)\.views\.replace\(\/,\/g, ''\), 10\)/g,
        'typeof $1.views === "string" ? parseInt($1.views.replace(/,/g, ""), 10) : $1.views'
      );
      
      // Fix totalViews property
      content = content.replace(
        /channel\.totalViews/g,
        '(channel.totalViews || 0)'
      );
      
      // Fix joinedDate
      content = content.replace(
        /channel\.joinedDate/g,
        '(channel.joinedDate || "N/A")'
      );
      
      writeFileSync(channelTabPath, content);
      this.log('Fixed ChannelTabContent component', 'success');
    }
  }

  fixVideoCardComponents() {
    this.log('Fixing VideoCard components...');
    
    const cardPaths = [
      'components/EnhancedYouTubeVideoCard.tsx',
      'components/HoverAutoplayVideoCard.tsx'
    ];

    for (const cardPath of cardPaths) {
      const fullPath = join(projectRoot, cardPath);
      if (existsSync(fullPath)) {
        let content = readFileSync(fullPath, 'utf8');
        
        // Fix channelName property
        content = content.replace(
          /video\.channelName/g,
          '(video.channelName || video.channelTitle)'
        );
        
        // Fix channelAvatarUrl property
        content = content.replace(
          /video\.channelAvatarUrl/g,
          '(video.channelAvatarUrl || video.thumbnail)'
        );
        
        // Fix isLive property
        content = content.replace(
          /video\.isLive/g,
          '(video.isLive || false)'
        );
        
        // Fix thumbnailUrl property
        content = content.replace(
          /video\.thumbnailUrl/g,
          '(video.thumbnailUrl || video.thumbnail)'
        );
        
        // Fix date parsing for possibly undefined values
        content = content.replace(
          /new Date\(([^)]+)\)/g,
          'new Date($1 || Date.now())'
        );
        
        writeFileSync(fullPath, content);
        this.log(`Fixed ${cardPath.split('/').pop()}`, 'success');
      }
    }
  }

  fixUseVideoPlayerHook() {
    this.log('Fixing useVideoPlayer hook...');
    
    const hookPath = join(projectRoot, 'src', 'hooks', 'useVideoPlayer.ts');
    if (existsSync(hookPath)) {
      let content = readFileSync(hookPath, 'utf8');
      
      // Ensure the hook returns the expected structure
      if (!content.includes('videoRef:') || !content.includes('state:') || !content.includes('actions:')) {
        // Replace the return statement to match expected interface
        content = content.replace(
          /return \{([^}]+)\};/s,
          `return {
    videoRef,
    state: {
      isPlaying: isPlaying || false,
      isMuted: isMuted || false,
      volume: volume || 1,
      currentTime: currentTime || 0,
      duration: duration || 0,
      isLoading: isLoading || false,
      error: error || null
    },
    actions: {
      play: play || (() => {}),
      pause: pause || (() => {}),
      toggle: toggle || (() => {}),
      mute: mute || (() => {}),
      unmute: unmute || (() => {}),
      setVolume: setVolume || (() => {}),
      seek: seek || (() => {}),
      reset: reset || (() => {})
    }
  };`
        );
      }
      
      writeFileSync(hookPath, content);
      this.log('Fixed useVideoPlayer hook structure', 'success');
    }
  }

  async run() {
    this.log('🔧 Running targeted TypeScript fixes...');
    
    this.fixVideoTypes();
    this.fixUseVideoPlayerHook();
    this.fixVideoPlayer();
    this.fixChannelComponents();
    this.fixVideoCardComponents();
    
    this.log(`✅ Applied ${this.fixes.length} targeted fixes`, 'success');
    this.fixes.forEach(fix => console.log(`  • ${fix}`));
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new TargetedFixer();
  fixer.run().catch(console.error);
}

export default TargetedFixer;