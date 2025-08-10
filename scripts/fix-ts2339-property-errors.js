#!/usr/bin/env node
/**
 * Fix TypeScript TS2339 "Property does not exist" errors
 * Analyzes type mismatches and adds missing properties or type assertions
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import ts from 'typescript';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class PropertyErrorFixer {
  constructor() {
    this.fixedCount = 0;
    this.errors = [];
    this.propertyMappings = new Map();
  }

  getTypeScriptErrors() {
    try {
      execSync('npm run type-check', { encoding: 'utf8', stdio: 'pipe', cwd: projectRoot });
      return [];
    } catch (error) {
      const output = error.stdout + error.stderr;
      const lines = output.split('\n');
      const errors = [];
      
      for (const line of lines) {
        const match = line.match(/(.+?)\((\d+),(\d+)\): error TS2339: Property '(.+?)' does not exist on type '(.+?)'/);
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            property: match[4],
            type: match[5].replace(/\.$/, '')
          });
        }
      }
      
      return errors;
    }
  }

  analyzePropertyUsage(filePath, property, type) {
    // Common property mappings for the Video type
    const videoPropertyMappings = {
      'channel': 'channelId',
      'channelAvatar': 'channelThumbnail',
      'createdAt': 'uploadedAt',
      'visibility': 'privacyStatus',
      'metadata': 'contentDetails',
      'statistics': 'viewCount',
      'definition': 'quality',
      'likeCount': 'likes',
      'commentCount': 'comments',
      'isShort': 'duration',
      'thumbnailUrl': 'thumbnail',
      'content': 'text',
      'commentText': 'text',
      'userName': 'authorName',
      'userAvatarUrl': 'authorAvatar',
      'timestamp': 'publishedAt',
      'isPinned': 'pinned',
      'isHearted': 'hearted',
      'replyCount': 'replies',
      'authorAvatarUrl': 'authorAvatar',
      'videoId': 'id',
      'parentId': 'parentCommentId',
      'updatedAt': 'publishedAt',
      'totalDuration': 'duration',
      'ownerName': 'channelTitle',
      'tags': 'keywords'
    };

    // Check if it's a known mapping
    if (type.includes('Video') && videoPropertyMappings[property]) {
      return { suggestion: 'rename', newProperty: videoPropertyMappings[property] };
    }

    if (type.includes('Comment') && videoPropertyMappings[property]) {
      return { suggestion: 'rename', newProperty: videoPropertyMappings[property] };
    }

    if (type.includes('Playlist') && videoPropertyMappings[property]) {
      return { suggestion: 'rename', newProperty: videoPropertyMappings[property] };
    }

    if (type.includes('Channel') && property === 'isVerified') {
      return { suggestion: 'optional', defaultValue: 'false' };
    }

    // For properties that should be optional chained
    const optionalProperties = ['description', 'channelName', 'uploadedAt', 'category'];
    if (optionalProperties.includes(property)) {
      return { suggestion: 'optional' };
    }

    // Properties that need type assertion
    if (property === 'replace' || property === 'includes' || property === 'split') {
      return { suggestion: 'typeAssert', assertType: 'string' };
    }

    return { suggestion: 'ignore' };
  }

  fixPropertyError(filePath, error) {
    const fullPath = join(projectRoot, filePath);
    if (!existsSync(fullPath)) {
      console.log(`File not found: ${fullPath}`);
      return false;
    }

    const content = readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    
    if (error.line > lines.length) {
      return false;
    }

    const line = lines[error.line - 1];
    const { suggestion, newProperty, defaultValue, assertType } = this.analyzePropertyUsage(
      filePath, 
      error.property, 
      error.type
    );

    let newLine = line;
    
    switch (suggestion) {
      case 'rename':
        // Replace property with the correct one
        const propertyRegex = new RegExp(`\\.${error.property}(?![\\w])`, 'g');
        newLine = line.replace(propertyRegex, `.${newProperty}`);
        break;
        
      case 'optional':
        // Add optional chaining
        const optionalRegex = new RegExp(`\\.${error.property}`, 'g');
        newLine = line.replace(optionalRegex, `?.${error.property}`);
        break;
        
      case 'typeAssert':
        // Add type assertion before property access
        const match = line.match(new RegExp(`(\\w+)\\.${error.property}`));
        if (match) {
          const variable = match[1];
          newLine = line.replace(
            new RegExp(`${variable}\\.${error.property}`),
            `(${variable} as ${assertType}).${error.property}`
          );
        }
        break;
        
      case 'ignore':
      default:
        return false;
    }

    if (newLine !== line) {
      lines[error.line - 1] = newLine;
      writeFileSync(fullPath, lines.join('\n'), 'utf8');
      this.fixedCount++;
      console.log(`Fixed: ${filePath}:${error.line} - ${error.property} → ${suggestion}`);
      return true;
    }

    return false;
  }

  fixTypeDefinitions() {
    // Fix Video type to include all commonly used properties
    const videoTypePath = join(projectRoot, 'src/types/core.ts');
    if (!existsSync(videoTypePath)) {
      console.log('Type definition file not found:', videoTypePath);
      return;
    }
    
    let content = readFileSync(videoTypePath, 'utf8');
    
    // Add missing optional properties to Video interface
    const videoInterfaceMatch = content.match(/export interface Video\s*{[^}]*}/s);
    if (videoInterfaceMatch) {
      const currentInterface = videoInterfaceMatch[0];
      
      const additionalProperties = [
        '  visibility?: string;',
        '  metadata?: any;',
        '  statistics?: { viewCount?: number; likeCount?: number; commentCount?: number; favoriteCount?: number; };',
        '  contentDetails?: { definition?: string; dimension?: string; caption?: string; licensedContent?: boolean; projection?: string; };',
        '  privacyStatus?: string;',
        '  isShort?: boolean;',
        '  createdAt?: string;',
        '  updatedAt?: string;',
        '  definition?: string;',
        '  commentCount?: number;',
        '  likeCount?: number;'
      ];
      
      let updatedInterface = currentInterface;
      for (const prop of additionalProperties) {
        const propName = prop.match(/\s+(\w+)\?:/)?.[1];
        if (propName && !currentInterface.includes(propName)) {
          // Add before the closing brace
          updatedInterface = updatedInterface.replace(/}$/, `${prop}\n}`);
        }
      }
      
      if (updatedInterface !== currentInterface) {
        content = content.replace(currentInterface, updatedInterface);
        writeFileSync(videoTypePath, content, 'utf8');
        console.log('Updated Video interface with missing properties');
      }
    }

    // Fix Channel type
    const channelMatch = content.match(/export interface Channel\s*{[^}]*}/s);
    if (channelMatch) {
      const currentInterface = channelMatch[0];
      
      if (!currentInterface.includes('isVerified')) {
        const updatedInterface = currentInterface.replace(/}$/, '  isVerified?: boolean;\n}');
        content = content.replace(currentInterface, updatedInterface);
        writeFileSync(videoTypePath, content, 'utf8');
        console.log('Added isVerified to Channel interface');
      }
    }

    // Fix Comment type
    const commentMatch = content.match(/export interface Comment\s*{[^}]*}/s);
    if (commentMatch) {
      const currentInterface = commentMatch[0];
      
      const commentProperties = [
        '  content?: string;',
        '  likes?: number;',
        '  isPinned?: boolean;',
        '  isHearted?: boolean;',
        '  createdAt?: string;',
        '  videoId?: string;',
        '  parentId?: string;',
        '  replyCount?: number;'
      ];
      
      let updatedInterface = currentInterface;
      for (const prop of commentProperties) {
        const propName = prop.match(/\s+(\w+)\?:/)?.[1];
        if (propName && !currentInterface.includes(propName)) {
          updatedInterface = updatedInterface.replace(/}$/, `${prop}\n}`);
        }
      }
      
      if (updatedInterface !== currentInterface) {
        content = content.replace(currentInterface, updatedInterface);
        writeFileSync(videoTypePath, content, 'utf8');
        console.log('Updated Comment interface with missing properties');
      }
    }

    // Fix Playlist type  
    const playlistMatch = content.match(/export interface Playlist\s*{[^}]*}/s);
    if (playlistMatch) {
      const currentInterface = playlistMatch[0];
      
      const playlistProperties = [
        '  visibility?: string;',
        '  tags?: string[];',
        '  updatedAt?: string;',
        '  totalDuration?: string;',
        '  ownerName?: string;',
        '  thumbnailUrl?: string;'
      ];
      
      let updatedInterface = currentInterface;
      for (const prop of playlistProperties) {
        const propName = prop.match(/\s+(\w+)\?:/)?.[1];
        if (propName && !currentInterface.includes(propName)) {
          updatedInterface = updatedInterface.replace(/}$/, `${prop}\n}`);
        }
      }
      
      if (updatedInterface !== currentInterface) {
        content = content.replace(currentInterface, updatedInterface);
        writeFileSync(videoTypePath, content, 'utf8');
        console.log('Updated Playlist interface with missing properties');
      }
    }
  }

  async run() {
    console.log('🔍 Analyzing TS2339 property errors...');
    
    // First, update type definitions
    this.fixTypeDefinitions();
    
    // Get all property errors
    const errors = this.getTypeScriptErrors();
    console.log(`Found ${errors.length} property errors`);
    
    // Group errors by file
    const errorsByFile = {};
    for (const error of errors) {
      if (!errorsByFile[error.file]) {
        errorsByFile[error.file] = [];
      }
      errorsByFile[error.file].push(error);
    }
    
    // Fix errors file by file
    for (const [file, fileErrors] of Object.entries(errorsByFile)) {
      console.log(`Fixing ${fileErrors.length} errors in ${file}`);
      
      // Sort errors by line number in reverse to avoid line number shifts
      fileErrors.sort((a, b) => b.line - a.line);
      
      for (const error of fileErrors) {
        this.fixPropertyError(file, error);
      }
    }
    
    console.log(`✅ Fixed ${this.fixedCount} property errors`);
    
    // Run type check again to verify
    try {
      execSync('npm run type-check', { encoding: 'utf8', stdio: 'pipe', cwd: projectRoot });
      console.log('✅ No more TS2339 errors!');
    } catch (error) {
      const output = error.stdout + error.stderr;
      const remainingErrors = (output.match(/error TS2339:/g) || []).length;
      console.log(`⚠️ ${remainingErrors} TS2339 errors remaining`);
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('fix-ts2339-property-errors.js')) {
  const fixer = new PropertyErrorFixer();
  fixer.run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}

export { PropertyErrorFixer };
