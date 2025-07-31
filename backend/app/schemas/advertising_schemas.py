from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class AdvertisingFocus(str, Enum):
    COMPANY = "company"
    PRODUCT = "product"
    OFFER = "offer"


class AdTheme(str, Enum):
    CARTOONISH = "cartoonish"
    REALISTIC = "realistic"
    ANIME = "anime"
    SURREAL = "surreal"
    ABSTRACT = "abstract"
    MINIMALIST = "minimalist"
    VINTAGE = "vintage"
    MODERN = "modern"
    FUTURISTIC = "futuristic"


# Step 1 - Initial Product Info
class ProductInfoRequest(BaseModel):
    product_name: Optional[str] = None
    product_type: str
    company_name: str
    advertising_focus: AdvertisingFocus
    offer_details: Optional[str] = None  # Required if focus is "offer"
    business_type: Optional[str] = None
    business_location: Optional[str] = None
    target_location: Optional[str] = None
    target_demographic: Optional[str] = None
    target_age_group: Optional[str] = None


class ProductInfoResponse(BaseModel):
    session_id: str
    message: str
    next_step: str


# Step 2 - Research
class ResearchRequest(BaseModel):
    session_id: str
    company_website: Optional[HttpUrl] = None
    additional_sources: Optional[List[HttpUrl]] = None


class TrendingTheme(BaseModel):
    theme: str
    popularity_score: float
    description: str
    examples: List[str]


class ResearchSummary(BaseModel):
    product_insights: Dict[str, Any]
    trending_in_category: List[str]
    trending_themes: List[TrendingTheme]
    color_trends: List[str]
    style_recommendations: List[str]
    competitor_insights: Optional[Dict[str, Any]] = None


class ResearchResponse(BaseModel):
    session_id: str
    summary: ResearchSummary
    raw_data: Optional[Dict[str, Any]] = None


# Step 3 & 4 - Ad Ideas Generation
class AdCustomizationOptions(BaseModel):
    include_text: Optional[bool] = None
    text_content: Optional[str] = None
    preferred_theme: Optional[AdTheme] = None
    color_preferences: Optional[List[str]] = None
    style_preferences: Optional[List[str]] = None
    avoid_elements: Optional[List[str]] = None


class AdIdea(BaseModel):
    id: str
    name: str
    type: str  # "trending", "experimental", "user_preference"
    description: str
    theme: str
    key_elements: List[str]
    color_palette: List[str]
    estimated_effectiveness: float  # 0-1 score
    rationale: str


class GenerateIdeasRequest(BaseModel):
    session_id: str
    customization: AdCustomizationOptions


class GenerateIdeasResponse(BaseModel):
    session_id: str
    ideas: List[AdIdea]
    customization_questions: Optional[List[Dict[str, Any]]] = None


# Image Generation
class GenerateAdsRequest(BaseModel):
    session_id: str
    selected_idea_ids: List[str]
    variations_per_idea: int = Field(default=3, ge=1, le=5)


class GenerateAdsResponse(BaseModel):
    job_ids: List[str]
    estimated_time: int


# Ad Results
class GeneratedAd(BaseModel):
    ad_id: str
    idea_id: str
    image_url: str
    thumbnail_url: Optional[str] = None
    prompt_used: str
    performance_prediction: Optional[Dict[str, float]] = None
    created_at: datetime


class AdGenerationStatus(BaseModel):
    job_id: str
    status: str
    progress: Optional[int] = None
    result: Optional[GeneratedAd] = None
    error: Optional[str] = None
