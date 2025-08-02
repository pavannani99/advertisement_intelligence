from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas import advertising_schemas as schemas
from app.core import database
from app.models import models
from app.services import research_service, ad_generation_service
import uuid
import asyncio
import json
from datetime import datetime
from app.services import meta_ads_service



async def simulate_image_generation(job_ids: list):
    """Generate images using AI based on the prompts"""
    await asyncio.sleep(2)  # Small delay before processing
    
    from app.core.database import SessionLocal
    from app.services import image_generation_service
    db = SessionLocal()
    
    try:
        for job_id in job_ids:
            job = db.query(models.GenerationJob).filter(models.GenerationJob.id == job_id).first()
            if job:
                try:
                    # Update job status to processing
                    job.status = models.JobStatus.PROCESSING
                    db.commit()
                    
                    # Get session to access research data
                    session = db.query(models.Session).filter(models.Session.id == job.session_id).first()
                    research_data = json.loads(session.trend_data) if session and session.trend_data else {}
                    
                    # Generate the actual image using AI
                    result = image_generation_service.generate_image(
                        prompt=job.prompt_used,
                        style_params={
                            "style": "professional advertisement",
                            "mood": "engaging"
                        },
                        research_data=research_data
                    )
                    
                    # Update job status to completed
                    job.status = models.JobStatus.COMPLETED
                    job.completed_at = datetime.utcnow()
                    
                    # Create the generated image record
                    image = models.GeneratedImage(
                        id=str(uuid.uuid4()),
                        session_id=job.session_id,
                        job_id=job_id,
                        image_url=result["url"],
                        thumbnail_url=result["thumbnail_url"],
                        prompt_used=job.prompt_used,
                        analysis=json.dumps(result["analysis"]),
                        image_metadata=json.dumps(result["metadata"])
                    )
                    db.add(image)
                    
                except Exception as e:
                    # If image generation fails, update job with error
                    job.status = models.JobStatus.FAILED
                    job.error_message = str(e)
                    job.completed_at = datetime.utcnow()
        
        db.commit()
    finally:
        db.close()

router = APIRouter()


@router.post("/product-info", response_model=schemas.ProductInfoResponse)
async def submit_product_info(
    payload: schemas.ProductInfoRequest,
    db: Session = Depends(database.get_db)
):
    """Step 1: Collect initial product information"""
    # Validate offer details if focus is offer
    if payload.advertising_focus == schemas.AdvertisingFocus.OFFER and not payload.offer_details:
        raise HTTPException(status_code=400, detail="Offer details required when focus is 'offer'")
    
    # Create session
    session_id = str(uuid.uuid4())
    
    # Convert payload to JSON-serializable dict
    payload_dict = payload.dict()
    # Convert enum to string for JSON storage
    if 'advertising_focus' in payload_dict:
        payload_dict['advertising_focus'] = payload_dict['advertising_focus'].value if hasattr(payload_dict['advertising_focus'], 'value') else str(payload_dict['advertising_focus'])
    
    import json
    
    session = models.Session(
        id=session_id,
        initial_prompt=f"{payload.company_name} - {payload.product_type}",
        extracted_keywords=json.dumps([payload.product_type, payload.company_name]),
        refined_prompt=json.dumps(payload_dict)
    )
    db.add(session)
    db.commit()
    
    return schemas.ProductInfoResponse(
        session_id=session_id,
        message="Product information received successfully",
        next_step="research"
    )


@router.post("/research", response_model=schemas.ResearchResponse)
async def conduct_research(
    payload: schemas.ResearchRequest,
    db: Session = Depends(database.get_db)
):
    """Step 2: Research trends and gather insights"""
    # Get session
    session = db.query(models.Session).filter(models.Session.id == payload.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Parse JSON string back to dict
    product_info = json.loads(session.refined_prompt) if session.refined_prompt else {}
    
    # Conduct research
    research_data = await research_service.conduct_comprehensive_research(
        product_info=product_info,
        website_url=str(payload.company_website) if payload.company_website else None
    )
    
    # Store research data as JSON string
    session.trend_data = json.dumps(research_data)
    db.commit()
    
    # Create summary
    summary = research_service.create_research_summary(research_data)
    
    return schemas.ResearchResponse(
        session_id=session.id,
        summary=summary
    )


@router.post("/generate-ideas", response_model=schemas.GenerateIdeasResponse)
async def generate_ad_ideas(
    payload: schemas.GenerateIdeasRequest,
    db: Session = Depends(database.get_db)
):
    """Step 3 & 4: Generate ad ideas based on research and user preferences"""
    # Get session
    session = db.query(models.Session).filter(models.Session.id == payload.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Parse JSON data for services
    product_info = json.loads(session.refined_prompt) if session.refined_prompt else {}
    research_data = json.loads(session.trend_data) if session.trend_data else {}
    
    # Generate ideas
    ideas = ad_generation_service.generate_ad_ideas(
        product_info=product_info,
        research_data=research_data,
        customization=payload.customization
    )
    
    # Store ideas in session as JSON string
    session.final_prompts = json.dumps([idea.dict() for idea in ideas])
    db.commit()
    
    return schemas.GenerateIdeasResponse(
        session_id=session.id,
        ideas=ideas
    )


@router.post("/generate-ads", response_model=schemas.GenerateAdsResponse)
async def generate_ads(
    payload: schemas.GenerateAdsRequest,
    db: Session = Depends(database.get_db)
):
    """Generate actual ad images based on selected ideas"""
    # Get session
    session = db.query(models.Session).filter(models.Session.id == payload.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Parse final prompts from JSON string
    final_prompts = json.loads(session.final_prompts) if session.final_prompts else []
    
    # Get selected ideas
    selected_ideas = [
        idea for idea in final_prompts 
        if idea["id"] in payload.selected_idea_ids
    ]
    
    if not selected_ideas:
        raise HTTPException(status_code=400, detail="No valid ideas selected")
    
    job_ids = []
    
    # Parse product info and research data for prompt generation
    product_info = json.loads(session.refined_prompt) if session.refined_prompt else {}
    research_data = json.loads(session.trend_data) if session.trend_data else {}
    
    # Create generation jobs
    for idea in selected_ideas:
        for i in range(payload.variations_per_idea):
            job_id = str(uuid.uuid4())
            job = models.GenerationJob(
                id=job_id,
                session_id=session.id,
                status=models.JobStatus.PENDING,
                prompt_used=ad_generation_service.create_image_prompt(idea, product_info, research_data)
            )
            db.add(job)
            job_ids.append(job_id)
    
    db.commit()
    
    # For now, simulate image generation without Celery
    # TODO: Implement actual image generation
    import asyncio
    asyncio.create_task(simulate_image_generation(job_ids))
    
    return schemas.GenerateAdsResponse(
        job_ids=job_ids,
        estimated_time=45 * len(job_ids)  # 45 seconds per image
    )


@router.get("/ad-status/{job_id}", response_model=schemas.AdGenerationStatus)
async def check_ad_status(job_id: str, db: Session = Depends(database.get_db)):
    """Check status of ad generation job"""
    job = db.query(models.GenerationJob).filter(models.GenerationJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    result = None
    if job.status == models.JobStatus.COMPLETED:
        image = db.query(models.GeneratedImage).filter(
            models.GeneratedImage.job_id == job_id
        ).first()
        
        if image:
            # Find which idea this belongs to
            session = db.query(models.Session).filter(models.Session.id == job.session_id).first()
            idea_id = "unknown"
            if session and session.final_prompts:
                final_prompts = json.loads(session.final_prompts)
                for idea in final_prompts:
                    # Check if the idea's name or theme is in the prompt
                    idea_name = idea.get("name", "")
                    idea_theme = idea.get("theme", "")
                    if (idea_name and idea_name in job.prompt_used) or (idea_theme and idea_theme in job.prompt_used):
                        idea_id = idea.get("id", "unknown")
                        break
            
            result = schemas.GeneratedAd(
                ad_id=image.id,
                idea_id=idea_id,
                image_url=image.image_url,
                thumbnail_url=image.thumbnail_url,
                prompt_used=image.prompt_used,
                performance_prediction={
                    "engagement_score": 0.75,
                    "conversion_likelihood": 0.68,
                    "brand_alignment": 0.82
                },
                created_at=image.created_at
            )
    
    return schemas.AdGenerationStatus(
        job_id=job_id,
        status=job.status.value,
        result=result,
        error=job.error_message
    )

@router.post("/post-ad-to-meta", response_model=...)
async def post_ad_to_meta(
    payload: ..., # Create a Pydantic model for this payload
    db: Session = Depends(database.get_db)
):
    """
    Posts a generated image as an ad to the Meta Ads platform.
    """
    # 1. Get user's access token (you'll need to store this in the DB)
    user_access_token = "..." # Get from DB

    # 2. Initialize the Meta Ads API
    meta_ads_service.init_meta_api(user_access_token)

    # 3. Create the campaign, ad set, creative, and ad
    try:
        campaign = meta_ads_service.create_ad_campaign(
            ad_account_id=payload.ad_account_id,
            campaign_name="AI Generated Campaign"
        )
        ad_set = meta_ads_service.create_ad_set(
            ad_account_id=payload.ad_account_id,
            campaign_id=campaign['id'],
            ad_set_name="AI Generated Ad Set"
        )
        creative = meta_ads_service.create_ad_creative(
            ad_account_id=payload.ad_account_id,
            image_path=payload.image_path, # Path to the generated image
            page_id=payload.page_id,
            message=payload.message
        )
        ad = meta_ads_service.create_ad(
            ad_account_id=payload.ad_account_id,
            ad_set_id=ad_set['id'],
            creative_id=creative['id'],
            ad_name="AI Generated Ad"
        )
        return {"message": "Ad created successfully!", "ad_id": ad['id']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))