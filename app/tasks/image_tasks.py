from celery import Task
from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.models import models
from app.services import image_generation_service
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class DatabaseTask(Task):
    """Base task that ensures database session is properly handled"""
    _db = None

    @property
    def db(self):
        if self._db is None:
            self._db = SessionLocal()
        return self._db

    def after_return(self, status, retval, task_id, args, kwargs, einfo):
        if self._db is not None:
            self._db.close()
            self._db = None


@celery_app.task(base=DatabaseTask, bind=True, name="generate_image")
def generate_image(self, job_id: str):
    """
    Async task to generate an image using AI models.
    """
    try:
        # Update job status
        job = self.db.query(models.GenerationJob).filter(
            models.GenerationJob.id == job_id
        ).first()
        
        if not job:
            logger.error(f"Job {job_id} not found")
            return
        
        job.status = models.JobStatus.PROCESSING
        self.db.commit()
        
        # Call image generation service
        image_data = image_generation_service.generate_image(
            prompt=job.prompt_used,
            style_params={}  # Could extract from prompt or session
        )
        
        # Save generated image
        generated_image = models.GeneratedImage(
            session_id=job.session_id,
            job_id=job.id,
            image_url=image_data["url"],
            thumbnail_url=image_data.get("thumbnail_url"),
            prompt_used=job.prompt_used,
            analysis=image_data.get("analysis"),
            metadata=image_data.get("metadata", {})
        )
        self.db.add(generated_image)
        
        # Update job status
        job.status = models.JobStatus.COMPLETED
        job.completed_at = datetime.utcnow()
        self.db.commit()
        
        logger.info(f"Successfully generated image for job {job_id}")
        
    except Exception as e:
        logger.error(f"Error generating image for job {job_id}: {str(e)}")
        
        # Update job with error
        job = self.db.query(models.GenerationJob).filter(
            models.GenerationJob.id == job_id
        ).first()
        if job:
            job.status = models.JobStatus.FAILED
            job.error_message = str(e)
            job.completed_at = datetime.utcnow()
            self.db.commit()
        
        raise


@celery_app.task(base=DatabaseTask, bind=True, name="edit_image")
def edit_image(self, job_id: str, source_image_id: str, source_url: str, edit_instructions: str):
    """
    Async task to edit an existing image.
    """
    try:
        # Update job status
        job = self.db.query(models.GenerationJob).filter(
            models.GenerationJob.id == job_id
        ).first()
        
        if not job:
            logger.error(f"Job {job_id} not found")
            return
        
        job.status = models.JobStatus.PROCESSING
        self.db.commit()
        
        # Call image editing service
        edited_image_data = image_generation_service.edit_image(
            source_url=source_url,
            edit_instructions=edit_instructions
        )
        
        # Save edited image
        edited_image = models.GeneratedImage(
            session_id=job.session_id,
            job_id=job.id,
            image_url=edited_image_data["url"],
            thumbnail_url=edited_image_data.get("thumbnail_url"),
            prompt_used=job.prompt_used,
            analysis=edited_image_data.get("analysis"),
            metadata=edited_image_data.get("metadata", {}),
            parent_image_id=source_image_id,
            edit_instructions=edit_instructions
        )
        self.db.add(edited_image)
        
        # Update job status
        job.status = models.JobStatus.COMPLETED
        job.completed_at = datetime.utcnow()
        self.db.commit()
        
        logger.info(f"Successfully edited image for job {job_id}")
        
    except Exception as e:
        logger.error(f"Error editing image for job {job_id}: {str(e)}")
        
        # Update job with error
        job = self.db.query(models.GenerationJob).filter(
            models.GenerationJob.id == job_id
        ).first()
        if job:
            job.status = models.JobStatus.FAILED
            job.error_message = str(e)
            job.completed_at = datetime.utcnow()
            self.db.commit()
        
        raise
