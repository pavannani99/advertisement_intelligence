import requests
import json
from typing import Dict, Any, Optional, List
from app.core.config import settings
import os
from urllib.parse import urljoin

class FacebookMarketingService:
    """Service for integrating with Facebook Marketing API to create and manage ad campaigns"""
    
    def __init__(self):
        self.app_id = settings.META_APP_ID
        self.app_secret = settings.META_APP_SECRET
        self.access_token = settings.META_ACCESS_TOKEN
        self.ad_account_id = settings.META_SANDBOX_AD_ACCOUNT_ID
        self.page_id = settings.META_SANDBOX_PAGE_ID
        self.environment = settings.META_API_ENVIRONMENT
        
        # Facebook Graph API base URL
        self.base_url = "https://graph.facebook.com/v18.0/"
        
    def validate_configuration(self) -> Dict[str, Any]:
        """Validate that all required Facebook API credentials are configured"""
        missing_fields = []
        
        if not self.app_id:
            missing_fields.append("META_APP_ID")
        if not self.app_secret:
            missing_fields.append("META_APP_SECRET")
        if not self.access_token:
            missing_fields.append("META_ACCESS_TOKEN")
        if not self.ad_account_id:
            missing_fields.append("META_SANDBOX_AD_ACCOUNT_ID")
        if not self.page_id:
            missing_fields.append("META_SANDBOX_PAGE_ID")
            
        return {
            "valid": len(missing_fields) == 0,
            "missing_fields": missing_fields,
            "environment": self.environment
        }
    
    def upload_image_to_facebook(self, image_path: str, image_name: str) -> Optional[str]:
        """Upload an image to Facebook and return the image hash for use in ads"""
        if not self.validate_configuration()["valid"]:
            raise ValueError("Facebook API configuration is incomplete")
            
        try:
            url = f"{self.base_url}act_{self.ad_account_id}/adimages"
            
            with open(image_path, 'rb') as image_file:
                files = {
                    'filename': (image_name, image_file, 'image/png')
                }
                data = {
                    'access_token': self.access_token
                }
                
                response = requests.post(url, files=files, data=data)
                response.raise_for_status()
                
                result = response.json()
                # Extract image hash from response
                if 'images' in result and image_name in result['images']:
                    return result['images'][image_name]['hash']
                    
        except Exception as e:
            print(f"Error uploading image to Facebook: {str(e)}")
            return None
    
    def create_ad_creative(self, image_hash: str, ad_data: Dict[str, Any]) -> Optional[str]:
        """Create an ad creative using the uploaded image"""
        try:
            url = f"{self.base_url}act_{self.ad_account_id}/adcreatives"
            
            creative_data = {
                'name': ad_data.get('creative_name', 'AI Generated Ad Creative'),
                'object_story_spec': {
                    'page_id': self.page_id,
                    'link_data': {
                        'image_hash': image_hash,
                        'link': ad_data.get('website_url', 'https://example.com'),
                        'message': ad_data.get('ad_text', 'Check out our amazing coffee!'),
                        'name': ad_data.get('headline', 'Premium Coffee Experience'),
                        'description': ad_data.get('description', 'Discover the perfect blend for your day')
                    }
                },
                'access_token': self.access_token
            }
            
            response = requests.post(url, json=creative_data)
            response.raise_for_status()
            
            result = response.json()
            return result.get('id')
            
        except Exception as e:
            print(f"Error creating ad creative: {str(e)}")
            return None
    
    def create_ad_campaign(self, campaign_data: Dict[str, Any]) -> Optional[str]:
        """Create an ad campaign"""
        try:
            url = f"{self.base_url}act_{self.ad_account_id}/campaigns"
            
            data = {
                'name': campaign_data.get('campaign_name', 'AI Generated Campaign'),
                'objective': campaign_data.get('objective', 'REACH'),  # REACH, TRAFFIC, CONVERSIONS, etc.
                'status': 'PAUSED',  # Start paused for safety
                'access_token': self.access_token
            }
            
            response = requests.post(url, json=data)
            response.raise_for_status()
            
            result = response.json()
            return result.get('id')
            
        except Exception as e:
            print(f"Error creating campaign: {str(e)}")
            return None
    
    def create_ad_set(self, campaign_id: str, ad_set_data: Dict[str, Any]) -> Optional[str]:
        """Create an ad set within a campaign"""
        try:
            url = f"{self.base_url}act_{self.ad_account_id}/adsets"
            
            data = {
                'name': ad_set_data.get('ad_set_name', 'AI Generated Ad Set'),
                'campaign_id': campaign_id,
                'daily_budget': ad_set_data.get('daily_budget', 1000),  # In cents ($10.00)
                'billing_event': 'IMPRESSIONS',
                'bid_amount': ad_set_data.get('bid_amount', 100),  # In cents
                'targeting': {
                    'geo_locations': {
                        'countries': ad_set_data.get('countries', ['US'])
                    },
                    'age_min': ad_set_data.get('age_min', 25),
                    'age_max': ad_set_data.get('age_max', 45),
                    'interests': ad_set_data.get('interests', [])
                },
                'status': 'PAUSED',  # Start paused
                'access_token': self.access_token
            }
            
            response = requests.post(url, json=data)
            response.raise_for_status()
            
            result = response.json()
            return result.get('id')
            
        except Exception as e:
            print(f"Error creating ad set: {str(e)}")
            return None
    
    def create_ad(self, ad_set_id: str, creative_id: str, ad_data: Dict[str, Any]) -> Optional[str]:
        """Create an individual ad"""
        try:
            url = f"{self.base_url}act_{self.ad_account_id}/ads"
            
            data = {
                'name': ad_data.get('ad_name', 'AI Generated Ad'),
                'adset_id': ad_set_id,
                'creative': {'creative_id': creative_id},
                'status': 'PAUSED',  # Start paused
                'access_token': self.access_token
            }
            
            response = requests.post(url, json=data)
            response.raise_for_status()
            
            result = response.json()
            return result.get('id')
            
        except Exception as e:
            print(f"Error creating ad: {str(e)}")
            return None
    
    def create_complete_ad_campaign(self, image_path: str, campaign_config: Dict[str, Any]) -> Dict[str, Any]:
        """Create a complete ad campaign with image, creative, campaign, ad set, and ad"""
        try:
            # Step 1: Upload image
            image_name = f"ai_generated_ad_{campaign_config.get('session_id', 'unknown')}.png"
            image_hash = self.upload_image_to_facebook(image_path, image_name)
            if not image_hash:
                return {"success": False, "error": "Failed to upload image"}
            
            # Step 2: Create ad creative
            creative_id = self.create_ad_creative(image_hash, campaign_config)
            if not creative_id:
                return {"success": False, "error": "Failed to create ad creative"}
            
            # Step 3: Create campaign
            campaign_id = self.create_ad_campaign(campaign_config)
            if not campaign_id:
                return {"success": False, "error": "Failed to create campaign"}
            
            # Step 4: Create ad set
            ad_set_id = self.create_ad_set(campaign_id, campaign_config)
            if not ad_set_id:
                return {"success": False, "error": "Failed to create ad set"}
            
            # Step 5: Create ad
            ad_id = self.create_ad(ad_set_id, creative_id, campaign_config)
            if not ad_id:
                return {"success": False, "error": "Failed to create ad"}
            
            return {
                "success": True,
                "campaign_id": campaign_id,
                "ad_set_id": ad_set_id,
                "ad_id": ad_id,
                "creative_id": creative_id,
                "image_hash": image_hash,
                "message": "Ad campaign created successfully! Review and activate in Facebook Ads Manager."
            }
            
        except Exception as e:
            return {"success": False, "error": f"Campaign creation failed: {str(e)}"}
    
    def get_campaign_status(self, campaign_id: str) -> Dict[str, Any]:
        """Get the status and performance of a campaign"""
        try:
            url = f"{self.base_url}{campaign_id}"
            params = {
                'fields': 'name,status,objective,created_time,updated_time',
                'access_token': self.access_token
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            return {"error": f"Failed to get campaign status: {str(e)}"}


# Utility function for easy integration
def create_facebook_ad_from_generated_image(image_path: str, session_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Helper function to create a Facebook ad from a generated image and session data
    """
    service = FacebookMarketingService()
    
    # Validate configuration first
    config_validation = service.validate_configuration()
    if not config_validation["valid"]:
        return {
            "success": False,
            "error": f"Facebook API not configured. Missing: {', '.join(config_validation['missing_fields'])}"
        }
    
    # Extract relevant data from session for ad campaign
    campaign_config = {
        "session_id": session_data.get("session_id", "unknown"),
        "campaign_name": f"AI Campaign - {session_data.get('company_name', 'Unknown Company')}",
        "creative_name": f"AI Creative - {session_data.get('idea_name', 'Generated Ad')}",
        "ad_set_name": f"AI Ad Set - {session_data.get('target_demographic', 'General')}",
        "ad_name": f"AI Ad - {session_data.get('idea_name', 'Generated')}",
        
        # Campaign settings
        "objective": "REACH",  # Could be dynamic based on user choice
        "daily_budget": session_data.get('daily_budget', 1000),  # $10 default
        
        # Targeting (extracted from collected data)
        "countries": ["US"],  # Could be dynamic based on location
        "age_min": 25,  # Could extract from target_age_group
        "age_max": 45,
        
        # Ad content
        "headline": session_data.get('company_name', 'Amazing Product'),
        "ad_text": session_data.get('text', 'Check out our amazing offer!'),
        "description": session_data.get('idea_description', 'Discover something amazing'),
        "website_url": "https://example.com"  # Should be configurable
    }
    
    return service.create_complete_ad_campaign(image_path, campaign_config)
