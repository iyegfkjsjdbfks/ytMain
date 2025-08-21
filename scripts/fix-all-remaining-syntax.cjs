const fs = require('fs');
const path = require('path');

function fixFile(filePath, fixes) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changesMade = false;
  
  fixes.forEach(fix => {
    if (typeof fix.search === 'string') {
      if (content.includes(fix.search)) {
        content = content.replace(fix.search, fix.replace);
        changesMade = true;
      }
    } else if (fix.search instanceof RegExp) {
      const newContent = content.replace(fix.search, fix.replace);
      if (newContent !== content) {
        content = newContent;
        changesMade = true;
      }
    }
  });
  
  if (changesMade) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Fixed ${path.basename(filePath)}`);
    return true;
  }
  
  return false;
}

const fixes = {
  // Fix HoverAutoplayVideoCard.tsx - remove malformed comments and fix JSX
  'components/HoverAutoplayVideoCard.tsx': [
    // Fix className attribute
    {
      search: ` <div
// FIXED:  className={\`group cursor-pointer \${className}\`}
 onMouseEnter={handleMouseEnter}
 onMouseLeave={handleMouseLeave} />
 >`,
      replace: ` <div
  className={\`group cursor-pointer \${className}\`}
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
 >`
    },
    // Fix ImageWithFallback src
    {
      search: `// FIXED:  src={((video.thumbnailUrl || video.thumbnail) || video.thumbnail)}
// FIXED:  alt={video.title}
// FIXED:  className={\`absolute inset-0 w-full h-full object-cover rounded-xl transition-all duration-300 \${
 showIframe ? 'opacity-0' : 'opacity-100 group-hover:rounded-lg'
 }\`}`,
      replace: ` src={video.thumbnailUrl || video.thumbnail}
  alt={video.title}
  className={\`absolute inset-0 w-full h-full object-cover rounded-xl transition-all duration-300 \${
   showIframe ? 'opacity-0' : 'opacity-100 group-hover:rounded-lg'
  }\`}`
    },
    // Fix fallbackSrc closing
    {
      search: ` fallbackSrc={\`https://picsum.photos/320/250?random=\${video.id}\`} />
 />`,
      replace: ` fallbackSrc={\`https://picsum.photos/320/250?random=\${video.id}\`}
 />`
    },
    // Fix iframe src
    {
      search: `// FIXED:  src={\`https://www.youtube-nocookie.com/embed/\${videoId}?autoplay=1&mute=\${isMuted ? 1 : 0}&controls=0&rel=0&modestbranding=1&playsinline=1&fs=0&disablekb=1&iv_load_policy=3&start=0&end=30&loop=1&playlist=\${videoId}&origin=\${encodeURIComponent(window.location.origin)}&enablejsapi=0\`}`,
      replace: ` src={\`https://www.youtube-nocookie.com/embed/\${videoId}?autoplay=1&mute=\${isMuted ? 1 : 0}&controls=0&rel=0&modestbranding=1&playsinline=1&fs=0&disablekb=1&iv_load_policy=3&start=0&end=30&loop=1&playlist=\${videoId}&origin=\${encodeURIComponent(window.location.origin)}&enablejsapi=0\`}`
    },
    // Fix iframe className
    {
      search: `// FIXED:  className="w-full h-full border-0"`,
      replace: ` className="w-full h-full border-0"`
    },
    // Fix iframe style
    {
      search: `// FIXED:  style={{
 pointerEvents: 'none',
 border: 'none',
 outline: 'none' }
 onError={handleIframeError} />
 />`,
      replace: ` style={{
  pointerEvents: 'none',
  border: 'none',
  outline: 'none'
 }}
 onError={handleIframeError}
 />`
    },
    // Fix button
    {
      search: ` <button />
// FIXED:  onClick={(e: any) => toggleMute(e)}
// FIXED:  className="absolute bottom-2 left-2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-2 rounded-full transition-all duration-200 z-10"
// FIXED:  style={{ pointerEvents: 'auto' }
 title={isMuted ? 'Unmute video' : 'Mute video'}
 >`,
      replace: ` <button
  onClick={toggleMute}
  className="absolute bottom-2 left-2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-2 rounded-full transition-all duration-200 z-10"
  style={{ pointerEvents: 'auto' }}
  title={isMuted ? 'Unmute video' : 'Mute video'}
 >`
    },
    // Fix closing tags
    {
      search: /\/\/ FIXED:\s+<\/(svg|button|div|Link|h3|p|span)>/g,
      replace: '</$1>'
    },
    // Fix duration badge
    {
      search: ` showIframe ? 'opacity-0' : 'opacity-100' />
 }\`}>`,
      replace: ` showIframe ? 'opacity-0' : 'opacity-100'
 }\`}>`
    },
    // Fix hover indicator
    {
      search: ` hasError ? 'bg-gray-600' : 'bg-red-600' />
 }\`}>`,
      replace: ` hasError ? 'bg-gray-600' : 'bg-red-600'
 }\`}>`
    },
    // Fix channel avatar src
    {
      search: `// FIXED:  src={((video.channelAvatarUrl || video.thumbnail) || video.thumbnail)}
// FIXED:  alt={((video.channelName || video.channelTitle) || video.channelTitle)}
// FIXED:  className="w-9 h-9 rounded-full object-cover"`,
      replace: ` src={video.channelAvatarUrl || video.thumbnail}
  alt={video.channelName || video.channelTitle || 'Channel'}
  className="w-9 h-9 rounded-full object-cover"`
    },
    // Fix fallbackSrc for channel avatar
    {
      search: ` fallbackSrc={\`https://picsum.photos/36/36?random=\${video.channelId || ((video.channelName || video.channelTitle) || video.channelTitle)}\`} />
 />`,
      replace: ` fallbackSrc={\`https://picsum.photos/36/36?random=\${video.channelId || video.channelName || 'channel'}\`}
 />`
    },
    // Fix channel name display
    {
      search: ` {((video.channelName || video.channelTitle) || video.channelTitle)}`,
      replace: ` {video.channelName || video.channelTitle || 'Unknown Channel'}`
    },
    // Fix conditional channel avatar
    {
      search: ` {((video.channelAvatarUrl || video.thumbnail) || video.thumbnail) && (`,
      replace: ` {(video.channelAvatarUrl || video.thumbnail) && (`
    }
  ],

  // Fix MinimizedSidebar.tsx
  'components/MinimizedSidebar.tsx': [
    // Fix MinimizedNavItem components
    {
      search: /to="([^"]+)"\s+\/>\s+icon=/g,
      replace: 'to="$1"\n icon='
    },
    {
      search: /icon={([^}]+)}\s+\/>\s+label=/g,
      replace: 'icon={$1}\n label='
    },
    {
      search: /label="([^"]+)"\s+\/>\s+currentPath=/g,
      replace: 'label="$1"\n currentPath='
    },
    {
      search: /currentPath={([^}]+)}\s+\/>\s+title=/g,
      replace: 'currentPath={$1}\n title='
    },
    {
      search: /title="([^"]+)"\s+\/>/g,
      replace: 'title="$1"\n />'
    }
  ],

  // Fix settingsService.ts
  'services/settingsService.ts': [
    {
      search: `  defaultCategory: 'youtube' } };`,
      replace: `  defaultCategory: 'youtube'
  }
};`
    }
  ],

  // Fix realVideoService.ts - check for context
  'services/realVideoService.ts': [
    // Need to check what comes before the export
    {
      search: /}\s*\n\s*\/\/ Default export\s*\nexport default {/,
      replace: `}

// Default export
export default {`
    }
  ],

  // Fix remaining hooks files
  'src/hooks/useFormState.ts': [
    {
      search: `  setIsSubmitting(false);
  }
  },
  [values, validate, onSubmit]
  );`,
      replace: `   setIsSubmitting(false);
  }
 },
 [values, validate, onSubmit]
);`
    }
  ],

  'src/hooks/useAsyncState.ts': [
    {
      search: ` asyncFunction: () => Promise<T>
  dependencies = [],`,
      replace: ` asyncFunction: () => Promise<T>,
  dependencies = [],`
    }
  ],

  'src/hooks/useTrendingSearch.ts': [
    {
      search: `  projection: 'rectangular' };`,
      replace: `  projection: 'rectangular'
 };`
    }
  ],

  'src/hooks/useDebounce.ts': [
    {
      search: `   clearTimeout(timeoutRef.current);
  };
  }, []);`,
      replace: `    clearTimeout(timeoutRef.current);
   };
  }, []);`
    }
  ],

  'src/hooks/useOptimizedVideoData.ts': [
    {
      search: `  timestamp: Date.now() });
  }
  } catch (err: any) {`,
      replace: `  timestamp: Date.now()
  });
 } catch (err: any) {`
    }
  ],

  'src/hooks/useVideosData.ts': [
    {
      search: `  return response.data;
  }
  } else {`,
      replace: `  return response.data;
  } else {`
    }
  ],

  'src/hooks/useDropdownMenu.ts': [
    {
      search: `  return undefined;
  }, [isOpen]);`,
      replace: `  return undefined;
 }, [isOpen]);`
    }
  ],

  'src/hooks/useVideoPlayer.ts': [
    {
      search: `  const error = new Error(;
  \`Video error: \${video.error?.message || 'Unknown error'}\`,
  );`,
      replace: `  const error = new Error(
   \`Video error: \${video.error?.message || 'Unknown error'}\`
  );`
    }
  ],

  'src/hooks/useWatchPage.ts': [
    {
      search: `  .slice(0, 20);
  setAllRelatedVideos(related);
  } catch (error: any) {`,
      replace: `  .slice(0, 20);
  setAllRelatedVideos(related);
 } catch (error: any) {`
    }
  ],

  'src/hooks/unifiedHooks.ts': [
    {
      search: `export function useAsyncState<T>(initialData: T | null = null): [
  AsyncState<T>
  {`,
      replace: `export function useAsyncState<T>(initialData: T | null = null): [
  AsyncState<T>,
  {`
    }
  ],

  'src/services/unifiedDataService.ts': [
    {
      search: `  sourcePriority: ['youtube'] };`,
      replace: `  sourcePriority: ['youtube']
  }
};`
    }
  ]
};

console.log('Starting comprehensive syntax error fixes...');

let totalFixed = 0;
Object.entries(fixes).forEach(([file, fileFixes]) => {
  const filePath = path.join(__dirname, '..', file);
  if (fileFixes.length > 0) {
    if (fixFile(filePath, fileFixes)) {
      totalFixed++;
    }
  }
});

console.log(`\nFixed ${totalFixed} files successfully!`);
