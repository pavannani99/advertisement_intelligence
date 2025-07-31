import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface ProductInfoRequest {
  product_name?: string;
  product_type: string;
  company_name: string;
  advertising_focus: 'company' | 'product' | 'offer';
  offer_details?: string;
  business_type?: string;
  business_location?: string;
  target_location?: string;
  target_demographic?: string;
  target_age_group?: string;
}

export interface ProductInfoResponse {
  session_id: string;
  message: string;
  next_step: string;
}

export interface ResearchRequest {
  session_id: string;
  company_website?: string;
  additional_sources?: string[];
}

export interface TrendingTheme {
  theme: string;
  popularity_score: number;
  description: string;
  examples: string[];
}

export interface ResearchSummary {
  product_insights: Record<string, any>;
  trending_in_category: string[];
  trending_themes: TrendingTheme[];
  color_trends: string[];
  style_recommendations: string[];
  competitor_insights?: Record<string, any>;
}

export interface ResearchResponse {
  session_id: string;
  summary: ResearchSummary;
  raw_data?: Record<string, any>;
}

export interface AdCustomizationOptions {
  include_text?: boolean;
  text_content?: string;
  preferred_theme?: string;
  color_preferences?: string[];
  style_preferences?: string[];
  avoid_elements?: string[];
}

export interface AdIdea {
  id: string;
  name: string;
  type: string;
  description: string;
  theme: string;
  key_elements: string[];
  color_palette: string[];
  estimated_effectiveness: number;
  rationale: string;
}

export interface GenerateIdeasRequest {
  session_id: string;
  customization: AdCustomizationOptions;
}

export interface GenerateIdeasResponse {
  session_id: string;
  ideas: AdIdea[];
  customization_questions?: Array<Record<string, any>>;
}

export interface GenerateAdsRequest {
  session_id: string;
  selected_idea_ids: string[];
  variations_per_idea: number;
}

export interface GenerateAdsResponse {
  job_ids: string[];
  estimated_time: number;
}

export interface GeneratedAd {
  ad_id: string;
  idea_id: string;
  image_url: string;
  thumbnail_url?: string;
  prompt_used: string;
  performance_prediction?: Record<string, number>;
  created_at: string;
}

export interface AdGenerationStatus {
  job_id: string;
  status: string;
  progress?: number;
  result?: GeneratedAd;
  error?: string;
}

// API Methods
export const apiService = {
  // Step 1: Submit product information
  submitProductInfo: async (data: ProductInfoRequest): Promise<ProductInfoResponse> => {
    const response = await api.post('/product-info', data);
    return response.data;
  },

  // Step 2: Conduct research
  conductResearch: async (data: ResearchRequest): Promise<ResearchResponse> => {
    const response = await api.post('/research', data);
    return response.data;
  },

  // Step 3 & 4: Generate ad ideas
  generateIdeas: async (data: GenerateIdeasRequest): Promise<GenerateIdeasResponse> => {
    const response = await api.post('/generate-ideas', data);
    return response.data;
  },

  // Generate actual ads
  generateAds: async (data: GenerateAdsRequest): Promise<GenerateAdsResponse> => {
    const response = await api.post('/generate-ads', data);
    return response.data;
  },

  // Check ad generation status
  checkAdStatus: async (jobId: string): Promise<AdGenerationStatus> => {
    const response = await api.get(`/ad-status/${jobId}`);
    return response.data;
  },
};

export default apiService;
