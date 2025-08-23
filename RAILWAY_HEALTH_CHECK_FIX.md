# Railway Deployment Health Check Fixes

## Problem
Railway health checks were failing with "service unavailable" errors because:
1. The application was trying to run the bot (`dist/index.js`) instead of the web server (`dist/server.js`)
2. Server wasn't binding to all interfaces (`0.0.0.0`)
3. No dedicated health check endpoint
4. Build process was complex and prone to failure

## Fixes Applied

### 1. **Fixed package.json scripts**
```json
{
  "start": "node dist/server.js",        // ✅ Now runs web server
  "start:bot": "node dist/index.js"      // ✅ Separate script for bot
}
```

### 2. **Added reliable startup script** (`start-railway.js`)
- Uses `ts-node` directly to avoid build step failures
- Better error handling and logging
- Graceful shutdown handling

### 3. **Updated Procfile**
```
web: node start-railway.js
```
- Simpler, more reliable startup
- No complex build chain that can fail

### 4. **Enhanced server configuration**
- ✅ Binds to `0.0.0.0` (all interfaces) for Railway
- ✅ Added `/health` endpoint for health checks
- ✅ Better error handling with `process.exit(1)` on failure
- ✅ Comprehensive startup logging

### 5. **Updated Railway configuration** (`railway.toml`)
```toml
[deploy]
healthcheckPath = "/health"  # ✅ Uses dedicated health endpoint
```

### 6. **Fixed dependencies**
- Moved `typescript` and `ts-node` to dependencies (needed for production)
- Ensures all required packages are available during Railway build

## Health Check Endpoint
```
GET /health
```
Returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.45,
  "botStatus": "stopped"
}
```

## Deployment Steps

1. **Commit and push changes:**
```bash
git add .
git commit -m "Fix Railway deployment health checks"
git push
```

2. **Railway will automatically redeploy**
3. **Health checks should now pass** ✅
4. **Application will be accessible via Railway URL**

## Expected Behavior
- ✅ Health checks pass on `/health`
- ✅ Web interface accessible on `/`
- ✅ Bot control API works on `/api/*`
- ✅ Application starts reliably without build failures

## Troubleshooting
If health checks still fail:
1. Check Railway logs for startup errors
2. Verify environment variables are set (BOT_TOKEN, etc.)
3. Test health endpoint directly in browser

The application should now deploy successfully on Railway! 🚀