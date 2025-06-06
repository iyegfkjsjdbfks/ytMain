#!/usr/bin/env node

// Development setup script to handle environment configuration
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Check if API server is needed
const checkApiServer = () => {
  const viteConfigPath = join(rootDir, 'vite.config.ts');
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  // Check if proxy is configured for API
  return viteConfig.includes("'/api':");
};

// Start development servers
const startDevelopment = () => {
  const needsApiServer = checkApiServer();
  
  if (needsApiServer) {
    // Start both servers concurrently
    const devProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      cwd: rootDir
    });
    
    devProcess.on('error', (error) => {
      console.error('❌ Failed to start development servers:', error);
      process.exit(1);
    });
    
    devProcess.on('close', (code) => {
      process.exit(code);
    });
  } else {
    // Start only Vite server
    const devProcess = spawn('npm', ['run', 'dev:client-only'], {
      stdio: 'inherit',
      shell: true,
      cwd: rootDir
    });
    
    devProcess.on('error', (error) => {
      console.error('❌ Failed to start Vite server:', error);
      process.exit(1);
    });
    
    devProcess.on('close', (code) => {
      process.exit(code);
    });
  }
};

// Handle process termination
process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

// Start the development environment
startDevelopment();
