import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Campaign, 
  SessionContextValue,
  PromptStartResponse 
} from '../types';
import { apiClient, sessionStorage } from '../services/api';

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Pavan'); // You can make this dynamic
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
    loadCampaigns();
  }, []);

  const initializeSession = () => {
    const storedSessionId = sessionStorage.getSessionId();
    const storedCampaign = sessionStorage.getCurrentCampaign();
    
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
    
    if (storedCampaign) {
      setCurrentCampaign(storedCampaign);
    }
  };

  const loadCampaigns = async () => {
    try {
      const fetchedCampaigns = await apiClient.getCampaigns();
      setCampaigns(fetchedCampaigns);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    }
  };

  const startNewCampaign = async (prompt: string): Promise<void> => {
    try {
      // Determine if this is a structured campaign or freeform prompt
      const isStructuredCampaign = detectStructuredPrompt(prompt);
      
      if (isStructuredCampaign) {
        // Parse structured input and start with product-info
        const productInfo = parseStructuredPrompt(prompt);
        const response = await apiClient.submitProductInfo(productInfo);
        
        // Create new campaign
        const newCampaign: Campaign = {
          id: response.session_id,
          name: productInfo.product_name || 'New Campaign',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'pending',
          idea_ids: [],
          product_info: productInfo,
        };
        
        setSessionId(response.session_id);
        setCurrentCampaign(newCampaign);
        sessionStorage.setSessionId(response.session_id);
        sessionStorage.setCurrentCampaign(newCampaign);
        
        // Update campaigns list
        setCampaigns(prev => [newCampaign, ...prev]);
      } else {
        // Start with freeform prompt
        const response: PromptStartResponse = await apiClient.startPrompt(prompt);
        
        // Create new campaign from extracted keywords
        const newCampaign: Campaign = {
          id: response.session_id,
          name: generateCampaignName(response.extracted_keywords),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'pending',
          idea_ids: [],
          extracted_keywords: response.extracted_keywords,
        };
        
        setSessionId(response.session_id);
        setCurrentCampaign(newCampaign);
        sessionStorage.setSessionId(response.session_id);
        sessionStorage.setCurrentCampaign(newCampaign);
        
        // Update campaigns list
        setCampaigns(prev => [newCampaign, ...prev]);
      }
    } catch (error) {
      console.error('Failed to start new campaign:', error);
      throw error;
    }
  };

  const updateCampaign = (updatedCampaign: Campaign) => {
    setCurrentCampaign(updatedCampaign);
    sessionStorage.setCurrentCampaign(updatedCampaign);
    
    setCampaigns(prev => 
      prev.map(campaign => 
        campaign.id === updatedCampaign.id ? updatedCampaign : campaign
      )
    );
  };

  const generateAds = async (campaignId: string, ideaIds: string[]): Promise<void> => {
    if (!sessionId) throw new Error('No active session');
    
    try {
      const response = await apiClient.generateAds(sessionId, ideaIds, 2);
      
      // Update campaign with job IDs
      if (currentCampaign && currentCampaign.id === campaignId) {
        const updatedCampaign = {
          ...currentCampaign,
          status: 'ads_generating' as const,
          job_ids: [response.job_id],
          updated_at: new Date().toISOString()
        };
        
        updateCampaign(updatedCampaign);
      }
    } catch (error) {
      console.error('Failed to generate ads:', error);
      throw error;
    }
  };

  const fetchCampaigns = async (): Promise<void> => {
    await loadCampaigns();
  };

  const value: SessionContextValue = {
    sessionId,
    userName,
    currentCampaign,
    campaigns,
    startNewCampaign,
    fetchCampaigns,
    updateCampaign,
    generateAds,
    setCurrentCampaign: (campaign: Campaign | null) => {
      setCurrentCampaign(campaign);
      sessionStorage.setCurrentCampaign(campaign);
    }
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextValue => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

// Helper functions
function detectStructuredPrompt(prompt: string): boolean {
  const structuredKeywords = [
    'new campaign',
    'product:',
    'company:',
    'business:',
    'targeting:',
    'focus:'
  ];
  
  return structuredKeywords.some(keyword => 
    prompt.toLowerCase().includes(keyword)
  );
}

function parseStructuredPrompt(prompt: string): any {
  // Simple parsing logic - in a real app you'd want more sophisticated parsing
  const lines = prompt.split('\n').map(line => line.trim()).filter(Boolean);
  const productInfo: any = {
    product_type: 'Product',
    company_name: 'Company',
    advertising_focus: 'product',
    business_type: 'E-commerce'
  };
  
  for (const line of lines) {
    const lower = line.toLowerCase();
    
    if (lower.includes('product:') || lower.includes('for ')) {
      productInfo.product_name = extractValue(line);
    } else if (lower.includes('company:')) {
      productInfo.company_name = extractValue(line);
    } else if (lower.includes('focus:')) {
      productInfo.advertising_focus = extractValue(line);
    }
  }
  
  return productInfo;
}

function extractValue(line: string): string {
  const colonIndex = line.indexOf(':');
  if (colonIndex !== -1) {
    return line.substring(colonIndex + 1).trim();
  }
  
  // Extract from patterns like "Create ad for X"
  const forMatch = line.match(/for\s+(.+?)\s*$/i);
  if (forMatch) {
    return forMatch[1];
  }
  
  return line;
}

function generateCampaignName(keywords: string[]): string {
  if (keywords.length === 0) return 'New Campaign';
  
  const primary = keywords[0];
  const capitalized = primary.charAt(0).toUpperCase() + primary.slice(1);
  return `${capitalized} Campaign`;
}
