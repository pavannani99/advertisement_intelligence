import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { useUI } from '../contexts/UIContext';
import CampaignCard from '../components/CampaignCard';
import { Campaign } from '../types';

const CampaignDashboard: React.FC = () => {
  const { campaigns, fetchCampaigns, updateCampaign } = useSession();
  const { addToast } = useUI();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        await fetchCampaigns();
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Failed to Load Campaigns',
          message: 'Please try again later.'
        });
      }
    };

    loadCampaigns();
  }, [fetchCampaigns, addToast]);

  const handleEdit = (campaign: Campaign) => {
    // Logic to open editing interface
    console.log('Edit Campaign:', campaign);
  };

  const handleView = (campaign: Campaign) => {
    navigate(`/results/${campaign.id}`);
  };

  const handleGenerate = async (campaign: Campaign) => {
    try {
      // Call generation logic
      console.log('Generate Ads for Campaign:', campaign);
      addToast({
        type: 'success',
        title: 'Ads Generation Started',
        message: 'Ad generation is in progress. Visit the results page soon.'
      });

      // Update campaign status locally
      updateCampaign({
        ...campaign,
        status: 'ads_generating'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Start Generation',
        message: 'Something went wrong. Please try again later.'
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Campaigns</h2>
      {campaigns.length === 0 ? (
        <p className="text-dark-text-muted">No campaigns found. Start by creating a new one!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={handleEdit}
              onView={handleView}
              onGenerate={handleGenerate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignDashboard;

