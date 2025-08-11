import { Link } from 'react-router-dom';
//!/usr/bin/env node

/**
 * Comprehensive Codebase Refactoring Script
 * Automates the refactoring process for the YouTube clone application
 */

import fs from 'fs';
import path from 'path';

interface RefactorTask {
  name: string;
  description: string;
  execute: () => Promise<void>;
  priority: 'high' | 'medium' | 'low';
}

class CodebaseRefactorer {
  private tasks: RefactorTask = [];
  private completedTasks: string = [];
  private failedTasks: string = [];

  constructor() {
    this.initializeTasks();
  }

  private initializeTasks(): void {
    this.tasks = [
      {
        name: 'consolidate-components',
        description: 'Consolidate duplicate components into unified versions',
        priority: 'high',
        execute: this.consolidateComponents.bind(this),
      },
      {
        name: 'optimize-imports',
        description: 'Optimize and standardize import statements',
        priority: 'high',
        execute: this.optimizeImports.bind(this),
      },
      {
        name: 'enhance-type-safety',
        description: 'Improve TypeScript type definitions and usage',
        priority: 'high',
        execute: this.enhanceTypeSafety.bind(this),
      },
      {
        name: 'consolidate-hooks',
        description: 'Merge duplicate custom hooks',
        priority: 'medium',
        execute: this.consolidateHooks.bind(this),
      },
      {
        name: 'optimize-performance',
        description: 'Add React.memo, useMemo, and useCallback optimizations',
        priority: 'medium',
        execute: this.optimizePerformance.bind(this),
      },
      {
        name: 'standardize-error-handling',
        description: 'Implement consistent error handling patterns',
        priority: 'medium',
        execute: this.standardizeErrorHandling.bind(this),
      },
      {
        name: 'improve-accessibility',
        description: 'Enhance accessibility features across components',
        priority: 'low',
        execute: this.improveAccessibility.bind(this),
      },
      {
        name: 'optimize-bundle-size',
        description: 'Implement code splitting and lazy loading',
        priority: 'low',
        execute: this.optimizeBundleSize.bind(this),
      },
    ];
  }

  async runRefactoring(): Promise<void> {
    // Sort tasks by priority
    const sortedTasks = this.tasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    for (const task of sortedTasks) {
      await this.executeTask(task);
    }

    this.generateRefactoringReport();
  }

  private async executeTask(task: RefactorTask): Promise<void> {
    try {
      await task.execute();
      this.completedTasks.push(task.name);
      } catch (error) {
      this.failedTasks.push(task.name);
      console.error(`❌ Failed: ${task.name}`);
      console.error(`   Error: ${error instanceof Error ? error.message : String(error)}\n`);
    }
  }

  private async consolidateComponents(): Promise<void> {
    // Create unified component directory if it doesn't exist
    const unifiedDir = path.join(process.cwd(), 'src', 'components', 'unified');
    if (!fs.existsSync(unifiedDir)) {
      fs.mkdirSync(unifiedDir, { recursive: true });
    }

    // Check if UnifiedVideoCard exists, if not create it
    const unifiedVideoCardPath = path.join(unifiedDir, 'UnifiedVideoCard.tsx');
    if (!fs.existsSync(unifiedVideoCardPath)) {
      await this.createUnifiedVideoCard();
    }

    // Update component index
    await this.updateComponentIndex();
  }

  private async createUnifiedVideoCard(): Promise<void> {
    const unifiedVideoCardContent = `/**
 * Unified Video Card Component
 * Consolidates all video card variants into a single component
 */

import * as React from 'react';
import {  memo  } from 'react';
import { cn } from '../../lib/utils';
import { Video } from '../../types/core';
import { formatDistanceToNow } from 'date-fns';

export type VideoCardVariant = 'default' | 'compact' | 'list' | 'grid' | 'shorts';
export type VideoCardSize = 'sm' | 'md' | 'lg';

export interface UnifiedVideoCardProps {
  video: Video;
  variant?: VideoCardVariant;
  size?: VideoCardSize;
  showChannel?: boolean;
  showDuration?: boolean;
  showViews?: boolean;
  showDate?: boolean;
  onClick?: (video: Video) => void;
  className?: string;
}

const variantStyles: Record<VideoCardVariant, string> = {
  default: 'flex flex-col space-y-3',
  compact: 'flex space-x-3',
  list: 'flex space-x-4 p-4',
  grid: 'flex flex-col space-y-2',
  shorts: 'flex flex-col space-y-2 aspect-[9/16]'
};

const sizeStyles: Record<VideoCardSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
};

export const UnifiedVideoCard = memo<UnifiedVideoCardProps>(({
  video,
  variant = 'default',
  size = 'md',
  showChannel = true,
  showDuration = true,
  showViews = true,
  showDate = true,
  onClick,
  className
}) => {
  const handleClick = () => {
    onClick?.(video);
  };

  const formattedDate = video.createdAt 
    ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })
    : '';

  return (
    <div 
      className={cn(
        variantStyles[variant],
        sizeStyles[size],
        'group cursor-pointer',
        className
      )}
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative">
        <Link to={\`/watch?v=\${video.id}\`}>
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full aspect-video object-cover rounded-lg"
            loading="lazy"
          />
          {showDuration && video.duration && (
            <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
              {video.duration}
            </span>
          )}
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Link to={\`/watch?v=\${video.id}\`}>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {video.title}
          </h3>
        </Link>
        
        {showChannel && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {video.channelName}
          </p>
        )}
        
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-500 mt-1">
          {showViews && (
            <span>{video.views} views</span>
          )}
          {showDate && formattedDate && (
            <>
              <span>•</span>
              <span>{formattedDate}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

UnifiedVideoCard.displayName = 'UnifiedVideoCard';

export default UnifiedVideoCard;`;

    const filePath = path.join(process.cwd(), 'src', 'components', 'unified', 'UnifiedVideoCard.tsx');
    fs.writeFileSync(filePath, unifiedVideoCardContent);
  }

  private async updateComponentIndex(): Promise<void> {
    const indexContent = `/**
 * Unified Components Index
 * Centralized exports for all unified components
 */

// Button Components
export { 
  UnifiedButton,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  GhostButton,
  LinkButton,
  type UnifiedButtonProps,
  type ButtonVariant,
  type ButtonSize
} from './UnifiedButton';

// Video Card Components
export {
  UnifiedVideoCard,
  type UnifiedVideoCardProps,
  type VideoCardVariant,
  type VideoCardSize
} from './UnifiedVideoCard';

// Re-export common types
export type { Video, User, Channel, Playlist, Comment } from '../../types/core';`;

    const indexPath = path.join(process.cwd(), 'src', 'components', 'unified', 'index.ts');
    fs.writeFileSync(indexPath, indexContent);
  }

  private async optimizeImports(): Promise<void> {
    // Find all TypeScript/JavaScript files
    const files = this.findFiles(['src'], ['.ts', '.tsx'], ['node_modules', 'dist', 'build']);

    for (const file of files) {
      await this.optimizeFileImports(file);
    }
  }

  private async optimizeFileImports(filePath): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf8');
    let optimizedContent = content;

    // Remove unused imports (basic implementation)
    const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
    const matches = content.matchAll(importRegex);

    for (const match of matches) {
      if (!match[1]) {
continue;
}
      const imports = match[1].split(',').map(imp => imp.trim());
      const usedImports = imports.filter(imp => {
        const importName = imp.replace(/\s+as\s+\w+/, '').trim();
        return content.includes(importName);
      });

      if (usedImports.length !== imports.length && usedImports.length > 0) {
        const newImportStatement = `import { ${usedImports.join(', ')} } from '${match[2]}'`;
        optimizedContent = optimizedContent.replace(match[0], newImportStatement);
      } else if (usedImports.length === 0) {
        optimizedContent = optimizedContent.replace(match[0], '');
      }
    }

    // Sort imports
    optimizedContent = this.sortImports(optimizedContent);

    if (optimizedContent !== content) {
      fs.writeFileSync(filePath, optimizedContent);
    }
  }

  private sortImports(content): string {
    const lines = content.split('\n');
    const importLines: string = [];
    const otherLines: string = [];
    let inImportSection = true;

    for (const line of lines) {
      if (line.trim().startsWith('import ')) {
        importLines.push(line);
      } else if (line.trim() === '' && inImportSection) {
        // Keep empty lines in import section
      } else {
        inImportSection = false;
        otherLines.push(line);
      }
    }

    // Sort imports: React first, then libraries, then local imports
    const reactImports = importLines.filter(line => line.includes("'react'") || line.includes('"react"'));
    const libraryImports = importLines.filter(line =>
      !line.includes("'react'") &&
      !line.includes('"react"') &&
      !line.includes('./') &&
      !line.includes('../') &&
      line.trim().startsWith('import '),
    );
    const localImports = importLines.filter(line =>
      (line.includes('./') || line.includes('../')) &&
      line.trim().startsWith('import '),
    );
    const emptyLines = importLines.filter(line => line.trim() === '');

    const sortedImports = [
      ...reactImports.sort(),
      ...libraryImports.sort(),
      ...localImports.sort(),
      ...emptyLines.slice(0, 1), // Keep one empty line after imports
    ];

    return [...sortedImports, ...otherLines].join('\n');
  }

  private async enhanceTypeSafety(): Promise<void> {
    // Create enhanced type definitions
    const typesDir = path.join(process.cwd(), 'src', 'types');
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
    }

    // Check if strict types exist
    const strictTypesPath = path.join(typesDir, 'strict.ts');
    if (!fs.existsSync(strictTypesPath)) {
      await this.createStrictTypes();
    }
  }

  private async createStrictTypes(): Promise<void> {
    const strictTypesContent = `/**
 * Strict Type Definitions
 * Enhanced type safety for the YouTube clone application
 */

// Utility types for better type safety
export type NonEmptyString = string & { readonly __brand: unique symbol };
export type PositiveNumber = number & { readonly __brand: unique symbol };
export type EmailAddress = string & { readonly __brand: unique symbol };
export type URL = string & { readonly __brand: unique symbol };

// Type guards
export function isNonEmptyString(value): value is NonEmptyString {
  return value.length > 0;
}

export function isPositiveNumber(value): value is PositiveNumber {
  return value > 0;
}

export function isEmailAddress(value): value is EmailAddress {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function isURL(value): value is URL {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

// Enhanced API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorWithSeverity extends AppError {
  severity: ErrorSeverity;
}`;

    const filePath = path.join(process.cwd(), 'src', 'types', 'strict.ts');
    fs.writeFileSync(filePath, strictTypesContent);
  }

  private async consolidateHooks(): Promise<void> {
    // Implementation for consolidating duplicate hooks
    // This would involve analyzing hook files and merging duplicates
  }

  private async optimizePerformance(): Promise<void> {
    // Implementation for performance optimizations
    // This would involve adding React.memo, useMemo, useCallback where appropriate
  }

  private async standardizeErrorHandling(): Promise<void> {
    // Implementation for error handling standardization
    // This would involve creating consistent error boundaries and handling patterns
  }

  private async improveAccessibility(): Promise<void> {
    // Implementation for accessibility improvements
    // This would involve adding ARIA labels, keyboard navigation, etc.
  }

  private async optimizeBundleSize(): Promise<void> {
    // Implementation for bundle size optimization
    // This would involve implementing code splitting and lazy loading
  }

  private findFiles(directories, extensions, exclude: string = []): string[] {
    const files: string = [];

    function searchDirectory(dir): void {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !exclude.some(ex => fullPath.includes(ex))) {
          searchDirectory(fullPath);
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }

    for (const directory of directories) {
      const fullDir = path.join(process.cwd(), directory);
      if (fs.existsSync(fullDir)) {
        searchDirectory(fullDir);
      }
    }

    return files;
  }

  private generateRefactoringReport(): void {
    const failedCount = this.failedTasks.length;


    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

// Run the refactoring
const refactorer = new CodebaseRefactorer();
refactorer.runRefactoring().catch(error => {
  console.error('❌ Refactoring failed:', error);
  process.exit(1);
});

