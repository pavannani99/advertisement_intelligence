import axios, { AxiosError } from 'axios';
import { PromptStartResponse, ChatResponse, GenerateAdsRequest, AdGenerationStatus, GenerateAdsResponse } from '../types';

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
  (error: AxiosError) => {
    const errorMessage = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    console.error('API Error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// API Functions
export const apiClient = {
  async startPrompt(text: string): Promise<PromptStartResponse> {
    const response = await api.post('/prompt/start', { text });
    return response.data;
  },

  async chat(sessionId: string, message: string): Promise<ChatResponse> {
    const response = await api.post('/chat', { session_id: sessionId, message });
    return response.data;
  },

  async generateAds(request: GenerateAdsRequest): Promise<GenerateAdsResponse> {
    const response = await api.post('/generate-ads', request);
    return response.data;
  },

  async getAdStatus(jobId: string): Promise<AdGenerationStatus> {
    const response = await api.get(`/ad-status/${jobId}`);
    return response.data;
  },
};
