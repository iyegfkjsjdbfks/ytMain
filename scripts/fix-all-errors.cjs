const fs = require('fs');
const path = require('path');

// Track fixed files
const fixedFiles = [];
const failedFiles = [];

function fixFile(filePath, description, fixes) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️ File not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let modified = false;
    
    fixes.forEach(fix => {
      if (fix.search && fix.replace !== undefined) {
        if (content.includes(fix.search)) {
          content = content.replace(fix.search, fix.replace);
          console.log(`  ✓ Applied: ${fix.description}`);
          modified = true;
        }
      }
    });
    
    if (modified && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixedFiles.push(filePath);
      console.log(`✅ Fixed: ${path.basename(filePath)} - ${description}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    failedFiles.push(filePath);
    return false;
  }
}

// Component files to fix
const componentFixes = [
  {
    path: 'components/forms/Button.tsx',
    description: 'Fix Button JSX syntax',
    fixes: [
      {
        search: ` {...props} />
 >
 {isLoading && (
 <svg
// FIXED:  className={\`animate-spin h-5 w-5 \${children ? (leftIcon ? 'mr-2' : '-ml-1 mr-2') : ''} text-current\`}
 xmlns="http://www.w3.org/2000/svg"`,
        replace: ` {...props}
 >
 {isLoading && (
 <svg
  className={\`animate-spin h-5 w-5 \${children ? (leftIcon ? 'mr-2' : '-ml-1 mr-2') : ''} text-current\`}
  xmlns="http://www.w3.org/2000/svg"`,
        description: 'Fix button JSX closing and svg attributes'
      }
    ]
  },
  {
    path: 'components/icons/MenuIcon.tsx',
    description: 'Fix MenuIcon SVG syntax',
    fixes: [
      {
        search: ` strokeWidth={2}
 d="M4 6h16M4 12h16M4 18h16" />
 />
// FIXED:  </svg>`,
        replace: ` strokeWidth={2}
 d="M4 6h16M4 12h16M4 18h16" />
 </svg>`,
        description: 'Fix SVG closing tag'
      }
    ]
  },
  {
    path: 'components/icons/YouTubeLogo.tsx',
    description: 'Fix YouTubeLogo SVG syntax',
    fixes: [
      {
        search: ` fill="#FF0000" />
 />
 <path d="M11.1999 14.2857L18.3999 10L11.1999 5.71429V14.2857Z" fill="white" />
// FIXED:  </svg>`,
        replace: ` fill="#FF0000" />
 <path d="M11.1999 14.2857L18.3999 10L11.1999 5.71429V14.2857Z" fill="white" />
 </svg>`,
        description: 'Fix SVG closing tag'
      }
    ]
  },
  {
    path: 'components/NotificationSystem.tsx',
    description: 'Fix NotificationSystem useEffect',
    fixes: [
      {
        search: ` document.addEventListener('mousedown', handleClickOutside as EventListener);
 return () => document.removeEventListener('mousedown', handleClickOutside as EventListener);
 }, []);`,
        replace: ` document.addEventListener('mousedown', handleClickOutside as EventListener);
 return () => document.removeEventListener('mousedown', handleClickOutside as EventListener);
}, []);`,
        description: 'Fix useEffect closing'
      }
    ]
  },
  {
    path: 'components/PWAInstallBanner.tsx',
    description: 'Fix PWAInstallBanner useEffect',
    fixes: [
      {
        search: ` window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
 window.removeEventListener('appinstalled', handleAppInstalled as EventListener);
 }}, []);`,
        replace: ` window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
 window.removeEventListener('appinstalled', handleAppInstalled as EventListener);
 };
}, []);`,
        description: 'Fix useEffect closing'
      }
    ]
  },
  {
    path: 'components/SearchBar.tsx',
    description: 'Fix SearchBar useEffect',
    fixes: [
      {
        search: ` loadRecentSearches().catch(console.error);
 }
 }, [loadRecentSearches]);`,
        replace: ` loadRecentSearches().catch(console.error);
 }
}, [loadRecentSearches]);`,
        description: 'Fix useEffect closing'
      }
    ]
  },
  {
    path: 'components/UserMenu.tsx',
    description: 'Fix UserMenu JSX',
    fixes: [
      {
        search: ` >
 View your channel
// FIXED:  </Link>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>`,
        replace: ` >
 View your channel
 </Link>
 </div>
 </div>
 </div>`,
        description: 'Fix closing tags'
      }
    ]
  }
];

// Hook files to fix
const hookFixes = [
  {
    path: 'src/lib/utils.ts',
    description: 'Fix utils.ts forEach',
    fixes: [
      {
        search: `  searchParams.append(key, String(value));
    }
  });

  return searchParams`,
        replace: `  searchParams.append(key, String(value));
    }
  });

  return searchParams`,
        description: 'Already correct'
      }
    ]
  },
  {
    path: 'src/lib/youtube-utils.ts',
    description: 'Fix youtube-utils',
    fixes: [
      {
        search: `  originalCallback();
    };
  });
}`,
        replace: `  originalCallback();
    };
  });
}`,
        description: 'Already fixed'
      }
    ]
  },
  {
    path: 'src/hooks/useFormState.ts',
    description: 'Fix useFormState useCallback',
    fixes: [
      {
        search: `  setIsSubmitting(false);
        }
  }, [values, validate, onSubmit]);`,
        replace: `  setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);`,
        description: 'Fix indentation'
      }
    ]
  },
  {
    path: 'src/hooks/useDebounce.ts',
    description: 'Fix useDebounce useEffect',
    fixes: [
      {
        search: `  clearTimeout(timeoutRef.current);
    };
  }, []);`,
        replace: `  clearTimeout(timeoutRef.current);
    };
  }, []);`,
        description: 'Already correct'
      }
    ]
  },
  {
    path: 'src/hooks/useDropdownMenu.ts',
    description: 'Fix useDropdownMenu useMemo',
    fixes: [
      {
        search: `  }
  return undefined;
  }, [isOpen]);`,
        replace: `  }
  return undefined;
}, [isOpen]);`,
        description: 'Fix closing'
      }
    ]
  },
  {
    path: 'src/hooks/useTrendingSearch.ts',
    description: 'Fix useTrendingSearch useEffect',
    fixes: [
      {
        search: `  window.addEventListener('storage', handleStorageChange as EventListener);
  return () => window.removeEventListener('storage', handleStorageChange as EventListener);
  }, [fetchTrendingVideos]);`,
        replace: `  window.addEventListener('storage', handleStorageChange as EventListener);
  return () => window.removeEventListener('storage', handleStorageChange as EventListener);
}, [fetchTrendingVideos]);`,
        description: 'Fix closing'
      }
    ]
  },
  {
    path: 'src/hooks/useLocalStorage.ts',
    description: 'Fix useLocalStorage useEffect',
    fixes: [
      {
        search: `
  return () => clearInterval(interval);
  }, [key, removeValue]);`,
        replace: `
  return () => clearInterval(interval);
}, [key, removeValue]);`,
        description: 'Fix closing'
      }
    ]
  },
  {
    path: 'src/hooks/useVideosData.ts',
    description: 'Fix useVideosData if-else',
    fixes: [
      {
        search: `  const response = await unifiedDataService.getTrendingVideos(50);
  return response.data;
  } else {`,
        replace: `  const response = await unifiedDataService.getTrendingVideos(50);
  return response.data;
} else {`,
        description: 'Fix if-else structure'
      }
    ]
  },
  {
    path: 'src/hooks/useOptimizedVideoData.ts',
    description: 'Fix useOptimizedVideoData try-catch',
    fixes: [
      {
        search: `  timestamp: Date.now() });
    }
  } catch (err: any) {`,
        replace: `  timestamp: Date.now() });
  }
} catch (err: any) {`,
        description: 'Fix try-catch structure'
      }
    ]
  },
  {
    path: 'src/hooks/useWatchPage.ts',
    description: 'Fix useWatchPage try-catch',
    fixes: [
      {
        search: `  .slice(0, 20);
  setAllRelatedVideos(related);
  } catch (error: any) {`,
        replace: `  .slice(0, 20);
  setAllRelatedVideos(related);
} catch (error: any) {`,
        description: 'Fix try-catch'
      }
    ]
  },
  {
    path: 'src/hooks/unifiedHooks.ts',
    description: 'Fix unifiedHooks useCallback',
    fixes: [
      {
        search: `  retryCountRef.current = 0;
    }
  }, [
  apiCall,`,
        replace: `  retryCountRef.current = 0;
  }
}, [
  apiCall,`,
        description: 'Fix dependency array'
      }
    ]
  },
  {
    path: 'src/hooks/useVideoPlayer.ts',
    description: 'Fix useVideoPlayer event listeners',
    fixes: [
      {
        search: `  video.removeEventListener('enterpictureinpicture', ( as EventListener) =>`,
        replace: `  video.removeEventListener('enterpictureinpicture', (() =>`,
        description: 'Fix event listener syntax'
      }
    ]
  },
  {
    path: 'src/hooks/unified/useApi.ts',
    description: 'Fix useApi class method',
    fixes: [
      {
        search: `  get<T>(key: string): T | undefined {`,
        replace: `  get<T>(key: string): T | undefined {`,
        description: 'Already correct'
      }
    ]
  },
  {
    path: 'src/hooks/useEnhancedQuery.ts',
    description: 'Fix useEnhancedQuery generic',
    fixes: [
      {
        search: `  TError = ApiError,
  TVariables = void,
>(,
  mutationFn:`,
        replace: `  TError = ApiError,
  TVariables = void
>(
  mutationFn:`,
        description: 'Fix generic syntax'
      }
    ]
  }
];

// Service files to fix
const serviceFixes = [
  {
    path: 'src/services/unifiedDataService.ts',
    description: 'Fix unifiedDataService try-catch',
    fixes: [
      {
        search: `  return normalized;
    }
  } catch (error: any) {`,
        replace: `  return normalized;
  }
} catch (error: any) {`,
        description: 'Fix try-catch'
      }
    ]
  },
  {
    path: 'src/utils/dateUtils.ts',
    description: 'Fix dateUtils export',
    fixes: [
      {
        search: `  return now - 10 * 365 * 24 * 60 * 60 * 1000; // Approx 10 years ago
};`,
        replace: `  return now - 10 * 365 * 24 * 60 * 60 * 1000; // Approx 10 years ago
};

export { parseRelativeDate };`,
        description: 'Add export'
      }
    ]
  },
  {
    path: 'src/utils/youtubeApiUtils.ts',
    description: 'Fix youtubeApiUtils function',
    fixes: [
      {
        search: `export async function conditionalYouTubeApiCall<T>(,
  apiCall:`,
        replace: `export async function conditionalYouTubeApiCall<T>(
  apiCall:`,
        description: 'Fix function parameters'
      }
    ]
  },
  {
    path: 'src/features/video/services/videoService.ts',
    description: 'Fix videoService method',
    fixes: [
      {
        search: `  */
  async getYouTubeVideo`,
        replace: `  */
  async getYouTubeVideo`,
        description: 'Already correct'
      }
    ]
  }
];

console.log('Starting comprehensive error fixes...\n');

// Apply all fixes
[...componentFixes, ...hookFixes, ...serviceFixes].forEach(file => {
  console.log(`Processing ${file.path}...`);
  fixFile(file.path, file.description, file.fixes);
});

// Summary
console.log('\n=== Fix Summary ===');
console.log(`✅ Fixed files: ${fixedFiles.length}`);
if (fixedFiles.length > 0) {
  console.log('Files fixed:');
  fixedFiles.forEach(file => console.log(`  - ${path.basename(file)}`));
}

if (failedFiles.length > 0) {
  console.log(`\n❌ Failed files: ${failedFiles.length}`);
  failedFiles.forEach(file => console.log(`  - ${path.basename(file)}`));
}

console.log('\nComprehensive fix script completed!');
