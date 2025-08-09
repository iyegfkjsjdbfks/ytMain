#!/usr/bin/env node
/**
 * Simple test script to check if type-check works
 */

import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

console.log('Testing type-check command...');
console.log('Project root:', projectRoot);

try {
  console.log('Running npm run type-check with 30 second timeout...');
  const start = Date.now();
  
  execSync('npm run type-check', {
    encoding: 'utf8',
    stdio: 'pipe',
    cwd: projectRoot,
    timeout: 30000 // 30 second timeout
  });
  
  const duration = Date.now() - start;
  console.log(`✅ Type-check completed successfully in ${duration}ms`);
  console.log('No TypeScript errors found!');
  
} catch (error) {
  const start = Date.now();
  const duration = Date.now() - start;
  
  if (error.signal === 'SIGTERM') {
    console.log(`⏰ Type-check timed out after 30 seconds`);
  } else {
    console.log(`⚠️ Type-check completed with errors in ${duration}ms`);
    const output = `${error.stdout || ''}${error.stderr || ''}`;
    const errorLines = output.split('\n').filter(line => /error TS\d+:/.test(line));
    console.log(`Found ${errorLines.length} TypeScript errors`);
    
    // Show first 5 errors as sample
    if (errorLines.length > 0) {
      console.log('\nSample errors:');
      errorLines.slice(0, 5).forEach((line, i) => {
        console.log(`${i + 1}. ${line.trim()}`);
      });
      if (errorLines.length > 5) {
        console.log(`... and ${errorLines.length - 5} more errors`);
      }
    }
  }
}