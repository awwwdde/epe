import express from 'express';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';

const app = express();
const PORT = 3000;

// Bot process management
let botProcess: ChildProcess | null = null;
let botStatus: 'stopped' | 'starting' | 'running' | 'stopping' = 'stopped';
let botLogs: string[] = [];

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API Routes
app.get('/api/status', (req, res) => {
  res.json({ 
    status: botStatus,
    logs: botLogs.slice(-50), // Last 50 log entries
    uptime: botProcess ? process.uptime() : 0
  });
});

app.post('/api/start', (req, res) => {
  if (botStatus === 'running') {
    return res.json({ success: false, message: 'Bot is already running' });
  }

  if (botStatus === 'starting') {
    return res.json({ success: false, message: 'Bot is already starting' });
  }

  try {
    botStatus = 'starting';
    addLog('🚀 Starting bot...');
    addLog(`💻 Platform: ${process.platform}`);
    addLog(`📂 Working directory: ${path.join(__dirname, '..')}`);

    // Start the bot using npm script
    const isWindows = process.platform === 'win32';
    const command = isWindows ? 'npm' : 'npm';
    const args = ['run', 'bot'];
    
    addLog(`🚀 Executing: ${command} ${args.join(' ')}`);
    
    botProcess = spawn(command, args, {
      cwd: path.join(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: isWindows // Use shell on Windows
    });

    // Attach process listeners
    attachProcessListeners();

    botProcess.on('error', (error) => {
      addLog(`💥 Bot process error: ${error.message}`);
      addLog('💡 Trying fallback method with direct ts-node execution...');
      
      // Fallback: try direct ts-node execution
      try {
        const fallbackCommand = process.platform === 'win32' ? 'npx' : 'npx';
        const fallbackArgs = ['ts-node', 'src/index.ts'];
        
        botProcess = spawn(fallbackCommand, fallbackArgs, {
          cwd: path.join(__dirname, '..'),
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: true
        });
        
        addLog('🚀 Fallback method initiated');
        
        // Re-attach event listeners for fallback process
        attachProcessListeners();
        
      } catch (fallbackError) {
        addLog(`💥 Fallback also failed: ${fallbackError}`);
        addLog('💡 Please check your Node.js and npm installation');
        botStatus = 'stopped';
        botProcess = null;
      }
    });

    // Set status to running after a short delay if no errors
    setTimeout(() => {
      if (botProcess && botStatus === 'starting') {
        botStatus = 'running';
        addLog('✅ Bot is now running');
      }
    }, 3000);

    res.json({ success: true, message: 'Bot start initiated' });
  } catch (error) {
    botStatus = 'stopped';
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addLog(`💥 Failed to start bot: ${errorMessage}`);
    res.json({ success: false, message: `Failed to start bot: ${errorMessage}` });
  }
});

app.post('/api/stop', (req, res) => {
  if (botStatus === 'stopped') {
    return res.json({ success: false, message: 'Bot is already stopped' });
  }

  try {
    botStatus = 'stopping';
    addLog('🛑 Stopping bot...');

    if (botProcess) {
      // Send SIGTERM for graceful shutdown
      botProcess.kill('SIGTERM');
      
      // Force kill after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        if (botProcess && !botProcess.killed) {
          botProcess.kill('SIGKILL');
          addLog('💀 Bot process force killed');
        }
      }, 10000);
    }

    res.json({ success: true, message: 'Bot stop initiated' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addLog(`💥 Failed to stop bot: ${errorMessage}`);
    res.json({ success: false, message: `Failed to stop bot: ${errorMessage}` });
  }
});

app.post('/api/restart', (req, res) => {
  addLog('🔄 Restarting bot...');
  
  if (botProcess) {
    botProcess.kill('SIGTERM');
    
    // Wait for the process to stop, then start again
    const checkStopped = setInterval(() => {
      if (botStatus === 'stopped') {
        clearInterval(checkStopped);
        // Restart after a short delay
        setTimeout(() => {
          app.emit('restart-bot');
        }, 1000);
      }
    }, 500);
  } else {
    // Bot is not running, just start it
    app.emit('restart-bot');
  }
  
  res.json({ success: true, message: 'Bot restart initiated' });
});

app.get('/api/logs', (req, res) => {
  res.json({ logs: botLogs });
});

app.delete('/api/logs', (req, res) => {
  botLogs = [];
  addLog('🧹 Logs cleared');
  res.json({ success: true, message: 'Logs cleared' });
});

// Helper function to add logs with timestamp
function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;
  botLogs.push(logEntry);
  
  // Keep only last 100 logs
  if (botLogs.length > 100) {
    botLogs = botLogs.slice(-100);
  }
  
  console.log(logEntry);
}

// Helper function to attach process listeners
function attachProcessListeners() {
  if (!botProcess) return;
  
  // Handle bot process output
  botProcess.stdout?.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      addLog(`📤 ${output}`);
      if (output.includes('Бот успешно запущен') || output.includes('Bot successfully started') || output.includes('✅ Бот успешно запущен!')) {
        botStatus = 'running';
        addLog('✅ Bot status updated to running');
      }
    }
  });

  botProcess.stderr?.on('data', (data) => {
    const error = data.toString().trim();
    if (error) {
      addLog(`❌ ${error}`);
    }
  });

  botProcess.on('close', (code) => {
    addLog(`🛑 Bot process exited with code ${code}`);
    botStatus = 'stopped';
    botProcess = null;
  });
}

// Handle restart event
app.on('restart-bot', () => {
  if (botStatus !== 'stopped') return;
  
  // Trigger start endpoint
  botStatus = 'starting';
  addLog('🚀 Restarting bot...');
  
  const isWindows = process.platform === 'win32';
  const command = isWindows ? 'npm' : 'npm';
  const args = ['run', 'bot'];
  
  botProcess = spawn(command, args, {
    cwd: path.join(__dirname, '..'),
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: isWindows // Use shell on Windows
  });

  // Attach process listeners
  attachProcessListeners();

  setTimeout(() => {
    if (botProcess && botStatus === 'starting') {
      botStatus = 'running';
      addLog('✅ Bot restarted successfully');
    }
  }, 3000);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  
  if (botProcess) {
    console.log('🛑 Stopping bot process...');
    botProcess.kill('SIGTERM');
  }
  
  process.exit(0);
});

// Start the development server
app.listen(PORT, () => {
  addLog(`🌐 Development server started at http://localhost:${PORT}`);
  addLog('💡 Use the web interface to control your EPE Bot');
  
  // Try to open the browser automatically
  const open = require('child_process').exec;
  const url = `http://localhost:${PORT}`;
  
  // Cross-platform browser opening
  const start = process.platform === 'darwin' ? 'open' : 
                process.platform === 'win32' ? 'start' : 'xdg-open';
  
  open(`${start} ${url}`, (error: any) => {
    if (error) {
      addLog(`🌐 Please open ${url} in your browser`);
    } else {
      addLog(`🌐 Opening ${url} in browser...`);
    }
  });
});

export default app;