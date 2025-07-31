from sqlalchemy import Column, String, Text, DateTime, JSON, ForeignKey, Enum, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum
import uuid
import json


class JobStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    initial_prompt = Column(Text, nullable=False)
    extracted_keywords = Column(Text)  # Store as JSON string for SQLite compatibility
    trend_data = Column(Text)  # Store as JSON string for SQLite compatibility
    refined_prompt = Column(Text)  # Store as JSON string for SQLite compatibility
    final_prompts = Column(Text)  # Store as JSON string for SQLite compatibility
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    @property
    def extracted_keywords_json(self):
        return json.loads(self.extracted_keywords) if self.extracted_keywords else []
    
    @extracted_keywords_json.setter
    def extracted_keywords_json(self, value):
        self.extracted_keywords = json.dumps(value) if value else None
    
    @property
    def trend_data_json(self):
        return json.loads(self.trend_data) if self.trend_data else {}
    
    @trend_data_json.setter
    def trend_data_json(self, value):
        self.trend_data = json.dumps(value) if value else None
    
    @property
    def refined_prompt_json(self):
        return json.loads(self.refined_prompt) if self.refined_prompt else {}
    
    @refined_prompt_json.setter
    def refined_prompt_json(self, value):
        self.refined_prompt = json.dumps(value) if value else None
    
    @property
    def final_prompts_json(self):
        return json.loads(self.final_prompts) if self.final_prompts else []
    
    @final_prompts_json.setter
    def final_prompts_json(self, value):
        self.final_prompts = json.dumps(value) if value else None
    
    # Relationships
    generation_jobs = relationship("GenerationJob", back_populates="session")
    images = relationship("GeneratedImage", back_populates="session")


class GenerationJob(Base):
    __tablename__ = "generation_jobs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("sessions.id"))
    status = Column(Enum(JobStatus), default=JobStatus.PENDING)
    prompt_used = Column(Text)
    error_message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    session = relationship("Session", back_populates="generation_jobs")
    images = relationship("GeneratedImage", back_populates="job")


class GeneratedImage(Base):
    __tablename__ = "generated_images"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("sessions.id"))
    job_id = Column(String, ForeignKey("generation_jobs.id"))
    image_url = Column(String, nullable=False)
    thumbnail_url = Column(String)
    prompt_used = Column(Text)
    analysis = Column(JSON)  # AI-generated analysis of the image
    image_metadata = Column(JSON)  # Additional metadata (dimensions, format, etc.)
    is_final = Column(String, default="false")
    parent_image_id = Column(String, ForeignKey("generated_images.id"))  # For edited versions
    edit_instructions = Column(Text)  # Instructions used for editing
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    session = relationship("Session", back_populates="images")
    job = relationship("GenerationJob", back_populates="images")
    edits = relationship("GeneratedImage", backref="parent_image", remote_side=[id])


class TrendCache(Base):
    __tablename__ = "trend_cache"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    cache_key = Column(String, unique=True, index=True)
    data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))
