import os
from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.campaign import Campaign
from facebook_business.adobjects.adset import AdSet
from facebook_business.adobjects.adcreative import AdCreative
from facebook_business.adobjects.ad import Ad
from app.core.config import settings
from typing import Dict, Any

# --- Initialization and Configuration ---

def init_meta_api(access_token: str) -> None:
    """
    Initializes the Meta Ads API with the provided user access token.
    Credentials (APP_ID, APP_SECRET) are loaded from the application settings.
    """
    FacebookAdsApi.init(
        app_id=settings.META_APP_ID,
        app_secret=settings.META_APP_SECRET,
        access_token=access_token,
    )

def get_ad_account_id() -> str:
    """
    Returns the appropriate Ad Account ID based on the current environment
    setting (sandbox or production).

    Raises:
        ValueError: If the required ad account ID is not set in the environment.
    """
    if settings.META_API_ENVIRONMENT == "sandbox":
        if not settings.META_SANDBOX_AD_ACCOUNT_ID:
            raise ValueError("Sandbox environment is selected, but META_SANDBOX_AD_ACCOUNT_ID is not set.")
        return settings.META_SANDBOX_AD_ACCOUNT_ID
    else:
        # For production, you will likely get this from the user's profile or request.
        # This is a placeholder for that logic.
        if not settings.META_PRODUCTION_AD_ACCOUNT_ID:
            raise ValueError("Production environment is selected, but META_PRODUCTION_AD_ACCOUNT_ID is not set.")
        return settings.META_PRODUCTION_AD_ACCOUNT_ID

def get_page_id() -> str:
    """
    Returns the appropriate Facebook Page ID based on the current environment.

    Raises:
        ValueError: If the required page ID is not set in the environment.
    """
    if settings.META_API_ENVIRONMENT == "sandbox":
        if not settings.META_SANDBOX_PAGE_ID:
            raise ValueError("Sandbox environment is selected, but META_SANDBOX_PAGE_ID is not set.")
        return settings.META_SANDBOX_PAGE_ID
    else:
        if not settings.META_PRODUCTION_PAGE_ID:
            raise ValueError("Production environment is selected, but META_PRODUCTION_PAGE_ID is not set.")
        return settings.META_PRODUCTION_PAGE_ID


# --- Ad Object Creation Functions ---

def create_ad_campaign(campaign_name: str) -> Dict[str, Any]:
    """
    Creates a new ad campaign in the configured ad account.
    The campaign is created with a LEADS objective and is PAUSED by default.
    """
    ad_account_id = get_ad_account_id()
    ad_account = AdAccount(f'act_{ad_account_id}')
    
    params = {
        'name': campaign_name,
        'objective': Campaign.Objective.outcome_leads,
        'status': Campaign.Status.paused,
        'special_ad_categories': [],
    }
    
    campaign = ad_account.create_campaign(fields=[Campaign.Field.id], params=params)
    return campaign.export_all_data()

def create_ad_set(campaign_id: str, ad_set_name: str) -> Dict[str, Any]:
    """
    Creates a new ad set within a specified campaign.
    The ad set is configured with a default daily budget and basic US targeting,
    and is PAUSED by default.
    """
    ad_account_id = get_ad_account_id()
    ad_account = AdAccount(f'act_{ad_account_id}')
    
    params = {
        'name': ad_set_name,
        'campaign_id': campaign_id,
        'daily_budget': 2000,  # Example: $20.00 in cents
        'billing_event': AdSet.BillingEvent.impressions,
        'optimization_goal': AdSet.OptimizationGoal.reach,
        'bid_amount': 200,
        'targeting': {'geo_locations': {'countries': ['US']}},
        'status': AdSet.Status.paused,
    }

    ad_set = ad_account.create_ad_set(fields=[AdSet.Field.id], params=params)
    return ad_set.export_all_data()

def create_ad_creative(image_path: str, message: str) -> Dict[str, Any]:
    """
    Creates an ad creative by uploading a local image and pairing it with text.
    The creative is linked to the configured Facebook Page.
    """
    ad_account_id = get_ad_account_id()
    page_id = get_page_id()
    ad_account = AdAccount(f'act_{ad_account_id}')

    # Ensure the image path is absolute
    if not os.path.isabs(image_path):
        image_path = os.path.join(os.getcwd(), image_path)

    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found at path: {image_path}")

    # 1. Upload image to get an image_hash
    image = ad_account.create_ad_image(params={'filename': image_path})
    image_hash = image.get_hash()

    # 2. Create the creative with the uploaded image
    object_story_spec = {
        'page_id': page_id,
        'link_data': {
            'image_hash': image_hash,
            'link': 'https://www.example.com', # A placeholder link
            'message': message,
        },
    }
    
    params = {
        'name': f"Creative for {os.path.basename(image_path)}",
        'object_story_spec': object_story_spec,
    }

    creative = ad_account.create_ad_creative(fields=[AdCreative.Field.id], params=params)
    return creative.export_all_data()

def create_ad(ad_set_id: str, creative_id: str, ad_name: str) -> Dict[str, Any]:
    """
    Creates the final ad, linking an ad set with a creative.
    The ad is created in a PAUSED state by default.
    """
    ad_account_id = get_ad_account_id()
    ad_account = AdAccount(f'act_{ad_account_id}')

    params = {
        'name': ad_name,
        'adset_id': ad_set_id,
        'creative': {'creative_id': creative_id},
        'status': Ad.Status.paused,
    }
    
    ad = ad_account.create_ad(fields=[Ad.Field.id], params=params)
    return ad.export_all_data()