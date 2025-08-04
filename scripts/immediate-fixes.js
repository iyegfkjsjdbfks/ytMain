#!/usr/bin/env node
/**
 * Immediate Critical Fixes
 * 
 * Fixes the most critical blocking issues that prevent basic compilation
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class ImmediateFixer {
  constructor() {
    this.fixes = [];
  }

  log(message, type = 'info') {
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} ${message}`);
    if (type === 'success') this.fixes.push(message);
  }

  // Fix global types configuration
  fixGlobalTypes() {
    this.log('Setting up global types...');
    
    // Ensure src/types directory exists
    const typesDir = join(projectRoot, 'src', 'types');
    if (!existsSync(typesDir)) {
      mkdirSync(typesDir, { recursive: true });
    }

    // Create global.d.ts for vitest globals
    const globalTypesPath = join(typesDir, 'global.d.ts');
    const globalTypesContent = `/// <reference types="vitest/globals" />
/// <reference types="vite/client" />

declare global {
  namespace Vi {
    interface AssertsShape {
      toBeInTheDocument(): void;
    }
  }
}

export {};`;
    
    writeFileSync(globalTypesPath, globalTypesContent);
    this.log('Created global types file', 'success');

    // Update tsconfig to remove problematic types
    const tsconfigPath = join(projectRoot, 'tsconfig.json');
    if (existsSync(tsconfigPath)) {
      let content = readFileSync(tsconfigPath, 'utf8');
      
      // Remove the problematic types line
      if (content.includes('"types": ["vite/client", "vitest/globals"]')) {
        content = content.replace(/\s*"types": \["vite\/client", "vitest\/globals"\],?\s*\n/g, '');
        writeFileSync(tsconfigPath, content);
        this.log('Removed problematic types from tsconfig', 'success');
      }
    }
  }

  // Fix the most critical import/export issues in key files
  fixCriticalImports() {
    this.log('Fixing critical import issues...');

    // Fix hooks/useVideoPlayer.ts return type
    const videoPlayerHookPath = join(projectRoot, 'src', 'hooks', 'useVideoPlayer.ts');
    if (existsSync(videoPlayerHookPath)) {
      let content = readFileSync(videoPlayerHookPath, 'utf8');
      
      // Fix the return structure to match expected interface
      content = content.replace(
        /return {\s*([^}]+)\s*};/s,
        `return {
    videoRef,
    state: {
      isPlaying,
      isMuted,
      volume,
      currentTime,
      duration,
      isLoading,
      error
    },
    actions: {
      play,
      pause,
      toggle,
      mute,
      unmute,
      setVolume,
      seek,
      reset
    }
  };`
      );
      
      writeFileSync(videoPlayerHookPath, content);
      this.log('Fixed useVideoPlayer return structure', 'success');
    }

    // Fix Video interface to include thumbnailUrl
    const coreTypesPath = join(projectRoot, 'src', 'types', 'core.ts');
    if (existsSync(coreTypesPath)) {
      let content = readFileSync(coreTypesPath, 'utf8');
      
      // Add thumbnailUrl as alias for thumbnail
      if (content.includes('interface Video') && !content.includes('thumbnailUrl')) {
        content = content.replace(
          /thumbnail: string;/,
          `thumbnail: string;
  thumbnailUrl?: string; // Alias for thumbnail`
        );
        writeFileSync(coreTypesPath, content);
        this.log('Added thumbnailUrl to Video interface', 'success');
      }
    }

    // Fix Channel interface to include missing properties
    if (existsSync(coreTypesPath)) {
      let content = readFileSync(coreTypesPath, 'utf8');
      
      if (content.includes('interface Channel')) {
        // Add missing Channel properties
        const channelProps = [
          'name?: string; // Display name',
          'avatarUrl?: string; // Avatar image URL', 
          'subscribers?: number | string; // Subscriber count',
          'joinedDate?: string; // Date joined'
        ];
        
        for (const prop of channelProps) {
          if (!content.includes(prop.split('?')[0])) {
            content = content.replace(
              /interface Channel \{([^}]+)\}/s,
              (match, props) => `interface Channel {${props}\n  ${prop}`
            );
          }
        }
        
        writeFileSync(coreTypesPath, content);
        this.log('Added missing properties to Channel interface', 'success');
      }
    }
  }

  // Fix VideoPlayerOptions interface
  fixVideoPlayerOptions() {
    this.log('Fixing VideoPlayer options...');
    
    const videoPlayerPath = join(projectRoot, 'src', 'hooks', 'useVideoPlayer.ts');
    if (existsSync(videoPlayerPath)) {
      let content = readFileSync(videoPlayerPath, 'utf8');
      
      // Make callback properties optional and handle undefined
      content = content.replace(
        /interface VideoPlayerOptions \{[\s\S]*?\}/,
        `interface VideoPlayerOptions {
  autoplay?: boolean;
  muted?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
}`
      );
      
      writeFileSync(videoPlayerPath, content);
      this.log('Fixed VideoPlayerOptions interface', 'success');
    }
  }

  async run() {
    this.log('🔧 Running immediate critical fixes...');
    
    this.fixGlobalTypes();
    this.fixCriticalImports();
    this.fixVideoPlayerOptions();
    
    this.log(`✅ Applied ${this.fixes.length} immediate fixes`, 'success');
    this.fixes.forEach(fix => console.log(`  • ${fix}`));
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new ImmediateFixer();
  fixer.run().catch(console.error);
}

export default ImmediateFixer;