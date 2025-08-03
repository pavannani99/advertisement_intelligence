// Campaign and Ad Generation Types
export interface Campaign {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  status: 'pending' | 'ideas_generated' | 'ads_generating' | 'completed' | 'failed';
  thumbnail_url?: string;
  idea_ids: string[];
  job_ids?: string[];
  product_info?: ProductInfo;
  research_summary?: string;
  extracted_keywords?: string[];
}

export interface ProductInfo {
  product_name: string;
  product_type: string;
  company_name: string;
  advertising_focus: string;
  business_type: string;
}

export interface AdIdea {
  id: string;
  campaign_id: string;
  title: string;
  name: string; // Display name for the idea
  description: string;
  target_audience: string;
  key_message: string;
  visual_style: string;
  key_elements: string[]; // Key elements for the ad
  selected?: boolean;
}

export interface GeneratedAd {
  job_id: string;
  image_url: string;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  idea_id?: string;
  prompt?: string;
  // Additional properties for extended API compatibility
  ad_id?: string;
  thumbnail_url?: string;
  prompt_used?: string;
  performance_prediction?: Record<string, number>;
}

// Session and API Types
export interface SessionResponse {
  session_id: string;
  stage: string;
  extracted_keywords?: string[];
  questions?: string[];
  message?: string;
}

export interface ApiError {
  detail: string;
  code?: string;
}

// UI State Types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

export interface UIState {
  darkMode: boolean;
  isLoading: boolean;
  toasts: Toast[];
}

// Component Props Types
export interface CampaignCardProps {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
  onView: (campaign: Campaign) => void;
  onGenerate: (campaign: Campaign) => void;
}

export interface SampleCampaignCardProps {
  template: CampaignTemplate;
  onUseTemplate: (template: CampaignTemplate) => void;
  onPreview: (template: CampaignTemplate) => void;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail_url: string;
  product_info: ProductInfo;
  sample_ideas?: AdIdea[];
}

export interface WarpPromptInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export interface AdGalleryProps {
  ads: GeneratedAd[];
  onDownload: (ad: GeneratedAd) => void;
  onShare: (ad: GeneratedAd) => void;
  onRegenerate: (ad: GeneratedAd) => void;
  loading?: boolean;
}

// Context Types
export interface SessionContextValue {
  sessionId: string | null;
  userName: string;
  currentCampaign: Campaign | null;
  campaigns: Campaign[];
  startNewCampaign: (prompt: string) => Promise<void>;
  fetchCampaigns: () => Promise<void>;
  updateCampaign: (campaign: Campaign) => void;
  generateAds: (campaignId: string, ideaIds: string[]) => Promise<void>;
  setCurrentCampaign: (campaign: Campaign | null) => void;
}

export interface UIContextValue {
  darkMode: boolean;
  toggleDarkMode: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

// API Response Types
export interface ProductInfoResponse {
  session_id: string;
  message: string;
}

export interface ResearchResponse {
  session_id: string;
  research_summary: string;
  insights: string[];
  summary?: {
    product_insights: Record<string, any>;
    trending_in_category: string[];
    trending_themes: Array<{
      theme: string;
      popularity_score: number;
      description: string;
      examples: string[];
    }>;
    color_trends: string[];
    style_recommendations: string[];
    competitor_insights?: Record<string, any>;
  };
}

export interface IdeasResponse {
  session_id: string;
  ideas: AdIdea[];
}

export interface AdGenerationResponse {
  job_id: string;
  message: string;
  estimated_completion_time: number;
}

export interface AdStatusResponse {
  job_id: string;
  status: 'processing' | 'completed' | 'failed';
  generated_ads?: GeneratedAd[];
  error_message?: string;
}

export interface PromptStartResponse {
  session_id: string;
  extracted_keywords: string[];
  questions: string[];
  stage: string;
}

export interface ChatResponse {
  session_id: string;
  message: string;
  stage: string;
  suggestions?: string[];
}
