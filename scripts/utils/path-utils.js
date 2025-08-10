/**
 * Shared utility functions for path handling across TypeScript error fixing scripts
 */

import { join } from 'path';

/**
 * Normalize file path to be relative to project root with consistent separators
 * @param {string} filePath - The file path to normalize
 * @param {string} projectRoot - The project root directory
 * @returns {string} Normalized relative path
 */
export function normalizeFilePath(filePath, projectRoot) {
  // Normalize path separators to forward slashes
  const normalized = filePath.replace(/\\/g, '/');
  const projectRootNormalized = projectRoot.replace(/\\/g, '/');
  
  // Remove project root prefix if present
  if (normalized.startsWith(projectRootNormalized)) {
    return normalized.substring(projectRootNormalized.length + 1);
  }
  
  return normalized;
}

/**
 * Check if a file exists and is readable
 * @param {string} filePath - The file path to check
 * @returns {boolean} True if file exists and is readable
 */
export function fileExists(filePath) {
  try {
    import('fs').then(fs => fs.existsSync(filePath));
    // Fallback to require for synchronous operation
    const fs = require('fs');
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Safely read a file with error handling
 * @param {string} filePath - The file path to read
 * @returns {string|null} File content or null if error
 */
export function safeReadFile(filePath) {
  try {
    const fs = require('fs');
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Safely write a file with error handling
 * @param {string} filePath - The file path to write
 * @param {string} content - The content to write
 * @returns {boolean} True if successful, false otherwise
 */
export function safeWriteFile(filePath, content) {
  try {
    const fs = require('fs');
    fs.writeFileSync(filePath, content);
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Extract file path from TypeScript error line
 * @param {string} errorLine - The error line from tsc output
 * @param {string} projectRoot - The project root directory
 * @returns {string|null} Normalized file path or null if not found
 */
export function extractFilePathFromError(errorLine, projectRoot) {
  // Try different error line formats
  const patterns = [
    /^(.+?)\((\d+),(\d+)\):\s*error/,  // Windows format: file(line,col): error
    /^([^:]+):(\d+):(\d+):\s*error/,   // Unix format: file:line:col: error
  ];
  
  for (const pattern of patterns) {
    const match = errorLine.match(pattern);
    if (match) {
      return normalizeFilePath(match[1].trim(), projectRoot);
    }
  }
  
  return null;
}

/**
 * Create a standardized logger function
 * @param {string} prefix - The emoji prefix for log messages
 * @returns {Function} Logger function
 */
export function createLogger(prefix = '🔧') {
  return function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    const prefixes = {
      info: prefix,
      success: '✅',
      error: '❌',
      warning: '⚠️'
    };
    const logPrefix = prefixes[type] || prefix;
    const color = colors[type] || colors.info;
    
    console.log(`${color}${logPrefix} [${timestamp}] ${message}${colors.reset}`);
  };
}
