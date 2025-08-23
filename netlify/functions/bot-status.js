// Simple in-memory bot status (in production, you'd use a database or external service)
let botStatus = {
  status: 'demo',
  uptime: 0,
  logs: [
    '[' + new Date().toLocaleTimeString() + '] 🌐 Netlify Demo Mode Active',
    '[' + new Date().toLocaleTimeString() + '] 💡 For full bot control, use: npm run dev',
    '[' + new Date().toLocaleTimeString() + '] 🤖 Bot functions available in local development only'
  ],
  lastUpdated: Date.now()
};

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod === 'GET') {
    // Return current bot status
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: botStatus.status,
        uptime: botStatus.status === 'running' ? Math.floor((Date.now() - botStatus.lastUpdated) / 1000) : 0,
        logs: botStatus.logs
      })
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};