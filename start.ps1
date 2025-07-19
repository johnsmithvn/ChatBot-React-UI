# PowerShell script for ChatBot React App

Write-Host "🚀 Starting ChatBot React App..." -ForegroundColor Green
Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

Write-Host "🔧 Building project..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Project built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to build project" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

Write-Host "🚀 Starting development server..." -ForegroundColor Green
Write-Host "🌐 Server will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "📱 Mobile preview at: http://localhost:5173 (accessible from network)" -ForegroundColor Cyan
Write-Host ""

Write-Host "💡 Features available:" -ForegroundColor Magenta
Write-Host "   - 🏢 Workspace management" -ForegroundColor White
Write-Host "   - 📁 Groups with expand/collapse" -ForegroundColor White
Write-Host "   - 💬 Chats organized by groups" -ForegroundColor White
Write-Host "   - 🎯 Message actions (regenerate, edit, branch, delete, bookmark)" -ForegroundColor White
Write-Host "   - 📋 Prompt templates with variables" -ForegroundColor White
Write-Host "   - 🎨 Resizable sidebar (250px-600px)" -ForegroundColor White
Write-Host "   - 📱 Mobile responsive design" -ForegroundColor White
Write-Host ""

Write-Host "🔧 Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev
