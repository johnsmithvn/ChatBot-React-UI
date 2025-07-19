@echo off
REM Test script for ChatBot React App - Windows

echo 🚀 Starting ChatBot React App...
echo 📁 Current directory: %CD%
echo.

echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully
echo.

echo 🔧 Building project...
call npm run build
if errorlevel 1 (
    echo ❌ Failed to build project
    pause
    exit /b 1
)
echo ✅ Project built successfully
echo.

echo 🚀 Starting development server...
echo 🌐 Server will be available at: http://localhost:5173
echo 📱 Mobile preview at: http://localhost:5173 (accessible from network)
echo.
echo 💡 Features available:
echo   - 🏢 Workspace management
echo   - 📁 Groups with expand/collapse
echo   - 💬 Chats organized by groups
echo   - 🎯 Message actions (regenerate, edit, branch, delete, bookmark)
echo   - 📋 Prompt templates with variables
echo   - 🎨 Resizable sidebar (250px-600px)
echo   - 📱 Mobile responsive design
echo.
echo 🔧 Press Ctrl+C to stop the server
echo.

call npm run dev
