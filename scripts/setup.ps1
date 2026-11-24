# Shubha Muhurta - one-time setup for Windows (PowerShell).
# Creates the Python venv, installs backend + frontend dependencies.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "== Setting up backend (Python venv) ==" -ForegroundColor Magenta
Push-Location "$root\backend"
if (-not (Test-Path ".venv")) { py -m venv .venv }
& ".\.venv\Scripts\python.exe" -m pip install --upgrade pip
& ".\.venv\Scripts\python.exe" -m pip install -r requirements.txt
Pop-Location

Write-Host "== Setting up frontend (npm) ==" -ForegroundColor Magenta
Push-Location "$root\frontend"
npm install
Pop-Location

Write-Host "Setup complete. Run scripts\start-dev.ps1 to launch the app." -ForegroundColor Green
