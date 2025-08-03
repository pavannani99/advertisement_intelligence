import React, { useState, useEffect } from 'react';
import { Image, Loader2, ArrowLeft, Download, Check, RefreshCw, Edit3 } from 'lucide-react';
import { WizardData } from '../AdGenerationWizard';
import { apiService, GenerateAdsRequest, GenerateAdsResponse, AdGenerationStatus } from '../../services/api';
import { AdIdea, GeneratedAd } from '../../types';

interface Step5Props {
  data: WizardData;
  onPrev: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const Step5AdGeneration: React.FC<Step5Props> = ({ data, onPrev, isLoading, setIsLoading }) => {
  const [jobIds, setJobIds] = useState<string[]>([]);
  const [generationStatus, setGenerationStatus] = useState<Record<string, AdGenerationStatus>>({});
  const [selectedImage, setSelectedImage] = useState<GeneratedAd | null>(null);

  useEffect(() => {
    if (jobIds.length > 0) {
      const intervalId = setInterval(() => {
        jobIds.forEach(async (jobId) => {
          if (!generationStatus[jobId] || generationStatus[jobId].status !== 'completed') {
            const status = await apiService.checkAdStatus(jobId);
            setGenerationStatus((prev) => ({ ...prev, [jobId]: status }));
          }
        });
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [jobIds, generationStatus]);

  const generateAds = async () => {
    if (!data.sessionId || !data.selectedIdeas || data.selectedIdeas.length === 0) return;

    setIsLoading(true);
    try {
      const selectedIdeaIds = data.selectedIdeas.map((idea: AdIdea) => idea.id);
      const requestData: GenerateAdsRequest = {
        session_id: data.sessionId,
        selected_idea_ids: selectedIdeaIds,
        variations_per_idea: 3,  // example, you can adjust
      };
      const response: GenerateAdsResponse = await apiService.generateAds(requestData);
      setJobIds(response.job_ids);
    } catch (error) {
      console.error('Error generating ads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateAds();
  }, []);
  const handleSelectImage = (image: GeneratedAd | undefined) => {
    if (image) {
      setSelectedImage(image);
    }
  };

  const handleDownloadImage = (url: string | undefined) => {
    if (!url) return;
    
    // For local URLs, prepend the backend URL
    const fullUrl = url.startsWith('http') ? url : `http://localhost:8000${url}`;
    
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = 'generated_ad.png';
    link.click();
  };

  const handleEditPrompt = (originalPrompt: string | undefined) => {
    if (!originalPrompt) return;
    
    const newPrompt = prompt('Enter more detailed or different prompt:', originalPrompt);
    if (newPrompt) {
      // Handle the regeneration or editing logic here
      console.log('New prompt:', newPrompt);
    }
  };

  const maxImagesToShow = 5;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Ad Generation</h3>
        <p className="text-gray-600">
          Your ads are being generated. This may take a moment.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobIds.slice(0, maxImagesToShow).map((jobId) => (
          <div key={jobId} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
            {generationStatus[jobId] ? (
              generationStatus[jobId].status === 'completed' ? (
                <div className="flex flex-col items-start">
                  <div className="flex items-center mb-2">
                    <Image className="w-6 h-6 text-green-600 mr-2" />
                    <span className="text-green-800">Generated Ad Ready</span>
                  </div>
                  {generationStatus[jobId].result?.thumbnail_url && (
                    <img 
                      src={generationStatus[jobId].result?.thumbnail_url?.startsWith('http') 
                        ? generationStatus[jobId].result?.thumbnail_url 
                        : `http://localhost:8000${generationStatus[jobId].result?.thumbnail_url}`}
                      alt="Ad Thumbnail" 
                      className="w-full h-auto mb-2 cursor-pointer rounded-lg shadow-md" 
                      onClick={() => handleSelectImage(generationStatus[jobId].result)} 
                    />
                  )}
                  <div className="flex gap-2 w-full">
                    <button 
                      className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center gap-2" 
                      onClick={() => handleDownloadImage(generationStatus[jobId].result?.image_url)}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button 
                      className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center gap-2" 
                      onClick={() => handleEditPrompt(generationStatus[jobId].result?.prompt_used)}
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <Loader2 className="w-6 h-6 text-primary-600 animate-spin mr-2" />
                  <span>Status: {generationStatus[jobId].status}</span>
                </div>
              )
            ) : (
              <div className="flex items-center">
                <Loader2 className="w-6 h-6 text-primary-600 animate-spin mr-2" />
                <span>Loading Status...</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="btn-secondary px-6 py-3 flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        <p className="text-sm text-gray-500">Thank you for using our service!</p>
      </div>
    </div>
  );
};

export default Step5AdGeneration;

