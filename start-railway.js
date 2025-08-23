#!/usr/bin/env node

// Simple startup script for Railway deployment
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting EPE Bot on Railway...');
console.log(`📍 Working directory: ${process.cwd()}`);
console.log(`🌐 Port: ${process.env.PORT || 3000}`);
console.log(`🔧 Node version: ${process.version}`);

// Start the server directly with ts-node
const serverProcess = spawn('npx', ['ts-node', 'src/server.ts'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  console.log(`🛑 Server process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  serverProcess.kill('SIGINT');
});