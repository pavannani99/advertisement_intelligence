"""
Backend startup script for development
"""
import subprocess
import sys
import os
from pathlib import Path
import pkg_resources

def install_requirements():
    """
    Checks if requirements from requirements.txt are met.
    If not, it installs them.
    """
    try:
        with open('requirements.txt') as f:
            requirements = f.read().splitlines()
        
        # This will raise an exception if any requirement is not met
        pkg_resources.require(requirements)
        print("✅ All requirements are already satisfied.")
        return True
        
    except (pkg_resources.DistributionNotFound, pkg_resources.VersionConflict, FileNotFoundError):
        print("⚠️  Unmet or missing requirements found. Attempting to install...")
        try:
            subprocess.run(
                [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                check=True,
                capture_output=True, # Hides the output unless there's an error
                text=True
            )
            print("✅ Requirements installed successfully!")
            # Verify they are installed correctly now
            pkg_resources.require(requirements)
            return True
        except (subprocess.CalledProcessError, pkg_resources.DistributionNotFound, pkg_resources.VersionConflict) as install_error:
            print(f"❌ Error installing requirements: {install_error}")
            return False


def init_database():
    """
    Checks for, creates, and then runs the database initialization script.
    """
    init_script_path = Path("init_db.py")
    
    # Define the code to be written to init_db.py
    init_script_code = """
from app.core.database import engine, Base
from app.models import models

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
"""
    
    try:
        # Check if init_db.py exists, if not, create it
        if not init_script_path.exists():
            print("Database init script not found. Creating init_db.py...")
            with open(init_script_path, "w") as f:
                f.write(init_script_code.strip())
            print("init_db.py created successfully.")

        # Now, run the database initialization script
        print("Initializing database...")
        subprocess.run([sys.executable, str(init_script_path)], check=True)
        print("Database initialized successfully!")
    except (subprocess.CalledProcessError, IOError) as e:
        print(f"Error during database initialization: {e}")
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
