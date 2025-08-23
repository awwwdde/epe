import { spawn } from 'child_process';
import path from 'path';

console.log('🧪 Testing Bot Startup Methods...');
console.log('📁 Current directory:', process.cwd());
console.log('💻 Platform:', process.platform);

// Test 1: npm run bot
console.log('\n🧪 Test 1: npm run bot');
const isWindows = process.platform === 'win32';
const npmCommand = 'npm';
const npmArgs = ['run', 'bot'];

console.log(`Command: ${npmCommand} ${npmArgs.join(' ')}`);
console.log(`Shell: ${isWindows}`);

const testProcess = spawn(npmCommand, npmArgs, {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: isWindows
});

testProcess.stdout?.on('data', (data) => {
  console.log('STDOUT:', data.toString().trim());
});

testProcess.stderr?.on('data', (data) => {
  console.log('STDERR:', data.toString().trim());
});

testProcess.on('error', (error) => {
  console.log('❌ Process Error:', error.message);
});

testProcess.on('close', (code) => {
  console.log(`Process exited with code: ${code}`);
  process.exit(0);
});

// Kill the test after 5 seconds
setTimeout(() => {
  console.log('\n⏰ Test timeout - killing process');
  testProcess.kill('SIGTERM');
}, 5000);