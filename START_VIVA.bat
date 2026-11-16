@echo off
title Smart Recruiter - Localhost Startup
echo ============================================
echo   Smart Recruiter - ALL ON LOCALHOST
echo   AI: http://localhost:8000
echo   API: http://localhost:5000
echo   UI:  http://localhost:5173
echo ============================================
echo.

echo Stopping old processes on 5173, 5000, 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
timeout /t 2 /nobreak >nul

echo Starting AI Service...
start "AI-localhost-8000" cmd /k "cd /d D:\HR_SMART_PLATFORM\UI\ai-service && start.bat"
timeout /t 6 /nobreak >nul

echo Starting Node Backend...
start "Backend-localhost-5000" cmd /k "cd /d D:\HR_SMART_PLATFORM\UI\backend && node src\server.js"
timeout /t 5 /nobreak >nul

echo Starting React UI...
start "UI-localhost-5173" cmd /k "cd /d D:\HR_SMART_PLATFORM\UI && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo Ready. Open http://localhost:5173
echo Login: admin@smartrecruiter.local / Admin@123
echo.
start http://localhost:5173
pause
