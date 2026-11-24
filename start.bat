@echo off
REM ============================================================
REM  Shubha Muhurta Studio - one-click launcher (Windows)
REM  Double-click this file to start the backend + frontend.
REM ============================================================
setlocal
cd /d "%~dp0"
title Shubha Muhurta Studio - Launcher

echo(
echo   Shubha Muhurta Studio
echo   Universal Invitation ^& Greeting Card Designer
echo   --------------------------------------------------
echo(

REM ---- 1. Backend: create venv + install deps on first run ----
if not exist "backend\.venv\Scripts\python.exe" (
    echo [setup] Creating Python virtual environment ...
    where py >nul 2>nul
    if errorlevel 1 (
        echo [ERROR] Python launcher "py" not found. Install Python 3.12+ from https://python.org and re-run.
        pause
        exit /b 1
    )
    py -m venv "backend\.venv"
    echo [setup] Installing backend dependencies ...
    "backend\.venv\Scripts\python.exe" -m pip install --upgrade pip
    "backend\.venv\Scripts\python.exe" -m pip install -r "backend\requirements.txt"
)

REM ---- 2. Frontend: install node modules on first run ----
if not exist "frontend\node_modules" (
    echo [setup] Installing frontend dependencies ^(npm install^) ...
    where npm >nul 2>nul
    if errorlevel 1 (
        echo [ERROR] npm not found. Install Node.js 20+ from https://nodejs.org and re-run.
        pause
        exit /b 1
    )
    pushd frontend
    call npm install
    popd
)

REM ---- 3. Start the backend API ( http://127.0.0.1:8000 ) ----
echo [run] Starting backend on http://127.0.0.1:8000 ...
start "Shubha Muhurta - Backend" /d "%~dp0backend" cmd /k ".venv\Scripts\python.exe -m uvicorn app.main:app --port 8000"

REM ---- 4. Start the frontend ( http://localhost:5173 ) ----
echo [run] Starting frontend on http://localhost:5173 ...
start "Shubha Muhurta - Frontend" /d "%~dp0frontend" cmd /k "npm run dev"

REM ---- 5. Open the app in the default browser ----
echo [run] Opening the app in your browser ...
timeout /t 6 /nobreak >nul
start "" http://localhost:5173

echo(
echo   The app is starting in two new windows:
echo     - Backend  : http://127.0.0.1:8000  (API docs: /docs)
echo     - Frontend : http://localhost:5173
echo(
echo   Close those two windows to stop the server.
echo(
pause
endlocal
