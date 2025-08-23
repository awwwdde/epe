# EPE Bot Development Interface

## 🚀 Quick Start

To start the development web interface with bot control functionality:

```bash
npm run dev
```

This will:
- Start a web server at `http://localhost:3000`
- Automatically open your browser to the interface
- Provide real-time bot control and monitoring

## 🎛️ Features

### Bot Control Panel
- **Start Bot**: Launch your EPE Bot with all services
- **Stop Bot**: Gracefully shutdown the bot
- **Restart Bot**: Stop and start the bot in one action
- **Real-time Logs**: View bot activity and system messages
- **Status Monitoring**: Live status updates every 2 seconds

### Web Interface
- **Modern Design**: Responsive interface that works on all devices
- **Real-time Updates**: Live status and log updates
- **Interactive Controls**: Easy-to-use bot management buttons
- **Visual Feedback**: Status indicators and animations

## 🔧 Commands

- `npm run dev` - Start development web interface
- `npm run bot` - Start bot directly (without web interface)
- `npm start` - Start bot in production mode
- `npm run build` - Build TypeScript to JavaScript

## 🌐 API Endpoints

The development server provides these API endpoints:

- `GET /api/status` - Get bot status and logs
- `POST /api/start` - Start the bot
- `POST /api/stop` - Stop the bot
- `POST /api/restart` - Restart the bot
- `GET /api/logs` - Get all logs
- `DELETE /api/logs` - Clear logs

## 🔒 Security Notes

- This development interface should only be used in development environments
- The web server runs on localhost by default
- Bot tokens and sensitive data are managed through environment variables

## 🛠️ Troubleshooting

### Bot Won't Start
1. Check your `.env` file has the correct `BOT_TOKEN`
2. Ensure `CHANNEL_USERNAME` is properly configured
3. Verify network connectivity for Telegram API

### Web Interface Issues
1. Check if port 3000 is available
2. Clear browser cache and refresh
3. Check browser console for JavaScript errors

### Permission Issues
1. Ensure the `data/` directory is writable
2. Check file permissions for log files
3. Verify Node.js has necessary system permissions

## 📝 Development Tips

- Use the logs panel to debug bot behavior
- The interface auto-refreshes status every 2 seconds
- Bot gracefully handles shutdown signals (SIGTERM, SIGINT)
- All data is persisted to JSON files with automatic backups

## 🔄 Automatic Features

- **Auto-save**: Bot data is automatically saved
- **Graceful Shutdown**: Proper cleanup on exit
- **Error Recovery**: Bot restarts after crashes
- **Backup System**: Automatic backup rotation