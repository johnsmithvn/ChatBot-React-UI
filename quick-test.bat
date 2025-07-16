REM Quick test script - Windows

@echo off
echo.
echo 🎯 ChatBot React - Quick Test
echo ================================
echo.

echo 🔍 Checking if Node.js is installed...
node --version > nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo 📥 Download: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed
echo.

echo 🔍 Checking if npm is available...
npm --version > nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not available
    pause
    exit /b 1
)

echo ✅ npm is available
echo.

echo 🔍 Checking package.json...
if not exist "package.json" (
    echo ❌ package.json not found. Run this from project root directory.
    pause
    exit /b 1
)

echo ✅ package.json found
echo.

echo 🚀 Starting ChatBot React...
echo.
echo 📋 What to test:
echo   1. Create new workspace
echo   2. Add chats to workspace
echo   3. Switch between workspaces
echo   4. Verify chats are isolated
echo.
echo 🌐 App will open at: http://localhost:5173
echo.

start /B npm run dev

timeout /t 3 /nobreak >nul

echo.
echo 🎯 Opening test guide...
start test-guide.html

echo.
echo 📝 Test checklist:
echo   ✅ Can create workspaces
echo   ✅ Chats belong to workspaces
echo   ✅ Switching workspaces shows different chats
echo   ✅ Groups organize chats within workspace
echo   ✅ Sidebar is resizable
echo.
echo 🔧 Press Ctrl+C to stop server
pause
