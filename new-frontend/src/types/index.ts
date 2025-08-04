// API Response Types
export interface PromptStartResponse {
  session_id: string;
  extracted_keywords: string[];
  questions: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  session_id: string;
  response: string;
  stage: ConversationStage;
  conversation_history: ChatMessage[];
  ideas?: AdIdea[];
}

export enum ConversationStage {
  GATHERING_INFO = 'gathering_info',
  AWAITING_PREFERENCES = 'awaiting_preferences',
  SHOWING_IDEAS = 'showing_ideas',
  GENERATING_IMAGES = 'generating_images',
  COMPLETED = 'completed'
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

export interface GeneratedAd {
  ad_id: string;
  idea_id: string;
  image_url: string;
  thumbnail_url?: string;
  prompt_used: string;
  performance_prediction?: {
    engagement_score: number;
    conversion_likelihood: number;
    brand_alignment: number;
  };
  created_at: string;
}

export interface AdGenerationStatus {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: GeneratedAd;
  error?: string;
}

// Request Types
export interface GenerateAdsRequest {
  session_id: string;
  selected_idea_ids: string[];
  variations_per_idea: number;
}

export interface GenerateAdsResponse {
  job_ids: string[];
  estimated_time: number;
}

// UI State Types
export interface ConversationState {
  sessionId: string | null;
  messages: ChatMessage[];
  stage: ConversationStage;
  ideas: AdIdea[];
  generatedAds: GeneratedAd[];
  isLoading: boolean;
  error: string | null;
}
