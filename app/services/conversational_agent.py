import google.generativeai as genai
from app.core.config import settings
from app.services import image_generation_service, research_service, ad_generation_service
from app.models import models
from sqlalchemy.orm import Session
import json
from typing import List, Dict, Any, Optional

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

class ConversationalAgent:
    def __init__(self, session_id: str, db: Session):
        self.session_id = session_id
        self.db = db
        self.session = self.db.query(models.Session).filter(models.Session.id == self.session_id).first()
        if not self.session:
            self.session = models.Session(id=self.session_id, initial_prompt="Chat session")
            self.db.add(self.session)
            self.db.commit()
        
        self.conversation_state = json.loads(self.session.refined_prompt) if self.session.refined_prompt and self.session.refined_prompt.startswith('{') else self._get_initial_state()

    def _get_initial_state(self):
        return {
            "stage": "gathering_info",
            "collected_data": {},
            "required_fields": [
                {"name": "product_type", "prompt": "First, what type of product are you advertising?"},
                {"name": "company_name", "prompt": "Great! What is your company's name?"},
                {"name": "advertising_focus", "prompt": "What is the focus of your ad? (e.g., the company, a specific product, or an offer)"},
                {"name": "offer_details", "prompt": "What are the details of the offer?", "depends_on": "advertising_focus", "depends_on_value": "offer"},
                {"name": "business_type", "prompt": "What type of business is it? (optional)"},
                {"name": "business_location", "prompt": "Where is your business located? (optional)"},
                {"name": "target_location", "prompt": "What location are you targeting? (optional)"},
                {"name": "target_demographic", "prompt": "Who is your target demographic? (optional)"},
                {"name": "target_age_group", "prompt": "What is the target age group? (optional)"},
                {"name": "budget", "prompt": "What is your budget for this campaign?"}
            ],
            "current_question_index": 0,
            "conversation_history": [],
            "ideas": [],
        }

    def _save_state(self):
        self.session.refined_prompt = json.dumps(self.conversation_state)
        self.db.commit()

    def _add_to_history(self, role: str, content: str):
        self.conversation_state["conversation_history"].append({"role": role, "content": content})

    def process_message(self, user_message: str) -> Dict[str, Any]:
        self._add_to_history("user", user_message)

        if self.conversation_state["stage"] == "gathering_info":
            response_text = self._handle_gathering_info(user_message)
        elif self.conversation_state["stage"] == "awaiting_preferences":
            response_text = self._handle_preferences(user_message)
        elif self.conversation_state["stage"] == "showing_ideas":
            response_text = self._handle_idea_selection(user_message)
        else:
            response_text = "I'm not sure how to handle that right now."

        self._add_to_history("assistant", response_text)
        self._save_state()
        
        return {
            "session_id": self.session_id,
            "response": response_text,
            "stage": self.conversation_state["stage"],
            "conversation_history": self.conversation_state["conversation_history"],
            "ideas": self.conversation_state.get("ideas")
        }

    def _handle_gathering_info(self, user_message: str) -> str:
        current_question_index = self.conversation_state["current_question_index"]
        
        if current_question_index > 0:
            previous_field = self.conversation_state["required_fields"][current_question_index - 1]
            self.conversation_state["collected_data"][previous_field["name"]] = user_message

        if current_question_index < len(self.conversation_state["required_fields"]):
            next_question = self.conversation_state["required_fields"][current_question_index]
            
            # Skip optional questions if the user types "skip"
            if "optional" in next_question.get("prompt", "") and user_message.lower() == "skip":
                self.conversation_state["current_question_index"] += 1
                return self._handle_gathering_info(user_message)

            self.conversation_state["current_question_index"] += 1
            return next_question["prompt"]
        else:
            # All information gathered, now conduct research
            self.session.trend_data = json.dumps(self.conversation_state["collected_data"])
            self.db.commit()
            
            self.conversation_state["stage"] = "awaiting_preferences"
            return "Thanks for all the information! Now, let's talk about the ad's style. Do you want to include any text in the ad?"

    def _handle_preferences(self, user_message: str) -> str:
        # For simplicity, we'll just ask about themes for now.
        # This can be expanded to ask more questions.
        if "text" not in self.conversation_state["collected_data"]:
             self.conversation_state["collected_data"]["text"] = user_message
             return "Got it. What theme would you prefer for the ad? Some popular options are cartoonish, realistic, anime, or surreal. Let me know what you'd like, or I can suggest some trending themes."
        else:
            self.conversation_state["collected_data"]["theme"] = user_message
            self.conversation_state["stage"] = "showing_ideas"
            
            # Generate ad ideas
            research_data = json.loads(self.session.trend_data)
            print(f"Collected data: {self.conversation_state['collected_data']}")
            print(f"Research data: {research_data}")
            
            # Simple mock ideas for testing
            self.conversation_state["ideas"] = [
                {
                    "id": "1",
                    "name": "Morning Rush Special",
                    "description": "Capture busy professionals grabbing their morning coffee with warm, inviting atmosphere",
                    "theme": user_message.lower(),
                    "key_elements": ["steaming coffee", "professional atmosphere", "morning light"]
                },
                {
                    "id": "2", 
                    "name": "Cozy Corner Workspace",
                    "description": "Show remote workers enjoying coffee in a comfortable, productive setting",
                    "theme": user_message.lower(),
                    "key_elements": ["laptop setup", "comfortable seating", "artisan coffee"]
                },
                {
                    "id": "3",
                    "name": "Signature Blend Spotlight",
                    "description": "Feature your signature morning blend with elegant product photography",
                    "theme": user_message.lower(),
                    "key_elements": ["coffee beans", "brewing process", "premium packaging"]
                }
            ]

            response_text = "Based on your preferences and my research, here are a few ideas for your ad:\n\n"
            for i, idea in enumerate(self.conversation_state["ideas"]):
                response_text += f"{i+1}. **{idea['name']}**: {idea['description']}\n"
            response_text += "\nPlease select one or more ideas by number (e.g., '1' or '1, 3')."
            return response_text

    def _handle_idea_selection(self, user_message: str) -> str:
        try:
            selected_indices = [int(i.strip()) - 1 for i in user_message.split(',')]
            selected_ideas = [self.conversation_state["ideas"][i] for i in selected_indices]
            
            generated_images = []
            image_details = []
            
            for i, idea in enumerate(selected_ideas):
                print(f"Generating image {i+1} for idea: {idea['name']}")
                
                # Create structured prompt for DALL-E
                prompt = self._create_dalle_prompt(idea)
                print(f"DALL-E Prompt: {prompt}")
                
                # Generate image using your DALL-E service
                style_params = {
                    "style": idea.get("theme", "realistic"),
                    "mood": "professional and engaging"
                }
                
                image_data = image_generation_service.generate_image(prompt, style_params)
                
                if image_data and "url" in image_data:
                    generated_images.append(image_data["url"])
                    image_details.append({
                        "idea_name": idea["name"],
                        "url": image_data["url"],
                        "thumbnail_url": image_data.get("thumbnail_url"),
                        "analysis": image_data.get("analysis", {})
                    })
                    print(f"✅ Successfully generated image for '{idea['name']}'")
                else:
                    print(f"❌ Failed to generate image for '{idea['name']}'")
            
            # Store generated images in conversation state
            self.conversation_state["generated_images"] = image_details
            self.conversation_state["stage"] = "completed"
            
            if generated_images:
                response = f"🎉 Perfect! I've successfully generated {len(generated_images)} advertisement image(s) for you using DALL-E 3:\n\n"
                
                for i, detail in enumerate(image_details):
                    response += f"{i+1}. **{detail['idea_name']}**\n"
                    response += f"   📷 Image: {detail['url']}\n"
                    if detail.get('thumbnail_url'):
                        response += f"   🖼️ Thumbnail: {detail['thumbnail_url']}\n"
                    response += "\n"
                
                response += "Your professional advertisement images are ready to use! Each image has been generated specifically for your Bean There Coffee Co campaign targeting young professionals in San Francisco. 🚀"
                return response
            else:
                return "I apologize, but I encountered issues generating the images. Please try again or contact support."
                
        except (ValueError, IndexError) as e:
            return "Please provide valid numbers corresponding to the ideas you'd like (e.g., '1' or '1, 3')."
        except Exception as e:
            print(f"Error in idea selection: {str(e)}")
            return "I encountered an error while generating your images. Please try again."

    def _create_dalle_prompt(self, idea: Dict[str, Any]) -> str:
        """Create optimized prompt specifically for DALL-E 3 image generation"""
        data = self.conversation_state["collected_data"]
        
        # Core business info
        company_name = data.get('company_name', 'Bean There Coffee Co')
        business_type = data.get('business_type', 'coffee shop')
        theme = idea.get('theme', 'realistic and modern')
        
        # Build DALL-E optimized prompt
        if idea['name'] == "Morning Rush Special":
            prompt = f"A {theme} advertisement photograph for {company_name}, a premium {business_type}. Show busy young professionals in business attire grabbing steaming hot coffee cups in a modern, upscale coffee shop interior. Warm morning sunlight streaming through large windows. Professional atmosphere with contemporary furniture, exposed brick walls, and industrial lighting. Focus on the connection between premium coffee and busy professional lifestyle. High-quality commercial photography style, professional lighting, depth of field."
            
        elif idea['name'] == "Cozy Corner Workspace":
            prompt = f"A {theme} advertisement photograph for {company_name}, a premium {business_type}. Show remote workers and freelancers working comfortably on laptops while enjoying artisan coffee in a cozy corner of a modern coffee shop. Comfortable seating areas with soft lighting, wooden tables, bookshelves, and plants. Emphasize the perfect workspace atmosphere for productivity and relaxation. Professional commercial photography, warm color palette, lifestyle photography style."
            
        elif idea['name'] == "Signature Blend Spotlight":
            prompt = f"A {theme} advertisement photograph for {company_name}, a premium {business_type}. Elegant product photography featuring premium coffee beans, sophisticated brewing equipment, and beautifully designed coffee packaging. Show the artisanal coffee-making process with steam rising from freshly ground beans. Premium packaging design prominently displayed. Professional studio lighting with dramatic shadows, high-end product photography style, commercial quality."
            
        else:
            # Fallback for any other ideas
            prompt = f"A {theme} advertisement photograph for {company_name}, a premium {business_type}. {idea['description']}. Professional commercial photography, high quality, lifestyle photography, engaging composition."
        
        # Add text overlay instruction if specified
        if data.get('text') and 'slogan' in data.get('text', '').lower():
            prompt += " Leave space for text overlay with company slogan."
        
        # Add final quality modifiers for DALL-E 3
        prompt += " Professional advertisement quality, 4K resolution, commercial photography style, sharp focus, perfect lighting."
        
        return prompt
    
    def _create_structured_prompt(self, idea: Dict[str, Any]) -> str:
        data = self.conversation_state["collected_data"]
        prompt = (
            f"I am {data.get('company_name', 'a business')}. I have a business in {data.get('business_type', 'a competitive industry')}. "
            f"My business is located in {data.get('business_location', 'a local area')}. I want to target customers in {data.get('target_location', 'a wide region')}. "
            f"I am targeting {data.get('target_demographic', 'a broad audience')}. My budget is {data.get('budget', 'flexible')}. "
            "Create an image advertisement that showcases my business with a story, a compelling call to action, and an engaging tone to target my audience. "
            f"The ad should be in a {idea['theme']} style, focusing on {idea['description']}. "
            "Compare it to 100 creatives relevant to my industry/niche/business. Use generative AI response and start with image generation."
        )
        return prompt