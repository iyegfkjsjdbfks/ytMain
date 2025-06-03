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
  console.log('🚀 Starting YouTube Clone Development Environment...\n');
  
  const needsApiServer = checkApiServer();
  
  if (needsApiServer) {
    console.log('📡 Starting API server on http://localhost:8000');
    console.log('🎨 Starting Vite dev server on http://localhost:3000');
    console.log('');
    
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
      console.log(`\n🛑 Development servers stopped with code ${code}`);
      process.exit(code);
    });
  } else {
    console.log('🎨 Starting Vite dev server only on http://localhost:3000');
    console.log('');
    
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
      console.log(`\n🛑 Vite server stopped with code ${code}`);
      process.exit(code);
    });
  }
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down development servers...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down development servers...');
  process.exit(0);
});

// Start the development environment
startDevelopment();
