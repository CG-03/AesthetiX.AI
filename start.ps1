Write-Host "Starting VastuVision AI Multi-Service Environment..." -ForegroundColor Green

# 1. Start Python Microservice
Write-Host "Starting YOLO11-seg Microservice (port 8000) in new window..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend/python; if (!(Test-Path venv)) { python -m venv venv }; .\venv\Scripts\activate; pip install -r requirements.txt; uvicorn main:app --port 8000 --reload"

# 2. Start Node.js Backend
Write-Host "Starting Express Backend (port 5000) in new window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# 3. Start React Frontend
Write-Host "Starting React Frontend (port 5173) in new window..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "All services started!" -ForegroundColor Green
