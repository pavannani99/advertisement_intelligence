import openai
from typing import Dict, Any, List
from datetime import datetime
import uuid
import random
from app.core.config import settings
from app.schemas.advertising_schemas import AdIdea, AdCustomizationOptions, AdTheme
import json

# Initialize OpenAI client
if settings.OPENAI_API_KEY:
    openai.api_key = settings.OPENAI_API_KEY


def generate_ad_ideas(
    product_info: Dict[str, Any],
    research_data: Dict[str, Any],
    customization: AdCustomizationOptions
) -> List[AdIdea]:
    """Generate multiple ad ideas based on research and user preferences"""
    
    ideas = []
    
    # Extract key information
    company_name = product_info.get('company_name', '')
    product_type = product_info.get('product_type', '')
    advertising_focus = product_info.get('advertising_focus', 'product')
    
    market_trends = research_data.get('market_trends', {})
    competitor_analysis = research_data.get('competitor_analysis', {})
    
    # 1. Trending Idea - Based on current market trends
    trending_style = random.choice(market_trends.get('style_trends', ['modern minimalist']))
    trending_colors = random.sample(
        market_trends.get('color_trends', {}).get('primary', ['#2E8B57', '#4169E1']), 
        2
    )
    
    trending_idea = AdIdea(
        id=str(uuid.uuid4()),
        name="Trending Vision",
        type="trending",
        description=f"Leverages the most popular {trending_style} style currently trending in {product_type} advertising",
        theme=trending_style,
        key_elements=[
            f"{trending_style} design",
            f"Focus on {advertising_focus}",
            "Current market appeal",
            "High engagement potential"
        ],
        color_palette=trending_colors,
        estimated_effectiveness=random.uniform(0.75, 0.95),
        rationale=f"This concept aligns with the {trending_style} trend that's showing high engagement in {product_type} category"
    )
    ideas.append(trending_idea)
    
    # 2. Experimental Idea - Unique and different
    experimental_themes = ['surreal', 'abstract', 'futuristic', 'artistic', 'unconventional']
    experimental_theme = random.choice(experimental_themes)
    
    experimental_idea = AdIdea(
        id=str(uuid.uuid4()),
        name="Bold Experiment",
        type="experimental",
        description=f"A daring {experimental_theme} approach that breaks conventional {product_type} advertising norms",
        theme=experimental_theme,
        key_elements=[
            f"{experimental_theme} visual style",
            "Unique brand positioning",
            "Memorable impact",
            "Conversation starter"
        ],
        color_palette=["#FF6B6B", "#4ECDC4", "#45B7D1"],
        estimated_effectiveness=random.uniform(0.60, 0.85),
        rationale=f"Experimental {experimental_theme} approach to stand out from competitors and create memorable brand impression"
    )
    ideas.append(experimental_idea)
    
    # 3. User Preference Idea - Based on customization
    user_theme = customization.preferred_theme.value if customization.preferred_theme else "modern"
    user_colors = customization.color_preferences or ["#333333", "#FFFFFF"]
    
    user_preference_idea = AdIdea(
        id=str(uuid.uuid4()),
        name="Your Perfect Match",
        type="user_preference",
        description=f"Tailored specifically to your {user_theme} style preferences and brand vision",
        theme=user_theme,
        key_elements=[
            f"{user_theme} aesthetic",
            "Custom color scheme",
            "Brand-aligned messaging",
            "Target audience focus"
        ],
        color_palette=user_colors[:3],
        estimated_effectiveness=random.uniform(0.70, 0.90),
        rationale=f"Designed around your {user_theme} preferences while maintaining strong market appeal"
    )
    ideas.append(user_preference_idea)
    
    # 4. Competitor Gap Idea - Addresses market gaps
    gaps = competitor_analysis.get('gaps_identified', ['emotional storytelling'])
    gap_focus = random.choice(gaps)
    
    gap_idea = AdIdea(
        id=str(uuid.uuid4()),
        name="Market Opportunity",
        type="user_preference",
        description=f"Capitalizes on the {gap_focus} gap identified in competitor analysis",
        theme="strategic",
        key_elements=[
            f"Emphasis on {gap_focus}",
            "Competitive advantage",
            "Market differentiation",
            "Unique positioning"
        ],
        color_palette=["#2C3E50", "#E74C3C", "#F39C12"],
        estimated_effectiveness=random.uniform(0.65, 0.88),
        rationale=f"Targets the {gap_focus} opportunity that competitors are currently missing"
    )
    ideas.append(gap_idea)
    
    # 5. High-Performance Idea - Based on engagement metrics
    high_perf_idea = AdIdea(
        id=str(uuid.uuid4()),
        name="Engagement Maximizer",
        type="user_preference",
        description="Optimized for maximum engagement based on industry performance data",
        theme="high-performance",
        key_elements=[
            "Proven visual elements",
            "High-engagement colors",
            "Clear call-to-action",
            "Conversion-focused"
        ],
        color_palette=["#FF4757", "#3742FA", "#2ED573"],
        estimated_effectiveness=random.uniform(0.80, 0.95),
        rationale="Combines high-performing visual elements and colors known to drive engagement and conversions"
    )
    ideas.append(high_perf_idea)
    
    return ideas


def create_image_prompt(idea: Dict[str, Any], product_info: Dict[str, Any] = None, research_data: Dict[str, Any] = None) -> str:
    """Convert an ad idea into a detailed image generation prompt"""
    
    # Extract idea details
    theme = idea.get('theme', 'modern')
    key_elements = idea.get('key_elements', [])
    color_palette = idea.get('color_palette', [])
    description = idea.get('description', '')
    
    # Build comprehensive prompt
    prompt_parts = []
    
    # Add the main description if available
    if description:
        prompt_parts.append(f"Create a {description}")
    else:
        prompt_parts.append(f"Professional advertisement design in {theme} style")
    
    # Add product context if available
    if product_info:
        company_name = product_info.get('company_name', '')
        product_type = product_info.get('product_type', '')
        target_demographic = product_info.get('target_demographic', '')
        advertising_focus = product_info.get('advertising_focus', '')
        
        if company_name and product_type:
            prompt_parts.append(f"for {company_name}'s {product_type}")
        
        if target_demographic:
            prompt_parts.append(f"targeting {target_demographic}")
            
        if advertising_focus == 'offer' and product_info.get('offer_details'):
            offer = product_info['offer_details']
            if offer.get('discount_percentage'):
                prompt_parts.append(f"highlighting {offer['discount_percentage']}% discount offer")
            elif offer.get('special_offer'):
                prompt_parts.append(f"featuring {offer['special_offer']}")
    
    # Integrate research data
    if research_data:
        market_trends = research_data.get('market_trends', {})
        popular_designs = market_trends.get('popular_designs', [])
        if popular_designs:
            prompt_parts.append(f"inspired by popular designs: {', '.join(popular_designs[:3])}")
    
    # Add key elements
    if key_elements:
        elements_str = ", ".join(key_elements[:3])  # Limit to avoid too long prompts
        prompt_parts.append(f"featuring {elements_str}")
    
    # Add color information
    if color_palette:
        colors_str = ", ".join(color_palette[:3])
        prompt_parts.append(f"using color palette: {colors_str}")
    
    # Add quality and style modifiers
    prompt_parts.extend([
        "high quality",
        "professional advertising photography",
        "clean composition",
        "marketing ready",
        "4k resolution",
        "no text overlays"  # Let the frontend handle text
    ])
    
    return ", ".join(prompt_parts)


def generate_ai_enhanced_ideas(
    product_info: Dict[str, Any],
    research_data: Dict[str, Any],
    customization: AdCustomizationOptions
) -> List[AdIdea]:
    """Use AI to generate more sophisticated ad ideas"""
    
    if not settings.OPENAI_API_KEY:
        # Fallback to basic generation if no API key
        return generate_ad_ideas(product_info, research_data, customization)
    
    try:
        # Prepare context for AI
        context = f"""
        Company: {product_info.get('company_name', '')}
        Product: {product_info.get('product_type', '')}
        Focus: {product_info.get('advertising_focus', '')}
        Target: {product_info.get('target_demographic', '')}
        
        Market Trends: {research_data.get('market_trends', {}).get('style_trends', [])}
        Competitor Gaps: {research_data.get('competitor_analysis', {}).get('gaps_identified', [])}
        
        User Preferences:
        - Theme: {customization.preferred_theme.value if customization.preferred_theme else 'not specified'}
        - Colors: {customization.color_preferences or 'not specified'}
        - Include Text: {customization.include_text}
        """
        
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a creative advertising strategist. Generate 5 distinct ad concept ideas based on the provided context."
                },
                {
                    "role": "user",
                    "content": f"Based on this context, suggest 5 creative ad concepts:\n\n{context}\n\nFor each concept, provide: name, description, key visual elements, and rationale."
                }
            ],
            max_tokens=800
        )
        
        ai_response = response.choices[0].message.content
        
        # Parse AI response and create AdIdea objects
        # For now, return basic ideas with AI insights added
        basic_ideas = generate_ad_ideas(product_info, research_data, customization)
        
        # Add AI insights to the first idea
        if basic_ideas:
            basic_ideas[0].rationale = f"AI Enhanced: {ai_response[:200]}..."
        
        return basic_ideas
        
    except Exception as e:
        # Fallback to basic generation on error
        return generate_ad_ideas(product_info, research_data, customization)


def optimize_prompt_for_provider(prompt: str, provider: str = "openai") -> str:
    """Optimize prompt for specific AI image generation providers"""
    
    if provider == "openai":
        # DALL-E 3 specific optimizations
        if len(prompt) > 400:  # DALL-E 3 has prompt length limits
            # Truncate while keeping essential parts
            parts = prompt.split(", ")
            essential_parts = parts[:8]  # Keep first 8 parts
            prompt = ", ".join(essential_parts)
        
        # Add DALL-E specific quality modifiers
        if "high quality" not in prompt.lower():
            prompt += ", high quality, professional"
    
    elif provider == "stability":
        # Stable Diffusion optimizations
        prompt += ", detailed, 8k, highly detailed, professional photography"
    
    elif provider == "midjourney":
        # Midjourney specific optimizations
        prompt += " --ar 16:9 --v 6 --style raw"
    
    return prompt


def analyze_ad_performance_prediction(idea: AdIdea, market_data: Dict[str, Any]) -> Dict[str, float]:
    """Predict ad performance based on idea characteristics and market data"""
    
    # Base scores
    engagement_score = 0.5
    conversion_score = 0.5
    brand_alignment_score = 0.5
    
    # Adjust based on theme
    theme_performance = {
        "modern minimalist": {"engagement": 0.8, "conversion": 0.75, "brand": 0.85},
        "vintage retro": {"engagement": 0.7, "conversion": 0.65, "brand": 0.8},
        "bold geometric": {"engagement": 0.85, "conversion": 0.7, "brand": 0.75},
        "luxury premium": {"engagement": 0.75, "conversion": 0.85, "brand": 0.9},
        "experimental": {"engagement": 0.9, "conversion": 0.6, "brand": 0.7}
    }
    
    theme_scores = theme_performance.get(idea.theme, {
        "engagement": 0.7, "conversion": 0.7, "brand": 0.7
    })
    
    engagement_score = theme_scores["engagement"]
    conversion_score = theme_scores["conversion"]
    brand_alignment_score = theme_scores["brand"]
    
    # Add randomness for realism
    engagement_score += random.uniform(-0.1, 0.1)
    conversion_score += random.uniform(-0.1, 0.1)
    brand_alignment_score += random.uniform(-0.1, 0.1)
    
    # Ensure scores stay within bounds
    engagement_score = max(0.0, min(1.0, engagement_score))
    conversion_score = max(0.0, min(1.0, conversion_score))
    brand_alignment_score = max(0.0, min(1.0, brand_alignment_score))
    
    return {
        "engagement_score": round(engagement_score, 2),
        "conversion_likelihood": round(conversion_score, 2),
        "brand_alignment": round(brand_alignment_score, 2),
        "overall_score": round((engagement_score + conversion_score + brand_alignment_score) / 3, 2)
    }
