@echo off
echo Server...
echo.
echo Opening game in your browser...
echo.
echo Press Ctrl+C to stop the server when you're done.
echo.

REM Start the server in the background
start /B python -m http.server 8000

REM Wait 2 seconds for server to start
timeout /t 2 /nobreak >nul

REM Open browser
start http://localhost:8000

REM Keep the window open
echo.
echo Game is now running in your browser!
echo Keep this window open while playing.
echo.
pause