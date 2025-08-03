import axios, { AxiosError } from 'axios';
import {
  ProductInfo,
  ProductInfoResponse,
  ResearchResponse,
  IdeasResponse,
  AdGenerationResponse,
  AdStatusResponse,
  PromptStartResponse,
  ChatResponse,
  Campaign,
  GeneratedAd,
  ApiError
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Enhanced error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const errorMessage = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    console.error('API Error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// API Functions
export const apiClient = {
  // Prompt and session management
  async startPrompt(text: string): Promise<PromptStartResponse> {
    const response = await api.post('/prompt/start', { text });
    return response.data;
  },

  async chat(sessionId: string, message: string): Promise<ChatResponse> {
    const response = await api.post('/chat', { session_id: sessionId, message });
    return response.data;
  },

  // Campaign workflow
  async submitProductInfo(productInfo: ProductInfo): Promise<ProductInfoResponse> {
    const response = await api.post('/product-info', productInfo);
    return response.data;
  },

  async submitResearch(sessionId: string, productInfo: ProductInfo): Promise<ResearchResponse> {
    const response = await api.post('/research', {
      session_id: sessionId,
      product_info: productInfo
    });
    return response.data;
  },

  async generateIdeas(
    sessionId: string,
    researchSummary: string,
    preferences?: Record<string, any>
  ): Promise<IdeasResponse> {
    const response = await api.post('/generate-ideas', {
      session_id: sessionId,
      research_summary: researchSummary,
      preferences: preferences || {}
    });
    return response.data;
  },

  async generateAds(
    sessionId: string,
    selectedIdeaIds: string[],
    variationsPerIdea: number = 2
  ): Promise<AdGenerationResponse> {
    const response = await api.post('/generate-ads', {
      session_id: sessionId,
      selected_idea_ids: selectedIdeaIds,
      variations_per_idea: variationsPerIdea
    });
    return response.data;
  },

  async getAdStatus(jobId: string): Promise<AdStatusResponse> {
    const response = await api.get(`/ad-status/${jobId}`);
    return response.data;
  },

  // Campaign management (these would need to be implemented in the backend)
  async getCampaigns(): Promise<Campaign[]> {
    try {
      const response = await api.get('/campaigns');
      return response.data;
    } catch (error) {
      // Return mock data for now if endpoint doesn't exist
      console.warn('Campaigns endpoint not implemented, returning mock data');
      return getMockCampaigns();
    }
  },

  async getCampaign(id: string): Promise<Campaign> {
    try {
      const response = await api.get(`/campaigns/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch campaign ${id}`);
    }
  },

  async updateCampaign(id: string, campaign: Partial<Campaign>): Promise<Campaign> {
    const response = await api.put(`/campaigns/${id}`, campaign);
    return response.data;
  },

  async deleteCampaign(id: string): Promise<void> {
    await api.delete(`/campaigns/${id}`);
  },

  // File downloads
  async downloadAd(imageUrl: string, filename: string): Promise<void> {
    const response = await api.get(imageUrl, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

// Mock data for development
function getMockCampaigns(): Campaign[] {
  return [
    {
      id: 'mock-1',
      name: 'Eco Water Bottle Campaign',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T14:30:00Z',
      status: 'completed',
      thumbnail_url: '/mock-thumbnail-1.jpg',
      idea_ids: ['idea-1', 'idea-2'],
      job_ids: ['job-1'],
      product_info: {
        product_name: 'EcoFlow Water Bottle',
        product_type: 'Reusable Water Bottle',
        company_name: 'GreenTech Solutions',
        advertising_focus: 'Sustainability and Health',
        business_type: 'E-commerce'
      },
      research_summary: 'Target environmentally conscious consumers aged 25-45...',
      extracted_keywords: ['eco-friendly', 'sustainable', 'reusable', 'health']
    },
    {
      id: 'mock-2',
      name: 'AI SaaS Platform',
      created_at: '2024-01-14T09:00:00Z',
      updated_at: '2024-01-14T16:45:00Z',
      status: 'ideas_generated',
      thumbnail_url: '/mock-thumbnail-2.jpg',
      idea_ids: ['idea-3', 'idea-4', 'idea-5'],
      product_info: {
        product_name: 'SmartFlow AI',
        product_type: 'SaaS Platform',
        company_name: 'TechFlow Inc',
        advertising_focus: 'Automation and Efficiency',
        business_type: 'B2B SaaS'
      },
      research_summary: 'Enterprise customers looking for workflow automation...',
      extracted_keywords: ['AI', 'automation', 'workflow', 'efficiency']
    }
  ];
}

// Session storage helpers
export const sessionStorage = {
  getSessionId(): string | null {
    return localStorage.getItem('ad_gen_session_id');
  },

  setSessionId(sessionId: string): void {
    localStorage.setItem('ad_gen_session_id', sessionId);
  },

  clearSession(): void {
    localStorage.removeItem('ad_gen_session_id');
  },

  getCurrentCampaign(): Campaign | null {
    const stored = localStorage.getItem('current_campaign');
    return stored ? JSON.parse(stored) : null;
  },

  setCurrentCampaign(campaign: Campaign | null): void {
    if (campaign) {
      localStorage.setItem('current_campaign', JSON.stringify(campaign));
    } else {
      localStorage.removeItem('current_campaign');
    }
  }
};

// Additional interfaces for extended functionality
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

export interface AdCustomizationOptions {
  include_text?: boolean;
  text_content?: string;
  preferred_theme?: string;
  color_preferences?: string[];
  style_preferences?: string[];
  avoid_elements?: string[];
}

export interface GenerateIdeasRequest {
  session_id: string;
  customization: AdCustomizationOptions;
}

export interface GenerateIdeasResponse {
  session_id: string;
  ideas: import('../types').AdIdea[];
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

export interface AdGenerationStatus {
  job_id: string;
  status: string;
  progress?: number;
  result?: import('../types').GeneratedAd;
  error?: string;
}

// Extended API service
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

export default api;
