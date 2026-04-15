# Start VastuVision AI - Triple Terminal Launcher
Write-Host "🚀 Launching VastuVision AI Suite..." -ForegroundColor Cyan

# 1. Backend Server
# Note: Using 'title' command which works in most Windows PowerShell/CMD environments
Start-Process powershell -ArgumentList "-NoExit", "-Command", "title 'VastuVision Backend'; Write-Host '--- 🛠️ BACKEND SERVER ---' -ForegroundColor Yellow; cd backend; npm run dev"

# 2. Frontend Application
Start-Process powershell -ArgumentList "-NoExit", "-Command", "title 'VastuVision Frontend'; Write-Host '--- 🎨 FRONTEND APP ---' -ForegroundColor Green; cd frontend; npm run dev"

# 3. Python AI Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "title 'VastuVision Python Service'; Write-Host '--- 🤖 PYTHON AI SERVICE ---' -ForegroundColor Blue; cd backend/python; if (!(Test-Path venv)) { Write-Host 'Creating Virtual Env...' -ForegroundColor Gray; python -m venv venv; .\venv\Scripts\pip install -r requirements.txt }; .\venv\Scripts\python -m uvicorn main:app --port 8000 --reload"

Write-Host "✅ All terminals launched. Check individual windows for logs." -ForegroundColor Green
