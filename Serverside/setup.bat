@echo off
echo =======================================
echo RAG-based Chatbot Server Setup
echo =======================================
echo.

:: Check if .env file exists
if exist .env (
  echo .env file already exists.
) else (
  echo Creating .env file...
  echo GEMINI_API_KEY=your_gemini_api_key_here > .env
  echo PORT=5000 >> .env
  echo .env file created. Please edit it with your actual Gemini API key.
)

echo.
echo IMPORTANT: You must edit the .env file and add your Gemini API key.
echo Without a valid API key, the server will not start.
echo.
echo Get your Gemini API key from: https://makersuite.google.com/app/apikey
echo.
echo Next steps:
echo 1. Edit the .env file and replace "your_gemini_api_key_here" with your actual key
echo 2. Run "npm install" to install dependencies
echo 3. Run "node server.js" to start the server
echo.
echo After the server is running, you can access the app at:
echo http://localhost:5000
echo.
pause 