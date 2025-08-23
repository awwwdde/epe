import { spawn } from 'child_process';
import path from 'path';

console.log('🧪 Testing EPE Bot Development Server Setup...');
console.log('📁 Current working directory:', process.cwd());
console.log('📄 Checking required files...');

const requiredFiles = [
  'src/server.ts',
  'public/index.html',
  'src/index.ts',
  '.env'
];

for (const file of requiredFiles) {
  try {
    const fs = require('fs');
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} - Found`);
    } else {
      console.log(`❌ ${file} - Missing`);
    }
  } catch (error) {
    console.log(`🔍 ${file} - Error checking: ${error.message}`);
  }
}

console.log('\n🚀 Setup verification complete!');
console.log('💡 Run \"npm run dev\" to start the development interface');
console.log('🌐 The web interface will be available at http://localhost:3000');