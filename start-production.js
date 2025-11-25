#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Fee Management System in production mode...');

// Set environment variables
process.env.NODE_ENV = 'production';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Start PM2 with ecosystem file
const pm2Process = spawn('pm2', ['start', 'ecosystem.config.js'], {
  stdio: 'inherit',
  cwd: __dirname,
  env: process.env
});

pm2Process.on('error', (error) => {
  console.error('❌ Failed to start PM2:', error);
  process.exit(1);
});

pm2Process.on('close', (code) => {
  if (code === 0) {
    console.log('✅ PM2 started successfully');
    console.log('📊 Monitor with: pm2 monit');
    console.log('📝 Logs with: pm2 logs');
    console.log('🔄 Reload with: pm2 reload ecosystem.config.js');
  } else {
    console.error(`❌ PM2 exited with code ${code}`);
    process.exit(code);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  spawn('pm2', ['delete', 'all'], { stdio: 'inherit' })
    .on('close', () => {
      process.exit(0);
    });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  spawn('pm2', ['delete', 'all'], { stdio: 'inherit' })
    .on('close', () => {
      process.exit(0);
    });
});