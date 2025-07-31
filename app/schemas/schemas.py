from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class JobStatusEnum(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# Phase 1 - Initial Prompt
class PromptStartRequest(BaseModel):
    text: str = Field(..., min_length=3, max_length=500)


class QuestionOption(BaseModel):
    id: str
    label: str
    value: str
    trend_score: Optional[float] = None


class ClarifyingQuestion(BaseModel):
    id: str
    question: str
    field_name: str
    options: List[QuestionOption]
    required: bool = True
    default_value: Optional[str] = None


class PromptStartResponse(BaseModel):
    session_id: str
    extracted_keywords: List[str]
    questions: List[ClarifyingQuestion]


# Phase 2 - Refining
class PromptRefineRequest(BaseModel):
    session_id: str
    answers: Dict[str, str]


class PromptRefineResponse(BaseModel):
    session_id: str
    needs_more_info: bool
    questions: Optional[List[ClarifyingQuestion]] = None
    ready_for_generation: bool = False


# Phase 3 - Generation
class GenerationOption(BaseModel):
    id: str
    name: str
    description: str
    prompt: str
    is_trending: bool = False


class ImageGenerateRequest(BaseModel):
    session_id: str
    selected_options: List[str]


class ImageGenerateResponse(BaseModel):
    job_ids: List[str]
    estimated_time: int  # seconds


# Phase 4 - Status Check
class ImageStatusResponse(BaseModel):
    job_id: str
    status: JobStatusEnum
    progress: Optional[int] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class GeneratedImageData(BaseModel):
    image_id: str
    image_url: str
    thumbnail_url: Optional[str] = None
    prompt_used: str
    analysis: Optional[Dict[str, Any]] = None
    created_at: datetime


# Phase 5 - Edit
class ImageEditRequest(BaseModel):
    source_image_id: str
    edit_instructions: str


class ImageEditResponse(BaseModel):
    job_id: str
    estimated_time: int


# Final Selection
class ImageFinalizeRequest(BaseModel):
    image_id: str


class ImageFinalizeResponse(BaseModel):
    success: bool
    image_id: str
    download_url: str


# Session Summary
class SessionSummaryResponse(BaseModel):
    session_id: str
    initial_prompt: str
    final_prompt: Optional[str] = None
    total_images_generated: int
    images: List[GeneratedImageData]
    created_at: datetime
    updated_at: Optional[datetime] = None
