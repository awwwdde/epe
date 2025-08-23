@echo off
echo Starting EPE Bot...
echo Working directory: %CD%
echo.

:: Method 1: Try npm run bot
echo [Method 1] Trying npm run bot...
npm run bot

:: If that fails, try Method 2
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [Method 1] Failed, trying Method 2...
    echo [Method 2] Trying direct ts-node execution...
    npx ts-node src\\index.ts
)

:: If that also fails, try Method 3
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [Method 2] Failed, trying Method 3...
    echo [Method 3] Trying node with compiled JavaScript...
    npm run build
    node dist\\index.js
)

echo.
echo Bot startup completed.
pause