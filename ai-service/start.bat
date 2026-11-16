@echo off
cd /d "%~dp0"
call venv\Scripts\activate.bat
echo Starting Smart Recruiter AI Service on http://localhost:8000
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
