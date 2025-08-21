const fs = require('fs');
const path = require('path');

// Track fixed files
const fixedFiles = [];

// Helper function to fix file
function fixFile(filePath, fixes) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    fixes.forEach(fix => {
      const before = content;
      content = fix(content);
      if (before !== content) {
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixedFiles.push(path.basename(filePath));
      console.log(`✓ Fixed: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`✗ Error fixing ${path.basename(filePath)}: ${error.message}`);
  }
}

// Fix the remaining issues in all files
const fixes = [
  // Fix OptimizedMiniplayerContext.tsx - remove orphaned code
  {
    file: 'contexts/OptimizedMiniplayerContext.tsx',
    fixes: [
      (content) => {
        // Remove orphaned return blocks
        return content
          .replace(/}\n}\n    queue: state\.queue,[\s\S]*?};\n};/g, '}\n};')
          .replace(/}\n    isPlaying: state\.isPlaying,[\s\S]*?};\n};/g, '}\n};')
          .replace(/export const useMiniplayerPlayback = \(\) => {\n}\n};/g, 
            'export const useMiniplayerPlayback = () => {\n  const { state } = useOptimizedMiniplayer();\n  return {\n    isPlaying: state.isPlaying,\n    currentTime: state.currentTime,\n    duration: state.duration,\n    volume: state.volume\n  };\n};')
          .replace(/export const useMiniplayerQueue = \(\) => {\n}/g,
            'export const useMiniplayerQueue = () => {\n  const { state } = useOptimizedMiniplayer();\n  return {')
          .replace(/export const useMiniplayerActions = \(\) => {\n}/g,
            'export const useMiniplayerActions = () => {');
      }
    ]
  },
  
  // Fix settingsService.ts
  {
    file: 'services/settingsService.ts',
    fixes: [
      (content) => {
        // Fix the object structure
        return content
          .replace(/defaultCategory: 'youtube',\s*homePage: {/, 
            "defaultCategory: 'youtube'\n  },\n  homePage: {")
          .replace(/defaultCategory: 'youtube'\s*};\s*searchResultsPage:/,
            "defaultCategory: 'youtube'\n  },\n  searchResultsPage:");
      }
    ]
  },

  // Fix HomeIcon.tsx
  {
    file: 'components/icons/HomeIcon.tsx',
    fixes: [
      (content) => {
        // Fix the SVG structure
        return content
          .replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg" \/>\s*>\s*<path/,
            'xmlns="http://www.w3.org/2000/svg">\n  <path');
      }
    ]
  },

  // Fix useLocalStorage.ts
  {
    file: 'src/hooks/useLocalStorage.ts',
    fixes: [
      (content) => {
        // Fix function signature
        return content.replace(
          /\): \[T\(value: SetValue<T>\) => void\(\) => void, boolean\]/g,
          '): [T, (value: SetValue<T>) => void, () => void, boolean]'
        );
      }
    ]
  },

  // Fix utils.ts
  {
    file: 'src/lib/utils.ts',
    fixes: [
      (content) => {
        // Fix toTitleCase function
        return content.replace(
          /return str\.replace\(\/\\w\\S\*\/g\(txt: any\) => txt/g,
          'return str.replace(/\\w\\S*/g, (txt: any) => txt'
        );
      }
    ]
  },

  // Fix youtube-utils.ts
  {
    file: 'src/lib/youtube-utils.ts',
    fixes: [
      (content) => {
        // Fix closing brackets
        return content.replace(
          /originalCallback\(\);\s*};\s*}\);/g,
          'originalCallback();\n    };\n  });'
        );
      }
    ]
  },

  // Fix useVideoPlayer.ts
  {
    file: 'src/hooks/useVideoPlayer.ts',
    fixes: [
      (content) => {
        // Fix event listener syntax
        return content
          .replace(/addEventListener\('enterpictureinpicture', \(\(\)/g,
            "addEventListener('enterpictureinpicture', (")
          .replace(/\) => setState\(prev => \({ \.\.\.prev as any, isPictureInPicture: true }\)\)\s*\);/g,
            ') => setState(prev => ({ ...prev as any, isPictureInPicture: true })) as EventListener);')
          .replace(/addEventListener\('leavepictureinpicture', \( as EventListener\)/g,
            "addEventListener('leavepictureinpicture', ((");
      }
    ]
  },

  // Fix useTrendingSearch.ts
  {
    file: 'src/hooks/useTrendingSearch.ts',
    fixes: [
      (content) => {
        // Fix function call syntax
        return content.replace(
          /await searchForHomePage\(initialKeyword\(query: any\) =>/g,
          'await searchForHomePage(initialKeyword, (query: any) =>'
        );
      }
    ]
  },

  // Fix unifiedHooks.ts
  {
    file: 'src/hooks/unifiedHooks.ts',
    fixes: [
      (content) => {
        // Fix useCallback closing
        return content.replace(
          /retryCountRef\.current = 0;\s*}\s*}, \[/g,
          'retryCountRef.current = 0;\n    }\n  }, ['
        );
      }
    ]
  },

  // Fix unifiedDataService.ts
  {
    file: 'src/services/unifiedDataService.ts',
    fixes: [
      (content) => {
        // Fix function parameter
        return content.replace(
          /async getTrendingVideos\(,/g,
          'async getTrendingVideos('
        );
      }
    ]
  },

  // Fix videoService.ts
  {
    file: 'src/features/video/services/videoService.ts',
    fixes: [
      (content) => {
        // Fix async method missing closing brace
        const lines = content.split('\n');
        let fixedLines = [];
        let inClass = false;
        let braceCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          // Check if we're in a class
          if (line.includes('class') && line.includes('VideoService')) {
            inClass = true;
            braceCount = 0;
          }
          
          if (inClass) {
            braceCount += (line.match(/{/g) || []).length;
            braceCount -= (line.match(/}/g) || []).length;
          }
          
          // Add missing closing brace before async method
          if (line.includes('async getVideoInteractions') && 
              i > 0 && !lines[i-1].includes('}')) {
            fixedLines.push('  }');
            fixedLines.push('');
          }
          
          fixedLines.push(line);
        }
        
        return fixedLines.join('\n');
      }
    ]
  },

  // Fix dateUtils.ts
  {
    file: 'src/utils/dateUtils.ts',
    fixes: [
      (content) => {
        // Fix function parameters
        return content
          .replace(/const formatDate: any = \(,/g, 'const formatDate: any = (')
          .replace(/const formatTime: any = \(,/g, 'const formatTime: any = (');
      }
    ]
  },

  // Additional fixes for other files
  {
    file: 'src/hooks/useFormState.ts',
    fixes: [
      (content) => {
        // Fix closing brackets
        return content.replace(
          /setIsSubmitting\(false\);\s*}\s*}, \[values, validate, onSubmit\]/g,
          'setIsSubmitting(false);\n    }\n  }, [values, validate, onSubmit]'
        );
      }
    ]
  },

  {
    file: 'src/hooks/useDropdownMenu.ts',
    fixes: [
      (content) => {
        // Fix closing brackets
        return content.replace(
          /return undefined;\s*}, \[isOpen\]\);/g,
          'return undefined;\n  }, [isOpen]);'
        );
      }
    ]
  },

  {
    file: 'src/hooks/useDebounce.ts',
    fixes: [
      (content) => {
        // Fix closing brackets
        return content.replace(
          /clearTimeout\(timeoutRef\.current\);\s*};\s*}, \[\]\);/g,
          'clearTimeout(timeoutRef.current);\n    };\n  }, []);'
        );
      }
    ]
  },

  {
    file: 'src/hooks/useVideosData.ts',
    fixes: [
      (content) => {
        // Fix else block
        return content.replace(
          /return response\.data;\s*} else {/g,
          'return response.data;\n  } else {'
        );
      }
    ]
  },

  {
    file: 'src/hooks/useWatchPage.ts',
    fixes: [
      (content) => {
        // Fix catch block
        return content.replace(
          /setAllRelatedVideos\(related\);\s*} catch \(error: any\) {/g,
          'setAllRelatedVideos(related);\n  } catch (error: any) {'
        );
      }
    ]
  },

  {
    file: 'src/hooks/useOptimizedVideoData.ts',
    fixes: [
      (content) => {
        // Fix catch block
        return content.replace(
          /timestamp: Date\.now\(\) \}\);\s*}\s*} catch \(err: any\) {/g,
          'timestamp: Date.now() });\n    }\n  } catch (err: any) {'
        );
      }
    ]
  },

  {
    file: 'src/hooks/useEnhancedQuery.ts',
    fixes: [
      (content) => {
        // Remove nested export
        const lines = content.split('\n');
        let inFunction = false;
        let braceCount = 0;
        
        return lines.map((line, i) => {
          if (line.includes('export function') && !inFunction) {
            inFunction = true;
            braceCount = 0;
          }
          
          if (inFunction) {
            braceCount += (line.match(/{/g) || []).length;
            braceCount -= (line.match(/}/g) || []).length;
            
            if (braceCount === 0 && line.includes('}')) {
              inFunction = false;
            }
            
            // Remove nested export
            if (braceCount > 0 && line.trim().startsWith('export')) {
              return line.replace(/^\s*export\s+/, '  ');
            }
          }
          
          return line;
        }).join('\n');
      }
    ]
  }
];

// Apply all fixes
fixes.forEach(({ file, fixes: fileFixes }) => {
  fixFile(file, fileFixes);
});

console.log('\n✨ Fix complete!');
console.log(`📝 Fixed ${fixedFiles.length} files:`, fixedFiles.join(', '));
