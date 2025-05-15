@echo off
echo =======================================
echo RAG-based Chatbot Server Startup
echo =======================================
echo.

:: Check if .env file exists and has an API key
if not exist .env (
  echo ERROR: .env file not found.
  echo Please run setup.bat first to create the .env file.
  echo.
  pause
  exit /b 1
)

:: Check if node_modules exists
if not exist node_modules (
  echo Installing dependencies...
  npm install
  if errorlevel 1 (
    echo.
    echo ERROR: Failed to install dependencies.
    echo Please try running 'npm install' manually.
    echo.
    pause
    exit /b 1
  )
)

echo Starting the server with increased memory...
echo.
echo Press Ctrl+C to stop the server.
echo.
echo If the server starts successfully, you can access it at:
echo http://localhost:5000
echo.

:: Start the server with increased memory limit
node --max-old-space-size=4096 server.js

:: This will only execute if the server stops
echo.
echo Server has stopped.
pause 