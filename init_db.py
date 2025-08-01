import logging
from app.core.database import engine, Base
from app.models import models  # Ensure all models are imported

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    logger.info("Creating database tables...")
    # This line creates the tables based on all classes that inherit from Base
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully.")

if __name__ == "__main__":
    try:
        init_db()
    except Exception as e:
        logger.error(f"An error occurred during database initialization: {e}")
        # Reraise the exception to ensure the calling script knows there was an error
        raise