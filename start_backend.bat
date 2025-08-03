@echo off
echo Starting AI Advertising Intelligence Backend...
echo.

cd /d "C:\Users\Pavan\Desktop\Advertisment  Intelligence\backend"

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Starting FastAPI server...
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

pause
