import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import { useSession } from '../contexts/SessionContext';
import { useUI } from '../contexts/UIContext';
import AdGallery from '../components/AdGallery';
import { GeneratedAd } from '../types';
import { apiClient } from '../services/api';

const AdResultsPage: React.FC = () => {
  const { campaignId } = useParams();
  const { addToast } = useUI();
  const [ads, setAds] = useState<GeneratedAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        if (campaignId) {
          setLoading(true);
          const response = await apiClient.getAdStatus(campaignId);
          if (response.status === 'completed') {
            setAds(response.generated_ads || []);
          } else {
            addToast({
              type: 'info',
              title: 'Ads Still Generating',
              message: 'Please check back later. Ads are still being processed.'
            });
          }
        }
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Failed to Load Ads',
          message: 'Please try again later.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [campaignId, addToast]);

  const handleDownload = (ad: GeneratedAd) => {
    // Implement download logic
    console.log('Download Ad:', ad);
  };

  const handleShare = (ad: GeneratedAd) => {
    // Implement share logic
    console.log('Share Ad:', ad);
  };

  const handleRegenerate = (ad: GeneratedAd) => {
    // Implement regenerate logic
    console.log('Regenerate Ad:', ad);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Generated Ads</h2>
      <AdGallery
        ads={ads}
        onDownload={handleDownload}
        onShare={handleShare}
        onRegenerate={handleRegenerate}
        loading={loading}
      />
    </div>
  );
};

export default AdResultsPage;

