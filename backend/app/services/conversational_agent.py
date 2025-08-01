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
            "stage": "GATHERING_INFO",
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

        if self.conversation_state["stage"] == "GATHERING_INFO":
            response_text = self._handle_gathering_info(user_message)
        elif self.conversation_state["stage"] == "AWAITING_PREFERENCES":
            response_text = self._handle_preferences(user_message)
        elif self.conversation_state["stage"] == "SHOWING_IDEAS":
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
            
            self.conversation_state["stage"] = "AWAITING_PREFERENCES"
            return "Thanks for all the information! Now, let's talk about the ad's style. Do you want to include any text in the ad?"

    def _handle_preferences(self, user_message: str) -> str:
        # For simplicity, we'll just ask about themes for now.
        # This can be expanded to ask more questions.
        if "text" not in self.conversation_state["collected_data"]:
             self.conversation_state["collected_data"]["text"] = user_message
             return "Got it. What theme would you prefer for the ad? Some popular options are cartoonish, realistic, anime, or surreal. Let me know what you'd like, or I can suggest some trending themes."
        else:
            self.conversation_state["collected_data"]["theme"] = user_message
            self.conversation_state["stage"] = "SHOWING_IDEAS"
            
            # Generate ad ideas
            research_data = json.loads(self.session.trend_data)
            ideas = ad_generation_service.generate_ad_ideas(self.conversation_state["collected_data"], research_data, {})
            self.conversation_state["ideas"] = [idea.dict() for idea in ideas]

            response_text = "Based on your preferences and my research, here are a few ideas for your ad:\n\n"
            for i, idea in enumerate(self.conversation_state["ideas"]):
                response_text += f"{i+1}. **{idea['name']}**: {idea['description']}\n"
            response_text += "\nPlease select one or more ideas by number (e.g., '1' or '1, 3')."
            return response_text

    def _handle_idea_selection(self, user_message: str) -> str:
        selected_indices = [int(i.strip()) - 1 for i in user_message.split(',')]
        selected_ideas = [self.conversation_state["ideas"][i] for i in selected_indices]
        
        generated_images = []
        for idea in selected_ideas:
            prompt = self._create_structured_prompt(idea)
            image_data = image_generation_service.generate_image(prompt, {})
            generated_images.append(image_data["url"])
        
        self.conversation_state["stage"] = "COMPLETED"
        return f"Great choices! I've generated the images for you. You can view them here: {', '.join(generated_images)}"

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