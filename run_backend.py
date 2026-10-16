"""
FitTrack AI - Quick Backend Launcher
File: run_backend.py

Ensures the project root is added to sys.path and launches Uvicorn safely on Windows.
"""

import sys
import os

# Safely handle UTF-8 console output on Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Automatically set project root directory in sys.path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import uvicorn

if __name__ == "__main__":
    print(f"Starting FitTrack AI Backend Server from: {PROJECT_ROOT}")
    print("Interactive API Documentation: http://127.0.0.1:8000/docs")
    print("Health Check: http://127.0.0.1:8000/api/health\n")
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
