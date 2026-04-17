# Start VastuVision AI - Triple Terminal Launcher
Write-Host "🚀 Launching VastuVision AI Suite..." -ForegroundColor Cyan

# 1. Backend Server
# Note: Using 'title' command which works in most Windows PowerShell/CMD environments
Start-Process powershell -ArgumentList "-NoExit", "-Command", "title 'VastuVision Backend'; Write-Host '--- 🛠️ BACKEND SERVER ---' -ForegroundColor Yellow; cd backend; npm run dev"

# 2. Frontend Application
Start-Process powershell -ArgumentList "-NoExit", "-Command", "title 'VastuVision Frontend'; Write-Host '--- 🎨 FRONTEND APP ---' -ForegroundColor Green; cd frontend; npm run dev"

Write-Host "✅ Core services launched (Backend & Frontend). Check individual windows for logs." -ForegroundColor Green
