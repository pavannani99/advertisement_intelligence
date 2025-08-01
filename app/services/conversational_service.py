import google.generativeai as genai
from app.core.config import settings
from app.services import image_generation_service
from app.models import models
from sqlalchemy.orm import Session
import json

# Configure the Gemini API key
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

def get_image_generation_ideas_prompt(research_data: dict) -> str:
    """
    Creates a prompt for Gemini to generate image ideas based on research data.
    """
    context = (
        "You are an expert advertising creative director. "
        "Based on the following research data, generate 3 distinct and creative image generation prompts for an advertising campaign. "
        "The prompts should be detailed and ready to be used with an AI image generation model like DALL-E 3. "
        "Return the prompts as a JSON array of strings. For example: [\"prompt 1\", \"prompt 2\", \"prompt 3\"].\n\n"
        f"Research Data: {json.dumps(research_data, indent=2)}"
    )
    return context

def process_user_request(session_id: str, user_message: str, db: Session) -> str:
    """
    Processes the user's request, either by generating a response with Gemini
    or by generating image ideas based on research and then generating the images.
    """
    if not settings.GEMINI_API_KEY:
        return "Gemini API key is not configured."

    # Check if the user wants to generate images
    if "generate" in user_message.lower() and "image" in user_message.lower():
        session = db.query(models.Session).filter(models.Session.id == session_id).first()
        if not session or not session.trend_data:
            return "Please complete the research step first to generate images."

        try:
            research_data = json.loads(session.trend_data)
            
            # Generate image ideas with Gemini
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = get_image_generation_ideas_prompt(research_data)
            response = model.generate_content(prompt)
            
            # Clean up the response to extract the JSON
            cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
            image_ideas = json.loads(cleaned_response)

            # Generate images for each idea using the existing OpenAI service
            generated_images = []
            for idea in image_ideas:
                image_data = image_generation_service.generate_image(
                    prompt=idea,
                    style_params={"style": "professional advertisement", "mood": "engaging"}
                )
                generated_images.append(image_data['url'])

            return f"I've generated a few images based on the research. You can view them here: {', '.join(generated_images)}"

        except Exception as e:
            return f"An error occurred while generating images: {str(e)}"
    else:
        # Fallback to a standard conversational response
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(user_message)
            return response.text
        except Exception as e:
            return f"An error occurred: {str(e)}"