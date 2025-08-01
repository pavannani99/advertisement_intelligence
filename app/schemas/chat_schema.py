from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class ConversationStage(str, Enum):
    GATHERING_INFO = "gathering_info"
    AWAITING_PREFERENCES = "awaiting_preferences"
    SHOWING_IDEAS = "showing_ideas"
    GENERATING_IMAGES = "generating_images"
    COMPLETED = "completed"

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    session_id: str
    response: str
    stage: ConversationStage
    conversation_history: List[ChatMessage]
    ideas: Optional[List[Dict[str, Any]]] = None