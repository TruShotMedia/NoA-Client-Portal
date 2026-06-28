@echo off
setlocal
cd /d "%~dp0"
set npm_config_cache=%~dp0.npm-cache

echo.
echo Starting NoA Client Portal...
echo.

if not exist node_modules (
  echo Installing local app packages. This can take a minute the first time.
  call npm install
  if errorlevel 1 (
    echo.
    echo Package install failed. Please check Node.js is installed, then try again.
    pause
    exit /b 1
  )
)

echo.
echo Open this in your browser if it does not open automatically:
echo http://localhost:5188
echo.

call npm run dev -- --host 127.0.0.1 --port 5188 --strictPort
pause
