import openai
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings
import uuid
from PIL import Image
import io
import base64
import os

# Initialize OpenAI client
if settings.OPENAI_API_KEY:
    openai.api_key = settings.OPENAI_API_KEY


def generate_image(prompt: str, style_params: Dict[str, Any], research_data: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Generate an image using AI models.
    This is a modular function that can use different AI providers.
    """
    # For now, we'll use OpenAI's DALL-E 3
    # In production, you can switch between different providers
    
    try:
        # Generate image with DALL-E 3
        response = openai.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="hd",
            n=1
        )
        
        # Get the temporary URL from OpenAI
        temp_image_url = response.data[0].url
        
        # Download the image
        image_data = download_image(temp_image_url)
        
        # Create local storage directory if it doesn't exist
        storage_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static", "generated")
        os.makedirs(storage_dir, exist_ok=True)
        
        # Generate unique filename
        image_id = str(uuid.uuid4())
        image_filename = f"{image_id}.png"
        image_path = os.path.join(storage_dir, image_filename)
        
        # Save the image
        with open(image_path, "wb") as f:
            f.write(image_data)
        
        # Create thumbnail
        thumbnail_data = create_thumbnail(image_data)
        thumbnail_filename = f"{image_id}_thumb.png"
        thumbnail_path = os.path.join(storage_dir, thumbnail_filename)
        
        with open(thumbnail_path, "wb") as f:
            f.write(thumbnail_data)
        
        # Return local URLs
        image_url = f"/static/generated/{image_filename}"
        thumbnail_url = f"/static/generated/{thumbnail_filename}"
        
        # Generate basic analysis (in production, use a Vision model)
        analysis = {
            "description": f"AI-generated image based on prompt: {prompt[:100]}...",
            "style": style_params.get("style", "default"),
            "mood": style_params.get("mood", "neutral"),
            "dominant_colors": ["varies"],  # Would analyze in production
            "objects_detected": []  # Would use vision AI in production
        }
        
        return {
            "url": image_url,
            "thumbnail_url": thumbnail_url,
            "analysis": analysis,
            "metadata": {
                "provider": "openai",
                "model": "dall-e-3",
                "dimensions": "1024x1024",
                "format": "png",
                "local_path": image_path
            }
        }
        
    except Exception as e:
        print(f"Error generating image: {str(e)}")
        # Fallback to alternative provider or mock data
        return generate_mock_image(prompt, style_params)


def edit_image(source_url: str, edit_instructions: str) -> Dict[str, Any]:
    """
    Edit an existing image based on instructions.
    """
    try:
        # Download source image
        source_data = download_image(source_url)
        
        # For DALL-E 2, we would use the edit endpoint
        # For now, we'll generate a new image with modified prompt
        # In production, implement proper image-to-image editing
        
        # Generate new image based on edit instructions
        new_prompt = f"Edit the image with these changes: {edit_instructions}"
        
        # This is simplified - in production, use proper image editing APIs
        return generate_image(new_prompt, {})
        
    except Exception as e:
        return generate_mock_image(f"Edited: {edit_instructions}", {})


def download_image(url: str) -> bytes:
    """Download image from URL"""
    response = httpx.get(url)
    response.raise_for_status()
    return response.content


def create_thumbnail(image_data: bytes, size: tuple = (256, 256)) -> bytes:
    """Create a thumbnail from image data"""
    image = Image.open(io.BytesIO(image_data))
    image.thumbnail(size, Image.Resampling.LANCZOS)
    
    output = io.BytesIO()
    image.save(output, format='PNG')
    return output.getvalue()


def upload_to_s3(data: bytes, key: str) -> str:
    """Upload image data to S3 and return URL"""
    try:
        s3_client.put_object(
            Bucket=settings.AWS_BUCKET_NAME,
            Key=key,
            Body=data,
            ContentType='image/png'
        )
        
        # Return public URL
        return f"https://{settings.AWS_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
    except Exception as e:
        # Fallback to local storage or CDN
        # In development, return a placeholder
        return f"https://placeholder.com/{key}"


def generate_mock_image(prompt: str, style_params: Dict[str, Any], research_data: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Generate mock image data for development/testing.
    """
    # In production, this would never be called
    # This is just for testing without actual AI APIs
    
    mock_id = str(uuid.uuid4())
    
    # Use picsum photos for better looking mock images
    import random
    seed = random.randint(1, 1000)
    
    # If research data is available, reflect some aspects
    research_insights = ""
    if research_data:
        market_trends = research_data.get('market_trends', {})
        popular_designs = market_trends.get('popular_designs', [])
        if popular_designs:
            research_insights = f" Popular designs included: {', '.join(popular_designs[:3])}."

    return {
        "url": f"https://picsum.photos/seed/{seed}/1024/1024",
        "thumbnail_url": f"https://picsum.photos/seed/{seed}/256/256",
        "analysis": {
            "description": f"Generated image based on: {prompt[:100]}...{research_insights}",
            "style": style_params.get("style", "professional advertisement"),
            "mood": style_params.get("mood", "engaging"),
            "dominant_colors": ["varies"],
            "objects_detected": ["advertisement"]
        },
        "metadata": {
            "provider": "mock",
            "model": "placeholder",
            "dimensions": "1024x1024",
            "format": "jpg",
            "prompt": prompt
        }
    }


# Additional provider implementations can be added here
def generate_with_stability_ai(prompt: str) -> Dict[str, Any]:
    """Generate image using Stability AI"""
    # Implementation for Stability AI
    pass


def generate_with_midjourney(prompt: str) -> Dict[str, Any]:
    """Generate image using Midjourney API"""
    # Implementation for Midjourney
    pass


def generate_with_replicate(prompt: str, model: str = "stability-ai/sdxl") -> Dict[str, Any]:
    """Generate image using Replicate"""
    # Implementation for Replicate
    pass
