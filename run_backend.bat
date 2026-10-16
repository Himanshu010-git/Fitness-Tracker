@echo off
cd /d "%~dp0"
echo ========================================================
echo   Starting FitTrack AI FastAPI Backend
echo   Swagger Docs: http://127.0.0.1:8000/docs
echo ========================================================
python run_backend.py
pause
