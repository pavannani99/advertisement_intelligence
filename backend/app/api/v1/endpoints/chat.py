from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas import chat_schemas
from app.services.conversational_agent import ConversationalAgent
from app.core import database

router = APIRouter()

@router.post("/chat", response_model=chat_schemas.ChatResponse)
async def chat_with_bot(
    payload: chat_schemas.ChatRequest,
    db: Session = Depends(database.get_db)
):
    """
    Endpoint for conversational chat with the Gemini model.
    """
    agent = ConversationalAgent(session_id=payload.session_id, db=db)
    response_data = agent.process_message(payload.message)

    return chat_schemas.ChatResponse(
        session_id=payload.session_id,
        response=response_data["response"],
        stage=response_data["stage"],
        conversation_history=response_data["conversation_history"],
        ideas=response_data.get("ideas")
    )