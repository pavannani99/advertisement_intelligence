"""
Backend startup script for development
"""
import subprocess
import sys
import os
from pathlib import Path

def install_requirements():
    """Install required packages"""
    try:
        print("Installing requirements...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("Requirements installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"Error installing requirements: {e}")
        return False
    return True

def init_database():
    """Initialize database"""
    try:
        print("Initializing database...")
        subprocess.run([sys.executable, "init_db.py"], check=True)
        print("Database initialized successfully!")
    except subprocess.CalledProcessError as e:
        print(f"Error initializing database: {e}")
        return False
    return True

def start_server():
    """Start the FastAPI server"""
    try:
        print("Starting FastAPI server...")
        print("Server will be available at: http://localhost:8000")
        print("API documentation at: http://localhost:8000/docs")
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ], check=True)
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"Error starting server: {e}")

def main():
    """Main startup sequence"""
    print("🚀 Starting AI Advertisement Intelligence Backend")
    print("=" * 50)
    
    # Check if .env file exists
    if not Path(".env").exists():
        print("❌ .env file not found. Please create it from .env.example")
        return
    
    # Install requirements
    if not install_requirements():
        return
    
    # Initialize database
    if not init_database():
        return
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()
