# Advertisement Intelligence - Run Commands Guide

## Initial Setup

### Backend Setup (Windows)

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**
   ```bash
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1
   
   # Windows Command Prompt
   venv\Scripts\activate.bat
   ```

4. **Install dependencies**
   ```bash
   # Install essential packages only (recommended for quick start)
   pip install -r requirements_essential.txt
   
   # OR install all packages including optional ones
   pip install -r requirements.txt
   ```

5. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   # Required
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Optional (for advanced features)
   GOOGLE_API_KEY=your_google_api_key_here
   GOOGLE_CSE_ID=your_google_cse_id_here
   SERPER_API_KEY=your_serper_api_key_here
   TAVILY_API_KEY=your_tavily_api_key_here
   STABILITY_API_KEY=your_stability_api_key_here
   REPLICATE_API_TOKEN=your_replicate_token_here
   ```

6. **Initialize database**
   ```bash
   python -c "from app.core.database import engine; from app.models.models import Base; Base.metadata.create_all(bind=engine)"
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Running the Application

### Start Backend Server

1. **Navigate to backend directory and activate virtual environment**
   ```bash
   cd backend
   .\venv\Scripts\Activate.ps1  # PowerShell
   ```

2. **Run the FastAPI server**
   ```bash
   # Development mode with auto-reload
   python start_backend.py
   
   # OR using uvicorn directly
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   The backend will be available at: http://localhost:8000
   API documentation at: http://localhost:8000/docs

### Start Frontend Development Server

1. **In a new terminal, navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Start the React development server**
   ```bash
   npm start
   ```

   The frontend will be available at: http://localhost:3000

### Start Celery Worker (Optional - for background tasks)

1. **In a new terminal, navigate to backend directory and activate venv**
   ```bash
   cd backend
   .\venv\Scripts\Activate.ps1  # PowerShell
   ```

2. **Start Celery worker**
   ```bash
   celery -A app.core.celery_app worker --loglevel=info --pool=solo
   ```

## Common Development Commands

### Backend Commands

**Run tests**
```bash
pytest
```

**Format code**
```bash
black app/
```

**Lint code**
```bash
flake8 app/
```

**Database migrations with Alembic**
```bash
# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

### Frontend Commands

**Build for production**
```bash
npm run build
```

**Run tests**
```bash
npm test
```

**Run linter**
```bash
npm run lint
```

## Production Deployment

### Backend Production

```bash
# Use production server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend Production

```bash
# Build optimized production bundle
npm run build

# Serve using a static file server
npx serve -s build -l 3000
```

## Troubleshooting Commands

**Check Python version**
```bash
python --version  # Should be 3.8 or higher
```

**Check if all dependencies are installed**
```bash
pip list
```

**Check Node version**
```bash
node --version  # Should be 14.x or higher
npm --version
```

**Clear Python cache**
```bash
find . -type d -name __pycache__ -exec rm -r {} +  # Linux/Mac
Get-ChildItem -Path . -Recurse -Directory -Filter "__pycache__" | Remove-Item -Recurse -Force  # Windows PowerShell
```

**Reset database**
```bash
# Delete the database file
rm app_data.db  # Linux/Mac
Remove-Item app_data.db  # Windows PowerShell

# Recreate tables
python -c "from app.core.database import engine; from app.models.models import Base; Base.metadata.create_all(bind=engine)"
```

## Quick Start (All in One)

For a quick start, run these commands in order:

```bash
# Terminal 1 - Backend
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements_essential.txt
python start_backend.py

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

Then open http://localhost:3000 in your browser!
