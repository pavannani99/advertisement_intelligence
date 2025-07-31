import httpx
import asyncio
from typing import List, Dict, Any
from datetime import datetime, timedelta
import hashlib
import json
from app.core.config import settings
from app.schemas.schemas import ClarifyingQuestion, QuestionOption
import redis
import random

# Initialize Redis client for caching
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


async def fetch_google_trends(keywords: List[str]) -> Dict[str, Any]:
    """Fetch trend data from Google Trends API (mock implementation)"""
    # In production, you would use the actual Google Trends API
    # For now, we'll simulate trend data
    trends = {}
    for keyword in keywords:
        trends[keyword] = {
            "interest": random.randint(40, 100),
            "related_topics": [
                f"modern {keyword}",
                f"vintage {keyword}",
                f"minimalist {keyword}",
                f"abstract {keyword}"
            ],
            "rising_queries": [
                f"{keyword} 2024 style",
                f"{keyword} aesthetic",
                f"{keyword} art trends"
            ]
        }
    return trends


async def fetch_social_media_trends(keywords: List[str]) -> Dict[str, Any]:
    """Fetch trend data from social media APIs (mock implementation)"""
    # In production, integrate with Twitter/X API, Instagram API, etc.
    social_trends = {}
    for keyword in keywords:
        social_trends[keyword] = {
            "hashtags": [
                f"#{keyword}art",
                f"#{keyword}design",
                f"#{keyword}2024"
            ],
            "engagement_score": random.randint(1000, 50000),
            "trending_styles": [
                "cyberpunk",
                "neo-classical",
                "surrealist",
                "photorealistic"
            ]
        }
    return social_trends


def fetch_trend_data(keywords: List[str]) -> Dict[str, Any]:
    """
    Fetch trend data from multiple sources with caching.
    """
    # Create cache key from keywords
    cache_key = f"trends:{hashlib.md5(':'.join(sorted(keywords)).encode()).hexdigest()}"
    
    # Check cache first
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return json.loads(cached_data)
    
    # Fetch from multiple sources asynchronously
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    google_trends_task = loop.create_task(fetch_google_trends(keywords))
    social_trends_task = loop.create_task(fetch_social_media_trends(keywords))
    
    google_trends = loop.run_until_complete(google_trends_task)
    social_trends = loop.run_until_complete(social_trends_task)
    
    # Combine trend data
    trend_data = {
        "google_trends": google_trends,
        "social_media": social_trends,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Cache the results
    redis_client.setex(
        cache_key,
        settings.CACHE_TTL,
        json.dumps(trend_data)
    )
    
    return trend_data


def generate_clarifying_questions(trend_data: Dict[str, Any]) -> List[ClarifyingQuestion]:
    """
    Generate clarifying questions based on trend data.
    """
    questions = []
    
    # Extract trending styles from the data
    all_styles = set()
    for keyword_data in trend_data.get("social_media", {}).values():
        all_styles.update(keyword_data.get("trending_styles", []))
    
    # Question 1: Art Style
    style_options = [
        QuestionOption(
            id=f"style_{i}",
            label=style.title(),
            value=style,
            trend_score=random.uniform(0.7, 1.0)  # Simulated trend score
        )
        for i, style in enumerate(list(all_styles)[:6])
    ]
    
    questions.append(ClarifyingQuestion(
        id="q1",
        question="What artistic style do you prefer?",
        field_name="style",
        options=style_options,
        required=True,
        default_value=style_options[0].value if style_options else "modern"
    ))
    
    # Question 2: Color Palette
    color_palettes = [
        ("vibrant", "Vibrant & Bold"),
        ("pastel", "Soft Pastels"),
        ("monochrome", "Black & White"),
        ("earth", "Earth Tones"),
        ("neon", "Neon Colors"),
        ("metallic", "Gold & Silver")
    ]
    
    color_options = [
        QuestionOption(
            id=f"color_{i}",
            label=label,
            value=value,
            trend_score=random.uniform(0.6, 1.0)
        )
        for i, (value, label) in enumerate(color_palettes)
    ]
    
    questions.append(ClarifyingQuestion(
        id="q2",
        question="Which color palette appeals to you?",
        field_name="color_palette",
        options=color_options,
        required=True,
        default_value="vibrant"
    ))
    
    # Question 3: Mood/Atmosphere
    moods = [
        ("epic", "Epic & Grand"),
        ("mysterious", "Dark & Mysterious"),
        ("whimsical", "Fun & Whimsical"),
        ("serene", "Calm & Peaceful"),
        ("dramatic", "Bold & Dramatic"),
        ("ethereal", "Dreamy & Ethereal")
    ]
    
    mood_options = [
        QuestionOption(
            id=f"mood_{i}",
            label=label,
            value=value,
            trend_score=random.uniform(0.5, 1.0)
        )
        for i, (value, label) in enumerate(moods)
    ]
    
    questions.append(ClarifyingQuestion(
        id="q3",
        question="What mood should the image convey?",
        field_name="mood",
        options=mood_options,
        required=False,
        default_value="epic"
    ))
    
    # Question 4: Level of Detail
    detail_options = [
        QuestionOption(id="detail_1", label="Minimalist", value="minimalist", trend_score=0.8),
        QuestionOption(id="detail_2", label="Moderate Detail", value="moderate", trend_score=0.7),
        QuestionOption(id="detail_3", label="Highly Detailed", value="detailed", trend_score=0.9),
        QuestionOption(id="detail_4", label="Ultra Realistic", value="photorealistic", trend_score=0.85)
    ]
    
    questions.append(ClarifyingQuestion(
        id="q4",
        question="How detailed should the image be?",
        field_name="detail_level",
        options=detail_options,
        required=False,
        default_value="detailed"
    ))
    
    return questions


def generate_final_prompts(
    initial_prompt: str,
    keywords: List[str],
    user_preferences: Dict[str, str],
    trend_data: Dict[str, Any]
) -> List[Dict[str, str]]:
    """
    Generate final prompts for image generation based on user input and trends.
    Returns multiple prompt variations including trend-based alternatives.
    """
    prompts = []
    
    # Extract user preferences
    style = user_preferences.get("style", "modern")
    color_palette = user_preferences.get("color_palette", "vibrant")
    mood = user_preferences.get("mood", "epic")
    detail_level = user_preferences.get("detail_level", "detailed")
    
    # Base prompt with user preferences
    base_prompt = f"{initial_prompt}, {style} art style, {color_palette} colors, {mood} atmosphere"
    
    if detail_level == "photorealistic":
        base_prompt += ", photorealistic, 8k resolution, highly detailed"
    elif detail_level == "detailed":
        base_prompt += ", intricate details, high quality"
    elif detail_level == "minimalist":
        base_prompt += ", minimalist design, clean lines"
    
    # Main user-selected prompt
    prompts.append({
        "id": "main",
        "name": "Your Vision",
        "description": "Based on your preferences",
        "prompt": base_prompt,
        "is_trending": False
    })
    
    # Generate trending alternative based on highest engagement
    trending_styles = []
    for keyword_data in trend_data.get("social_media", {}).values():
        trending_styles.extend(keyword_data.get("trending_styles", []))
    
    if trending_styles:
        # Pick the most different trending style from user's choice
        trending_style = random.choice([s for s in trending_styles if s != style] or trending_styles)
        trending_prompt = f"{initial_prompt}, {trending_style} art style, trending on artstation"
        
        prompts.append({
            "id": "trending",
            "name": "Trending Alternative",
            "description": f"Popular {trending_style} style based on current trends",
            "prompt": trending_prompt,
            "is_trending": True
        })
    
    # Add a creative variation
    creative_modifiers = [
        "with dramatic lighting",
        "in a surreal setting",
        "with fantasy elements",
        "in a futuristic environment",
        "with artistic flair"
    ]
    
    creative_prompt = f"{base_prompt}, {random.choice(creative_modifiers)}"
    prompts.append({
        "id": "creative",
        "name": "Creative Twist",
        "description": "An artistic interpretation of your idea",
        "prompt": creative_prompt,
        "is_trending": False
    })
    
    return prompts
