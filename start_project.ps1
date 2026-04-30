# start_project.ps1
Write-Host "Starting infrastructure via Docker Compose..."
docker compose up -d postgres mongodb mosquitto

Write-Host "Starting Backend API in a new window..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\activate; uvicorn main:app --reload --port 8000"

Write-Host "Starting IoT Simulator in a new window..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd iot-simulator; .\venv\Scripts\activate; python simulator.py"

Write-Host "Starting Frontend Dashboard in a new window..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Done! Services are spinning up in separate windows."
