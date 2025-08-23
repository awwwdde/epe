# EPE Bot Startup Script for Windows
Write-Host \"🚀 Starting EPE Bot...\" -ForegroundColor Green
Write-Host \"📁 Working directory: $(Get-Location)\" -ForegroundColor Cyan
Write-Host \"\" 

# Check if .env file exists
if (-not (Test-Path \".env\")) {
    Write-Host \"❌ .env file not found!\" -ForegroundColor Red
    Write-Host \"💡 Please create .env file with BOT_TOKEN and CHANNEL_USERNAME\" -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path \"node_modules\")) {
    Write-Host \"❌ node_modules not found!\" -ForegroundColor Red
    Write-Host \"💡 Please run 'npm install' first\" -ForegroundColor Yellow
    exit 1
}

Write-Host \"📋 Method 1: Trying 'npm run bot'...\" -ForegroundColor Yellow
try {
    & npm run bot
    if ($LASTEXITCODE -eq 0) {
        Write-Host \"✅ Bot started successfully with npm!\" -ForegroundColor Green
        exit 0
    }
} catch {
    Write-Host \"❌ Method 1 failed: $($_.Exception.Message)\" -ForegroundColor Red
}

Write-Host \"\" 
Write-Host \"📋 Method 2: Trying direct ts-node execution...\" -ForegroundColor Yellow
try {
    & npx ts-node src/index.ts
    if ($LASTEXITCODE -eq 0) {
        Write-Host \"✅ Bot started successfully with ts-node!\" -ForegroundColor Green
        exit 0
    }
} catch {
    Write-Host \"❌ Method 2 failed: $($_.Exception.Message)\" -ForegroundColor Red
}

Write-Host \"\" 
Write-Host \"📋 Method 3: Trying compiled JavaScript...\" -ForegroundColor Yellow
try {
    Write-Host \"🔨 Building TypeScript...\" -ForegroundColor Cyan
    & npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host \"▶️ Running compiled bot...\" -ForegroundColor Cyan
        & node dist/index.js
        if ($LASTEXITCODE -eq 0) {
            Write-Host \"✅ Bot started successfully with compiled JS!\" -ForegroundColor Green
            exit 0
        }
    }
} catch {
    Write-Host \"❌ Method 3 failed: $($_.Exception.Message)\" -ForegroundColor Red
}

Write-Host \"\" 
Write-Host \"💥 All startup methods failed!\" -ForegroundColor Red
Write-Host \"🔧 Troubleshooting tips:\" -ForegroundColor Yellow
Write-Host \"   1. Check if Node.js is installed: node --version\" -ForegroundColor White
Write-Host \"   2. Check if npm is working: npm --version\" -ForegroundColor White
Write-Host \"   3. Try reinstalling dependencies: npm install\" -ForegroundColor White
Write-Host \"   4. Check your .env file configuration\" -ForegroundColor White
Write-Host \"   5. Verify your bot token is correct\" -ForegroundColor White

Read-Host \"Press Enter to exit\"