from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas import schemas
from app.core import config, database
from app.models import models
from app.services import trend_service, keyword_extraction_service
import uuid

router = APIRouter()


@router.post("/prompt/start", response_model=schemas.PromptStartResponse)
async def start_prompt(payload: schemas.PromptStartRequest, db: Session = Depends(database.get_db)):
    # Extract Keywords
    keywords = keyword_extraction_service.extract_keywords(payload.text)
    if not keywords:
        raise HTTPException(status_code=422, detail="Could not extract keywords from the input.")

    # Create a Session
    session_id = str(uuid.uuid4())
    session = models.Session(
        id=session_id,
        initial_prompt=payload.text,
        extracted_keywords=keywords
    )
    db.add(session)
    db.commit()

    # Fetch Trend Data
    trend_data = trend_service.fetch_trend_data(keywords)

    # Store Trend Data
    session.trend_data = trend_data
    db.add(session)
    db.commit()

    # Generate Clarifying Questions
    questions = trend_service.generate_clarifying_questions(trend_data)

    return schemas.PromptStartResponse(
        session_id=session_id,
        extracted_keywords=keywords,
        questions=questions
    )


@router.post("/prompt/refine", response_model=schemas.PromptRefineResponse)
async def refine_prompt(payload: schemas.PromptRefineRequest, db: Session = Depends(database.get_db)):
    # Get session
    session = db.query(models.Session).filter(models.Session.id == payload.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Store user answers in session (you might want to create a separate table for this)
    if not session.refined_prompt:
        session.refined_prompt = {}
    
    # Merge answers
    refined_data = session.refined_prompt or {}
    refined_data.update(payload.answers)
    session.refined_prompt = refined_data
    
    # Check if we have all required answers
    # In a real implementation, you'd check against the questions generated in phase 1
    required_fields = ["style", "color_palette"]
    has_all_required = all(field in refined_data for field in required_fields)
    
    if has_all_required:
        # Generate final prompts based on all collected data
        final_prompts = trend_service.generate_final_prompts(
            session.initial_prompt,
            session.extracted_keywords,
            refined_data,
            session.trend_data
        )
        session.final_prompts = final_prompts
        db.commit()
        
        return schemas.PromptRefineResponse(
            session_id=session.id,
            needs_more_info=False,
            ready_for_generation=True
        )
    else:
        # Generate additional questions if needed
        # This is simplified - in production you'd have more sophisticated logic
        db.commit()
        return schemas.PromptRefineResponse(
            session_id=session.id,
            needs_more_info=True,
            questions=[],  # Would generate follow-up questions here
            ready_for_generation=False
        )
