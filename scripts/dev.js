#!/usr/bin/env node
// Wrapper script to handle .env permission issues

import { spawn } from 'child_process';
import fs from 'fs';

// Try to fix .env permissions or create .env.local
try {
  const envPath = '.env';
  const envLocalPath = '.env.local';
  
  // Check if .env exists and has issues
  try {
    fs.accessSync(envPath, fs.constants.R_OK);
  } catch (err) {
    // .env is not readable, create .env.local instead
    if (!fs.existsSync(envLocalPath)) {
      fs.writeFileSync(envLocalPath, 'VITE_GEMINI_API_KEY=\n', 'utf8');
      console.log('Created .env.local (Vite will use this instead of .env)');
    }
  }
} catch (err) {
  // Ignore errors
}

// Spawn vite with error handling
const vite = spawn('npx', ['vite', '--port', '5174'], {
  stdio: 'inherit',
  shell: true
});

vite.on('error', (err) => {
  console.error('Error starting Vite:', err);
  process.exit(1);
});

vite.on('exit', (code) => {
  process.exit(code || 0);
});
